/**
 * Discord Bot Integration
 *
 * Handles:
 * - Server member join events
 * - Role assignment based on referral tier
 * - Referral verification automation
 */

import { db } from "./db";
import { eq } from "drizzle-orm";
import { waitlistEntries, discordVerificationEvents } from "@shared/schema";

// Discord API base URL
const DISCORD_API = "https://discord.com/api/v10";

// Environment variables
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID || "";

// Role IDs for each tier (set these in your Discord server)
const TIER_ROLES: Record<string, string> = {
  bronze: process.env.DISCORD_ROLE_BRONZE || "",
  silver: process.env.DISCORD_ROLE_SILVER || "",
  gold: process.env.DISCORD_ROLE_GOLD || "",
  platinum: process.env.DISCORD_ROLE_PLATINUM || "",
  diamond: process.env.DISCORD_ROLE_DIAMOND || "",
  legendary: process.env.DISCORD_ROLE_LEGENDARY || "",
};

// Verified referrer role
const VERIFIED_ROLE = process.env.DISCORD_ROLE_VERIFIED || "";

/**
 * Discord API request helper
 */
async function discordRequest(
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> {
  const response = await fetch(`${DISCORD_API}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Discord API error: ${response.status} - ${error}`);
    return null;
  }

  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
}

/**
 * Check if a Discord user is a member of the server
 */
export async function isServerMember(discordId: string): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_SERVER_ID) {
    console.warn("Discord bot not configured");
    return false;
  }

  const member = await discordRequest(
    `/guilds/${DISCORD_SERVER_ID}/members/${discordId}`
  );
  return member !== null;
}

/**
 * Get server member info
 */
export async function getServerMember(discordId: string): Promise<any> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_SERVER_ID) {
    return null;
  }

  return await discordRequest(
    `/guilds/${DISCORD_SERVER_ID}/members/${discordId}`
  );
}

/**
 * Assign a role to a Discord user
 */
export async function assignRole(
  discordId: string,
  roleId: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_SERVER_ID || !roleId) {
    return false;
  }

  const result = await discordRequest(
    `/guilds/${DISCORD_SERVER_ID}/members/${discordId}/roles/${roleId}`,
    "PUT"
  );
  return result !== null;
}

/**
 * Remove a role from a Discord user
 */
export async function removeRole(
  discordId: string,
  roleId: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_SERVER_ID || !roleId) {
    return false;
  }

  const result = await discordRequest(
    `/guilds/${DISCORD_SERVER_ID}/members/${discordId}/roles/${roleId}`,
    "DELETE"
  );
  return result !== null;
}

/**
 * Assign tier role to a user based on their current tier
 */
export async function assignTierRole(
  discordId: string,
  tier: string
): Promise<boolean> {
  const roleId = TIER_ROLES[tier];
  if (!roleId) {
    console.log(`No role configured for tier: ${tier}`);
    return false;
  }

  // Remove all other tier roles first
  for (const [tierName, tierRoleId] of Object.entries(TIER_ROLES)) {
    if (tierName !== tier && tierRoleId) {
      await removeRole(discordId, tierRoleId);
    }
  }

  // Assign the new tier role
  return await assignRole(discordId, roleId);
}

/**
 * Verify a Discord user and update their referral status
 */
export async function verifyDiscordUser(discordId: string): Promise<{
  success: boolean;
  isNewMember: boolean;
  referralCode?: string;
}> {
  // Find user by Discord ID
  const users = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.discordId, discordId))
    .limit(1);

  if (users.length === 0) {
    return { success: false, isNewMember: false };
  }

  const user = users[0];

  // Check if already verified
  if (user.discordJoinedServer) {
    return { success: true, isNewMember: false, referralCode: user.referralCode };
  }

  // Check if user is actually in the server
  const isMember = await isServerMember(discordId);

  if (isMember) {
    // Update user as joined server
    await db
      .update(waitlistEntries)
      .set({
        discordJoinedServer: true,
        discordVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(waitlistEntries.id, user.id));

    // Log the event
    await db.insert(discordVerificationEvents).values({
      waitlistEntryId: user.id,
      eventType: "server_joined",
      eventData: JSON.stringify({ discordId, verifiedVia: "bot" }),
      success: true,
    });

    // Assign verified role if configured
    if (VERIFIED_ROLE) {
      await assignRole(discordId, VERIFIED_ROLE);
    }

    // Assign tier role if user has a tier
    if (user.currentTier && user.currentTier !== "none") {
      await assignTierRole(discordId, user.currentTier);
    }

    return { success: true, isNewMember: true, referralCode: user.referralCode };
  }

  return { success: false, isNewMember: false };
}

/**
 * Send a DM to a Discord user
 */
export async function sendDirectMessage(
  discordId: string,
  message: string
): Promise<boolean> {
  if (!DISCORD_BOT_TOKEN) {
    return false;
  }

  // Create DM channel
  const dmChannel = await discordRequest("/users/@me/channels", "POST", {
    recipient_id: discordId,
  });

  if (!dmChannel) {
    return false;
  }

  // Send message
  const result = await discordRequest(
    `/channels/${dmChannel.id}/messages`,
    "POST",
    { content: message }
  );

  return result !== null;
}

/**
 * Send welcome message to new verified users
 */
export async function sendWelcomeMessage(
  discordId: string,
  referralCode: string
): Promise<void> {
  const message = `Welcome to Cortex Linux!

Your referral code is: **${referralCode}**

Share your referral link to earn rewards:
https://cortexlinux.com/referrals?ref=${referralCode}

**Referral Tiers:**
- 1 referral: Bronze badge + 100 spots up
- 3 referrals: Silver + Discord access
- 5 referrals: Gold + Swag pack
- 10 referrals: Platinum + 1 month Pro
- 20 referrals: Diamond + Ambassador status
- 50 referrals: Legendary + Lifetime VIP

Track your progress: https://cortexlinux.com/referrals`;

  await sendDirectMessage(discordId, message);
}

/**
 * Batch verify all users who have connected Discord but not verified server membership
 */
export async function batchVerifyMembers(): Promise<{
  checked: number;
  verified: number;
}> {
  const unverifiedUsers = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.discordConnected, true));

  let checked = 0;
  let verified = 0;

  for (const user of unverifiedUsers) {
    if (!user.discordId) continue;
    if (user.discordJoinedServer) continue;

    checked++;

    const isMember = await isServerMember(user.discordId);
    if (isMember) {
      await db
        .update(waitlistEntries)
        .set({
          discordJoinedServer: true,
          discordVerifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(waitlistEntries.id, user.id));

      verified++;
    }

    // Rate limit: wait 100ms between API calls
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Batch verify: checked ${checked}, verified ${verified}`);
  return { checked, verified };
}

/**
 * Update tier roles for all verified users
 */
export async function syncTierRoles(): Promise<void> {
  const verifiedUsers = await db
    .select()
    .from(waitlistEntries)
    .where(eq(waitlistEntries.discordJoinedServer, true));

  for (const user of verifiedUsers) {
    if (!user.discordId || !user.currentTier || user.currentTier === "none") {
      continue;
    }

    await assignTierRole(user.discordId, user.currentTier);

    // Rate limit
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`Synced tier roles for ${verifiedUsers.length} users`);
}

/**
 * Get bot status and stats
 */
export async function getBotStatus(): Promise<{
  configured: boolean;
  serverName?: string;
  memberCount?: number;
}> {
  if (!DISCORD_BOT_TOKEN || !DISCORD_SERVER_ID) {
    return { configured: false };
  }

  const guild = await discordRequest(`/guilds/${DISCORD_SERVER_ID}`);
  if (!guild) {
    return { configured: false };
  }

  return {
    configured: true,
    serverName: guild.name,
    memberCount: guild.approximate_member_count,
  };
}

// Export for use in routes
export default {
  isServerMember,
  getServerMember,
  assignRole,
  removeRole,
  assignTierRole,
  verifyDiscordUser,
  sendDirectMessage,
  sendWelcomeMessage,
  batchVerifyMembers,
  syncTierRoles,
  getBotStatus,
};
