import { Router, Request, Response } from "express";
import { db } from "./db";
import { eq, and, gte, sql } from "drizzle-orm";
import {
  referrers,
  referrals,
  referralRewards,
  REFERRAL_CONFIG,
} from "@shared/schema";
import { z } from "zod";

const router = Router();

// =============================================================================
// REFERRAL CONFIGURATION (HARD-CODED - DO NOT CHANGE WITHOUT APPROVAL)
// =============================================================================
// - 10% reward on referred customer payments
// - 36-month expiration (NOT lifetime) - This is a HARD LIMIT
// - Minimum $50 payout threshold
// =============================================================================

// =============================================================================
// CREATE REFERRER (Sign up for referral program)
// =============================================================================

const createReferrerSchema = z.object({
  email: z.string().email(),
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const result = createReferrerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: result.error.flatten(),
      });
    }

    const { email } = result.data;

    // Check if already registered
    const [existing] = await db
      .select()
      .from(referrers)
      .where(eq(referrers.email, email))
      .limit(1);

    if (existing) {
      return res.json({
        success: true,
        message: "Already registered",
        referralCode: existing.referralCode,
        referralLink: `https://cxlinux.ai/pricing?ref=${existing.referralCode}`,
      });
    }

    // Create new referrer
    const [referrer] = await db
      .insert(referrers)
      .values({ email })
      .returning();

    console.log(`New referrer registered: ${email} with code ${referrer.referralCode}`);

    res.status(201).json({
      success: true,
      message: "Registered for referral program",
      referralCode: referrer.referralCode,
      referralLink: `https://cxlinux.ai/pricing?ref=${referrer.referralCode}`,
      config: {
        rewardPercentage: REFERRAL_CONFIG.rewardPercentage,
        expirationMonths: REFERRAL_CONFIG.expirationMonths,
        minPayoutAmount: REFERRAL_CONFIG.minPayoutAmount,
      },
    });
  } catch (error) {
    console.error("Referrer registration error:", error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
});

// =============================================================================
// TRACK REFERRAL (When someone visits with a referral code)
// =============================================================================

const trackReferralSchema = z.object({
  referralCode: z.string().min(1),
  email: z.string().email(),
});

router.post("/track", async (req: Request, res: Response) => {
  try {
    const result = trackReferralSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: result.error.flatten(),
      });
    }

    const { referralCode, email } = result.data;

    // Find the referrer
    const [referrer] = await db
      .select()
      .from(referrers)
      .where(eq(referrers.referralCode, referralCode))
      .limit(1);

    if (!referrer) {
      return res.status(404).json({
        success: false,
        error: "Invalid referral code",
      });
    }

    if (referrer.status !== "active") {
      return res.status(403).json({
        success: false,
        error: "Referral code is no longer active",
      });
    }

    // Check if this email is already referred
    const [existingReferral] = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referredEmail, email))
      .limit(1);

    if (existingReferral) {
      return res.json({
        success: true,
        message: "Referral already tracked",
        referralId: existingReferral.id,
      });
    }

    // Calculate expiration date (36 months from now - HARD LIMIT)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + REFERRAL_CONFIG.expirationMonths);

    // Create referral record
    const [referral] = await db
      .insert(referrals)
      .values({
        referrerId: referrer.id,
        referredEmail: email,
        expiresAt,
        status: "pending",
      })
      .returning();

    console.log(`Referral tracked: ${email} referred by ${referrer.email} (expires ${expiresAt.toISOString()})`);

    res.status(201).json({
      success: true,
      message: "Referral tracked",
      referralId: referral.id,
      expiresAt: referral.expiresAt,
    });
  } catch (error) {
    console.error("Track referral error:", error);
    res.status(500).json({ success: false, error: "Failed to track referral" });
  }
});

// =============================================================================
// GET REFERRER STATS (Dashboard)
// =============================================================================

router.get("/stats/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    // Find referrer
    const [referrer] = await db
      .select()
      .from(referrers)
      .where(eq(referrers.email, email))
      .limit(1);

    if (!referrer) {
      return res.status(404).json({ error: "Referrer not found" });
    }

    // Get all referrals
    const allReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrer.id));

    // Get all rewards
    const allRewards = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.referrerId, referrer.id));

    const activeReferrals = allReferrals.filter(
      (r) => r.status === "active" && new Date(r.expiresAt) > new Date()
    );
    const pendingReferrals = allReferrals.filter((r) => r.status === "pending");
    const expiredReferrals = allReferrals.filter(
      (r) => r.status === "expired" || new Date(r.expiresAt) <= new Date()
    );

    res.json({
      referralCode: referrer.referralCode,
      referralLink: `https://cxlinux.ai/pricing?ref=${referrer.referralCode}`,
      totalEarnings: referrer.totalEarnings / 100, // Convert cents to dollars
      pendingPayout: referrer.pendingPayout / 100,
      minPayoutAmount: REFERRAL_CONFIG.minPayoutAmount,
      canRequestPayout: referrer.pendingPayout >= REFERRAL_CONFIG.minPayoutAmount * 100,
      stats: {
        totalReferrals: allReferrals.length,
        activeReferrals: activeReferrals.length,
        pendingReferrals: pendingReferrals.length,
        expiredReferrals: expiredReferrals.length,
        totalRewards: allRewards.length,
      },
      config: {
        rewardPercentage: REFERRAL_CONFIG.rewardPercentage,
        expirationMonths: REFERRAL_CONFIG.expirationMonths,
      },
      referrals: allReferrals.map((r) => ({
        id: r.id,
        email: r.referredEmail.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email
        status: r.status,
        createdAt: r.createdAt,
        expiresAt: r.expiresAt,
        convertedAt: r.convertedAt,
        isExpired: new Date(r.expiresAt) <= new Date(),
      })),
    });
  } catch (error) {
    console.error("Get referrer stats error:", error);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

// =============================================================================
// HELPER: Process Referral Reward (Called by Stripe webhook on invoice.paid)
// =============================================================================

export async function processReferralReward(
  customerEmail: string,
  stripeCustomerId: string,
  stripeInvoiceId: string,
  invoiceAmount: number // In cents
): Promise<void> {
  try {
    // Find active referral for this customer
    const [referral] = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referredEmail, customerEmail),
          eq(referrals.status, "active"),
          gte(referrals.expiresAt, new Date()) // Not expired (36-month limit)
        )
      )
      .limit(1);

    if (!referral) {
      console.log(`No active referral found for ${customerEmail}`);
      return;
    }

    // Check if reward already processed for this invoice
    const [existingReward] = await db
      .select()
      .from(referralRewards)
      .where(eq(referralRewards.stripeInvoiceId, stripeInvoiceId))
      .limit(1);

    if (existingReward) {
      console.log(`Reward already processed for invoice ${stripeInvoiceId}`);
      return;
    }

    // Calculate reward (10% of invoice)
    const rewardAmount = Math.floor(invoiceAmount * (REFERRAL_CONFIG.rewardPercentage / 100));

    // Create reward record
    await db.insert(referralRewards).values({
      referralId: referral.id,
      referrerId: referral.referrerId,
      stripeInvoiceId,
      invoiceAmount,
      rewardAmount,
      status: "pending",
    });

    // Update referrer's pending payout
    await db
      .update(referrers)
      .set({
        pendingPayout: sql`${referrers.pendingPayout} + ${rewardAmount}`,
        totalEarnings: sql`${referrers.totalEarnings} + ${rewardAmount}`,
      })
      .where(eq(referrers.id, referral.referrerId));

    console.log(
      `Referral reward processed: $${rewardAmount / 100} for referrer ${referral.referrerId} (invoice ${stripeInvoiceId})`
    );
  } catch (error) {
    console.error("Process referral reward error:", error);
  }
}

// =============================================================================
// HELPER: Convert Referral (Called when referred user subscribes)
// =============================================================================

export async function convertReferral(
  customerEmail: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string
): Promise<void> {
  try {
    // Find pending referral
    const [referral] = await db
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.referredEmail, customerEmail),
          eq(referrals.status, "pending")
        )
      )
      .limit(1);

    if (!referral) {
      console.log(`No pending referral found for ${customerEmail}`);
      return;
    }

    // Check if referral has expired (36-month limit)
    if (new Date(referral.expiresAt) <= new Date()) {
      await db
        .update(referrals)
        .set({ status: "expired" })
        .where(eq(referrals.id, referral.id));
      console.log(`Referral expired for ${customerEmail}`);
      return;
    }

    // Update referral to active
    await db
      .update(referrals)
      .set({
        status: "active",
        referredCustomerId: stripeCustomerId,
        stripeSubscriptionId,
        convertedAt: new Date(),
      })
      .where(eq(referrals.id, referral.id));

    console.log(`Referral converted: ${customerEmail} is now an active referred customer`);
  } catch (error) {
    console.error("Convert referral error:", error);
  }
}

// =============================================================================
// HELPER: Expire Old Referrals (Run periodically)
// =============================================================================

export async function expireOldReferrals(): Promise<number> {
  try {
    const result = await db
      .update(referrals)
      .set({ status: "expired" })
      .where(
        and(
          eq(referrals.status, "active"),
          sql`${referrals.expiresAt} <= NOW()`
        )
      );

    const expiredCount = (result as any).rowCount || 0;
    if (expiredCount > 0) {
      console.log(`Expired ${expiredCount} referrals that exceeded 36-month limit`);
    }
    return expiredCount;
  } catch (error) {
    console.error("Expire old referrals error:", error);
    return 0;
  }
}

export default router;
