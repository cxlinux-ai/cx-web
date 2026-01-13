/**
 * Embeddings & Semantic Search
 *
 * Uses TF-IDF based semantic similarity for free, local embedding search.
 * No external API required - works offline and has zero cost.
 *
 * For production scale, this can be swapped with Voyage AI or OpenAI embeddings.
 */

interface Document {
  id: string;
  content: string;
  category: string;
  keywords: string[];
  vector?: number[];
}

interface SearchResult {
  document: Document;
  score: number;
}

// Vocabulary built from all documents
let vocabulary: Map<string, number> = new Map();
let idfScores: Map<string, number> = new Map();
let documents: Document[] = [];
let documentVectors: Map<string, number[]> = new Map();

/**
 * Tokenize and normalize text
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word));
}

// Common stop words to ignore
const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
  "used", "this", "that", "these", "those", "i", "you", "he", "she", "it",
  "we", "they", "what", "which", "who", "whom", "whose", "where", "when",
  "why", "how", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "also", "now", "here", "there", "then",
]);

/**
 * Calculate term frequency for a document
 */
function calculateTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  const total = tokens.length;

  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }

  // Normalize by document length
  for (const [term, count] of Array.from(tf.entries())) {
    tf.set(term, count / total);
  }

  return tf;
}

/**
 * Calculate IDF scores for all terms
 */
function calculateIDF(docs: string[][]): void {
  const docCount = docs.length;
  const termDocCount = new Map<string, number>();

  // Count how many documents contain each term
  for (const tokens of docs) {
    const uniqueTokens = new Set(tokens);
    for (const token of Array.from(uniqueTokens)) {
      termDocCount.set(token, (termDocCount.get(token) || 0) + 1);
    }
  }

  // Calculate IDF
  for (const [term, count] of Array.from(termDocCount.entries())) {
    idfScores.set(term, Math.log(docCount / count) + 1);
  }
}

/**
 * Convert document to TF-IDF vector
 */
function toVector(tokens: string[]): number[] {
  const tf = calculateTF(tokens);
  const vector: number[] = [];

  for (const term of Array.from(vocabulary.keys())) {
    const tfScore = tf.get(term) || 0;
    const idfScore = idfScores.get(term) || 0;
    vector.push(tfScore * idfScore);
  }

  return vector;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Initialize the embedding system with documents
 */
export function initializeEmbeddings(docs: Array<{ id: string; content: string; category: string; keywords: string[] }>): void {
  documents = docs;

  // Tokenize all documents
  const allTokens: string[][] = [];
  for (const doc of docs) {
    const tokens = tokenize(doc.content + " " + doc.keywords.join(" "));
    allTokens.push(tokens);
  }

  // Build vocabulary
  vocabulary.clear();
  let vocabIndex = 0;
  for (const tokens of allTokens) {
    for (const token of tokens) {
      if (!vocabulary.has(token)) {
        vocabulary.set(token, vocabIndex++);
      }
    }
  }

  // Calculate IDF scores
  calculateIDF(allTokens);

  // Generate vectors for all documents
  documentVectors.clear();
  for (let i = 0; i < docs.length; i++) {
    const vector = toVector(allTokens[i]);
    documentVectors.set(docs[i].id, vector);
    // Store vector in documents array
    documents[i] = { ...documents[i], vector };
  }

  console.log(`[Embeddings] Initialized with ${docs.length} documents, ${vocabulary.size} terms`);
}

/**
 * Search for similar documents using semantic similarity
 */
export function semanticSearch(query: string, topK: number = 3): SearchResult[] {
  const queryTokens = tokenize(query);
  const queryVector = toVector(queryTokens);

  const results: SearchResult[] = [];

  for (const doc of documents) {
    const docVector = documentVectors.get(doc.id);
    if (!docVector) continue;

    const score = cosineSimilarity(queryVector, docVector);
    if (score > 0.05) {
      // Minimum threshold
      results.push({ document: doc, score });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, topK);
}

/**
 * Get embedding vector for a query (for external use)
 */
export function getQueryEmbedding(query: string): number[] {
  const tokens = tokenize(query);
  return toVector(tokens);
}

/**
 * Check if embeddings are initialized
 */
export function isInitialized(): boolean {
  return documents.length > 0 && vocabulary.size > 0;
}

export default {
  initializeEmbeddings,
  semanticSearch,
  getQueryEmbedding,
  isInitialized,
};
