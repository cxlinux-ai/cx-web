/**
 * Thread Support
 *
 * Auto-create threads for complex multi-turn discussions
 * to keep channels clean and organized.
 */

import {
  Message,
  ThreadChannel,
  TextChannel,
  ChannelType,
  ThreadAutoArchiveDuration,
} from "discord.js";

// Keywords that suggest a complex discussion
const COMPLEX_TOPIC_PATTERNS = [
  /\b(install|setup|configure|troubleshoot|debug)\b/i,
  /\b(step by step|guide me|walk me through|help me)\b/i,
  /\b(error|issue|problem|not working|broken|stuck)\b/i,
  /\b(project|building|development|implementing)\b/i,
  /\b(hackathon|submission|participate)\b/i,
];

// Track thread creation to avoid duplicates
const recentThreads = new Map<string, string>(); // channelId:userId -> threadId

/**
 * Check if a question warrants its own thread
 */
export function shouldCreateThread(question: string, messageCount: number = 0): boolean {
  // Don't create thread for simple greetings
  if (question.length < 20) return false;

  // If already in a conversation (2+ messages), suggest thread
  if (messageCount >= 2) return true;

  // Check for complex topic indicators
  for (const pattern of COMPLEX_TOPIC_PATTERNS) {
    if (pattern.test(question)) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a thread name from the question
 */
export function generateThreadName(question: string, username: string): string {
  // Extract key topic from question
  const cleanQuestion = question
    .replace(/<@!?\d+>/g, "") // Remove mentions
    .replace(/[^\w\s]/g, " ") // Remove special chars
    .trim();

  // Take first ~50 chars or first sentence
  let name = cleanQuestion.slice(0, 50);
  const sentenceEnd = name.search(/[.!?]/);
  if (sentenceEnd > 10) {
    name = name.slice(0, sentenceEnd);
  }

  // Clean up
  name = name.trim();
  if (name.length < 5) {
    name = `Help for ${username}`;
  }

  return name.slice(0, 100); // Discord thread name limit
}

/**
 * Create a thread for a discussion
 */
export async function createDiscussionThread(
  message: Message,
  question: string
): Promise<ThreadChannel | null> {
  try {
    const channel = message.channel;

    // Can only create threads in text channels
    if (channel.type !== ChannelType.GuildText) {
      return null;
    }

    const textChannel = channel as TextChannel;
    const userId = message.author.id;
    const cacheKey = `${channel.id}:${userId}`;

    // Check if we recently created a thread for this user in this channel
    const existingThreadId = recentThreads.get(cacheKey);
    if (existingThreadId) {
      try {
        const existingThread = await textChannel.threads.fetch(existingThreadId);
        if (existingThread && !existingThread.archived) {
          return existingThread;
        }
      } catch {
        // Thread doesn't exist anymore, continue to create new one
      }
    }

    const threadName = generateThreadName(question, message.author.username);

    // Create thread from the message
    const thread = await message.startThread({
      name: threadName,
      autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
      reason: "Auto-created for support discussion",
    });

    // Cache the thread
    recentThreads.set(cacheKey, thread.id);

    // Cleanup old cache entries
    if (recentThreads.size > 100) {
      const firstKey = recentThreads.keys().next().value;
      if (firstKey) recentThreads.delete(firstKey);
    }

    console.log(`[Threads] Created thread: ${threadName}`);
    return thread;
  } catch (error: any) {
    console.error("[Threads] Error creating thread:", error.message);
    return null;
  }
}

/**
 * Check if message is in a thread
 */
export function isInThread(message: Message): boolean {
  return message.channel.isThread();
}

/**
 * Get or suggest thread for ongoing conversation
 */
export async function manageThread(
  message: Message,
  question: string,
  conversationLength: number
): Promise<{ thread: ThreadChannel | null; shouldMove: boolean }> {
  // Already in a thread, no action needed
  if (isInThread(message)) {
    return { thread: null, shouldMove: false };
  }

  // Check if we should create a thread
  if (shouldCreateThread(question, conversationLength)) {
    const thread = await createDiscussionThread(message, question);
    return { thread, shouldMove: thread !== null };
  }

  return { thread: null, shouldMove: false };
}

/**
 * Format thread suggestion message
 */
export function getThreadSuggestion(threadId: string): string {
  return `\n\n-# I've created a thread for our conversation: <#${threadId}>`;
}

export default {
  shouldCreateThread,
  generateThreadName,
  createDiscussionThread,
  isInThread,
  manageThread,
  getThreadSuggestion,
};
