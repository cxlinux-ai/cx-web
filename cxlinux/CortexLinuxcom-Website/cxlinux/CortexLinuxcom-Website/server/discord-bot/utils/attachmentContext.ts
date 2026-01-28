/**
 * Attachment Context
 *
 * Read PDFs, code files, logs, and other attachments
 * to provide context-aware answers.
 */

import Anthropic from "@anthropic-ai/sdk";
import { Message, Attachment } from "discord.js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Supported file types
const SUPPORTED_TYPES: Record<string, string> = {
  // Text files
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".log": "text/plain",
  ".json": "application/json",
  ".xml": "application/xml",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".toml": "text/toml",
  ".ini": "text/plain",
  ".conf": "text/plain",
  ".cfg": "text/plain",

  // Code files
  ".js": "text/javascript",
  ".ts": "text/typescript",
  ".py": "text/python",
  ".sh": "text/x-shellscript",
  ".bash": "text/x-shellscript",
  ".zsh": "text/x-shellscript",
  ".c": "text/x-c",
  ".cpp": "text/x-c++",
  ".h": "text/x-c",
  ".rs": "text/x-rust",
  ".go": "text/x-go",
  ".java": "text/x-java",
  ".rb": "text/x-ruby",
  ".php": "text/x-php",
  ".html": "text/html",
  ".css": "text/css",
  ".sql": "text/x-sql",

  // Config files
  ".env": "text/plain",
  ".gitignore": "text/plain",
  ".dockerignore": "text/plain",
  "Dockerfile": "text/plain",
  "Makefile": "text/plain",
  ".service": "text/plain",
};

// Max file size to process (in bytes)
const MAX_FILE_SIZE = 100 * 1024; // 100KB

interface AttachmentContent {
  filename: string;
  content: string;
  type: string;
  size: number;
  truncated: boolean;
}

/**
 * Check if attachment is a supported text file
 */
export function isSupportedTextFile(attachment: Attachment): boolean {
  const filename = attachment.name || "";
  const ext = getFileExtension(filename);

  // Check by extension
  if (SUPPORTED_TYPES[ext]) return true;

  // Check by content type
  const contentType = attachment.contentType || "";
  if (contentType.startsWith("text/")) return true;
  if (contentType === "application/json") return true;

  return false;
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return filename; // Might be a file like "Dockerfile"
  return filename.slice(lastDot).toLowerCase();
}

/**
 * Extract text attachments from message
 */
export function extractTextAttachments(message: Message): Attachment[] {
  return Array.from(message.attachments.values()).filter(isSupportedTextFile);
}

/**
 * Check if message has processable attachments
 */
export function hasAttachments(message: Message): boolean {
  return extractTextAttachments(message).length > 0;
}

/**
 * Download and read attachment content
 */
async function readAttachment(attachment: Attachment): Promise<AttachmentContent | null> {
  try {
    const response = await fetch(attachment.url);
    if (!response.ok) return null;

    let content = await response.text();
    let truncated = false;

    // Truncate if too large
    if (content.length > MAX_FILE_SIZE) {
      content = content.slice(0, MAX_FILE_SIZE);
      truncated = true;
    }

    return {
      filename: attachment.name || "unknown",
      content,
      type: getFileExtension(attachment.name || ""),
      size: attachment.size,
      truncated,
    };
  } catch (error: any) {
    console.error(`[Attachments] Failed to read ${attachment.name}:`, error.message);
    return null;
  }
}

/**
 * Process all attachments in a message
 */
export async function processAttachments(message: Message): Promise<AttachmentContent[]> {
  const textAttachments = extractTextAttachments(message);
  const results: AttachmentContent[] = [];

  // Limit to 3 attachments
  for (const attachment of textAttachments.slice(0, 3)) {
    // Skip large files
    if (attachment.size > MAX_FILE_SIZE * 2) {
      console.log(`[Attachments] Skipping ${attachment.name} - too large (${attachment.size} bytes)`);
      continue;
    }

    const content = await readAttachment(attachment);
    if (content) {
      results.push(content);
    }
  }

  console.log(`[Attachments] Processed ${results.length} attachments`);
  return results;
}

/**
 * Format attachment content for LLM context
 */
export function formatAttachmentsForContext(attachments: AttachmentContent[]): string {
  if (attachments.length === 0) return "";

  const formatted = attachments
    .map((a) => {
      const truncateNote = a.truncated ? " (truncated)" : "";
      return `--- ${a.filename}${truncateNote} ---\n\`\`\`${a.type.replace(".", "")}\n${a.content}\n\`\`\``;
    })
    .join("\n\n");

  return `\n\n[User attached ${attachments.length} file(s):]
${formatted}`;
}

/**
 * Analyze code file for issues
 */
export async function analyzeCode(
  content: string,
  filename: string,
  question: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-20250514", // Use Haiku for quick code analysis
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Analyze this code file and answer the user's question.

File: ${filename}
\`\`\`
${content.slice(0, 10000)}
\`\`\`

User's question: ${question}

Provide a concise, helpful response.`,
        },
      ],
    });

    const textContent = response.content.find((b) => b.type === "text");
    return textContent?.type === "text" ? textContent.text : "Unable to analyze the code.";
  } catch (error: any) {
    console.error("[Attachments] Code analysis error:", error.message);
    return "I couldn't analyze the code file. Please try again.";
  }
}

/**
 * Detect log file and extract errors
 */
export function extractLogErrors(content: string): string[] {
  const errors: string[] = [];

  const errorPatterns = [
    /error[:\s].{0,200}/gi,
    /exception[:\s].{0,200}/gi,
    /failed[:\s].{0,200}/gi,
    /fatal[:\s].{0,200}/gi,
    /panic[:\s].{0,200}/gi,
    /segfault.{0,200}/gi,
    /permission denied.{0,100}/gi,
    /not found.{0,100}/gi,
  ];

  for (const pattern of errorPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      errors.push(...matches.slice(0, 5));
    }
  }

  return Array.from(new Set(errors)).slice(0, 10);
}

/**
 * Get attachment context summary
 */
export function getAttachmentSummary(attachments: AttachmentContent[]): string {
  if (attachments.length === 0) return "";

  const summaries = attachments.map((a) => {
    let summary = `${a.filename} (${formatBytes(a.size)})`;
    if (a.truncated) summary += " - truncated";
    return summary;
  });

  return `\n\n📎 Attached: ${summaries.join(", ")}`;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default {
  isSupportedTextFile,
  extractTextAttachments,
  hasAttachments,
  processAttachments,
  formatAttachmentsForContext,
  analyzeCode,
  extractLogErrors,
  getAttachmentSummary,
};
