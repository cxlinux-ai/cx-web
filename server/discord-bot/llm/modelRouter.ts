/**
 * Model Router
 *
 * Intelligently routes questions to the most appropriate Claude model:
 * - Opus 4: Complex technical questions, debugging, architecture
 * - Sonnet: General questions, explanations, moderate complexity
 * - Haiku: Simple greetings, FAQs, quick lookups
 */

export type ModelTier = "opus" | "sonnet" | "haiku";

export interface ModelConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

const MODEL_CONFIGS: Record<ModelTier, ModelConfig> = {
  opus: {
    model: "claude-opus-4-20250514",
    maxTokens: 1024,
    temperature: 0.7,
  },
  sonnet: {
    model: "claude-sonnet-4-20250514",
    maxTokens: 500,
    temperature: 0.7,
  },
  haiku: {
    model: "claude-haiku-4-20250514",
    maxTokens: 300,
    temperature: 0.5,
  },
};

// Patterns that indicate simple questions (use Haiku - cheapest)
const SIMPLE_PATTERNS = [
  /^(hi|hey|hello|sup|yo|hola|howdy)\b/i,
  /^(thanks|thank you|thx|ty)\b/i,
  /^(bye|goodbye|cya|later)\b/i,
  /^(ok|okay|sure|cool|nice|great|got it|understood)\b/i,
  /^what('s| is) (your name|cx)/i,
  /^who are you/i,
  /^(gm|gn|good morning|good night)\b/i,
  /^(what|where|when|how).{0,20}(hackathon|referral|discord|install|download)/i,
  /^(tell me about|what is|explain) (cx|the hackathon|referral)/i,
  /^how (do i|can i|to) (join|sign up|register|install|download)/i,
  /^(where|what).{0,10}(link|url|website|discord)/i,
  /^(is it|is cx) free/i,
  /^what (are the|is the) (requirements?|specs?)/i,
];

// Patterns that indicate complex questions (use Opus)
const COMPLEX_PATTERNS = [
  /\b(debug|debugging|error|exception|stack trace|traceback)\b/i,
  /\b(architecture|design pattern|best practice|trade-?off)\b/i,
  /\b(compare|comparison|versus|vs\.?|difference between)\b/i,
  /\b(how (does|do) .+ work|explain .+ in detail|deep dive)\b/i,
  /\b(implement|implementation|build|create|develop)\b/i,
  /\b(optimize|optimization|performance|efficient)\b/i,
  /\b(security|vulnerability|exploit|attack)\b/i,
  /\b(migrate|migration|upgrade|convert)\b/i,
  /\b(integrate|integration|api|sdk)\b/i,
  /\bwhy (does|do|is|are|can't|won't|doesn't)\b/i,
  /\b(step.by.step|walkthrough|tutorial|guide me)\b/i,
];

// Keywords that add complexity weight
const COMPLEXITY_KEYWORDS = [
  "kernel",
  "driver",
  "systemd",
  "bootloader",
  "partition",
  "grub",
  "btrfs",
  "zfs",
  "encryption",
  "selinux",
  "apparmor",
  "containerization",
  "virtualization",
  "docker",
  "kubernetes",
  "networking",
  "firewall",
  "iptables",
  "compilation",
  "makefile",
  "cmake",
];

/**
 * Analyze question complexity and return appropriate model tier
 */
export function detectComplexity(question: string): ModelTier {
  const lowerQuestion = question.toLowerCase().trim();
  const wordCount = question.split(/\s+/).length;

  // Very short messages are usually simple
  if (wordCount <= 3) {
    for (const pattern of SIMPLE_PATTERNS) {
      if (pattern.test(lowerQuestion)) {
        return "haiku";
      }
    }
  }

  // Check for complex patterns first (they take priority)
  let complexityScore = 0;

  for (const pattern of COMPLEX_PATTERNS) {
    if (pattern.test(lowerQuestion)) {
      complexityScore += 2;
    }
  }

  // Check for complexity keywords
  for (const keyword of COMPLEXITY_KEYWORDS) {
    if (lowerQuestion.includes(keyword)) {
      complexityScore += 1;
    }
  }

  // Question length adds to complexity
  if (wordCount > 30) {
    complexityScore += 1;
  }
  if (wordCount > 50) {
    complexityScore += 1;
  }

  // Multiple question marks suggest multi-part question
  const questionMarks = (question.match(/\?/g) || []).length;
  if (questionMarks > 1) {
    complexityScore += 1;
  }

  // Route based on score
  if (complexityScore >= 3) {
    return "opus";
  } else if (complexityScore >= 1) {
    return "sonnet";
  }

  // Check for simple patterns
  for (const pattern of SIMPLE_PATTERNS) {
    if (pattern.test(lowerQuestion)) {
      return "haiku";
    }
  }

  // Default to sonnet for unknown patterns
  return "sonnet";
}

/**
 * Get model configuration for a question
 */
export function getModelConfig(question: string): ModelConfig {
  const tier = detectComplexity(question);
  console.log(`[ModelRouter] Question routed to: ${tier}`);
  return MODEL_CONFIGS[tier];
}

/**
 * Get model config by tier directly
 */
export function getModelConfigByTier(tier: ModelTier): ModelConfig {
  return MODEL_CONFIGS[tier];
}

export default {
  detectComplexity,
  getModelConfig,
  getModelConfigByTier,
};
