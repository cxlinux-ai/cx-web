/**
 * Bounties Board - Backend API
 *
 * Fetches and caches GitHub issues labeled "bounty" from the cortexlinux organization.
 *
 * Features:
 * - In-memory caching (30 minutes)
 * - Fetches both open and closed bounties
 * - Rate limit handling
 * - Structured error responses
 * - Extracts bounty amounts from labels
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

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
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
 * Extract bounty amount from labels
 * Looks for patterns like "$500", "bounty:$200", "reward:150", etc.
 */
function extractBountyAmount(labels: GitHubLabel[]): { amount: number | null; label: string | null } {
  for (const label of labels) {
    const name = label.name.toLowerCase();

    // Match patterns: $500, $100, bounty:$200, reward:150
    const dollarMatch = name.match(/\$(\d+)/);
    if (dollarMatch) {
      return { amount: parseInt(dollarMatch[1], 10), label: label.name };
    }

    // Match patterns: bounty-500, reward-100
    const dashMatch = name.match(/(?:bounty|reward)-(\d+)/);
    if (dashMatch) {
      return { amount: parseInt(dashMatch[1], 10), label: label.name };
    }

    // Match patterns: 500-bounty, 100-reward
    const suffixMatch = name.match(/(\d+)-(?:bounty|reward)/);
    if (suffixMatch) {
      return { amount: parseInt(suffixMatch[1], 10), label: label.name };
    }
  }

  // Check title for bounty amount as fallback
  return { amount: null, label: null };
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
 */
function transformIssue(issue: GitHubIssue): Bounty {
  const { amount, label } = extractBountyAmount(issue.labels);
  const difficulty = extractDifficulty(issue.labels);
  const displayLabels = filterDisplayLabels(issue.labels);

  // Truncate description to reasonable length
  const description = issue.body
    ? issue.body.slice(0, 300) + (issue.body.length > 300 ? "..." : "")
    : "";

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

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Cortex-Linux-Bounties-Board",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  // Fetch open bounties
  const openUrl = "https://api.github.com/search/issues?q=org:cortexlinux+is:issue+is:open+label:bounty&sort=created&order=desc&per_page=100";
  const closedUrl = "https://api.github.com/search/issues?q=org:cortexlinux+is:issue+is:closed+label:bounty&sort=updated&order=desc&per_page=100";

  const [openResponse, closedResponse] = await Promise.all([
    fetch(openUrl, { headers }),
    fetch(closedUrl, { headers }),
  ]);

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
// FALLBACK DATA
// ==========================================

const FALLBACK_BOUNTIES: BountiesCache["data"] = {
  open: [
    {
      id: 1,
      number: 234,
      title: "Windows Subsystem for Linux Support",
      url: "https://github.com/cortexlinux/cortex/issues/234",
      state: "open",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      closedAt: null,
      author: {
        username: "mikelinke",
        avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
        profileUrl: "https://github.com/mikelinke",
      },
      bountyAmount: 500,
      bountyLabel: "$500",
      difficulty: "advanced",
      labels: [
        { name: "Python", color: "3572A5" },
        { name: "Windows", color: "0078D6" },
        { name: "Integration", color: "7057ff" },
      ],
      comments: 23,
      description: "Add support for running Cortex Linux on Windows through WSL2. This involves detecting the WSL environment and adapting package management accordingly...",
    },
    {
      id: 2,
      number: 156,
      title: "Nix Package Manager Integration",
      url: "https://github.com/cortexlinux/cortex/issues/156",
      state: "open",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      closedAt: null,
      author: {
        username: "nixfan",
        avatarUrl: "https://avatars.githubusercontent.com/u/2?v=4",
        profileUrl: "https://github.com/nixfan",
      },
      bountyAmount: 300,
      bountyLabel: "$300",
      difficulty: "medium",
      labels: [
        { name: "Nix", color: "5277C3" },
        { name: "Package Manager", color: "fbca04" },
      ],
      comments: 15,
      description: "Implement support for the Nix package manager alongside apt, dnf, and pacman. This should include proper detection and command translation...",
    },
    {
      id: 3,
      number: 189,
      title: "Improved Error Messages",
      url: "https://github.com/cortexlinux/cortex/issues/189",
      state: "open",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      closedAt: null,
      author: {
        username: "uxdesigner",
        avatarUrl: "https://avatars.githubusercontent.com/u/3?v=4",
        profileUrl: "https://github.com/uxdesigner",
      },
      bountyAmount: 150,
      bountyLabel: "$150",
      difficulty: "beginner",
      labels: [
        { name: "UX", color: "d4c5f9" },
        { name: "CLI", color: "1d76db" },
      ],
      comments: 8,
      description: "Make error messages more user-friendly and actionable. Include suggestions for how to fix common issues...",
    },
    {
      id: 4,
      number: 201,
      title: "Shell Completion Improvements",
      url: "https://github.com/cortexlinux/cortex/issues/201",
      state: "open",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      closedAt: null,
      author: {
        username: "shellwizard",
        avatarUrl: "https://avatars.githubusercontent.com/u/4?v=4",
        profileUrl: "https://github.com/shellwizard",
      },
      bountyAmount: 100,
      bountyLabel: "$100",
      difficulty: "medium",
      labels: [
        { name: "Bash", color: "89e051" },
        { name: "Zsh", color: "c1c1c1" },
        { name: "Fish", color: "4aae46" },
      ],
      comments: 12,
      description: "Improve shell completion for bash, zsh, and fish shells. Add context-aware completions for common commands...",
    },
  ],
  closed: [
    {
      id: 5,
      number: 145,
      title: "Add Dark Mode Support",
      url: "https://github.com/cortexlinux/cortex/issues/145",
      state: "closed",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      closedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        username: "darkthemer",
        avatarUrl: "https://avatars.githubusercontent.com/u/5?v=4",
        profileUrl: "https://github.com/darkthemer",
      },
      bountyAmount: 100,
      bountyLabel: "$100",
      difficulty: "beginner",
      labels: [
        { name: "CSS", color: "563d7c" },
        { name: "React", color: "61dafb" },
      ],
      comments: 18,
      description: "Implement dark mode support for the web interface. Use system preferences by default with manual toggle...",
    },
    {
      id: 6,
      number: 132,
      title: "Docker Container Support",
      url: "https://github.com/cortexlinux/cortex/issues/132",
      state: "closed",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      closedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        username: "containerking",
        avatarUrl: "https://avatars.githubusercontent.com/u/6?v=4",
        profileUrl: "https://github.com/containerking",
      },
      bountyAmount: 200,
      bountyLabel: "$200",
      difficulty: "medium",
      labels: [
        { name: "Docker", color: "2496ed" },
        { name: "DevOps", color: "0db7ed" },
      ],
      comments: 25,
      description: "Create official Docker images for Cortex Linux and document usage patterns...",
    },
  ],
  stats: {
    totalOpen: 4,
    totalClosed: 2,
    totalOpenAmount: 1050,
    totalClosedAmount: 300,
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
    const isCached = bountiesCache && now < bountiesCache.expiresAt;

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

      // Return fallback data
      const response: BountiesResponse = {
        success: true,
        data: FALLBACK_BOUNTIES,
        cached: false,
        error: "Using fallback data due to GitHub API error",
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
    // Return fallback stats
    res.json({
      success: true,
      stats: FALLBACK_BOUNTIES.stats,
      error: "Using fallback stats",
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
