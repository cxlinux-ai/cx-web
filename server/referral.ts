/**
 * Viral Referral System - API Routes
 *
 * Handles:
 * - Waitlist signups with referral tracking
 * - Email verification
 * - Referral event tracking (clicks, shares)
 * - Reward progression
 * - Leaderboard
 * - OG image generation
 * - Builder/hackathon referrals
 */

import { Router, type Request, type Response } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { db } from "./db";
import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";
import {
  waitlistEntries,
  referralEvents,
  referralRewards,
  userRewards,
  shareableContent,
  builderReferrals,
  leaderboardSnapshots,
  waitlistSignupSchema,
  referralClickSchema,
  REWARD_TIERS,
  type WaitlistEntry,
  type ReferralEvent,
  hackathonRegistrations,
  ipReferralCodes,
  type IpReferralCode,
  visitorReferrals,
} from "@shared/schema";
import { sendVerificationEmail, sendWelcomeEmail } from "./email";

const router = Router();

// ==========================================
// RATE LIMITERS
// ==========================================

// Signup rate limiter (5 per hour per IP)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many signup attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Click tracking rate limiter (100 per hour per IP)
const clickLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: "Rate limit exceeded." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// IP-based referral code generation limiter (3 per minute per IP)
const generateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3,
  message: { error: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Extract client IP from request headers
 */
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

/**
 * Generate a unique, URL-safe referral code
 * Format: 8 characters alphanumeric (easy to share, type)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars (0,O,1,I,L)
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generate email verification token
 */
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Calculate current position based on original position and referral boosts
 */
function calculatePosition(originalPosition: number, verifiedReferrals: number): number {
  let boost = 0;

  // Apply tier boosts (stackable)
  if (verifiedReferrals >= 1) boost += REWARD_TIERS.bronze.positionBoost;
  if (verifiedReferrals >= 3) boost += REWARD_TIERS.silver.positionBoost;
  // Gold+ tiers have special rewards instead of position boosts

  const newPosition = Math.max(1, originalPosition - boost);
  return newPosition;
}

/**
 * Determine the current tier based on verified referrals
 */
function determineTier(verifiedReferrals: number): string {
  if (verifiedReferrals >= 50) return "legendary";
  if (verifiedReferrals >= 25) return "diamond";
  if (verifiedReferrals >= 10) return "platinum";
  if (verifiedReferrals >= 5) return "gold";
  if (verifiedReferrals >= 3) return "silver";
  if (verifiedReferrals >= 1) return "bronze";
  return "none";
}

/**
 * Obfuscate email for display (j***@gmail.com)
 */
function obfuscateEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const obfuscatedLocal = local.charAt(0) + "***";
  return `${obfuscatedLocal}@${domain}`;
}

/**
 * Get total waitlist count for position calculation
 */
async function getWaitlistCount(): Promise<number> {
  const result = await db.select({ count: count() }).from(waitlistEntries);
  return result[0]?.count || 0;
}

// ==========================================
// IP-BASED REFERRAL CODE GENERATION
// ==========================================

/**
 * POST /api/referral/generate
 * Generate or retrieve a referral code for the current IP address
 * One code per IP - returns existing code if already generated
 */
router.post("/generate", generateLimiter, async (req: Request, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || null;
    const fingerprint = req.body?.fingerprint || null;

    // Check if IP already has a referral code
    const existing = await db
      .select()
      .from(ipReferralCodes)
      .where(eq(ipReferralCodes.ipAddress, clientIp))
      .limit(1);

    if (existing.length > 0) {
      // Update last accessed time
      await db
        .update(ipReferralCodes)
        .set({ lastAccessedAt: new Date() })
        .where(eq(ipReferralCodes.id, existing[0].id));

      return res.json({
        referralCode: existing[0].referralCode,
        totalReferrals: existing[0].totalReferrals || 0,
        clickCount: existing[0].clickCount || 0,
        isNew: false,
      });
    }

    // Generate unique referral code
    let newReferralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const codeExists = await db
        .select()
        .from(ipReferralCodes)
        .where(eq(ipReferralCodes.referralCode, newReferralCode))
        .limit(1);

      if (codeExists.length === 0) break;
      newReferralCode = generateReferralCode();
      attempts++;
    }

    // Create new IP referral code entry
    const [newEntry] = await db
      .insert(ipReferralCodes)
      .values({
        ipAddress: clientIp,
        referralCode: newReferralCode,
        userAgent,
        fingerprint,
      })
      .returning();

    res.json({
      referralCode: newEntry.referralCode,
      totalReferrals: 0,
      clickCount: 0,
      isNew: true,
    });
  } catch (error) {
    console.error("Referral generate error:", error);
    res.status(500).json({ error: "Failed to generate referral code" });
  }
});

/**
 * GET /api/referral/my-link
 * Get referral code and stats for the current IP address
 */
router.get("/my-link", apiLimiter, async (req: Request, res: Response) => {
  try {
    const clientIp = getClientIp(req);

    const existing = await db
      .select()
      .from(ipReferralCodes)
      .where(eq(ipReferralCodes.ipAddress, clientIp))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: "No referral code found for this IP" });
    }

    res.json({
      referralCode: existing[0].referralCode,
      totalReferrals: existing[0].totalReferrals || 0,
      clickCount: existing[0].clickCount || 0,
      createdAt: existing[0].createdAt,
    });
  } catch (error) {
    console.error("My link error:", error);
    res.status(500).json({ error: "Failed to get referral link" });
  }
});

/**
 * GET /api/referral/ip-dashboard
 * Get dashboard data for IP-based referral code (no email required)
 */
router.get("/ip-dashboard", apiLimiter, async (req: Request, res: Response) => {
  try {
    const clientIp = getClientIp(req);

    const existing = await db
      .select()
      .from(ipReferralCodes)
      .where(eq(ipReferralCodes.ipAddress, clientIp))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: "No referral code found for this IP" });
    }

    const ipCode = existing[0];

    // Get click events for this referral code
    const events = await db
      .select()
      .from(referralEvents)
      .where(eq(referralEvents.referralCode, ipCode.referralCode))
      .orderBy(desc(referralEvents.createdAt))
      .limit(50);

    // Calculate stats
    const clickCount = events.filter((e) => e.eventType === "click").length;
    const signupCount = events.filter((e) => e.eventType === "signup").length;
    const shareCount = events.filter((e) => e.eventType === "shared").length;

    // Determine tier based on total referrals
    const totalReferrals = ipCode.totalReferrals || 0;
    const tier = determineTier(totalReferrals);

    // Calculate rewards
    const rewardsUnlocked = [];
    if (totalReferrals >= 1) rewardsUnlocked.push({ tier: "bronze", reward: "+100 spots", unlocked: true });
    if (totalReferrals >= 3) rewardsUnlocked.push({ tier: "silver", reward: "+500 spots", unlocked: true });
    if (totalReferrals >= 5) rewardsUnlocked.push({ tier: "gold", reward: "Discord Role", unlocked: true });
    if (totalReferrals >= 10) rewardsUnlocked.push({ tier: "platinum", reward: "1 Free Pro Month", unlocked: true });
    if (totalReferrals >= 25) rewardsUnlocked.push({ tier: "diamond", reward: "Founding Badge", unlocked: true });
    if (totalReferrals >= 50) rewardsUnlocked.push({ tier: "legendary", reward: "Hackathon Fast-Track", unlocked: true });

    // Next reward
    const nextReward = totalReferrals < 1
      ? { tier: "bronze", referralsNeeded: 1 - totalReferrals, reward: "+100 spots" }
      : totalReferrals < 3
        ? { tier: "silver", referralsNeeded: 3 - totalReferrals, reward: "+500 spots" }
        : totalReferrals < 5
          ? { tier: "gold", referralsNeeded: 5 - totalReferrals, reward: "Discord Role" }
          : totalReferrals < 10
            ? { tier: "platinum", referralsNeeded: 10 - totalReferrals, reward: "1 Free Pro Month" }
            : totalReferrals < 25
              ? { tier: "diamond", referralsNeeded: 25 - totalReferrals, reward: "Founding Badge" }
              : totalReferrals < 50
                ? { tier: "legendary", referralsNeeded: 50 - totalReferrals, reward: "Hackathon Fast-Track" }
                : null;

    res.json({
      referralCode: ipCode.referralCode,
      referralLink: `https://cortexlinux.com/referrals?ref=${ipCode.referralCode}`,
      currentTier: tier,
      stats: {
        totalReferrals: totalReferrals,
        clicks: ipCode.clickCount || clickCount,
        shares: shareCount,
        signups: signupCount,
      },
      rewards: {
        unlocked: rewardsUnlocked,
        next: nextReward,
      },
      createdAt: ipCode.createdAt,
    });
  } catch (error) {
    console.error("IP dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// ==========================================
// WAITLIST SIGNUP
// ==========================================

/**
 * POST /api/referral/signup
 * Join the waitlist with optional referral code
 */
router.post("/signup", signupLimiter, async (req: Request, res: Response) => {
  try {
    const validation = waitlistSignupSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid signup data",
        details: validation.error.flatten(),
      });
    }

    const { email, referralCode, githubUsername, twitterUsername } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if already registered
    const existing = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return res.status(200).json({
        message: "You're already on the waitlist! Check your email for your referral link.",
        alreadyRegistered: true,
        referralCode: existing[0].referralCode,
        position: existing[0].currentPosition,
        emailVerified: existing[0].emailVerified,
      });
    }

    // Validate referral code if provided
    let referrerEntry: WaitlistEntry | null = null;
    if (referralCode) {
      const referrer = await db
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
        .limit(1);

      if (referrer.length > 0) {
        referrerEntry = referrer[0];
      }
    }

    // Generate unique referral code
    let newReferralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const codeExists = await db
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.referralCode, newReferralCode))
        .limit(1);

      if (codeExists.length === 0) break;
      newReferralCode = generateReferralCode();
      attempts++;
    }

    // Calculate position (end of current list)
    const totalCount = await getWaitlistCount();
    const position = totalCount + 1;

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create waitlist entry
    const [newEntry] = await db
      .insert(waitlistEntries)
      .values({
        email: normalizedEmail,
        referralCode: newReferralCode,
        referredByCode: referrerEntry?.referralCode || null,
        originalPosition: position,
        currentPosition: position,
        verificationToken,
        verificationExpires,
        githubUsername: githubUsername || null,
        twitterUsername: twitterUsername || null,
        githubConnected: !!githubUsername,
        twitterConnected: !!twitterUsername,
      })
      .returning();

    // Track referral event if referred
    if (referrerEntry) {
      await db.insert(referralEvents).values({
        referralCode: referrerEntry.referralCode,
        eventType: "signup",
        source: req.body.source || "direct",
        referredEmail: normalizedEmail,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
        convertedToSignup: true,
      });

      // Update referrer's total referrals (not verified yet)
      await db
        .update(waitlistEntries)
        .set({
          totalReferrals: sql`${waitlistEntries.totalReferrals} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(waitlistEntries.id, referrerEntry.id));
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(normalizedEmail, verificationToken);
    if (!emailSent) {
      console.error(`Failed to send verification email to ${normalizedEmail}`);
    }

    res.status(201).json({
      message: "Successfully joined waitlist! Check your email to verify.",
      referralCode: newReferralCode,
      position: position,
      totalWaitlist: totalCount + 1,
      verificationRequired: true,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to join waitlist. Please try again." });
  }
});

// ==========================================
// EMAIL VERIFICATION
// ==========================================

/**
 * GET /api/referral/verify
 * Verify email address
 */
router.get("/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.verificationToken, token))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid or expired verification link" });
    }

    const waitlistEntry = entry[0];

    if (waitlistEntry.emailVerified) {
      return res.status(200).json({ message: "Email already verified", referralCode: waitlistEntry.referralCode });
    }

    if (waitlistEntry.verificationExpires && new Date(waitlistEntry.verificationExpires) < new Date()) {
      return res.status(400).json({ error: "Verification link has expired. Please request a new one." });
    }

    // Mark as verified
    await db
      .update(waitlistEntries)
      .set({
        emailVerified: true,
        verificationToken: null,
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, waitlistEntry.id));

    // Send welcome email
    const welcomeEmailSent = await sendWelcomeEmail(waitlistEntry.email, waitlistEntry.referralCode);
    if (!welcomeEmailSent) {
      console.error(`Failed to send welcome email to ${waitlistEntry.email}`);
    }

    // If referred, update referrer's verified referrals and position
    if (waitlistEntry.referredByCode) {
      const referrer = await db
        .select()
        .from(waitlistEntries)
        .where(eq(waitlistEntries.referralCode, waitlistEntry.referredByCode))
        .limit(1);

      if (referrer.length > 0) {
        const newVerifiedCount = (referrer[0].verifiedReferrals || 0) + 1;
        const newPosition = calculatePosition(referrer[0].originalPosition, newVerifiedCount);
        const newTier = determineTier(newVerifiedCount);

        await db
          .update(waitlistEntries)
          .set({
            verifiedReferrals: newVerifiedCount,
            currentPosition: newPosition,
            currentTier: newTier,
            updatedAt: new Date(),
          })
          .where(eq(waitlistEntries.id, referrer[0].id));

        // Update the referral event to mark as verified
        await db
          .update(referralEvents)
          .set({ convertedToVerified: true })
          .where(
            and(
              eq(referralEvents.referralCode, waitlistEntry.referredByCode),
              eq(referralEvents.referredEmail, waitlistEntry.email)
            )
          );
      }
    }

    // Redirect to success page or return JSON
    res.json({
      message: "Email verified successfully!",
      referralCode: waitlistEntry.referralCode,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
});

// ==========================================
// REFERRAL TRACKING
// ==========================================

/**
 * POST /api/referral/click
 * Track referral link click
 */
router.post("/click", clickLimiter, async (req: Request, res: Response) => {
  try {
    const validation = referralClickSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const { referralCode, source } = validation.data;
    const upperCode = referralCode.toUpperCase();

    // Check IP-based referral codes first
    const ipEntry = await db
      .select()
      .from(ipReferralCodes)
      .where(eq(ipReferralCodes.referralCode, upperCode))
      .limit(1);

    if (ipEntry.length > 0) {
      // Increment click count for IP-based referral
      await db
        .update(ipReferralCodes)
        .set({
          clickCount: sql`${ipReferralCodes.clickCount} + 1`,
          lastAccessedAt: new Date(),
        })
        .where(eq(ipReferralCodes.id, ipEntry[0].id));

      // Track click event
      await db.insert(referralEvents).values({
        referralCode: upperCode,
        eventType: "click",
        source: source || "direct",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"] || null,
      });

      return res.json({ success: true });
    }

    // Fallback: Check waitlist entries
    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, upperCode))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    // Track click event
    await db.insert(referralEvents).values({
      referralCode: upperCode,
      eventType: "click",
      source: source || "direct",
      ipAddress: getClientIp(req),
      userAgent: req.headers["user-agent"] || null,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// ==========================================
// VISITOR REFERRAL TRACKING
// ==========================================

/**
 * POST /api/referral/track-visitor
 * Track when a visitor arrives via a referral link
 * Stores IP -> referral code mapping for later attribution
 */
router.post("/track-visitor", clickLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode, source, landingPage } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ error: "Referral code required" });
    }
    
    const upperCode = referralCode.toUpperCase();
    const clientIp = getClientIp(req);
    const userAgent = req.headers["user-agent"] || null;
    
    // Verify the referral code exists (either in ipReferralCodes or waitlistEntries)
    const ipCodeExists = await db
      .select()
      .from(ipReferralCodes)
      .where(eq(ipReferralCodes.referralCode, upperCode))
      .limit(1);
    
    const waitlistCodeExists = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, upperCode))
      .limit(1);
    
    if (ipCodeExists.length === 0 && waitlistCodeExists.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }
    
    // Check if this IP already has a recent visitor referral (within 30 days)
    const existingVisitor = await db
      .select()
      .from(visitorReferrals)
      .where(eq(visitorReferrals.visitorIp, clientIp))
      .limit(1);
    
    if (existingVisitor.length > 0) {
      // Update existing entry with latest referral code (last referral wins)
      await db
        .update(visitorReferrals)
        .set({
          referralCode: upperCode,
          source: source || existingVisitor[0].source,
          landingPage: landingPage || existingVisitor[0].landingPage,
          userAgent,
        })
        .where(eq(visitorReferrals.id, existingVisitor[0].id));
      
      return res.json({ success: true, updated: true });
    }
    
    // Create new visitor referral tracking entry
    await db.insert(visitorReferrals).values({
      visitorIp: clientIp,
      referralCode: upperCode,
      source: source || "direct",
      userAgent,
      landingPage: landingPage || "/",
    });
    
    res.json({ success: true, created: true });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    res.status(500).json({ error: "Failed to track visitor" });
  }
});

/**
 * GET /api/referral/check-visitor
 * Check if current IP has a stored referral attribution
 */
router.get("/check-visitor", apiLimiter, async (req: Request, res: Response) => {
  try {
    const clientIp = getClientIp(req);
    
    const visitor = await db
      .select()
      .from(visitorReferrals)
      .where(eq(visitorReferrals.visitorIp, clientIp))
      .limit(1);
    
    if (visitor.length === 0) {
      return res.json({ hasReferral: false });
    }
    
    res.json({
      hasReferral: true,
      referralCode: visitor[0].referralCode,
      source: visitor[0].source,
      createdAt: visitor[0].createdAt,
    });
  } catch (error) {
    console.error("Check visitor error:", error);
    res.status(500).json({ error: "Failed to check visitor" });
  }
});

// ==========================================
// DASHBOARD DATA
// ==========================================

/**
 * GET /api/referral/dashboard/:referralCode
 * Get dashboard data for a user
 */
router.get("/dashboard/:referralCode", apiLimiter, async (req: Request, res: Response) => {
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

    // Get referral events for this user
    const events = await db
      .select()
      .from(referralEvents)
      .where(eq(referralEvents.referralCode, user.referralCode))
      .orderBy(desc(referralEvents.createdAt))
      .limit(50);

    // Get total waitlist count for context
    const totalWaitlist = await getWaitlistCount();

    // Get referred users (obfuscated)
    const referredUsers = events
      .filter((e) => e.eventType === "signup" && e.referredEmail)
      .map((e) => ({
        email: obfuscateEmail(e.referredEmail!),
        source: e.source,
        verified: e.convertedToVerified,
        date: e.createdAt,
      }));

    // Calculate stats
    const clickCount = events.filter((e) => e.eventType === "click").length;

    // Determine rewards unlocked
    const rewardsUnlocked = [];
    const verifiedReferrals = user.verifiedReferrals || 0;

    if (verifiedReferrals >= 1) rewardsUnlocked.push({ tier: "bronze", reward: "+100 spots", unlocked: true });
    if (verifiedReferrals >= 3) rewardsUnlocked.push({ tier: "silver", reward: "+500 spots", unlocked: true });
    if (verifiedReferrals >= 5) rewardsUnlocked.push({ tier: "gold", reward: "Discord Role", unlocked: true });
    if (verifiedReferrals >= 10) rewardsUnlocked.push({ tier: "platinum", reward: "1 Free Pro Month", unlocked: true });
    if (verifiedReferrals >= 25) rewardsUnlocked.push({ tier: "diamond", reward: "Founding Badge", unlocked: true });
    if (verifiedReferrals >= 50) rewardsUnlocked.push({ tier: "legendary", reward: "Hackathon Fast-Track", unlocked: true });

    // Next reward
    const nextReward = verifiedReferrals < 1
      ? { tier: "bronze", referralsNeeded: 1 - verifiedReferrals, reward: "+100 spots" }
      : verifiedReferrals < 3
        ? { tier: "silver", referralsNeeded: 3 - verifiedReferrals, reward: "+500 spots" }
        : verifiedReferrals < 5
          ? { tier: "gold", referralsNeeded: 5 - verifiedReferrals, reward: "Discord Role" }
          : verifiedReferrals < 10
            ? { tier: "platinum", referralsNeeded: 10 - verifiedReferrals, reward: "1 Free Pro Month" }
            : verifiedReferrals < 25
              ? { tier: "diamond", referralsNeeded: 25 - verifiedReferrals, reward: "Founding Badge" }
              : verifiedReferrals < 50
                ? { tier: "legendary", referralsNeeded: 50 - verifiedReferrals, reward: "Hackathon Fast-Track" }
                : null;

    res.json({
      user: {
        email: obfuscateEmail(user.email),
        referralCode: user.referralCode,
        emailVerified: user.emailVerified,
        currentPosition: user.currentPosition,
        originalPosition: user.originalPosition,
        positionGain: user.originalPosition - user.currentPosition,
        currentTier: user.currentTier,
        githubConnected: user.githubConnected,
        twitterConnected: user.twitterConnected,
        createdAt: user.createdAt,
      },
      stats: {
        totalReferrals: user.totalReferrals || 0,
        verifiedReferrals: user.verifiedReferrals || 0,
        pendingReferrals: (user.totalReferrals || 0) - (user.verifiedReferrals || 0),
        clicks: clickCount,
      },
      referrals: referredUsers,
      rewards: {
        unlocked: rewardsUnlocked,
        next: nextReward,
      },
      waitlist: {
        total: totalWaitlist,
        estimatedAccessDate: null, // Could calculate based on position and launch date
      },
      referralLink: `https://cortexlinux.com/join?ref=${user.referralCode}`,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// ==========================================
// LEADERBOARD
// ==========================================

/**
 * GET /api/referral/leaderboard
 * Get top referrers (anonymized by default)
 */
router.get("/leaderboard", apiLimiter, async (req: Request, res: Response) => {
  try {
    const { type = "all_time", limit = 100 } = req.query;

    let dateFilter: Date | null = null;
    if (type === "weekly") {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (type === "monthly") {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const query = db
      .select({
        referralCode: waitlistEntries.referralCode,
        verifiedReferrals: waitlistEntries.verifiedReferrals,
        currentTier: waitlistEntries.currentTier,
        githubUsername: waitlistEntries.githubUsername,
        createdAt: waitlistEntries.createdAt,
      })
      .from(waitlistEntries)
      .where(sql`${waitlistEntries.verifiedReferrals} > 0`)
      .orderBy(desc(waitlistEntries.verifiedReferrals))
      .limit(Number(limit));

    const topReferrers = await query;

    const leaderboard = topReferrers.map((entry, index) => ({
      rank: index + 1,
      displayName: entry.githubUsername || `Referrer #${entry.referralCode.slice(0, 4)}`,
      referrals: entry.verifiedReferrals,
      tier: entry.currentTier,
      isAnonymous: !entry.githubUsername,
    }));

    res.json({
      type,
      entries: leaderboard,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to load leaderboard" });
  }
});

// ==========================================
// SHAREABLE CONTENT
// ==========================================

/**
 * POST /api/referral/share
 * Track a share action
 */
router.post("/share", apiLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode, platform, contentType } = req.body;

    if (!referralCode || !platform) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Track share event
    await db.insert(referralEvents).values({
      referralCode: referralCode.toUpperCase(),
      eventType: "shared",
      source: platform,
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    // Generate pre-filled share content
    const shareContent = {
      twitter: {
        text: `Just joined the Cortex Linux early access.\nAI that actually understands Linux.\nJoin me 👇`,
        url: `https://cortexlinux.com/join?ref=${referralCode}&utm_source=twitter`,
        hashtags: "CortexLinux,AI,Linux",
      },
      linkedin: {
        title: "Get Early Access to Cortex Linux",
        text: "I just joined the waitlist for Cortex Linux - an AI-powered tool that lets you manage Linux with natural language commands. Check it out!",
        url: `https://cortexlinux.com/join?ref=${referralCode}&utm_source=linkedin`,
      },
      email: {
        subject: "Check out Cortex Linux - AI for Linux",
        body: `Hey!\n\nI thought you might be interested in Cortex Linux - it's an AI tool that lets you manage Linux with natural language.\n\nInstead of memorizing commands, you just describe what you want to do.\n\nJoin the waitlist here: https://cortexlinux.com/join?ref=${referralCode}&utm_source=email`,
      },
    };

    res.json({
      success: true,
      shareContent: shareContent[platform as keyof typeof shareContent] || shareContent.twitter,
    });
  } catch (error) {
    console.error("Share tracking error:", error);
    res.status(500).json({ error: "Failed to track share" });
  }
});

/**
 * GET /api/referral/og-image/:referralCode
 * Generate OG image data for social sharing
 */
router.get("/og-image/:referralCode", async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;
    const { type = "waitlist" } = req.query;

    const entry = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (entry.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const user = entry[0];
    const totalWaitlist = await getWaitlistCount();

    // Return data for OG image generation
    // In production, this would generate an actual image using canvas/sharp/puppeteer
    res.json({
      type,
      data: {
        position: user.currentPosition,
        totalWaitlist,
        tier: user.currentTier,
        referralCode: user.referralCode,
        referrals: user.verifiedReferrals,
      },
      // Placeholder URL - in production, generate and host the image
      imageUrl: `https://cortexlinux.com/og/${referralCode}.png`,
    });
  } catch (error) {
    console.error("OG image error:", error);
    res.status(500).json({ error: "Failed to generate OG image data" });
  }
});

// ==========================================
// BUILDER/HACKATHON REFERRALS
// ==========================================

/**
 * POST /api/referral/invite-builder
 * Invite a builder to the hackathon
 */
router.post("/invite-builder", apiLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode, builderEmail, builderName } = req.body;

    if (!referralCode || !builderEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find referrer
    const referrer = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (referrer.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    // Check if builder already invited
    const existingInvite = await db
      .select()
      .from(builderReferrals)
      .where(
        and(
          eq(builderReferrals.referrerWaitlistId, referrer[0].id),
          eq(builderReferrals.builderEmail, builderEmail.toLowerCase())
        )
      )
      .limit(1);

    if (existingInvite.length > 0) {
      return res.status(200).json({
        message: "Builder already invited",
        status: existingInvite[0].status,
      });
    }

    // Create builder referral
    const [invite] = await db
      .insert(builderReferrals)
      .values({
        referrerWaitlistId: referrer[0].id,
        builderEmail: builderEmail.toLowerCase(),
        builderName: builderName || null,
      })
      .returning();

    // TODO: Send email invitation
    console.log(`Builder invite sent to ${builderEmail}`);

    res.status(201).json({
      message: "Builder invited successfully",
      inviteId: invite.id,
    });
  } catch (error) {
    console.error("Builder invite error:", error);
    res.status(500).json({ error: "Failed to invite builder" });
  }
});

/**
 * GET /api/referral/builder-stats/:referralCode
 * Get hackathon referral stats for a user
 */
router.get("/builder-stats/:referralCode", apiLimiter, async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;

    const referrer = await db
      .select()
      .from(waitlistEntries)
      .where(eq(waitlistEntries.referralCode, referralCode.toUpperCase()))
      .limit(1);

    if (referrer.length === 0) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    const invites = await db
      .select()
      .from(builderReferrals)
      .where(eq(builderReferrals.referrerWaitlistId, referrer[0].id));

    const stats = {
      totalInvited: invites.length,
      registered: invites.filter((i) => i.status === "registered").length,
      submitted: invites.filter((i) => i.projectSubmitted).length,
      invites: invites.map((i) => ({
        email: obfuscateEmail(i.builderEmail),
        name: i.builderName,
        status: i.status,
        teamName: i.teamName,
        projectSubmitted: i.projectSubmitted,
      })),
    };

    // Calculate hackathon rewards
    const hackathonRewards = [];
    if (stats.registered >= 3) hackathonRewards.push("Priority Review");
    if (stats.submitted >= 1) hackathonRewards.push("Jury Visibility Boost");
    if (stats.totalInvited >= 10) hackathonRewards.push("Top Referrer Badge");

    res.json({
      stats,
      rewards: hackathonRewards,
    });
  } catch (error) {
    console.error("Builder stats error:", error);
    res.status(500).json({ error: "Failed to load builder stats" });
  }
});

// ==========================================
// GITHUB BADGE
// ==========================================

/**
 * GET /api/referral/badge/:referralCode
 * Generate GitHub badge SVG/markdown
 */
router.get("/badge/:referralCode", async (req: Request, res: Response) => {
  try {
    const { referralCode } = req.params;
    const { format = "markdown" } = req.query;

    // Track badge impression
    await db.insert(referralEvents).values({
      referralCode: referralCode.toUpperCase(),
      eventType: "badge_view",
      source: "github_badge",
      ipAddress: req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    });

    const badgeUrl = `https://img.shields.io/badge/Powered%20by-Cortex%20Linux-blue?style=flat-square`;
    const linkUrl = `https://cortexlinux.com/join?ref=${referralCode}&utm_source=github_badge`;

    if (format === "svg") {
      // Return SVG badge
      res.redirect(badgeUrl);
    } else {
      // Return markdown
      res.json({
        markdown: `[![Powered by Cortex Linux](${badgeUrl})](${linkUrl})`,
        html: `<a href="${linkUrl}"><img src="${badgeUrl}" alt="Powered by Cortex Linux" /></a>`,
        url: linkUrl,
      });
    }
  } catch (error) {
    console.error("Badge error:", error);
    res.status(500).json({ error: "Failed to generate badge" });
  }
});

// ==========================================
// ADMIN/STATS ENDPOINTS
// ==========================================

/**
 * GET /api/referral/stats
 * Get overall referral program stats (public subset)
 */
router.get("/stats", apiLimiter, async (req: Request, res: Response) => {
  try {
    const totalWaitlist = await getWaitlistCount();

    const verifiedCount = await db
      .select({ count: count() })
      .from(waitlistEntries)
      .where(eq(waitlistEntries.emailVerified, true));

    const totalReferrals = await db
      .select({ total: sql<number>`SUM(${waitlistEntries.verifiedReferrals})` })
      .from(waitlistEntries);

    res.json({
      totalWaitlist,
      verifiedUsers: verifiedCount[0]?.count || 0,
      totalReferrals: totalReferrals[0]?.total || 0,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

export default router;