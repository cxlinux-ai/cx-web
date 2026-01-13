/**
 * Conversation Memory - Persistent Version
 *
 * Stores conversation history in PostgreSQL for persistence across restarts.
 * Falls back to in-memory storage if database is unavailable.
 */

import { db } from "../../db.js";
import { botConversations } from "@shared/schema";
import { eq, and } from "drizzle-orm";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ConversationContext {
  channelId: string;
  userId: string;
  guildId?: string;
  messages: ConversationMessage[];
  lastActivity: number;
}

// In-memory cache (for fast access + fallback)
const memoryStore = new Map<string, ConversationContext>();

// Configuration
const MAX_MESSAGES = 20; // Increased from 10 for better context
const TIMEOUT_MS = 60 * 60 * 1000; // 1 hour (increased from 30 min)
const SAVE_DEBOUNCE_MS = 5000; // Save to DB every 5 seconds

// Pending saves (debounced)
const pendingSaves = new Map<string, NodeJS.Timeout>();

/**
 * Get conversation key
 */
function getKey(message: any): string {
  const channelId = message.channel?.id || message.channelId || "dm";
  const userId = message.author?.id || message.user?.id || "unknown";
  return `${channelId}-${userId}`;
}

/**
 * Extract IDs from message
 */
function extractIds(message: any): { channelId: string; userId: string; guildId?: string } {
  return {
    channelId: message.channel?.id || message.channelId || "dm",
    userId: message.author?.id || message.user?.id || "unknown",
    guildId: message.guild?.id || message.guildId,
  };
}

/**
 * Load conversation from database
 */
async function loadFromDatabase(
  channelId: string,
  userId: string
): Promise<ConversationContext | null> {
  try {
    const [row] = await db
      .select()
      .from(botConversations)
      .where(
        and(
          eq(botConversations.discordChannelId, channelId),
          eq(botConversations.discordUserId, userId)
        )
      )
      .limit(1);

    if (!row) return null;

    const messages = JSON.parse(row.messages) as ConversationMessage[];
    const lastActivity = row.lastMessageAt.getTime();

    // Check if conversation is expired
    if (Date.now() - lastActivity > TIMEOUT_MS) {
      return null;
    }

    return {
      channelId: row.discordChannelId,
      userId: row.discordUserId,
      guildId: row.discordGuildId || undefined,
      messages,
      lastActivity,
    };
  } catch (error) {
    console.error("[Memory] Failed to load from database:", error);
    return null;
  }
}

/**
 * Save conversation to database (debounced)
 */
function saveToDatabase(key: string, context: ConversationContext): void {
  // Clear existing timeout
  const existing = pendingSaves.get(key);
  if (existing) {
    clearTimeout(existing);
  }

  // Set new debounced save
  const timeout = setTimeout(async () => {
    pendingSaves.delete(key);
    try {
      const messagesJson = JSON.stringify(context.messages);

      // Upsert conversation
      await db
        .insert(botConversations)
        .values({
          discordUserId: context.userId,
          discordChannelId: context.channelId,
          discordGuildId: context.guildId,
          messages: messagesJson,
          messageCount: context.messages.length,
          lastMessageAt: new Date(context.lastActivity),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [botConversations.discordChannelId, botConversations.discordUserId],
          set: {
            messages: messagesJson,
            messageCount: context.messages.length,
            lastMessageAt: new Date(context.lastActivity),
            updatedAt: new Date(),
          },
        })
        .catch(() => {
          // If upsert fails due to constraint issues, try a simple update
          return db
            .update(botConversations)
            .set({
              messages: messagesJson,
              messageCount: context.messages.length,
              lastMessageAt: new Date(context.lastActivity),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(botConversations.discordChannelId, context.channelId),
                eq(botConversations.discordUserId, context.userId)
              )
            );
        });

      console.log(`[Memory] Saved conversation: ${key}`);
    } catch (error) {
      console.error("[Memory] Failed to save to database:", error);
    }
  }, SAVE_DEBOUNCE_MS);

  pendingSaves.set(key, timeout);
}

/**
 * Add a message to conversation history
 */
export async function addMessage(
  message: any,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const key = getKey(message);
  const ids = extractIds(message);
  const now = Date.now();

  let context = memoryStore.get(key);

  // If not in memory, try to load from database
  if (!context) {
    context = await loadFromDatabase(ids.channelId, ids.userId) || undefined;
  }

  // Create new context or check timeout
  if (!context || now - context.lastActivity > TIMEOUT_MS) {
    context = {
      channelId: ids.channelId,
      userId: ids.userId,
      guildId: ids.guildId,
      messages: [],
      lastActivity: now,
    };
  }

  // Add message
  context.messages.push({
    role,
    content,
    timestamp: now,
  });

  // Keep only last MAX_MESSAGES
  if (context.messages.length > MAX_MESSAGES) {
    context.messages = context.messages.slice(-MAX_MESSAGES);
  }

  context.lastActivity = now;
  memoryStore.set(key, context);

  // Save to database (debounced)
  saveToDatabase(key, context);
}

/**
 * Get conversation history
 */
export function getConversationHistory(
  message: any
): Array<{ role: string; content: string }> {
  const key = getKey(message);
  const context = memoryStore.get(key);

  if (!context) {
    return [];
  }

  // Check timeout
  if (Date.now() - context.lastActivity > TIMEOUT_MS) {
    memoryStore.delete(key);
    return [];
  }

  return context.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

/**
 * Clear conversation history
 */
export async function clearHistory(message: any): Promise<void> {
  const key = getKey(message);
  const ids = extractIds(message);

  memoryStore.delete(key);

  // Also clear from database
  try {
    await db
      .delete(botConversations)
      .where(
        and(
          eq(botConversations.discordChannelId, ids.channelId),
          eq(botConversations.discordUserId, ids.userId)
        )
      );
  } catch (error) {
    console.error("[Memory] Failed to clear from database:", error);
  }
}

/**
 * Get memory statistics
 */
export function getStats(): { activeConversations: number; totalMessages: number } {
  let totalMessages = 0;
  const now = Date.now();

  // Clean up expired conversations
  for (const [key, context] of Array.from(memoryStore.entries())) {
    if (now - context.lastActivity > TIMEOUT_MS) {
      memoryStore.delete(key);
    } else {
      totalMessages += context.messages.length;
    }
  }

  return {
    activeConversations: memoryStore.size,
    totalMessages,
  };
}

/**
 * Clean up old conversations (call periodically)
 */
export function cleanup(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, context] of Array.from(memoryStore.entries())) {
    if (now - context.lastActivity > TIMEOUT_MS) {
      memoryStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

/**
 * Load recent conversations from database on startup
 */
export async function initializeFromDatabase(): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - TIMEOUT_MS);
    const conversations = await db
      .select()
      .from(botConversations)
      .where(eq(botConversations.lastMessageAt, cutoff))
      .limit(100);

    for (const row of conversations) {
      const key = `${row.discordChannelId}-${row.discordUserId}`;
      const messages = JSON.parse(row.messages) as ConversationMessage[];

      memoryStore.set(key, {
        channelId: row.discordChannelId,
        userId: row.discordUserId,
        guildId: row.discordGuildId || undefined,
        messages,
        lastActivity: row.lastMessageAt.getTime(),
      });
    }

    console.log(`[Memory] Loaded ${conversations.length} conversations from database`);
  } catch (error) {
    console.error("[Memory] Failed to initialize from database:", error);
  }
}

// Run cleanup every 10 minutes
setInterval(cleanup, 10 * 60 * 1000);

export default {
  addMessage,
  getConversationHistory,
  clearHistory,
  getStats,
  cleanup,
  initializeFromDatabase,
};
