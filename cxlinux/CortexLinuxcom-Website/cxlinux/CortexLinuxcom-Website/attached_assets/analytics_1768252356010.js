/**
 * Analytics System
 * Track questions, satisfaction, peak hours, popular topics
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ANALYTICS_FILE = join(__dirname, "../../data/analytics.json");

let analytics = {
  questions: [], // { question, timestamp, userId, channel, responseTime, faqHit }
  feedback: { helpful: 0, unhelpful: 0 },
  hourlyActivity: {}, // { "0": 5, "1": 2, ... "23": 10 }
  topKeywords: {}, // { "install": 50, "error": 30 }
  dailyStats: {}, // { "2024-01-15": { questions: 10, faqHits: 3 } }
  languages: {}, // { "en": 100, "es": 5 }
};

/**
 * Load analytics from disk
 */
export function loadAnalytics() {
  try {
    if (existsSync(ANALYTICS_FILE)) {
      const data = readFileSync(ANALYTICS_FILE, "utf-8");
      analytics = JSON.parse(data);
      console.log(`[Analytics] Loaded ${analytics.questions.length} question records`);
    }
  } catch (error) {
    console.error("[Analytics] Error loading:", error.message);
  }
}

/**
 * Save analytics to disk
 */
function saveAnalytics() {
  try {
    const dataDir = dirname(ANALYTICS_FILE);
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }

    // Keep only last 1000 questions to prevent file bloat
    if (analytics.questions.length > 1000) {
      analytics.questions = analytics.questions.slice(-1000);
    }

    writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));
  } catch (error) {
    console.error("[Analytics] Error saving:", error.message);
  }
}

/**
 * Extract keywords from a question
 */
function extractKeywords(question) {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "can", "to", "of", "in", "for",
    "on", "with", "at", "by", "from", "as", "into", "through", "during",
    "before", "after", "above", "below", "between", "under", "again",
    "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "just", "and", "but", "if", "or", "because", "until", "while", "this",
    "that", "these", "those", "what", "which", "who", "whom", "i", "me",
    "my", "myself", "we", "our", "you", "your", "he", "him", "his", "she",
    "her", "it", "its", "they", "them", "their",
  ]);

  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Track a question
 */
export function trackQuestion(question, options = {}) {
  const {
    userId = null,
    channel = null,
    responseTime = null,
    faqHit = false,
    language = "en",
  } = options;

  const now = new Date();
  const hour = now.getUTCHours().toString();
  const today = now.toISOString().split("T")[0];

  // Add to questions list
  analytics.questions.push({
    question: question.slice(0, 200),
    timestamp: now.toISOString(),
    userId,
    channel,
    responseTime,
    faqHit,
    language,
  });

  // Update hourly activity
  analytics.hourlyActivity[hour] = (analytics.hourlyActivity[hour] || 0) + 1;

  // Update keywords
  const keywords = extractKeywords(question);
  for (const keyword of keywords) {
    analytics.topKeywords[keyword] = (analytics.topKeywords[keyword] || 0) + 1;
  }

  // Update daily stats
  if (!analytics.dailyStats[today]) {
    analytics.dailyStats[today] = { questions: 0, faqHits: 0 };
  }
  analytics.dailyStats[today].questions++;
  if (faqHit) {
    analytics.dailyStats[today].faqHits++;
  }

  // Update language stats
  analytics.languages[language] = (analytics.languages[language] || 0) + 1;

  saveAnalytics();
}

/**
 * Track feedback
 */
export function trackFeedback(isHelpful) {
  if (isHelpful) {
    analytics.feedback.helpful++;
  } else {
    analytics.feedback.unhelpful++;
  }
  saveAnalytics();
}

/**
 * Get analytics summary
 */
export function getAnalyticsSummary() {
  const totalQuestions = analytics.questions.length;
  const totalFeedback = analytics.feedback.helpful + analytics.feedback.unhelpful;
  const satisfactionRate = totalFeedback > 0
    ? Math.round((analytics.feedback.helpful / totalFeedback) * 100)
    : 0;

  // Find peak hour
  let peakHour = "0";
  let peakCount = 0;
  for (const [hour, count] of Object.entries(analytics.hourlyActivity)) {
    if (count > peakCount) {
      peakHour = hour;
      peakCount = count;
    }
  }

  // Get top 5 keywords
  const topKeywords = Object.entries(analytics.topKeywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => `${word} (${count})`);

  // Today's stats
  const today = new Date().toISOString().split("T")[0];
  const todayStats = analytics.dailyStats[today] || { questions: 0, faqHits: 0 };

  // FAQ hit rate
  const totalFaqHits = Object.values(analytics.dailyStats)
    .reduce((sum, day) => sum + (day.faqHits || 0), 0);
  const faqHitRate = totalQuestions > 0
    ? Math.round((totalFaqHits / totalQuestions) * 100)
    : 0;

  return {
    totalQuestions,
    todayQuestions: todayStats.questions,
    satisfactionRate,
    peakHour: `${peakHour}:00 UTC`,
    topKeywords,
    faqHitRate,
    languages: analytics.languages,
  };
}

/**
 * Get detailed stats for admins
 */
export function getDetailedStats() {
  return {
    ...getAnalyticsSummary(),
    recentQuestions: analytics.questions.slice(-10).reverse(),
    dailyStats: analytics.dailyStats,
    hourlyActivity: analytics.hourlyActivity,
  };
}

// Load on startup
loadAnalytics();
