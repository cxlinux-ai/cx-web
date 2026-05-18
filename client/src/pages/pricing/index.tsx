import { useState } from "react";
import { Link, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  X,
  Shield,
  ArrowRight,
  Calendar,
  Building2,
  BadgeCheck,
  RefreshCw,
  Lock,
  ChevronDown,
} from "lucide-react";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import { RotatingBorderCard, IconPlate } from "@/components/RotatingBorderCard";

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
  { kind: "row", feature: "Cloud LLMs (GPT-5 / Claude Sonnet 4.6)", core: false, pro: true, team: true, enterprise: true },
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
  { kind: "row", feature: "Cloud Commands / Month", core: "·", pro: "10,000", team: "50,000", enterprise: "Unlimited" },
  { kind: "row", feature: "SLA", core: "·", pro: "·", team: "99.5%", enterprise: "99.9%" },
];

const trustBadges = [
  { label: "SOC2 Type II", description: "Compliant", icon: Shield },
  { label: "HIPAA", description: "Ready", icon: Lock },
  { label: "GDPR", description: "Compliant", icon: BadgeCheck },
  { label: "BSL 1.1", description: "Source Available", icon: RefreshCw },
];


const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrade, downgrade, or cancel from your account dashboard at any time. Upgrades take effect immediately; downgrades apply at the end of your current billing cycle.",
  },
  {
    q: "Do you offer a free trial on paid plans?",
    a: "CX Core is free forever, no trial needed. For Pro and Team, we offer a 7-day money-back guarantee. If you're not satisfied for any reason, we'll refund your first payment in full.",
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
    a: "Yes, 50% off Pro for verified open-source maintainers and students with a valid .edu email. Email sales@cxlinux.com with a link to your project or student verification.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const referralCode = params.get("ref");

  return (
    <div className="relative min-h-screen bg-[#1E1E1E] text-white overflow-x-hidden">
      {/* Ambient glow, top centre */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#00FF9F]/[0.05] rounded-full blur-[160px]" />

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
              Simple{" "}
              <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">
                Transparent
              </span>{" "}
              Pricing
            </h1>
            <p className="text-[1.05rem] text-gray-400 mb-10 leading-relaxed">
              Start free, scale as you grow. All plans include a 14-day free trial.
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
                  2 months free
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>


      {/* ── Pricing cards ── */}
      <section className="relative pb-24 px-4">
        <div className="max-w-[1180px] mx-auto">
          <PricingCards isAnnual={isAnnual} referralCode={referralCode} />
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
      <section id="faq" className="py-20 px-4 border-t border-white/[0.05]">
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

      {/* ── Enterprise CTA, shared rotating-border shell (matches homepage Final CTA) ── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <RotatingBorderCard
            patternId="entCtaGrid"
            innerClassName="px-6 sm:px-10 md:px-14 py-14 md:py-16 text-center"
          >
            <div className="max-w-xl mx-auto">
              <div className="mb-6 flex justify-center">
                <IconPlate>
                  <Building2 className="w-7 h-7" />
                </IconPlate>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-[1.05] tracking-tight">
                Need a{" "}
                <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">
                  custom solution?
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Volume pricing, on-premise deployment, dedicated support, and tailored compliance packages
                for large engineering teams.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                <a
                  href="https://calendly.com/ai-consultant/vip"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00FF9F] text-black text-base font-bold rounded-xl hover:bg-[#00CC7F] transition-colors shadow-[0_4px_14px_-6px_rgba(0,255,159,0.30),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.15)]"
                >
                  <Calendar className="w-4 h-4" /> Schedule a Demo
                </a>
                <a
                  href="mailto:sales@cxlinux.com"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 border border-white/15 bg-white/[0.02] text-white text-base font-semibold rounded-xl hover:bg-white/[0.06] hover:border-[#00FF9F]/40 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                >
                  Contact Sales <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <p className="text-xs text-gray-600">No commitment required · Response within 24 hours</p>
            </div>
          </RotatingBorderCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
