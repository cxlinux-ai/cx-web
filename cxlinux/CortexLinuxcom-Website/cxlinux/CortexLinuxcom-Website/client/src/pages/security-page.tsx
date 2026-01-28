import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  Shield, 
  Bug, 
  Award, 
  CheckCircle, 
  Mail,
  Lock,
  RotateCcw,
  Eye,
  EyeOff,
  Server,
  Cloud,
  Cpu,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Terminal,
  Database,
  Key,
  Play,
  Pause,
  Download
} from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
        data-testid={`faq-toggle-${question.slice(0, 20).replace(/\s+/g, "-").toLowerCase()}`}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="text-blue-300 flex-shrink-0" size={20} />
        ) : (
          <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-5 pb-5"
        >
          <p className="text-gray-400 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function SecurityPage() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Security | Cortex Linux - Your System, Your Control',
      description: 'Cortex Linux is designed with security-first principles. Learn about our sandboxed execution, dry-run defaults, rollback support, and privacy commitments for production Linux environments.',
      canonicalPath: '/security',
      keywords: ['Cortex Linux security', 'CLI security', 'sandboxed execution', 'Firejail', 'AI privacy', 'local LLM', 'command safety']
    });
    return cleanup;
  }, []);

  const privacyCommitments = [
    {
      icon: Play,
      title: "Dry-Run Default",
      description: "Every command shows planned actions before execution. You see exactly what will happen before confirming."
    },
    {
      icon: Shield,
      title: "Sandbox Isolation",
      description: "Commands run in Firejail containers with restricted filesystem and network access. Isolated by default."
    },
    {
      icon: RotateCcw,
      title: "Rollback Support",
      description: "One command to undo any changes. System state is captured before significant operations for instant recovery."
    },
    {
      icon: EyeOff,
      title: "Data Minimization",
      description: "Only command text is sent to AI backends. File contents, environment variables, and secrets never leave your machine."
    },
    {
      icon: Eye,
      title: "Telemetry Transparency",
      description: "Anonymous usage metrics only: command frequency, error rates. Disable with --no-telemetry flag. No command content collected."
    },
    {
      icon: Cpu,
      title: "Local-First Options",
      description: "Full support for local LLM backends via Ollama. Run entirely offline with no external data transmission."
    }
  ];

  const aiProviders = [
    {
      name: "OpenAI (GPT-4)",
      dataRetention: "30 days for abuse monitoring",
      training: "API data not used for training",
      encryption: "TLS 1.2+ in transit, AES-256 at rest",
      compliance: "SOC 2 Type II, GDPR compliant"
    },
    {
      name: "Anthropic (Claude)",
      dataRetention: "30 days for safety evaluation",
      training: "API data not used for training by default",
      encryption: "TLS 1.3 in transit, encrypted at rest",
      compliance: "SOC 2 Type II, privacy-focused"
    },
    {
      name: "Local Models (Ollama)",
      dataRetention: "No external transmission",
      training: "N/A - fully local",
      encryption: "N/A - data stays on device",
      compliance: "Complete data sovereignty"
    }
  ];

  const neverDoItems = [
    "Train on your commands",
    "Store command history on our servers",
    "Access files without explicit commands",
    "Execute without confirmation (in safe mode)",
    "Share data with third parties",
    "Log sensitive environment variables"
  ];

  const faqItems = [
    {
      question: "What if the AI suggests a dangerous command?",
      answer: "Cortex operates in dry-run mode by default. Before any command executes, you see exactly what will happen — files modified, packages installed, services affected. Commands flagged as potentially destructive (rm -rf, chmod 777, etc.) trigger additional warnings. You can also enable safe mode which requires explicit confirmation for all system-modifying operations."
    },
    {
      question: "Can Cortex access my SSH keys or secrets?",
      answer: "Cortex cannot read files unless you explicitly include them in a command context. SSH keys, API tokens, and other secrets in standard locations (~/.ssh, ~/.config) are never accessed or transmitted. The AI only sees command text you provide, not your filesystem contents. Environment variables containing secrets are filtered before any external transmission."
    },
    {
      question: "How do I audit what Cortex has executed?",
      answer: "Every command Cortex executes is logged to ~/.cortex/history.log with timestamps, the original request, the generated command, and execution results. Use 'cortex history' to view recent commands or 'cortex history --export' to generate a full audit report. In enterprise environments, logs can be forwarded to your SIEM system."
    },
    {
      question: "Is my data sent to AI providers?",
      answer: "Only the command text you provide is sent to AI backends for processing. File contents, environment variables, and system state are never transmitted. For maximum privacy, use local models via Ollama — all processing happens on your machine with zero external data transmission."
    },
    {
      question: "How does the Firejail sandbox work?",
      answer: "Firejail creates an isolated execution environment with restricted capabilities. Commands run with limited filesystem access (read-only for most paths), no network access by default, and separated process namespaces. You can customize sandbox profiles for specific use cases. The sandbox prevents malicious or accidental damage to your system."
    }
  ];

  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  }), []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white print:bg-white print:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-300 transition-colors mb-8 print:hidden" data-testid="link-back-home">
            <ChevronLeft size={16} />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
              <Shield className="text-emerald-400" size={16} />
              <span className="text-emerald-400 text-sm font-medium">Security-First Design</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-security">
              Your system, <span className="text-blue-300">your control</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Cortex is designed with security-first principles for production Linux environments. 
              Preview before execute. Sandbox by default. Rollback anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Architecture Diagram */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Security Architecture</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Understanding exactly what happens when you use Cortex
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* What stays local */}
            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Cpu className="text-emerald-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-emerald-400">What Stays On Your Machine</h3>
              </div>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>All file contents and directory structures</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Environment variables and secrets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>SSH keys and authentication tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Command execution and results</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>System state snapshots for rollback</span>
                </li>
              </ul>
            </div>

            {/* What is transmitted */}
            <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Cloud className="text-blue-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-blue-300">What Goes to AI (Cloud Mode)</h3>
              </div>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <Terminal size={16} className="text-blue-300 mt-0.5 flex-shrink-0" />
                  <span>Your natural language command text only</span>
                </li>
                <li className="flex items-start gap-2">
                  <Terminal size={16} className="text-blue-300 mt-0.5 flex-shrink-0" />
                  <span>Optional: Selected context you explicitly share</span>
                </li>
              </ul>
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <p className="text-xs text-gray-500">
                  With local models (Ollama), nothing leaves your machine. Full air-gap support available.
                </p>
              </div>
            </div>

            {/* Sandbox execution */}
            <div className="p-6 rounded-xl bg-orange-500/5 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Shield className="text-orange-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-orange-400">Firejail Sandbox</h3>
              </div>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <Lock size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Isolated filesystem namespace</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Network access disabled by default</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Read-only access to system paths</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                  <span>Capability dropping (no raw sockets, etc.)</span>
                </li>
              </ul>
            </div>

            {/* Rollback mechanism */}
            <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <RotateCcw className="text-purple-400" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-purple-400">Rollback Architecture</h3>
              </div>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-2">
                  <Database size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Pre-execution state snapshots</span>
                </li>
                <li className="flex items-start gap-2">
                  <Database size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Filesystem change tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Database size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>Package state versioning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Database size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>One-command recovery: cortex rollback</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Commitments */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Privacy Commitments</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Built-in safeguards for production environments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {privacyCommitments.map((commitment, index) => (
              <motion.div
                key={commitment.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-brand-blue/30 transition-colors"
                data-testid={`privacy-commitment-${commitment.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center mb-4">
                  <commitment.icon className="text-blue-300" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{commitment.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{commitment.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Provider Comparison */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">AI Provider Privacy Comparison</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose the backend that matches your privacy requirements
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-sm" data-testid="ai-provider-table">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4 px-4 font-semibold text-white">Provider</th>
                  <th className="py-4 px-4 font-semibold text-white">Data Retention</th>
                  <th className="py-4 px-4 font-semibold text-white">Training Policy</th>
                  <th className="py-4 px-4 font-semibold text-white">Encryption</th>
                  <th className="py-4 px-4 font-semibold text-white">Compliance</th>
                </tr>
              </thead>
              <tbody>
                {aiProviders.map((provider, index) => (
                  <tr key={provider.name} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 px-4 font-medium text-white">{provider.name}</td>
                    <td className="py-4 px-4 text-gray-400">{provider.dataRetention}</td>
                    <td className="py-4 px-4 text-gray-400">{provider.training}</td>
                    <td className="py-4 px-4 text-gray-400">{provider.encryption}</td>
                    <td className="py-4 px-4 text-gray-400">{provider.compliance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* What We Never Do */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">What We Never Do</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Hard limits that are non-negotiable
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {neverDoItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20"
                data-testid={`never-do-${index}`}
              >
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <X className="text-red-400" size={16} />
                </div>
                <span className="text-gray-300">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Reporting */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Security Reporting</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We take security vulnerabilities seriously
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Bug className="text-blue-300" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Vulnerability Disclosure</h3>
              <p className="text-gray-400 text-sm mb-4">
                Report security issues responsibly. We acknowledge within 48 hours and aim to fix critical issues within 7 days.
              </p>
              <a
                href="mailto:security@cortexlinux.com"
                className="text-blue-300 hover:underline text-sm"
                data-testid="link-security-email"
              >
                security@cortexlinux.com
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Award className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Bug Bounty Program</h3>
              <p className="text-gray-400 text-sm mb-4">
                Rewards for valid security reports: Critical up to $5,000, High up to $2,500, Medium up to $1,000.
              </p>
              <span className="text-gray-500 text-sm">
                Scope: CLI, web properties, APIs
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <Key className="text-purple-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Encrypted Reports</h3>
              <p className="text-gray-400 text-sm mb-4">
                For sensitive disclosures, use our PGP key to encrypt your report.
              </p>
              <a
                href="/security.asc"
                className="text-blue-300 hover:underline text-sm flex items-center gap-1"
                data-testid="link-pgp-key"
              >
                <Download size={14} />
                Download PGP Key
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Common security and privacy questions
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <FAQItem key={index} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* Print/Download Notice */}
      <section className="py-8 px-4 border-t border-white/5 print:hidden">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-500 text-sm">
            This page is optimized for printing. Use your browser's print function (Ctrl/Cmd+P) to save as PDF.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
