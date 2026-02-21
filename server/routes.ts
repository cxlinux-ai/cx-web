import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import type { Contributor } from "@shared/schema";
import { insertHackathonRegistrationSchema, fullHackathonRegistrationSchema } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

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
import bountiesRoutes from "./bounties";
import oauthRoutes from "./oauth";
import discordBot from "./discord-bot";
import licenseRoutes from "./license";
import emailCaptureRoutes from "./email-capture";
import PDFDocument from "pdfkit";

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

// Cache for issues
let issuesCache: { data: any[]; timestamp: number } | null = null;
const ISSUES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fallback data for when GitHub is unavailable (Real data from https://github.com/cxlinux-ai/cx-core)
const FALLBACK_STATS = {
  openIssues: 12,
  contributors: 5,
  mergedPRs: 323,
  stars: 25,
  forks: 47
};

const FALLBACK_ISSUES = [
  { title: "Improve AI model integration", bounty: "$150", skills: ["Python", "ML"], difficulty: "Medium", url: "https://github.com/cxlinux-ai/cx-core/issues" },
  { title: "Add dark mode support", bounty: "$100", skills: ["CSS", "React"], difficulty: "Beginner", url: "https://github.com/cxlinux-ai/cx-core/issues" },
  { title: "Optimize kernel module loading", bounty: "$200", skills: ["C", "Linux"], difficulty: "Advanced", url: "https://github.com/cxlinux-ai/cx-core/issues" },
  { title: "Documentation improvements", bounty: "$75", skills: ["Markdown", "Docs"], difficulty: "Beginner", url: "https://github.com/cxlinux-ai/cx-core/issues" },
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
  validate: { xForwardedForHeader: false },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for keep-alive pings
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      bot: process.env.DISCORD_BOT_TOKEN ? "configured" : "not configured",
    });
  });

  // Discord server structure endpoint (for debugging)
  app.get("/api/discord/server-structure", async (req, res) => {
    try {
      if (!discordBot.isBotReady()) {
        return res.status(503).json({ error: "Bot is not ready" });
      }
      const client = discordBot.getBotClient();
      const guild = client.guilds.cache.first();
      if (!guild) {
        return res.status(404).json({ error: "Bot is not in any guilds" });
      }

      await guild.roles.fetch();
      await guild.channels.fetch();

      const roles = guild.roles.cache
        .filter((r) => r.name !== "@everyone")
        .sort((a, b) => b.position - a.position)
        .map((r) => ({
          name: r.name,
          id: r.id,
          color: r.hexColor,
          position: r.position,
          permissions: {
            admin: r.permissions.has("Administrator"),
            manageMessages: r.permissions.has("ManageMessages"),
            manageChannels: r.permissions.has("ManageChannels"),
            manageRoles: r.permissions.has("ManageRoles"),
          },
        }));

      const channels = guild.channels.cache
        .sort((a, b) => a.position - b.position)
        .map((c) => ({
          name: c.name,
          id: c.id,
          type: c.type,
          parentId: c.parentId,
          position: c.position,
        }));

      res.json({
        server: {
          name: guild.name,
          id: guild.id,
          memberCount: guild.memberCount,
        },
        roles,
        channels,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start keep-alive self-ping (for Replit deployments)
  const baseUrl = process.env.REPLIT_URL || process.env.BASE_URL || "https://cxlinux.com";
  startKeepAlive(baseUrl);

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

      const owner = "cxlinux-ai";
      const repo = "cx-core";
      
      const headers = {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "CX-Linux-Landing-Page"
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

      const owner = "cxlinux-ai";
      const repo = "cx-core";
      
      const headers = {
        "Authorization": `token ${token}`,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "CX-Linux-Landing-Page"
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

      const owner = "cxlinux-ai";
      const repo = "cx-core";
      
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "CX-Linux-Landing-Page",
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

  // Mount Stripe routes (webhook needs raw body, so it's handled in stripe.ts)
  app.use("/api/stripe", stripeRoutes);

  // Mount Referral routes (viral growth system)

  // Mount Bounties routes (bounty board)
  app.use("/api/bounties", bountiesRoutes);

  // Mount OAuth routes (Discord, GitHub authentication)
  app.use("/api/oauth", oauthRoutes);

  // Mount License validation routes
  app.use("/api/license", licenseRoutes);

  // Mount Email Capture routes (Google Sheets integration)
  app.use("/api/email-capture", emailCaptureRoutes);

  // Admin API key middleware
  const requireAdminApiKey = (req: any, res: any, next: any) => {
    const apiKey = req.headers["x-api-key"];
    const adminApiKey = process.env.ADMIN_API_KEY;
    
    if (!adminApiKey) {
      return res.status(500).json({ success: false, error: "Admin API key not configured" });
    }
    
    if (apiKey !== adminApiKey) {
      return res.status(401).json({ success: false, error: "Unauthorized: Invalid API key" });
    }
    
    next();
  };

  // Legacy hackathon registration endpoint (backward compatibility)
  app.post("/api/hackathon/register", async (req, res) => {
    try {
      const result = insertHackathonRegistrationSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid registration data",
          details: result.error.flatten() 
        });
      }

      const { fullName, name, email, phone, githubUrl } = result.data;

      const existing = await storage.getHackathonRegistrationByEmail(email);
      if (existing) {
        return res.status(200).json({ 
          success: true,
          message: "Already registered",
          registration: existing 
        });
      }

      const registration = await storage.createHackathonRegistration({
        fullName: fullName || name || "",
        name: name || fullName,
        email,
        phone: phone || undefined,
        githubUrl: githubUrl || "",
      });

      res.status(201).json({ 
        success: true,
        message: "Registration successful",
        registration 
      });
    } catch (error) {
      console.error("Registration error:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ success: false, error: "Registration failed" });
    }
  });

  // New comprehensive registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const result = fullHackathonRegistrationSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid registration data",
          details: result.error.flatten() 
        });
      }

      const data = result.data;

      // Check for duplicate email
      const emailExists = await storage.checkEmailExists(data.email);
      if (emailExists) {
        return res.status(409).json({ 
          success: false,
          error: "This email is already registered for the hackathon" 
        });
      }
      }

      const registration = await storage.createFullRegistration(data);

      // Send to Google Sheets (fire and forget - don't block response)
      const sheetsWebhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      if (sheetsWebhookUrl) {
        const sheetData = {
          source: "hackathon_registration",
          timestamp: new Date().toISOString(),
          // Section 1: Personal Info
          fullName: data.fullName || "",
          email: data.email || "",
          discordUsername: data.discordUsername || "",
          country: data.country || "",
          organization: data.organization || "",
          // Section 2: Technical Background
          githubUrl: data.githubUrl || "",
          linkedinUrl: data.linkedinUrl || "",
          technicalRole: data.technicalRole || "",
          technicalRoleOther: data.technicalRoleOther || "",
          programmingLanguages: Array.isArray(data.programmingLanguages) 
            ? data.programmingLanguages.join(", ") 
            : "",
          linuxExperience: data.linuxExperience || "",
          aiMlExperience: data.aiMlExperience || "",
          // Section 3: Participation
          phaseParticipation: data.phaseParticipation || "",
          teamOrSolo: data.teamOrSolo || "",
          teamName: data.teamName || "",
          // Section 4: Motivations
          whyJoinHackathon: Array.isArray(data.whyJoinHackathon) 
            ? data.whyJoinHackathon.join(", ") 
            : "",
          whyJoinOther: data.whyJoinOther || "",
          cortexAreaInterest: data.cortexAreaInterest || "",
          // Section 5: Vision
          whatExcitesYou: data.whatExcitesYou || "",
          contributionPlan: data.contributionPlan || "",
          // Section 6: Beyond Hackathon
          postHackathonInvolvement: Array.isArray(data.postHackathonInvolvement) 
            ? data.postHackathonInvolvement.join(", ") 
            : "",
          threeYearVision: data.threeYearVision || "",
        };

        fetch(sheetsWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheetData),
        }).catch((err) => {
          console.error("[Google Sheets] Failed to send registration:", err.message);
        });
      }

      res.status(201).json({ 
        success: true,
        message: "Registration successful",
        registration 
      });
    } catch (error) {
      console.error("Registration error:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ success: false, error: "Registration failed" });
    }
  });

  // Get all registrations (protected)
  app.get("/api/registrations", requireAdminApiKey, async (req, res) => {
    try {
      const registrations = await storage.getAllHackathonRegistrations();
      res.json({ success: true, data: registrations });
    } catch (error) {
      console.error("Failed to fetch registrations:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ success: false, error: "Failed to fetch registrations" });
    }
  });

  // Get single registration by ID (protected)
  app.get("/api/registrations/:id", requireAdminApiKey, async (req, res) => {
    try {
      const { id } = req.params;
      const registration = await storage.getRegistrationById(id);
      
      if (!registration) {
        return res.status(404).json({ success: false, error: "Registration not found" });
      }
      
      res.json({ success: true, data: registration });
    } catch (error) {
      console.error("Failed to fetch registration:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ success: false, error: "Failed to fetch registration" });
    }
  });

  // Legacy endpoint for backward compatibility
  app.get("/api/hackathon/registrations", async (req, res) => {
    try {
      const registrations = await storage.getAllHackathonRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Failed to fetch registrations:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // Export registrations as CSV
  app.get("/api/hackathon/registrations/csv", async (req, res) => {
    try {
      const registrations = await storage.getAllHackathonRegistrations();
      
      const csvHeader = "Full Name,Email,Country,Role,Organization,GitHub,LinkedIn,Linux Exp,AI/ML Exp,Languages,Team/Solo,Team Name,Project Idea,Used CX Linux,How Heard,Registered At\n";
      const csvRows = registrations.map(r => 
        `"${r.fullName || r.name || ''}","${r.email}","${r.country || ''}","${r.currentRole || ''}","${r.organization || ''}","${r.githubUrl || ''}","${r.linkedinUrl || ''}","${r.linuxExperience || ''}","${r.aiMlExperience || ''}","${r.programmingLanguages || ''}","${r.teamOrSolo || ''}","${r.teamName || ''}","${(r.projectIdea || '').replace(/"/g, '""')}","${r.usedCortexBefore || ''}","${r.howHeardAboutUs || ''}","${r.registeredAt}"`
      ).join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=hackathon-registrations.csv");
      res.send(csvHeader + csvRows);
    } catch (error) {
      console.error("Failed to export registrations:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ error: "Failed to export registrations" });
    }
  });

  // Discord Bot Admin Routes
  app.get("/api/admin/discord/status", async (req, res) => {
    try {
      const isReady = discordBot.isBotReady();
      const client = discordBot.getBotClient();
      res.json({
        online: isReady,
        username: client.user?.username || null,
        servers: client.guilds.cache.size,
      });
    } catch (error) {
      console.error("Discord bot status error:", error);
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  app.post("/api/admin/discord/verify-user", async (req, res) => {
    try {
      const { discordId } = req.body;
      if (!discordId) {
        return res.status(400).json({ error: "Missing discordId" });
      }
      await discordBot.verifyMember(discordId);
      res.json({ message: "User verified successfully" });
    } catch (error) {
      console.error("User verify error:", error);
      res.status(500).json({ error: "Failed to verify user" });
    }
  });

  // Generate Hackathon Rules PDF
  app.get("/downloads/cx-hackathon-rules-2026.pdf", (req, res) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=cx-hackathon-rules-2026.pdf");
      
      doc.pipe(res);
      
      // Title
      doc.fontSize(28).font("Helvetica-Bold").fillColor("#0066ff")
         .text("CX Linux Hackathon 2026", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).font("Helvetica").fillColor("#666666")
         .text("Official Rules & Guidelines", { align: "center" });
      doc.moveDown(2);
      
      // Overview
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a1a1a")
         .text("Overview");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("The CX Linux Hackathon 2026 is a 13-week program designed to generate monetizable product ideas and turn them into production-ready code for CX Linux. Total prize pool: $18,700 ($13,800 cash + $4,900 worth of goodies & services).", { align: "left", lineGap: 4 });
      doc.moveDown(1.5);
      
      // Phase 1: Ideathon
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#f59e0b")
         .text("Phase 1: CX Ideathon");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("Timeline: Weeks 1-4 (4 weeks)", { lineGap: 3 })
         .text("Prize Pool: $3,800", { lineGap: 3 })
         .text("Goal: Generate monetizable feature ideas for CX Linux", { lineGap: 3 });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Prize Breakdown:", { lineGap: 3 });
      doc.font("Helvetica")
         .text("  • 1st Place: $250", { lineGap: 2 })
         .text("  • 2nd Place: $250", { lineGap: 2 })
         .text("  • 3rd Place: $250", { lineGap: 2 })
         .text("  • 4th-10th Place: $150 each", { lineGap: 2 })
         .text("  • 11th-30th Place: $100 each (Goodie package + 1 month Premium)", { lineGap: 2 });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Judging Criteria:", { lineGap: 3 });
      doc.font("Helvetica")
         .text("  • Innovation & Originality: 30%", { lineGap: 2 })
         .text("  • Feasibility: 25%", { lineGap: 2 })
         .text("  • Monetization Potential: 25%", { lineGap: 2 })
         .text("  • Completeness: 20%", { lineGap: 2 });
      doc.moveDown(1.5);
      
      // Phase 2: Hackathon
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#3b82f6")
         .text("Phase 2: CX Linux Hackathon");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("Timeline: Weeks 5-13 (9 weeks)", { lineGap: 3 })
         .text("Prize Pool: $10,000 cash + $4,900 worth of goodies", { lineGap: 3 })
         .text("Goal: Build and ship production-ready code", { lineGap: 3 });
      doc.moveDown(0.5);
      
      // Build Sprint
      doc.font("Helvetica-Bold").text("Build Sprint (Weeks 5-9):", { lineGap: 3 });
      doc.font("Helvetica")
         .text("Build features, plugins, extensions, or integrations for CX Linux.", { lineGap: 3 })
         .text("Submit via GitHub Pull Request with comprehensive documentation.", { lineGap: 3 });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Prize Breakdown:", { lineGap: 3 });
      doc.font("Helvetica")
         .text("  • 1st Place: $5,000", { lineGap: 2 })
         .text("  • 2nd Place: $3,000", { lineGap: 2 })
         .text("  • 3rd Place: $2,000", { lineGap: 2 })
         .text("  • 4th-10th Place: $700 worth of goodies + 2 months managed service each (not cash)", { lineGap: 2 });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Judging Criteria:", { lineGap: 3 });
      doc.font("Helvetica")
         .text("  • Code Quality: 30%", { lineGap: 2 })
         .text("  • Usefulness: 25%", { lineGap: 2 })
         .text("  • Architecture: 20%", { lineGap: 2 })
         .text("  • Documentation: 15%", { lineGap: 2 })
         .text("  • Test Coverage: 10%", { lineGap: 2 });
      doc.moveDown(0.5);
      
      // Review Period
      doc.font("Helvetica-Bold").text("Review Period (Weeks 10-14):", { lineGap: 3 });
      doc.font("Helvetica")
         .text("Submissions are reviewed by the CX Linux maintainer team. One-on-one code reviews, PR refinement, and final judging. Winners announced at end of Week 14.", { lineGap: 3 });
      doc.moveDown(1.5);
      
      // Builder Pack
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#10b981")
         .text("Builder Pack");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("All participants who submit a valid entry receive a $5 CX Linux credit as a thank you for participating.", { lineGap: 3 });
      doc.moveDown(1.5);
      
      // Category Awards
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#a855f7")
         .text("Category Awards");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("Additional prizes awarded alongside main placement prizes:", { lineGap: 3 });
      doc.moveDown(0.5);
      doc.font("Helvetica")
         .text("  • Best Plugin/Extension: 6 months Premium", { lineGap: 2 })
         .text("  • Best Automation Workflow: 6 months Premium", { lineGap: 2 })
         .text("  • Best Enterprise Feature: 6 months Premium", { lineGap: 2 });
      doc.moveDown(0.5);
      doc.font("Helvetica").fillColor("#666666")
         .text("Note: Category awards can be won in addition to main placement prizes.", { lineGap: 3 });
      doc.fillColor("#333333");
      doc.moveDown(1.5);
      
      // Eligibility
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a1a1a")
         .text("Eligibility & Rules");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("• Open to anyone 18 years or older", { lineGap: 3 })
         .text("• Solo participants or teams of 2-5 members", { lineGap: 3 })
         .text("• All submissions must be original work", { lineGap: 3 })
         .text("• Code must be submitted under MIT license", { lineGap: 3 })
         .text("• Employees of CX Linux and their families are not eligible", { lineGap: 3 })
         .text("• All submissions become property of CX Linux project", { lineGap: 3 })
         .text("• Decisions by judges are final", { lineGap: 3 });
      doc.moveDown(1.5);
      
      // Contact
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a1a1a")
         .text("Contact & Resources");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("• Website: https://cxlinux.com/hackathon", { lineGap: 3 })
         .text("• GitHub: https://github.com/cxlinux-ai/cx-core", { lineGap: 3 })
         .text("• Discord: https://discord.gg/ASvzWcuTfk", { lineGap: 3 })
         .text("• Email: hello@cxlinux.com", { lineGap: 3 });
      doc.moveDown(2);
      
      // Footer
      doc.fontSize(9).font("Helvetica").fillColor("#999999")
         .text("© 2026 CX Linux. All rights reserved. Last updated: January 2026", { align: "center" });
      
      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
