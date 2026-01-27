import { Router, Request, Response } from "express";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { licenses, activations, PLAN_LIMITS } from "@shared/schema";
import { z } from "zod";

const router = Router();

// =============================================================================
// LICENSE VALIDATION ENDPOINT
// =============================================================================

const validateLicenseSchema = z.object({
  license_key: z.string().uuid(),
  machine_id: z.string().min(1),
});

router.post("/validate", async (req: Request, res: Response) => {
  try {
    const result = validateLicenseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        valid: false,
        error: "Invalid request",
        details: result.error.flatten()
      });
    }

    const { license_key, machine_id } = result.data;

    // Find the license
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, license_key))
      .limit(1);

    if (!license) {
      return res.status(404).json({
        valid: false,
        error: "License not found"
      });
    }

    // Check if license is active
    if (license.status !== "active") {
      return res.status(403).json({
        valid: false,
        error: `License is ${license.status}`,
        status: license.status
      });
    }

    // Check if license has expired
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return res.status(403).json({
        valid: false,
        error: "License has expired",
        expires_at: license.expiresAt
      });
    }

    // Get current activations count
    const existingActivations = await db
      .select()
      .from(activations)
      .where(eq(activations.licenseId, license.id));

    // Check if this machine is already activated
    const existingMachine = existingActivations.find(a => a.machineId === machine_id);

    // Calculate remaining activations
    const activeCount = existingActivations.length;
    const remainingActivations = existingMachine
      ? license.maxSystems - activeCount
      : license.maxSystems - activeCount - 1;

    // If machine already activated, update last_seen
    if (existingMachine) {
      await db
        .update(activations)
        .set({ lastSeen: new Date() })
        .where(eq(activations.id, existingMachine.id));
    }

    res.json({
      valid: true,
      plan: license.plan,
      max_systems: license.maxSystems,
      active_systems: activeCount,
      remaining_activations: Math.max(0, remainingActivations),
      is_activated: !!existingMachine,
      expires_at: license.expiresAt,
    });
  } catch (error) {
    console.error("License validation error:", error);
    res.status(500).json({ valid: false, error: "Validation failed" });
  }
});

// =============================================================================
// LICENSE ACTIVATION ENDPOINT
// =============================================================================

const activateLicenseSchema = z.object({
  license_key: z.string().uuid(),
  machine_id: z.string().min(1),
  hostname: z.string().optional(),
});

router.post("/activate", async (req: Request, res: Response) => {
  try {
    const result = activateLicenseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: result.error.flatten()
      });
    }

    const { license_key, machine_id, hostname } = result.data;

    // Find the license
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, license_key))
      .limit(1);

    if (!license) {
      return res.status(404).json({
        success: false,
        error: "License not found"
      });
    }

    // Check if license is active
    if (license.status !== "active") {
      return res.status(403).json({
        success: false,
        error: `License is ${license.status}`
      });
    }

    // Check if license has expired
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
      return res.status(403).json({
        success: false,
        error: "License has expired"
      });
    }

    // Check if this machine is already activated
    const [existingActivation] = await db
      .select()
      .from(activations)
      .where(
        and(
          eq(activations.licenseId, license.id),
          eq(activations.machineId, machine_id)
        )
      )
      .limit(1);

    if (existingActivation) {
      // Update last_seen and hostname
      await db
        .update(activations)
        .set({
          lastSeen: new Date(),
          hostname: hostname || existingActivation.hostname,
        })
        .where(eq(activations.id, existingActivation.id));

      return res.json({
        success: true,
        activation_id: existingActivation.id,
        message: "Machine already activated, updated last seen",
      });
    }

    // Get current activation count
    const currentActivations = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(activations)
      .where(eq(activations.licenseId, license.id));

    const activeCount = Number(currentActivations[0]?.count) || 0;

    // Check if we can add more activations
    if (activeCount >= license.maxSystems) {
      return res.status(403).json({
        success: false,
        error: "Maximum activations reached",
        max_systems: license.maxSystems,
        active_systems: activeCount,
      });
    }

    // Create new activation
    const [newActivation] = await db
      .insert(activations)
      .values({
        licenseId: license.id,
        machineId: machine_id,
        hostname: hostname || null,
      })
      .returning();

    console.log(`License activated: ${license_key} on machine ${machine_id}`);

    res.status(201).json({
      success: true,
      activation_id: newActivation.id,
      message: "License activated successfully",
      remaining_activations: license.maxSystems - activeCount - 1,
    });
  } catch (error) {
    console.error("License activation error:", error);
    res.status(500).json({ success: false, error: "Activation failed" });
  }
});

// =============================================================================
// LICENSE STATUS ENDPOINT
// =============================================================================

router.get("/status/:key", async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(key)) {
      return res.status(400).json({ error: "Invalid license key format" });
    }

    // Find the license
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, key))
      .limit(1);

    if (!license) {
      return res.status(404).json({ error: "License not found" });
    }

    // Get all activations for this license
    const licenseActivations = await db
      .select()
      .from(activations)
      .where(eq(activations.licenseId, license.id));

    res.json({
      plan: license.plan,
      status: license.status,
      max_systems: license.maxSystems,
      active_systems: licenseActivations.length,
      remaining_activations: Math.max(0, license.maxSystems - licenseActivations.length),
      created_at: license.createdAt,
      expires_at: license.expiresAt,
      activations: licenseActivations.map(a => ({
        id: a.id,
        machine_id: a.machineId,
        hostname: a.hostname,
        activated_at: a.activatedAt,
        last_seen: a.lastSeen,
      })),
    });
  } catch (error) {
    console.error("License status error:", error);
    res.status(500).json({ error: "Failed to get license status" });
  }
});

// =============================================================================
// DEACTIVATE SYSTEM ENDPOINT
// =============================================================================

const deactivateSchema = z.object({
  license_key: z.string().uuid(),
  activation_id: z.string().uuid(),
});

router.post("/deactivate", async (req: Request, res: Response) => {
  try {
    const result = deactivateSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: result.error.flatten()
      });
    }

    const { license_key, activation_id } = result.data;

    // Find the license
    const [license] = await db
      .select()
      .from(licenses)
      .where(eq(licenses.licenseKey, license_key))
      .limit(1);

    if (!license) {
      return res.status(404).json({
        success: false,
        error: "License not found"
      });
    }

    // Find the activation
    const [activation] = await db
      .select()
      .from(activations)
      .where(
        and(
          eq(activations.id, activation_id),
          eq(activations.licenseId, license.id)
        )
      )
      .limit(1);

    if (!activation) {
      return res.status(404).json({
        success: false,
        error: "Activation not found"
      });
    }

    // Delete the activation
    await db
      .delete(activations)
      .where(eq(activations.id, activation_id));

    console.log(`Deactivated system ${activation.machineId} from license ${license_key}`);

    res.json({
      success: true,
      message: "System deactivated successfully",
    });
  } catch (error) {
    console.error("Deactivation error:", error);
    res.status(500).json({ success: false, error: "Deactivation failed" });
  }
});

// =============================================================================
// GET LICENSE BY EMAIL (for account dashboard)
// =============================================================================

router.get("/by-email/:email", async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    // Find all licenses for this email
    const userLicenses = await db
      .select()
      .from(licenses)
      .where(eq(licenses.userEmail, email));

    if (userLicenses.length === 0) {
      return res.status(404).json({ error: "No licenses found for this email" });
    }

    // Get activations for each license
    const licensesWithActivations = await Promise.all(
      userLicenses.map(async (license) => {
        const licenseActivations = await db
          .select()
          .from(activations)
          .where(eq(activations.licenseId, license.id));

        return {
          id: license.id,
          license_key: license.licenseKey,
          plan: license.plan,
          status: license.status,
          max_systems: license.maxSystems,
          active_systems: licenseActivations.length,
          created_at: license.createdAt,
          expires_at: license.expiresAt,
          activations: licenseActivations.map(a => ({
            id: a.id,
            machine_id: a.machineId,
            hostname: a.hostname,
            activated_at: a.activatedAt,
            last_seen: a.lastSeen,
          })),
        };
      })
    );

    res.json({ licenses: licensesWithActivations });
  } catch (error) {
    console.error("Get licenses by email error:", error);
    res.status(500).json({ error: "Failed to get licenses" });
  }
});

// =============================================================================
// HELPER: Create License (used by webhook)
// =============================================================================

export async function createLicenseForSubscription(
  email: string,
  plan: string,
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  expiresAt?: Date
): Promise<typeof licenses.$inferSelect> {
  const maxSystems = PLAN_LIMITS[plan] || 5;

  const [license] = await db
    .insert(licenses)
    .values({
      userEmail: email,
      plan,
      stripeSubscriptionId,
      stripeCustomerId,
      maxSystems,
      status: "active",
      expiresAt: expiresAt || null,
    })
    .returning();

  console.log(`Created license ${license.licenseKey} for ${email} (${plan})`);
  return license;
}

export async function suspendLicense(stripeSubscriptionId: string): Promise<void> {
  await db
    .update(licenses)
    .set({ status: "suspended" })
    .where(eq(licenses.stripeSubscriptionId, stripeSubscriptionId));

  console.log(`Suspended license for subscription ${stripeSubscriptionId}`);
}

export async function cancelLicense(stripeSubscriptionId: string): Promise<void> {
  await db
    .update(licenses)
    .set({ status: "cancelled" })
    .where(eq(licenses.stripeSubscriptionId, stripeSubscriptionId));

  console.log(`Cancelled license for subscription ${stripeSubscriptionId}`);
}

export async function reactivateLicense(stripeSubscriptionId: string): Promise<void> {
  await db
    .update(licenses)
    .set({ status: "active" })
    .where(eq(licenses.stripeSubscriptionId, stripeSubscriptionId));

  console.log(`Reactivated license for subscription ${stripeSubscriptionId}`);
}

export async function updateLicenseExpiry(
  stripeSubscriptionId: string,
  expiresAt: Date
): Promise<void> {
  await db
    .update(licenses)
    .set({ expiresAt })
    .where(eq(licenses.stripeSubscriptionId, stripeSubscriptionId));

  console.log(`Updated license expiry for subscription ${stripeSubscriptionId}`);
}

export default router;
