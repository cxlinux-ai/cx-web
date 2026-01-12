/**
 * Conversation Memory
 *
 * Stores conversation history for context-aware responses.
 */

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ConversationContext {
  channelId: string;
  userId: string;
  messages: ConversationMessage[];
  lastActivity: number;
}

// Memory store: key = `${channelId}-${userId}`
const memoryStore = new Map<string, ConversationContext>();

// Maximum messages to keep per conversation
const MAX_MESSAGES = 10;

// Conversation timeout (30 minutes)
const TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Get conversation key
 */
function getKey(message: any): string {
  const channelId = message.channel?.id || message.channelId || "dm";
  const userId = message.author?.id || message.user?.id || "unknown";
  return `${channelId}-${userId}`;
}

/**
 * Add a message to conversation history
 */
export function addMessage(
  message: any,
  role: "user" | "assistant",
  content: string
): void {
  const key = getKey(message);
  const now = Date.now();

  let context = memoryStore.get(key);

  // Create new context or check timeout
  if (!context || now - context.lastActivity > TIMEOUT_MS) {
    context = {
      channelId: message.channel?.id || message.channelId || "dm",
      userId: message.author?.id || message.user?.id || "unknown",
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
export function clearHistory(message: any): void {
  const key = getKey(message);
  memoryStore.delete(key);
}

/**
 * Get memory statistics
 */
export function getStats(): { activeConversations: number; totalMessages: number } {
  let totalMessages = 0;
  const now = Date.now();

  // Clean up expired conversations
  for (const [key, context] of memoryStore) {
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

  for (const [key, context] of memoryStore) {
    if (now - context.lastActivity > TIMEOUT_MS) {
      memoryStore.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Run cleanup every 10 minutes
setInterval(cleanup, 10 * 60 * 1000);

export default {
  addMessage,
  getConversationHistory,
  clearHistory,
  getStats,
  cleanup,
};
