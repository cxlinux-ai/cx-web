import { motion } from "framer-motion";
import {
  Terminal,
  Users,
  Shield,
  Zap,
  Globe,
  Heart,
  MessageCircle,
  Code2,
  Cpu,
  BookOpen,
  Linkedin,
  Twitter,
} from "lucide-react";
import Footer from "@/components/Footer";

// Co-founders, photo URLs are placeholders. Drop final image URLs into `photo`.
// Leave `photo` as "" to render an initials avatar instead.
const coFounders = [
  {
    name: "Michael Morgan",
    role: "CEO & Co-Founder",
    photo: "",
    linkedin: "",
    twitter: "",
  },
  {
    name: "Santiago Gonzalez",
    role: "Co-Founder & Marketing Manager",
    photo: "",
    linkedin: "",
    twitter: "",
  },
  {
    name: "Suyash Dongre",
    role: "Co-Founder & Developer",
    photo: "",
    linkedin: "",
    twitter: "",
  },
];

const milestones = [
  { date: "Aug 2025", event: "Project kicked off, AI-native terminal concept validated" },
  { date: "Sep 2025", event: "Core architecture: WezTerm fork + Rust AI command engine" },
  { date: "Oct 2025", event: "Natural language CLI working, cx ask, cx install, cx fix" },
  { date: "Nov 2025", event: "License server, Stripe integration, affiliate program" },
  { date: "Dec 2025", event: "APT repository live, cx-terminal installable via apt" },
  { date: "Jan 2026", event: "Brand launch: CX Linux, website, docs, community" },
  { date: "Feb 2026", event: "v0.3.2 released, Quick Blocks, workspace snapshots, security scanning" },
  { date: "Mar 2026", event: "Public beta, install script, CLI reference, docs site" },
  { date: "Apr 2026", event: "Deep product focus — performance, reliability, and UX hardening" },
  { date: "May 2026", event: "Continued iteration on core product based on beta feedback" },
  { date: "Jun 2026", event: "Fleet management, multi-server workflows, and stability improvements" },
  { date: "Jul 2026", event: "Community launch: Discord server, Reddit, and official service launch" },
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
    title: "Backed by a Team",
    description: "Commercial software with a dedicated team behind it, priority support, and regular updates.",
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
    description: "We build alongside our users, with an active Discord community shaping what comes next.",
  },
];

const stats = [
  { value: "v0.3.2", label: "Current Version" },
  { value: "Rust", label: "Core Language" },
  { value: "2,400+", label: "Community Members" },
  { value: "2025", label: "Founded" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen text-white">
      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#7AA0FF] text-sm font-semibold tracking-wider uppercase mb-4 block">
              ABOUT CX LINUX
            </span>
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
              <span className="text-white">Making Linux</span>{" "}
              <span className="bg-gradient-to-r from-[#7AA0FF] to-[#B9CCFF] bg-clip-text text-transparent">Smarter</span>
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
              <div className="text-3xl font-bold text-[#7AA0FF]">{stat.value}</div>
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
                CX Linux embeds AI directly into the terminal, not as a chatbot, but as a
                first-class citizen. Type what you want in plain English and CX translates it
                into the right commands, with safety checks and explanations built in.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                We're not replacing the terminal. We're making it 10x more accessible, whether
                you're a seasoned sysadmin or a developer who just needs to get things done.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Co-Founders */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#7AA0FF] text-sm font-semibold tracking-wider uppercase mb-3 block">
              THE TEAM
            </span>
            <h2 className="text-3xl font-bold mb-3">Meet the Founders</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three engineers and operators who got tired of typing the same Linux commands at 2am, and decided to build the tool they wished existed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {coFounders.map((f, i) => {
              const initials = f.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-[#2F6BFF]/30 transition-all"
                >
                  <div className="relative w-28 h-28 mx-auto mb-5">
                    {f.photo ? (
                      <img
                        src={f.photo}
                        alt={f.name}
                        className="w-28 h-28 rounded-full object-cover border-2 border-[#2F6BFF]/30"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#2F6BFF]/20 to-[#7AA0FF]/10 border-2 border-[#2F6BFF]/30 flex items-center justify-center">
                        <span className="text-[#7AA0FF] font-bold text-2xl tracking-wider">
                          {initials}
                        </span>
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0E0E12] border-2 border-[#2F6BFF]/40 flex items-center justify-center">
                      <Terminal className="w-3.5 h-3.5 text-[#7AA0FF]" />
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1">{f.name}</h3>
                  <p className="text-[#7AA0FF] text-sm font-medium mb-4">{f.role}</p>

                  {(f.linkedin || f.twitter) && (
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-white/10">
                      {f.linkedin && (
                        <a
                          href={f.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${f.name} on LinkedIn`}
                          className="text-gray-500 hover:text-[#7AA0FF] transition-colors"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {f.twitter && (
                        <a
                          href={f.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${f.name} on X`}
                          className="text-gray-500 hover:text-[#7AA0FF] transition-colors"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#0E0E12]/50">
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
                className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#2F6BFF]/30 transition-all"
              >
                <value.icon className="w-8 h-8 text-[#7AA0FF] mb-4" />
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
                  <span className="text-[#7AA0FF] font-mono text-sm font-semibold">{m.date}</span>
                </div>
                <div className="w-px bg-[#2F6BFF]/30 flex-shrink-0 self-stretch" />
                <div className="pb-4">
                  <p className="text-gray-300">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#2F6BFF]/10 to-[#2F6BFF]/5 border border-[#2F6BFF]/30 rounded-2xl p-8 md:p-12 text-center">
            <MessageCircle className="w-12 h-12 text-[#7AA0FF] mx-auto mb-4" />
            <h3 className="text-3xl font-bold mb-4">Join the Community</h3>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Join our Discord to share feedback, report bugs, request features,
              and connect with other users.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://discord.gg/q4FUyBW6z"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-[#2F6BFF] text-white font-semibold rounded-lg hover:bg-[#00E88F] hover:shadow-lg hover:shadow-[#2F6BFF]/20 transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Join Discord
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
