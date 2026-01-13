/**
 * Sentiment Detection
 *
 * Detect frustrated users and adjust tone or escalate proactively.
 */

// Sentiment patterns and scores
const SENTIMENT_PATTERNS = {
  veryNegative: {
    patterns: [
      /\b(hate|awful|terrible|worst|useless|garbage|trash|sucks)\b/i,
      /\b(waste of time|give up|done with|fed up|sick of)\b/i,
      /\b(ridiculous|pathetic|joke|scam)\b/i,
      /(!{3,}|\?{3,})/,
      /\b(wtf|omg|ffs|damn|crap)\b/i,
    ],
    score: -2,
  },
  negative: {
    patterns: [
      /\b(frustrated|annoying|annoyed|irritated|confused)\b/i,
      /\b(doesn't work|not working|broken|failed|error)\b/i,
      /\b(can't|cannot|won't|unable|stuck)\b/i,
      /\b(wrong|bad|poor|slow|difficult)\b/i,
      /\b(still|again|another|yet another)\b.*\b(issue|problem|error)\b/i,
    ],
    score: -1,
  },
  neutral: {
    patterns: [
      /\b(how|what|where|when|why|which)\b/i,
      /\b(can you|could you|please|thanks)\b/i,
    ],
    score: 0,
  },
  positive: {
    patterns: [
      /\b(thanks|thank you|appreciate|helpful|great|good)\b/i,
      /\b(works|working|solved|fixed|success)\b/i,
      /\b(love|awesome|amazing|excellent|perfect)\b/i,
      /\b(excited|happy|glad|pleased)\b/i,
    ],
    score: 1,
  },
  veryPositive: {
    patterns: [
      /\b(absolutely|incredibly|extremely)\s+(amazing|awesome|helpful)\b/i,
      /\b(best|fantastic|outstanding|brilliant)\b/i,
      /(!+\s*(thanks|thank|awesome|amazing))/i,
      /\b(you're the best|life saver|saved my)\b/i,
    ],
    score: 2,
  },
};

// Frustration escalation indicators
const FRUSTRATION_INDICATORS = [
  { pattern: /\b(tried|already|multiple times|again and again)\b/i, weight: 0.3 },
  { pattern: /\b(nothing works|still not|same error|same issue)\b/i, weight: 0.5 },
  { pattern: /!{2,}/, weight: 0.2 },
  { pattern: /\?{2,}/, weight: 0.2 },
  { pattern: /\bALL CAPS\b/, weight: 0.3 },
  { pattern: /[A-Z]{5,}/, weight: 0.4 }, // Long caps sequences
];

interface SentimentResult {
  score: number; // -2 to 2
  label: "very_negative" | "negative" | "neutral" | "positive" | "very_positive";
  frustrationLevel: number; // 0 to 1
  shouldEscalate: boolean;
  shouldSoftenTone: boolean;
  suggestions: string[];
}

/**
 * Analyze sentiment of a message
 */
export function analyzeSentiment(text: string): SentimentResult {
  let totalScore = 0;
  let matchCount = 0;

  // Check sentiment patterns
  for (const [, config] of Object.entries(SENTIMENT_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(text)) {
        totalScore += config.score;
        matchCount++;
      }
    }
  }

  // Calculate average score
  const avgScore = matchCount > 0 ? totalScore / matchCount : 0;

  // Calculate frustration level
  let frustrationLevel = 0;
  for (const indicator of FRUSTRATION_INDICATORS) {
    if (indicator.pattern.test(text)) {
      frustrationLevel += indicator.weight;
    }
  }
  frustrationLevel = Math.min(1, frustrationLevel);

  // Determine label
  let label: SentimentResult["label"] = "neutral";
  if (avgScore <= -1.5) label = "very_negative";
  else if (avgScore <= -0.5) label = "negative";
  else if (avgScore >= 1.5) label = "very_positive";
  else if (avgScore >= 0.5) label = "positive";

  // Determine actions
  const shouldEscalate = label === "very_negative" || frustrationLevel > 0.7;
  const shouldSoftenTone = label === "negative" || label === "very_negative" || frustrationLevel > 0.4;

  // Generate suggestions
  const suggestions: string[] = [];
  if (shouldSoftenTone) {
    suggestions.push("Use empathetic language");
    suggestions.push("Acknowledge the user's frustration");
  }
  if (shouldEscalate) {
    suggestions.push("Consider escalating to human support");
  }
  if (frustrationLevel > 0.5) {
    suggestions.push("Offer direct solutions, not explanations");
  }

  return {
    score: avgScore,
    label,
    frustrationLevel,
    shouldEscalate,
    shouldSoftenTone,
    suggestions,
  };
}

/**
 * Get tone adjustment for system prompt based on sentiment
 */
export function getToneAdjustment(sentiment: SentimentResult): string {
  if (sentiment.label === "very_negative") {
    return `
IMPORTANT: The user seems very frustrated. Please:
- Acknowledge their frustration sincerely
- Skip pleasantries and get straight to solutions
- Be extra patient and understanding
- Offer to escalate to human support if needed
- Avoid defensive language`;
  }

  if (sentiment.label === "negative" || sentiment.frustrationLevel > 0.4) {
    return `
Note: The user seems frustrated or having trouble. Please:
- Be empathetic and understanding
- Focus on practical solutions
- Acknowledge any difficulties they've experienced
- Be patient with repeated questions`;
  }

  if (sentiment.label === "very_positive") {
    return `
Note: The user seems happy! Feel free to match their energy with enthusiasm.`;
  }

  return "";
}

/**
 * Get empathetic opener based on sentiment
 */
export function getEmpatheticOpener(sentiment: SentimentResult): string {
  if (sentiment.label === "very_negative") {
    const openers = [
      "I hear you, and I'm sorry you're dealing with this.",
      "That sounds really frustrating. Let's figure this out together.",
      "I understand this has been difficult. Let me help.",
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  }

  if (sentiment.label === "negative") {
    const openers = [
      "I understand that can be frustrating.",
      "Let me help sort this out.",
      "I get it, let's see what we can do.",
    ];
    return openers[Math.floor(Math.random() * openers.length)];
  }

  return "";
}

/**
 * Check if message indicates repeat issue
 */
export function isRepeatIssue(text: string): boolean {
  const repeatPatterns = [
    /\b(again|still|yet|another|same)\b.*\b(error|issue|problem|not working)\b/i,
    /\b(tried|already|multiple|several)\s+times\b/i,
    /\b(keeps|keep)\s+(happening|occurring|failing)\b/i,
  ];

  return repeatPatterns.some((pattern) => pattern.test(text));
}

/**
 * Extract emotion indicators for logging
 */
export function extractEmotionIndicators(text: string): string[] {
  const indicators: string[] = [];

  if (/!{2,}/.test(text)) indicators.push("exclamations");
  if (/\?{2,}/.test(text)) indicators.push("questions");
  if (/[A-Z]{5,}/.test(text)) indicators.push("caps");
  if (isRepeatIssue(text)) indicators.push("repeat_issue");

  const sentiment = analyzeSentiment(text);
  indicators.push(`sentiment:${sentiment.label}`);

  return indicators;
}

/**
 * Get conversation health score
 */
export function getConversationHealth(
  messages: Array<{ role: string; content: string }>
): {
  health: "good" | "concerning" | "poor";
  trend: "improving" | "stable" | "declining";
} {
  const userMessages = messages.filter((m) => m.role === "user");

  if (userMessages.length < 2) {
    return { health: "good", trend: "stable" };
  }

  const sentiments = userMessages.map((m) => analyzeSentiment(m.content));
  const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
  const avgFrustration = sentiments.reduce((sum, s) => sum + s.frustrationLevel, 0) / sentiments.length;

  // Determine health
  let health: "good" | "concerning" | "poor" = "good";
  if (avgScore < -0.5 || avgFrustration > 0.5) health = "concerning";
  if (avgScore < -1 || avgFrustration > 0.7) health = "poor";

  // Determine trend (compare first half to second half)
  const midpoint = Math.floor(sentiments.length / 2);
  const firstHalf = sentiments.slice(0, midpoint);
  const secondHalf = sentiments.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length;

  let trend: "improving" | "stable" | "declining" = "stable";
  if (secondAvg > firstAvg + 0.3) trend = "improving";
  if (secondAvg < firstAvg - 0.3) trend = "declining";

  return { health, trend };
}

export default {
  analyzeSentiment,
  getToneAdjustment,
  getEmpatheticOpener,
  isRepeatIssue,
  extractEmotionIndicators,
  getConversationHealth,
};
