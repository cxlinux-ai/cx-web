/**
 * Conversation Summarization
 *
 * When conversations get long, summarize older messages to maintain
 * context without using too many tokens.
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

// Threshold for when to summarize (number of messages)
const SUMMARIZE_THRESHOLD = 15;
// Keep this many recent messages unsummarized
const KEEP_RECENT = 6;

/**
 * Check if conversation needs summarization
 */
export function needsSummarization(messages: Message[]): boolean {
  return messages.length >= SUMMARIZE_THRESHOLD;
}

/**
 * Summarize older messages using Claude Haiku (cheapest)
 */
export async function summarizeConversation(messages: Message[]): Promise<{
  summary: string;
  recentMessages: Message[];
}> {
  if (messages.length < SUMMARIZE_THRESHOLD) {
    return {
      summary: "",
      recentMessages: messages,
    };
  }

  // Split into old (to summarize) and recent (to keep)
  const oldMessages = messages.slice(0, -KEEP_RECENT);
  const recentMessages = messages.slice(-KEEP_RECENT);

  // Format old messages for summarization
  const conversationText = oldMessages
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-20250514",
      max_tokens: 300,
      temperature: 0,
      system: "You summarize conversations concisely. Extract key facts, questions asked, and important context. Be brief but complete.",
      messages: [
        {
          role: "user",
          content: `Summarize this conversation in 2-3 sentences, focusing on key topics discussed and any important context:\n\n${conversationText}`,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    const summary = textContent?.type === "text" ? textContent.text : "";

    console.log(`[Summarization] Summarized ${oldMessages.length} messages into ${summary.length} chars`);

    return {
      summary,
      recentMessages,
    };
  } catch (error) {
    console.error("[Summarization] Error:", error);
    // On error, just return recent messages without summary
    return {
      summary: "",
      recentMessages,
    };
  }
}

/**
 * Format summary for prompt injection
 */
export function formatSummary(summary: string): string {
  if (!summary) return "";
  return `[Previous conversation summary: ${summary}]\n\n`;
}

/**
 * Process messages and return optimized context
 */
export async function getOptimizedContext(messages: Message[]): Promise<{
  contextPrefix: string;
  messages: Message[];
}> {
  if (!needsSummarization(messages)) {
    return {
      contextPrefix: "",
      messages,
    };
  }

  const { summary, recentMessages } = await summarizeConversation(messages);

  return {
    contextPrefix: formatSummary(summary),
    messages: recentMessages,
  };
}

/**
 * Estimate token count (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Check if context is getting too large
 */
export function isContextTooLarge(messages: Message[], maxTokens: number = 4000): boolean {
  const totalText = messages.map((m) => m.content).join(" ");
  return estimateTokens(totalText) > maxTokens;
}

export default {
  needsSummarization,
  summarizeConversation,
  formatSummary,
  getOptimizedContext,
  estimateTokens,
  isContextTooLarge,
};
