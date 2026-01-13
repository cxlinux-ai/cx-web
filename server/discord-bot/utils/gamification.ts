/**
 * Gamification & Leaderboards
 *
 * Track helpful members, hackathon progress, referral rankings.
 * Award XP and badges for engagement.
 */

import { EmbedBuilder, GuildMember, Message } from "discord.js";
import { db } from "../../db.js";
import { waitlistEntries } from "@shared/schema";
import { desc, sql } from "drizzle-orm";

// XP values for different actions
const XP_VALUES = {
  message: 1,
  helpfulAnswer: 10,
  questionAsked: 2,
  askQuestion: 2, // alias for questionAsked
  hackathonSubmission: 50,
  referral: 25,
  dailyStreak: 5,
  weeklyActive: 20,
  join: 5, // for joining the server
};

// Level thresholds
const LEVELS = [
  { level: 1, xp: 0, name: "Newbie", emoji: "🌱" },
  { level: 2, xp: 50, name: "Explorer", emoji: "🔍" },
  { level: 3, xp: 150, name: "Contributor", emoji: "🛠️" },
  { level: 4, xp: 300, name: "Regular", emoji: "⭐" },
  { level: 5, xp: 500, name: "Veteran", emoji: "🏅" },
  { level: 6, xp: 800, name: "Expert", emoji: "💎" },
  { level: 7, xp: 1200, name: "Master", emoji: "👑" },
  { level: 8, xp: 2000, name: "Legend", emoji: "🌟" },
];

// In-memory XP cache (persisted to DB periodically)
const userXP = new Map<string, {
  xp: number;
  level: number;
  lastActive: Date;
  streak: number;
  badges: string[];
}>();

// Badge definitions
const BADGES: Record<string, { name: string; emoji: string; description: string }> = {
  first_question: { name: "Curious Mind", emoji: "❓", description: "Asked your first question" },
  helpful: { name: "Helper", emoji: "🤝", description: "Marked as helpful 5 times" },
  streak_7: { name: "Week Warrior", emoji: "🔥", description: "7-day activity streak" },
  streak_30: { name: "Dedicated", emoji: "💪", description: "30-day activity streak" },
  hackathon: { name: "Hacker", emoji: "💻", description: "Participated in hackathon" },
  referrer: { name: "Ambassador", emoji: "📣", description: "Referred 3+ users" },
  early_adopter: { name: "Pioneer", emoji: "🚀", description: "Joined in the first month" },
  top_contributor: { name: "Top Contributor", emoji: "🏆", description: "Top 10 in leaderboard" },
};

/**
 * Get user's XP data
 */
export function getUserXP(userId: string): typeof userXP extends Map<string, infer V> ? V : never {
  if (!userXP.has(userId)) {
    userXP.set(userId, {
      xp: 0,
      level: 1,
      lastActive: new Date(),
      streak: 0,
      badges: [],
    });
  }
  return userXP.get(userId)!;
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): { level: number; xp: number; name: string; emoji: string } {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) {
      current = lvl;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Add XP to user
 */
export function addXP(userId: string, amount: number, reason: string): {
  newXP: number;
  leveledUp: boolean;
  newLevel?: typeof LEVELS[0];
} {
  const data = getUserXP(userId);
  const oldLevel = calculateLevel(data.xp);

  data.xp += amount;
  data.lastActive = new Date();

  const newLevel = calculateLevel(data.xp);
  data.level = newLevel.level;

  const leveledUp = newLevel.level > oldLevel.level;

  console.log(`[Gamification] ${userId} +${amount} XP (${reason}) - Total: ${data.xp}`);

  return {
    newXP: data.xp,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined,
  };
}

/**
 * Award a badge to user
 */
export function awardBadge(userId: string, badgeId: string): boolean {
  const data = getUserXP(userId);

  if (data.badges.includes(badgeId)) {
    return false; // Already has badge
  }

  const badge = BADGES[badgeId];
  if (!badge) return false;

  data.badges.push(badgeId);
  console.log(`[Gamification] ${userId} earned badge: ${badge.name}`);
  return true;
}

/**
 * Update streak for user
 */
export function updateStreak(userId: string): number {
  const data = getUserXP(userId);
  const now = new Date();
  const lastActive = data.lastActive;

  const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 1) {
    data.streak++;
    // Award streak badges
    if (data.streak === 7) awardBadge(userId, "streak_7");
    if (data.streak === 30) awardBadge(userId, "streak_30");
  } else {
    data.streak = 1;
  }

  data.lastActive = now;
  return data.streak;
}

/**
 * Create user stats embed
 */
export function createUserStatsEmbed(userId: string, username: string): EmbedBuilder {
  const data = getUserXP(userId);
  const level = calculateLevel(data.xp);
  const nextLevel = LEVELS.find((l) => l.xp > data.xp);

  const progress = nextLevel
    ? Math.round(((data.xp - level.xp) / (nextLevel.xp - level.xp)) * 100)
    : 100;

  const progressBar = createProgressBar(progress);

  const badgeDisplay = data.badges.length > 0
    ? data.badges.map((b) => BADGES[b]?.emoji || "").join(" ")
    : "None yet";

  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle(`${level.emoji} ${username}'s Stats`)
    .addFields(
      { name: "Level", value: `${level.level} - ${level.name}`, inline: true },
      { name: "XP", value: `${data.xp}`, inline: true },
      { name: "Streak", value: `🔥 ${data.streak} days`, inline: true },
      { name: "Progress", value: progressBar, inline: false },
      { name: "Badges", value: badgeDisplay, inline: false }
    )
    .setFooter({ text: nextLevel ? `${nextLevel.xp - data.xp} XP to next level` : "Max level!" });
}

/**
 * Create progress bar string
 */
function createProgressBar(percent: number): string {
  const filled = Math.round(percent / 10);
  const empty = 10 - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
}

/**
 * Create leaderboard embed
 */
export function createLeaderboardEmbed(type: "xp" | "referrals" | "streak"): EmbedBuilder {
  const entries = Array.from(userXP.entries());

  let sorted: [string, any][];
  let title: string;

  switch (type) {
    case "referrals":
      title = "🏆 Top Referrers";
      // Would need to join with waitlist data
      sorted = entries.sort((a, b) => b[1].xp - a[1].xp);
      break;
    case "streak":
      title = "🔥 Longest Streaks";
      sorted = entries.sort((a, b) => b[1].streak - a[1].streak);
      break;
    default:
      title = "⭐ XP Leaderboard";
      sorted = entries.sort((a, b) => b[1].xp - a[1].xp);
  }

  const top10 = sorted.slice(0, 10);
  const leaderboard = top10
    .map(([id, data], i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      const level = calculateLevel(data.xp);
      return `${medal} <@${id}> - ${level.emoji} ${data.xp} XP`;
    })
    .join("\n");

  return new EmbedBuilder()
    .setColor(0xffd700)
    .setTitle(title)
    .setDescription(leaderboard || "No data yet!")
    .setFooter({ text: "Updated in real-time" })
    .setTimestamp();
}

/**
 * Get referral leaderboard from database
 */
export async function getReferralLeaderboard(): Promise<EmbedBuilder> {
  try {
    const topReferrers = await db
      .select({
        discordId: waitlistEntries.discordId,
        totalReferrals: waitlistEntries.totalReferrals,
        currentTier: waitlistEntries.currentTier,
      })
      .from(waitlistEntries)
      .orderBy(desc(waitlistEntries.totalReferrals))
      .limit(10);

    const leaderboard = topReferrers
      .filter((r) => r.discordId && r.totalReferrals && r.totalReferrals > 0)
      .map((r, i) => {
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
        const tier = r.currentTier || "none";
        return `${medal} <@${r.discordId}> - ${r.totalReferrals} referrals (${tier})`;
      })
      .join("\n");

    return new EmbedBuilder()
      .setColor(0xffd700)
      .setTitle("🏆 Top Referrers")
      .setDescription(leaderboard || "No referrals yet!")
      .setFooter({ text: "cortexlinux.com/referrals" })
      .setTimestamp();
  } catch (error) {
    console.error("[Gamification] Error fetching leaderboard:", error);
    return new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("🏆 Top Referrers")
      .setDescription("Unable to load leaderboard");
  }
}

/**
 * Process message for XP
 */
export function processMessageXP(message: Message): void {
  const userId = message.author.id;

  // Update streak
  updateStreak(userId);

  // Award message XP
  addXP(userId, XP_VALUES.message, "message");
}

/**
 * Award helpful feedback XP
 */
export function awardHelpfulXP(userId: string): void {
  addXP(userId, XP_VALUES.helpfulAnswer, "helpful_answer");
}

// Aliases for external use
export const XP_REWARDS = XP_VALUES;
export const getUserStats = getUserXP;
export const getLeaderboard = createLeaderboardEmbed;

/**
 * Check achievements for user
 */
export function checkAchievements(userId: string): Array<{ name: string; emoji: string; new: boolean }> {
  const data = getUserXP(userId);
  const results: Array<{ name: string; emoji: string; new: boolean }> = [];

  // Check for new badges to award based on activity
  // First question badge
  if (data.xp > 0 && !data.badges.includes("first_question")) {
    const awarded = awardBadge(userId, "first_question");
    if (awarded) {
      const badge = BADGES.first_question;
      results.push({ name: badge.name, emoji: badge.emoji, new: true });
    }
  }

  // Include all current badges
  for (const badgeId of data.badges) {
    const badge = BADGES[badgeId];
    if (badge && !results.find(r => r.name === badge.name)) {
      results.push({ name: badge.name, emoji: badge.emoji, new: false });
    }
  }

  return results;
}

export default {
  getUserXP,
  getUserStats,
  calculateLevel,
  addXP,
  awardBadge,
  updateStreak,
  createUserStatsEmbed,
  createLeaderboardEmbed,
  getLeaderboard,
  getReferralLeaderboard,
  processMessageXP,
  awardHelpfulXP,
  checkAchievements,
  XP_VALUES,
  XP_REWARDS,
  BADGES,
};
