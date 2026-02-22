/**
 * Analytics & Logging
 *
 * Comprehensive tracking of bot interactions for:
 * - Performance monitoring
 * - Usage patterns
 * - Quality improvement
 * - Cost tracking
 */

import { db } from "../../db.js";
import { botAnalytics } from "@shared/schema";

interface InteractionMetrics {
  discordUserId: string;
  discordGuildId?: string;
  question: string;
  questionLength?: number;
  questionCategory: string | null;
  responseLength?: number;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  cacheHit: boolean;
  cacheTokens?: number;
  ragUsed?: boolean;
  ragDocsCount?: number;
  webSearchUsed?: boolean;
  githubUsed?: boolean;
  responseTimeMs: number;
  wasError: boolean;
  errorType: string | null;
}

// In-memory buffer for batch inserts
const analyticsBuffer: Partial<InteractionMetrics>[] = [];
const BATCH_SIZE = 10;
const FLUSH_INTERVAL = 30000; // 30 seconds

// Detect question category
const CATEGORY_PATTERNS: Record<string, RegExp> = {
  installation: /\b(install|setup|download|boot|partition|dual.?boot)\b/i,
  features: /\b(natural language|ai command|feature|can|does|how do)\b/i,
  referral: /\b(referral|invite|reward|tier|waitlist)\b/i,
  troubleshooting: /\b(error|problem|issue|fix|broken|not working|help)\b/i,
  technical: /\b(kernel|driver|systemd|pacman|aur|arch|config)\b/i,
  community: /\b(discord|github|contribute|community)\b/i,
  pricing: /\b(price|cost|free|pro|premium|subscription)\b/i,
  general: /\b(what|who|why|when|where|how)\b/i,
};

/**
 * Detect question category
 */
export function detectCategory(question: string): string {
  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(question)) {
      return category;
    }
  }
  return "other";
}

/**
 * Log an interaction to analytics
 */
export async function logInteraction(metrics: Partial<InteractionMetrics>): Promise<void> {
  // Auto-detect category if not provided
  if (!metrics.questionCategory && metrics.question) {
    metrics.questionCategory = detectCategory(metrics.question);
  }

  analyticsBuffer.push(metrics);
  console.log(
    `[Analytics] Logged: ${metrics.model || "unknown"} | ` +
      `${metrics.responseTimeMs || 0}ms | ` +
      `Cat: ${metrics.questionCategory || "unknown"}`
  );

  // Flush if buffer is full
  if (analyticsBuffer.length >= BATCH_SIZE) {
    await flushAnalytics();
  }
}

/**
 * Flush analytics buffer to database
 */
export async function flushAnalytics(): Promise<void> {
  if (analyticsBuffer.length === 0) return;

  const toInsert = analyticsBuffer.splice(0, analyticsBuffer.length);

  try {
    for (const metrics of toInsert) {
      await db.insert(botAnalytics).values({
        discordUserId: metrics.discordUserId || "unknown",
        discordGuildId: metrics.discordGuildId || null,
        question: metrics.question || "",
        questionCategory: metrics.questionCategory || null,
        modelUsed: metrics.model || "unknown",
        tokensUsed: (metrics.inputTokens || 0) + (metrics.outputTokens || 0),
        responseTimeMs: metrics.responseTimeMs || 0,
        wasFromCache: metrics.cacheHit || false,
        successful: !metrics.wasError,
        errorType: metrics.errorType || null,
      });
    }
    console.log(`[Analytics] Flushed ${toInsert.length} records to database`);
  } catch (error) {
    console.error("[Analytics] Failed to flush:", error);
    // Put items back in buffer on failure
    analyticsBuffer.unshift(...toInsert);
  }
}

/**
 * Create a timer for tracking response time
 */
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * Get summary stats from recent interactions
 */
export async function getAnalyticsSummary(hours: number = 24): Promise<{
  totalInteractions: number;
  avgResponseTime: number;
  cacheHitRate: number;
  categoryBreakdown: Record<string, number>;
  modelUsage: Record<string, number>;
  errorRate: number;
}> {
  try {
    // Get recent records (simplified query)
    const records = await db
      .select()
      .from(botAnalytics)
      .limit(1000);

    const total = records.length;
    if (total === 0) {
      return {
        totalInteractions: 0,
        avgResponseTime: 0,
        cacheHitRate: 0,
        categoryBreakdown: {},
        modelUsage: {},
        errorRate: 0,
      };
    }

    const avgTime = records.reduce((sum, r) => sum + (r.responseTimeMs || 0), 0) / total;
    const cacheHits = records.filter((r) => r.wasFromCache).length;
    const errors = records.filter((r) => !r.successful).length;

    const categories: Record<string, number> = {};
    const models: Record<string, number> = {};

    for (const r of records) {
      if (r.questionCategory) {
        categories[r.questionCategory] = (categories[r.questionCategory] || 0) + 1;
      }
      if (r.modelUsed) {
        models[r.modelUsed] = (models[r.modelUsed] || 0) + 1;
      }
    }

    return {
      totalInteractions: total,
      avgResponseTime: Math.round(avgTime),
      cacheHitRate: Math.round((cacheHits / total) * 100),
      categoryBreakdown: categories,
      modelUsage: models,
      errorRate: Math.round((errors / total) * 100),
    };
  } catch (error) {
    console.error("[Analytics] Failed to get summary:", error);
    return {
      totalInteractions: 0,
      avgResponseTime: 0,
      cacheHitRate: 0,
      categoryBreakdown: {},
      modelUsage: {},
      errorRate: 0,
    };
  }
}

// Periodic flush
setInterval(() => {
  flushAnalytics().catch((e) => console.error("[Analytics] Periodic flush failed:", e));
}, FLUSH_INTERVAL);

// Flush on process exit
process.on("beforeExit", async () => {
  await flushAnalytics();
});

export default {
  logInteraction,
  flushAnalytics,
  startTimer,
  getAnalyticsSummary,
  detectCategory,
};
