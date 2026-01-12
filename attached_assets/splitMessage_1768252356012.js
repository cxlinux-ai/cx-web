const DISCORD_MAX_LENGTH = 2000;
const SAFE_MAX_LENGTH = 1990; // Leave buffer for safety

/**
 * Split a long message into chunks that fit Discord's character limit
 * Tries to split at natural breakpoints (newlines, sentences, words)
 *
 * @param {string} text - The text to split
 * @param {number} maxLength - Maximum length per chunk
 * @returns {string[]} - Array of message chunks
 */
export function splitMessage(text, maxLength = SAFE_MAX_LENGTH) {
  if (!text || text.length === 0) {
    return [""];
  }

  if (text.length <= maxLength) {
    return [text];
  }

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    let splitIndex = findBestSplitIndex(remaining, maxLength);
    chunks.push(remaining.slice(0, splitIndex).trim());
    remaining = remaining.slice(splitIndex).trim();
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Find the best index to split the text
 * Priority: code block boundary > newline > sentence end > word boundary > hard cut
 *
 * @param {string} text - The text to analyze
 * @param {number} maxLength - Maximum length for this chunk
 * @returns {number} - The index to split at
 */
function findBestSplitIndex(text, maxLength) {
  const searchRange = text.slice(0, maxLength);

  // Check if we're inside a code block
  const codeBlockEnd = searchRange.lastIndexOf("```\n");
  if (codeBlockEnd > maxLength * 0.5) {
    return codeBlockEnd + 4;
  }

  // Try to split at double newline (paragraph)
  const doubleNewline = searchRange.lastIndexOf("\n\n");
  if (doubleNewline > maxLength * 0.5) {
    return doubleNewline + 2;
  }

  // Try to split at single newline
  const newline = searchRange.lastIndexOf("\n");
  if (newline > maxLength * 0.5) {
    return newline + 1;
  }

  // Try to split at sentence end
  const sentenceEnders = [". ", "! ", "? "];
  let bestSentenceEnd = -1;
  for (const ender of sentenceEnders) {
    const index = searchRange.lastIndexOf(ender);
    if (index > bestSentenceEnd) {
      bestSentenceEnd = index;
    }
  }
  if (bestSentenceEnd > maxLength * 0.5) {
    return bestSentenceEnd + 2;
  }

  // Try to split at word boundary
  const space = searchRange.lastIndexOf(" ");
  if (space > maxLength * 0.5) {
    return space + 1;
  }

  // Hard cut as last resort
  return maxLength;
}
