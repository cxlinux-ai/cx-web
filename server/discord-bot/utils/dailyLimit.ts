/**
 * Daily Question Limit System
 *
 * Tracks daily usage per user. Discord server members get unlimited access.
 */

// Daily limit for users outside the Discord server
const DAILY_LIMIT = 5;

// Track usage: userId -> { count, date }
const usageMap = new Map<string, { count: number; date: string }>();

/**
 * Get today's date string
 */
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Check if user is a Discord server member (has unlimited access)
 * Any Discord server member gets unlimited questions
 */
export function isPrivileged(member: any): boolean {
  // If they have a member object, they're in the server = unlimited
  return !!member;
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
    `**Get unlimited access:**\n` +
    `• Join our Discord server for unlimited questions!\n` +
    `• https://discord.gg/cxlinux-ai\n\n` +
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

  for (const [, usage] of Array.from(usageMap.entries())) {
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
