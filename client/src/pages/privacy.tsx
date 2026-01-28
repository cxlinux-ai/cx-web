import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronLeft,
  Shield,
  Database,
  Eye,
  Server,
  Clock,
  UserCheck,
  Mail,
} from "lucide-react";
import Footer from "@/components/Footer";

export default function Privacy() {
  const sections = [
    {
      icon: Database,
      title: "Data We Collect",
      content: `CX Linux collects minimal data to provide and improve our services:

**Telemetry Data (Opt-in)**
• Command categories executed (not the actual commands)
• Feature usage statistics
• Performance metrics

**Crash Reports (Opt-in)**
• Error messages and stack traces
• System configuration at time of crash
• Steps leading to the error

**Usage Analytics**
• Installation statistics
• Version information
• General usage patterns

**Account Data (Pro/Enterprise)**
• Email address and name
• Company information
• Billing details (processed by Stripe)

You can disable telemetry at any time with: \`cx config set-telemetry off\``
    },
    {
      icon: Eye,
      title: "How We Use Your Data",
      content: `Your data is used solely to improve CX Linux:

**Product Improvement**
• Identify and fix bugs
• Understand which features are most valuable
• Optimize performance for common use cases

**Service Delivery**
• Process subscriptions and payments
• Provide customer support
• Send critical security updates

**What We Don't Do**
• We never sell your data to third parties
• We never use your data for advertising
• We never share individual usage data
• We never store the actual commands you execute

All analytics are aggregated and anonymized before analysis.`
    },
    {
      icon: Server,
      title: "Third-Party Services",
      content: `We use trusted third-party services:

**Stripe** (Payments)
• Processes subscription payments
• We never see or store your full card number
• PCI-DSS compliant

**LLM Providers** (AI Processing)
• Claude API (Anthropic) or OpenAI API
• Your commands are sent for AI processing in cloud mode
• Subject to their respective privacy policies
• Use local mode to keep everything on-device

**Infrastructure**
• Cloud hosting for our website and APIs
• All data encrypted in transit (TLS 1.3)
• Data encrypted at rest (AES-256)

**Analytics**
• Privacy-focused analytics (no personal tracking)
• No third-party advertising trackers`
    },
    {
      icon: Clock,
      title: "Data Retention",
      content: `We retain data only as long as necessary:

**Telemetry & Analytics**
• Aggregated data: Retained indefinitely
• Raw telemetry: Deleted after 90 days

**Account Data**
• Active accounts: Retained while account is active
• Closed accounts: Deleted within 30 days of request

**Crash Reports**
• Retained for 1 year to identify recurring issues
• Anonymized after 90 days

**Billing Records**
• Retained for 7 years (legal requirement)

**Support Communications**
• Retained for 2 years after resolution

You can request deletion of your data at any time.`
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: `You have full control over your data:

**Access**
• Request a copy of all data we hold about you
• Export your account data in machine-readable format

**Correction**
• Update or correct inaccurate personal data
• Modify your account settings at any time

**Deletion**
• Request deletion of your personal data
• Close your account and remove all associated data

**Opt-Out**
• Disable telemetry: \`cx config set-telemetry off\`
• Unsubscribe from non-essential emails
• Use local mode to avoid cloud data processing

**Portability**
• Export your configuration and preferences
• Move to self-hosted deployment

To exercise these rights, email: privacy@cxlinux.com
Response time: Within 30 days`
    },
    {
      icon: Shield,
      title: "Security Measures",
      content: `We protect your data with industry-standard security:

**Encryption**
• TLS 1.3 for all data in transit
• AES-256 for data at rest
• End-to-end encryption for sensitive communications

**Access Controls**
• Role-based access for our team
• Multi-factor authentication required
• Regular access audits

**Compliance**
• SOC 2 Type II certified (Enterprise)
• GDPR compliant
• CCPA compliant

**Incident Response**
• 24/7 security monitoring
• Incident response plan in place
• Breach notification within 72 hours if required`
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: `For privacy-related inquiries:

**Email:** privacy@cxlinux.com
**General:** mike@cxlinux.com
**Discord:** discord.gg/uCqHvxjU83

**Company:**
AI Venture Holdings LLC
Salt Lake City, Utah, USA

We respond to all privacy requests within 30 days.

For Enterprise customers, contact your dedicated account manager for priority handling.`
    },
  ];

  return (
    <div id="privacy-page-container" className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          id="privacy-back-link"
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 id="privacy-title" className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Privacy</span>{" "}
            <span className="gradient-text">Policy</span>
          </h1>
          <p id="privacy-subtitle" className="text-gray-400 text-lg">
            How CX Linux collects, uses, and protects your data
          </p>
          <p id="privacy-effective-date" className="text-gray-500 text-sm mt-2">
            Last updated: January 15, 2026
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4 mb-8"
        >
          <p className="text-purple-300 text-sm">
            <strong>TL;DR:</strong> We collect minimal data, never sell it, and you can opt out of
            telemetry entirely. Use local mode for complete privacy.
          </p>
        </motion.div>

        <div id="privacy-sections" className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              id={`privacy-section-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <section.icon size={20} className="text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              </div>
              <div className="text-gray-400 whitespace-pre-line leading-relaxed text-sm prose prose-invert prose-sm max-w-none">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
