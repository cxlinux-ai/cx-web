/**
 * GitHub Integration
 *
 * Fetches documentation, README, and issues from the CX Linux GitHub repo.
 * Uses GitHub's public API (no auth required for public repos).
 */

const GITHUB_ORG = "cxlinux-ai";
const GITHUB_REPO = "cx-core";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  labels: Array<{ name: string }>;
  created_at: string;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
}

// Cache for GitHub data
const cache: Map<string, CachedData<any>> = new Map();

/**
 * Check if cached data is still valid
 */
function isCacheValid(key: string): boolean {
  const cached = cache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_TTL;
}

/**
 * Get cached data
 */
function getFromCache<T>(key: string): T | null {
  if (!isCacheValid(key)) return null;
  return cache.get(key)?.data as T;
}

/**
 * Set cache data
 */
function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

/**
 * Fetch README from the repo
 */
export async function fetchReadme(): Promise<string | null> {
  const cacheKey = "readme";
  const cached = getFromCache<string>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.github.com/repos/${GITHUB_ORG}/${GITHUB_REPO}/readme`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "CortexLinuxBot/1.0",
      },
    });

    if (!response.ok) {
      console.log(`[GitHub] README fetch returned ${response.status}`);
      return null;
    }

    const readme = await response.text();
    setCache(cacheKey, readme);
    console.log(`[GitHub] Fetched README (${readme.length} chars)`);
    return readme;
  } catch (error) {
    console.error("[GitHub] Error fetching README:", error);
    return null;
  }
}

/**
 * Search issues for relevant problems
 */
export async function searchIssues(query: string): Promise<GitHubIssue[]> {
  const cacheKey = `issues:${query}`;
  const cached = getFromCache<GitHubIssue[]>(cacheKey);
  if (cached) return cached;

  try {
    const encodedQuery = encodeURIComponent(`${query} repo:${GITHUB_ORG}/${GITHUB_REPO}`);
    const url = `https://api.github.com/search/issues?q=${encodedQuery}&per_page=5&sort=relevance`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CortexLinuxBot/1.0",
      },
    });

    if (!response.ok) {
      console.log(`[GitHub] Issue search returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    const issues = (data.items || []) as GitHubIssue[];
    setCache(cacheKey, issues);
    console.log(`[GitHub] Found ${issues.length} issues for: "${query.slice(0, 30)}..."`);
    return issues;
  } catch (error) {
    console.error("[GitHub] Error searching issues:", error);
    return [];
  }
}

/**
 * Get recent issues (for common problems)
 */
export async function getRecentIssues(state: "open" | "closed" | "all" = "open"): Promise<GitHubIssue[]> {
  const cacheKey = `recent:${state}`;
  const cached = getFromCache<GitHubIssue[]>(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://api.github.com/repos/${GITHUB_ORG}/${GITHUB_REPO}/issues?state=${state}&per_page=10&sort=created&direction=desc`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "CortexLinuxBot/1.0",
      },
    });

    if (!response.ok) {
      console.log(`[GitHub] Recent issues returned ${response.status}`);
      return [];
    }

    const issues = (await response.json()) as GitHubIssue[];
    setCache(cacheKey, issues);
    return issues;
  } catch (error) {
    console.error("[GitHub] Error fetching recent issues:", error);
    return [];
  }
}

/**
 * Keywords that suggest GitHub context might help
 */
const GITHUB_TRIGGERS = [
  /\b(bug|issue|error|problem|crash|broken)\b/i,
  /\b(feature request|enhancement|improvement)\b/i,
  /\b(source code|github|repo|repository)\b/i,
  /\b(contribute|contribution|pr|pull request)\b/i,
  /\b(documentation|docs|readme)\b/i,
  /\b(release|version|changelog)\b/i,
];

/**
 * Check if query might benefit from GitHub context
 */
export function shouldFetchGitHub(query: string): boolean {
  for (const pattern of GITHUB_TRIGGERS) {
    if (pattern.test(query)) {
      return true;
    }
  }
  return false;
}

/**
 * Format GitHub issues for prompt injection
 */
export function formatIssues(issues: GitHubIssue[]): string {
  if (issues.length === 0) return "";

  const formatted = issues
    .slice(0, 3)
    .map((issue) => {
      const labels = issue.labels.map((l) => l.name).join(", ");
      const labelStr = labels ? ` [${labels}]` : "";
      return `- #${issue.number}: ${issue.title}${labelStr} (${issue.state}) - ${issue.html_url}`;
    })
    .join("\n");

  return `\n\nRelated GitHub issues:\n${formatted}`;
}

/**
 * Get GitHub context for a query
 */
export async function getGitHubContext(query: string): Promise<string> {
  if (!shouldFetchGitHub(query)) {
    return "";
  }

  try {
    const issues = await searchIssues(query);
    return formatIssues(issues);
  } catch (error) {
    console.error("[GitHub] Error getting context:", error);
    return "";
  }
}

export default {
  fetchReadme,
  searchIssues,
  getRecentIssues,
  shouldFetchGitHub,
  formatIssues,
  getGitHubContext,
};
