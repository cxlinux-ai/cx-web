/**
 * Simple in-memory knowledge base for RAG
 * Stores documents as chunks with metadata for retrieval
 */

class KnowledgeBase {
  constructor() {
    this.documents = [];
    this.initialized = false;
  }

  /**
   * Add a document to the knowledge base
   * @param {string} content - The document content
   * @param {object} metadata - Metadata (source, title, url, etc.)
   */
  addDocument(content, metadata = {}) {
    const chunks = this.chunkText(content, 1000, 200);

    for (const chunk of chunks) {
      if (chunk.trim().length > 50) {
        this.documents.push({
          content: chunk.trim(),
          metadata,
          keywords: this.extractKeywords(chunk),
        });
      }
    }
  }

  /**
   * Split text into overlapping chunks
   */
  chunkText(text, chunkSize = 1000, overlap = 200) {
    const chunks = [];
    let start = 0;

    while (start < text.length) {
      let end = start + chunkSize;

      // Try to break at paragraph or sentence
      if (end < text.length) {
        const paragraphBreak = text.lastIndexOf("\n\n", end);
        const sentenceBreak = text.lastIndexOf(". ", end);

        if (paragraphBreak > start + chunkSize / 2) {
          end = paragraphBreak + 2;
        } else if (sentenceBreak > start + chunkSize / 2) {
          end = sentenceBreak + 2;
        }
      }

      chunks.push(text.slice(start, end));
      start = end - overlap;
    }

    return chunks;
  }

  /**
   * Extract keywords from text for simple matching
   */
  extractKeywords(text) {
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
      "being", "have", "has", "had", "do", "does", "did", "will", "would",
      "could", "should", "may", "might", "must", "can", "this", "that",
      "these", "those", "it", "its", "you", "your", "we", "our", "they",
      "their", "what", "which", "who", "whom", "how", "when", "where", "why",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    return [...new Set(words)];
  }

  /**
   * Search for relevant documents using keyword matching
   * @param {string} query - The search query
   * @param {number} topK - Number of results to return
   * @returns {Array} - Relevant document chunks
   */
  search(query, topK = 5) {
    const queryKeywords = this.extractKeywords(query);

    if (queryKeywords.length === 0) {
      return this.documents.slice(0, topK);
    }

    const scored = this.documents.map((doc) => {
      let score = 0;

      // Keyword matching score
      for (const keyword of queryKeywords) {
        if (doc.keywords.includes(keyword)) {
          score += 2;
        }
        // Partial match
        for (const docKeyword of doc.keywords) {
          if (docKeyword.includes(keyword) || keyword.includes(docKeyword)) {
            score += 1;
          }
        }
      }

      // Boost for exact phrase matches in content
      const lowerContent = doc.content.toLowerCase();
      const lowerQuery = query.toLowerCase();
      if (lowerContent.includes(lowerQuery)) {
        score += 10;
      }

      // Boost for multiple query words appearing together
      for (const keyword of queryKeywords) {
        if (lowerContent.includes(keyword)) {
          score += 1;
        }
      }

      return { doc, score };
    });

    return scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((item) => item.doc);
  }

  /**
   * Get statistics about the knowledge base
   */
  getStats() {
    const sources = {};
    for (const doc of this.documents) {
      const source = doc.metadata.source || "unknown";
      sources[source] = (sources[source] || 0) + 1;
    }
    return {
      totalDocuments: this.documents.length,
      sources,
    };
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
    this.initialized = false;
  }
}

// Singleton instance
export const knowledgeBase = new KnowledgeBase();
