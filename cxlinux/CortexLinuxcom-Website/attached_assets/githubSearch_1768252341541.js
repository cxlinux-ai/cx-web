/**
 * GitHub Issues and PR Search
 * Search the Cortex repo for issues, PRs, and discussions
 */

const GITHUB_API_BASE = "https://api.github.com";
const CORTEX_REPO = "cortexlinux/cortex";

/**
 * Make authenticated GitHub API request
 */
async function githubFetch(endpoint, params = {}) {
  const url = new URL(`${GITHUB_API_BASE}${endpoint}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  }

  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CortexLinuxAI-Bot",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url.toString(), { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Search issues and PRs
 * @param {string} query - Search query
 * @param {object} options - Search options
 */
export async function searchIssues(query, options = {}) {
  const {
    state = "all", // open, closed, all
    type = "issue", // issue, pr, all
    limit = 5,
    sort = "relevance", // relevance, created, updated, comments
  } = options;

  try {
    // Build search query
    let searchQuery = `repo:${CORTEX_REPO} ${query}`;

    if (state !== "all") {
      searchQuery += ` state:${state}`;
    }

    if (type === "pr") {
      searchQuery += " is:pr";
    } else if (type === "issue") {
      searchQuery += " is:issue";
    }

    const data = await githubFetch("/search/issues", {
      q: searchQuery,
      sort: sort === "relevance" ? undefined : sort,
      per_page: limit,
    });

    return {
      total: data.total_count,
      items: data.items.map(issue => ({
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
        html_url: issue.html_url,
        user: issue.user,
        labels: issue.labels,
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        is_pr: !!issue.pull_request,
      })),
    };
  } catch (error) {
    console.error("[GitHub Search] Error:", error.message);
    return { total: 0, items: [], error: error.message };
  }
}

/**
 * Get a specific issue by number
 */
export async function getIssue(issueNumber) {
  try {
    const issue = await githubFetch(`/repos/${CORTEX_REPO}/issues/${issueNumber}`);

    return {
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      html_url: issue.html_url,
      user: issue.user,
      labels: issue.labels,
      comments: issue.comments,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      is_pr: !!issue.pull_request,
    };
  } catch (error) {
    console.error("[GitHub] Error fetching issue:", error.message);
    return null;
  }
}

/**
 * Get comments on an issue
 */
export async function getIssueComments(issueNumber, limit = 5) {
  try {
    const comments = await githubFetch(
      `/repos/${CORTEX_REPO}/issues/${issueNumber}/comments`,
      { per_page: limit }
    );

    return comments.map(comment => ({
      user: comment.user?.login,
      body: comment.body,
      created_at: comment.created_at,
    }));
  } catch (error) {
    console.error("[GitHub] Error fetching comments:", error.message);
    return [];
  }
}

/**
 * Search for error-related issues
 * Useful for debugging - find issues matching an error message
 */
export async function searchErrorIssues(errorMessage, limit = 3) {
  // Extract key parts of error message
  const keywords = errorMessage
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(" ");

  if (!keywords) {
    return { total: 0, items: [] };
  }

  return searchIssues(keywords, { limit, state: "all" });
}

/**
 * Get recent issues (for staying updated)
 */
export async function getRecentIssues(limit = 5, state = "open") {
  try {
    const issues = await githubFetch(`/repos/${CORTEX_REPO}/issues`, {
      state,
      sort: "updated",
      direction: "desc",
      per_page: limit,
    });

    return issues.map(issue => ({
      number: issue.number,
      title: issue.title,
      state: issue.state,
      html_url: issue.html_url,
      comments: issue.comments,
      updated_at: issue.updated_at,
      is_pr: !!issue.pull_request,
    }));
  } catch (error) {
    console.error("[GitHub] Error fetching recent issues:", error.message);
    return [];
  }
}

/**
 * Format issues for RAG context
 */
export function formatIssuesAsContext(issues) {
  if (!issues || issues.length === 0) {
    return "";
  }

  let context = "## Related GitHub Issues\n\n";

  for (const issue of issues) {
    const type = issue.is_pr ? "PR" : "Issue";
    context += `### ${type} #${issue.number}: ${issue.title}\n`;
    context += `State: ${issue.state} | Comments: ${issue.comments}\n`;
    context += `URL: ${issue.html_url}\n`;
    if (issue.body) {
      context += `\n${issue.body.slice(0, 500)}${issue.body.length > 500 ? "..." : ""}\n`;
    }
    context += "\n---\n\n";
  }

  return context;
}
