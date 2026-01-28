import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Play,
  Terminal,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Server,
  Activity,
  Github,
  ExternalLink
} from "lucide-react";
import SovereigntyRecoverySimulation from "@/components/SovereigntyRecoverySimulation";
import InteractiveDemoHero from "@/components/InteractiveDemoHero";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function DemoPage() {
  useEffect(() => {
    updateSEO({
      title: "Live Demo - Cortex Linux",
      description: "Experience Cortex Linux's AI-powered system administration in action. See sovereignty recovery, natural language commands, and enterprise-grade automation.",
      keywords: "Cortex Linux demo, AI Linux demo, system administration demo, HRM agents, sovereignty recovery",
      ogImage: "/og-image.png"
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4 relative">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="bg-blob bg-blob-blue w-[600px] h-[600px] -top-20 -right-20" />
          <div className="bg-blob bg-blob-purple w-[400px] h-[400px] top-40 -left-20" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 mb-6"
            >
              <Play size={16} />
              <span className="text-sm font-medium">Live Interactive Demos</span>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Experience{" "}
              <span className="gradient-text">AI-Native Linux</span>
              <br />
              in Action
            </h1>

            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
              No signups, no installs, no documentation. See how Cortex Linux transforms system administration through natural language and intelligent automation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/cxlinux-ai/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
              >
                <Github size={20} />
                Try Cortex CLI
              </a>
              <Link href="/getting-started">
                <button className="flex items-center gap-2 px-6 py-3 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all">
                  <Terminal size={20} />
                  Installation Guide
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sovereignty Recovery Demo */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Sovereignty Recovery</span> System
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-2">
              Watch HRM AI agents automatically detect system failures and perform atomic rollbacks with enterprise-grade precision.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-green-400" />
                60fps Performance
              </span>
              <span className="flex items-center gap-2">
                <Shield size={16} className="text-purple-400" />
                Memory Safe
              </span>
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-blue-400" />
                Real-time Monitoring
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <SovereigntyRecoverySimulation />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-gray-500 max-w-4xl mx-auto">
              This simulation demonstrates continuous system monitoring, automatic failure detection, HRM agent deployment,
              and atomic rollback capabilities with real-time performance metrics and enterprise memory management.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Interactive Command Demo */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Natural Language <span className="gradient-text">Commands</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Type what you want to accomplish in plain English. Cortex translates your intent into precise system operations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <InteractiveDemoHero />
          </motion.div>
        </div>
      </section>

      {/* Demo Features Grid */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            {...fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Makes These <span className="gradient-text">Demos Special</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Every demo runs with production-grade code, real performance monitoring, and enterprise security standards.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Server,
                title: "Real System Operations",
                description: "Every command demo shows actual system operations, not mock outputs or fake responses."
              },
              {
                icon: Activity,
                title: "60fps Animations",
                description: "Hardware-accelerated animations with real-time performance monitoring and FPS tracking."
              },
              {
                icon: Shield,
                title: "Production Security",
                description: "Enterprise-grade memory management, input validation, and security controls."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                className="glass-card rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            {...fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Transform</span> Your Linux Experience?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Join the AI-native revolution in system administration. No more documentation, no more complex commands.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://github.com/cxlinux-ai/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
              >
                <Github size={20} />
                Install Cortex CLI
                <ExternalLink size={16} />
              </a>
              <Link href="/getting-started">
                <button className="flex items-center gap-2 px-8 py-4 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all">
                  View Documentation
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}