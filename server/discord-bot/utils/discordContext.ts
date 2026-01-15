/**
 * Discord Context
 *
 * Provides Discord-aware context for personalized responses:
 * - User information
 * - Relevant channel references
 */

import { Message } from "discord.js";

// Channel references for different topics
const CHANNEL_REFERENCES: Record<string, string> = {
  support: "#help",
  general: "#general",
  dev: "#dev-chat",
  hackathon: "#hackathon",
  announcements: "#announcements",
  questions: "#questions",
};

interface UserContext {
  username: string;
  isServerMember: boolean;
}

/**
 * Extract user context from a Discord message
 */
export function getUserContext(message: Message): UserContext {
  const member = message.member;
  const username = message.author.username;

  return {
    username,
    isServerMember: !!member,
  };
}

/**
 * Generate personalized greeting based on user context
 */
export function getPersonalizedGreeting(context: UserContext): string {
  // Simple greeting without role-based personalization
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
  if (/\b(question|ask|how)\b/.test(lowerQuery)) {
    return CHANNEL_REFERENCES.questions;
  }

  return null;
}

/**
 * Format user context for prompt injection
 */
export function formatUserContext(context: UserContext): string {
  if (context.isServerMember) {
    return `\n\n[User: ${context.username} - Discord server member]`;
  }
  return "";
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
    suggestedChannel: null,
  };
}

export default {
  getUserContext,
  getPersonalizedGreeting,
  suggestChannel,
  formatUserContext,
  getDiscordContext,
};
