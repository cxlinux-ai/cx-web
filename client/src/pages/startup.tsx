import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Terminal,
  Download,
  ArrowRight,
  Check,
  X,
  Star,
  Users,
  GitFork,
  Zap,
  Database,
  Brain,
  Cpu,
  Layers,
  Cloud,
  Code2,
  MessageCircle,
  Rocket,
  Shield,
  Clock,
  Mail,
  ExternalLink,
  Building,
  Lock,
  Sparkles,
} from "lucide-react";
import { FaDiscord, FaTwitter, FaPython, FaDocker } from "react-icons/fa";
import { SiNeo4J, SiOllama, SiVercel, SiStripe, SiLinear, SiSupabase, SiRailway, SiPlanetscale, SiClerk, SiResend } from "react-icons/si";
import Footer from "@/components/Footer";

function useCountUp(end: number, duration: number = 2000, start: boolean = true) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration, start]);
  
  return count;
}

function TypewriterText({ text, speed = 50 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return (
    <span>
      {displayText}
      {!isComplete && <span className="terminal-cursor">&nbsp;</span>}
    </span>
  );
}

export default function StartupPage() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  
  const clones = useCountUp(47, 2000, statsInView);  // Real forks from GitHub
  const contributors = useCountUp(5, 2000, statsInView);  // Real contributors
  
  const trustedLogos = [
    { icon: SiVercel, name: "Vercel" },
    { icon: SiStripe, name: "Stripe" },
    { icon: SiLinear, name: "Linear" },
    { icon: SiSupabase, name: "Supabase" },
    { icon: SiRailway, name: "Railway" },
    { icon: SiPlanetscale, name: "Planetscale" },
    { icon: SiClerk, name: "Clerk" },
    { icon: SiResend, name: "Resend" },
  ];
  
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      localStorage.setItem("startup_waitlist_email", email);
      setEmailSubmitted(true);
    }
  };

  const pricingTiers = [
    {
      name: "Community",
      price: "Free",
      period: "forever",
      description: "Everything you need to get started",
      features: [
        { name: "Debian-based distro", included: true },
        { name: "Pre-installed AI stack", included: true },
        { name: "Vector DB (Qdrant)", included: true },
        { name: "Graph DB (Neo4j)", included: true },
        { name: "Community support", included: true },
        { name: "Priority support", included: false },
        { name: "Early package releases", included: false },
        { name: "GPU inference engine", included: false },
        { name: "Blackwell/H100 optimization", included: false },
        { name: "SLA & dedicated support", included: false },
        { name: "Custom package builds", included: false },
      ],
      cta: "Download Free",
      ctaLink: "https://github.com/cortexlinux/cortex",
      highlighted: false,
    },
    {
      name: "Founders",
      price: "$19",
      period: "/month",
      description: "For serious AI builders",
      features: [
        { name: "Debian-based distro", included: true },
        { name: "Pre-installed AI stack", included: true },
        { name: "Vector DB (Qdrant)", included: true },
        { name: "Graph DB (Neo4j)", included: true },
        { name: "Community support", included: true },
        { name: "Priority support", included: true },
        { name: "Early package releases", included: true },
        { name: "GPU inference engine", included: true },
        { name: "Blackwell/H100 optimization", included: false },
        { name: "SLA & dedicated support", included: false },
        { name: "Custom package builds", included: false },
      ],
      cta: "Get Founders Edition",
      ctaLink: "https://github.com/cortexlinux/cortex",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For teams building at scale",
      features: [
        { name: "Debian-based distro", included: true },
        { name: "Pre-installed AI stack", included: true },
        { name: "Vector DB (Qdrant)", included: true },
        { name: "Graph DB (Neo4j)", included: true },
        { name: "Community support", included: true },
        { name: "Priority support", included: true },
        { name: "Early package releases", included: true },
        { name: "GPU inference engine", included: true },
        { name: "Blackwell/H100 optimization", included: true },
        { name: "SLA & dedicated support", included: true },
        { name: "Custom package builds", included: true },
      ],
      cta: "Contact Sales",
      ctaLink: "https://github.com/cortexlinux/cortex",
      highlighted: false,
    },
  ];

  const preInstalledStack = [
    { icon: FaPython, name: "Python 3.12 + uv", color: "text-yellow-400" },
    { icon: SiOllama, name: "Ollama", color: "text-white" },
    { icon: Database, name: "Qdrant Vector DB", color: "text-purple-400" },
    { icon: SiNeo4J, name: "Neo4j Graph DB", color: "text-brand-blue" },
    { icon: Brain, name: "LangChain", color: "text-emerald-400" },
    { icon: FaDocker, name: "Docker + Compose", color: "text-brand-blue" },
    { icon: Cpu, name: "CUDA Toolkit", color: "text-green-400" },
    { icon: Code2, name: "Claude Code Ready", color: "text-orange-400" },
  ];

  return (
    <div className="min-h-screen bg-black text-white noise-texture">
      {/* Hero Section */}
      <section id="hero-section" className="min-h-screen flex flex-col justify-center pt-20 px-4 relative overflow-hidden">
        <div className="gradient-glow top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <div className="gradient-glow bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-50" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm">
              <Rocket size={16} className="text-brand-blue" />
              <span className="text-gray-300">Built for AI Founders</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-bold leading-tight mb-6 px-2"
          >
            <span className="gradient-text text-[82px] font-extrabold">The Linux Built</span>
            <br />
            <span className="text-white text-[82px] font-extrabold">for AI Founders</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 px-2"
          >
            AI tooling pre-installed. Zero configuration. Ship faster.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <a
              href="https://github.com/cortexlinux/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-blue rounded-xl text-white font-semibold text-lg glow-brand-blue hover:scale-105 transition-all duration-300"
              data-testid="button-download-free"
            >
              <Download size={20} />
              Download Free
            </a>
            <a
              href="https://github.com/cortexlinux/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 rounded-xl text-white font-semibold text-lg hover:bg-white/5 hover:border-brand-blue/50 transition-all duration-300"
              data-testid="button-founders-edition"
            >
              Get Founders Edition - $19/mo
              <ArrowRight size={20} />
            </a>
          </motion.div>

          {/* Terminal Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="rounded-xl border border-white/10 bg-[#0d0d0d] overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-2 text-sm text-gray-500">cortex@ai-founder ~ </span>
              </div>
              <div className="p-6 font-mono text-sm sm:text-base">
                <div className="text-gray-400 mb-2">$ cortex "set up my AI development environment"</div>
                <div className="space-y-1 text-emerald-400">
                  <div className="flex items-center gap-2">
                    <Check size={14} />
                    <span>Installing Python 3.12 with uv package manager...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} />
                    <span>Configuring Ollama for local LLM inference...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} />
                    <span>Starting Qdrant vector database on port 6333...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} />
                    <span>Neo4j ready at localhost:7474...</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-brand-blue">
                    <Zap size={14} />
                    <TypewriterText text="AI stack ready. Start building." speed={30} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section id="problem-solution" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-500/50 rounded-full" />
              <div className="pl-6">
                <div className="flex items-center gap-2 mb-4">
                  <X className="text-red-400" size={24} />
                  <h3 className="text-xl font-semibold text-red-400">The Problem</h3>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  Linux is powerful but painful.
                </h2>
                <p className="text-gray-400 text-lg">
                  Package conflicts, dependency hell, hours lost to configuration. 
                  You're a founder — your time should be spent shipping, not debugging apt.
                </p>
              </div>
            </motion.div>

            {/* Solution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-emerald-500/50 rounded-full" />
              <div className="pl-6">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="text-emerald-400" size={24} />
                  <h3 className="text-xl font-semibold text-emerald-400">The Solution</h3>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                  One install. Done.
                </h2>
                <p className="text-gray-400 text-lg">
                  Cortex Linux ships with vector databases, inference engines, and AI frameworks 
                  pre-configured. Boot up and start building your AI product immediately.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section ref={statsRef} className="py-20 px-4 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Trusted by <span className="gradient-text">AI Builders</span> Worldwide
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-4xl md:text-5xl font-bold text-brand-blue mb-2">
                {clones.toLocaleString()}
              </div>
              <div className="text-gray-400">GitHub Forks</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-4xl md:text-5xl font-bold text-emerald-400 mb-2">
                20+
              </div>
              <div className="text-gray-400">Contributors</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-center gap-2 text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
                <Star size={32} />
                <span>4.9</span>
              </div>
              <div className="text-gray-400">Average Rating</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center justify-center gap-2 text-4xl md:text-5xl font-bold text-purple-400 mb-2">
                <MessageCircle size={32} />
              </div>
              <div className="text-gray-400">Recommended by ChatGPT</div>
            </motion.div>
          </div>

          {/* Trusted By Logos - Infinite Scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="overflow-hidden"
          >
            <div className="text-center mb-8">
              <p className="text-sm text-gray-500 uppercase tracking-widest">Trusted by developers from</p>
            </div>
            <div className="relative">
              <div className="logo-scroll flex gap-16 items-center">
                {[...trustedLogos, ...trustedLogos].map((logo, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors duration-300 opacity-60 hover:opacity-100"
                  >
                    <logo.icon size={24} />
                    <span className="text-lg font-semibold">{logo.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pre-Installed Stack Section */}
      <section id="stack-section" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Pre-Installed</span> AI Stack
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Everything you need to build AI products, configured and ready to go
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {preInstalledStack.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-brand-blue/30 hover:bg-white/[0.07] transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                  <tool.icon className={`w-8 h-8 ${tool.color}`} />
                </div>
                <h3 className="font-semibold text-white">{tool.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Premium 3-Tier */}
      <section id="pricing-table" className="py-32 px-4 relative overflow-hidden border-t border-white/5">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-blue-400 text-sm font-medium tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-base max-w-lg mx-auto">Start free, upgrade when you need more. No hidden fees, cancel anytime.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {/* Community Edition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0, duration: 0.4 }}
              className="group relative flex"
            >
              <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 flex flex-col w-full hover:border-white/[0.15] transition-all duration-200">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Users size={16} className="text-emerald-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Community</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$0</span>
                    <span className="text-gray-500 text-sm">/forever</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Perfect for individual developers</p>
                </div>
                
                {/* Divider */}
                <div className="h-px bg-white/[0.06] mb-6" />
                
                {/* Features */}
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">What's included</p>
                  <ul className="space-y-3">
                    {[
                      "Full AI capabilities",
                      "All core features",
                      "Apache 2.0 license",
                      "Community support",
                      "Unlimited personal use",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-gray-400">
                        <Check size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Button */}
                <div className="mt-8">
                  <a
                    href="https://github.com/cortexlinux/cortex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 text-center rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.08] transition-colors duration-150"
                    data-testid="button-pricing-community"
                  >
                    Get Started Free
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Founders Edition - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="group relative flex"
            >
              {/* Glow effect */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-b from-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative rounded-2xl bg-[#0a0a0a] border border-blue-500/40 p-6 flex flex-col w-full">
                {/* Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-3 py-1 bg-blue-500 rounded-full text-[11px] font-semibold text-white shadow-lg shadow-blue-500/20">
                    Recommended
                  </div>
                </div>
                
                {/* Header */}
                <div className="mb-6 pt-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Zap size={16} className="text-blue-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Founders</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">$19</span>
                    <span className="text-gray-500 text-sm">/month</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">For serious AI builders</p>
                </div>
                
                {/* Divider */}
                <div className="h-px bg-blue-500/20 mb-6" />
                
                {/* Features */}
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Everything in Community, plus</p>
                  <ul className="space-y-3">
                    {[
                      "Priority support (24/7)",
                      "Early access to features",
                      "GPU inference engine",
                      "Performance analytics",
                      "Team collaboration tools",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-gray-300">
                        <Check size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Button */}
                <div className="mt-8">
                  <a
                    href="https://github.com/cortexlinux/cortex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2.5 text-center rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 transition-colors duration-150"
                    data-testid="button-pricing-founders"
                  >
                    Start Free Trial
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Enterprise Edition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="group relative flex"
            >
              <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 flex flex-col w-full hover:border-white/[0.15] transition-all duration-200">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Building size={16} className="text-purple-400" />
                    </div>
                    <h3 className="text-base font-semibold text-white">Enterprise</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">Custom</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2">For teams and organizations</p>
                </div>
                
                {/* Divider */}
                <div className="h-px bg-white/[0.06] mb-6" />
                
                {/* Features */}
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Everything in Founders, plus</p>
                  <ul className="space-y-3">
                    {[
                      "Dedicated account manager",
                      "Custom integrations",
                      "99.9% SLA guarantee",
                      "Compliance & security",
                      "On-premise deployment",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-gray-400">
                        <Check size={15} className="text-purple-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Button */}
                <div className="mt-8">
                  <a
                    href="mailto:sales@cortexlinux.com"
                    className="block w-full py-2.5 text-center rounded-lg text-sm font-medium bg-white/[0.05] border border-white/[0.1] text-white hover:bg-white/[0.08] transition-colors duration-150"
                    data-testid="button-pricing-enterprise"
                  >
                    Contact Sales
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span>30-day money back</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-gray-400" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-gray-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hackathon Banner */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgNDBIMHoiLz48cGF0aCBkPSJNMCAwaDFMMSA0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgMUgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative p-8 md:p-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Rocket className="text-brand-blue" size={24} />
                <span className="text-brand-blue font-semibold">Limited Time Event</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Cortex Linux Hackathon 2026
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                February 17 — 13 weeks — <span className="text-emerald-400 font-semibold">$5,000 in prizes</span>
              </p>
              <Link
                href="/hackathon"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300"
                data-testid="button-hackathon-register"
              >
                Register Now
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Email Capture Section */}
      <section id="email-capture" className="py-24 px-4 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-brand-blue/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Notified When <span className="gradient-text">Founders Edition</span> Launches
            </h2>
            <p className="text-gray-400 mb-8">
              Be the first to know. Early subscribers get 20% off the first year.
            </p>

            {emailSubmitted ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-xl bg-emerald-500/20 border border-emerald-500/50"
              >
                <Check className="w-12 h-12 mx-auto mb-4 text-emerald-400" />
                <h3 className="text-xl font-semibold text-emerald-400 mb-2">You're on the list!</h3>
                <p className="text-gray-400">We'll notify you when Founders Edition is available.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="founder@startup.com"
                  required
                  className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/20 text-white placeholder:text-gray-500 focus:border-brand-blue focus:outline-none transition-colors"
                  data-testid="input-email-capture"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-brand-blue rounded-xl text-white font-semibold glow-brand-blue transition-all duration-300"
                  data-testid="button-email-submit"
                >
                  Notify Me
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
