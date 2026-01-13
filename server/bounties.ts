/**
 * Bounties Board - Backend API
 *
 * Fetches and caches GitHub issues labeled "bounty" from the cortexlinux organization.
 *
 * =============================================================================
 * ARCHITECTURE OVERVIEW
 * =============================================================================
 *
 * Data Flow:
 *   Client Request -> Rate Limiter -> Cache Check -> GitHub API (if needed) -> Response
 *
 * Caching Strategy (CRITICAL for GitHub Rate Limits):
 * - GitHub's unauthenticated API allows only 60 requests/hour
 * - GitHub's authenticated API allows 5,000 requests/hour
 * - We use SERVER-SIDE caching (not client-side) because:
 *   1. All users share the same cache, reducing total API calls
 *   2. One cache refresh serves ALL concurrent users
 *   3. Client-side caching would mean each user makes their own API calls
 *   4. Server controls cache invalidation centrally
 *
 * Cache Duration: 5 minutes
 * - Provides fresh enough data for bounty hunters
 * - With 60 req/hour limit, we could refresh 12x/hour (every 5 min)
 * - Leaves buffer for other GitHub API endpoints
 *
 * Cache Invalidation:
 * - Automatic: Cache expires after TTL
 * - Manual: POST /api/bounties/refresh (admin endpoint)
 * - Graceful: On API failure, serve stale cache with warning
 *
 * =============================================================================
 *
 * Features:
 * - In-memory caching (5 minutes TTL)
 * - Fetches both open and closed bounties
 * - Rate limit handling with graceful degradation
 * - Structured error responses
 * - Extracts bounty amounts from labels, title, and body
 * - Repository name extraction for multi-repo support
 */

import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";

const router = Router();

// ==========================================
// TYPES
// ==========================================

interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface GitHubLabel {
  name: string;
  color: string;
  description?: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubUser;
  labels: GitHubLabel[];
  comments: number;
  body: string | null;
  // Repository info from search API (nested object)
  repository_url: string;
}

interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubIssue[];
}

interface Bounty {
  id: number;
  number: number;
  title: string;
  url: string;
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  author: {
    username: string;
    avatarUrl: string;
    profileUrl: string;
  };
  repositoryName: string; // e.g., "cortex", "cortex-cli"
  repositoryUrl: string;  // Full GitHub repo URL
  bountyAmount: number | null;
  bountyLabel: string | null;
  difficulty: "beginner" | "medium" | "advanced" | null;
  labels: Array<{ name: string; color: string }>;
  comments: number;
  description: string;
}

interface BountiesCache {
  data: {
    open: Bounty[];
    closed: Bounty[];
    stats: {
      totalOpen: number;
      totalClosed: number;
      totalOpenAmount: number;
      totalClosedAmount: number;
    };
  };
  timestamp: number;
  expiresAt: number;
}

interface BountiesResponse {
  success: boolean;
  data?: BountiesCache["data"];
  error?: string;
  cached: boolean;
  cacheAge?: number;
  nextRefresh?: number;
}

// ==========================================
// CACHE
// ==========================================

// Cache duration: 5 minutes (300,000ms)
// Why 5 minutes? GitHub allows 60 unauthenticated requests/hour.
// 5-minute cache = max 12 refreshes/hour, leaving headroom for other endpoints.
// With auth token: 5,000 requests/hour makes this even more conservative.
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let bountiesCache: BountiesCache | null = null;

// ==========================================
// RATE LIMITER
// ==========================================

const bountiesLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { success: false, error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Extract bounty amount from multiple sources (labels, title, body)
 *
 * Priority order:
 * 1. Labels (most reliable, structured data)
 * 2. Title (commonly used pattern like "$200 - Fix bug")
 * 3. Body (searches entire body for bounty/reward mentions)
 *
 * Supported patterns:
 * - Labels: "$500", "bounty:$200", "reward:150", "bounty-500", "500-bounty"
 * - Title/Body: "$500", "💰500", "💰 500", "bounty: $200", "reward $150"
 */
function extractBountyAmount(
  labels: GitHubLabel[],
  title: string,
  body: string | null
): { amount: number | null; label: string | null; source: "label" | "title" | "body" | null } {

  // 1. Check labels first (most authoritative)
  for (const label of labels) {
    const name = label.name.toLowerCase();

    // Match patterns: $500, $100, bounty:$200, reward:150
    const dollarMatch = name.match(/\$(\d+)/);
    if (dollarMatch) {
      return { amount: parseInt(dollarMatch[1], 10), label: label.name, source: "label" };
    }

    // Match patterns: bounty-500, reward-100
    const dashMatch = name.match(/(?:bounty|reward)-(\d+)/);
    if (dashMatch) {
      return { amount: parseInt(dashMatch[1], 10), label: label.name, source: "label" };
    }

    // Match patterns: 500-bounty, 100-reward
    const suffixMatch = name.match(/(\d+)-(?:bounty|reward)/);
    if (suffixMatch) {
      return { amount: parseInt(suffixMatch[1], 10), label: label.name, source: "label" };
    }
  }

  // 2. Check title for bounty amount
  const titlePatterns = [
    /\$(\d+)/,                           // $500
    /💰\s*(\d+)/,                        // 💰500 or 💰 500
    /bounty[:\s]+\$?(\d+)/i,             // bounty: $500, bounty 500
    /reward[:\s]+\$?(\d+)/i,             // reward: $500, reward 500
    /\[(\d+)\s*(?:USD|dollars?)?\]/i,    // [500 USD], [500]
  ];

  for (const pattern of titlePatterns) {
    const match = title.match(pattern);
    if (match) {
      return { amount: parseInt(match[1], 10), label: null, source: "title" };
    }
  }

  // 3. Check entire body for bounty amounts
  if (body) {
    const bodyLower = body.toLowerCase();
    
    // Extended patterns for body - search the entire content
    const bodyPatterns = [
      /bounty[:\s]*\$?(\d+)/i,                    // bounty: $500, bounty $500, bounty 500
      /reward[:\s]*\$?(\d+)/i,                    // reward: $500, reward 500
      /💰\s*\$?(\d+)/,                            // 💰500, 💰$500
      /prize[:\s]*\$?(\d+)/i,                     // prize: $500
      /payout[:\s]*\$?(\d+)/i,                    // payout: $500
      /\$(\d+)\s*(?:usd|dollars?|bounty|reward)?/i, // $500, $500 USD, $500 bounty
      /(\d+)\s*(?:usd|dollars?)\s*(?:bounty|reward)?/i, // 500 USD, 500 dollars bounty
      /payment[:\s]*\$?(\d+)/i,                   // payment: $500
      /compensation[:\s]*\$?(\d+)/i,              // compensation: $500
      /amount[:\s]*\$?(\d+)/i,                    // amount: $500
      /value[:\s]*\$?(\d+)/i,                     // value: $500
      /worth[:\s]*\$?(\d+)/i,                     // worth $500
      /pay[:\s]*\$?(\d+)/i,                       // pay: $500
      /earn[:\s]*\$?(\d+)/i,                      // earn $500
      /get[:\s]*\$?(\d+)/i,                       // get $500
    ];

    for (const pattern of bodyPatterns) {
      const match = bodyLower.match(pattern);
      if (match) {
        const amount = parseInt(match[1], 10);
        // Sanity check: bounty should be between $1 and $10000
        if (amount >= 1 && amount <= 10000) {
          return { amount, label: null, source: "body" };
        }
      }
    }
    
    // Final fallback: look for any dollar amount in the body
    const anyDollarMatch = body.match(/\$(\d+)/);
    if (anyDollarMatch) {
      const amount = parseInt(anyDollarMatch[1], 10);
      // Only accept reasonable bounty amounts
      if (amount >= 10 && amount <= 5000) {
        return { amount, label: null, source: "body" };
      }
    }
  }

  return { amount: null, label: null, source: null };
}

/**
 * Extract repository name from GitHub API repository_url
 * e.g., "https://api.github.com/repos/cortexlinux/cortex" -> "cortex"
 */
function extractRepositoryInfo(repositoryUrl: string): { name: string; url: string } {
  // repository_url format: https://api.github.com/repos/{owner}/{repo}
  const match = repositoryUrl.match(/repos\/([^\/]+)\/([^\/]+)$/);
  if (match) {
    const [, owner, repo] = match;
    return {
      name: repo,
      url: `https://github.com/${owner}/${repo}`,
    };
  }
  // Fallback
  return {
    name: "cortex",
    url: "https://github.com/cortexlinux/cortex",
  };
}

/**
 * Extract difficulty level from labels
 */
function extractDifficulty(labels: GitHubLabel[]): "beginner" | "medium" | "advanced" | null {
  for (const label of labels) {
    const name = label.name.toLowerCase();

    if (name.includes("beginner") || name.includes("easy") || name.includes("good first issue")) {
      return "beginner";
    }
    if (name.includes("advanced") || name.includes("hard") || name.includes("expert")) {
      return "advanced";
    }
    if (name.includes("medium") || name.includes("intermediate")) {
      return "medium";
    }
  }
  return null;
}

/**
 * Filter out meta labels (bounty, difficulty, etc.) for display
 */
function filterDisplayLabels(labels: GitHubLabel[]): Array<{ name: string; color: string }> {
  const metaKeywords = ["bounty", "reward", "$", "beginner", "easy", "medium", "intermediate", "advanced", "hard", "expert", "good first issue"];

  return labels
    .filter((label) => {
      const name = label.name.toLowerCase();
      return !metaKeywords.some((keyword) => name.includes(keyword));
    })
    .map((label) => ({
      name: label.name,
      color: label.color,
    }))
    .slice(0, 5); // Max 5 display labels
}

/**
 * Transform GitHub issue to Bounty format
 *
 * Handles data normalization and extraction of structured fields
 * from the raw GitHub API response.
 */
function transformIssue(issue: GitHubIssue): Bounty {
  // Extract bounty amount from labels, title, and body
  const { amount, label } = extractBountyAmount(issue.labels, issue.title, issue.body);
  const difficulty = extractDifficulty(issue.labels);
  const displayLabels = filterDisplayLabels(issue.labels);

  // Extract repository information
  const repoInfo = extractRepositoryInfo(issue.repository_url);

  // Truncate description to reasonable length for preview
  // Strip markdown formatting for cleaner display
  let description = issue.body
    ? issue.body
        .replace(/#{1,6}\s/g, "")        // Remove headers
        .replace(/\*\*|__/g, "")         // Remove bold
        .replace(/\*|_/g, "")            // Remove italic
        .replace(/```[\s\S]*?```/g, "")  // Remove code blocks
        .replace(/`[^`]+`/g, "")         // Remove inline code
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Convert links to text
        .replace(/\n+/g, " ")            // Normalize newlines
        .trim()
    : "";

  if (description.length > 300) {
    description = description.slice(0, 300) + "...";
  }

  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    url: issue.html_url,
    state: issue.state,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    closedAt: issue.closed_at,
    author: {
      username: issue.user.login,
      avatarUrl: issue.user.avatar_url,
      profileUrl: issue.user.html_url,
    },
    repositoryName: repoInfo.name,
    repositoryUrl: repoInfo.url,
    bountyAmount: amount,
    bountyLabel: label,
    difficulty,
    labels: displayLabels,
    comments: issue.comments,
    description,
  };
}

/**
 * Fetch bounties from GitHub API
 */
async function fetchBountiesFromGitHub(): Promise<{
  open: Bounty[];
  closed: Bounty[];
}> {
  const token = process.env.GITHUB_PUBLIC_TOKEN;

  // Build headers - we'll try with token first, then without if it fails
  const buildHeaders = (useToken: boolean): Record<string, string> => {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "Cortex-Linux-Bounties-Board",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (useToken && token) {
      headers.Authorization = `token ${token}`;
    }
    return headers;
  };

  // Fetch open bounties
  const openUrl = "https://api.github.com/search/issues?q=org:cortexlinux+is:issue+is:open+label:bounty&sort=created&order=desc&per_page=100";
  const closedUrl = "https://api.github.com/search/issues?q=org:cortexlinux+is:issue+is:closed+label:bounty&sort=updated&order=desc&per_page=100";

  // Try with token first, fallback to without if auth fails
  let openResponse, closedResponse;
  let useToken = !!token;

  const doFetch = async (withToken: boolean) => {
    const headers = buildHeaders(withToken);
    return Promise.all([
      fetch(openUrl, { headers }),
      fetch(closedUrl, { headers }),
    ]);
  };

  try {
    [openResponse, closedResponse] = await doFetch(useToken);

    // If token auth failed (401), retry without token
    // This handles expired/revoked tokens gracefully
    if (useToken && (openResponse.status === 401 || closedResponse.status === 401)) {
      console.log("[Bounties] Token auth failed, retrying without authentication...");
      [openResponse, closedResponse] = await doFetch(false);
    }
  } catch (fetchErr) {
    console.error("[Bounties] Network fetch error:", fetchErr);
    throw new Error(`Network error fetching from GitHub: ${fetchErr instanceof Error ? fetchErr.message : "Unknown error"}`);
  }

  // Check for rate limiting
  if (openResponse.status === 403 || closedResponse.status === 403) {
    const rateLimitReset = openResponse.headers.get("X-RateLimit-Reset");
    const resetTime = rateLimitReset ? new Date(parseInt(rateLimitReset, 10) * 1000) : null;
    throw new Error(
      `GitHub API rate limit exceeded. ${resetTime ? `Resets at ${resetTime.toISOString()}` : "Please try again later."}`
    );
  }

  if (!openResponse.ok || !closedResponse.ok) {
    throw new Error(`GitHub API error: ${openResponse.status} / ${closedResponse.status}`);
  }

  const openData: GitHubSearchResponse = await openResponse.json();
  const closedData: GitHubSearchResponse = await closedResponse.json();

  const openBounties = openData.items.map(transformIssue);
  const closedBounties = closedData.items.map(transformIssue);

  return { open: openBounties, closed: closedBounties };
}

/**
 * Get bounties (from cache or fresh)
 */
async function getBounties(): Promise<BountiesCache["data"]> {
  const now = Date.now();

  // Return cached data if valid
  if (bountiesCache && now < bountiesCache.expiresAt) {
    return bountiesCache.data;
  }

  // Fetch fresh data
  const { open, closed } = await fetchBountiesFromGitHub();

  // Calculate stats
  const totalOpenAmount = open.reduce((sum, b) => sum + (b.bountyAmount || 0), 0);
  const totalClosedAmount = closed.reduce((sum, b) => sum + (b.bountyAmount || 0), 0);

  const data: BountiesCache["data"] = {
    open,
    closed,
    stats: {
      totalOpen: open.length,
      totalClosed: closed.length,
      totalOpenAmount,
      totalClosedAmount,
    },
  };

  // Update cache
  bountiesCache = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION,
  };

  return data;
}

// ==========================================
// EMPTY DATA (No mock fallback - real data only)
// ==========================================

const EMPTY_BOUNTIES: BountiesCache["data"] = {
  open: [],
  closed: [],
  stats: {
    totalOpen: 0,
    totalClosed: 0,
    totalOpenAmount: 0,
    totalClosedAmount: 0,
  },
};

// ==========================================
// ROUTES
// ==========================================

/**
 * GET /api/bounties
 * Returns all bounties with caching
 */
router.get("/", bountiesLimiter, async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    const isCached = !!(bountiesCache && now < bountiesCache.expiresAt);

    let data: BountiesCache["data"];

    try {
      data = await getBounties();
    } catch (fetchError) {
      console.error("Failed to fetch bounties from GitHub:", fetchError);

      // Return cached data if available, even if expired
      if (bountiesCache) {
        const response: BountiesResponse = {
          success: true,
          data: bountiesCache.data,
          cached: true,
          cacheAge: Math.floor((now - bountiesCache.timestamp) / 1000),
          error: "Using cached data due to GitHub API error",
        };
        return res.json(response);
      }

      // Return empty data (no mock fallback)
      const response: BountiesResponse = {
        success: true,
        data: EMPTY_BOUNTIES,
        cached: false,
        error: "Unable to fetch from GitHub. No bounties available.",
      };
      return res.json(response);
    }

    const response: BountiesResponse = {
      success: true,
      data,
      cached: isCached,
      cacheAge: bountiesCache ? Math.floor((now - bountiesCache.timestamp) / 1000) : 0,
      nextRefresh: bountiesCache ? Math.floor((bountiesCache.expiresAt - now) / 1000) : CACHE_DURATION / 1000,
    };

    res.json(response);
  } catch (error) {
    console.error("Bounties API error:", error);

    const response: BountiesResponse = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bounties",
      cached: false,
    };

    res.status(500).json(response);
  }
});

/**
 * GET /api/bounties/stats
 * Returns just the stats (lightweight endpoint)
 */
router.get("/stats", bountiesLimiter, async (req: Request, res: Response) => {
  try {
    const data = await getBounties();

    res.json({
      success: true,
      stats: data.stats,
    });
  } catch (error) {
    // Return empty stats (no mock fallback)
    res.json({
      success: true,
      stats: EMPTY_BOUNTIES.stats,
      error: "Unable to fetch from GitHub",
    });
  }
});

/**
 * GET /api/bounties/refresh
 * Force refresh the cache (admin endpoint)
 */
router.post("/refresh", bountiesLimiter, async (req: Request, res: Response) => {
  try {
    // Invalidate cache
    bountiesCache = null;

    // Fetch fresh data
    const data = await getBounties();

    res.json({
      success: true,
      message: "Cache refreshed successfully",
      stats: data.stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to refresh cache",
    });
  }
});

export default router;
