import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Sparkles,
  Shield,
  Zap,
  Server,
  HelpCircle,
  ArrowRight,
  Calendar,
  Users,
  Terminal,
  Cloud,
  Building2,
  BadgeCheck,
  RefreshCw,
  Lock,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Switch } from "@/components/ui/switch";

interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  annualPrice: number;
  description: string;
  features: string[];
  limits: {
    servers: string;
    commands: string;
    support: string;
  };
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
  badge?: string;
  icon: typeof Sparkles;
  gradient: string;
}

const tiers: PricingTier[] = [
  {
    id: "core",
    name: "CX Core",
    subtitle: "Free Forever",
    price: 0,
    annualPrice: 0,
    description: "Free AI-powered package manager for Linux. Natural language commands, hardware detection, and dry-run mode. Limited to 1 server for personal/non-commercial use.",
    features: [
      "Natural language commands",
      "Hardware detection & optimization",
      "Dry-run mode for safety",
      "Local LLM (Mistral 7B)",
      "Full CLI access",
      "Community Discord support",
      "BSL 1.1 License",
    ],
    limits: {
      servers: "1 server",
      commands: "Unlimited local",
      support: "Community",
    },
    cta: "Get Started Free",
    ctaLink: "/pricing/checkout?plan=core",
    icon: Terminal,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: "pro",
    name: "CX Pro",
    subtitle: "For Power Users",
    price: 20,
    annualPrice: 200,
    description: "Unlock cloud AI models, web console, and priority support. Perfect for developers managing multiple servers.",
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
    limits: {
      servers: "Up to 5 servers",
      commands: "10,000/month cloud",
      support: "Email (24h)",
    },
    cta: "Upgrade Now",
    ctaLink: "/pricing/checkout?plan=pro",
    highlighted: true,
    badge: "Most Popular",
    icon: Zap,
    gradient: "from-purple-500 to-cyan-500",
  },
  {
    id: "team",
    name: "CX Team",
    subtitle: "For Growing Teams",
    price: 99,
    annualPrice: 990,
    description: "Collaborate with your team. Shared configurations, role-based access, and centralized management for dev teams.",
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
    limits: {
      servers: "Up to 25 servers",
      commands: "50,000/month cloud",
      support: "Priority (4h)",
    },
    cta: "Upgrade Now",
    ctaLink: "/pricing/checkout?plan=team",
    icon: Users,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "enterprise",
    name: "CX Enterprise",
    subtitle: "For Organizations",
    price: 299,
    annualPrice: 2990,
    description: "Enterprise-grade security, compliance, and dedicated support. SSO, audit logs, and custom SLAs for large organizations.",
    features: [
      "Everything in CX Team",
      "SSO/SAML/LDAP integration",
      "Audit logs & compliance",
      "SOC2 & HIPAA reports",
      "99.9% SLA guarantee",
      "Dedicated Slack channel",
      "Custom integrations",
      "On-premise deployment option",
      "Dedicated account manager",
    ],
    limits: {
      servers: "Unlimited",
      commands: "Unlimited",
      support: "Dedicated (1h)",
    },
    cta: "Schedule Demo",
    ctaLink: "https://calendly.com/ai-consultant/vip",
    icon: Building2,
    gradient: "from-orange-500 to-amber-500",
  },
];

const featureComparison = [
  { feature: "Natural Language Commands", core: true, pro: true, team: true, enterprise: true },
  { feature: "Local LLM (Mistral 7B)", core: true, pro: true, team: true, enterprise: true },
  { feature: "Hardware Detection", core: true, pro: true, team: true, enterprise: true },
  { feature: "Cloud LLMs (GPT-4o/Claude)", core: false, pro: true, team: true, enterprise: true },
  { feature: "Web Console Dashboard", core: false, pro: true, team: true, enterprise: true },
  { feature: "API Access", core: false, pro: true, team: true, enterprise: true },
  { feature: "Team Workspaces", core: false, pro: false, team: true, enterprise: true },
  { feature: "Role-Based Access", core: false, pro: false, team: true, enterprise: true },
  { feature: "SSO/SAML/LDAP", core: false, pro: false, team: false, enterprise: true },
  { feature: "Audit Logs", core: false, pro: false, team: false, enterprise: true },
  { feature: "Compliance Reports", core: false, pro: false, team: false, enterprise: true },
  { feature: "On-Premise Deployment", core: false, pro: false, team: false, enterprise: true },
  { feature: "Server Limit", core: "1", pro: "5", team: "25", enterprise: "Unlimited" },
  { feature: "Cloud Commands/Month", core: "-", pro: "10,000", team: "50,000", enterprise: "Unlimited" },
  { feature: "SLA", core: "-", pro: "-", team: "99.5%", enterprise: "99.9%" },
];

const trustBadges = [
  { label: "SOC2 Type II", description: "Compliant", icon: Shield },
  { label: "HIPAA", description: "Ready", icon: Lock },
  { label: "GDPR", description: "Compliant", icon: BadgeCheck },
  { label: "BSL 1.1", description: "Source Available", icon: RefreshCw },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div id="pricing-page-container" className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section id="pricing-hero-section" className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-purple-400 text-sm font-semibold tracking-wider uppercase mb-4 block">
              PRICING
            </span>
            <h1 id="pricing-hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-gray-300 via-gray-200 to-purple-400 bg-clip-text text-transparent">
                Simple Transparent
              </span>{" "}
              <span className="text-purple-400">Pricing</span>
            </h1>
            <p id="pricing-hero-subtitle" className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Start free, scale as you grow. All plans include a 14-day free trial.
            </p>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                30-day money back
              </span>
              <span className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Secure payment via Stripe
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Cancel anytime
              </span>
            </div>

            {/* Billing Toggle */}
            <div id="pricing-billing-toggle" className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-lg ${!isAnnual ? "text-white" : "text-gray-500"}`}>Monthly</span>
              <Switch
                id="pricing-toggle-switch"
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-purple-500"
              />
              <span className={`text-lg ${isAnnual ? "text-white" : "text-gray-500"}`}>
                Annual
                <span className="ml-2 text-sm text-green-400 font-semibold">Save 20%</span>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing-cards-section" className="pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Purple gradient background container */}
          <div className="relative rounded-3xl bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950 p-8 md:p-12 overflow-hidden">
            {/* Decorative gradient orbs - hidden on mobile */}
            <div className="hidden md:block absolute top-0 left-0 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="hidden md:block absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tiers.map((tier, index) => {
                const tileBackgrounds: Record<string, string> = {
                  core: "bg-gradient-to-br from-violet-500/20 to-purple-600/30 border border-violet-400/30",
                  pro: "bg-gradient-to-br from-purple-500/20 to-cyan-500/30 border border-purple-400/30",
                  team: "bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/30",
                  enterprise: "bg-gradient-to-br from-orange-500/20 to-amber-500/30 border border-orange-400/30",
                };
                return (
                <motion.div
                  key={tier.id}
                  id={`pricing-card-${tier.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-2xl p-6 backdrop-blur-xl ${
                    tier.badge
                      ? "bg-white/95 text-gray-900 shadow-2xl scale-[1.02]"
                      : tileBackgrounds[tier.id] || "bg-white/10 border border-white/20"
                  } hover:scale-[1.04] hover:-translate-y-2 transition-all duration-300`}
                >
                  {tier.badge && (
                    <div id={`pricing-badge-${tier.id}`} className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  {/* Logo/Icon */}
                  <div id={`pricing-icon-${tier.id}`} className={`px-4 py-3 rounded-2xl flex items-center justify-center gap-1.5 mb-4 ${
                    tier.badge
                      ? "bg-gradient-to-br from-violet-500 to-purple-600"
                      : "bg-white/10"
                  }`}>
                    <span className={`text-lg font-bold ${tier.badge ? "text-white" : "text-white"}`}>
                      CX
                    </span>
                    <span className={`text-sm font-medium ${tier.badge ? "text-white/80" : "text-white/70"}`}>
                      {tier.name.replace("CX ", "")}
                    </span>
                  </div>

                  <p className={`text-xs mb-4 ${tier.badge ? "text-gray-500" : "text-white/60"}`}>
                    {tier.description}
                  </p>

                  <div id={`pricing-price-${tier.id}`} className="mb-6">
                    <span className={`text-4xl font-extrabold ${tier.badge ? "text-gray-900" : "text-white"}`}>
                      ${isAnnual ? tier.annualPrice : tier.price}
                    </span>
                    <span className={`text-sm ${tier.badge ? "text-gray-500" : "text-white/60"}`}>
                      {tier.price > 0 ? (isAnnual ? "/year" : "/month") : ""}
                    </span>
                  </div>

                  {/* Key Limits */}
                  <div className={`mb-4 p-3 rounded-lg ${tier.badge ? "bg-violet-50" : "bg-white/5"}`}>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className={tier.badge ? "text-gray-500" : "text-white/60"}>Servers</span>
                        <span className={`font-semibold ${tier.badge ? "text-gray-900" : "text-white"}`}>{tier.limits.servers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tier.badge ? "text-gray-500" : "text-white/60"}>Cloud Commands</span>
                        <span className={`font-semibold ${tier.badge ? "text-gray-900" : "text-white"}`}>{tier.limits.commands}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={tier.badge ? "text-gray-500" : "text-white/60"}>Support</span>
                        <span className={`font-semibold ${tier.badge ? "text-gray-900" : "text-white"}`}>{tier.limits.support}</span>
                      </div>
                    </div>
                  </div>

                  <ul id={`pricing-features-${tier.id}`} className="space-y-2 mb-6">
                    {tier.features.slice(0, 5).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          tier.badge ? "text-violet-500" : "text-green-400"
                        }`} />
                        <span className={tier.badge ? "text-gray-600" : "text-white/80"}>{feature}</span>
                      </li>
                    ))}
                    {tier.features.length > 5 && (
                      <li className={`text-xs ${tier.badge ? "text-violet-500" : "text-white/60"}`}>
                        +{tier.features.length - 5} more features
                      </li>
                    )}
                  </ul>

                  {tier.ctaLink.startsWith("http") || tier.ctaLink.startsWith("mailto:") ? (
                    <a
                      id={`pricing-cta-${tier.id}`}
                      href={tier.ctaLink}
                      target={tier.ctaLink.startsWith("mailto:") ? undefined : "_blank"}
                      rel={tier.ctaLink.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition-all duration-300 ${
                        tier.badge
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/30"
                          : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      }`}
                    >
                      {tier.cta}
                    </a>
                  ) : (
                    <Link
                      id={`pricing-cta-${tier.id}`}
                      href={tier.ctaLink + (isAnnual ? "&billing=annual" : "&billing=monthly")}
                      className={`block w-full text-center py-3 rounded-lg font-semibold transition-all duration-300 ${
                        tier.badge
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/30"
                          : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  )}
                </motion.div>
              );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section id="pricing-trust-section" className="py-12 px-4 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                id={`pricing-trust-badge-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex flex-col items-center"
              >
                <badge.icon className="w-8 h-8 text-violet-400 mb-2" />
                <span className="text-white font-semibold">{badge.label}</span>
                <span className="text-gray-500 text-sm">{badge.description}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section id="pricing-comparison-section" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 id="pricing-comparison-title" className="text-3xl sm:text-4xl font-bold text-center mb-4">
              Compare All Features
            </h2>
            <p id="pricing-comparison-subtitle" className="text-gray-400 text-center mb-12">
              Find the perfect plan for your needs
            </p>
          </motion.div>

          <div id="pricing-comparison-table" className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-violet-400 font-semibold">CX Core</th>
                  <th className="text-center py-4 px-4 text-purple-400 font-semibold">CX Pro</th>
                  <th className="text-center py-4 px-4 text-emerald-400 font-semibold">CX Team</th>
                  <th className="text-center py-4 px-4 text-orange-400 font-semibold">CX Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, index) => (
                  <motion.tr
                    key={row.feature}
                    id={`pricing-feature-row-${index}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-300">{row.feature}</td>
                    <td className="py-4 px-4 text-center bg-violet-500/5">
                      {typeof row.core === "boolean" ? (
                        row.core ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400">{row.core}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.team === "boolean" ? (
                        row.team ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400">{row.team}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="w-5 h-5 text-green-400 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )
                      ) : (
                        <span className="text-green-400 font-semibold">{row.enterprise}</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section id="pricing-faq-cta-section" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
          >
            <HelpCircle className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 id="pricing-faq-cta-title" className="text-2xl font-bold mb-4">Have Questions?</h3>
            <p id="pricing-faq-cta-desc" className="text-gray-400 mb-6">
              Check out our pricing FAQ or contact our sales team for custom solutions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                id="pricing-faq-link"
                href="/pricing/faq"
                className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2"
              >
                View Pricing FAQ
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                id="pricing-contact-link"
                href="mailto:sales@cxlinux.com"
                className="px-6 py-3 border-2 border-violet-400 text-violet-400 font-semibold rounded-lg hover:bg-violet-400/10 transition-all"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section id="pricing-enterprise-cta-section" className="py-16 px-4 bg-gradient-to-b from-transparent to-violet-950/10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-2 border-violet-400/50 rounded-2xl p-8 md:p-12 text-center"
          >
            <Building2 className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <h3 id="pricing-enterprise-title" className="text-3xl font-bold mb-4">
              Need a Custom Solution?
            </h3>
            <p id="pricing-enterprise-desc" className="text-gray-400 mb-8 max-w-xl mx-auto">
              We offer custom enterprise packages with volume discounts, on-premise deployment,
              and tailored compliance solutions for your organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                id="pricing-demo-link"
                href="https://calendly.com/ai-consultant/vip"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Schedule Enterprise Demo
              </a>
              <a
                href="mailto:sales@cxlinux.com"
                className="px-8 py-3 border-2 border-violet-400 text-violet-400 font-semibold rounded-lg hover:bg-violet-400/10 transition-all"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
