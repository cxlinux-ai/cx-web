/**
 * Message Response Detection
 *
 * Determines if the bot should respond to a message.
 */

import { Message } from "discord.js";

/**
 * Check if bot should respond to a message
 */
export async function shouldRespond(
  message: Message,
  botUserId: string
): Promise<boolean> {
  // Ignore bot messages
  if (message.author.bot) {
    return false;
  }

  // Check if bot is mentioned
  if (message.mentions.has(botUserId)) {
    return true;
  }

  // Check if message is a reply to the bot
  if (message.reference) {
    try {
      const repliedTo = await message.fetchReference();
      if (repliedTo.author.id === botUserId) {
        return true;
      }
    } catch {
      // Failed to fetch reference, ignore
    }
  }

  // Check if in DM
  if (message.channel.isDMBased()) {
    return true;
  }

  return false;
}

/**
 * Extract the actual question from a message (remove bot mentions)
 */
export function extractQuestion(message: Message, botUserId: string): string {
  let content = message.content;

  // Remove bot mention
  const mentionRegex = new RegExp(`<@!?${botUserId}>`, "g");
  content = content.replace(mentionRegex, "").trim();

  // Remove any leading/trailing whitespace and punctuation
  content = content.replace(/^[,.\s]+|[,.\s]+$/g, "").trim();

  return content;
}

export default {
  shouldRespond,
  extractQuestion,
};
