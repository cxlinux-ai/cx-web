import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Terminal,
  Brain,
  Shield,
  Zap,
  Code2,
  Server,
  Database,
  Cpu,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock,
  Users,
  Package,
  Sparkles
} from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";

const solutions = [
  {
    icon: Terminal,
    title: "AI-Native Package Management",
    description: "Natural language package management that understands context and dependencies. No more memorizing complex commands.",
    features: [
      "Intelligent dependency resolution",
      "Natural language queries",
      "Automated conflict handling",
      "Smart package recommendations"
    ],
    cta: "Explore Package AI",
    href: "/getting-started"
  },
  {
    icon: Shield,
    title: "Enterprise Security & Compliance",
    description: "Zero-trust architecture with BSL 1.1 licensing, SOC2 compliance, and enterprise-grade security controls.",
    features: [
      "Zero telemetry by design",
      "SOC2 Type II compliance",
      "Memory-safe Rust core",
      "End-to-end encryption"
    ],
    cta: "View Trust Center",
    href: "/trust"
  },
  {
    icon: Brain,
    title: "Autonomous Agent Fleet",
    description: "Deploy and manage intelligent agents that handle infrastructure operations, monitoring, and optimization autonomously.",
    features: [
      "Self-healing infrastructure",
      "Predictive maintenance",
      "Automated scaling",
      "Real-time threat detection"
    ],
    cta: "Manage Agent Fleet",
    href: "/agent-profiles"
  },
  {
    icon: Code2,
    title: "DevOps Automation",
    description: "Streamline CI/CD pipelines with AI-powered automation that adapts to your workflow and infrastructure needs.",
    features: [
      "Intelligent pipeline optimization",
      "Automated testing strategies",
      "Smart deployment patterns",
      "Performance monitoring"
    ],
    cta: "Start DevOps AI",
    href: "/getting-started"
  }
];

const industries = [
  {
    icon: Server,
    title: "Technology & Software",
    description: "Scale development operations with AI-native infrastructure management and automated DevOps workflows."
  },
  {
    icon: Database,
    title: "Financial Services",
    description: "SOC2 compliant, zero-telemetry infrastructure for secure financial data processing and trading systems."
  },
  {
    icon: Globe,
    title: "Healthcare & Life Sciences",
    description: "HIPAA-ready infrastructure with memory-safe operations for sensitive healthcare data and research computing."
  },
  {
    icon: Package,
    title: "Manufacturing & IoT",
    description: "Edge computing solutions with intelligent agent management for industrial automation and IoT device orchestration."
  }
];

export default function Solutions() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Solutions | CX Linux - AI-Native Infrastructure for Every Industry',
      description: 'Discover CX Linux solutions: AI-native package management, enterprise security, autonomous agent fleets, and DevOps automation. Transform your infrastructure with intelligent automation.',
      canonicalPath: '/solutions',
      keywords: [
        'AI infrastructure solutions',
        'enterprise Linux',
        'DevOps automation',
        'intelligent package management',
        'autonomous agents',
        'SOC2 compliance',
        'zero telemetry',
        'memory safe systems'
      ],
    });

    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="py-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Native Infrastructure
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="text-white">Transform Your</span><br/>
            <span className="gradient-text">Infrastructure</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            CX Linux delivers AI-native solutions that eliminate complexity, enhance security,
            and automate operations. Built for enterprises that demand both innovation and reliability.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/getting-started">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold text-lg flex items-center gap-2 transition-all duration-300"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>

            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border border-gray-600 hover:border-gray-400 rounded-lg font-semibold text-lg transition-all duration-300"
              >
                View Pricing
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* Core Solutions */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Core</span>{" "}
              <span className="gradient-text">Solutions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Purpose-built AI solutions that adapt to your infrastructure needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="group p-8 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <solution.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {solution.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {solution.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={solution.href}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    {solution.cta}
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Industry Solutions */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-white">Industry</span>{" "}
              <span className="gradient-text">Applications</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tailored solutions for specific industry requirements and compliance needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <motion.div
                key={industry.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="p-6 bg-gray-900/30 border border-gray-800 rounded-xl hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <industry.icon className="w-6 h-6 text-blue-400" />
                </div>

                <h3 className="text-lg font-bold text-white mb-3">
                  {industry.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {industry.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-20 text-center"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Infrastructure?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using CX Linux to automate their operations with AI-native infrastructure.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/getting-started">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(139, 92, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-lg flex items-center gap-2 transition-all duration-300"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>

              <Link href="/support">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border border-gray-600 hover:border-purple-400 rounded-lg font-semibold text-lg transition-all duration-300"
                >
                  Contact Sales
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.section>

      </div>

      <Footer />
    </div>
  );
}