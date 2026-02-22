/**
 * Daily/Weekly Digests
 *
 */

import { Client, TextChannel, EmbedBuilder } from "discord.js";
import { db } from "../../db.js";
import { botAnalytics, waitlistEntries } from "@shared/schema";
import { desc, sql, gte, count } from "drizzle-orm";

// Channel IDs for digest posts
const DIGEST_CHANNEL = process.env.DISCORD_DIGEST_CHANNEL || "";
const ANNOUNCEMENTS_CHANNEL = process.env.DISCORD_ANNOUNCEMENTS_CHANNEL || "";

let digestInterval: NodeJS.Timeout | null = null;
let botClient: Client | null = null;

interface DigestStats {
  totalQuestions: number;
  topCategories: Array<{ category: string; count: number }>;
  newMembers: number;
  activeUsers: number;
  topQuestions: string[];
}

/**
 * Initialize digest system
 */
export function initDigests(client: Client): void {
  botClient = client;

  // Schedule daily digest at 9 AM UTC
  scheduleDaily();

  console.log("[Digests] System initialized");
}

/**
 * Schedule daily digest
 */
export function scheduleDaily(): void {
  const now = new Date();
  const next9AM = new Date(now);
  next9AM.setUTCHours(9, 0, 0, 0);

  if (next9AM <= now) {
    next9AM.setDate(next9AM.getDate() + 1);
  }

  const msUntil = next9AM.getTime() - now.getTime();

  setTimeout(() => {
    postDailyDigest();
    // Then schedule for every 24 hours
    digestInterval = setInterval(postDailyDigest, 24 * 60 * 60 * 1000);
  }, msUntil);

  console.log(`[Digests] Daily digest scheduled for ${next9AM.toISOString()}`);
}

/**
 * Gather stats for digest
 */
async function gatherStats(hours: number = 24): Promise<DigestStats> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  try {
    // Get question stats from analytics
    const analytics = await db
      .select()
      .from(botAnalytics)
      .where(gte(botAnalytics.createdAt, since))
      .limit(1000);

    // Count categories
    const categoryCount = new Map<string, number>();
    for (const entry of analytics) {
      if (entry.questionCategory) {
        categoryCount.set(
          entry.questionCategory,
          (categoryCount.get(entry.questionCategory) || 0) + 1
        );
      }
    }

    const topCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Get unique active users
    const uniqueUsers = new Set(analytics.map((a) => a.discordUserId));

    // Sample top questions
    const topQuestions = analytics
      .slice(0, 5)
      .map((a) => a.question.slice(0, 100));

    return {
      totalQuestions: analytics.length,
      topCategories,
      newMembers: 0, // Would need to track join dates
      activeUsers: uniqueUsers.size,
      topQuestions,
    };
  } catch (error) {
    console.error("[Digests] Error gathering stats:", error);
    return {
      totalQuestions: 0,
      topCategories: [],
      newMembers: 0,
      activeUsers: 0,
      topQuestions: [],
    };
  }
}

/**
 * Create daily digest embed
 */
export function createDailyDigestEmbed(stats: DigestStats): EmbedBuilder {
  const categoryStr = stats.topCategories
    .map((c) => `• ${c.category}: ${c.count}`)
    .join("\n") || "No data";

  const embed = new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle("📊 Daily Community Digest")
    .setDescription("Here's what happened in the last 24 hours!")
    .addFields(
      {
        name: "📈 Activity",
        value: `Questions asked: **${stats.totalQuestions}**\nActive users: **${stats.activeUsers}**`,
        inline: true,
      },
      {
        name: "🏷️ Top Topics",
        value: categoryStr,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({ text: "CX Linux Community" });

  return embed;
}

/**
 * Create weekly digest embed
 */
export function createWeeklyDigestEmbed(stats: DigestStats): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle("📅 Weekly Community Roundup")
    .setDescription("Here's your weekly summary of community activity!")
    .addFields(
      {
        name: "📈 This Week",
        value: `Total questions: **${stats.totalQuestions}**\nUnique users: **${stats.activeUsers}**\nNew members: **${stats.newMembers}**`,
        inline: false,
      },
      {
        name: "🔥 Trending Topics",
        value: stats.topCategories.map((c) => `${c.category} (${c.count})`).join(", ") || "Various",
        inline: false,
      },
      {
        name: "💡 Sample Questions",
        value: stats.topQuestions.slice(0, 3).map((q) => `• ${q}...`).join("\n") || "None recorded",
        inline: false,
      }
    )
    .setTimestamp()
    .setFooter({ text: "The AI Layer for Linux" });
}

/**
 * Post daily digest to channel
 */
export async function postDailyDigest(): Promise<void> {
  if (!botClient || !DIGEST_CHANNEL) {
    console.log("[Digests] Skipping daily digest - no client or channel configured");
    return;
  }

  try {
    const channel = await botClient.channels.fetch(DIGEST_CHANNEL);
    if (!channel || !channel.isTextBased()) {
      console.log("[Digests] Digest channel not found or not text-based");
      return;
    }

    const stats = await gatherStats(24);
    const embed = createDailyDigestEmbed(stats);

    await (channel as TextChannel).send({ embeds: [embed] });
    console.log("[Digests] Posted daily digest");
  } catch (error) {
    console.error("[Digests] Error posting daily digest:", error);
  }
}

/**
 * Post weekly digest to channel
 */
export async function postWeeklyDigest(): Promise<void> {
  if (!botClient || !ANNOUNCEMENTS_CHANNEL) {
    console.log("[Digests] Skipping weekly digest - no client or channel configured");
    return;
  }

  try {
    const channel = await botClient.channels.fetch(ANNOUNCEMENTS_CHANNEL);
    if (!channel || !channel.isTextBased()) return;

    const stats = await gatherStats(24 * 7);
    const embed = createWeeklyDigestEmbed(stats);

    await (channel as TextChannel).send({ embeds: [embed] });
    console.log("[Digests] Posted weekly digest");
  } catch (error) {
    console.error("[Digests] Error posting weekly digest:", error);
  }
}

/**
 * Generate on-demand digest
 */
export async function generateDigest(hours: number = 24): Promise<EmbedBuilder> {
  const stats = await gatherStats(hours);
  return hours >= 24 * 7
    ? createWeeklyDigestEmbed(stats)
    : createDailyDigestEmbed(stats);
}

// Alias for backwards compatibility
export const scheduleDigest = scheduleDaily;

export default {
  initDigests,
  postDailyDigest,
  postWeeklyDigest,
  generateDigest,
  scheduleDigest,
  scheduleDaily,
  createDailyDigestEmbed,
  createWeeklyDigestEmbed,
};
