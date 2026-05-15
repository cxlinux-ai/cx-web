import { useState } from "react";
import type { ReactNode } from "react";

interface CodeBlockProps {
  children: ReactNode;
  filename?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, filename, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const lang = language ?? className?.replace(/^language-/, "") ?? "";

  const getPlainText = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (!node) return "";
    if (Array.isArray(node)) return node.map(getPlainText).join("");
    if (typeof node === "object" && "props" in (node as any)) {
      return getPlainText((node as any).props.children);
    }
    return "";
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getPlainText(children));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="not-prose my-6 bg-[#0D0D0D] border border-white/8 rounded-xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161616] border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]/40" />
          </div>
          {filename && (
            <span className="text-gray-400 text-xs font-mono ml-2">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lang && (
            <span className="text-[10px] uppercase tracking-wider text-gray-600 font-mono bg-white/5 px-2 py-0.5 rounded">
              {lang}
            </span>
          )}
          <button
            onClick={handleCopy}
            className="text-xs text-gray-500 hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-white/8"
          >
            {copied ? <span className="text-[#00FF9F]">✓ Copied!</span> : "Copy"}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto text-sm leading-relaxed font-mono px-5 py-4 [&>*]:!bg-transparent">
        {children}
      </div>
    </div>
  );
}
