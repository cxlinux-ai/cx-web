import { Sparkles, Zap, Users, Building2, Terminal } from "lucide-react";

export interface PricingTier {
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

export const tiers: PricingTier[] = [
  {
    id: "core",
    name: "CX Core",
    subtitle: "Free forever",
    price: 0,
    annualPrice: 0,
    description: "Talk to your terminal in plain English. Runs 100% locally, your servers, your data, your rules.",
    features: [
      "Natural language commands, offline",
      "Hardware-aware optimizations",
      "Dry-run safety net (preview before execute)",
      "Local LLM included (Mistral 7B)",
      "Full CLI, no feature gating",
      "Community Discord (2,400+ engineers)",
      "Source-available (BSL 1.1)",
    ],
    limits: { servers: "1 server", commands: "Unlimited local", support: "Community" },
    cta: "Install in 60 seconds",
    ctaLink: "/pricing/checkout?plan=core",
    icon: Terminal,
  },
  {
    id: "pro",
    name: "CX Pro",
    subtitle: "Most popular",
    price: 20,
    annualPrice: 200,
    description: "Frontier AI in your terminal. For developers who'd rather ship than read man-pages.",
    features: [
      "Everything in Core",
      "Frontier cloud models (GPT-5 + Claude Sonnet 4.6)",
      "Web console, manage from anywhere",
      "API & webhooks (automate everything)",
      "Email support, replies in under 24h",
      "Priority feature releases",
      "Usage analytics & cost tracking",
      "Custom aliases & playbooks",
    ],
    limits: { servers: "5 servers", commands: "10,000/mo cloud", support: "Email (24h)" },
    cta: "Start with Pro",
    ctaLink: "/pricing/checkout?plan=pro",
    highlighted: true,
    icon: Zap,
  },
  {
    id: "team",
    name: "CX Team",
    subtitle: "Built for squads",
    price: 99,
    annualPrice: 990,
    description: "Stop tribal knowledge from leaving with your senior engineer. One language for your whole infra.",
    features: [
      "Everything in Pro",
      "Shared team workspaces",
      "Role-based access (no more sudo-everyone)",
      "Searchable command history",
      "Centralized config, push to all servers",
      "Team analytics & adoption metrics",
      "Slack integration (alerts + commands)",
      "Priority support, replies in 4h",
    ],
    limits: { servers: "25 servers", commands: "50,000/mo cloud", support: "Priority (4h)" },
    cta: "Start Team Plan",
    ctaLink: "/pricing/checkout?plan=team",
    icon: Users,
  },
  {
    id: "enterprise",
    name: "CX Enterprise",
    subtitle: "For large teams",
    price: 299,
    annualPrice: 2990,
    description: "SOC2, on-prem deployment, and a human in your Slack 24/7. Replaces 3 ops tools, at half the cost.",
    features: [
      "Everything in Team",
      "SSO / SAML / LDAP",
      "Full audit logs & compliance trails",
      "SOC2 Type II & HIPAA reports",
      "99.9% uptime SLA (financially backed)",
      "Dedicated Slack channel + 1h response",
      "Custom integrations built for you",
      "On-premise / air-gapped deployment",
      "Named account manager",
    ],
    limits: { servers: "Unlimited", commands: "Unlimited", support: "Dedicated (1h)" },
    cta: "Book a 30-min Demo",
    ctaLink: "https://calendly.com/ai-consultant/vip",
    icon: Building2,
  },
];
