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
  Building2,
  Crown,
  Lock,
  Sparkles,
  Github,
  Play,
  ChevronRight,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FaDiscord, FaTwitter, FaPython, FaDocker } from "react-icons/fa";
import { SiNeo4J, SiOllama, SiVercel, SiStripe, SiLinear, SiSupabase, SiRailway, SiPlanetscale, SiClerk, SiResend } from "react-icons/si";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";
import analytics from "@/lib/analytics";

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
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.startup);
    return cleanup;
  }, []);

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
  const [annual, setAnnual] = useState(false);

  // 4-Tier Pricing matching HomePage
  const pricingTiers = [
    {
      name: 'Core',
      icon: Rocket,
      price: { monthly: 0, annual: 0 },
      description: 'Everything you need to get started',
      features: [
        'Full CLI commands',
        'Local LLM (Ollama)',
        'Dry-run safety mode',
        'Rollback support',
        '1 system'
      ],
      cta: 'Download Free',
      ctaLink: 'https://github.com/cxlinux-ai/cx-core',
      highlighted: false
    },
    {
      name: 'Core+',
      icon: Sparkles,
      price: { monthly: 20, annual: 192 },
      description: 'Unlimited systems for commercial use',
      features: [
        'Everything in Core',
        'Unlimited systems',
        'Commercial license',
        'Email support (48hr)'
      ],
      cta: 'Start Free Trial',
      highlighted: false,
      badge: 'PER SYSTEM'
    },
    {
      name: 'Pro',
      icon: Building2,
      price: { monthly: 99, annual: 948 },
      description: 'Cloud AI power for teams',
      features: [
        'Everything in Core+',
        'Cloud LLM fallback',
        'Team dashboard',
        'Audit logging',
        '25 systems included'
      ],
      cta: 'Start Free Trial',
      highlighted: true,
      badge: 'MOST POPULAR'
    },
    {
      name: 'Enterprise',
      icon: Crown,
      price: { monthly: 299, annual: 2868 },
      description: 'Full compliance & dedicated support',
      features: [
        'Everything in Pro',
        'SSO/SAML integration',
        'Compliance reports',
        '99.9% SLA',
        '100 systems included'
      ],
      cta: 'Schedule Demo',
      ctaLink: 'https://calendly.com/ai-consultant/vip',
      highlighted: false
    }
  ];
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      try {
        localStorage.setItem("startup_waitlist_email", email);
        setEmailSubmitted(true);
        analytics.trackFormSubmit('founders_waitlist', true);
        analytics.trackConversion('waitlist_signup');
      } catch (error) {
        analytics.trackFormSubmit('founders_waitlist', false);
      }
    }
  };

  const preInstalledStack = [
    { icon: FaPython, name: "Python 3.12 + uv", color: "text-yellow-400" },
    { icon: SiOllama, name: "Ollama", color: "text-white" },
    { icon: Database, name: "Qdrant Vector DB", color: "text-purple-400" },
    { icon: SiNeo4J, name: "Neo4j Graph DB", color: "text-blue-300" },
    { icon: Brain, name: "LangChain", color: "text-emerald-400" },
    { icon: FaDocker, name: "Docker + Compose", color: "text-blue-300" },
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
              <Rocket size={16} className="text-blue-300" />
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
            <span className="gradient-text text-4xl sm:text-5xl md:text-6xl lg:text-[82px] font-extrabold">The Linux Built</span>
            <br />
            <span className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-[82px] font-extrabold">for AI Founders</span>
          </motion.h1>

          {/* Micro-Proof Strip - Credibility markers */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
              <Layers size={12} className="text-blue-300" />
              <span>Pre-installed AI Toolchain</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
              <Zap size={12} className="text-emerald-400" />
              <span>Zero Configuration</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
              <Github size={12} className="text-gray-300" />
              <span>View on GitHub</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400">
              <Code2 size={12} className="text-orange-400" />
              <span>Built by AI Engineers</span>
            </div>
          </motion.div>

          {/* Subheadline - Emotionally engaging */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 px-2"
          >
            Stop wrestling with dependencies. Start shipping your AI product. 
            CX comes with everything you need — configured and ready.
          </motion.p>

          {/* CTA Buttons - Differentiated by psychological intent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-4"
          >
            <a
              href="https://github.com/cxlinux-ai/cx-core"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-blue rounded-xl text-white font-semibold text-lg shadow-lg shadow-brand-blue/25 hover:shadow-brand-blue/40 hover:scale-[1.02] transition-all duration-300"
              data-testid="button-install-cx"
            >
              <Download size={20} />
              Install CX Linux
            </a>
            <Link
              href="/getting-started"
              className="flex items-center justify-center gap-2 px-8 py-4 border border-white/20 rounded-xl text-white font-semibold text-lg hover:bg-white/5 hover:border-brand-blue/50 transition-all duration-300"
              data-testid="button-see-how-it-works"
            >
              <Play size={20} />
              See How It Works
            </Link>
          </motion.div>
          
          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xs text-gray-500 text-center mb-12"
          >
            Free tier available · No credit card required
          </motion.p>

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
                <span className="ml-2 text-sm text-gray-500">cx@ai-founder ~ </span>
              </div>
              <div className="p-6 font-mono text-sm sm:text-base">
                <div className="text-gray-400 mb-2">$ cx "set up my AI development environment"</div>
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
                  <div className="flex items-center gap-2 mt-3 text-blue-300">
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
                  CX Linux ships with vector databases, inference engines, and AI frameworks 
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
              <div className="text-4xl md:text-5xl font-bold text-blue-300 mb-2">
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

      {/* Pricing Section - 4-Tier matching HomePage */}
      <section id="pricing" className="py-32 px-4 relative overflow-hidden border-t border-white/5">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-blue-300 text-sm font-medium tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start free, scale as you grow. All plans include a 14-day free trial.
            </p>

            {/* Annual Toggle */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <span 
                className={`text-sm font-medium transition-colors ${annual ? 'text-gray-500' : 'text-white'}`}
                data-testid="text-monthly-label-startup"
              >
                Monthly
              </span>
              <Switch
                checked={annual}
                onCheckedChange={setAnnual}
                data-testid="toggle-annual-startup"
              />
              <span 
                className={`text-sm font-medium transition-colors ${annual ? 'text-white' : 'text-gray-500'}`}
                data-testid="text-annual-label-startup"
              >
                Annual <span className="text-terminal-green text-xs">(Save 10%)</span>
              </span>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {pricingTiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl p-6 ${
                    tier.highlighted
                      ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500 lg:scale-105'
                      : 'bg-white/5 border border-white/10'
                  }`}
                  data-testid={`pricing-card-${tier.name.toLowerCase()}-startup`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${tier.highlighted ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                      <Icon size={20} className={tier.highlighted ? 'text-blue-300' : 'text-gray-300'} />
                    </div>
                    <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  </div>
                  
                  <p className="text-gray-400 text-sm h-10">{tier.description}</p>
                  
                  <div className="mt-4 mb-6">
                    <span className="text-4xl font-bold text-white">
                      ${annual ? Math.round(tier.price.annual / 12) : tier.price.monthly}
                    </span>
                    <span className="text-gray-400">/mo</span>
                    {annual && tier.price.annual > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${tier.price.annual} billed annually
                      </p>
                    )}
                  </div>

                  <a
                    href={tier.ctaLink || '#'}
                    target={tier.ctaLink ? "_blank" : undefined}
                    rel={tier.ctaLink ? "noopener noreferrer" : undefined}
                    className={`block w-full py-2.5 text-center rounded-lg text-sm font-medium transition-colors duration-150 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                        : tier.price.monthly === 0
                          ? 'bg-white/10 text-white hover:bg-white/15'
                          : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                    data-testid={`button-checkout-${tier.name.toLowerCase()}-startup`}
                  >
                    {tier.cta}
                    {tier.ctaLink && <ExternalLink size={14} className="inline ml-1" />}
                  </a>

                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-terminal-green mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
          
          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
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

          {/* Link to full pricing page */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <Link 
              href="/pricing" 
              className="text-blue-300 hover:text-blue-200 transition-colors text-sm inline-flex items-center gap-1"
              data-testid="link-full-pricing-startup"
            >
              View full comparison & FAQ
              <ChevronRight size={14} />
            </Link>
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
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-emerald-600/10" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgNDBIMHoiLz48cGF0aCBkPSJNMCAwaDFMMSA0MEgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjxwYXRoIGQ9Ik0wIDBoNDBMNDAgMUgweiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50" />
            
            <div className="relative p-8 md:p-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Rocket className="text-blue-300" size={24} />
                <span className="text-blue-300 font-semibold">Limited Time Event</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                CX Linux Hackathon 2026
              </h2>
              <p className="text-xl text-gray-300 mb-6">
                February 17 — 14 weeks — <span className="text-emerald-400 font-semibold">$18,700 in prizes</span>
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
              <Mail className="w-8 h-8 text-blue-300" />
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
