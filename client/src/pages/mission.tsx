import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  ArrowRight,
  Brain, 
  Check,
  Cpu, 
  Shield, 
  Target,
  Rocket,
  Code2,
  Users,
  Heart,
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

const roadmapItems = [
  { quarter: "Q1 2026", items: ["Core Release", "AI Streaming"], status: "completed" },
  { quarter: "Q2 2026", items: ["Plugin System", "Edge Functions"], status: "current" },
  { quarter: "Q3 2026", items: ["Enterprise SSO", "Team Workspaces"], status: "planned" },
  { quarter: "Q4 2026", items: ["Mobile SDK", "v3.0 Launch"], status: "planned" },
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-blue/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
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
                href="https://discord.gg/ASvzWcuTfk"
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
      {/* Roadmap Timeline */}
      <section className="py-24 px-4 border-t border-white/5 relative overflow-hidden" id="roadmap">
        {/* Subtle background blobs */}
        <div className="bg-blob bg-blob-blue w-[500px] h-[500px] top-0 left-1/4 opacity-40" style={{ animationDelay: '2s' }} />
        <div className="bg-blob bg-blob-blue w-[400px] h-[400px] bottom-0 right-1/3 opacity-30" style={{ animationDelay: '8s' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">Roadmap</span>
            </h2>
            <p className="text-gray-400 text-lg">Building the future of AI-native development</p>
          </motion.div>

          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            {/* Timeline Track */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "37.5%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-green-500 via-green-400 to-blue-500 rounded-full"
              />
            </div>
            
            {/* Timeline Items */}
            <div className="grid grid-cols-4 gap-6">
              {roadmapItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.25, duration: 0.8 }}
                  className="relative pt-16"
                  data-testid={`roadmap-phase-${i + 1}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2">
                    <div
                      className={`w-6 h-6 rounded-full border-4 border-black transition-all duration-2000 ${
                        item.status === "completed"
                          ? "bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                          : item.status === "current"
                          ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse"
                          : "bg-gray-700"
                      }`}
                    />
                  </div>
                  
                  {/* Card */}
                  <div
                    className={`p-5 rounded-xl backdrop-blur-xl transition-all duration-300 ${
                      item.status === "completed"
                        ? "bg-green-500/10 border border-green-500/30 hover:border-green-400/50"
                        : item.status === "current"
                        ? "bg-blue-500/10 border border-blue-500/30 hover:border-blue-300/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                        : "bg-white/5 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                      item.status === "completed"
                        ? "text-green-400"
                        : item.status === "current"
                        ? "text-blue-300"
                        : "text-gray-500"
                    }`}>
                      {item.quarter}
                    </div>
                    <div className="space-y-2">
                      {item.items.map((task, j) => (
                        <div
                          key={j}
                          className={`flex items-center gap-2 text-sm ${
                            item.status === "completed"
                              ? "text-white"
                              : item.status === "current"
                              ? "text-gray-200"
                              : "text-gray-500"
                          }`}
                        >
                          {item.status === "completed" ? (
                            <Check size={14} className="text-green-400 flex-shrink-0" />
                          ) : item.status === "current" ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                          )}
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline (Vertical) */}
          <div className="md:hidden relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-800">
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: "37.5%" }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                className="w-full bg-gradient-to-b from-green-500 to-blue-500"
              />
            </div>
            
            <div className="space-y-6">
              {roadmapItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-12"
                  data-testid={`roadmap-phase-mobile-${i + 1}`}
                >
                  {/* Dot */}
                  <div className="absolute left-2 top-5 -translate-x-1/2">
                    <div
                      className={`w-5 h-5 rounded-full border-4 border-black ${
                        item.status === "completed"
                          ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                          : item.status === "current"
                          ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"
                          : "bg-gray-700"
                      }`}
                    />
                  </div>
                  
                  {/* Card */}
                  <div
                    className={`p-4 rounded-xl backdrop-blur-xl ${
                      item.status === "completed"
                        ? "bg-green-500/10 border border-green-500/30"
                        : item.status === "current"
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                      item.status === "completed"
                        ? "text-green-400"
                        : item.status === "current"
                        ? "text-blue-300"
                        : "text-gray-500"
                    }`}>
                      {item.quarter}
                    </div>
                    <div className="space-y-1.5">
                      {item.items.map((task, j) => (
                        <div
                          key={j}
                          className={`flex items-center gap-2 text-sm ${
                            item.status === "completed"
                              ? "text-white"
                              : item.status === "current"
                              ? "text-gray-200"
                              : "text-gray-500"
                          }`}
                        >
                          {item.status === "completed" ? (
                            <Check size={14} className="text-green-400 flex-shrink-0" />
                          ) : item.status === "current" ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-600 flex-shrink-0" />
                          )}
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* About Us Section */}
      <section className="py-24 px-4 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 text-rose-300 text-sm mb-6">
              <Heart size={14} className="fill-rose-400" />
              <span>Our Story</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The <span className="gradient-text">People</span> Behind Cortex
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Every great project starts with a simple question. Ours was: 
              <span className="text-white italic"> "Why does working with Linux still feel like 1999?"</span>
            </p>
          </motion.div>

          {/* Founder Stories */}
          <div className="space-y-8">
            {/* Mike Morgan - CEO */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src="/images/mike.png"
                        alt="Mike Morgan, CEO and Founder of Cortex Linux"
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-400/50 transition-all duration-300"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Sparkles size={12} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-white">Mike Morgan</h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                        CEO & Founder
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm italic mb-3">"AI Data God"</p>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                      <p>
                        It started at 3 AM, debugging a system that refused to cooperate. 
                        Mike, with <span className="text-white">over 20 years of experience in AI</span>, 
                        realized something profound in that moment of exhaustion: 
                        <span className="text-blue-300 font-medium"> even with all our advances, we were still solving problems the same way we did decades ago.</span>
                      </p>
                      <p>
                        The tools had evolved, certainly. But the fundamental experience? 
                        Wrestling with complexity, piecing together solutions from fragmented sources, 
                        and hoping the system would behave. 
                        <span className="text-white"> There had to be a better way.</span>
                      </p>
                      <p className="text-gray-400 italic border-l-2 border-blue-500/40 pl-4">
                        "I didn't want to build another wrapper or interface. I wanted to create what computing 
                        should feel like in 2026—intelligent, intuitive, and, most importantly, 
                        <span className="text-blue-300"> truly understanding what you're trying to achieve.</span>"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Connection Line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <div className="w-px h-12 bg-gradient-to-b from-blue-500/40 to-purple-500/40" />
            </motion.div>

            {/* Jorg - Partner */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative p-8 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <img
                        src="/images/jorg-profile.png"
                        alt="Santiago (Jorg), Co-Founder and Marketing Lead of Cortex Linux"
                        className="w-20 h-20 rounded-full object-cover ring-2 ring-purple-500/30 group-hover:ring-purple-400/50 transition-all duration-300"
                        style={{
                          objectPosition: "50% 0%",  // X: 0%=left, 50%=center, 100%=right | Y: 0%=top, 50%=center, 100%=bottom
                          transform: "scale(1)",     // Zoom: 1=normal, 1.5=150%, 2=200%
                        }}
                        loading="lazy"
                      />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Code2 size={12} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="text-xl font-semibold text-white">Santiago Gonzalez</h3>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                        Co-Founder & Marketing Lead
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm italic mb-3">"Jorg"</p>
                    <div className="space-y-4 text-gray-300 leading-relaxed">
                      <p>
                        When Mike shared his vision, Jorg didn't just see a project—he saw 
                        <span className="text-white"> a movement</span>. 
                        For the past three years, he's worked closely with Mike to learn the ins and outs of AI, 
                        while taking on the mission of keeping Cortex aligned and thriving.
                      </p>
                      <p>
                        Jorg built the website from the ground up, manages incoming developers and contributors, 
                        and ensures that operations and marketing run smoothly. 
                        He's <span className="text-purple-300 font-medium">the glue that holds the project together</span>.
                      </p>
                      <p className="text-gray-400 italic border-l-2 border-purple-500/40 pl-4">
                        "Open source isn't just about code—it's about <span className="text-purple-300">people</span>. 
                        Every pull request, every issue, every Discord message represents someone 
                        who believes in what we're building. That trust is sacred to me."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
              <p className="text-gray-300 mb-4">
                This isn't just our story anymore. <span className="text-white font-medium">It's yours too.</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="https://discord.gg/ASvzWcuTfk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] rounded-lg text-white font-medium transition-colors"
                  data-testid="button-join-community"
                >
                  <FaDiscord size={18} />
                  Join Our Community
                </a>
                <a
                  href="https://github.com/cortexlinux/cortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-medium transition-colors"
                  data-testid="button-star-github"
                >
                  <Github size={18} />
                  Star on GitHub
                </a>
              </div>
            </div>
          </motion.div>

          {/* Core Contributors */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h3 className="text-center text-sm font-normal text-gray-500 mb-8 tracking-wide uppercase">
              Core Contributors
            </h3>
            <div className="flex flex-wrap justify-center gap-12 md:gap-16">
              {[
                {
                  name: "Mike Morgan",
                  role: "CEO · Vision & Strategy · Open-source advocate",
                  github: "mikejmorgan-ai",
                  avatar: "/assets/mike.png"
                },
                {
                  name: "Santiago",
                  role: "Co-Founder · Marketing & Logistics · Community builder",
                  github: "jorg-4",
                  avatar: "/images/jorg-profile.png"
                },
                {
                  name: "Suyash D",
                  role: "Lead Engineer · Hackathon Leader · Core contributor",
                  github: "Suyashd999",
                  avatar: "/images/suyash-d.png"
                },
                {
                  name: "Dhruv",
                  role: "Lead Engineer · Architecture · Core contributor",
                  github: "Dhruv-89",
                  avatar: "/assets/dhruv.png"
                },
                {
                  name: "Ansh Grover",
                  role: "Main Reviewer · Code Quality · Open-source maintainer",
                  github: "Anshgrover23",
                  avatar: "https://github.com/Anshgrover23.png"
                },
                {
                  name: "Sahil",
                  role: "Developer & Judge · Partner Relations · Core contributor",
                  github: "sahil",
                  avatar: "/images/sahil.png"
                }
              ].map((contributor) => (
                <figure key={contributor.github} className="flex flex-col items-center text-center group">
                  <a
                    href={`https://github.com/${contributor.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-3"
                    data-testid={`link-contributor-${contributor.github}`}
                  >
                    <img
                      src={contributor.avatar}
                      alt={`${contributor.name}, ${contributor.role}`}
                      className="w-12 h-12 rounded-full object-cover object-top grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=3b82f6&color=fff&size=48`;
                      }}
                    />
                  </a>
                  <figcaption>
                    <a
                      href={`https://github.com/${contributor.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors"
                      data-testid={`link-contributor-name-${contributor.github}`}
                    >
                      {contributor.name}
                    </a>
                    <p className="text-xs text-gray-500 mt-1 max-w-[180px]">
                      {contributor.role}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </motion.div>
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
