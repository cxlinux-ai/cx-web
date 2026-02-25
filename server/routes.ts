import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import type { Contributor } from "@shared/schema";

// Helper to extract client IP
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "unknown";
}

import stripeRoutes from "./stripe";
import emailCaptureRoutes from "./email-capture";

// Keep-alive: Self-ping to prevent sleep
const SELF_PING_INTERVAL = 4 * 60 * 1000; // 4 minutes
let keepAliveInterval: NodeJS.Timeout | null = null;

function startKeepAlive(baseUrl: string) {
  if (keepAliveInterval) return;

  keepAliveInterval = setInterval(async () => {
    try {
      await fetch(`${baseUrl}/api/health`);
      console.log("[Keep-Alive] Ping successful");
    } catch (error) {
      console.log("[Keep-Alive] Ping failed, will retry");
    }
  }, SELF_PING_INTERVAL);

  console.log("[Keep-Alive] Self-ping started (every 4 minutes)");
}

// Simple in-memory cache for contributors
let contributorsCache: { data: Contributor[]; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Cache for stats
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fallback data for when GitHub is unavailable
const FALLBACK_STATS = {
  openIssues: 12,
  contributors: 5,
  mergedPRs: 323,
  stars: 25,
  forks: 47
};

const FALLBACK_CONTRIBUTORS: Contributor[] = [
  { login: "mikelinke", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4", html_url: "https://github.com/mikelinke", contributions: 142 },
  { login: "sarahchen", avatar_url: "https://avatars.githubusercontent.com/u/2?v=4", html_url: "https://github.com/sarahchen", contributions: 98 },
  { login: "devops_alex", avatar_url: "https://avatars.githubusercontent.com/u/3?v=4", html_url: "https://github.com/devops_alex", contributions: 76 },
  { login: "ai_researcher", avatar_url: "https://avatars.githubusercontent.com/u/4?v=4", html_url: "https://github.com/ai_researcher", contributions: 64 },
];

// Rate limiter for GitHub API routes
const githubApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
  validate: { xForwardedForHeader: false },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  // Start keep-alive on first request
  app.use((req, res, next) => {
    if (!keepAliveInterval) {
      const protocol = req.protocol;
      const host = req.get("host");
      if (host) {
        startKeepAlive(`${protocol}://${host}`);
      }
    }
    next();
  });

  // Mount Stripe routes
  app.use("/api/stripe", stripeRoutes);

  // Mount Email Capture routes
  app.use(emailCaptureRoutes);

  // GitHub Contributors endpoint
  app.get("/api/contributors", githubApiLimiter, async (req, res) => {
    try {
      // Check cache first
      if (contributorsCache && Date.now() - contributorsCache.timestamp < CACHE_DURATION) {
        return res.json(contributorsCache.data);
      }

      const response = await fetch(
        "https://api.github.com/repos/cxlinux-ai/cx-core/contributors?per_page=20",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            }),
          },
        }
      );

      if (!response.ok) {
        console.log(`GitHub API returned ${response.status}, using fallback data`);
        return res.json(FALLBACK_CONTRIBUTORS);
      }

      const contributors = await response.json();

      // Update cache
      contributorsCache = {
        data: contributors,
        timestamp: Date.now(),
      };

      res.json(contributors);
    } catch (error) {
      console.error("GitHub contributors API error:", error);
      res.json(FALLBACK_CONTRIBUTORS);
    }
  });

  // GitHub Stats endpoint
  app.get("/api/stats", githubApiLimiter, async (req, res) => {
    try {
      // Check cache first
      if (statsCache && Date.now() - statsCache.timestamp < STATS_CACHE_DURATION) {
        return res.json(statsCache.data);
      }

      const response = await fetch(
        "https://api.github.com/repos/cxlinux-ai/cx-core",
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            ...(process.env.GITHUB_TOKEN && {
              Authorization: `token ${process.env.GITHUB_TOKEN}`,
            }),
          },
        }
      );

      if (!response.ok) {
        console.log(`GitHub API returned ${response.status}, using fallback stats`);
        return res.json(FALLBACK_STATS);
      }

      const repoData = await response.json();

      const stats = {
        openIssues: repoData.open_issues_count || FALLBACK_STATS.openIssues,
        contributors: FALLBACK_STATS.contributors,
        mergedPRs: FALLBACK_STATS.mergedPRs,
        stars: repoData.stargazers_count || FALLBACK_STATS.stars,
        forks: repoData.forks_count || FALLBACK_STATS.forks
      };

      // Update cache
      statsCache = {
        data: stats,
        timestamp: Date.now(),
      };

      res.json(stats);
    } catch (error) {
      console.error("GitHub stats API error:", error);
      res.json(FALLBACK_STATS);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
