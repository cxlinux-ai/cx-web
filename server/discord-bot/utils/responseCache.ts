/**
 * Response Cache
 *
 * Caches question-answer pairs to avoid repeated API calls.
 * Uses fuzzy matching to find similar questions.
 * Saves significant API costs for common questions.
 */

interface CachedResponse {
  question: string;
  questionLower: string;
  answer: string;
  timestamp: number;
  hitCount: number;
}

// In-memory cache (persists until bot restart)
const cache: Map<string, CachedResponse> = new Map();

// Cache configuration
const CONFIG = {
  maxEntries: 500, // Maximum cached responses
  ttlMs: 24 * 60 * 60 * 1000, // 24 hours TTL
  similarityThreshold: 0.85, // 85% similarity to match
};

/**
 * Normalize a question for comparison
 */
function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

/**
 * Calculate similarity between two strings (Jaccard similarity on words)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = str1.split(" ").filter((w) => w.length > 2);
  const words2 = str2.split(" ").filter((w) => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set2 = new Set(words2);
  const intersection = words1.filter((w) => set2.has(w));
  const unionSet = new Set([...words1, ...words2]);

  return intersection.length / unionSet.size;
}

/**
 * Generate a cache key from a question
 */
function generateKey(question: string): string {
  const normalized = normalizeQuestion(question);
  // Use first 100 chars as key
  return normalized.slice(0, 100);
}

/**
 * Check if a cached response exists for a similar question
 */
export function getCachedResponse(question: string): string | null {
  const normalized = normalizeQuestion(question);
  const now = Date.now();

  // First, try exact match
  const exactKey = generateKey(question);
  const exactMatch = cache.get(exactKey);
  if (exactMatch && now - exactMatch.timestamp < CONFIG.ttlMs) {
    exactMatch.hitCount++;
    console.log(`[Cache] Exact hit for: "${question.slice(0, 40)}..." (hits: ${exactMatch.hitCount})`);
    return exactMatch.answer;
  }

  // Then, try fuzzy match
  for (const [key, cached] of Array.from(cache.entries())) {
    if (now - cached.timestamp >= CONFIG.ttlMs) {
      cache.delete(key); // Clean up expired
      continue;
    }

    const similarity = calculateSimilarity(normalized, cached.questionLower);
    if (similarity >= CONFIG.similarityThreshold) {
      cached.hitCount++;
      console.log(
        `[Cache] Fuzzy hit (${(similarity * 100).toFixed(0)}% similar): "${question.slice(0, 40)}..." (hits: ${cached.hitCount})`
      );
      return cached.answer;
    }
  }

  return null;
}

/**
 * Cache a question-answer pair
 */
export function cacheResponse(question: string, answer: string): void {
  // Don't cache very short questions or answers
  if (question.length < 10 || answer.length < 20) return;

  // Don't cache error responses
  if (answer.includes("error") || answer.includes("try again")) return;

  const key = generateKey(question);
  const normalized = normalizeQuestion(question);

  // Enforce max cache size
  if (cache.size >= CONFIG.maxEntries) {
    // Remove oldest or least-used entries
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    let lowestHits = Infinity;

    for (const [k, v] of Array.from(cache.entries())) {
      // Prefer removing old entries with low hit counts
      const score = v.timestamp + v.hitCount * 3600000; // Each hit adds 1 hour of "age"
      if (score < oldestTime) {
        oldestTime = score;
        oldestKey = k;
        lowestHits = v.hitCount;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
      console.log(`[Cache] Evicted entry with ${lowestHits} hits`);
    }
  }

  cache.set(key, {
    question,
    questionLower: normalized,
    answer,
    timestamp: Date.now(),
    hitCount: 0,
  });

  console.log(`[Cache] Stored: "${question.slice(0, 40)}..." (total: ${cache.size})`);
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number;
  totalHits: number;
  topQuestions: Array<{ question: string; hits: number }>;
} {
  let totalHits = 0;
  const entries: Array<{ question: string; hits: number }> = [];

  for (const cached of Array.from(cache.values())) {
    totalHits += cached.hitCount;
    entries.push({ question: cached.question, hits: cached.hitCount });
  }

  entries.sort((a, b) => b.hits - a.hits);

  return {
    size: cache.size,
    totalHits,
    topQuestions: entries.slice(0, 10),
  };
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  cache.clear();
  console.log("[Cache] Cleared");
}

export default {
  getCachedResponse,
  cacheResponse,
  getCacheStats,
  clearCache,
};
