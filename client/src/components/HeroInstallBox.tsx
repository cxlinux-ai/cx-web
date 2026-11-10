import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HERO_B_COPY, INSTALL_COMMAND } from "@/experiments/cx-hero-install-box";

interface Props {
  /** Fired on a successful copy (button or native ⌘C/Ctrl+C on the command). */
  onCopy: () => void;
  onInstallGuideClick: () => void;
  onSecondaryClick: () => void;
}

/** Variant B of `cx-hero-install-box`: the install command as the hero's primary action. */
export function HeroInstallBox({ onCopy, onInstallGuideClick, onSecondaryClick }: Props) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const markCopied = () => {
    setCopied(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 2000);
    onCopy();
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      markCopied();
    } catch {
      // Clipboard API unavailable or denied: the command stays visible and selectable.
    }
  };

  return (
    <div className="mt-8 max-w-3xl mx-auto" data-hero-variant="B">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0 flex items-center gap-2 bg-black/60 border border-[#00FF9F]/30 rounded-lg pl-3 pr-1.5 py-1.5 text-left">
          <span className="text-gray-500 select-none font-mono text-sm" aria-hidden="true">$</span>
          <code
            className="flex-1 min-w-0 font-mono text-[#00FF9F] text-xs sm:text-sm break-words sm:whitespace-nowrap sm:overflow-x-auto"
            onCopy={markCopied}
          >
            {INSTALL_COMMAND}
          </code>
          <button
            type="button"
            onClick={copyCommand}
            aria-label={copied ? HERO_B_COPY.copiedAriaLabel : HERO_B_COPY.copyAriaLabel}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-semibold text-sm px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9F] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
            <span aria-live="polite">{copied ? HERO_B_COPY.copiedLabel : HERO_B_COPY.copyLabel}</span>
          </button>
        </div>
        <a
          href={HERO_B_COPY.readScriptHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center justify-center rounded-lg border border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10 font-semibold text-sm px-4 py-2.5 whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9F] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {HERO_B_COPY.readScriptLabel}
        </a>
      </div>

      <p className="mt-4 text-sm text-gray-300">{HERO_B_COPY.approvalLine}</p>

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-6">
        <Link
          href={HERO_B_COPY.installGuideHref}
          onClick={onInstallGuideClick}
          className="text-sm font-semibold text-[#00FF9F] hover:underline"
        >
          {HERO_B_COPY.installGuideLabel}
        </Link>
        <Link href="/pricing" onClick={onSecondaryClick}>
          <Button variant="outline" className="border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10 px-8 py-3 text-base">
            See pricing
          </Button>
        </Link>
      </div>
    </div>
  );
}
