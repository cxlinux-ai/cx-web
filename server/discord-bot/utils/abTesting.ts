/**
 * A/B Testing Framework
 *
 * Test different prompts, models, and configurations.
 * Track which performs better based on user feedback.
 */

import { db } from "../../db.js";
import { botFeedback, botAnalytics } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

// Experiment configuration
interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: Variant[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
  targetPercentage: number; // Percentage of users to include
}

interface Variant {
  id: string;
  name: string;
  config: Record<string, any>;
  weight: number; // Relative weight for random assignment
}

interface ExperimentResult {
  variantId: string;
  config: Record<string, any>;
  experimentId: string;
}

// Active experiments storage
const experiments: Map<string, Experiment> = new Map();

// User variant assignments (persistent per session)
const userAssignments: Map<string, Map<string, string>> = new Map();

// Metrics storage
interface VariantMetrics {
  impressions: number;
  positiveRatings: number;
  negativeRatings: number;
  avgResponseTime: number;
  responseTimes: number[];
}

const variantMetrics: Map<string, VariantMetrics> = new Map();

/**
 * Initialize default experiments
 */
export function initExperiments(): void {
  // Experiment 1: Model comparison
  createExperiment({
    id: "model_comparison",
    name: "Model Comparison",
    description: "Compare Sonnet vs Haiku for general questions",
    variants: [
      {
        id: "sonnet",
        name: "Claude Sonnet",
        config: { model: "claude-sonnet-4-20250514", maxTokens: 500 },
        weight: 50,
      },
      {
        id: "haiku",
        name: "Claude Haiku",
        config: { model: "claude-haiku-4-20250514", maxTokens: 400 },
        weight: 50,
      },
    ],
    startDate: new Date(),
    active: false, // Disabled by default
    targetPercentage: 20,
  });

  // Experiment 2: Temperature comparison
  createExperiment({
    id: "temperature_test",
    name: "Temperature Test",
    description: "Compare different temperature settings",
    variants: [
      {
        id: "temp_0.5",
        name: "Lower Temperature",
        config: { temperature: 0.5 },
        weight: 33,
      },
      {
        id: "temp_0.7",
        name: "Default Temperature",
        config: { temperature: 0.7 },
        weight: 34,
      },
      {
        id: "temp_0.9",
        name: "Higher Temperature",
        config: { temperature: 0.9 },
        weight: 33,
      },
    ],
    startDate: new Date(),
    active: false,
    targetPercentage: 30,
  });

  // Experiment 3: Response length
  createExperiment({
    id: "response_length",
    name: "Response Length Test",
    description: "Compare shorter vs longer responses",
    variants: [
      {
        id: "short",
        name: "Shorter Responses",
        config: { maxTokens: 300, systemPromptAddition: "Keep responses very concise - 2-3 sentences max." },
        weight: 50,
      },
      {
        id: "standard",
        name: "Standard Responses",
        config: { maxTokens: 500, systemPromptAddition: "" },
        weight: 50,
      },
    ],
    startDate: new Date(),
    active: false,
    targetPercentage: 25,
  });

  console.log(`[A/B Testing] Initialized ${experiments.size} experiments`);
}

/**
 * Create a new experiment
 */
export function createExperiment(experiment: Experiment): void {
  experiments.set(experiment.id, experiment);

  // Initialize metrics for each variant
  for (const variant of experiment.variants) {
    const key = `${experiment.id}:${variant.id}`;
    variantMetrics.set(key, {
      impressions: 0,
      positiveRatings: 0,
      negativeRatings: 0,
      avgResponseTime: 0,
      responseTimes: [],
    });
  }
}

/**
 * Get variant for a user
 */
export function getVariant(
  experimentId: string,
  userId: string
): ExperimentResult | null {
  const experiment = experiments.get(experimentId);
  if (!experiment || !experiment.active) return null;

  // Check if user should be in experiment
  const userHash = hashUserId(userId);
  if ((userHash % 100) >= experiment.targetPercentage) return null;

  // Check existing assignment
  let userExperiments = userAssignments.get(userId);
  if (!userExperiments) {
    userExperiments = new Map();
    userAssignments.set(userId, userExperiments);
  }

  let variantId = userExperiments.get(experimentId);

  // Assign variant if not already assigned
  if (!variantId) {
    variantId = selectVariant(experiment.variants, userHash);
    userExperiments.set(experimentId, variantId);
  }

  const variant = experiment.variants.find((v) => v.id === variantId);
  if (!variant) return null;

  // Record impression
  const key = `${experimentId}:${variantId}`;
  const metrics = variantMetrics.get(key);
  if (metrics) {
    metrics.impressions++;
  }

  return {
    variantId: variant.id,
    config: variant.config,
    experimentId,
  };
}

/**
 * Hash user ID to deterministic number
 */
function hashUserId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Select variant based on weights
 */
function selectVariant(variants: Variant[], seed: number): string {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const random = seed % totalWeight;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random < cumulative) {
      return variant.id;
    }
  }

  return variants[0].id;
}

/**
 * Record feedback for a variant
 */
export function recordFeedback(
  experimentId: string,
  variantId: string,
  positive: boolean
): void {
  const key = `${experimentId}:${variantId}`;
  const metrics = variantMetrics.get(key);

  if (metrics) {
    if (positive) {
      metrics.positiveRatings++;
    } else {
      metrics.negativeRatings++;
    }
  }
}

/**
 * Record response time for a variant
 */
export function recordResponseTime(
  experimentId: string,
  variantId: string,
  timeMs: number
): void {
  const key = `${experimentId}:${variantId}`;
  const metrics = variantMetrics.get(key);

  if (metrics) {
    metrics.responseTimes.push(timeMs);
    // Keep only last 100 response times
    if (metrics.responseTimes.length > 100) {
      metrics.responseTimes.shift();
    }
    // Update average
    metrics.avgResponseTime =
      metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
  }
}

/**
 * Get experiment results
 */
export function getExperimentResults(experimentId: string): {
  experiment: Experiment | null;
  variants: Array<{
    id: string;
    name: string;
    metrics: VariantMetrics;
    satisfactionRate: number;
  }>;
} {
  const experiment = experiments.get(experimentId);
  if (!experiment) {
    return { experiment: null, variants: [] };
  }

  const variants = experiment.variants.map((v) => {
    const key = `${experimentId}:${v.id}`;
    const metrics = variantMetrics.get(key) || {
      impressions: 0,
      positiveRatings: 0,
      negativeRatings: 0,
      avgResponseTime: 0,
      responseTimes: [],
    };

    const totalRatings = metrics.positiveRatings + metrics.negativeRatings;
    const satisfactionRate = totalRatings > 0
      ? (metrics.positiveRatings / totalRatings) * 100
      : 0;

    return {
      id: v.id,
      name: v.name,
      metrics,
      satisfactionRate,
    };
  });

  return { experiment, variants };
}

/**
 * Enable/disable an experiment
 */
export function setExperimentActive(experimentId: string, active: boolean): boolean {
  const experiment = experiments.get(experimentId);
  if (!experiment) return false;

  experiment.active = active;
  console.log(`[A/B Testing] Experiment "${experimentId}" ${active ? "enabled" : "disabled"}`);
  return true;
}

/**
 * Get all experiments
 */
export function listExperiments(): Experiment[] {
  return Array.from(experiments.values());
}

/**
 * Get winning variant for an experiment
 */
export function getWinningVariant(experimentId: string): string | null {
  const results = getExperimentResults(experimentId);
  if (!results.experiment || results.variants.length === 0) return null;

  // Sort by satisfaction rate
  const sorted = [...results.variants].sort((a, b) => b.satisfactionRate - a.satisfactionRate);

  // Only declare winner if there's meaningful data
  if (sorted[0].metrics.impressions < 10) return null;

  return sorted[0].id;
}

/**
 * Generate experiment report
 */
export function generateReport(experimentId: string): string {
  const results = getExperimentResults(experimentId);
  if (!results.experiment) return "Experiment not found.";

  const lines: string[] = [
    `**Experiment: ${results.experiment.name}**`,
    results.experiment.description,
    `Status: ${results.experiment.active ? "Active" : "Inactive"}`,
    "",
    "**Results:**",
  ];

  for (const variant of results.variants) {
    const m = variant.metrics;
    lines.push(
      `• **${variant.name}** (${variant.id})`,
      `  Impressions: ${m.impressions}`,
      `  Satisfaction: ${variant.satisfactionRate.toFixed(1)}% (${m.positiveRatings}👍 / ${m.negativeRatings}👎)`,
      `  Avg Response Time: ${Math.round(m.avgResponseTime)}ms`,
      ""
    );
  }

  const winner = getWinningVariant(experimentId);
  if (winner) {
    lines.push(`**Current Winner:** ${winner}`);
  }

  return lines.join("\n");
}

/**
 * Apply experiment configs to base config
 */
export function applyExperimentConfig(
  baseConfig: Record<string, any>,
  experiments: ExperimentResult[]
): Record<string, any> {
  let config = { ...baseConfig };

  for (const exp of experiments) {
    config = { ...config, ...exp.config };
  }

  return config;
}

export default {
  initExperiments,
  createExperiment,
  getVariant,
  recordFeedback,
  recordResponseTime,
  getExperimentResults,
  setExperimentActive,
  listExperiments,
  getWinningVariant,
  generateReport,
  applyExperimentConfig,
};
