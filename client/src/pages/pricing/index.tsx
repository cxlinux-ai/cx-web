import { useState } from "react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Calendar,
  Users,
  Terminal,
  Building2,
  BadgeCheck,
  RefreshCw,
  Lock,
  ChevronDown,
} from "lucide-react";
import Footer from "@/components/Footer";

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  annualPrice: number;
  description: string;
  features: string[];
  limits: { servers: string; commands: string; support: string };
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
  icon: typeof Sparkles;
}

const tiers: PricingTier[] = [
  {
    id: "core",
    name: "CX Core",
    subtitle: "Free forever",
    price: 0,
    annualPrice: 0,
    description: "AI-powered package manager for personal use. Natural language commands with local LLM.",
    features: [
      "Natural language commands",
      "Hardware detection & optimization",
      "Dry-run mode for safety",
      "Local LLM (Mistral 7B)",
      "Full CLI access",
      "Community Discord support",
      "BSL 1.1 License",
    ],
    limits: { servers: "1 server", commands: "Unlimited local", support: "Community" },
    cta: "Get Started Free",
    ctaLink: "/pricing/checkout?plan=core",
    icon: Terminal,
  },
  {
    id: "pro",
    name: "CX Pro",
    subtitle: "Most popular",
    price: 20,
    annualPrice: 200,
    description: "Cloud AI models, web console, and priority support for developers managing multiple servers.",
    features: [
      "Everything in CX Core",
      "Cloud LLMs (GPT-4o, Claude 3.5)",
      "Web console dashboard",
      "API access & webhooks",
      "Email support (24h response)",
      "Priority updates",
      "Usage analytics",
      "Custom command aliases",
    ],
    limits: { servers: "5 servers", commands: "10,000/mo cloud", support: "Email (24h)" },
    cta: "Upgrade to Pro",
    ctaLink: "/pricing/checkout?plan=pro",
    highlighted: true,
    icon: Zap,
  },
  {
    id: "team",
    name: "CX Team",
    subtitle: "For growing teams",
    price: 99,
    annualPrice: 990,
    description: "Shared configurations, role-based access, and centralized management for dev teams.",
    features: [
      "Everything in CX Pro",
      "Team workspaces",
      "Role-based access control",
      "Shared command history",
      "Centralized config management",
      "Team analytics dashboard",
      "Slack integration",
      "Priority email support",
    ],
    limits: { servers: "25 servers", commands: "50,000/mo cloud", support: "Priority (4h)" },
    cta: "Start Team Plan",
    ctaLink: "/pricing/checkout?plan=team",
    icon: Users,
  },
  {
    id: "enterprise",
    name: "CX Enterprise",
    subtitle: "Custom pricing",
    price: 299,
    annualPrice: 2990,
    description: "SSO, audit logs, compliance reports, and dedicated support for large organizations.",
    features: [
      "Everything in CX Team",
      "SSO / SAML / LDAP",
      "Audit logs & compliance",
      "SOC2 & HIPAA reports",
      "99.9% SLA guarantee",
      "Dedicated Slack channel",
      "Custom integrations",
      "On-premise deployment",
      "Dedicated account manager",
    ],
    limits: { servers: "Unlimited", commands: "Unlimited", support: "Dedicated (1h)" },
    cta: "Schedule Demo",
    ctaLink: "https://calendly.com/ai-consultant/vip",
    icon: Building2,
  },
];

type ComparisonRow =
  | { kind: "section"; label: string }
  | {
      kind: "row";
      feature: string;
      core: boolean | string;
      pro: boolean | string;
      team: boolean | string;
      enterprise: boolean | string;
    };

const featureComparison: ComparisonRow[] = [
  { kind: "section", label: "Core" },
  { kind: "row", feature: "Natural Language Commands", core: true, pro: true, team: true, enterprise: true },
  { kind: "row", feature: "Local LLM (Mistral 7B)", core: true, pro: true, team: true, enterprise: true },
  { kind: "row", feature: "Hardware Detection & Optimization", core: true, pro: true, team: true, enterprise: true },
  { kind: "row", feature: "Full CLI Access", core: true, pro: true, team: true, enterprise: true },
  { kind: "section", label: "Cloud & Integrations" },
  { kind: "row", feature: "Cloud LLMs (GPT-4o / Claude 3.5)", core: false, pro: true, team: true, enterprise: true },
  { kind: "row", feature: "Web Console Dashboard", core: false, pro: true, team: true, enterprise: true },
  { kind: "row", feature: "API Access & Webhooks", core: false, pro: true, team: true, enterprise: true },
  { kind: "row", feature: "Usage Analytics", core: false, pro: true, team: true, enterprise: true },
  { kind: "section", label: "Collaboration" },
  { kind: "row", feature: "Team Workspaces", core: false, pro: false, team: true, enterprise: true },
  { kind: "row", feature: "Role-Based Access Control", core: false, pro: false, team: true, enterprise: true },
  { kind: "row", feature: "Shared Command History", core: false, pro: false, team: true, enterprise: true },
  { kind: "row", feature: "Centralized Config Management", core: false, pro: false, team: true, enterprise: true },
  { kind: "row", feature: "Slack Integration", core: false, pro: false, team: true, enterprise: true },
  { kind: "section", label: "Security & Compliance" },
  { kind: "row", feature: "SSO / SAML / LDAP", core: false, pro: false, team: false, enterprise: true },
  { kind: "row", feature: "Audit Logs", core: false, pro: false, team: false, enterprise: true },
  { kind: "row", feature: "Compliance Reports (SOC2 / HIPAA)", core: false, pro: false, team: false, enterprise: true },
  { kind: "row", feature: "On-Premise Deployment", core: false, pro: false, team: false, enterprise: true },
  { kind: "section", label: "Limits & SLA" },
  { kind: "row", feature: "Server Limit", core: "1", pro: "5", team: "25", enterprise: "Unlimited" },
  { kind: "row", feature: "Cloud Commands / Month", core: "—", pro: "10,000", team: "50,000", enterprise: "Unlimited" },
  { kind: "row", feature: "SLA", core: "—", pro: "—", team: "99.5%", enterprise: "99.9%" },
];

const trustBadges = [
  { label: "SOC2 Type II", description: "Compliant", icon: Shield },
  { label: "HIPAA", description: "Ready", icon: Lock },
  { label: "GDPR", description: "Compliant", icon: BadgeCheck },
  { label: "BSL 1.1", description: "Source Available", icon: RefreshCw },
];

const stats = [
  { value: "2,400+", label: "Engineers" },
  { value: "4.8★", label: "Rating" },
  { value: "99.9%", label: "Uptime" },
  { value: "<48h", label: "Onboarding" },
];

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade, downgrade, or cancel from your account dashboard at any time. Upgrades take effect immediately; downgrades apply at the end of your current billing cycle.",
  },
  {
    q: "Do you offer a free trial on paid plans?",
    a: "CX Core is free forever — no trial needed. For Pro and Team, we offer a 7-day money-back guarantee. If you're not satisfied for any reason, we'll refund your first payment in full.",
  },
  {
    q: "What happens when I exceed my cloud command limit?",
    a: "We notify you at 80% usage. Once you hit the limit, CX automatically falls back to your local LLM (Mistral 7B) so you're never blocked. You can upgrade or purchase additional credits at any time.",
  },
  {
    q: "Is my data secure?",
    a: "All data in transit is encrypted with TLS 1.3. Command history stored in the cloud is encrypted at rest (AES-256). We're SOC2 Type II certified and GDPR compliant. We never sell or share your data.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards via Stripe. Annual plans can also be paid by invoice or wire transfer. Contact sales@cxlinux.com for purchase orders or billing questions.",
  },
  {
    q: "Do you offer discounts for open-source projects or students?",
    a: "Yes — 50% off Pro for verified open-source maintainers and students with a valid .edu email. Email sales@cxlinux.com with a link to your project or student verification.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const referralCode = params.get("ref");

  return (
    <div className="relative min-h-screen bg-[#080808] text-white overflow-x-hidden">
      {/* Ambient glow — top centre */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#00FF9F]/[0.035] rounded-full blur-[160px]" />

      {/* Referral banner */}
      {referralCode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#00FF9F]/10 border-b border-[#00FF9F]/20 py-3 px-4 text-center text-sm"
        >
          🎉 <span className="text-[#00FF9F] font-semibold">You've been referred!</span>{" "}
          Sign up now and get <span className="text-[#00FF9F] font-bold">3 months free</span> on Pro.
        </motion.div>
      )}

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#00FF9F] font-bold mb-6">
              Pricing
            </span>
            <h1 className="text-5xl sm:text-[3.75rem] font-extrabold tracking-tight leading-[1.07] mb-5">
              Simple,{" "}
              <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">
                transparent
              </span>{" "}
              pricing
            </h1>
            <p className="text-[1.05rem] text-gray-400 mb-10 leading-relaxed">
              Start free. Scale as you grow. No hidden fees, no lock-in.
            </p>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-gray-500 mb-10">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#00FF9F]" /> 7-day money back
              </span>
              <span className="h-3 w-px bg-white/10 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00FF9F]" /> Stripe payments
              </span>
              <span className="h-3 w-px bg-white/10 hidden sm:block" />
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#00FF9F]" /> Cancel anytime
              </span>
            </div>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  !isAnnual ? "bg-white text-black shadow-sm" : "text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isAnnual ? "bg-white text-black shadow-sm" : "text-gray-400"
                }`}
              >
                Annual
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                    isAnnual ? "bg-[#00FF9F] text-black" : "bg-[#00FF9F]/20 text-[#00FF9F]"
                  }`}
                >
                  −20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex flex-wrap justify-center items-center border border-white/[0.07] rounded-2xl divide-x divide-white/[0.07] bg-white/[0.02] overflow-hidden">
            {stats.map((s) => (
              <div key={s.label} className="flex-1 min-w-[80px] py-4 px-3 text-center">
                <p className="text-2xl font-black text-white tabular-nums tracking-tight">{s.value}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Pricing cards ── */}
      <section className="relative pb-24 px-4">
        <div className="max-w-[1180px] mx-auto">
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
                  {/* Pro card: top-edge inner glow overlay */}
                  {isHighlighted && (
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-[#00FF9F]/[0.07] via-[#00FF9F]/[0.01] to-transparent" />
                  )}

                  {/* Most Popular badge */}
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
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isHighlighted
                            ? "bg-[#00FF9F]/20 ring-1 ring-[#00FF9F]/30"
                            : "bg-white/[0.07] ring-1 ring-white/[0.08]"
                        }`}
                      >
                        <tier.icon className={`w-[18px] h-[18px] ${isHighlighted ? "text-[#00FF9F]" : "text-gray-300"}`} />
                      </div>
                      <span
                        className={`text-[11px] uppercase tracking-[0.15em] font-bold ${
                          isHighlighted ? "text-[#00FF9F]" : "text-gray-500"
                        }`}
                      >
                        {tier.subtitle}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{tier.name}</h3>
                    <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{tier.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-7">
                    <div className="flex items-end gap-2">
                      <span className="text-[3.25rem] font-black tracking-tight text-white leading-none">
                        {tier.id === "enterprise"
                          ? "Custom"
                          : tier.price === 0
                          ? "Free"
                          : `$${displayPrice}`}
                      </span>
                      {tier.price > 0 && tier.id !== "enterprise" && (
                        <span className="text-gray-500 text-sm mb-2">{isAnnual ? "/yr" : "/mo"}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-2 min-h-[16px]">
                      {tier.id === "enterprise" && "Contact us for a custom quote"}
                      {tier.id !== "enterprise" && tier.price === 0 && "No credit card required"}
                      {tier.id !== "enterprise" && tier.price > 0 && isAnnual && (
                        <span>
                          Billed ${tier.annualPrice}/year ·{" "}
                          <span className="text-[#00FF9F]">Save ${annualSavings}</span>
                        </span>
                      )}
                      {tier.id !== "enterprise" &&
                        tier.price > 0 &&
                        !isAnnual &&
                        `$${tier.annualPrice}/yr billed annually`}
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
                      href={
                        tier.ctaLink +
                        (isAnnual ? "&billing=annual" : "&billing=monthly") +
                        (referralCode ? `&ref=${referralCode}` : "")
                      }
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
                          <Check
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              isInherited
                                ? "text-[#00FF9F]/25"
                                : isHighlighted
                                ? "text-[#00FF9F]"
                                : "text-[#00FF9F]/55"
                            }`}
                          />
                          <span className={`leading-snug ${isInherited ? "text-gray-600" : "text-gray-300"}`}>
                            {f}
                          </span>
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
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="border-y border-white/[0.05] bg-white/[0.015] py-10 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-x-14 gap-y-6">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[#00FF9F]/10 flex items-center justify-center flex-shrink-0">
                <badge.icon className="w-4 h-4 text-[#00FF9F]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{badge.label}</p>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature comparison ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Compare all features</h2>
            <p className="text-gray-500">Everything you get, clearly laid out.</p>
          </motion.div>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0d0d0d]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-5 px-6 text-gray-500 font-medium w-[38%]">Feature</th>
                  <th className="text-center py-5 px-4 text-gray-400 font-semibold">Core</th>
                  <th className="text-center py-5 px-4 font-bold text-[#00FF9F] bg-[#00FF9F]/[0.05]">Pro</th>
                  <th className="text-center py-5 px-4 text-gray-400 font-semibold">Team</th>
                  <th className="text-center py-5 px-4 text-gray-400 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, i) => {
                  if (row.kind === "section") {
                    return (
                      <tr key={`s-${i}`} className="border-b border-white/[0.05]">
                        <td colSpan={5} className="pt-6 pb-3 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9F]/50 flex-shrink-0" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#00FF9F]/60">
                              {row.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr
                      key={row.feature}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0"
                    >
                      <td className="py-3.5 px-6 text-gray-300">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.core === "boolean" ? (
                          row.core ? (
                            <Check className="w-4 h-4 text-[#00FF9F] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-white/[0.12] mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">{row.core}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-[#00FF9F]/[0.04]">
                        {typeof row.pro === "boolean" ? (
                          row.pro ? (
                            <Check className="w-4 h-4 text-[#00FF9F] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-white/[0.12] mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-200 font-semibold">{row.pro}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.team === "boolean" ? (
                          row.team ? (
                            <Check className="w-4 h-4 text-[#00FF9F] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-white/[0.12] mx-auto" />
                          )
                        ) : (
                          <span className="text-gray-400">{row.team}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {typeof row.enterprise === "boolean" ? (
                          row.enterprise ? (
                            <Check className="w-4 h-4 text-[#00FF9F] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-white/[0.12] mx-auto" />
                          )
                        ) : (
                          <span className="text-[#00FF9F] font-semibold">{row.enterprise}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Frequently asked questions</h2>
            <p className="text-gray-500">
              Still have questions?{" "}
              <a href="mailto:sales@cxlinux.com" className="text-[#00FF9F] underline underline-offset-2">
                Email us
              </a>
              .
            </p>
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                  openFaq === i
                    ? "border-[#00FF9F]/20 bg-[#00FF9F]/[0.03]"
                    : "border-white/[0.07] bg-white/[0.01]"
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                >
                  <span className="text-sm font-semibold text-white leading-snug">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180 text-[#00FF9F]" : "text-gray-500"
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-[#00FF9F]/20 bg-[#0f1510] overflow-hidden px-10 py-16 sm:px-16 text-center shadow-[0_0_80px_rgba(0,255,159,0.06)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#00FF9F]/[0.05] via-transparent to-transparent" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 w-72 h-72 bg-[#00FF9F]/[0.06] rounded-full blur-[100px]" />
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_rgba(0,255,159,0.12)]" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00FF9F]/15 ring-1 ring-[#00FF9F]/25 mb-6 mx-auto">
                <Building2 className="w-7 h-7 text-[#00FF9F]" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Need a custom solution?</h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
                Volume pricing, on-premise deployment, dedicated support, and tailored compliance packages
                for large engineering teams.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <a
                  href="https://calendly.com/ai-consultant/vip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-7 py-3.5 bg-[#00FF9F] text-black text-sm font-bold rounded-xl hover:bg-[#00E88F] transition-colors shadow-[0_0_30px_rgba(0,255,159,0.2)]"
                >
                  <Calendar className="w-4 h-4" /> Schedule a Demo
                </a>
                <a
                  href="mailto:sales@cxlinux.com"
                  className="flex items-center gap-2 px-7 py-3.5 border border-white/[0.14] text-white text-sm font-semibold rounded-xl hover:border-[#00FF9F]/35 hover:text-[#00FF9F] transition-all"
                >
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <p className="text-xs text-gray-600">No commitment required · Response within 24 hours</p>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
