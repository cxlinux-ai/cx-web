/**
 * Discord Context
 *
 * Provides Discord-aware context for personalized responses:
 * - User roles and tier
 * - Hackathon participation status
 * - Relevant channel references
 */

import { GuildMember, Message } from "discord.js";

// Role IDs (from environment)
const ROLE_IDS = {
  bronze: process.env.DISCORD_ROLE_BRONZE || "",
  silver: process.env.DISCORD_ROLE_SILVER || "",
  gold: process.env.DISCORD_ROLE_GOLD || "",
  platinum: process.env.DISCORD_ROLE_PLATINUM || "",
  diamond: process.env.DISCORD_ROLE_DIAMOND || "",
  legendary: process.env.DISCORD_ROLE_LEGENDARY || "",
  verified: process.env.DISCORD_ROLE_VERIFIED || "",
  hackathon: process.env.DISCORD_ROLE_HACKATHON || "",
  moderator: process.env.DISCORD_ROLE_MODERATOR || "",
  admin: process.env.DISCORD_ROLE_ADMIN || "",
};

// Channel references for different topics
const CHANNEL_REFERENCES: Record<string, string> = {
  support: "#support",
  general: "#general",
  dev: "#dev",
  hackathon: "#hackathon",
  announcements: "#announcements",
  showcase: "#showcase",
  feedback: "#feedback",
};

interface UserContext {
  username: string;
  tier: string | null;
  isVerified: boolean;
  isHackathonParticipant: boolean;
  isModerator: boolean;
  isAdmin: boolean;
  roles: string[];
}

/**
 * Get user's referral tier from roles
 */
function getUserTier(member: GuildMember | null): string | null {
  if (!member) return null;

  const tierOrder = ["legendary", "diamond", "platinum", "gold", "silver", "bronze"];

  for (const tier of tierOrder) {
    const roleId = ROLE_IDS[tier as keyof typeof ROLE_IDS];
    if (roleId && member.roles.cache.has(roleId)) {
      return tier;
    }
  }

  return null;
}

/**
 * Check if user has a specific role
 */
function hasRole(member: GuildMember | null, roleKey: keyof typeof ROLE_IDS): boolean {
  if (!member) return false;
  const roleId = ROLE_IDS[roleKey];
  return roleId ? member.roles.cache.has(roleId) : false;
}

/**
 * Extract user context from a Discord message
 */
export function getUserContext(message: Message): UserContext {
  const member = message.member;
  const username = message.author.username;

  return {
    username,
    tier: getUserTier(member),
    isVerified: hasRole(member, "verified"),
    isHackathonParticipant: hasRole(member, "hackathon"),
    isModerator: hasRole(member, "moderator"),
    isAdmin: hasRole(member, "admin"),
    roles: member ? Array.from(member.roles.cache.values()).map((r) => r.name) : [],
  };
}

/**
 * Generate personalized greeting based on user context
 */
export function getPersonalizedGreeting(context: UserContext): string {
  if (context.tier === "legendary") {
    return `Hey ${context.username}! Always great to hear from our Legendary members.`;
  }
  if (context.tier === "diamond" || context.tier === "platinum") {
    return `Hey ${context.username}! Thanks for being such an awesome supporter.`;
  }
  if (context.isHackathonParticipant) {
    return `Hey ${context.username}! How's the hackathon project going?`;
  }
  return "";
}

/**
 * Get relevant channel suggestion based on topic
 */
export function suggestChannel(query: string): string | null {
  const lowerQuery = query.toLowerCase();

  if (/\b(help|issue|problem|error|stuck|broken)\b/.test(lowerQuery)) {
    return CHANNEL_REFERENCES.support;
  }
  if (/\b(hackathon|competition|prize|submit)\b/.test(lowerQuery)) {
    return CHANNEL_REFERENCES.hackathon;
  }
  if (/\b(contribute|code|develop|pr|pull request)\b/.test(lowerQuery)) {
    return CHANNEL_REFERENCES.dev;
  }
  if (/\b(show|built|made|project|demo)\b/.test(lowerQuery)) {
    return CHANNEL_REFERENCES.showcase;
  }
  if (/\b(suggestion|idea|feedback|improve)\b/.test(lowerQuery)) {
    return CHANNEL_REFERENCES.feedback;
  }

  return null;
}

/**
 * Format user context for prompt injection
 */
export function formatUserContext(context: UserContext): string {
  const parts: string[] = [];

  if (context.tier) {
    parts.push(`User is a ${context.tier} tier member`);
  }
  if (context.isHackathonParticipant) {
    parts.push("User is participating in the hackathon");
  }
  if (context.isVerified) {
    parts.push("User is verified");
  }
  if (context.isModerator || context.isAdmin) {
    parts.push("User is a team member/moderator");
  }

  if (parts.length === 0) return "";

  return `\n\n[User context: ${parts.join(", ")}]`;
}

/**
 * Get full Discord context for a message
 */
export function getDiscordContext(message: Message): {
  userContext: UserContext;
  contextString: string;
  suggestedChannel: string | null;
} {
  const userContext = getUserContext(message);
  const contextString = formatUserContext(userContext);

  return {
    userContext,
    contextString,
    suggestedChannel: null, // Will be set based on response content
  };
}

export default {
  getUserContext,
  getPersonalizedGreeting,
  suggestChannel,
  formatUserContext,
  getDiscordContext,
};
