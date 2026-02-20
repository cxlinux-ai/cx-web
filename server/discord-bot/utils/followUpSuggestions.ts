/**
 * Follow-up Question Suggestions
 *
 * Suggests relevant follow-up questions based on the topic discussed.
 * Helps users discover more about CX Linux.
 */

interface FollowUpSet {
  keywords: string[];
  suggestions: string[];
}

// Topic-based follow-up suggestions
const FOLLOW_UP_SETS: FollowUpSet[] = [
  {
    keywords: ["what is", "cortex", "about", "overview"],
    suggestions: [
      "How do I install it?",
      "What can I do with natural language commands?",
      "Is it free?",
    ],
  },
  {
    keywords: ["install", "setup", "download"],
    suggestions: [
      "What are the system requirements?",
      "Can I dual boot with Windows?",
      "How do I try it in a VM first?",
    ],
  },
  {
    keywords: ["hackathon", "competition", "prize"],
    suggestions: [
      "How do I register?",
      "What are the prizes?",
      "Can I participate solo?",
    ],
  },
  {
    keywords: ["referral", "invite", "reward"],
    suggestions: [
      "What rewards can I earn?",
      "How does the tier system work?",
      "Where do I get my referral link?",
    ],
  },
  {
    keywords: ["natural language", "command", "ai"],
    suggestions: [
      "What commands can I use?",
      "Does it work offline?",
      "How accurate is it?",
    ],
  },
  {
    keywords: ["error", "problem", "issue", "help"],
    suggestions: [
      "Where can I get support?",
      "Is there a Discord community?",
      "How do I check system logs?",
    ],
  },
  {
    keywords: ["discord", "community", "chat"],
    suggestions: [
      "What channels are available?",
      "How do I get verified?",
      "Is there a hackathon channel?",
    ],
  },
  {
    keywords: ["pro", "premium", "price", "paid"],
    suggestions: [
      "What's included in free?",
      "When does Pro launch?",
      "How do I get early access?",
    ],
  },
  {
    keywords: ["arch", "pacman", "package", "aur"],
    suggestions: [
      "Can I use the AUR?",
      "How do I install packages?",
      "Is it fully compatible with Arch?",
    ],
  },
  {
    keywords: ["vm", "virtual", "virtualbox"],
    suggestions: [
      "What VM settings do you recommend?",
      "Does it work on Apple Silicon?",
      "Can I use it in VMware?",
    ],
  },
];

// Generic fallback suggestions
const GENERIC_SUGGESTIONS = [
  "Tell me about the hackathon",
  "How do I join the community?",
  "What makes Cortex different?",
];

/**
 * Get follow-up suggestions based on the question asked
 */
export function getFollowUpSuggestions(question: string): string[] {
  const lowerQuestion = question.toLowerCase();

  // Find matching follow-up set
  for (const set of FOLLOW_UP_SETS) {
    const matches = set.keywords.filter((kw) => lowerQuestion.includes(kw));
    if (matches.length > 0) {
      // Shuffle and return 2-3 suggestions
      const shuffled = [...set.suggestions].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
    }
  }

  // Return generic suggestions
  return GENERIC_SUGGESTIONS.slice(0, 2);
}

/**
 * Format follow-up suggestions as a string
 */
export function formatFollowUps(suggestions: string[]): string {
  if (suggestions.length === 0) return "";

  return `\n\n-# You might also want to ask: ${suggestions.join(" | ")}`;
}

/**
 * Decide whether to show follow-ups (not for simple exchanges)
 */
export function shouldShowFollowUps(question: string, answer: string): boolean {
  // Don't show for very short questions (greetings, thanks, etc.)
  if (question.split(/\s+/).length <= 3) return false;

  // Don't show for very short answers
  if (answer.length < 100) return false;

  // Don't show if answer already has follow-up suggestion
  if (answer.includes("?") && answer.split("?").length > 2) return false;

  // 70% chance to show follow-ups (avoid being annoying)
  return Math.random() < 0.7;
}

export default {
  getFollowUpSuggestions,
  formatFollowUps,
  shouldShowFollowUps,
};
