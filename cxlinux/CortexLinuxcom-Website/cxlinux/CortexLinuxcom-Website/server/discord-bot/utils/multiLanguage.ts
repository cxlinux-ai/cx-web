/**
 * Multi-Language Support
 *
 * Detects user's language and responds accordingly.
 * Claude handles translation naturally.
 */

// Common language patterns for detection
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  spanish: [
    /\b(hola|gracias|por favor|ayuda|como|qué|cuál|donde|cuando)\b/i,
    /\b(necesito|quiero|puedo|tengo|está|son|es)\b/i,
    /[¿¡ñ]/,
  ],
  french: [
    /\b(bonjour|merci|s'il vous plaît|aide|comment|quoi|où|quand)\b/i,
    /\b(je|tu|nous|vous|ils|est|sont|avoir|être)\b/i,
    /[éèêëàâäùûüôîïç]/,
  ],
  german: [
    /\b(hallo|danke|bitte|hilfe|wie|was|wo|wann|warum)\b/i,
    /\b(ich|du|wir|sie|ist|sind|haben|sein)\b/i,
    /[äöüß]/,
  ],
  portuguese: [
    /\b(olá|obrigado|por favor|ajuda|como|qual|onde|quando)\b/i,
    /\b(preciso|quero|posso|tenho|está|são|é)\b/i,
    /[ãõçáéíóú]/,
  ],
  italian: [
    /\b(ciao|grazie|per favore|aiuto|come|cosa|dove|quando)\b/i,
    /\b(ho|hai|ha|abbiamo|sono|sei|è)\b/i,
  ],
  russian: [/[а-яА-ЯёЁ]{3,}/],
  chinese: [/[\u4e00-\u9fff]/],
  japanese: [/[\u3040-\u309f\u30a0-\u30ff]/],
  korean: [/[\uac00-\ud7af]/],
  arabic: [/[\u0600-\u06ff]/],
  hindi: [/[\u0900-\u097f]/],
};

// Language names for prompts
const LANGUAGE_NAMES: Record<string, string> = {
  spanish: "Spanish",
  french: "French",
  german: "German",
  portuguese: "Portuguese",
  italian: "Italian",
  russian: "Russian",
  chinese: "Chinese",
  japanese: "Japanese",
  korean: "Korean",
  arabic: "Arabic",
  hindi: "Hindi",
  english: "English",
};

/**
 * Detect language from text
 */
export function detectLanguage(text: string): string {
  // Check for non-Latin scripts first (more reliable)
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (["russian", "chinese", "japanese", "korean", "arabic", "hindi"].includes(lang)) {
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          return lang;
        }
      }
    }
  }

  // Check Latin-based languages
  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    if (!["russian", "chinese", "japanese", "korean", "arabic", "hindi"].includes(lang)) {
      let matches = 0;
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          matches++;
        }
      }
      // Require at least 2 pattern matches for Latin languages
      if (matches >= 2) {
        return lang;
      }
    }
  }

  // Default to English
  return "english";
}

/**
 * Check if response should be in a different language
 */
export function shouldTranslate(detectedLang: string): boolean {
  return detectedLang !== "english";
}

/**
 * Get language instruction for system prompt
 */
export function getLanguageInstruction(language: string): string {
  if (language === "english") return "";

  const langName = LANGUAGE_NAMES[language] || language;
  return `\n\nIMPORTANT: The user is writing in ${langName}. Please respond in ${langName} while maintaining your friendly, conversational tone. Translate technical terms appropriately.`;
}

/**
 * Format language context for logging
 */
export function formatLanguageContext(language: string): string {
  if (language === "english") return "";
  return `\n\n[Detected language: ${LANGUAGE_NAMES[language] || language}]`;
}

/**
 * Get greeting in detected language
 */
export function getLocalizedGreeting(language: string): string {
  const greetings: Record<string, string> = {
    spanish: "¡Hola!",
    french: "Bonjour!",
    german: "Hallo!",
    portuguese: "Olá!",
    italian: "Ciao!",
    russian: "Привет!",
    chinese: "你好！",
    japanese: "こんにちは！",
    korean: "안녕하세요!",
    arabic: "مرحبا!",
    hindi: "नमस्ते!",
    english: "Hey!",
  };
  return greetings[language] || "Hey!";
}

/**
 * Common phrases in different languages for the bot
 */
export const LOCALIZED_PHRASES: Record<string, Record<string, string>> = {
  thinking: {
    english: "Let me think about that...",
    spanish: "Déjame pensar en eso...",
    french: "Laissez-moi réfléchir...",
    german: "Lass mich darüber nachdenken...",
    portuguese: "Deixe-me pensar nisso...",
  },
  notSure: {
    english: "I'm not entirely sure about that.",
    spanish: "No estoy del todo seguro de eso.",
    french: "Je ne suis pas tout à fait sûr de cela.",
    german: "Da bin ich mir nicht ganz sicher.",
    portuguese: "Não tenho certeza sobre isso.",
  },
  helpMore: {
    english: "Is there anything else I can help with?",
    spanish: "¿Hay algo más en lo que pueda ayudar?",
    french: "Y a-t-il autre chose que je puisse aider?",
    german: "Kann ich noch bei etwas anderem helfen?",
    portuguese: "Há mais alguma coisa em que eu possa ajudar?",
  },
};

export default {
  detectLanguage,
  shouldTranslate,
  getLanguageInstruction,
  formatLanguageContext,
  getLocalizedGreeting,
  LOCALIZED_PHRASES,
};
