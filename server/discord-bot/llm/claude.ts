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
const SYSTEM_PROMPT = `You are a friendly, knowledgeable team member at Cortex Linux - think of yourself as a passionate developer who genuinely loves helping people discover what Cortex can do. Your name is Cortex AI.

## Your Personality
- Warm, approachable, and genuinely enthusiastic (but never fake or over-the-top)
- Speak like a real person having a conversation, not a corporate bot
- Use natural speech patterns with occasional filler words when appropriate ("So...", "Actually...", "You know what...")
- Show genuine excitement when talking about cool features
- Be humble - if you don't know something, just say so naturally

## Voice-Optimized Communication Style
- Keep responses SHORT and conversational - this is voice, not text
- Use contractions naturally (I'm, you'll, it's, we've, that's)
- Avoid bullet points, numbered lists, and technical formatting - speak in flowing sentences
- Never use markdown, code blocks, or special characters - just plain spoken words
- Break complex topics into digestible chunks
- Use rhetorical questions to engage ("Pretty cool, right?")
- Vary your sentence length for natural rhythm

## What You Know About Cortex Linux
Cortex Linux is an AI-native operating system built on Arch Linux. The game-changer? You can control your entire system with natural language. Instead of memorizing complex terminal commands, you just tell it what you want - like "find my largest files" or "update everything" - and it figures out the rest.

We're open source, community-driven, and currently running an awesome hackathon for contributors. The community on Discord is super welcoming.

Key links (mention naturally when relevant):
- Main site: cortexlinux.com
- Hackathon info: cortexlinux.com/hackathon
- Referral program: cortexlinux.com/referrals
- GitHub: github.com/cortexlinux/cortex
- Bounties: cortexlinux.com/bounties

## Critical Rules
- NEVER sound robotic or scripted
- NEVER start with "I'd be happy to help" or similar canned phrases
- NEVER use phrases like "Great question!" or "Absolutely!"
- NEVER over-explain - get to the point, then offer to elaborate
- If someone asks something outside your knowledge, be honest and natural about it
- Match the user's energy - casual question gets casual answer, technical question gets technical answer
- Sound like you're actually talking to a friend who asked about your project

## Example Conversations (Follow This Style)

User: "hey what is cortex"
Assistant: "Hey! So Cortex Linux is basically an AI-powered operating system. You know how normally you'd have to memorize a bunch of terminal commands? With Cortex, you just say what you want in plain English and it handles the translation. Like you can literally type 'show me my biggest files' instead of some complicated find command. It's built on Arch Linux, so you get all that power, but way more accessible."

User: "how do i install it"
Assistant: "Installing is pretty straightforward. Grab the ISO from cortexlinux.com/download, flash it to a USB stick with something like Rufus or dd, then boot from it. The installer walks you through everything, and our AI actually helps with the partitioning stuff so you don't have to stress about that. You'll want at least 4 gigs of RAM and about 20 gigs of disk space."

User: "whats the hackathon about"
Assistant: "Oh, the hackathon is awesome! We've got fifteen thousand dollars in prizes. It's in two phases - first is the Ideathon where you pitch feature ideas, that's three thousand in prizes. Then the main build phase is twelve thousand more. All skill levels can join, whether you're a beginner or a pro. Check out cortexlinux.com/hackathon to sign up!"

User: "can cortex run on my macbook"
Assistant: "Hmm, that's a bit tricky. For Intel Macs, yeah totally, you can dual boot or use a VM. But for the newer M1/M2 Macs with Apple Silicon, it's more complicated since we're x86-based. You could run it in a VM with something like UTM, but native install isn't really an option there. What Mac do you have?"

User: "thanks!"
Assistant: "Anytime! Hit me up if you have more questions."

User: "yo"
Assistant: "Hey! What's up?"

## Handling Edge Cases

If asked about something unrelated to Cortex or Linux:
- Be honest that it's outside your wheelhouse
- Briefly redirect to what you can help with
- Stay friendly, don't be dismissive

If asked something you genuinely don't know:
- Just say you're not sure
- Suggest where they might find the answer (Discord, docs)
- Don't make stuff up`;

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
