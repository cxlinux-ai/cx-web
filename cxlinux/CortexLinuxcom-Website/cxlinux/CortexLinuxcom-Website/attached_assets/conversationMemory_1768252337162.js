/**
 * Conversation Memory System
 * Maintains context for multi-turn conversations per user/thread
 */

// Store conversations: Map<threadId|odlM, Array<{role, content, timestamp}>>
const conversations = new Map();

// Configuration
const MAX_MESSAGES = 10; // Keep last N messages per conversation
const MEMORY_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Get conversation key (thread ID or DM channel + user)
 */
function getConversationKey(message) {
  // If in a thread, use thread ID
  if (message.channel.isThread()) {
    return `thread:${message.channel.id}`;
  }
  // Otherwise use channel + user for context
  return `channel:${message.channel.id}:user:${message.author.id}`;
}

/**
 * Add a message to conversation history
 */
export function addMessage(message, role, content) {
  const key = getConversationKey(message);

  if (!conversations.has(key)) {
    conversations.set(key, []);
  }

  const history = conversations.get(key);

  history.push({
    role,
    content,
    timestamp: Date.now(),
    username: message.author?.username || "assistant",
  });

  // Trim to max messages
  while (history.length > MAX_MESSAGES) {
    history.shift();
  }

  return history;
}

/**
 * Get conversation history for a message context
 */
export function getHistory(message) {
  const key = getConversationKey(message);
  const history = conversations.get(key) || [];

  // Filter out expired messages
  const now = Date.now();
  const validHistory = history.filter(msg => now - msg.timestamp < MEMORY_TTL);

  // Update stored history
  if (validHistory.length !== history.length) {
    conversations.set(key, validHistory);
  }

  return validHistory;
}

/**
 * Format history for Claude API
 */
export function formatHistoryForClaude(message) {
  const history = getHistory(message);

  return history.map(msg => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Clear conversation history
 */
export function clearHistory(message) {
  const key = getConversationKey(message);
  conversations.delete(key);
}

/**
 * Get memory stats
 */
export function getStats() {
  let totalMessages = 0;
  for (const history of conversations.values()) {
    totalMessages += history.length;
  }
  return {
    activeConversations: conversations.size,
    totalMessages,
  };
}

/**
 * Cleanup expired conversations (call periodically)
 */
export function cleanup() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, history] of conversations.entries()) {
    const validHistory = history.filter(msg => now - msg.timestamp < MEMORY_TTL);

    if (validHistory.length === 0) {
      conversations.delete(key);
      cleaned++;
    } else if (validHistory.length !== history.length) {
      conversations.set(key, validHistory);
    }
  }

  return cleaned;
}

// Auto-cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);
