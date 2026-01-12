import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import type { Contributor } from "@shared/schema";
import { insertHackathonRegistrationSchema } from "@shared/schema";
import stripeRoutes from "./stripe";
import referralRoutes from "./referral";
import bountiesRoutes from "./bounties";
import PDFDocument from "pdfkit";

// Simple in-memory cache for contributors
let contributorsCache: { data: Contributor[]; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Cache for stats
let statsCache: { data: any; timestamp: number } | null = null;
const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache for issues
let issuesCache: { data: any[]; timestamp: number } | null = null;
const ISSUES_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Fallback data for when GitHub is unavailable (Real data from https://github.com/cortexlinux/Cortex)
const FALLBACK_STATS = {
  openIssues: 12,
  contributors: 5,
  mergedPRs: 323,
  stars: 25,
  forks: 47
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
  validate: { xForwardedForHeader: false },
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

  // Mount Stripe routes (webhook needs raw body, so it's handled in stripe.ts)
  app.use("/api/stripe", stripeRoutes);

  // Mount Referral routes (viral growth system)
  app.use("/api/referral", referralRoutes);

  // Mount Bounties routes (bounty board)
  app.use("/api/bounties", bountiesRoutes);

  // Hackathon registration endpoint
  app.post("/api/hackathon/register", async (req, res) => {
    try {
      const result = insertHackathonRegistrationSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid registration data",
          details: result.error.flatten() 
        });
      }

      const { name, email, phone } = result.data;

      const existing = await storage.getHackathonRegistrationByEmail(email);
      if (existing) {
        return res.status(200).json({ 
          message: "Already registered",
          registration: existing 
        });
      }

      const registration = await storage.createHackathonRegistration({
        name,
        email,
        phone: phone || undefined,
      });

      res.status(201).json({ 
        message: "Registration successful",
        registration 
      });
    } catch (error) {
      console.error("Registration error:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Get all hackathon registrations (admin endpoint)
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
      
      const csvHeader = "Name,Email,Phone,Registered At\n";
      const csvRows = registrations.map(r => 
        `"${r.name}","${r.email}","${r.phone || ''}","${r.registeredAt}"`
      ).join("\n");
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=hackathon-registrations.csv");
      res.send(csvHeader + csvRows);
    } catch (error) {
      console.error("Failed to export registrations:", error instanceof Error ? error.message : "Unknown error");
      res.status(500).json({ error: "Failed to export registrations" });
    }
  });

  // Generate Hackathon Rules PDF
  app.get("/downloads/cortex-hackathon-rules-2026.pdf", (req, res) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=cortex-hackathon-rules-2026.pdf");
      
      doc.pipe(res);
      
      // Title
      doc.fontSize(28).font("Helvetica-Bold").fillColor("#0066ff")
         .text("Cortex Hackathon 2026", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(16).font("Helvetica").fillColor("#666666")
         .text("Official Rules & Guidelines", { align: "center" });
      doc.moveDown(2);
      
      // Overview
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#1a1a1a")
         .text("Overview");
      doc.moveDown(0.5);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("The Cortex Hackathon 2026 is a 13-week program designed to generate monetizable product ideas and turn them into production-ready code for Cortex Linux. Total prize pool: $15,000.", { align: "left", lineGap: 4 });
      doc.moveDown(1.5);
      
      // Phase 1: Ideathon
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#f59e0b")
         .text("Phase 1: Cortex Ideathon");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("Timeline: Weeks 1-4 (4 weeks)", { lineGap: 3 })
         .text("Prize Pool: $3,000", { lineGap: 3 })
         .text("Goal: Generate monetizable feature ideas for Cortex Linux", { lineGap: 3 });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Prize Breakdown:", { lineGap: 3 });
      doc.font("Helvetica")
         .text("  • Best Idea: $1,000", { lineGap: 2 })
         .text("  • Most Innovative: $800", { lineGap: 2 })
         .text("  • Best Enterprise Feature: $600", { lineGap: 2 })
         .text("  • Honorable Mentions (3): $200 each", { lineGap: 2 });
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
         .text("Phase 2: Cortex Hackathon");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("Timeline: Weeks 5-14 (10 weeks)", { lineGap: 3 })
         .text("Prize Pool: $12,000", { lineGap: 3 })
         .text("Goal: Build and ship production-ready code", { lineGap: 3 });
      doc.moveDown(0.5);
      
      // Build Sprint
      doc.font("Helvetica-Bold").text("Build Sprint (Weeks 5-9):", { lineGap: 3 });
      doc.font("Helvetica")
         .text("Build features, plugins, extensions, or integrations for Cortex Linux.", { lineGap: 3 })
         .text("Submit via GitHub Pull Request with comprehensive documentation.", { lineGap: 3 });
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").text("Prize Breakdown:", { lineGap: 3 });
      doc.font("Helvetica")
         .text("  • 1st Place: $5,000", { lineGap: 2 })
         .text("  • 2nd Place: $3,000", { lineGap: 2 })
         .text("  • 3rd Place: $2,000", { lineGap: 2 })
         .text("  • 4th-7th Place: $500 each", { lineGap: 2 });
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
         .text("Submissions are reviewed by the Cortex maintainer team. One-on-one code reviews, PR refinement, and final judging. Winners announced at end of Week 14.", { lineGap: 3 });
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
         .text("• Employees of Cortex Linux and their families are not eligible", { lineGap: 3 })
         .text("• All submissions become property of Cortex Linux project", { lineGap: 3 })
         .text("• Decisions by judges are final", { lineGap: 3 });
      doc.moveDown(1.5);
      
      // Contact
      doc.fontSize(16).font("Helvetica-Bold").fillColor("#1a1a1a")
         .text("Contact & Resources");
      doc.moveDown(0.3);
      doc.fontSize(11).font("Helvetica").fillColor("#333333")
         .text("• Website: https://cortexlinux.com/hackathon", { lineGap: 3 })
         .text("• GitHub: https://github.com/cortexlinux/cortex", { lineGap: 3 })
         .text("• Discord: https://discord.gg/cortexlinux", { lineGap: 3 })
         .text("• Email: hackathon@cortexlinux.com", { lineGap: 3 });
      doc.moveDown(2);
      
      // Footer
      doc.fontSize(9).font("Helvetica").fillColor("#999999")
         .text("© 2026 Cortex Linux. All rights reserved. Last updated: January 2026", { align: "center" });
      
      doc.end();
    } catch (error) {
      console.error("PDF generation error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
