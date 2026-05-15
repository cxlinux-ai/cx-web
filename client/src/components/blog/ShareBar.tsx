import { useState } from "react";
import { Twitter, Link2, Mail } from "lucide-react";

interface ShareBarProps {
  title: string;
  url: string;
  className?: string;
}

export function ShareBar({ title, url, className = "" }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the URL
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  const btnClass =
    "w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:border-[#00FF9F]/30 hover:bg-white/8 transition-all duration-150 text-gray-400 hover:text-white";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Share</p>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className={btnClass} title="Share on X / Twitter">
        <Twitter className="w-4 h-4" />
      </a>
      <button onClick={handleCopy} className={btnClass} title={copied ? "Copied!" : "Copy link"}>
        {copied ? (
          <span className="text-[#00FF9F] text-[10px] font-bold">✓</span>
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>
      <a href={mailUrl} className={btnClass} title="Share via email">
        <Mail className="w-4 h-4" />
      </a>
    </div>
  );
}
