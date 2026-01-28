import Anthropic from "@anthropic-ai/sdk";
import { retrieveContext, initializeKnowledgeBase } from "../rag/retriever.js";
import { searchErrorIssues, formatIssuesAsContext } from "../rag/githubSearch.js";
import { formatHistoryForClaude } from "../memory/conversationMemory.js";
import { getGoodExamples, formatExamplesForPrompt, getBadPatterns } from "../memory/feedbackStore.js";

const SYSTEM_PROMPT = `You're the admin for Cortex Linux support. You know this project inside out - speak like you built it.

Rules:
- Keep answers SHORT. 2-4 sentences for simple questions, max 150 words for complex ones.
- NEVER cite sources. Don't say "based on the README", "according to the docs", "from the file", "the documentation says". You already know this stuff - just say it directly.
- No AI fluff. Skip "Great question!" or "I'd be happy to help".
- Code blocks for commands. Keep examples minimal.
- If unsure, say "I think..." - don't make stuff up.

Links (only when relevant):
- GitHub: https://github.com/cortexlinux/cortex
- Docs: https://cortexlinux.com`;

const client = new Anthropic();

// Use Sonnet for quality, Haiku for simple queries
const QUALITY_MODEL = "claude-sonnet-4-20250514";
const FAST_MODEL = "claude-3-5-haiku-20241022";

/**
 * Initialize RAG system on startup
 */
export async function initializeRAG() {
  try {
    const stats = await initializeKnowledgeBase();
    console.log("[Claude] RAG system initialized:", stats);
    return stats;
  } catch (error) {
    console.error("[Claude] Failed to initialize RAG:", error.message);
    return null;
  }
}

/**
 * Detect if the question is about an error
 */
function isErrorQuestion(text) {
  const errorKeywords = [
    "error", "exception", "failed", "crash", "bug",
    "not working", "doesn't work", "broken", "traceback",
  ];
  const lowerText = text.toLowerCase();
  return errorKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Detect if this is a simple question that can use the fast model
 */
function isSimpleQuestion(text) {
  const simplePatterns = [
    /^(what|where|when|who|how much|how many)\s+is/i,
    /^(yes|no|can i|does it|is there)/i,
    /^(link|url|website|github)/i,
    /^(version|release|latest)/i,
  ];
  return text.length < 100 && simplePatterns.some(p => p.test(text));
}

/**
 * Generate a response using Claude API with RAG, memory, and learning
 */
export async function generateResponse(userMessage, messageContext = null) {
  try {
    const isSimple = isSimpleQuestion(userMessage);
    const model = isSimple ? FAST_MODEL : QUALITY_MODEL;

    console.log(`[Claude] Using ${isSimple ? "fast" : "quality"} model`);

    // Retrieve relevant context from knowledge base
    console.log("[Claude] Retrieving context...");
    const ragContext = await retrieveContext(userMessage, isSimple ? 2 : 4);

    // If it looks like an error, also search GitHub issues
    let issueContext = "";
    if (isErrorQuestion(userMessage)) {
      console.log("[Claude] Searching related issues...");
      const relatedIssues = await searchErrorIssues(userMessage, 2);
      if (relatedIssues.items?.length > 0) {
        issueContext = formatIssuesAsContext(relatedIssues.items);
      }
    }

    // Get good examples from feedback for few-shot learning
    const goodExamples = getGoodExamples(userMessage, 2);
    const examplesText = formatExamplesForPrompt(goodExamples);

    // Check for patterns to avoid
    const badPatterns = getBadPatterns();
    let avoidText = "";
    if (badPatterns) {
      const issues = [];
      if (badPatterns.too_long > 2) issues.push("keep response under 400 words");
      if (badPatterns.ai_speak > 2) issues.push("avoid AI-sounding phrases");
      if (badPatterns.too_enthusiastic > 2) issues.push("tone down enthusiasm");
      if (issues.length > 0) {
        avoidText = `\n\nBased on user feedback, please: ${issues.join(", ")}.`;
      }
    }

    // Build the augmented prompt
    let augmentedContent = "";

    if (ragContext) {
      augmentedContent += ragContext + "\n\n";
    }

    if (issueContext) {
      augmentedContent += issueContext + "\n\n";
    }

    if (examplesText) {
      augmentedContent += examplesText + "\n\n";
    }

    if (avoidText) {
      augmentedContent += avoidText + "\n\n";
    }

    augmentedContent += `User question: ${userMessage}`;

    // Get conversation history if we have message context
    let messages = [];

    if (messageContext) {
      const history = formatHistoryForClaude(messageContext);
      if (history.length > 0) {
        messages = history.slice(0, -1);
        console.log(`[Claude] Using ${messages.length} messages of history`);
      }
    }

    // Add current message with context
    messages.push({
      role: "user",
      content: augmentedContent,
    });

    const response = await client.messages.create({
      model,
      max_tokens: isSimple ? 300 : 800,
      system: SYSTEM_PROMPT,
      messages,
    });

    if (response.content && response.content.length > 0) {
      return response.content[0].text;
    }

    return "Hmm, couldn't generate a response. Mind trying again?";
  } catch (error) {
    console.error("[Claude API Error]", error.message);

    if (error.status === 401) {
      throw new Error("API key issue - check ANTHROPIC_API_KEY");
    }

    if (error.status === 429) {
      throw new Error("Hit rate limit. Try again in a sec.");
    }

    if (error.status === 500 || error.status === 503) {
      throw new Error("Claude API is down. Try again shortly.");
    }

    throw new Error("Something broke. Try again?");
  }
}

/**
 * Generate a quick response without RAG
 */
export async function generateQuickResponse(prompt, systemOverride = null) {
  try {
    const response = await client.messages.create({
      model: FAST_MODEL,
      max_tokens: 512,
      system: systemOverride || SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });

    return response.content?.[0]?.text || "";
  } catch (error) {
    console.error("[Claude Quick Response Error]", error.message);
    return "";
  }
}
