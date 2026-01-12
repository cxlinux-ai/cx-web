import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight,
  Brain, 
  Cpu, 
  Shield, 
  Target,
  Rocket,
  Code2,
  Users,
  GitBranch,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  Lock,
  Globe,
  Building2,
  Sparkles,
  Github,
  MessageCircle
} from "lucide-react";
import { updateSEO } from "@/lib/seo";
import Footer from "@/components/Footer";
import { FaDiscord } from "react-icons/fa";

const missionPillars = [
  {
    icon: Brain,
    title: "AI as Infrastructure",
    description: "Intelligence embedded directly into the system layer. Natural language becomes a native interface, not a wrapper around shell scripts.",
    gradient: "from-purple-500/20 to-purple-600/5",
    borderColor: "border-purple-500/30",
    iconColor: "text-purple-400"
  },
  {
    icon: Cpu,
    title: "Built for Production",
    description: "Not a prototype or research project. Designed for developers and engineering teams who need reliability alongside intelligence.",
    gradient: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/30",
    iconColor: "text-blue-300"
  },
  {
    icon: Shield,
    title: "Open & Accountable",
    description: "Open source because infrastructure should be inspectable. Public roadmaps, documented decisions, and community-first development.",
    gradient: "from-emerald-500/20 to-emerald-600/5",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400"
  }
];

const roadmapPhases = [
  {
    phase: "Phase 1",
    title: "Foundation",
    status: "completed",
    quarter: "Q4 2024",
    milestones: [
      "Core CLI with natural language processing",
      "Sandboxed execution environment",
      "Preview-before-execute safety layer",
      "Initial documentation and guides"
    ]
  },
  {
    phase: "Phase 2",
    title: "Builder Release",
    status: "in-progress",
    quarter: "Q1 2025",
    milestones: [
      "Enhanced AI reasoning engine",
      "Multi-step workflow automation",
      "Community plugin architecture",
      "Comprehensive test coverage"
    ]
  },
  {
    phase: "Phase 3",
    title: "Enterprise Ready",
    status: "upcoming",
    quarter: "Q2 2025",
    milestones: [
      "Zero-trust execution mode",
      "Audit logging and compliance",
      "Team collaboration features",
      "Enterprise SSO integration"
    ]
  },
  {
    phase: "Phase 4",
    title: "Ecosystem Growth",
    status: "planned",
    quarter: "Q3 2025",
    milestones: [
      "Third-party plugin marketplace",
      "Cloud platform integrations",
      "Advanced AI model options",
      "Enterprise support program"
    ]
  }
];

const currentTasks = [
  {
    title: "Complete Ideathon Infrastructure",
    priority: "high",
    category: "Hackathon",
    owner: "Core Team",
    link: "https://github.com/cortexlinux/cortex/issues"
  },
  {
    title: "Ship CLI Zero-Trust Mode",
    priority: "high",
    category: "Security",
    owner: "Security Team",
    link: "https://github.com/cortexlinux/cortex/issues"
  },
  {
    title: "Enhance Multi-Step Workflows",
    priority: "medium",
    category: "Core",
    owner: "Engineering",
    link: "https://github.com/cortexlinux/cortex/issues"
  },
  {
    title: "Plugin Architecture v2",
    priority: "medium",
    category: "Platform",
    owner: "Platform Team",
    link: "https://github.com/cortexlinux/cortex/issues"
  },
  {
    title: "Expand Test Coverage to 90%",
    priority: "medium",
    category: "Quality",
    owner: "QA Team",
    link: "https://github.com/cortexlinux/cortex/issues"
  },
  {
    title: "Documentation Overhaul",
    priority: "low",
    category: "Docs",
    owner: "DevRel",
    link: "https://github.com/cortexlinux/cortex/issues"
  }
];

const coreContributors = [
  { name: "Mike Morgan", role: "CEO", github: "mikejmorgan-ai" },
  { name: "Suyash D", role: "Lead Engineer", github: "Suyashd999" },
  { name: "Ansh Grover", role: "Main Reviewer", github: "Anshgrover23" }
];

export default function MissionPage() {
  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Our Mission & Roadmap | Cortex Linux',
      description: 'Cortex Linux exists to make AI a first-class system capability. Explore our mission, development roadmap, current priorities, and how you can contribute.',
      canonicalPath: '/mission',
      keywords: ['Cortex Linux mission', 'AI operating system', 'AI-native Linux', 'AI infrastructure', 'Cortex roadmap', 'open source roadmap']
    });
    return cleanup;
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Clock size={12} className="animate-pulse" />
            In Progress
          </span>
        );
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Circle size={12} />
            Upcoming
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
            <Circle size={12} />
            Planned
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">Low</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 cursor-pointer text-sm" data-testid="link-back-home">
              <ArrowLeft size={16} />
              Back to Home
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-blue/10 to-purple-500/10 border border-brand-blue/20 text-blue-300 text-sm mb-6">
              <Target size={14} />
              <span>Our Mission</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" data-testid="heading-mission">
              Building the <span className="gradient-text">AI Layer</span> for Linux
            </h1>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10">
              Cortex Linux exists to make AI a first-class system capability — not a plugin, not a workaround. 
              Intelligence embedded directly into the operating system.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="https://github.com/cortexlinux/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
                data-testid="button-join-mission"
              >
                <Github size={18} />
                Join the Mission
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://discord.gg/cortexlinux"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 glass-card rounded-xl font-semibold hover:border-blue-300/50 transition-all duration-300 flex items-center justify-center gap-2"
                data-testid="link-discord-community"
              >
                <FaDiscord size={18} />
                Join Community
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2" data-testid="badge-mission-open-source">
                <Code2 size={16} className="text-blue-300" />
                <span>100% Open Source</span>
              </div>
              <div className="flex items-center gap-2" data-testid="badge-mission-community">
                <Users size={16} className="text-emerald-400" />
                <span>Community Driven</span>
              </div>
              <div className="flex items-center gap-2" data-testid="badge-mission-mit">
                <Shield size={16} className="text-purple-400" />
                <span>MIT Licensed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Pillars */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our <span className="gradient-text">Core Principles</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              The philosophical foundation that guides every decision we make.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {missionPillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl bg-gradient-to-br ${pillar.gradient} border ${pillar.borderColor} hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300`}
                data-testid={`pillar-${pillar.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4`}>
                  <pillar.icon size={24} className={pillar.iconColor} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{pillar.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 px-4 border-t border-white/5 relative overflow-hidden" id="roadmap">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-blue/10 to-purple-500/10 border border-brand-blue/20 text-blue-300 text-sm mb-6">
              <Rocket size={14} />
              <span>Development Roadmap</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Where We're <span className="gradient-text">Headed</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Our transparent development timeline. Track our progress and see what's coming next.
            </p>
          </motion.div>

          {/* Desktop Timeline */}
          <div className="hidden lg:block relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/50 via-blue-500/50 to-gray-500/30" />
            
            <div className="grid grid-cols-4 gap-6">
              {roadmapPhases.map((phase, i) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative"
                  data-testid={`roadmap-phase-${i + 1}`}
                >
                  {/* Timeline Dot */}
                  <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                    phase.status === "completed" ? "bg-emerald-500 border-emerald-400" :
                    phase.status === "in-progress" ? "bg-blue-500 border-blue-400 animate-pulse" :
                    "bg-gray-700 border-gray-600"
                  }`} />

                  <div className="pt-16 px-4">
                    <div className="mb-3">
                      {getStatusBadge(phase.status)}
                    </div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{phase.phase}</span>
                    <h3 className="text-lg font-semibold text-white mb-1">{phase.title}</h3>
                    <p className="text-sm text-blue-300 mb-4">{phase.quarter}</p>
                    
                    <ul className="space-y-2">
                      {phase.milestones.map((milestone, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                          <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${
                            phase.status === "completed" ? "text-emerald-400" : "text-gray-600"
                          }`} />
                          {milestone}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="lg:hidden space-y-6">
            {roadmapPhases.map((phase, i) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-8 border-l-2 border-gray-700"
                data-testid={`roadmap-phase-mobile-${i + 1}`}
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-2 top-0 w-4 h-4 rounded-full border-2 ${
                  phase.status === "completed" ? "bg-emerald-500 border-emerald-400" :
                  phase.status === "in-progress" ? "bg-blue-500 border-blue-400 animate-pulse" :
                  "bg-gray-700 border-gray-600"
                }`} />

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{phase.phase}</span>
                      <h3 className="text-lg font-semibold text-white">{phase.title}</h3>
                    </div>
                    {getStatusBadge(phase.status)}
                  </div>
                  <p className="text-sm text-blue-300 mb-3">{phase.quarter}</p>
                  
                  <ul className="space-y-2">
                    {phase.milestones.map((milestone, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-400">
                        <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${
                          phase.status === "completed" ? "text-emerald-400" : "text-gray-600"
                        }`} />
                        {milestone}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Tasks Section */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-blue/10 to-purple-500/10 border border-brand-blue/20 text-blue-300 text-sm mb-6">
              <Zap size={14} />
              <span>Current Priorities</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What We're <span className="gradient-text">Working On</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Transparency in action. See our current focus areas and how you can contribute.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTasks.map((task, i) => (
              <motion.a
                key={task.title}
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-blue/30 hover:bg-white/[0.07] transition-all duration-300"
                data-testid={`task-${task.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-gray-300">
                        {task.category}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <h3 className="text-white font-medium group-hover:text-blue-300 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{task.owner}</p>
                  </div>
                  <GitBranch size={18} className="text-gray-600 group-hover:text-blue-300 transition-colors flex-shrink-0" />
                </div>
              </motion.a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="https://github.com/cortexlinux/cortex/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-300 transition-colors"
              data-testid="link-view-all-issues"
            >
              View all issues on GitHub
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Core Contributors */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-sm font-normal text-gray-500 tracking-wide uppercase">
              Core Contributors
            </h2>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-12">
            {coreContributors.map((contributor) => (
              <motion.figure
                key={contributor.github}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center group"
              >
                <a
                  href={`https://github.com/${contributor.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mb-3"
                  data-testid={`link-contributor-${contributor.github}`}
                >
                  <img
                    src={`https://github.com/${contributor.github}.png`}
                    alt={`${contributor.name}, ${contributor.role}`}
                    className="w-16 h-16 rounded-full grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300 ring-2 ring-white/10 group-hover:ring-brand-blue/50"
                    loading="lazy"
                  />
                </a>
                <figcaption>
                  <a
                    href={`https://github.com/${contributor.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors"
                  >
                    {contributor.name}
                  </a>
                  <p className="text-xs text-gray-500 mt-1">{contributor.role}</p>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Developers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                <Code2 size={24} className="text-blue-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">For Developers</h3>
              <p className="text-gray-400 text-sm mb-6">
                Contribute code, report bugs, or build plugins. Every contribution helps shape the future of AI on Linux.
              </p>
              <a
                href="https://github.com/cortexlinux/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-500 transition-colors"
                data-testid="button-github-contribute"
              >
                <Github size={18} />
                Contribute on GitHub
              </a>
            </motion.div>

            {/* For Partners */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4">
                <Building2 size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">For Partners</h3>
              <p className="text-gray-400 text-sm mb-6">
                Interested in enterprise features, integrations, or partnership opportunities? Let's talk.
              </p>
              <a
                href="mailto:partners@cortexlinux.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 rounded-lg text-white font-medium hover:bg-purple-500 transition-colors"
                data-testid="button-contact-partners"
              >
                <MessageCircle size={18} />
                Get in Touch
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
