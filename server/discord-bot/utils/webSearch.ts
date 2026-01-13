/**
 * Web Search Integration
 *
 * Provides real-time web search for questions about current events
 * or topics outside the knowledge base.
 *
 * Uses DuckDuckGo Instant Answer API (free, no key required)
 * Falls back gracefully if search fails.
 */

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

interface InstantAnswer {
  Abstract: string;
  AbstractText: string;
  AbstractSource: string;
  AbstractURL: string;
  Answer: string;
  AnswerType: string;
  RelatedTopics: Array<{
    Text: string;
    FirstURL: string;
  }>;
}

// Keywords that suggest web search might be helpful
const WEB_SEARCH_TRIGGERS = [
  /what('s| is) (the )?(latest|newest|current|recent)/i,
  /\b(news|update|announcement|release)\b/i,
  /\b(compare|comparison|vs\.?|versus)\b.*\b(to|with|and)\b/i,
  /\b(2024|2025|2026)\b/i,
  /\bhow (do|does|to)\b.*\b(other|different)\b/i,
  /\bwhat (do|does) .+ (think|say)\b/i,
  /\breview(s)?\b/i,
  /\balternative(s)?\b/i,
];

// Topics we should NOT search for (handle internally)
const INTERNAL_TOPICS = [
  /cortex\s*linux/i,
  /hackathon/i,
  /referral/i,
  /\binstall(ation)?\b/i,
  /\bdiscord\b/i,
  /natural language command/i,
];

/**
 * Check if a query might benefit from web search
 */
export function shouldSearchWeb(query: string): boolean {
  // Don't search for internal topics
  for (const pattern of INTERNAL_TOPICS) {
    if (pattern.test(query)) {
      return false;
    }
  }

  // Check for web search triggers
  for (const pattern of WEB_SEARCH_TRIGGERS) {
    if (pattern.test(query)) {
      return true;
    }
  }

  return false;
}

/**
 * Search using DuckDuckGo Instant Answer API
 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CortexLinuxBot/1.0",
      },
    });

    if (!response.ok) {
      console.log(`[WebSearch] DuckDuckGo returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as InstantAnswer;
    const results: SearchResult[] = [];

    // Add abstract if available
    if (data.AbstractText && data.AbstractText.length > 20) {
      results.push({
        title: data.AbstractSource || "Summary",
        snippet: data.AbstractText,
        url: data.AbstractURL || "",
      });
    }

    // Add direct answer if available
    if (data.Answer && data.Answer.length > 10) {
      results.push({
        title: "Direct Answer",
        snippet: data.Answer,
        url: "",
      });
    }

    // Add related topics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 3)) {
        if (topic.Text && topic.Text.length > 20) {
          results.push({
            title: "Related",
            snippet: topic.Text,
            url: topic.FirstURL || "",
          });
        }
      }
    }

    console.log(`[WebSearch] Found ${results.length} results for: "${query.slice(0, 40)}..."`);
    return results.slice(0, 3);
  } catch (error) {
    console.error("[WebSearch] Error:", error);
    return [];
  }
}

/**
 * Format search results for injection into prompt
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return "";

  const formatted = results
    .map((r) => {
      const source = r.url ? ` (${r.url})` : "";
      return `- ${r.snippet}${source}`;
    })
    .join("\n");

  return `\n\nWeb search results:\n${formatted}`;
}

/**
 * Perform web search if appropriate and return formatted context
 */
export async function getWebContext(query: string): Promise<string> {
  if (!shouldSearchWeb(query)) {
    return "";
  }

  const results = await searchWeb(query);
  return formatSearchResults(results);
}

export default {
  shouldSearchWeb,
  searchWeb,
  formatSearchResults,
  getWebContext,
};
