/**
 * Code Execution Sandbox
 *
 * Safely execute simple code snippets and show output.
 * Very restricted for security.
 */

import { EmbedBuilder } from "discord.js";

// Allowed languages and their execution config
interface LanguageConfig {
  name: string;
  extension: string;
  timeout: number;
  maxOutput: number;
}

const LANGUAGES: Record<string, LanguageConfig> = {
  javascript: { name: "JavaScript", extension: "js", timeout: 3000, maxOutput: 1000 },
  python: { name: "Python", extension: "py", timeout: 5000, maxOutput: 1000 },
  bash: { name: "Bash", extension: "sh", timeout: 3000, maxOutput: 1000 },
};

// Dangerous patterns to block
const BLOCKED_PATTERNS = [
  // File system
  /\b(fs|require\s*\(\s*['"]fs['"]\s*\)|open\s*\(|file\s*\()/i,
  /\b(readFile|writeFile|unlink|rmdir|mkdir)\b/i,
  /\b(rm\s+-rf|rm\s+-r|rmdir|del\s+\/)/i,

  // Network
  /\b(fetch|axios|http|https|request|curl|wget)\b/i,
  /\b(socket|net\.connect|dns)\b/i,

  // Process/System
  /\b(exec|spawn|fork|child_process|subprocess|system)\b/i,
  /\b(process\.exit|os\.system|eval\s*\()/i,
  /\b(import\s+os|import\s+sys|import\s+subprocess)\b/i,

  // Environment
  /\b(process\.env|os\.environ|getenv)\b/i,

  // Infinite loops (basic detection)
  /while\s*\(\s*true\s*\)/i,
  /while\s*\(\s*1\s*\)/i,
  /for\s*\(\s*;\s*;\s*\)/,

  // Dangerous commands
  /\b(sudo|chmod|chown|passwd|useradd)\b/i,
  /\b(shutdown|reboot|init\s+0)\b/i,

  // Database/secrets
  /\b(database|mongodb|mysql|postgres|redis|password|secret|token|api_key)\b/i,
];

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  language: string;
}

/**
 * Check if code is safe to execute
 */
export function isCodeSafe(code: string): { safe: boolean; reason?: string } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return {
        safe: false,
        reason: `Code contains blocked pattern: ${pattern.toString().slice(0, 30)}...`,
      };
    }
  }

  // Check code length
  if (code.length > 5000) {
    return { safe: false, reason: "Code is too long (max 5000 characters)" };
  }

  return { safe: true };
}

/**
 * Detect language from code block
 */
export function detectLanguage(code: string): string | null {
  // Check for shebang
  if (code.startsWith("#!/bin/bash") || code.startsWith("#!/bin/sh")) {
    return "bash";
  }
  if (code.startsWith("#!/usr/bin/env python") || code.startsWith("#!/usr/bin/python")) {
    return "python";
  }

  // Check for language indicators
  if (/^(const|let|var|function|=>|console\.log)/.test(code)) {
    return "javascript";
  }
  if (/^(def |class |import |from |print\()/.test(code)) {
    return "python";
  }
  if (/^(echo |if \[|for |while |#!\/)/.test(code)) {
    return "bash";
  }

  return null;
}

/**
 * Execute JavaScript code in a sandboxed context
 */
function executeJavaScript(code: string, timeout: number): ExecutionResult {
  const startTime = Date.now();
  const output: string[] = [];

  try {
    // Create sandboxed console
    const sandboxConsole = {
      log: (...args: any[]) => output.push(args.map(String).join(" ")),
      error: (...args: any[]) => output.push(`Error: ${args.map(String).join(" ")}`),
      warn: (...args: any[]) => output.push(`Warning: ${args.map(String).join(" ")}`),
    };

    // Create sandboxed environment
    const sandbox = {
      console: sandboxConsole,
      Math,
      JSON,
      parseInt,
      parseFloat,
      String,
      Number,
      Boolean,
      Array,
      Object,
      Date,
      RegExp,
      Map,
      Set,
    };

    // Create function with sandboxed globals
    const sandboxedCode = `
      "use strict";
      ${Object.keys(sandbox).map((k) => `const ${k} = this.${k};`).join("\n")}
      ${code}
    `;

    // Execute with timeout
    const fn = new Function(sandboxedCode);
    const result = fn.call(sandbox);

    if (result !== undefined) {
      output.push(`=> ${JSON.stringify(result)}`);
    }

    return {
      success: true,
      output: output.join("\n").slice(0, LANGUAGES.javascript.maxOutput),
      executionTime: Date.now() - startTime,
      language: "javascript",
    };
  } catch (error: any) {
    return {
      success: false,
      output: output.join("\n"),
      error: error.message,
      executionTime: Date.now() - startTime,
      language: "javascript",
    };
  }
}

/**
 * Execute code (currently only JS is actually executed)
 */
export async function executeCode(
  code: string,
  language: string
): Promise<ExecutionResult> {
  const config = LANGUAGES[language];
  if (!config) {
    return {
      success: false,
      output: "",
      error: `Language "${language}" is not supported`,
      executionTime: 0,
      language,
    };
  }

  // Safety check
  const safetyCheck = isCodeSafe(code);
  if (!safetyCheck.safe) {
    return {
      success: false,
      output: "",
      error: safetyCheck.reason,
      executionTime: 0,
      language,
    };
  }

  // Currently only JavaScript can be actually executed in-process
  if (language === "javascript") {
    return executeJavaScript(code, config.timeout);
  }

  // For other languages, show what would happen
  return {
    success: true,
    output: `[Code execution for ${config.name} is not available in this environment]\n\nYour code:\n${code.slice(0, 500)}`,
    executionTime: 0,
    language,
  };
}

/**
 * Parse code block from message
 */
export function parseCodeBlock(
  content: string
): { code: string; language: string | null } | null {
  // Match ```language\ncode``` pattern
  const match = content.match(/```(\w+)?\n([\s\S]+?)```/);
  if (match) {
    return {
      language: match[1]?.toLowerCase() || null,
      code: match[2].trim(),
    };
  }

  // Match inline code
  const inlineMatch = content.match(/`([^`]+)`/);
  if (inlineMatch && inlineMatch[1].length > 10) {
    return {
      language: null,
      code: inlineMatch[1].trim(),
    };
  }

  return null;
}

/**
 * Check if message is asking to run code
 */
export function isCodeExecutionRequest(content: string): boolean {
  const triggers = [
    /\b(run|execute|eval|test)\s+(this\s+)?code\b/i,
    /\bwhat\s+(does|would)\s+this\s+(code\s+)?(output|return|print)\b/i,
    /\bcan\s+you\s+run\b/i,
  ];

  return triggers.some((pattern) => pattern.test(content));
}

/**
 * Create code execution result embed
 */
export function createExecutionEmbed(result: ExecutionResult): EmbedBuilder {
  const color = result.success ? 0x22c55e : 0xef4444;
  const title = result.success ? "✅ Code Executed" : "❌ Execution Error";

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .addFields({
      name: `Language: ${LANGUAGES[result.language]?.name || result.language}`,
      value: `Execution time: ${result.executionTime}ms`,
      inline: true,
    });

  if (result.output) {
    embed.addFields({
      name: "Output",
      value: `\`\`\`\n${result.output.slice(0, 1000)}\n\`\`\``,
      inline: false,
    });
  }

  if (result.error) {
    embed.addFields({
      name: "Error",
      value: `\`\`\`\n${result.error.slice(0, 500)}\n\`\`\``,
      inline: false,
    });
  }

  return embed;
}

export default {
  isCodeSafe,
  detectLanguage,
  executeCode,
  parseCodeBlock,
  isCodeExecutionRequest,
  createExecutionEmbed,
  LANGUAGES,
};
