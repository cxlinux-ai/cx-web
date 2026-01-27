/**
 * Feedback Learning System
 * Stores user feedback to improve response quality over time
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEEDBACK_FILE = join(__dirname, "../../data/feedback.json");
const MAX_EXAMPLES = 50; // Keep top examples for context

// In-memory store
let feedbackData = {
  helpful: [], // Good Q&A pairs to learn from
  unhelpful: [], // Bad Q&A pairs to avoid
  stats: {
    totalHelpful: 0,
    totalUnhelpful: 0,
  },
};

/**
 * Load feedback from disk
 */
export function loadFeedback() {
  try {
    if (existsSync(FEEDBACK_FILE)) {
      const data = readFileSync(FEEDBACK_FILE, "utf-8");
      feedbackData = JSON.parse(data);
      console.log(`[Feedback] Loaded ${feedbackData.helpful.length} good examples, ${feedbackData.unhelpful.length} bad examples`);
    }
  } catch (error) {
    console.error("[Feedback] Error loading feedback:", error.message);
  }
}

/**
 * Save feedback to disk
 */
function saveFeedback() {
  try {
    // Ensure data directory exists
    const dataDir = dirname(FEEDBACK_FILE);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbackData, null, 2));
  } catch (error) {
    console.error("[Feedback] Error saving feedback:", error.message);
  }
}

/**
 * Record feedback for a Q&A pair
 */
export function recordFeedback(question, answer, isHelpful, userId = null) {
  const entry = {
    question: question.slice(0, 500), // Limit size
    answer: answer.slice(0, 1000),
    timestamp: Date.now(),
    userId,
  };

  if (isHelpful) {
    feedbackData.helpful.push(entry);
    feedbackData.stats.totalHelpful++;

    // Keep only top examples (most recent)
    if (feedbackData.helpful.length > MAX_EXAMPLES) {
      feedbackData.helpful = feedbackData.helpful.slice(-MAX_EXAMPLES);
    }
  } else {
    feedbackData.unhelpful.push(entry);
    feedbackData.stats.totalUnhelpful++;

    // Keep recent bad examples to learn from
    if (feedbackData.unhelpful.length > MAX_EXAMPLES) {
      feedbackData.unhelpful = feedbackData.unhelpful.slice(-MAX_EXAMPLES);
    }
  }

  saveFeedback();

  console.log(`[Feedback] Recorded ${isHelpful ? "helpful" : "unhelpful"} feedback. Total: ${feedbackData.stats.totalHelpful}/${feedbackData.stats.totalUnhelpful}`);
}

/**
 * Get good examples for few-shot learning
 * Returns relevant helpful examples to include in prompts
 */
export function getGoodExamples(query, limit = 2) {
  if (feedbackData.helpful.length === 0) return [];

  // Simple keyword matching to find relevant examples
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const scored = feedbackData.helpful.map(example => {
    const text = (example.question + " " + example.answer).toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (text.includes(word)) score++;
    }
    return { example, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.example);
}

/**
 * Get patterns to avoid from bad feedback
 */
export function getBadPatterns() {
  if (feedbackData.unhelpful.length < 3) return null;

  // Analyze recent bad responses for common issues
  const recentBad = feedbackData.unhelpful.slice(-10);

  // Check for common problems
  const issues = [];

  for (const entry of recentBad) {
    if (entry.answer.length > 800) issues.push("too_long");
    if (entry.answer.includes("I'd be happy to")) issues.push("ai_speak");
    if (entry.answer.includes("Great question")) issues.push("ai_speak");
    if ((entry.answer.match(/!/g) || []).length > 2) issues.push("too_enthusiastic");
  }

  const issueCount = {};
  for (const issue of issues) {
    issueCount[issue] = (issueCount[issue] || 0) + 1;
  }

  return issueCount;
}

/**
 * Format examples for inclusion in prompt
 */
export function formatExamplesForPrompt(examples) {
  if (!examples || examples.length === 0) return "";

  let text = "\n\nHere are examples of answers users found helpful:\n";

  for (const ex of examples) {
    text += `\nQ: ${ex.question}\nA: ${ex.answer}\n`;
  }

  return text;
}

/**
 * Get feedback statistics
 */
export function getStats() {
  const total = feedbackData.stats.totalHelpful + feedbackData.stats.totalUnhelpful;
  const helpfulRate = total > 0
    ? Math.round((feedbackData.stats.totalHelpful / total) * 100)
    : 0;

  return {
    totalHelpful: feedbackData.stats.totalHelpful,
    totalUnhelpful: feedbackData.stats.totalUnhelpful,
    helpfulRate,
    storedExamples: feedbackData.helpful.length,
  };
}

// Load on startup
loadFeedback();
