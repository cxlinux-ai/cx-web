import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronLeft,
  Terminal,
  MessageSquare,
  BookOpen,
  Bug,
  Building2,
  HelpCircle,
  ExternalLink,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { FaDiscord, FaGithub } from "react-icons/fa";
import Footer from "@/components/Footer";

export default function Support() {
  const gettingStarted = [
    {
      title: "Install CX Linux",
      description: "One-line install on Ubuntu 24.04 LTS",
      code: "curl -fsSL https://get.cxlinux.com | bash",
    },
    {
      title: "Configure API Key",
      description: "Set up your LLM provider",
      code: "cx config set-api-key YOUR_API_KEY",
    },
    {
      title: "Start Using",
      description: "Run your first AI-powered command",
      code: 'cx "install python and set up a virtual environment"',
    },
  ];

  const supportChannels = [
    {
      icon: FaDiscord,
      title: "Discord Community",
      description: "Get help from the community and core team. Average response time: 2-4 hours.",
      link: "https://discord.gg/uCqHvxjU83",
      linkText: "Join Discord",
      external: true,
    },
    {
      icon: FaGithub,
      title: "GitHub Discussions",
      description: "Ask questions, share ideas, and discuss features with the community.",
      link: "https://github.com/cxlinux-ai/cx/discussions",
      linkText: "Open Discussion",
      external: true,
    },
    {
      icon: BookOpen,
      title: "Documentation",
      description: "Comprehensive guides, API reference, and tutorials.",
      link: "https://docs.cxlinux.com",
      linkText: "Read Docs",
      external: true,
    },
    {
      icon: Bug,
      title: "Bug Reports",
      description: "Found a bug? Report it on GitHub Issues with reproduction steps.",
      link: "https://github.com/cxlinux-ai/cx/issues/new?template=bug_report.md",
      linkText: "Report Bug",
      external: true,
    },
  ];

  const enterpriseFeatures = [
    { icon: Clock, text: "24-hour response time SLA" },
    { icon: Shield, text: "Dedicated support channel" },
    { icon: Zap, text: "Priority bug fixes" },
    { icon: Building2, text: "Custom integration help" },
  ];

  const faqs = [
    {
      q: "How do I update CX Linux to the latest version?",
      a: "Run `cx update` to check for and install the latest version. For major upgrades, you may need to run `curl -fsSL https://get.cxlinux.com | bash` again.",
    },
    {
      q: "CX Linux isn't recognizing my API key. What should I do?",
      a: "First, verify your key with `cx config show`. If it's set correctly, check that your API key has the necessary permissions. For Claude API, ensure you have credits available. Try `cx config set-api-key YOUR_KEY` to reset it.",
    },
    {
      q: "Can I use CX Linux offline?",
      a: "Yes! With local mode, CX Linux runs Mistral 7B locally on your machine. Run `cx config set-mode local` to switch. Note: requires a GPU with 8GB+ VRAM for best performance.",
    },
    {
      q: "How do I undo a command CX Linux executed?",
      a: "CX Linux creates automatic snapshots before major changes. Run `cx rollback` to undo the last operation, or `cx history` to see all recent actions and selectively revert.",
    },
    {
      q: "Is my data sent to external servers?",
      a: "In cloud mode, your commands are sent to LLM providers (Claude/OpenAI) for processing. In local mode, everything stays on your machine. We never store your commands on our servers. See our Privacy Policy for details.",
    },
  ];

  return (
    <div id="support-page-container" className="min-h-screen pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        <Link
          id="support-back-link"
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 id="support-title" className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Support &</span>{" "}
            <span className="gradient-text">Help Center</span>
          </h1>
          <p id="support-subtitle" className="text-gray-400 text-lg">
            Get help with CX Linux — from installation to advanced usage
          </p>
        </motion.div>

        {/* Getting Started */}
        <motion.section
          id="support-getting-started"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Terminal size={20} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Getting Started</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {gettingStarted.map((step, index) => (
              <div
                key={index}
                id={`support-step-${index}`}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="text-blue-400 text-sm font-medium mb-1">Step {index + 1}</div>
                <h3 className="text-white font-semibold mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{step.description}</p>
                <code className="block bg-black/50 text-green-400 text-xs p-2 rounded font-mono overflow-x-auto">
                  {step.code}
                </code>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Support Channels */}
        <motion.section
          id="support-channels"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <MessageSquare size={20} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Community Support</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {supportChannels.map((channel, index) => (
              <a
                key={index}
                id={`support-channel-${index}`}
                href={channel.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-400/50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <channel.icon size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                      {channel.title}
                      <ExternalLink size={14} className="text-gray-500 group-hover:text-blue-400" />
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{channel.description}</p>
                    <span className="text-blue-400 text-sm font-medium">{channel.linkText} →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </motion.section>

        {/* Enterprise Support */}
        <motion.section
          id="support-enterprise"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Building2 size={20} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Enterprise Support</h2>
            </div>
            <p className="text-gray-300 mb-6">
              Pro, Enterprise, and Managed customers receive priority support with guaranteed response times
              and dedicated assistance.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {enterpriseFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                  <feature.icon size={16} className="text-blue-400" />
                  {feature.text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                id="support-enterprise-email"
                href="mailto:support@cxlinux.com"
                className="px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
              >
                Contact Enterprise Support
              </a>
              <Link
                id="support-enterprise-pricing"
                href="/pricing"
                className="px-5 py-2.5 border border-blue-400 text-blue-400 font-semibold rounded-lg hover:bg-blue-400/10 transition-all"
              >
                View Plans
              </Link>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          id="support-faq"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <HelpCircle size={20} className="text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                id={`support-faq-${index}`}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <h3 className="text-white font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              id="support-full-faq-link"
              href="/faq"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              View Full FAQ →
            </Link>
          </div>
        </motion.section>

        {/* Contact */}
        <motion.section
          id="support-contact"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Still Need Help?</h3>
            <p className="text-gray-400 mb-4">
              Can't find what you're looking for? Reach out directly.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                id="support-contact-email"
                href="mailto:mike@cxlinux.com"
                className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
              >
                mike@cxlinux.com
              </a>
              <a
                id="support-contact-discord"
                href="https://discord.gg/uCqHvxjU83"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
              >
                <FaDiscord size={16} />
                Discord
              </a>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
}
