/**
 * Context Awareness System
 * Channel context + Language detection
 */

// Channel name to context mapping
const CHANNEL_CONTEXTS = {
  // Installation related
  install: "installation",
  installation: "installation",
  setup: "installation",
  "getting-started": "installation",

  // Support/Help
  help: "support",
  support: "support",
  questions: "support",
  "ask-ai": "support",

  // Troubleshooting
  troubleshooting: "troubleshooting",
  issues: "troubleshooting",
  bugs: "troubleshooting",
  errors: "troubleshooting",
  debug: "troubleshooting",

  // Development
  dev: "development",
  development: "development",
  contributing: "development",
  "dev-talk": "development",

  // General
  general: "general",
  chat: "general",
  lounge: "general",
};

// Context-specific hints to add to prompts
const CONTEXT_HINTS = {
  installation: "User is in an installation channel - they likely need help installing or setting up Cortex.",
  support: "User is asking for help - be thorough but concise.",
  troubleshooting: "User is probably debugging an issue - ask for error messages if not provided.",
  development: "User might be a developer - can use more technical language.",
  general: "",
};

/**
 * Get context from channel name
 */
export function getChannelContext(channelName) {
  if (!channelName) return null;

  const normalized = channelName.toLowerCase().replace(/[^a-z-]/g, "");

  // Direct match
  if (CHANNEL_CONTEXTS[normalized]) {
    return {
      type: CHANNEL_CONTEXTS[normalized],
      hint: CONTEXT_HINTS[CHANNEL_CONTEXTS[normalized]],
    };
  }

  // Partial match
  for (const [key, context] of Object.entries(CHANNEL_CONTEXTS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        type: context,
        hint: CONTEXT_HINTS[context],
      };
    }
  }

  return null;
}

/**
 * Simple language detection based on common words
 */
const LANGUAGE_PATTERNS = {
  es: {
    words: ["como", "que", "para", "esto", "puedo", "tengo", "hacer", "hola", "gracias", "ayuda", "instalar", "error", "funciona", "por", "qué", "cómo"],
    name: "Spanish",
  },
  fr: {
    words: ["comment", "pour", "faire", "bonjour", "merci", "aide", "installer", "erreur", "fonctionne", "est", "que", "quoi", "pourquoi"],
    name: "French",
  },
  de: {
    words: ["wie", "kann", "ich", "das", "hallo", "danke", "hilfe", "installieren", "fehler", "funktioniert", "warum", "bitte"],
    name: "German",
  },
  pt: {
    words: ["como", "para", "isso", "posso", "tenho", "fazer", "olá", "obrigado", "ajuda", "instalar", "erro", "funciona", "por", "que"],
    name: "Portuguese",
  },
  it: {
    words: ["come", "posso", "fare", "ciao", "grazie", "aiuto", "installare", "errore", "funziona", "perché"],
    name: "Italian",
  },
  zh: {
    words: ["怎么", "如何", "安装", "错误", "帮助", "谢谢", "你好", "可以", "什么"],
    name: "Chinese",
  },
  ja: {
    words: ["どう", "インストール", "エラー", "ヘルプ", "ありがとう", "こんにちは", "できます", "何"],
    name: "Japanese",
  },
  ru: {
    words: ["как", "что", "можно", "установить", "ошибка", "помощь", "спасибо", "привет", "почему"],
    name: "Russian",
  },
};

/**
 * Detect language from text
 */
export function detectLanguage(text) {
  if (!text || text.length < 3) return { code: "en", name: "English", confidence: 1 };

  const normalized = text.toLowerCase();
  const scores = {};

  for (const [langCode, langData] of Object.entries(LANGUAGE_PATTERNS)) {
    let matches = 0;
    for (const word of langData.words) {
      if (normalized.includes(word)) {
        matches++;
      }
    }
    if (matches > 0) {
      scores[langCode] = matches;
    }
  }

  // Find best match
  let bestLang = "en";
  let bestScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  // Only return non-English if we have decent confidence (2+ matches)
  if (bestScore >= 2 && bestLang !== "en") {
    return {
      code: bestLang,
      name: LANGUAGE_PATTERNS[bestLang].name,
      confidence: Math.min(bestScore / 5, 1),
    };
  }

  return { code: "en", name: "English", confidence: 1 };
}

/**
 * Get language instruction for system prompt
 */
export function getLanguageInstruction(langCode) {
  if (langCode === "en") return "";

  const langName = LANGUAGE_PATTERNS[langCode]?.name || langCode;
  return `Respond in ${langName} since the user wrote in ${langName}.`;
}
