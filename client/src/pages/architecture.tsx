import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link } from "wouter";
import { updateSEO, seoConfigs } from "@/lib/seo";
import Footer from "@/components/Footer";
import {
  Terminal,
  Brain,
  Cpu,
  Shield,
  Zap,
  Package,
  Settings,
  Server,
  Wrench,
  HardDrive,
  AlertTriangle,
  Eye,
  Undo2,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

function MainArchitectureFlow() {
  const steps = [
    {
      number: "01",
      title: "Input",
      subtitle: "Natural Language",
      icon: Terminal,
      example: '"Install PyTorch with CUDA support"',
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      title: "Process",
      subtitle: "AI Understanding",
      icon: Brain,
      example: "Parse intent, detect context",
      color: "from-purple-500 to-purple-600",
    },
    {
      number: "03",
      title: "Generate",
      subtitle: "Optimized Commands",
      icon: Cpu,
      example: "apt install python3-torch-cuda",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      number: "04",
      title: "Execute",
      subtitle: "Safe & Reversible",
      icon: CheckCircle,
      example: "Sandboxed with rollback",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            className="relative"
          >
            <div className="relative z-10 p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-brand-blue/30 transition-all duration-300 group">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-7 h-7 text-white" />
              </div>
              
              <div className="text-xs font-mono text-gray-500 mb-1">{step.number}</div>
              <h3 className="text-xl font-bold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-blue-300 mb-3">{step.subtitle}</p>
              <p className="text-xs text-gray-500 font-mono">{step.example}</p>
            </div>
            
            {index < steps.length - 1 && (
              <div className="hidden md:flex absolute top-1/2 -right-5 transform -translate-y-1/2 z-20">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 + 0.3 }}
                >
                  <ArrowRight className="w-6 h-6 text-gray-600" />
                </motion.div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50 -z-10 origin-left"
      />
    </div>
  );
}

function AgentGridFlow() {
  const agents = [
    {
      name: "Package Agent",
      domain: "Installation & Removal",
      description: "apt, pacman, dnf, flatpak, snap",
      icon: Package,
      color: "blue",
    },
    {
      name: "Config Agent",
      domain: "File Modifications",
      description: "nginx, apache, systemd, .env",
      icon: Settings,
      color: "purple",
    },
    {
      name: "Service Agent",
      domain: "Process Management",
      description: "systemctl, cron, monitoring",
      icon: Server,
      color: "cyan",
    },
    {
      name: "Security Agent",
      domain: "System Hardening",
      description: "Firewall, SSL, permissions",
      icon: Shield,
      color: "emerald",
    },
    {
      name: "Diagnostic Agent",
      domain: "Troubleshooting",
      description: "Log analysis, health checks",
      icon: Wrench,
      color: "amber",
    },
    {
      name: "Driver Agent",
      domain: "Hardware",
      description: "NVIDIA, AMD, WiFi, firmware",
      icon: HardDrive,
      color: "rose",
    },
  ];

  const colorClasses: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-400/50",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-400/50",
    cyan: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/50",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-400/50",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/50",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 hover:border-rose-400/50",
  };

  const iconColorClasses: Record<string, string> = {
    blue: "text-blue-400",
    purple: "text-purple-400",
    cyan: "text-cyan-400",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-blue/20 to-purple-500/20 border border-brand-blue/30">
          <Brain className="w-6 h-6 text-blue-400" />
          <span className="text-white font-semibold">CX Orchestrator</span>
          <Zap className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="mt-4 text-gray-500 text-sm">Routes tasks to specialist agents</div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-xl bg-gradient-to-br ${colorClasses[agent.color]} border transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${iconColorClasses[agent.color]}`}>
                <agent.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                <p className="text-xs text-blue-300 mb-1">{agent.domain}</p>
                <p className="text-xs text-gray-500">{agent.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SafetyPipelineFlow() {
  const safetySteps = [
    {
      icon: AlertTriangle,
      title: "Command Whitelist",
      description: "Only approved operations",
      color: "amber",
    },
    {
      icon: Eye,
      title: "Dry-Run Preview",
      description: "See before you execute",
      color: "blue",
    },
    {
      icon: Lock,
      title: "Sandbox Execution",
      description: "Isolated environment",
      color: "purple",
    },
    {
      icon: Undo2,
      title: "Instant Rollback",
      description: "One-click undo",
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, string> = {
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-2">
      {safetySteps.map((step, index) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-2"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${colorClasses[step.color]} transition-all duration-300 hover:scale-105`}>
            <step.icon className="w-5 h-5" />
            <div>
              <div className="text-sm font-semibold text-white">{step.title}</div>
              <div className="text-xs text-gray-400">{step.description}</div>
            </div>
          </div>
          {index < safetySteps.length - 1 && (
            <ArrowRight className="w-5 h-5 text-gray-600 hidden md:block" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default function ArchitecturePage() {
  useEffect(() => {
    updateSEO({
      title: "Architecture - How CX Works | CX Linux",
      description: "Discover how CX Linux uses a multi-agent AI system to execute Linux commands safely. Specialized agents for packages, config, services, security, and more.",
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-blue-300 text-sm mb-6">
              <Cpu size={14} />
              <span>Multi-Agent Architecture</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              How <span className="gradient-text">CX</span> Works
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A purpose-built AI system with specialized agents that collaborate 
              to solve complex Linux tasks — safely and reversibly.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              From <span className="text-blue-400">Natural Language</span> to <span className="text-emerald-400">Safe Execution</span>
            </h2>
            <MainArchitectureFlow />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold text-center mb-4">
              Six <span className="gradient-text">Specialist Agents</span>
            </h2>
            <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
              Each agent is an expert in its domain. The Orchestrator routes tasks 
              to the right agent(s), and agents collaborate when needed.
            </p>
            <AgentGridFlow />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-center mb-4">
              <span className="text-emerald-400">Safety</span> First Architecture
            </h2>
            <p className="text-gray-400 text-center mb-8 max-w-xl mx-auto">
              Every command goes through multiple safety checks before execution.
            </p>
            <SafetyPipelineFlow />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <Link
                href="/getting-started"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-blue rounded-xl text-white font-semibold hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] transition-all duration-300"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-all duration-300"
              >
                <Shield className="w-5 h-5" />
                Security Details
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
