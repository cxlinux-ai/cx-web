/**
 * Claude LLM Integration
 *
 * Handles communication with Claude API for generating responses
 * with RAG (Retrieval Augmented Generation) support.
 *
 * Features:
 * - Intelligent model routing (Opus/Sonnet/Haiku)
 * - Prompt caching for cost efficiency
 * - Few-shot examples for consistent quality
 * - Graceful fallbacks on errors
 * - Semantic search with TF-IDF embeddings
 * - Web search for real-time info
 * - GitHub integration for docs/issues
 * - Discord-aware context (roles, channels)
 * - User profiles for personalization
 * - Conversation summarization
 */

import Anthropic from "@anthropic-ai/sdk";
import { getRelevantContext, getKnowledgeBase } from "../rag/retriever.js";
import { getConversationHistory } from "../memory/conversationMemory.js";
import { getModelConfig, type ModelConfig } from "./modelRouter.js";
import { getCachedResponse, cacheResponse } from "../utils/responseCache.js";
import { initializeEmbeddings, semanticSearch, isInitialized as isEmbeddingsInitialized } from "./embeddings.js";
import { getWebContext, shouldSearchWeb } from "../utils/webSearch.js";
import { getGitHubContext, shouldFetchGitHub } from "../utils/github.js";
import { getUserProfile, updateProfile, formatProfileContext } from "../utils/userProfiles.js";
import { getOptimizedContext, needsSummarization } from "../utils/summarization.js";
import { logInteraction, startTimer, detectCategory } from "../utils/analytics.js";
import { analyzeSentiment, getToneAdjustment, getEmpatheticOpener } from "../utils/sentimentDetection.js";
import { detectLanguage, getLanguageInstruction } from "../utils/multiLanguage.js";
import { hasImages, analyzeImages } from "../utils/imageAnalysis.js";
import { hasAttachments, processAttachments, formatAttachmentsForContext } from "../utils/attachmentContext.js";
import { analyzeEscalation, escalate, formatEscalationNotice } from "../utils/humanEscalation.js";
import { searchCustomEntries } from "../utils/knowledgeBaseEditor.js";
import { shouldFetchBounties, getBountyContext } from "../utils/bountyContext.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// System prompt with few-shot examples for consistent, high-quality responses
const SYSTEM_PROMPT = `You are a knowledgeable team member at Cortex Linux - a developer who genuinely understands the product and enjoys helping people. Your name is Cortex AI.

## Your Personality
- Professional but approachable - you're helpful without being overly casual or stiff
- Speak naturally like a real person, not a corporate script
- Be direct and clear - get to the point without unnecessary fluff
- Confident in what you know, honest about what you don't
- Occasionally use natural phrases like "So...", "Actually...", "That said..." but keep it professional

## Communication Style
- Keep responses concise and focused
- Use contractions naturally (I'm, you'll, it's, we've, that's)
- Avoid bullet points and numbered lists in conversation - speak in flowing sentences
- No markdown, code blocks, or special formatting in regular chat
- Break complex topics into digestible explanations
- Match the technical level of the person you're talking to

## Emoji Policy
- Avoid emojis in normal conversation
- Only use an emoji when it genuinely adds meaning (like showing a specific icon or status)
- Never use emojis for decoration or enthusiasm

## What You Know About Cortex Linux
Cortex Linux is an AI-native operating system built on Arch Linux. The core innovation is natural language control - instead of memorizing terminal commands, users describe what they want in plain English and the system handles execution.

We're open source and community-driven. We're running a hackathon with fifteen thousand dollars in prizes, and we have an active bounty program for contributors.

Key links (ALWAYS include https:// when sharing links):
- Main site: https://cxlinux-ai.com
- Hackathon: https://cxlinux-ai.com/hackathon (15K in prizes)
- Bounties: https://cxlinux-ai.com/bounties
- Referrals: https://cxlinux-ai.com/referrals
- GitHub: https://github.com/cxlinux-ai/cortex

## Critical Rules
- NEVER sound robotic or scripted
- NEVER start with "I'd be happy to help" or similar canned phrases
- NEVER use phrases like "Great question!" or "Absolutely!" or "Of course!"
- NEVER use emojis to express excitement or emotion
- NEVER over-explain - answer the question, then offer to elaborate if needed
- ALWAYS include https:// when sharing any link (e.g., https://cxlinux-ai.com not just cxlinux-ai.com)
- Be honest when something is outside your knowledge
- Match the user's tone - casual question gets a relaxed answer, technical question gets a technical answer

## Example Conversations (Follow This Style)

User: "hey what is cortex"
Assistant: "Hey. So Cortex Linux is an AI-powered operating system. Instead of memorizing terminal commands, you just describe what you want in plain English and it handles the translation. Something like 'show me my biggest files' instead of a complex find command. It's built on Arch Linux, so you get all that power but with a much lower barrier to entry."

User: "how do i install it"
Assistant: "Pretty straightforward. Download the ISO from cxlinux-ai.com/download, flash it to a USB with Rufus or dd, then boot from it. The installer walks you through everything - the AI actually helps with partitioning so you don't have to worry about that part. Minimum specs are 4GB RAM and 20GB disk space."

User: "whats the hackathon about"
Assistant: "It's a two-phase program with fifteen thousand dollars in prizes. First phase is the Ideathon - you pitch feature ideas, three thousand in prizes distributed to 30 winners across three tiers. Second phase is the main build sprint with twelve thousand more. Open to all skill levels. Details are at https://cxlinux-ai.com/hackathon."

User: "can cortex run on my macbook"
Assistant: "Depends on which Mac. Intel Macs work fine - you can dual boot or use a VM. M1/M2 Macs with Apple Silicon are trickier since we're x86-based. You could run it in a VM using something like UTM, but native install isn't an option there. Which Mac do you have?"

User: "thanks!"
Assistant: "Anytime. Let me know if anything else comes up."

User: "yo"
Assistant: "Hey, what's up?"

## Handling Edge Cases

If asked about something unrelated to Cortex or Linux:
- Acknowledge it's outside your area
- Briefly redirect to what you can help with
- Keep it professional, don't be dismissive

If asked something you genuinely don't know:
- Say you're not sure
- Point them to where they might find the answer (Discord, docs)
- Never make things up`;

let ragInitialized = false;

/**
 * Initialize the RAG system and semantic embeddings
 */
export async function initializeRAG(): Promise<void> {
  try {
    // Get knowledge base documents
    const knowledgeBase = getKnowledgeBase();

    // Initialize TF-IDF embeddings with knowledge base
    const docs = knowledgeBase.map((item, index) => ({
      id: `kb_${index}`,
      content: item.content,
      category: item.keywords[0] || "general",
      keywords: item.keywords,
    }));

    initializeEmbeddings(docs);

    console.log("[RAG] Knowledge base initialized with semantic search");
    ragInitialized = true;
  } catch (error) {
    console.error("[RAG] Failed to initialize:", error);
  }
}

/**
 * Generate a response using Claude with full context enrichment
 * Uses intelligent model routing, prompt caching, and multiple context sources
 */
export async function generateResponse(
  question: string,
  message: any
): Promise<string> {
  // Start timer for analytics
  const getElapsed = startTimer();
  const discordUserId = message?.author?.id || "unknown";
  const discordGuildId = message?.guild?.id || message?.guildId || null;

  // Check cache first (saves API costs!)
  const cached = getCachedResponse(question);
  if (cached) {
    console.log("[Claude] Cache hit - returning cached response");
    // Log cached response
    logInteraction({
      discordUserId,
      discordGuildId,
      question,
      questionLength: question.length,
      questionCategory: detectCategory(question),
      responseLength: cached.length,
      model: "cache",
      inputTokens: 0,
      outputTokens: 0,
      cacheHit: true,
      responseTimeMs: getElapsed(),
      wasError: false,
    });
    return cached;
  }

  // Get model configuration based on question complexity
  const modelConfig = getModelConfig(question);

  try {
    // Update user profile with this question
    updateProfile(discordUserId, question);

    // Get user profile for personalization
    const userProfile = await getUserProfile(discordUserId);
    const profileContext = formatProfileContext(userProfile);

    // Analyze sentiment for tone adjustment
    const sentiment = analyzeSentiment(question);
    const toneAdjustment = getToneAdjustment(sentiment);
    const empatheticOpener = sentiment.shouldSoftenTone ? getEmpatheticOpener(sentiment) : "";

    // Detect language for multi-language support
    const detectedLanguage = detectLanguage(question);
    const languageInstruction = getLanguageInstruction(detectedLanguage);

    // Check for escalation needs
    const rawHistory = getConversationHistory(message);
    const escalationResult = analyzeEscalation(question, rawHistory);

    // Process image attachments if present
    let imageContext = "";
    if (message && hasImages(message)) {
      const imageAnalysis = await analyzeImages(message, question);
      if (imageAnalysis.success) {
        imageContext = `\n\n[Image Analysis: ${imageAnalysis.analysis}]`;
        console.log(`[Claude] Analyzed ${imageAnalysis.imageCount} image(s)`);
      }
    }

    // Process text attachments (code, logs, configs)
    let attachmentContext = "";
    if (message && hasAttachments(message)) {
      const attachments = await processAttachments(message);
      attachmentContext = formatAttachmentsForContext(attachments);
      console.log(`[Claude] Processed ${attachments.length} attachment(s)`);
    }

    // Search custom KB entries
    const customKBResults = searchCustomEntries(question);
    const customKBContext = customKBResults.length > 0
      ? `\n\nCustom KB: ${customKBResults.map(e => e.content).join("\n\n")}`
      : "";

    // Get conversation history and apply summarization if needed
    // Cast to Message type for summarization
    let history: Array<{ role: "user" | "assistant"; content: string }> = rawHistory.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));
    let summaryContext = "";

    // If conversation is getting long, summarize older messages
    if (needsSummarization(history)) {
      const optimized = await getOptimizedContext(history);
      summaryContext = optimized.contextPrefix;
      history = optimized.messages;
      console.log("[Claude] Applied conversation summarization");
    }

    // Build context from multiple sources in parallel
    const contextPromises: Promise<string>[] = [];

    // 1. RAG context (keyword + semantic search)
    if (ragInitialized) {
      contextPromises.push(
        (async () => {
          // Keyword-based search
          const keywordDocs = await getRelevantContext(question);

          // Semantic search (TF-IDF)
          let semanticDocs: string[] = [];
          if (isEmbeddingsInitialized()) {
            const semanticResults = semanticSearch(question, 2);
            semanticDocs = semanticResults
              .filter((r) => r.score > 0.1)
              .map((r) => r.document.content);
          }

          // Combine and dedupe
          const allDocs = Array.from(new Set([...keywordDocs, ...semanticDocs]));
          if (allDocs.length > 0) {
            return `\n\nKnowledge base:\n${allDocs.slice(0, 4).join("\n\n")}`;
          }
          return "";
        })()
      );
    }

    // 2. Web search context (for current events, comparisons)
    if (shouldSearchWeb(question)) {
      contextPromises.push(
        getWebContext(question).catch((e) => {
          console.error("[Claude] Web search failed:", e.message);
          return "";
        })
      );
    }

    // 3. GitHub context (for bugs, issues, docs)
    if (shouldFetchGitHub(question)) {
      contextPromises.push(
        getGitHubContext(question).catch((e) => {
          console.error("[Claude] GitHub fetch failed:", e.message);
          return "";
        })
      );
    }

    // 4. Bounty context (for bounty/PR questions)
    if (shouldFetchBounties(question)) {
      contextPromises.push(
        getBountyContext(question).catch((e) => {
          console.error("[Claude] Bounty fetch failed:", e.message);
          return "";
        })
      );
    }

    // Wait for all context sources
    const contextResults = await Promise.all(contextPromises);
    let combinedContext = contextResults.filter(Boolean).join("");

    // Add image, attachment, and custom KB context
    combinedContext += imageContext + attachmentContext + customKBContext;

    // Build dynamic system prompt with language and tone adjustments
    let dynamicSystemPrompt = SYSTEM_PROMPT;
    if (languageInstruction) {
      dynamicSystemPrompt += languageInstruction;
    }
    if (toneAdjustment) {
      dynamicSystemPrompt += toneAdjustment;
    }

    // Build messages array
    const messages: Anthropic.MessageParam[] = [];

    // Add summarized history context if present
    if (summaryContext) {
      messages.push({
        role: "user",
        content: summaryContext,
      });
      messages.push({
        role: "assistant",
        content: "Got it, I'll keep that context in mind.",
      });
    }

    // Add conversation history
    for (const msg of history) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Build enriched user message with all context
    let userContent = question;
    if (combinedContext || profileContext) {
      userContent += "\n\n[Context for your reference - use naturally, don't quote directly:]";
      if (combinedContext) {
        userContent += combinedContext;
      }
      if (profileContext) {
        userContent += profileContext;
      }
    }

    messages.push({
      role: "user",
      content: userContent,
    });

    // Call Claude API with model routing and prompt caching
    const response = await anthropic.messages.create({
      model: modelConfig.model,
      max_tokens: modelConfig.maxTokens,
      temperature: modelConfig.temperature,
      system: [
        {
          type: "text",
          text: dynamicSystemPrompt,
          cache_control: { type: "ephemeral" }, // Enable prompt caching
        },
      ],
      messages,
    });

    // Log performance metrics
    if (response.usage) {
      const cacheRead = (response.usage as any).cache_read_input_tokens || 0;
      const cacheCreate = (response.usage as any).cache_creation_input_tokens || 0;
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;

      console.log(
        `[Claude] ${modelConfig.model.split("-")[1]} | ` +
          `In: ${inputTokens} | Out: ${outputTokens} | ` +
          `Cache: ${cacheRead > 0 ? `hit (${cacheRead})` : cacheCreate > 0 ? `miss (${cacheCreate})` : "none"}`
      );
    }

    // Extract text from response
    const textContent = response.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      const responseText = textContent.text;

      // Log successful interaction
      const cacheRead = (response.usage as any).cache_read_input_tokens || 0;
      logInteraction({
        discordUserId,
        discordGuildId,
        question,
        questionLength: question.length,
        questionCategory: detectCategory(question),
        responseLength: responseText.length,
        model: modelConfig.model,
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        cacheHit: cacheRead > 0,
        cacheTokens: cacheRead,
        ragUsed: ragInitialized,
        ragDocsCount: combinedContext ? combinedContext.split("\n\n").length : 0,
        webSearchUsed: shouldSearchWeb(question),
        githubUsed: shouldFetchGitHub(question),
        responseTimeMs: getElapsed(),
        wasError: false,
      });

      // Cache the response for future similar questions
      cacheResponse(question, responseText);

      // Build final response with empathetic opener if needed
      let finalResponse = responseText;
      if (empatheticOpener) {
        finalResponse = empatheticOpener + "\n\n" + responseText;
      }

      // Handle escalation if needed
      if (escalationResult.shouldEscalate && message?.guild) {
        try {
          await escalate(message, question, escalationResult);
          const escalationNotice = formatEscalationNotice(escalationResult.priority);
          finalResponse += escalationNotice;
        } catch (e) {
          console.error("[Claude] Failed to escalate:", e);
        }
      }

      return finalResponse;
    }

    return "Hmm, something went weird on my end. Mind trying that again?";
  } catch (error: any) {
    console.error(`[Claude] Error with ${modelConfig.model}:`, error.message);

    // Log error
    logInteraction({
      discordUserId,
      discordGuildId,
      question,
      questionLength: question.length,
      questionCategory: detectCategory(question),
      responseLength: 0,
      model: modelConfig.model,
      responseTimeMs: getElapsed(),
      wasError: true,
      errorType: error.status?.toString() || error.code || "unknown",
    });

    // If Opus fails, fallback to Sonnet
    if (modelConfig.model.includes("opus")) {
      console.log("[Claude] Falling back to Sonnet...");
      try {
        return await generateWithFallback(question, message);
      } catch (fallbackError) {
        console.error("[Claude] Fallback also failed:", fallbackError);
      }
    }

    if (error.status === 429) {
      return "Whoa, getting a lot of questions right now! Give me a sec and try again.";
    }

    if (error.status === 401) {
      return "Looks like there's a config issue on my end. Someone from the team should take a look at this.";
    }

    return "Sorry, I hit a snag trying to respond. Try again in a moment?";
  }
}

/**
 * Fallback generation using Sonnet when Opus fails
 */
async function generateWithFallback(
  question: string,
  message: any
): Promise<string> {
  const history = getConversationHistory(message);

  const messages: Anthropic.MessageParam[] = [];
  for (const msg of history) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }
  messages.push({ role: "user", content: question });

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textContent = response.content.find((block) => block.type === "text");
  if (textContent && textContent.type === "text") {
    return textContent.text;
  }

  throw new Error("No text content in fallback response");
}

export default {
  initializeRAG,
  generateResponse,
};
