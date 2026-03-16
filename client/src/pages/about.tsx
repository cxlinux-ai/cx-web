import { motion } from "framer-motion";
import {
  Terminal,
  Users,
  Shield,
  Zap,
  Github,
  Globe,
  Heart,
  MessageCircle,
  Code2,
  Cpu,
  BookOpen,
} from "lucide-react";
import Footer from "@/components/Footer";

const coreContributors = [
  {
    name: "Mike Morgan",
    role: "Founder & CEO",
    github: "mikejmorgan-ai",
    avatar: "https://avatars.githubusercontent.com/u/73376634?v=4",
  },
  {
    name: "Gary Xue",
    role: "CTO",
    github: "0xBigotry7",
    avatar: "https://avatars.githubusercontent.com/u/192658339?v=4",
  },
  {
    name: "Wez Furlong",
    role: "WezTerm Creator",
    github: "wez",
    avatar: "https://avatars.githubusercontent.com/u/117777?v=4",
  },
  {
    name: "Sahil Bhatane",
    role: "Frontend",
    github: "Sahilbhatane",
    avatar: "https://avatars.githubusercontent.com/u/235881233?v=4",
  },
  {
    name: "Siarhei Fedartsou",
    role: "Core",
    github: "jsgf",
    avatar: "https://avatars.githubusercontent.com/u/147966?v=4",
  },
  {
    name: "Marvin Löbel",
    role: "Core",
    github: "nagisa",
    avatar: "https://avatars.githubusercontent.com/u/679122?v=4",
  },
];

const milestones = [
  { date: "Aug 2025", event: "Project kicked off — AI-native terminal concept validated" },
  { date: "Sep 2025", event: "Core architecture: WezTerm fork + Rust AI command engine" },
  { date: "Oct 2025", event: "Natural language CLI working — cx ask, cx install, cx fix" },
  { date: "Nov 2025", event: "License server, Stripe integration, affiliate program" },
  { date: "Dec 2025", event: "APT repository live — cx-terminal installable via apt" },
  { date: "Jan 2026", event: "Brand launch: CX Linux — website, docs, community" },
  { date: "Feb 2026", event: "v0.3.2 released — Quick Blocks, workspace snapshots, security scanning" },
  { date: "Mar 2026", event: "Public beta — install script, CLI reference, docs site" },
];

const values = [
  {
    icon: Terminal,
    title: "Terminal-First",
    description: "We believe the terminal is the most powerful interface. We're making it smarter, not replacing it.",
  },
  {
    icon: Shield,
    title: "Safe by Default",
    description: "Dry-run mode, sandboxed execution, and human-in-the-loop confirmation for every destructive action.",
  },
  {
    icon: Code2,
    title: "Source Available",
    description: "BSL 1.1 licensed — read, audit, and contribute. Converts to Apache 2.0 in 2032.",
  },
  {
    icon: Cpu,
    title: "Local-First AI",
    description: "Run Mistral 7B locally with zero cloud dependency. Your data stays on your machine.",
  },
  {
    icon: Zap,
    title: "Fast & Lightweight",
    description: "Built in Rust with GPU-accelerated rendering. No Electron, no bloat.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "Open development, public roadmap, and active Discord community.",
  },
];

const stats = [
  { value: "v0.3.2", label: "Current Version" },
  { value: "Rust", label: "Core Language" },
  { value: "BSL 1.1", label: "License" },
  { value: "2032", label: "Apache 2.0 Conversion" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#00FF9F] text-sm font-semibold tracking-wider uppercase mb-4 block">
              ABOUT CX LINUX
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-gray-300 via-gray-200 to-[#00FF9F] bg-clip-text text-transparent">
                Making Linux
              </span>{" "}
              <span className="text-[#00FF9F]">Smarter</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              CX Linux is an AI-native terminal that lets you manage Linux servers
              using natural language. Built by developers, for developers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-[#00FF9F]">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8">Our Mission</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Every day, millions of developers and sysadmins waste hours searching
                Stack Overflow, reading man pages, and debugging cryptic error messages.
                We believe AI can eliminate this friction.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                CX Linux embeds AI directly into the terminal — not as a chatbot, but as a
                first-class citizen. Type what you want in plain English and CX translates it
                into the right commands, with safety checks and explanations built in.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                We're not replacing the terminal. We're making it 10x more accessible — whether
                you're a seasoned sysadmin or a developer who just needs to get things done.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#0D0D0D]/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#00FF9F]/30 transition-all"
              >
                <value.icon className="w-8 h-8 text-[#00FF9F] mb-4" />
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <motion.div
                key={m.date}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-24 flex-shrink-0 text-right">
                  <span className="text-[#00FF9F] font-mono text-sm font-semibold">{m.date}</span>
                </div>
                <div className="w-px bg-[#00FF9F]/30 flex-shrink-0 self-stretch" />
                <div className="pb-4">
                  <p className="text-gray-300">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Contributors */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#0D0D0D]/50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Core Contributors</h2>
          <p className="text-gray-400 mb-12">The people building CX Linux</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {coreContributors.map((member, i) => (
              <motion.a
                key={member.github}
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#00FF9F]/30 transition-all group"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white/10 group-hover:border-[#00FF9F]/50 transition-all"
                />
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-[#00FF9F] text-sm">{member.role}</p>
                <p className="text-gray-500 text-xs mt-1 flex items-center justify-center gap-1">
                  <Github className="w-3 h-3" />
                  {member.github}
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#00FF9F]/10 to-[#00FF9F]/5 border border-[#00FF9F]/30 rounded-2xl p-8 md:p-12 text-center">
            <MessageCircle className="w-12 h-12 text-[#00FF9F] mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Join the Community</h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              CX Linux is built in the open. Join our Discord to share feedback,
              report bugs, request features, and connect with other users.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://discord.gg/7K6TR7qtS"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-[#00FF9F] to-[#00CC7F] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00FF9F]/20 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Join Discord
              </a>
              <a
                href="https://github.com/cxlinux-ai/cx-core"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border-2 border-[#00FF9F] text-[#00FF9F] font-semibold rounded-lg hover:bg-[#00FF9F]/10 transition-all flex items-center gap-2"
              >
                <Github className="w-5 h-5" />
                View on GitHub
              </a>
              <a
                href="/faq"
                className="px-8 py-3 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                FAQ
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
