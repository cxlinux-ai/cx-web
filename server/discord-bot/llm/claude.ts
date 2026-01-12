/**
 * Claude LLM Integration
 *
 * Handles communication with Claude API for generating responses
 * with RAG (Retrieval Augmented Generation) support.
 */

import Anthropic from "@anthropic-ai/sdk";
import { getRelevantContext } from "../rag/retriever.js";
import { getConversationHistory } from "../memory/conversationMemory.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt for the bot
const SYSTEM_PROMPT = `You are CortexLinuxAI, the official AI assistant for Cortex Linux - an AI-native Linux distribution that understands natural language commands.

Your role:
- Answer questions about Cortex Linux, its features, installation, and usage
- Help users troubleshoot issues
- Provide guidance on Linux commands and best practices
- Be friendly, concise, and technically accurate

Guidelines:
- Keep responses concise (under 2000 characters when possible)
- Use code blocks for commands and code snippets
- If you don't know something specific to Cortex Linux, say so
- Always be helpful and encourage users to join the community

Key Cortex Linux features to know:
- Natural language command execution (e.g., "find large files" instead of complex find commands)
- AI-powered system management
- Built on Arch Linux base
- Open source and community-driven
- Hackathon program for contributors

Links to share when relevant:
- Website: https://cortexlinux.com
- GitHub: https://github.com/cortexlinux/cortex
- Discord: https://discord.gg/cortexlinux
- Hackathon: https://cortexlinux.com/hackathon
- Referral Program: https://cortexlinux.com/referrals`;

let ragInitialized = false;

/**
 * Initialize the RAG system
 */
export async function initializeRAG(): Promise<void> {
  try {
    // RAG initialization would load knowledge base here
    console.log("[RAG] Knowledge base initialized");
    ragInitialized = true;
  } catch (error) {
    console.error("[RAG] Failed to initialize:", error);
  }
}

/**
 * Generate a response using Claude with RAG context
 */
export async function generateResponse(
  question: string,
  message: any
): Promise<string> {
  try {
    // Get conversation history for context
    const history = getConversationHistory(message);

    // Get relevant context from RAG
    let ragContext = "";
    if (ragInitialized) {
      const relevantDocs = await getRelevantContext(question);
      if (relevantDocs.length > 0) {
        ragContext = `\n\nRelevant documentation:\n${relevantDocs.join("\n\n")}`;
      }
    }

    // Build messages array
    const messages: Anthropic.MessageParam[] = [];

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Add current question with RAG context
    messages.push({
      role: "user",
      content: ragContext ? `${question}${ragContext}` : question,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      return textContent.text;
    }

    return "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("[Claude] Error generating response:", error.message);

    if (error.status === 429) {
      return "I'm receiving too many requests right now. Please wait a moment and try again.";
    }

    if (error.status === 401) {
      return "There's an issue with my API configuration. Please contact an administrator.";
    }

    throw error;
  }
}

export default {
  initializeRAG,
  generateResponse,
};
