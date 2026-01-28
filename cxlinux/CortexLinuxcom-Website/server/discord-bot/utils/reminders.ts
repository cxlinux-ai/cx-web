/**
 * Scheduled Reminders
 *
 * Personal reminders via DM.
 * "Remind me about hackathon deadline"
 */

import { Client, User, EmbedBuilder } from "discord.js";
import { db } from "../../db.js";

// In-memory reminder storage (would use DB in production)
interface Reminder {
  id: string;
  userId: string;
  message: string;
  triggerAt: Date;
  createdAt: Date;
  channelId?: string;
  sent: boolean;
}

const reminders: Map<string, Reminder> = new Map();
let reminderCheckInterval: NodeJS.Timeout | null = null;
let botClient: Client | null = null;

/**
 * Initialize reminder system with bot client
 */
export function initReminders(client: Client): void {
  botClient = client;

  // Check reminders every minute
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
  }

  reminderCheckInterval = setInterval(checkReminders, 60000);
  console.log("[Reminders] System initialized");
}

/**
 * Parse time from natural language
 */
export function parseTime(text: string): Date | null {
  const now = new Date();
  const lowerText = text.toLowerCase();

  // Relative time patterns
  const patterns: Array<{ pattern: RegExp; handler: (match: RegExpMatchArray) => Date }> = [
    // "in X minutes/hours/days"
    {
      pattern: /in\s+(\d+)\s*(min|minute|minutes|m)\b/i,
      handler: (m) => new Date(now.getTime() + parseInt(m[1]) * 60 * 1000),
    },
    {
      pattern: /in\s+(\d+)\s*(hour|hours|hr|hrs|h)\b/i,
      handler: (m) => new Date(now.getTime() + parseInt(m[1]) * 60 * 60 * 1000),
    },
    {
      pattern: /in\s+(\d+)\s*(day|days|d)\b/i,
      handler: (m) => new Date(now.getTime() + parseInt(m[1]) * 24 * 60 * 60 * 1000),
    },
    {
      pattern: /in\s+(\d+)\s*(week|weeks|w)\b/i,
      handler: (m) => new Date(now.getTime() + parseInt(m[1]) * 7 * 24 * 60 * 60 * 1000),
    },
    // "tomorrow"
    {
      pattern: /\btomorrow\b/i,
      handler: () => {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
        return tomorrow;
      },
    },
    // "next week"
    {
      pattern: /\bnext\s+week\b/i,
      handler: () => new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    },
    // "tonight"
    {
      pattern: /\btonight\b/i,
      handler: () => {
        const tonight = new Date(now);
        tonight.setHours(20, 0, 0, 0);
        return tonight;
      },
    },
    // "at X:XX" or "at X PM/AM"
    {
      pattern: /at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
      handler: (m) => {
        const date = new Date(now);
        let hours = parseInt(m[1]);
        const minutes = m[2] ? parseInt(m[2]) : 0;
        const period = m[3]?.toLowerCase();

        if (period === "pm" && hours < 12) hours += 12;
        if (period === "am" && hours === 12) hours = 0;

        date.setHours(hours, minutes, 0, 0);
        if (date <= now) {
          date.setDate(date.getDate() + 1); // If time passed, set for tomorrow
        }
        return date;
      },
    },
  ];

  for (const { pattern, handler } of patterns) {
    const match = lowerText.match(pattern);
    if (match) {
      return handler(match);
    }
  }

  return null;
}

/**
 * Extract reminder content from message
 */
export function parseReminderMessage(text: string): { time: Date | null; message: string } {
  // Remove "remind me" prefix
  let cleanText = text.replace(/^(remind\s+me|reminder|set\s+reminder)\s*(to|about|that)?\s*/i, "");

  // Try to extract time
  const time = parseTime(cleanText);

  // Remove time phrases from message
  const timePatterns = [
    /in\s+\d+\s*(min|minute|minutes|hour|hours|day|days|week|weeks|m|h|d|w)\s*/gi,
    /\btomorrow\b\s*/gi,
    /\btonight\b\s*/gi,
    /\bnext\s+week\b\s*/gi,
    /at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\s*/gi,
  ];

  let message = cleanText;
  for (const pattern of timePatterns) {
    message = message.replace(pattern, "");
  }

  message = message.trim();

  return { time, message };
}

/**
 * Create a reminder
 */
export function createReminder(
  userId: string,
  message: string,
  triggerAt: Date,
  channelId?: string
): Reminder {
  const id = `${userId}-${Date.now()}`;

  const reminder: Reminder = {
    id,
    userId,
    message,
    triggerAt,
    createdAt: new Date(),
    channelId,
    sent: false,
  };

  reminders.set(id, reminder);
  console.log(`[Reminders] Created reminder for ${userId}: "${message}" at ${triggerAt}`);

  return reminder;
}

/**
 * Check and send due reminders
 */
async function checkReminders(): Promise<void> {
  if (!botClient) return;

  const now = new Date();

  for (const [id, reminder] of Array.from(reminders.entries())) {
    if (reminder.sent) continue;
    if (reminder.triggerAt > now) continue;

    try {
      const user = await botClient.users.fetch(reminder.userId);
      if (user) {
        const embed = new EmbedBuilder()
          .setColor(0x3b82f6)
          .setTitle("⏰ Reminder!")
          .setDescription(reminder.message)
          .setFooter({ text: `Set ${formatTimeAgo(reminder.createdAt)}` })
          .setTimestamp();

        await user.send({ embeds: [embed] });
        console.log(`[Reminders] Sent reminder to ${user.tag}: ${reminder.message}`);
      }

      reminder.sent = true;
    } catch (error: any) {
      console.error(`[Reminders] Failed to send reminder ${id}:`, error.message);
      reminder.sent = true; // Mark as sent to avoid retrying forever
    }
  }

  // Cleanup old sent reminders
  for (const [id, reminder] of Array.from(reminders.entries())) {
    if (reminder.sent && Date.now() - reminder.triggerAt.getTime() > 24 * 60 * 60 * 1000) {
      reminders.delete(id);
    }
  }
}

/**
 * Format time ago string
 */
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Get user's pending reminders
 */
export function getUserReminders(userId: string): Reminder[] {
  return Array.from(reminders.values())
    .filter((r) => r.userId === userId && !r.sent)
    .sort((a, b) => a.triggerAt.getTime() - b.triggerAt.getTime());
}

/**
 * Cancel a reminder
 */
export function cancelReminder(reminderId: string, userId: string): boolean {
  const reminder = reminders.get(reminderId);
  if (!reminder || reminder.userId !== userId) return false;

  reminders.delete(reminderId);
  return true;
}

/**
 * Format reminder confirmation message
 */
export function formatReminderConfirmation(reminder: Reminder): string {
  const timeUntil = reminder.triggerAt.getTime() - Date.now();
  const hours = Math.floor(timeUntil / (60 * 60 * 1000));
  const minutes = Math.floor((timeUntil % (60 * 60 * 1000)) / (60 * 1000));

  let timeStr = "";
  if (hours > 24) {
    timeStr = `in ${Math.floor(hours / 24)} day(s)`;
  } else if (hours > 0) {
    timeStr = `in ${hours} hour(s) and ${minutes} minute(s)`;
  } else {
    timeStr = `in ${minutes} minute(s)`;
  }

  return `Got it! I'll remind you ${timeStr} about: "${reminder.message}"`;
}

/**
 * Check if message is a reminder request
 */
export function isReminderRequest(text: string): boolean {
  return /^(remind\s+me|set\s+reminder|reminder)\b/i.test(text.trim());
}

/**
 * Create reminders list embed
 */
export function createRemindersListEmbed(userId: string): EmbedBuilder {
  const userReminders = getUserReminders(userId);

  if (userReminders.length === 0) {
    return new EmbedBuilder()
      .setColor(0x3b82f6)
      .setTitle("📋 Your Reminders")
      .setDescription("You don't have any pending reminders.");
  }

  const reminderList = userReminders
    .map((r, i) => {
      const timeStr = r.triggerAt.toLocaleString();
      return `${i + 1}. **${r.message}** - ${timeStr}`;
    })
    .join("\n");

  return new EmbedBuilder()
    .setColor(0x3b82f6)
    .setTitle("📋 Your Reminders")
    .setDescription(reminderList)
    .setFooter({ text: `${userReminders.length} pending reminder(s)` });
}

// Alias for backwards compatibility
export const formatReminderList = createRemindersListEmbed;

export default {
  initReminders,
  parseTime,
  parseReminderMessage,
  createReminder,
  getUserReminders,
  cancelReminder,
  formatReminderConfirmation,
  formatReminderList,
  isReminderRequest,
  createRemindersListEmbed,
};
