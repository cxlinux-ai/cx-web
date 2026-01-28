/**
 * RAG Retriever - Fetches content from GitHub org and website for Cortex Linux
 */

import { knowledgeBase } from "./knowledgeBase.js";

const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_ORG = "cortexlinux";
const WEBSITE_URL = "https://cortexlinux.com";

// Cache settings
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
let lastFetchTime = 0;

/**
 * Fetch content from GitHub API
 */
async function fetchFromGitHub(endpoint) {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "CortexLinuxAI-Bot",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Decode base64 content from GitHub API
 */
function decodeBase64(content) {
  return Buffer.from(content, "base64").toString("utf-8");
}

/**
 * Fetch all public repos from the organization
 */
async function fetchOrgRepos() {
  try {
    const repos = await fetchFromGitHub(`/orgs/${GITHUB_ORG}/repos?per_page=100&type=public`);
    console.log(`[RAG] Found ${repos.length} repos in ${GITHUB_ORG} org`);
    return repos.filter(r => !r.archived && !r.disabled);
  } catch (error) {
    console.error("[RAG] Failed to fetch org repos:", error.message);
    return [];
  }
}

/**
 * Fetch README from a repo
 */
async function fetchRepoReadme(repoName) {
  try {
    const data = await fetchFromGitHub(`/repos/${GITHUB_ORG}/${repoName}/readme`);
    const content = decodeBase64(data.content);
    return {
      content: `# ${repoName} README\n\n${content}`,
      metadata: {
        source: "github",
        type: "readme",
        repo: repoName,
        url: data.html_url,
        title: `${repoName} README`,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Fetch repo metadata
 */
async function fetchRepoInfo(repo) {
  const content = `
# ${repo.name} Repository

**Description:** ${repo.description || "N/A"}
**Topics:** ${repo.topics?.join(", ") || "N/A"}
**Stars:** ${repo.stargazers_count}
**Forks:** ${repo.forks_count}
**Open Issues:** ${repo.open_issues_count}
**License:** ${repo.license?.name || "N/A"}
**Language:** ${repo.language || "N/A"}
**Default Branch:** ${repo.default_branch}
**Created:** ${repo.created_at}
**Last Updated:** ${repo.updated_at}
**GitHub URL:** ${repo.html_url}
`;
  return {
    content,
    metadata: {
      source: "github",
      type: "repo_info",
      repo: repo.name,
      url: repo.html_url,
      title: `${repo.name} Info`,
    },
  };
}

/**
 * Fetch releases from a repo
 */
async function fetchRepoReleases(repoName) {
  try {
    const releases = await fetchFromGitHub(`/repos/${GITHUB_ORG}/${repoName}/releases?per_page=10`);
    if (releases.length === 0) return null;

    let content = `# ${repoName} Releases\n\n`;
    for (const release of releases) {
      content += `## ${release.tag_name} - ${release.name || "Release"}\n`;
      content += `**Published:** ${release.published_at}\n`;
      if (release.body) {
        content += `\n${release.body}\n`;
      }
      content += "\n---\n\n";
    }

    return {
      content,
      metadata: {
        source: "github",
        type: "releases",
        repo: repoName,
        url: `https://github.com/${GITHUB_ORG}/${repoName}/releases`,
        title: `${repoName} Releases`,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Recursively fetch all markdown files from a directory
 */
async function fetchMarkdownFiles(repoName, path = "") {
  const files = [];

  try {
    const contents = await fetchFromGitHub(`/repos/${GITHUB_ORG}/${repoName}/contents/${path}`);

    for (const item of contents) {
      if (item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx"))) {
        try {
          const fileData = await fetchFromGitHub(`/repos/${GITHUB_ORG}/${repoName}/contents/${item.path}`);
          const content = decodeBase64(fileData.content);
          files.push({
            content: `# ${item.path}\n\n${content}`,
            metadata: {
              source: "github",
              type: "documentation",
              repo: repoName,
              url: fileData.html_url,
              title: item.path,
            },
          });
        } catch {
          // Skip files that fail
        }
      } else if (item.type === "dir" && !item.name.startsWith(".") && item.name !== "node_modules") {
        // Recurse into subdirectories
        const subFiles = await fetchMarkdownFiles(repoName, item.path);
        files.push(...subFiles);
      }
    }
  } catch {
    // Directory might not exist
  }

  return files;
}

/**
 * Fetch important source files from a repo
 */
async function fetchSourceFiles(repoName) {
  const filesToFetch = [
    "setup.py", "pyproject.toml", "requirements.txt",
    "package.json", "Cargo.toml", "go.mod",
    "INSTALL.md", "CONTRIBUTING.md", "CHANGELOG.md",
    "Makefile", "Dockerfile", "docker-compose.yml",
  ];
  const results = [];

  for (const filename of filesToFetch) {
    try {
      const data = await fetchFromGitHub(`/repos/${GITHUB_ORG}/${repoName}/contents/${filename}`);
      const content = decodeBase64(data.content);
      results.push({
        content: `# ${repoName}/${filename}\n\n${content}`,
        metadata: {
          source: "github",
          type: "source_file",
          repo: repoName,
          url: data.html_url,
          title: `${repoName}/${filename}`,
        },
      });
    } catch {
      // File doesn't exist, skip
    }
  }

  return results;
}

/**
 * Fetch all content from a single repo
 */
async function fetchRepoContent(repo) {
  const docs = [];

  // Fetch in parallel
  const [readme, releases, markdownFiles, sourceFiles] = await Promise.all([
    fetchRepoReadme(repo.name),
    fetchRepoReleases(repo.name),
    fetchMarkdownFiles(repo.name),
    fetchSourceFiles(repo.name),
  ]);

  // Add repo info
  docs.push(await fetchRepoInfo(repo));

  if (readme) docs.push(readme);
  if (releases) docs.push(releases);
  docs.push(...markdownFiles);
  docs.push(...sourceFiles);

  return docs;
}

/**
 * Fetch all GitHub content from the organization
 */
async function fetchAllGitHub() {
  const allDocs = [];

  const repos = await fetchOrgRepos();

  for (const repo of repos) {
    console.log(`[RAG] Fetching ${repo.name}...`);
    const repoDocs = await fetchRepoContent(repo);
    allDocs.push(...repoDocs);
    console.log(`[RAG] Added ${repoDocs.length} docs from ${repo.name}`);
  }

  return allDocs;
}

/**
 * Convert HTML to readable text
 */
function htmlToText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<title[^>]*>([\s\S]*?)<\/title>/gi, "# $1\n\n")
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n")
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n")
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n")
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n")
    .replace(/<br[^>]*>/gi, "\n")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n")
    .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code))
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

/**
 * Extract all links from HTML
 */
function extractLinks(html, baseUrl) {
  const links = new Set();
  const linkRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    let href = match[1];

    // Skip non-page links
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") ||
        href.includes(".pdf") || href.includes(".zip") || href.includes(".png") ||
        href.includes(".jpg") || href.includes(".svg") || href.includes(".gif") ||
        href.includes(".ico") || href.includes("javascript:") || href.includes(".css") ||
        href.includes(".js") || href.includes(".xml") || href.includes(".json")) {
      continue;
    }

    // Convert relative to absolute
    if (href.startsWith("/")) {
      href = baseUrl + href;
    } else if (!href.startsWith("http")) {
      href = baseUrl + "/" + href;
    }

    // Only include same-domain links
    if (href.startsWith(baseUrl)) {
      href = href.split("#")[0].split("?")[0].replace(/\/$/, "");
      if (href && href !== baseUrl) {
        links.add(href);
      }
    }
  }

  return [...links];
}

/**
 * Fetch a single page
 */
async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "CortexLinuxAI-Bot" },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const text = htmlToText(html);

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : url;

    return { url, html, text, title };
  } catch {
    return null;
  }
}

/**
 * Crawl entire website - all pages and blog posts
 */
async function fetchWebsite() {
  try {
    const visited = new Set();
    const pages = [];
    const maxPages = 200; // Increased limit

    // Common paths to try even if not linked
    const commonPaths = [
      "", "/docs", "/documentation", "/blog", "/posts", "/articles",
      "/guide", "/guides", "/tutorial", "/tutorials", "/install", "/installation",
      "/getting-started", "/quickstart", "/features", "/about", "/faq",
      "/help", "/support", "/contact", "/pricing", "/download", "/downloads",
      "/changelog", "/releases", "/roadmap", "/community", "/contribute",
      "/api", "/reference", "/examples", "/demo", "/showcase",
    ];

    const toVisit = commonPaths.map(p => WEBSITE_URL + p);

    console.log("[RAG] Crawling website...");

    while (toVisit.length > 0 && pages.length < maxPages) {
      const url = toVisit.shift();
      const normalizedUrl = url.replace(/\/$/, "");

      if (visited.has(normalizedUrl)) continue;
      visited.add(normalizedUrl);

      const page = await fetchPage(url);
      if (!page || page.text.length < 30) continue;

      pages.push({
        content: `# ${page.title}\n\nURL: ${page.url}\n\n${page.text}`,
        metadata: {
          source: "website",
          type: "page",
          url: page.url,
          title: page.title,
        },
      });

      // Extract and queue new links
      const links = extractLinks(page.html, WEBSITE_URL);
      for (const link of links) {
        const normalizedLink = link.replace(/\/$/, "");
        if (!visited.has(normalizedLink) && !toVisit.includes(link)) {
          toVisit.push(link);
        }
      }
    }

    console.log(`[RAG] Crawled ${pages.length} website pages`);
    return pages;
  } catch (error) {
    console.error("[RAG] Failed to crawl website:", error.message);
    return [];
  }
}

/**
 * Initialize or refresh the knowledge base
 */
export async function initializeKnowledgeBase(force = false) {
  const now = Date.now();

  if (!force && knowledgeBase.initialized && now - lastFetchTime < CACHE_TTL) {
    console.log("[RAG] Using cached knowledge base");
    return knowledgeBase.getStats();
  }

  console.log("[RAG] Initializing knowledge base...");
  knowledgeBase.clear();

  // Fetch all sources in parallel
  const [githubDocs, websitePages] = await Promise.all([
    fetchAllGitHub(),
    fetchWebsite(),
  ]);

  // Add GitHub docs
  for (const doc of githubDocs) {
    knowledgeBase.addDocument(doc.content, doc.metadata);
  }
  console.log(`[RAG] Added ${githubDocs.length} GitHub documents`);

  // Add website pages
  for (const page of websitePages) {
    knowledgeBase.addDocument(page.content, page.metadata);
  }
  console.log(`[RAG] Added ${websitePages.length} website pages`);

  knowledgeBase.initialized = true;
  lastFetchTime = now;

  const stats = knowledgeBase.getStats();
  console.log(`[RAG] Knowledge base initialized: ${stats.totalDocuments} chunks`);

  return stats;
}

/**
 * Retrieve relevant context for a query
 */
export async function retrieveContext(query, topK = 5) {
  await initializeKnowledgeBase();

  const results = knowledgeBase.search(query, topK);

  if (results.length === 0) {
    return "";
  }

  let context = "## Retrieved Information\n\n";

  for (const doc of results) {
    const source = doc.metadata.url || doc.metadata.source;
    context += `### ${doc.metadata.title || "Document"}\n`;
    context += `Source: ${source}\n\n`;
    context += `${doc.content}\n\n`;
    context += "---\n\n";
  }

  return context;
}

/**
 * Force refresh the knowledge base
 */
export async function refreshKnowledgeBase() {
  return initializeKnowledgeBase(true);
}
