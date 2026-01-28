const MAX_QUESTIONS_PER_DAY = 5;

// Privileged roles - unlimited access
const ADMIN_ROLES = [
  "1450564628911489156", // Admin
  "1436987417436618762", // Co-founder
];

// In-memory storage: Map<userId, { count: number, resetDate: string }>
const userUsage = new Map();

/**
 * Get today's date in UTC as YYYY-MM-DD
 * @returns {string}
 */
function getTodayUTC() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get usage data for a user, initializing if needed
 * @param {string} userId
 * @returns {{ count: number, resetDate: string }}
 */
function getUserData(userId) {
  const today = getTodayUTC();
  const userData = userUsage.get(userId);

  if (!userData || userData.resetDate !== today) {
    const newData = { count: 0, resetDate: today };
    userUsage.set(userId, newData);
    return newData;
  }

  return userData;
}

/**
 * Check if a member has admin/privileged role
 * @param {import('discord.js').GuildMember} member
 * @returns {boolean}
 */
export function isPrivileged(member) {
  if (!member || !member.roles) return false;
  return member.roles.cache.some(role => ADMIN_ROLES.includes(role.id));
}

/**
 * Check if a user can ask a question
 * @param {string} userId
 * @param {import('discord.js').GuildMember} member
 * @returns {boolean}
 */
export function canAskQuestion(userId, member = null) {
  // Privileged roles have unlimited access
  if (member && isPrivileged(member)) {
    return true;
  }

  const userData = getUserData(userId);
  return userData.count < MAX_QUESTIONS_PER_DAY;
}

/**
 * Increment the question count for a user
 * @param {string} userId
 * @param {import('discord.js').GuildMember} member
 */
export function incrementUsage(userId, member = null) {
  // Don't count for privileged users
  if (member && isPrivileged(member)) {
    return;
  }

  const userData = getUserData(userId);
  userData.count += 1;
  userUsage.set(userId, userData);
}

/**
 * Get remaining questions for a user
 * @param {string} userId
 * @param {import('discord.js').GuildMember} member
 * @returns {number|string}
 */
export function getRemainingQuestions(userId, member = null) {
  // Privileged users have unlimited
  if (member && isPrivileged(member)) {
    return "unlimited";
  }

  const userData = getUserData(userId);
  return Math.max(0, MAX_QUESTIONS_PER_DAY - userData.count);
}

/**
 * Get the limit exceeded message
 * @returns {string}
 */
export function getLimitExceededMessage() {
  return "You've hit the daily limit of 5 questions. Try again tomorrow.";
}
