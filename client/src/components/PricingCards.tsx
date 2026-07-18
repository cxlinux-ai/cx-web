import { Link } from "wouter";
import { motion } from "framer-motion";
import { tiers } from "@/data/pricingTiers";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface Props {
  isAnnual: boolean;
  referralCode?: string | null;
}

// Pricing as freestanding soft cards; the featured tier carries an accent
// border and a faint blue wash. No table rules, no glow, no badge balloons.
export default function PricingCards({ isAnnual, referralCode }: Props) {
  return (
    <motion.div
      className="grid md:grid-cols-2 xl:grid-cols-4 gap-5 lg:gap-6 items-stretch"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      {tiers.map((tier) => {
        const isHighlighted = !!tier.highlighted;
        const displayPrice = isAnnual ? tier.annualPrice : tier.price;
        const annualSavings = tier.price * 12 - tier.annualPrice;
        const priceLabel =
          tier.id === "enterprise" ? "Custom" : tier.price === 0 ? "$0" : `$${displayPrice}`;

        const ctaClass = `cx-btn w-full mb-8 ${isHighlighted ? "cx-btn-primary" : "cx-btn-ghost"}`;
        const ctaHref = tier.ctaLink.startsWith("http")
          ? tier.ctaLink
          : tier.ctaLink +
            (isAnnual ? "&billing=annual" : "&billing=monthly") +
            (referralCode ? `&ref=${referralCode}` : "");

        return (
          <motion.div
            key={tier.id}
            variants={item}
            className={`cx-card relative flex flex-col p-7 lg:p-8 overflow-hidden ${
              isHighlighted ? "!border-[#2F6BFF]/45 !bg-[#2F6BFF]/[0.05]" : ""
            }`}
          >
            {/* accent top bar on the featured tier */}
            {isHighlighted && (
              <div className="absolute top-0 inset-x-0 h-[2px] bg-[#2F6BFF]" />
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className={`cx-label ${isHighlighted ? "cx-label-accent" : ""}`}>
                {tier.name.replace("CX ", "")}
              </span>
              <span className="cx-label">{tier.subtitle}</span>
            </div>

            {/* Price */}
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-mono text-[40px] leading-none tracking-tight text-white tabular-nums">
                {priceLabel}
              </span>
              {tier.price > 0 && tier.id !== "enterprise" && (
                <span className="cx-label">{isAnnual ? "/yr" : "/mo"}</span>
              )}
            </div>
            <p className="cx-label !normal-case !tracking-normal !text-[11.5px] mb-6 min-h-[15px]">
              {tier.id === "enterprise" && "contact us for a quote"}
              {tier.id !== "enterprise" && tier.price === 0 && "free forever · no card"}
              {tier.id !== "enterprise" && tier.price > 0 && isAnnual && (
                <>billed ${tier.annualPrice}/yr · <span className="text-[#7AA0FF]">save ${annualSavings}</span></>
              )}
              {tier.id !== "enterprise" && tier.price > 0 && !isAnnual && `or $${tier.annualPrice}/yr billed annually`}
            </p>

            <p className="text-[13px] text-white/50 leading-relaxed mb-7 min-h-[60px]">
              {tier.description}
            </p>

            {/* CTA */}
            {tier.ctaLink.startsWith("http") ? (
              <a href={ctaHref} target="_blank" rel="noopener noreferrer" className={ctaClass}>
                {tier.cta}
              </a>
            ) : (
              <Link href={ctaHref} className={ctaClass}>
                {tier.cta}
              </Link>
            )}

            {/* Features */}
            <ul className="space-y-3 flex-1 border-t border-white/[0.06] pt-6">
              {tier.features.map((f, i) => {
                const isInherited = f.startsWith("Everything in");
                return (
                  <li key={i} className="flex items-start gap-2.5 text-[13px] leading-snug">
                    <span
                      className={`font-mono text-[12px] mt-px ${
                        isInherited ? "text-white/20" : "text-[#7AA0FF]"
                      }`}
                    >
                      +
                    </span>
                    <span className={isInherited ? "text-white/35" : "text-white/70"}>{f}</span>
                  </li>
                );
              })}
            </ul>

            {/* Limits */}
            <dl className="mt-8 pt-5 border-t border-white/[0.06] space-y-1.5">
              {(
                [
                  ["servers", tier.limits.servers],
                  ["commands", tier.limits.commands],
                  ["support", tier.limits.support],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="cx-label">{k}</dt>
                  <dd className="font-mono text-[12px] text-white/60">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
