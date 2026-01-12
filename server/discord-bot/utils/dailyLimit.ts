/**
 * Daily Question Limit System
 *
 * Tracks daily usage per user with role-based bypass.
 */

// Daily limit for free users
const DAILY_LIMIT = 5;

// Role IDs that bypass limits (add your Discord role IDs here)
const PRIVILEGED_ROLES = [
  process.env.DISCORD_ROLE_OWNER || "1450564628911489156",
  process.env.DISCORD_ROLE_ADMIN || "",
  process.env.DISCORD_ROLE_MODERATOR || "",
  process.env.DISCORD_ROLE_VERIFIED || "",
].filter(Boolean);

// Track usage: userId -> { count, date }
const usageMap = new Map<string, { count: number; date: string }>();

/**
 * Get today's date string
 */
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if user has a privileged role
 */
export function isPrivileged(member: any): boolean {
  if (!member?.roles?.cache) return false;

  for (const roleId of PRIVILEGED_ROLES) {
    if (member.roles.cache.has(roleId)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user can ask a question
 */
export function canAskQuestion(userId: string, member: any): boolean {
  // Privileged users bypass limit
  if (isPrivileged(member)) {
    return true;
  }

  const today = getToday();
  const usage = usageMap.get(userId);

  // No usage today yet
  if (!usage || usage.date !== today) {
    return true;
  }

  // Check if under limit
  return usage.count < DAILY_LIMIT;
}

/**
 * Increment usage counter
 */
export function incrementUsage(userId: string, member: any): void {
  // Don't track privileged users
  if (isPrivileged(member)) {
    return;
  }

  const today = getToday();
  const usage = usageMap.get(userId);

  if (!usage || usage.date !== today) {
    // New day, reset counter
    usageMap.set(userId, { count: 1, date: today });
  } else {
    // Increment existing counter
    usage.count++;
    usageMap.set(userId, usage);
  }
}

/**
 * Get remaining questions for a user
 */
export function getRemainingQuestions(
  userId: string,
  member: any
): number | "unlimited" {
  if (isPrivileged(member)) {
    return "unlimited";
  }

  const today = getToday();
  const usage = usageMap.get(userId);

  if (!usage || usage.date !== today) {
    return DAILY_LIMIT;
  }

  return Math.max(0, DAILY_LIMIT - usage.count);
}

/**
 * Get limit exceeded message
 */
export function getLimitExceededMessage(): string {
  return (
    `You've reached your daily question limit (${DAILY_LIMIT} questions).\n\n` +
    `**Ways to get unlimited access:**\n` +
    `• Join our Discord server and verify\n` +
    `• Participate in the hackathon\n` +
    `• Complete a referral verification\n\n` +
    `Your limit resets at midnight UTC.`
  );
}

/**
 * Reset all usage (for testing/admin)
 */
export function resetAllUsage(): void {
  usageMap.clear();
}

/**
 * Get usage stats
 */
export function getUsageStats(): { totalUsers: number; totalQueries: number } {
  let totalQueries = 0;
  const today = getToday();

  for (const [, usage] of usageMap) {
    if (usage.date === today) {
      totalQueries += usage.count;
    }
  }

  return {
    totalUsers: usageMap.size,
    totalQueries,
  };
}

export default {
  canAskQuestion,
  incrementUsage,
  getRemainingQuestions,
  getLimitExceededMessage,
  isPrivileged,
  resetAllUsage,
  getUsageStats,
};
