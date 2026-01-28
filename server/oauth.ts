/**
 * OAuth Routes - Discord and GitHub Authentication
 *
 * Handles:
 * - Discord OAuth2 for server membership verification
 * - GitHub OAuth for PR tracking and contribution verification
 * - Token management and refresh
 */

import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  waitlistEntries,
  discordVerificationEvents,
  githubContributions,
  VERIFICATION_REQUIREMENTS,
} from "@shared/schema";

const router = Router();

// Environment variables (set these in your deployment)
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || "";
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || "https://cortexlinux.com/api/oauth/discord/callback";
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || ""; // Your Discord server ID
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || "https://cortexlinux.com/api/oauth/github/callback";

const FRONTEND_URL = process.env.FRONTEND_URL || "https://cortexlinux.com";

// Rate limiters
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { error: "Too many OAuth attempts. Please try again later." },
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Generate a secure state token for OAuth
 */
function generateOAuthState(referralCode: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(16).toString("hex");
  // Encode referralCode in state for callback
  return `${referralCode}.${timestamp}.${random}`;
}

/**
 * Parse OAuth state token
 */
function parseOAuthState(state: string): { referralCode: string; timestamp: number } | null {
  try {
    const parts = state.split(".");
    if (parts.length !== 3) return null;
    return {
      referralCode: parts[0],
      timestamp: parseInt(parts[1], 36),
    };
  } catch {
    return null;
  }
}

/**
 * Check if referred user is fully verified and update referrer stats
 */
async function checkAndUpdateVerification(waitlistEntryId: string): Promise<boolean> {
  const entry = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.id, waitlistEntryId))
    .limit(1);

  if (entry.length === 0) return false;

  const user = entry[0];

  // Check full verification: discord_verified AND (pr_completed OR hackathon_participated)
  const discordVerified = user.discordConnected && user.discordJoinedServer;
  const contributionVerified = user.prCompleted || user.hackathonParticipated;

  const isFullyVerified = discordVerified && contributionVerified;

  if (isFullyVerified && !user.fullyVerified) {
    // Mark user as fully verified
    await db
      .update(waitlistEntries)
      .set({
        fullyVerified: true,
        fullyVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, waitlistEntryId));

    // Update referrer's verified referrals count if this user was referred
    if (user.referredByCode) {
      const referrer = await db
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.referralCode, user.referredByCode))
        .limit(1);

      if (referrer.length > 0) {
        const newVerifiedCount = (referrer[0].verifiedReferrals || 0) + 1;

        // Determine new tier
        let newTier = "none";
        if (newVerifiedCount >= 50) newTier = "legendary";
        else if (newVerifiedCount >= 20) newTier = "diamond";
        else if (newVerifiedCount >= 10) newTier = "platinum";
        else if (newVerifiedCount >= 5) newTier = "gold";
        else if (newVerifiedCount >= 3) newTier = "silver";
        else if (newVerifiedCount >= 1) newTier = "bronze";

        // Calculate position boost
        let positionBoost = 0;
        if (newVerifiedCount >= 1) positionBoost += 100;
        if (newVerifiedCount >= 3) positionBoost += 500;

        const newPosition = Math.max(1, referrer[0].originalPosition - positionBoost);

        // Check ambassador status
        const isAmbassador = newVerifiedCount >= 20;

        await db
          .update(waitlistEntries)
          .set({
            verifiedReferrals: newVerifiedCount,
            currentPosition: newPosition,
            currentTier: newTier,
            isAmbassador: isAmbassador,
            ambassadorSince: isAmbassador && !referrer[0].isAmbassador ? new Date() : referrer[0].ambassadorSince,
            featuredOnContributors: isAmbassador,
            updatedAt: new Date(),
          })
          .where(eq(waitlistEntries.id, referrer[0].id));
      }
    }

    return true;
  }

  return isFullyVerified;
}

// ==========================================
// DISCORD OAUTH
// ==========================================

/**
 * GET /api/oauth/discord/authorize
 * Initiate Discord OAuth flow
 */
router.get("/discord/authorize", oauthLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.query;

    if (!referralCode || typeof referralCode !== "string") {
      return res.status(400).json({ error: "Missing referral code" });
    }

    // Verify referral code exists
    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    // Log OAuth start event
    await db.insert(discordVerificationEvents).values({
      waitlistEntryId: entry[0].id,
      eventType: "oauth_started",
      success: true,
    });

    // Generate state with referral code
    const state = generateOAuthState(referralCode.toUpperCase());

    // Build Discord OAuth URL
    const scopes = ["identify", "guilds", "guilds.join"];
    const authUrl = new URL("https://discord.com/api/oauth2/authorize");
    authUrl.searchParams.set("client_id", DISCORD_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", DISCORD_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("prompt", "consent");

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Discord OAuth start error:", error);
    res.status(500).json({ error: "Failed to start Discord authentication" });
  }
});

/**
 * GET /api/oauth/discord/callback
 * Handle Discord OAuth callback
 */
router.get("/discord/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=discord_denied`);
    }

    if (!code || !state || typeof code !== "string" || typeof state !== "string") {
      return res.redirect(`${FRONTEND_URL}/referrals?error=invalid_request`);
    }

    // Parse state to get referral code
    const parsedState = parseOAuthState(state);
    if (!parsedState) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=invalid_state`);
    }

    // Check state timestamp (expire after 10 minutes)
    if (Date.now() - parsedState.timestamp > 10 * 60 * 1000) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=expired`);
    }

    // Get user entry
    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, parsedState.referralCode))
      .limit(1);

    if (entry.length === 0) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=invalid_code`);
    }

    const waitlistEntry = entry[0];

    // Exchange code for tokens
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      await db.insert(discordVerificationEvents).values({
        waitlistEntryId: waitlistEntry.id,
        eventType: "oauth_completed",
        success: false,
        errorMessage: "Token exchange failed",
      });
      return res.redirect(`${FRONTEND_URL}/referrals?error=token_failed`);
    }

    const tokens = await tokenResponse.json();

    // Get Discord user info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=user_fetch_failed`);
    }

    const discordUser = await userResponse.json();

    // Update waitlist entry with Discord info
    await db
      .update(waitlistEntries)
      .set({
        discordId: discordUser.id,
        discordUsername: `${discordUser.username}${discordUser.discriminator !== "0" ? `#${discordUser.discriminator}` : ""}`,
        discordConnected: true,
        discordAccessToken: tokens.access_token, // In production, encrypt this
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, waitlistEntry.id));

    // Log successful OAuth
    await db.insert(discordVerificationEvents).values({
      waitlistEntryId: waitlistEntry.id,
      eventType: "oauth_completed",
      eventData: JSON.stringify({ discordId: discordUser.id, username: discordUser.username }),
      success: true,
    });

    // Try to add user to Discord server using bot
    if (DISCORD_BOT_TOKEN && DISCORD_SERVER_ID) {
      try {
        const joinResponse = await fetch(
          `https://discord.com/api/guilds/${DISCORD_SERVER_ID}/members/${discordUser.id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              access_token: tokens.access_token,
            }),
          }
        );

        if (joinResponse.ok || joinResponse.status === 204) {
          // User added or already in server
          await db
            .update(waitlistEntries)
            .set({
              discordJoinedServer: true,
              discordVerifiedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(waitlistEntries.id, waitlistEntry.id));

          await db.insert(discordVerificationEvents).values({
            waitlistEntryId: waitlistEntry.id,
            eventType: "server_joined",
            success: true,
          });

          // Check if user is now fully verified
          await checkAndUpdateVerification(waitlistEntry.id);
        }
      } catch (joinError) {
        console.error("Failed to add user to Discord server:", joinError);
      }
    }

    // Redirect to success page
    res.redirect(`${FRONTEND_URL}/referrals?discord=connected&code=${parsedState.referralCode}`);
  } catch (error) {
    console.error("Discord OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}/referrals?error=server_error`);
  }
});

/**
 * POST /api/oauth/discord/verify-membership
 * Verify user is still in Discord server
 */
router.post("/discord/verify-membership", oauthLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ error: "Missing referral code" });
    }

    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const user = entry[0];

    if (!user.discordId || !DISCORD_BOT_TOKEN || !DISCORD_SERVER_ID) {
      return res.json({ verified: false, reason: "Discord not connected" });
    }

    // Check if user is in server using bot
    const memberResponse = await fetch(
      `https://discord.com/api/guilds/${DISCORD_SERVER_ID}/members/${user.discordId}`,
      {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }
    );

    const isInServer = memberResponse.ok;

    // Update database
    await db
      .update(waitlistEntries)
      .set({
        discordJoinedServer: isInServer,
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, user.id));

    // Check full verification status
    if (isInServer) {
      await checkAndUpdateVerification(user.id);
    }

    res.json({
      verified: isInServer,
      discordUsername: user.discordUsername,
    });
  } catch (error) {
    console.error("Discord membership verification error:", error);
    res.status(500).json({ error: "Failed to verify membership" });
  }
});

// ==========================================
// GITHUB OAUTH
// ==========================================

/**
 * GET /api/oauth/github/authorize
 * Initiate GitHub OAuth flow
 */
router.get("/github/authorize", oauthLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.query;

    if (!referralCode || typeof referralCode !== "string") {
      return res.status(400).json({ error: "Missing referral code" });
    }

    // Verify referral code exists
    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    // Generate state with referral code
    const state = generateOAuthState(referralCode.toUpperCase());

    // Build GitHub OAuth URL
    const scopes = ["read:user", "user:email", "repo"];
    const authUrl = new URL("https://github.com/login/oauth/authorize");
    authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI);
    authUrl.searchParams.set("scope", scopes.join(" "));
    authUrl.searchParams.set("state", state);

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("GitHub OAuth start error:", error);
    res.status(500).json({ error: "Failed to start GitHub authentication" });
  }
});

/**
 * GET /api/oauth/github/callback
 * Handle GitHub OAuth callback
 */
router.get("/github/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=github_denied`);
    }

    if (!code || !state || typeof code !== "string" || typeof state !== "string") {
      return res.redirect(`${FRONTEND_URL}/referrals?error=invalid_request`);
    }

    // Parse state
    const parsedState = parseOAuthState(state);
    if (!parsedState) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=invalid_state`);
    }

    // Check state timestamp
    if (Date.now() - parsedState.timestamp > 10 * 60 * 1000) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=expired`);
    }

    // Get user entry
    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, parsedState.referralCode))
      .limit(1);

    if (entry.length === 0) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=invalid_code`);
    }

    const waitlistEntry = entry[0];

    // Exchange code for token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=token_failed`);
    }

    // Get GitHub user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!userResponse.ok) {
      return res.redirect(`${FRONTEND_URL}/referrals?error=user_fetch_failed`);
    }

    const githubUser = await userResponse.json();

    // Update waitlist entry with GitHub info
    await db
      .update(waitlistEntries)
      .set({
        githubId: githubUser.id.toString(),
        githubUsername: githubUser.login,
        githubConnected: true,
        githubAccessToken: tokens.access_token, // In production, encrypt this
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, waitlistEntry.id));

    // Redirect to success page
    res.redirect(`${FRONTEND_URL}/referrals?github=connected&code=${parsedState.referralCode}`);
  } catch (error) {
    console.error("GitHub OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}/referrals?error=server_error`);
  }
});

/**
 * POST /api/oauth/github/check-contributions
 * Check and verify GitHub contributions (PRs)
 */
router.post("/github/check-contributions", oauthLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ error: "Missing referral code" });
    }

    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const user = entry[0];

    if (!user.githubUsername || !user.githubAccessToken) {
      return res.json({
        hasContributions: false,
        reason: "GitHub not connected",
        contributions: [],
      });
    }

    // Search for PRs by user in cortexlinux repos
    const searchUrl = `https://api.github.com/search/issues?q=author:${user.githubUsername}+org:cortexlinux+is:pr&sort=created&order=desc&per_page=20`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${user.githubAccessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!searchResponse.ok) {
      return res.json({
        hasContributions: false,
        reason: "Failed to fetch contributions",
        contributions: [],
      });
    }

    const searchData = await searchResponse.json();
    const prs = searchData.items || [];

    // Process and store PRs
    const contributions = [];
    let hasMergedPr = false;
    let firstMergedPrUrl = null;
    let firstMergedPrDate = null;

    for (const pr of prs) {
      // Parse repo info from URL
      const urlParts = pr.html_url.split("/");
      const repoOwner = urlParts[3];
      const repoName = urlParts[4];

      // Get PR details including merge status
      const prDetailUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${pr.number}`;
      const prDetailResponse = await fetch(prDetailUrl, {
        headers: {
          Authorization: `Bearer ${user.githubAccessToken}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (prDetailResponse.ok) {
        const prDetail = await prDetailResponse.json();

        // Check if this PR meets minimum requirements
        const meetsRequirements =
          prDetail.merged &&
          prDetail.additions >= VERIFICATION_REQUIREMENTS.minPrAdditions &&
          prDetail.changed_files >= VERIFICATION_REQUIREMENTS.minPrFiles;

        // Store contribution
        const existing = await db
          .select()
          .from(githubContributions)
          .where(
            and(
              eq(githubContributions.waitlistEntryId, user.id),
              eq(githubContributions.prNumber, pr.number),
              eq(githubContributions.repoOwner, repoOwner)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(githubContributions).values({
            waitlistEntryId: user.id,
            prNumber: pr.number,
            prUrl: pr.html_url,
            prTitle: pr.title,
            repoOwner,
            repoName,
            state: prDetail.state,
            isMerged: prDetail.merged,
            mergedAt: prDetail.merged_at ? new Date(prDetail.merged_at) : null,
            isVerified: meetsRequirements,
            verifiedAt: meetsRequirements ? new Date() : null,
            verifiedBy: meetsRequirements ? "auto" : null,
            additions: prDetail.additions,
            deletions: prDetail.deletions,
            changedFiles: prDetail.changed_files,
          });
        }

        contributions.push({
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          state: prDetail.state,
          merged: prDetail.merged,
          mergedAt: prDetail.merged_at,
          additions: prDetail.additions,
          deletions: prDetail.deletions,
          meetsRequirements,
        });

        if (prDetail.merged && meetsRequirements && !hasMergedPr) {
          hasMergedPr = true;
          firstMergedPrUrl = pr.html_url;
          firstMergedPrDate = prDetail.merged_at;
        }
      }
    }

    // Update user if they have a valid merged PR
    if (hasMergedPr && !user.prCompleted) {
      await db
        .update(waitlistEntries)
        .set({
          prCompleted: true,
          prCount: contributions.filter((c) => c.merged && c.meetsRequirements).length,
          firstPrUrl: firstMergedPrUrl,
          firstPrMergedAt: firstMergedPrDate ? new Date(firstMergedPrDate) : null,
          updatedAt: new Date(),
        })
        .where(eq(waitlistEntries.id, user.id));

      // Check if user is now fully verified
      await checkAndUpdateVerification(user.id);
    }

    res.json({
      hasContributions: hasMergedPr,
      prCount: contributions.filter((c) => c.merged && c.meetsRequirements).length,
      contributions,
      requirements: {
        minAdditions: VERIFICATION_REQUIREMENTS.minPrAdditions,
        minFiles: VERIFICATION_REQUIREMENTS.minPrFiles,
      },
    });
  } catch (error) {
    console.error("GitHub contributions check error:", error);
    res.status(500).json({ error: "Failed to check contributions" });
  }
});

/**
 * GET /api/oauth/status/:referralCode
 * Get OAuth connection status for a user
 */
router.get("/status/:referralCode", async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;

    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const user = entry[0];

    res.json({
      discord: {
        connected: user.discordConnected,
        username: user.discordUsername,
        joinedServer: user.discordJoinedServer,
        verified: user.discordConnected && user.discordJoinedServer,
      },
      github: {
        connected: user.githubConnected,
        username: user.githubUsername,
        prCompleted: user.prCompleted,
        prCount: user.prCount,
        firstPrUrl: user.firstPrUrl,
      },
      hackathon: {
        participated: user.hackathonParticipated,
      },
      verification: {
        fullyVerified: user.fullyVerified,
        verifiedAt: user.fullyVerifiedAt,
        requirements: {
          discordRequired: VERIFICATION_REQUIREMENTS.discordRequired,
          contributionRequired: VERIFICATION_REQUIREMENTS.contributionRequired,
          discordComplete: user.discordConnected && user.discordJoinedServer,
          contributionComplete: user.prCompleted || user.hackathonParticipated,
        },
      },
    });
  } catch (error) {
    console.error("OAuth status error:", error);
    res.status(500).json({ error: "Failed to get OAuth status" });
  }
});

export default router;
