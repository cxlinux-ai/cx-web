/**
 * FAQ Cache - Instant answers for common questions
 * No API calls needed for frequently asked questions
 */

// Common questions and their instant answers
const FAQ_ENTRIES = [
  {
    triggers: ["what is cortex", "what's cortex", "what does cortex do", "explain cortex"],
    answer: "Cortex is an AI layer for Linux that lets you install packages using natural language. Instead of memorizing package names, you just describe what you need like \"something to edit PDFs\" and Cortex figures out the right packages to install.",
  },
  {
    triggers: ["how to install", "how do i install", "installation", "install cortex", "setup cortex"],
    answer: "Install with pip:\n```bash\npip install cortex-linux\n```\nThen set up an LLM (Ollama for free/local, or add your Claude/OpenAI API key to `.env`). Run `cortex --version` to verify.",
  },
  {
    triggers: ["requirements", "system requirements", "what do i need", "prerequisites"],
    answer: "You need Ubuntu 22.04+ (or Debian 12+), Python 3.10+, and about 4GB RAM. For the LLM, either run Ollama locally or use a Claude/OpenAI API key.",
  },
  {
    triggers: ["dry run", "dry-run", "what is dry run", "safe mode"],
    answer: "Dry-run is the default mode - Cortex shows what it *would* install without actually doing it. Add `--execute` to actually install packages. This keeps you safe from accidental installs.",
  },
  {
    triggers: ["rollback", "undo", "revert", "undo install"],
    answer: "Run `cortex rollback` to undo the last installation. Cortex keeps a transaction history so you can always go back if something breaks.",
  },
  {
    triggers: ["ollama", "local llm", "free llm", "offline"],
    answer: "For free local inference, install Ollama and run:\n```bash\npython scripts/setup_ollama.py\n```\nThis sets up a local LLM so you don't need API keys or internet for queries.",
  },
  {
    triggers: ["api key", "claude key", "openai key", "anthropic key"],
    answer: "Add your API key to `.env`:\n```\nANTHROPIC_API_KEY=your-key-here\n```\nor for OpenAI:\n```\nOPENAI_API_KEY=your-key-here\n```\nCortex auto-detects which one you have.",
  },
  {
    triggers: ["sandbox", "firejail", "isolation", "security"],
    answer: "Cortex runs installations in Firejail sandboxes for security. This isolates package installations so they can't mess with your system. You can disable it with `--no-sandbox` if needed.",
  },
  {
    triggers: ["docker", "container", "docker support"],
    answer: "Cortex works in Docker. It includes a permission fixer for root-owned bind mount issues. Just `pip install cortex-linux` in your container.",
  },
  {
    triggers: ["supported llms", "which llms", "llm providers", "models"],
    answer: "Cortex supports Claude (Anthropic), GPT-4 (OpenAI), and Ollama (local). Claude gives the best results, Ollama is free and offline. Set your preferred provider in `.env`.",
  },
  {
    triggers: ["license", "open source", "is it free"],
    answer: "Cortex is open source under Apache 2.0. Completely free to use. The only cost is if you use cloud LLM APIs (Claude/OpenAI), but you can use Ollama for free local inference.",
  },
  {
    triggers: ["github", "source code", "repo", "repository"],
    answer: "GitHub: https://github.com/cxlinux-ai/cortex\nWebsite: https://cxlinux-ai.com",
  },
  {
    triggers: ["help", "commands", "how to use", "usage"],
    answer: "Basic usage:\n```bash\ncortex \"something to edit videos\"  # dry-run\ncortex \"pdf editor\" --execute      # actually install\ncortex rollback                     # undo last install\ncortex --help                       # all options\n```",
  },
  {
    triggers: ["not working", "doesn't work", "broken", "error"],
    answer: "Can you share the error message? Common fixes:\n1. Check your API key is set correctly\n2. Run `cortex --version` to verify installation\n3. Try `pip install --upgrade cortex-linux`\n\nIf still stuck, paste the full error and I'll help debug.",
  },
];

/**
 * Normalize text for matching
 */
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if a question matches any FAQ entry
 * @param {string} question
 * @returns {{ answer: string, confidence: number } | null}
 */
export function checkFAQ(question) {
  const normalized = normalize(question);

  // Direct trigger match
  for (const entry of FAQ_ENTRIES) {
    for (const trigger of entry.triggers) {
      const normalizedTrigger = normalize(trigger);

      // Exact or near-exact match
      if (normalized === normalizedTrigger || normalized.includes(normalizedTrigger)) {
        return { answer: entry.answer, confidence: 1.0 };
      }

      // Check if question starts with trigger
      if (normalized.startsWith(normalizedTrigger)) {
        return { answer: entry.answer, confidence: 0.9 };
      }
    }
  }

  // Keyword matching for partial matches
  const questionWords = normalized.split(" ");

  for (const entry of FAQ_ENTRIES) {
    for (const trigger of entry.triggers) {
      const triggerWords = normalize(trigger).split(" ");
      const matchedWords = triggerWords.filter(tw =>
        questionWords.some(qw => qw.includes(tw) || tw.includes(qw))
      );

      // If most trigger words match, it's probably this FAQ
      if (matchedWords.length >= triggerWords.length * 0.7 && matchedWords.length >= 2) {
        return { answer: entry.answer, confidence: 0.7 };
      }
    }
  }

  return null;
}

/**
 * Get all FAQ entries (for admin viewing)
 */
export function getAllFAQs() {
  return FAQ_ENTRIES.map((entry, index) => ({
    id: index,
    triggers: entry.triggers,
    answer: entry.answer.slice(0, 100) + "...",
  }));
}
