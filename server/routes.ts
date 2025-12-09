import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import type { Contributor } from "@shared/schema";

// Simple in-memory cache for contributors
let contributorsCache: { data: Contributor[]; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Cache for stats
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for issues
let issuesCache: { data: any[]; timestamp: number } | null = null;
const ISSUES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fallback data for when GitHub is unavailable
const FALLBACK_STATS = {
  openIssues: 12,
  contributors: 24,
  mergedPRs: 87,
  stars: 156,
  forks: 32
};

const FALLBACK_ISSUES = [
  { title: "Improve AI model integration", bounty: "$150", skills: ["Python", "ML"], difficulty: "Medium", url: "https://github.com/cortexlinux/cortex/issues" },
  { title: "Add dark mode support", bounty: "$100", skills: ["CSS", "React"], difficulty: "Beginner", url: "https://github.com/cortexlinux/cortex/issues" },
  { title: "Optimize kernel module loading", bounty: "$200", skills: ["C", "Linux"], difficulty: "Advanced", url: "https://github.com/cortexlinux/cortex/issues" },
  { title: "Documentation improvements", bounty: "$75", skills: ["Markdown", "Docs"], difficulty: "Beginner", url: "https://github.com/cortexlinux/cortex/issues" },
];

const FALLBACK_CONTRIBUTORS: Contributor[] = [
  { login: "mikelinke", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4", html_url: "https://github.com/mikelinke", contributions: 142 },
  { login: "sarahchen", avatar_url: "https://avatars.githubusercontent.com/u/2?v=4", html_url: "https://github.com/sarahchen", contributions: 98 },
  { login: "devops_alex", avatar_url: "https://avatars.githubusercontent.com/u/3?v=4", html_url: "https://github.com/devops_alex", contributions: 76 },
  { login: "ai_researcher", avatar_url: "https://avatars.githubusercontent.com/u/4?v=4", html_url: "https://github.com/ai_researcher", contributions: 64 },
  { login: "kernel_hacker", avatar_url: "https://avatars.githubusercontent.com/u/5?v=4", html_url: "https://github.com/kernel_hacker", contributions: 52 },
  { login: "ml_engineer", avatar_url: "https://avatars.githubusercontent.com/u/6?v=4", html_url: "https://github.com/ml_engineer", contributions: 45 },
  { login: "frontend_dev", avatar_url: "https://avatars.githubusercontent.com/u/7?v=4", html_url: "https://github.com/frontend_dev", contributions: 38 },
  { login: "data_scientist", avatar_url: "https://avatars.githubusercontent.com/u/8?v=4", html_url: "https://github.com/data_scientist", contributions: 31 },
];

// Rate limiter for GitHub API routes (30 requests per minute per IP)
const githubApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per window per IP
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests, please try again later" },
  keyGenerator: (req) => {
    return req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub API endpoint to fetch repository stats
  app.get("/api/github/stats", githubApiLimiter, async (req, res) => {
    try {
      // Check cache first
      if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_DURATION) {
        return res.json(statsCache.data);
      }

      const token = process.env.GITHUB_PUBLIC_TOKEN;
      if (!token) {
        console.warn("GitHub token not configured, using fallback data");
        return res.json(FALLBACK_STATS);
      }

      const owner = "cortexlinux";
      const repo = "cortex";
      
      const headers = {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Cortex-Linux-Landing-Page"
      };

      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      
      if (!repoResponse.ok) {
        console.error("GitHub API error:", repoResponse.status, repoResponse.statusText);
        return res.json(statsCache?.data || FALLBACK_STATS);
      }

      const repoData = await repoResponse.json();

      const contributorsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
        { headers }
      );
      const contributors = contributorsResponse.ok ? await contributorsResponse.json() : [];

      const prsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&per_page=100`,
        { headers }
      );
      const prs = prsResponse.ok ? await prsResponse.json() : [];
      const mergedPRs = Array.isArray(prs) ? prs.filter((pr: any) => pr.merged_at).length : 0;

      const stats = {
        openIssues: repoData.open_issues_count || 0,
        contributors: Array.isArray(contributors) ? contributors.length : 0,
        mergedPRs: mergedPRs,
        stars: repoData.stargazers_count || 0,
        forks: repoData.forks_count || 0
      };

      // Update cache
      statsCache = { data: stats, timestamp: Date.now() };

      res.json(stats);
    } catch (error) {
      console.error("GitHub API error:", error instanceof Error ? error.message : "Unknown error");
      res.json(statsCache?.data || FALLBACK_STATS);
    }
  });

  // GitHub API endpoint to fetch bounty issues
  app.get("/api/github/issues", githubApiLimiter, async (req, res) => {
    try {
      // Check cache first
      if (issuesCache && Date.now() - issuesCache.timestamp < ISSUES_CACHE_DURATION) {
        return res.json(issuesCache.data);
      }

      const token = process.env.GITHUB_PUBLIC_TOKEN;
      if (!token) {
        console.warn("GitHub token not configured, using fallback data");
        return res.json(FALLBACK_ISSUES);
      }

      const owner = "cortexlinux";
      const repo = "cortex";
      
      const headers = {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Cortex-Linux-Landing-Page"
      };

      const issuesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=open&labels=bounty&per_page=10`,
        { headers }
      );

      if (!issuesResponse.ok) {
        console.error("GitHub issues API error:", issuesResponse.status, issuesResponse.statusText);
        return res.json(issuesCache?.data || FALLBACK_ISSUES);
      }

      const issues = await issuesResponse.json();

      if (!Array.isArray(issues) || issues.length === 0) {
        return res.json(FALLBACK_ISSUES);
      }

      const formattedIssues = issues.map((issue: any) => {
        const bountyMatch = issue.title.match(/\$(\d+)/);
        const bounty = bountyMatch ? `$${bountyMatch[1]}` : "$100";

        const skills = issue.labels
          .map((label: any) => label.name)
          .filter((name: string) => 
            !['bounty', 'enhancement', 'bug', 'help wanted'].includes(name.toLowerCase())
          )
          .slice(0, 3);

        let difficulty = "Medium";
        const difficultyLabel = issue.labels.find((label: any) => 
          ['beginner', 'easy', 'medium', 'advanced', 'hard'].includes(label.name.toLowerCase())
        );
        if (difficultyLabel) {
          const name = difficultyLabel.name.toLowerCase();
          difficulty = name === 'beginner' || name === 'easy' ? 'Beginner' :
                      name === 'advanced' || name === 'hard' ? 'Advanced' : 'Medium';
        }

        return {
          title: issue.title.replace(/\$\d+\s*-?\s*/, ''),
          bounty,
          skills: skills.length > 0 ? skills : ['Open Source'],
          difficulty,
          url: issue.html_url
        };
      }).slice(0, 4);

      // Update cache
      issuesCache = { data: formattedIssues, timestamp: Date.now() };

      res.json(formattedIssues);
    } catch (error) {
      console.error("GitHub issues API error:", error instanceof Error ? error.message : "Unknown error");
      res.json(issuesCache?.data || FALLBACK_ISSUES);
    }
  });

  // GitHub API endpoint to fetch repository contributors
  app.get("/api/github/contributors", githubApiLimiter, async (req, res) => {
    try {
      // Check cache first
      if (contributorsCache && Date.now() - contributorsCache.timestamp < CACHE_DURATION) {
        return res.json(contributorsCache.data);
      }

      const token = process.env.GITHUB_PUBLIC_TOKEN;
      if (!token) {
        console.warn("GitHub token not configured, using fallback data");
        return res.json(FALLBACK_CONTRIBUTORS);
      }

      const owner = "cortexlinux";
      const repo = "cortex";
      
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "Cortex-Linux-Landing-Page",
        "Authorization": `token ${token}`,
        "X-GitHub-Api-Version": "2022-11-28"
      };

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
        { headers }
      );

      if (!response.ok) {
        console.error("GitHub contributors API error:", response.status, response.statusText);
        return res.json(contributorsCache?.data || FALLBACK_CONTRIBUTORS);
      }

      const contributors = await response.json();

      const formattedContributors: Contributor[] = Array.isArray(contributors)
        ? contributors.map((contributor: any) => ({
            login: contributor.login,
            avatar_url: contributor.avatar_url,
            html_url: contributor.html_url,
            contributions: contributor.contributions,
          }))
        : [];

      // Update cache
      contributorsCache = {
        data: formattedContributors.length > 0 ? formattedContributors : FALLBACK_CONTRIBUTORS,
        timestamp: Date.now(),
      };

      res.json(contributorsCache.data);
    } catch (error) {
      console.error("GitHub contributors API error:", error instanceof Error ? error.message : "Unknown error");
      res.json(contributorsCache?.data || FALLBACK_CONTRIBUTORS);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
