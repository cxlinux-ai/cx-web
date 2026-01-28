/**
 * Streaming Responses
 *
 * Send response chunks as they generate for a faster feel.
 * Uses Discord's typing indicator and message editing.
 */

import Anthropic from "@anthropic-ai/sdk";
import { Message, TextChannel } from "discord.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface StreamingOptions {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
  messages: Anthropic.MessageParam[];
}

/**
 * Generate a streaming response and update Discord message in chunks
 */
export async function streamResponse(
  discordMessage: Message,
  options: StreamingOptions
): Promise<string> {
  const channel = discordMessage.channel as TextChannel;

  // Send initial "thinking" message
  const reply = await discordMessage.reply({
    content: "✨ *Thinking...*",
  });

  let fullResponse = "";
  let lastUpdate = Date.now();
  const UPDATE_INTERVAL = 1000; // Update every 1 second

  try {
    const stream = await anthropic.messages.stream({
      model: options.model,
      max_tokens: options.maxTokens,
      temperature: options.temperature,
      system: options.systemPrompt,
      messages: options.messages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        const delta = event.delta as { type: string; text?: string };
        if (delta.type === "text_delta" && delta.text) {
          fullResponse += delta.text;

          // Update message periodically (not on every chunk to avoid rate limits)
          const now = Date.now();
          if (now - lastUpdate >= UPDATE_INTERVAL) {
            const displayText = fullResponse.length > 1900
              ? fullResponse.slice(0, 1900) + "..."
              : fullResponse;

            await reply.edit({
              content: displayText + " ▌", // Typing cursor
            }).catch(() => {}); // Ignore edit errors

            lastUpdate = now;
          }
        }
      }
    }

    // Final update with complete response
    const finalText = fullResponse.length > 2000
      ? fullResponse.slice(0, 1997) + "..."
      : fullResponse;

    await reply.edit({
      content: finalText,
    });

    return fullResponse;
  } catch (error: any) {
    console.error("[Streaming] Error:", error.message);

    // Update message with error
    await reply.edit({
      content: "Sorry, I hit a snag generating my response. Try again?",
    });

    throw error;
  }
}

/**
 * Check if streaming should be used (for longer responses)
 */
export function shouldUseStreaming(question: string): boolean {
  // Use streaming for complex questions that likely need longer responses
  const complexIndicators = [
    /\b(explain|describe|how does|what is|tell me about|compare)\b/i,
    /\b(step by step|detailed|comprehensive|thorough)\b/i,
    /\b(tutorial|guide|walkthrough)\b/i,
  ];

  for (const pattern of complexIndicators) {
    if (pattern.test(question)) {
      return true;
    }
  }

  return false;
}

export default {
  streamResponse,
  shouldUseStreaming,
};
