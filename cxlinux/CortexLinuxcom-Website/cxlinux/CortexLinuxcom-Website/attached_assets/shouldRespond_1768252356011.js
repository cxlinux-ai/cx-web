/**
 * Determine if the bot should respond to a message
 * Bot responds when:
 * 1. The user mentions the bot (@CortexLinuxAI)
 * 2. The user replies directly to a message sent by the bot
 * 3. The message is in a thread where the bot is participating
 * 4. The message is in a thread created by the bot
 *
 * @param {import('discord.js').Message} message - The Discord message
 * @param {string} botId - The bot's user ID
 * @returns {Promise<boolean>}
 */
export async function shouldRespond(message, botId) {
  // Ignore messages from bots and webhooks
  if (message.author.bot || message.webhookId) {
    return false;
  }

  // Check if the bot is mentioned
  if (message.mentions.has(botId)) {
    return true;
  }

  // Check if this is a reply to a bot message
  if (message.reference && message.reference.messageId) {
    try {
      const repliedMessage = await message.channel.messages.fetch(
        message.reference.messageId
      );
      if (repliedMessage.author.id === botId) {
        return true;
      }
    } catch (error) {
      console.error("[Reply Check Error]", error.message);
    }
  }

  // Check if we're in a thread
  if (message.channel.isThread()) {
    try {
      // Check if bot created this thread (via starterMessage or ownerId)
      const thread = message.channel;

      // If the thread was created by the bot
      if (thread.ownerId === botId) {
        return true;
      }

      // Check if bot has participated in this thread
      // Fetch recent messages to see if bot is active
      const recentMessages = await thread.messages.fetch({ limit: 20 });
      const botParticipated = recentMessages.some(msg => msg.author.id === botId);

      if (botParticipated) {
        return true;
      }

      // Check if the thread's starter message was from/to the bot
      if (thread.starterMessage) {
        if (thread.starterMessage.author.id === botId) {
          return true;
        }
        // If starter message mentions the bot
        if (thread.starterMessage.mentions?.has(botId)) {
          return true;
        }
      }
    } catch (error) {
      console.error("[Thread Check Error]", error.message);
    }
  }

  return false;
}

/**
 * Extract the actual user question by removing bot mentions
 * @param {import('discord.js').Message} message - The Discord message
 * @param {string} botId - The bot's user ID
 * @returns {string}
 */
export function extractQuestion(message, botId) {
  let content = message.content;

  // Remove all bot mentions from the message
  const botMentionRegex = new RegExp(`<@!?${botId}>`, "g");
  content = content.replace(botMentionRegex, "").trim();

  return content;
}
