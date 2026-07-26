import { motion } from "framer-motion";
import { Link } from "wouter";
import { Check } from "lucide-react";
import { tiers } from "@/data/pricingTiers";

interface Props {
  isAnnual: boolean;
  referralCode?: string | null;
}

export default function PricingCards({ isAnnual, referralCode }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
      {tiers.map((tier, index) => {
        const isHighlighted = !!tier.highlighted;
        const displayPrice = isAnnual ? tier.annualPrice : tier.price;
        const annualSavings = tier.price * 12 - tier.annualPrice;

        return (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            className={`relative flex flex-col rounded-2xl p-8 transition-all duration-200 ${
              isHighlighted
                ? "bg-[#0f1510] border border-[#00FF9F]/40 shadow-[0_0_120px_rgba(0,255,159,0.13),inset_0_1px_0_rgba(0,255,159,0.12)] mt-5 md:mt-0"
                : "bg-[#111111] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-[0_16px_48px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
            }`}
          >
            {isHighlighted && (
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#00FF9F]/[0.07] via-[#00FF9F]/[0.01] to-transparent" />
            )}

            {isHighlighted && (
              <div className="absolute -top-[14px] inset-x-0 flex justify-center pointer-events-none">
                <span className="bg-[#00FF9F] text-black text-[10px] font-extrabold uppercase tracking-[0.18em] px-4 py-1 rounded-full shadow-[0_0_20px_rgba(0,255,159,0.4)]">
                  Most Popular
                </span>
              </div>
            )}

            {/* Plan header */}
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isHighlighted ? "bg-[#00FF9F]/20 ring-1 ring-[#00FF9F]/30" : "bg-white/[0.07] ring-1 ring-white/[0.08]"}`}>
                  <tier.icon className={`w-[18px] h-[18px] ${isHighlighted ? "text-[#00FF9F]" : "text-gray-300"}`} />
                </div>
                <span className={`text-[11px] uppercase tracking-[0.15em] font-bold ${isHighlighted ? "text-[#00FF9F]" : "text-gray-500"}`}>
                  {tier.subtitle}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{tier.name}</h3>
              <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{tier.description}</p>
            </div>

            {/* Price */}
            <div className="mb-7">
              <div className="flex items-end gap-2">
                <span className={`text-[3.25rem] font-black tracking-tight leading-none ${isHighlighted ? "bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent" : "text-white"}`}>
                  {tier.id === "enterprise" ? "Custom" : tier.price === 0 ? "Free" : `$${displayPrice}`}
                </span>
                {tier.price > 0 && tier.id !== "enterprise" && (
                  <span className="text-gray-500 text-sm mb-2">{isAnnual ? "/yr" : "/mo"}</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-2 min-h-[16px]">
                {tier.id === "enterprise" && "Contact us for a custom quote"}
                {tier.id !== "enterprise" && tier.price === 0 && "No credit card required"}
                {tier.id !== "enterprise" && tier.price > 0 && isAnnual && (
                  <span>Billed ${tier.annualPrice}/year · <span className="text-[#00FF9F]">Save ${annualSavings}</span></span>
                )}
                {tier.id !== "enterprise" && tier.price > 0 && !isAnnual && `$${tier.annualPrice}/yr billed annually`}
              </p>
            </div>

            {/* CTA */}
            {tier.ctaLink.startsWith("http") ? (
              <a
                href={tier.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 mb-7 ${
                  isHighlighted
                    ? "bg-[#00FF9F] text-black shadow-[0_0_24px_rgba(0,255,159,0.25)] hover:bg-[#00E88F]"
                    : "border border-white/[0.14] text-white hover:border-[#00FF9F]/35 hover:text-[#00FF9F]"
                }`}
              >
                {tier.cta}
              </a>
            ) : (
              <Link
                href={tier.ctaLink + (isAnnual ? "&billing=annual" : "&billing=monthly") + (referralCode ? `&ref=${referralCode}` : "")}
                className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 mb-7 ${
                  isHighlighted
                    ? "bg-[#00FF9F] text-black shadow-[0_0_24px_rgba(0,255,159,0.25)] hover:bg-[#00E88F]"
                    : "border border-white/[0.14] text-white hover:border-[#00FF9F]/35 hover:text-[#00FF9F]"
                }`}
              >
                {tier.cta}
              </Link>
            )}

            {/* Features */}
            <div className="h-px bg-white/[0.07] mb-6" />
            <ul className="space-y-3.5 flex-1">
              {tier.features.map((f, i) => {
                const isInherited = f.startsWith("Everything in");
                return (
                  <li key={i} className="flex items-start gap-3 text-[13px]">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isInherited ? "text-[#00FF9F]/25" : isHighlighted ? "text-[#00FF9F]" : "text-[#00FF9F]/55"}`} />
                    <span className={`leading-snug ${isInherited ? "text-gray-600" : "text-gray-300"}`}>{f}</span>
                  </li>
                );
              })}
            </ul>

            {/* Limits footer */}
            <div className="mt-7 pt-5 border-t border-white/[0.07] grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-gray-600 mb-1">Servers</p>
                <p className="text-xs font-semibold text-gray-400">{tier.limits.servers}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-gray-600 mb-1">Commands</p>
                <p className="text-xs font-semibold text-gray-400">{tier.limits.commands}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-gray-600 mb-1">Support</p>
                <p className="text-xs font-semibold text-gray-400">{tier.limits.support}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
