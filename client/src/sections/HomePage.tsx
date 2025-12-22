import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Github,
  Star,
  GitFork,
  Users,
  Tag,
  Zap,
  Shield,
  Globe,
  Puzzle,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  Play,
  Command,
  Cpu,
  Lock,
  Eye,
  RotateCcw,
  FileText,
  X,
  Sparkles,
  Server,
  Infinity,
  HardDrive,
  Undo2,
  CircleDot,
  Download,
  ShieldCheck,
  BadgeCheck,
  Scale,
  Layers,
  Database,
  Cloud,
  Network,
  Workflow,
  Code2,
  Brain,
  Wand2,
  CheckCircle2,
  Activity,
  Boxes,
  MousePointer2,
  Rocket,
  Info,
} from "lucide-react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import { SiVercel, SiStripe, SiLinear, SiSupabase, SiRailway, SiPlanetscale, SiClerk, SiResend } from "react-icons/si";
import type { Contributor } from "@shared/schema";
import BlogPreview from "@/components/BlogPreview";
import InteractiveDemoHero from "@/components/InteractiveDemoHero";

interface GitHubStats {
  openIssues: number;
  contributors: number;
  mergedPRs: number;
  stars: number;
  forks: number;
}

interface HomePageProps {
  onNavigate: (sectionId: string) => void;
}

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

function TypewriterText({ text, speed = 40 }: { text: string; speed?: number }) {
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

function CopyButton({ text, size = "default" }: { text: string; size?: "default" | "sm" }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const iconSize = size === "sm" ? 14 : 16;
  
  return (
    <button
      onClick={handleCopy}
      className="code-action-btn"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check size={iconSize} className="text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy size={iconSize} />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function CodeEditor({ 
  title, 
  children, 
  showLineNumbers = false,
  actions 
}: { 
  title: string; 
  children: React.ReactNode; 
  showLineNumbers?: boolean;
  actions?: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * 2;
    const rotateY = ((x - centerX) / centerX) * -2;
    
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    glowRef.current.style.left = `${x}px`;
    glowRef.current.style.top = `${y}px`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    setIsHovered(false);
  };

  return (
    <div 
      ref={cardRef}
      className="code-editor"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={glowRef} className="code-editor-glow" />
      <div className="code-editor-header relative z-10">
        <div className="flex items-center gap-4">
          <div className="code-editor-dots">
            <div className="code-editor-dot code-editor-dot-red" />
            <div className="code-editor-dot code-editor-dot-yellow" />
            <div className="code-editor-dot code-editor-dot-green" />
          </div>
          <span className="code-editor-title">{title}</span>
        </div>
        {actions && <div className="code-editor-actions">{actions}</div>}
      </div>
      <div className="code-editor-body relative z-10">
        {children}
      </div>
    </div>
  );
}

function CodeLine({ 
  lineNumber, 
  children 
}: { 
  lineNumber?: number; 
  children: React.ReactNode;
}) {
  return (
    <div className="code-line">
      {lineNumber !== undefined && (
        <span className="code-line-number">{lineNumber}</span>
      )}
      <span className="code-line-content">{children}</span>
    </div>
  );
}

function OutputLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="code-output-line">
      <span className="code-check">
        <Check size={10} />
      </span>
      <span className="syntax-muted">{children}</span>
    </div>
  );
}

function InteractiveCodeEditor({ 
  title, 
  children, 
  actions 
}: { 
  title: string; 
  children: React.ReactNode; 
  actions?: React.ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glowRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 2;
    const rotateY = ((x - centerX) / centerX) * -2;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    glowRef.current.style.left = `${x}px`;
    glowRef.current.style.top = `${y}px`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div ref={cardRef} className="code-editor" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <div ref={glowRef} className="code-editor-glow" />
      <div className="code-editor-header relative z-10">
        <div className="flex items-center gap-4">
          <div className="code-editor-dots">
            <div className="code-editor-dot code-editor-dot-red" />
            <div className="code-editor-dot code-editor-dot-yellow" />
            <div className="code-editor-dot code-editor-dot-green" />
          </div>
          <span className="code-editor-title">{title}</span>
        </div>
        {actions && <div className="code-editor-actions">{actions}</div>}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { data: githubStats } = useQuery<GitHubStats>({
    queryKey: ["/api/github/stats"],
    refetchInterval: 60000,
  });

  const { data: contributors } = useQuery<Contributor[]>({
    queryKey: ["/api/github/contributors"],
    refetchInterval: 60000,
  });

  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  
  const stars = useCountUp(githubStats?.stars || 1250, 2000, statsInView);
  const forks = useCountUp(githubStats?.forks || 340, 2000, statsInView);
  const contributorCount = useCountUp(githubStats?.contributors || 89, 2000, statsInView);

  const [activeTab, setActiveTab] = useState<"npm" | "yarn" | "pnpm" | "bun">("npm");
  const [activeDemo, setActiveDemo] = useState(0);
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);

  const demoCommands = [
    { label: "Generate API", command: "cortex generate api --name users", output: "✓ Created /api/users/route.ts\n✓ Generated CRUD operations\n✓ Added TypeScript types\n✓ API ready at localhost:3000/api/users" },
    { label: "Add Auth", command: "cortex add auth --provider oauth", output: "✓ Installed authentication dependencies\n✓ Created auth middleware\n✓ Generated login/signup routes\n✓ Added session management" },
    { label: "Deploy", command: "cortex deploy --edge", output: "✓ Building production bundle...\n✓ Optimizing for edge runtime\n✓ Deploying to 12 regions\n✓ Live at https://app.cortex.dev" },
  ];

  const features = [
    { icon: Zap, title: "Get Started in Minutes, Not Hours", description: "Eliminate setup complexity. One command creates your entire ML environment, pre-configured and production-ready.", code: "cortex init my-app && cd my-app && cortex dev" },
    { icon: Shield, title: "Sleep Better with Built-in Security", description: "Enterprise-grade auth, rate limiting, and secrets vault included. Dramatically reduce your attack surface from day one.", code: "cortex add auth --provider oauth2\ncortex add ratelimit --max 100/min" },
    { icon: Globe, title: "Deploy Anywhere, Scale Automatically", description: "Go global in seconds with edge deployment across multiple regions. Achieve low latency worldwide with zero DevOps.", code: "cortex deploy --edge --regions all" },
    { icon: Puzzle, title: "Extend Without Limits", description: "Access a growing library of community plugins for payments, analytics, ML frameworks, and more. Or build your own in minutes.", code: "cortex plugin install @cortex/analytics\ncortex plugin install @cortex/payments" },
  ];

  const comparisonData = [
    { feature: "Open Source", icon: Github, cortex: true, toolA: false, toolB: false },
    { feature: "Self-Hostable", icon: Server, cortex: true, toolA: false, toolB: true },
    { feature: "AI-Native", icon: Sparkles, cortex: true, toolA: "partial", toolB: false },
    { feature: "Edge Runtime", icon: Globe, cortex: true, toolA: true, toolB: false },
    { feature: "Free Tier", icon: Infinity, cortex: "Unlimited", toolA: "Limited", toolB: "None" },
    { feature: "Hardware Detection", icon: HardDrive, cortex: true, toolA: false, toolB: false },
    { feature: "Auto Rollback", icon: Undo2, cortex: true, toolA: false, toolB: false },
  ];

  const roadmapItems = [
    { quarter: "Q1 2024", items: ["Core Release", "AI Streaming"], status: "completed" },
    { quarter: "Q2 2024", items: ["Plugin System", "Edge Functions"], status: "current" },
    { quarter: "Q3 2024", items: ["Enterprise SSO", "Team Workspaces"], status: "planned" },
    { quarter: "Q4 2024", items: ["Mobile SDK", "v3.0 Launch"], status: "planned" },
  ];

  const logos = [
    { icon: SiVercel, name: "Vercel" },
    { icon: SiStripe, name: "Stripe" },
    { icon: SiLinear, name: "Linear" },
    { icon: SiSupabase, name: "Supabase" },
    { icon: SiRailway, name: "Railway" },
    { icon: SiPlanetscale, name: "Planetscale" },
    { icon: SiClerk, name: "Clerk" },
    { icon: SiResend, name: "Resend" },
  ];

  const installCommands = {
    npm: "npm install -g cortex-cli",
    yarn: "yarn global add cortex-cli",
    pnpm: "pnpm add -g cortex-cli",
    bun: "bun add -g cortex-cli",
  };

  return (
    <div className="min-h-screen bg-black text-white noise-texture">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex flex-col justify-start pt-24 sm:pt-28 px-4 relative overflow-hidden">
        <div className="gradient-glow top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <div className="gradient-glow bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-50" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 mb-6"
          >
            <a
              href="https://github.com/cortexlinux/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm hover:border-blue-400/50 transition-all"
              data-testid="link-github-stars"
            >
              <Star size={14} className="text-yellow-400" />
              <span className="text-gray-300">{githubStats?.stars ? githubStats.stars.toLocaleString() : "1.2k"} stars</span>
            </a>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm" data-testid="badge-open-source">
              <Github size={14} className="text-gray-400" />
              <span className="text-gray-300">Open Source</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm" data-testid="badge-mit-licensed">
              <Scale size={14} className="text-emerald-400" />
              <span className="text-gray-300">MIT Licensed</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm">
              <Tag size={14} className="text-blue-400" />
              <span className="text-gray-300">v2.4.0</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-300">All systems operational</span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="gradient-text">Accelerate Your ML Workflow</span>
            <br />
            <span className="text-white">with AI-Native Linux</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Eliminate configuration overhead and driver complexity. Describe what you need in plain English,
            and Cortex handles the rest — from GPU optimization to deployment.
          </motion.p>

          {/* Demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <InteractiveDemoHero />
          </motion.div>

        </div>
      </section>
      {/* Social Proof - Logo Wall */}
      <section className="py-16 border-t border-white/5 overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-widest">Optimized for today’s developer ecosystem</p>
          <p className="text-xs text-gray-600 mt-2">Adopted by 1000+ developers worldwide</p>
        </div>
        <div className="relative">
          <div className="logo-scroll flex gap-16 items-center">
            {[...logos, ...logos].map((logo, i) => (
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
      </section>
      {/* Built For Section - Who This Is For */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for <span className="gradient-text">You</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Whether you're training models, shipping code, or scaling infrastructure
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Brain,
                title: "ML Engineers",
                description: "GPU drivers, CUDA, PyTorch",
                detail: "Driver configuration handled. Focus on training models."
              },
              {
                icon: Workflow,
                title: "DevOps Teams",
                description: "Reproducible infra, CI-friendly",
                detail: "Deterministic builds. Every time."
              },
              {
                icon: Zap,
                title: "Startups",
                description: "Faster iteration, less infra debt",
                detail: "Move fast without breaking things."
              },
              {
                icon: ShieldCheck,
                title: "Enterprises",
                description: "Control, auditability, SLA",
                detail: "Compliance-ready from day one."
              }
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] transition-all duration-300"
                data-testid={`built-for-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <item.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-blue-400 text-sm font-medium mb-2">{item.description}</p>
                <p className="text-gray-500 text-sm">{item.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* New to Cortex? - Getting Started Preview */}
      <section className="py-16 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-8 md:p-10 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-blue-400 uppercase tracking-wide">New to Cortex?</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                    Start Your Journey Today
                  </h3>
                  <p className="text-gray-400 text-lg max-w-xl">
                    Our step-by-step guide will take you from installation to running your first AI-powered workflow in minutes.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/getting-started"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 rounded-lg text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300"
                    data-testid="button-homepage-getting-started"
                  >
                    Getting Started Guide
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/blog/install-cortex-linux-beginner-guide"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white font-medium hover:bg-white/5 transition-all duration-300"
                    data-testid="link-homepage-install-guide"
                  >
                    Installation Guide
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Product Preview */}
      <section id="preview" className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See <span className="gradient-text">Cortex</span> in Action</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Real commands, real results. See what takes others hours happen in seconds — no signup required.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <InteractiveCodeEditor title="interactive demo" actions={<CopyButton text={demoCommands[activeDemo].command} size="sm" />}>
              {/* Demo Tabs */}
              <div className="code-tabs">
                {demoCommands.map((demo, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDemo(i)}
                    className={`code-tab ${activeDemo === i ? "active" : ""}`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>

              {/* Terminal Content */}
              <div className="code-editor-body min-h-[180px]">
                <CodeLine lineNumber={1}>
                  <span className="syntax-prompt">$</span>{" "}
                  <span className="syntax-command">cortex</span>{" "}
                  {activeDemo === 0 && (
                    <>
                      <span className="syntax-keyword">generate</span>{" "}
                      <span className="syntax-string">api</span>{" "}
                      <span className="syntax-flag">--name</span>{" "}
                      <span className="syntax-variable">users</span>
                    </>
                  )}
                  {activeDemo === 1 && (
                    <>
                      <span className="syntax-keyword">add</span>{" "}
                      <span className="syntax-string">auth</span>{" "}
                      <span className="syntax-flag">--provider</span>{" "}
                      <span className="syntax-variable">oauth</span>
                    </>
                  )}
                  {activeDemo === 2 && (
                    <>
                      <span className="syntax-keyword">deploy</span>{" "}
                      <span className="syntax-flag">--edge</span>
                    </>
                  )}
                </CodeLine>
                
                <div className="code-output" key={activeDemo}>
                  {activeDemo === 0 && (
                    <>
                      <OutputLine>Created <span className="syntax-path">/api/users/route.ts</span></OutputLine>
                      <OutputLine>Generated <span className="syntax-info">CRUD operations</span></OutputLine>
                      <OutputLine>Added <span className="syntax-accent">TypeScript</span> types</OutputLine>
                      <OutputLine>API ready at <span className="syntax-string">localhost:3000/api/users</span></OutputLine>
                    </>
                  )}
                  {activeDemo === 1 && (
                    <>
                      <OutputLine>Installed <span className="syntax-info">authentication</span> dependencies</OutputLine>
                      <OutputLine>Created <span className="syntax-path">auth middleware</span></OutputLine>
                      <OutputLine>Generated <span className="syntax-accent">login/signup</span> routes</OutputLine>
                      <OutputLine>Added <span className="syntax-success">session management</span></OutputLine>
                    </>
                  )}
                  {activeDemo === 2 && (
                    <>
                      <OutputLine>Building <span className="syntax-info">production bundle</span>...</OutputLine>
                      <OutputLine>Optimizing for <span className="syntax-accent">edge runtime</span></OutputLine>
                      <OutputLine>Deploying to <span className="syntax-variable">12 regions</span></OutputLine>
                      <OutputLine>Live at <span className="syntax-string">https://app.cortex.dev</span></OutputLine>
                    </>
                  )}
                </div>
              </div>
            </InteractiveCodeEditor>
          </motion.div>
        </div>
      </section>
      {/* Features Grid - Bento Style */}
      <section id="about" className="py-24 px-4 border-t border-white/5 relative">
        {/* Subtle background blobs */}
        <div className="bg-blob bg-blob-blue w-[500px] h-[500px] -top-32 -right-32" style={{ animationDelay: '0s' }} />
        <div className="bg-blob bg-blob-blue w-[400px] h-[400px] bottom-20 -left-20" style={{ animationDelay: '4s' }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Complete <span className="gradient-text">ML Toolkit</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything data scientists and DevOps teams need to go from prototype to production — without infrastructure complexity.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                className="glass-card glass-card-hover rounded-2xl p-8 cursor-pointer transition-colors duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon size={24} className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 mb-4">{feature.description}</p>
                    
                    {/* Expandable Code - Professional */}
                    <motion.div
                      initial={false}
                      animate={{ height: expandedFeature === i ? "auto" : 0 }}
                      className="overflow-hidden"
                    >
                      <div className="feature-code-block">
                        {feature.code.split('\n').map((line, lineIdx) => (
                          <CodeLine key={lineIdx} lineNumber={lineIdx + 1}>
                            <span className="syntax-prompt">$</span>{" "}
                            {line.split(' ').map((word, wordIdx) => {
                              if (word === 'cortex') return <span key={wordIdx} className="syntax-command">{word} </span>;
                              if (word.startsWith('--')) return <span key={wordIdx} className="syntax-flag">{word} </span>;
                              if (word.startsWith('@')) return <span key={wordIdx} className="syntax-accent">{word} </span>;
                              if (['init', 'add', 'deploy', 'plugin', 'install'].includes(word)) return <span key={wordIdx} className="syntax-keyword">{word} </span>;
                              return <span key={wordIdx} className="syntax-string">{word} </span>;
                            })}
                          </CodeLine>
                        ))}
                      </div>
                    </motion.div>
                    
                    <button className="text-blue-400 text-sm flex items-center gap-1 mt-3 hover:gap-2 transition-colors">
                      {expandedFeature === i ? "Hide code" : "View code"}
                      <ChevronRight size={14} className={`transition-transform duration-200 ${expandedFeature === i ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Live Demo Playground */}
      <section className="py-24 px-4 border-t border-white/5 relative">
        {/* Subtle background blobs */}
        <div className="bg-blob bg-blob-blue w-[450px] h-[450px] top-1/4 -left-24" style={{ animationDelay: '2s' }} />
        <div className="bg-blob bg-blob-blue w-[350px] h-[350px] bottom-10 right-0" style={{ animationDelay: '6s' }} />
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="gradient-text">Try It</span> Yourself</h2>
            <p className="text-gray-400">Run commands directly in your browser.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InteractiveCodeEditor title="cortex-playground" actions={<CopyButton text="cortex generate api --name products" size="sm" />}>
              <div className="code-editor-body">
                <CodeLine lineNumber={1}>
                  <span className="syntax-prompt">$</span>{" "}
                  <span className="syntax-command">cortex</span>{" "}
                  <span className="syntax-keyword">generate</span>{" "}
                  <span className="syntax-string">api</span>{" "}
                  <span className="syntax-flag">--name</span>{" "}
                  <span className="syntax-variable">products</span>
                </CodeLine>
                <div className="code-output">
                  <OutputLine>Created <span className="syntax-path">/api/products/route.ts</span></OutputLine>
                  <OutputLine>Generated <span className="syntax-info">CRUD operations</span></OutputLine>
                  <OutputLine>Added <span className="syntax-accent">TypeScript</span> types</OutputLine>
                </div>
              </div>
              
              {/* Prompt Pills */}
              <div className="border-t border-white/5 px-6 py-4 flex flex-wrap items-center gap-3 bg-black/20">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Try:</span>
                {["Generate REST API", "Add Authentication", "Deploy to Edge", "Install Plugin"].map((prompt, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 rounded-lg text-sm bg-white/[0.03] text-gray-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </InteractiveCodeEditor>
          </motion.div>
        </div>
      </section>
      {/* Architecture Diagram - Enhanced 3D Layered Visualization */}
      <section id="architecture" className="py-32 px-4 border-t border-white/5 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <Layers size={14} />
              <span>System Architecture</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              How <span className="gradient-text"> Cortex </span> Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A powerful layered architecture that transforms your natural language into optimized system operations.
            </p>
          </motion.div>

          {/* Clean Architecture Flow Diagram */}
          <div className="relative mb-16" data-testid="svg-architecture-diagram">
            {/* Horizontal Flow - Desktop */}
            <div className="hidden md:flex items-center justify-center gap-4 lg:gap-8">
              {/* Step 1: Input */}
              <div className="flex flex-col items-center">
                <div className="w-32 lg:w-40 h-24 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 flex flex-col items-center justify-center p-4">
                  <Terminal size={28} className="text-blue-400 mb-2" />
                  <span className="text-xs text-blue-400 font-medium">INPUT</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 text-center">Natural Language</span>
              </div>

              {/* Arrow 1 */}
              <div className="flex-shrink-0">
                <ArrowRight size={24} className="text-gray-600" />
              </div>

              {/* Step 2: AI Processing */}
              <div className="flex flex-col items-center">
                <div className="w-44 lg:w-52 h-28 rounded-xl bg-gradient-to-br from-purple-500/15 to-purple-600/5 border border-purple-500/40 flex flex-col items-center justify-center p-4 relative">
                  <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-purple-500/50 animate-pulse" />
                  <Brain size={32} className="text-purple-400 mb-2" />
                  <span className="text-sm text-white font-semibold">AI CORE</span>
                  <span className="text-xs text-gray-400">Parse + Analyze</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 text-center">Context-Aware Processing</span>
              </div>

              {/* Arrow 2 */}
              <div className="flex-shrink-0">
                <ArrowRight size={24} className="text-gray-600" />
              </div>

              {/* Step 3: Command Generation */}
              <div className="flex flex-col items-center">
                <div className="w-32 lg:w-40 h-24 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/30 flex flex-col items-center justify-center p-4">
                  <Code2 size={28} className="text-cyan-400 mb-2" />
                  <span className="text-xs text-cyan-400 font-medium">GENERATE</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 text-center">Safe Commands</span>
              </div>

              {/* Arrow 3 */}
              <div className="flex-shrink-0">
                <ArrowRight size={24} className="text-gray-600" />
              </div>

              {/* Step 4: Execution */}
              <div className="flex flex-col items-center">
                <div className="w-32 lg:w-40 h-24 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/30 flex flex-col items-center justify-center p-4">
                  <CheckCircle2 size={28} className="text-green-400 mb-2" />
                  <span className="text-xs text-green-400 font-medium">EXECUTE</span>
                </div>
                <span className="text-xs text-gray-500 mt-2 text-center">Sandboxed Runtime</span>
              </div>
            </div>

            {/* Vertical Flow - Mobile */}
            <div className="md:hidden flex flex-col items-center gap-4">
              {[
                { icon: Terminal, label: "INPUT", sublabel: "Natural Language", color: "blue" },
                { icon: Brain, label: "AI CORE", sublabel: "Parse + Analyze", color: "purple" },
                { icon: Code2, label: "GENERATE", sublabel: "Safe Commands", color: "cyan" },
                { icon: CheckCircle2, label: "EXECUTE", sublabel: "Sandboxed Runtime", color: "green" },
              ].map((step, i) => {
                const colorMap: Record<string, string> = {
                  blue: "from-blue-500/10 to-blue-600/5 border-blue-500/30 text-blue-400",
                  purple: "from-purple-500/15 to-purple-600/5 border-purple-500/40 text-purple-400",
                  cyan: "from-cyan-500/10 to-cyan-600/5 border-cyan-500/30 text-cyan-400",
                  green: "from-green-500/10 to-green-600/5 border-green-500/30 text-green-400",
                };
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                  >
                    {i > 0 && <ArrowRight size={20} className="text-gray-600 rotate-90 mb-3" />}
                    <div className={`w-48 h-20 rounded-xl bg-gradient-to-br ${colorMap[step.color]} border flex items-center justify-center gap-3 p-4`}>
                      <step.icon size={24} className={colorMap[step.color].split(' ').pop()} />
                      <div>
                        <span className={`text-xs font-medium ${colorMap[step.color].split(' ').pop()}`}>{step.label}</span>
                        <p className="text-xs text-gray-400">{step.sublabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          </div>
      </section>
      {/* Security Section */}
      <section id="security" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4"><span className="gradient-text">Enterprise-Grade</span> Security</h2>
            <p className="text-gray-400">Built with security-first principles from day one.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Lock, title: "Sandboxed Execution", description: "AI never has direct kernel access. Every command runs in isolated Firejail container." },
              { icon: Eye, title: "Preview Before Execute", description: "Review all commands before they run. You approve every system change." },
              { icon: RotateCcw, title: "Instant Rollback", description: "Undo any change in seconds. Full system snapshots before major operations." },
              { icon: FileText, title: "Complete Audit Logging", description: "Track every command, every change. Full transparency for compliance." },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 glass-card rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Comparison Table - Enhanced Design */}
      <section className="py-24 px-4 border-t border-white/5 relative overflow-hidden">
        {/* Background gradient accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-blue-400 text-sm mb-6">
              <CircleDot size={14} />
              <span>Feature Comparison</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              How Is <span className="gradient-text">Cortex Different?</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              See why developers choose Cortex over traditional alternatives.
            </p>
          </motion.div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm overflow-hidden"
            >
              {/* Table Header */}
              <div className="grid grid-cols-4 border-b border-white/10">
                <div className="p-6 text-gray-400 font-semibold uppercase text-xs tracking-wider">
                  Feature
                </div>
                <div className="p-6 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-500/5" />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 mb-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-blue-400 font-bold text-sm">CORTEX</span>
                    </div>
                    <p className="text-xs text-blue-300/60">Recommended</p>
                  </div>
                </div>
                <div className="p-6 text-center text-gray-500 font-medium">
                  OpenAI Codex
                </div>
                <div className="p-6 text-center text-gray-500 font-medium">
                  GitHub Copilot
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white/5">
                {comparisonData.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 group transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    {/* Feature Name with Icon */}
                    <div className="p-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 transition-colors duration-200">
                        <row.icon size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-gray-200 font-medium group-hover:text-white transition-colors">
                        {row.feature}
                      </span>
                    </div>

                    {/* Cortex Column - Highlighted */}
                    <div className="p-5 flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
                      <div className="relative">
                        {row.cortex === true ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                            <Check size={16} className="text-white" strokeWidth={3} />
                          </div>
                        ) : typeof row.cortex === "string" ? (
                          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-400 font-semibold text-sm">
                            {row.cortex}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* OpenAI Codex Column */}
                    <div className="p-5 flex items-center justify-center">
                      {row.toolA === true ? (
                        <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                          <Check size={14} className="text-gray-500" />
                        </div>
                      ) : row.toolA === "partial" ? (
                        <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm font-medium">
                          Partial
                        </span>
                      ) : row.toolA === false ? (
                        <div className="w-7 h-7 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                          <X size={14} className="text-gray-600" />
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">{row.toolA}</span>
                      )}
                    </div>

                    {/* GitHub Copilot Column */}
                    <div className="p-5 flex items-center justify-center">
                      {row.toolB === true ? (
                        <div className="w-7 h-7 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                          <Check size={14} className="text-gray-500" />
                        </div>
                      ) : row.toolB === false ? (
                        <div className="w-7 h-7 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                          <X size={14} className="text-gray-600" />
                        </div>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                          {row.toolB}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Footer */}
              <div className="p-6 border-t border-white/10 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Check size={10} className="text-white" strokeWidth={3} />
                      </div>
                      <span>Full Support</span>
                    </div>
                    <span className="text-gray-700">|</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <X size={8} className="text-gray-600" />
                      </div>
                      <span>Not Supported</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate("join")}
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    Try Cortex Free
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {comparisonData.map((row, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm p-5"
              >
                {/* Feature Header */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center">
                    <row.icon size={18} className="text-blue-400" />
                  </div>
                  <span className="text-white font-semibold text-lg">{row.feature}</span>
                </div>

                {/* Comparison Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Cortex */}
                  <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-xs text-blue-400 font-semibold mb-2">Cortex</div>
                    {row.cortex === true ? (
                      <div className="w-7 h-7 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    ) : typeof row.cortex === "string" ? (
                      <span className="text-green-400 font-semibold text-sm">{row.cortex}</span>
                    ) : null}
                  </div>

                  {/* OpenAI Codex */}
                  <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                    <div className="text-xs text-gray-500 font-medium mb-2">Codex</div>
                    {row.toolA === true ? (
                      <div className="w-6 h-6 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
                        <Check size={12} className="text-gray-500" />
                      </div>
                    ) : row.toolA === "partial" ? (
                      <span className="text-yellow-500 text-xs font-medium">Partial</span>
                    ) : row.toolA === false ? (
                      <div className="w-6 h-6 mx-auto rounded-full bg-gray-900 flex items-center justify-center">
                        <X size={12} className="text-gray-600" />
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">{row.toolA}</span>
                    )}
                  </div>

                  {/* GitHub Copilot */}
                  <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                    <div className="text-xs text-gray-500 font-medium mb-2">Copilot</div>
                    {row.toolB === true ? (
                      <div className="w-6 h-6 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
                        <Check size={12} className="text-gray-500" />
                      </div>
                    ) : row.toolB === false ? (
                      <div className="w-6 h-6 mx-auto rounded-full bg-gray-900 flex items-center justify-center">
                        <X size={12} className="text-gray-600" />
                      </div>
                    ) : (
                      <span className="text-red-400 text-xs font-medium">{row.toolB}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Mobile CTA */}
            <div className="pt-4">
              <button
                onClick={() => onNavigate("join")}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Start Building with Cortex — Free
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 relative">
        {/* Subtle background blobs */}
        <div className="bg-blob bg-blob-blue w-[600px] h-[600px] top-0 left-1/4 -translate-x-1/2" style={{ animationDelay: '1s' }} />
        <div className="bg-blob bg-blob-blue w-[400px] h-[400px] bottom-20 right-10" style={{ animationDelay: '5s' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Choose Your <span className="gradient-text">Edition</span></h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Community Edition */}
            <div className="glass-card rounded-2xl p-8 border border-white/10 flex flex-col">
              <div>
                <h3 className="text-2xl font-bold mb-2">Community Edition</h3>
                <div className="text-4xl font-bold text-emerald-400 mb-2">FREE</div>
                <p className="text-gray-400 mb-8">Open Source Forever</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Full AI capabilities</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>All core features</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Open source (Apache 2.0)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Community support</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-emerald-400 flex-shrink-0" />
                    <span>Unlimited personal use</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-auto">
                <a
                  href="https://github.com/cortexlinux/cortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-4 text-center rounded-xl font-semibold border border-white/20 bg-white/5 hover:bg-white/10 transition-colors"
                  data-testid="button-download-free"
                >
                  Download Free
                </a>
              </div>
            </div>

            {/* Enterprise Edition */}
            <div className="glass-card rounded-2xl p-8 border border-white/10 flex flex-col relative">
              <div className="absolute -top-3 right-8">
                <span className="px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full">
                  FOR TEAMS
                </span>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Enterprise Edition</h3>
                <div className="text-4xl font-bold text-blue-400 mb-2"><span className="gradient-text">Custom</span></div>
                <p className="text-gray-400 mb-8">Contact for Pricing</p>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-blue-400 flex-shrink-0" />
                    <span>Everything in Community</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-blue-400 flex-shrink-0" />
                    <span>Priority support (24/7)</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-blue-400 flex-shrink-0" />
                    <span>Compliance reporting</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-blue-400 flex-shrink-0" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-blue-400 flex-shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <Check size={18} className="text-blue-400 flex-shrink-0" />
                    <span>SLA guarantees</span>
                  </li>
                </ul>
              </div>
              
              <div className="mt-auto">
                <a
                  href="mailto:sales@cortexlinux.com"
                  className="block w-full py-4 text-center rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 transition-colors"
                  data-testid="button-contact-sales"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Open Source Dashboard */}
      <section ref={statsRef} className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join a Growing <span className="gradient-text">Community</span> of Engineers</h2>
            <p className="text-gray-400">100% open source. Backed by a thriving community of ML engineers, data scientists, and DevOps pros.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Star, value: stars, label: "GitHub Stars", suffix: "" },
              { icon: Download, value: 50000, label: "Downloads", suffix: "+" },
              { icon: Users, value: contributorCount, label: "Contributors", suffix: "" },
              { icon: Globe, value: 12, label: "Edge Regions", suffix: "" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-6 text-center"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <stat.icon size={24} className="text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}{stat.suffix}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Contributors */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Top Contributors</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {contributors?.slice(0, 12).map((contributor) => (
                <a
                  key={contributor.login}
                  href={contributor.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-full border-2 border-transparent hover:border-blue-400 transition-all"
                  />
                </a>
              ))}
              {contributors && contributors.length > 12 && (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm text-gray-400">
                  +{contributors.length - 12}
                </div>
              )}
            </div>
            
            <div className="flex gap-4">
              <a
                href="https://github.com/cortexlinux/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:underline"
              >
                <Github size={16} />
                View on GitHub
              </a>
              <a
                href="https://github.com/cortexlinux/cortex/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                Become a Contributor
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Documentation Preview */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Be Up and Running in <span className="gradient-text">30 Seconds</span></h2>
            <p className="text-gray-400">Three commands. That's all it takes to transform how you work with ML infrastructure.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <InteractiveCodeEditor title="quickstart.sh" actions={<CopyButton text={`${installCommands[activeTab]}\ncortex init my-app\ncortex dev`} size="sm" />}>
              {/* Package Manager Tabs */}
              <div className="code-tabs">
                {(["npm", "yarn", "pnpm", "bun"] as const).map((pm) => (
                  <button
                    key={pm}
                    onClick={() => setActiveTab(pm)}
                    className={`code-tab ${activeTab === pm ? "active" : ""}`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              {/* Code Blocks */}
              <div className="code-editor-body quickstart-block">
                <div className="quickstart-step">
                  <div className="quickstart-label">Step 1 — Install</div>
                  <CodeLine lineNumber={1}>
                    <span className="syntax-prompt">$</span>{" "}
                    {activeTab === "npm" && (
                      <>
                        <span className="syntax-command">npm</span>{" "}
                        <span className="syntax-keyword">install</span>{" "}
                        <span className="syntax-flag">-g</span>{" "}
                        <span className="syntax-string">cortex-cli</span>
                      </>
                    )}
                    {activeTab === "yarn" && (
                      <>
                        <span className="syntax-command">yarn</span>{" "}
                        <span className="syntax-keyword">global</span>{" "}
                        <span className="syntax-keyword">add</span>{" "}
                        <span className="syntax-string">cortex-cli</span>
                      </>
                    )}
                    {activeTab === "pnpm" && (
                      <>
                        <span className="syntax-command">pnpm</span>{" "}
                        <span className="syntax-keyword">add</span>{" "}
                        <span className="syntax-flag">-g</span>{" "}
                        <span className="syntax-string">cortex-cli</span>
                      </>
                    )}
                    {activeTab === "bun" && (
                      <>
                        <span className="syntax-command">bun</span>{" "}
                        <span className="syntax-keyword">add</span>{" "}
                        <span className="syntax-flag">-g</span>{" "}
                        <span className="syntax-string">cortex-cli</span>
                      </>
                    )}
                  </CodeLine>
                </div>
                
                <div className="quickstart-step">
                  <div className="quickstart-label">Step 2 — Initialize</div>
                  <CodeLine lineNumber={2}>
                    <span className="syntax-prompt">$</span>{" "}
                    <span className="syntax-command">cortex</span>{" "}
                    <span className="syntax-keyword">init</span>{" "}
                    <span className="syntax-variable">my-app</span>
                  </CodeLine>
                </div>
                
                <div className="quickstart-step">
                  <div className="quickstart-label">Step 3 — Start developing</div>
                  <CodeLine lineNumber={3}>
                    <span className="syntax-prompt">$</span>{" "}
                    <span className="syntax-command">cortex</span>{" "}
                    <span className="syntax-keyword">dev</span>
                  </CodeLine>
                </div>
              </div>

              {/* Doc Links */}
              <div className="border-t border-white/5 px-6 py-4 flex gap-6 flex-wrap bg-black/20">
                <a href="https://github.com/cortexlinux/cortex#readme" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Full Documentation</a>
                <a href="https://github.com/cortexlinux/cortex/wiki" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">API Reference</a>
                <a href="https://github.com/cortexlinux/cortex/tree/main/examples" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Examples</a>
              </div>
            </InteractiveCodeEditor>
          </motion.div>
        </div>
      </section>
      {/* AI Processing Visualization - Premium Enhanced Version */}
      <section id="ai-processing" className="py-32 px-4 border-t border-white/5 overflow-hidden relative">
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
              <Brain size={14} />
              <span>AI-Powered Pipeline</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              The AI That <span className="gradient-text"> Understands You </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Describe what you need in plain English. Cortex translates your intent into perfectly optimized system commands — instantly and safely.
            </p>
          </motion.div>

          {/* Premium Animated Neural Network SVG Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative mb-16"
            data-testid="svg-ai-processing-visualization"
          >
            <svg
              viewBox="0 0 1200 350"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Premium Gradient definitions */}
                <linearGradient id="aiBlueGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="aiPurpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="aiGreenGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="1" />
                </linearGradient>
                <linearGradient id="aiCoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
                <radialGradient id="aiOrbGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
                
                {/* Enhanced Glow filters */}
                <filter id="aiGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="aiStrongGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                {/* Background grid pattern */}
                <pattern id="aiGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                </pattern>
              </defs>
              
              {/* Background Elements */}
              <rect width="100%" height="100%" fill="url(#aiGrid)" />
              
              {/* Ambient Orbs */}
              <circle cx="200" cy="80" r="80" fill="url(#aiOrbGlow)" opacity="0.3">
                <animate attributeName="r" values="80;100;80" dur="6s" repeatCount="indefinite" />
              </circle>
              <circle cx="1000" cy="280" r="60" fill="url(#aiOrbGlow)" opacity="0.2">
                <animate attributeName="r" values="60;80;60" dur="8s" repeatCount="indefinite" />
              </circle>
              
              {/* Stage 1: Input Node - Enhanced */}
              <g className="input-stage" data-testid="stage-input">
                {/* Outer glow ring */}
                <circle cx="120" cy="175" r="70" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.2">
                  <animate attributeName="r" values="70;85;70" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
                </circle>
                
                {/* Main circle with gradient border */}
                <circle cx="120" cy="175" r="55" fill="rgba(59,130,246,0.08)" stroke="url(#aiBlueGlow)" strokeWidth="2.5">
                  <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Inner circle */}
                <circle cx="120" cy="175" r="40" fill="rgba(59,130,246,0.15)">
                  <animate attributeName="fill-opacity" values="0.15;0.25;0.15" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Icon representation */}
                <circle cx="120" cy="165" r="15" fill="rgba(96,165,250,0.3)" />
                <text x="120" y="170" textAnchor="middle" fill="#60a5fa" fontSize="14" fontWeight="bold">IN</text>
                <text x="120" y="195" textAnchor="middle" fill="#9ca3af" fontSize="9">"Install PyTorch"</text>
                
                {/* Multiple pulsing rings */}
                <circle cx="120" cy="175" r="55" fill="none" stroke="#3b82f6" strokeWidth="1.5" opacity="0.5">
                  <animate attributeName="r" values="55;75;55" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="120" cy="175" r="55" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.3">
                  <animate attributeName="r" values="55;85;55" dur="3s" repeatCount="indefinite" begin="0.5s" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" begin="0.5s" />
                </circle>
              </g>
              
              {/* Connection 1: Input to AI - Multiple flowing lines */}
              <g className="connection-1">
                {/* Primary path */}
                <path d="M 175 175 C 250 120 320 120 395 175" fill="none" stroke="url(#aiBlueGlow)" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
                </path>
                {/* Secondary path */}
                <path d="M 175 175 C 250 230 320 230 395 175" fill="none" stroke="url(#aiBlueGlow)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
                </path>
                
                {/* Hidden animation path */}
                <path id="aiPath1" d="M 175 175 C 250 145 320 145 395 175" fill="none" stroke="none" />
                
                {/* Multiple moving particles */}
                <circle r="6" fill="#60a5fa" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite">
                    <mpath href="#aiPath1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="#818cf8" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.4s">
                    <mpath href="#aiPath1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="0.4s" />
                </circle>
                <circle r="5" fill="#60a5fa" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.9s">
                    <mpath href="#aiPath1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="0.9s" />
                </circle>
                <circle r="3" fill="#a78bfa" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.3s">
                    <mpath href="#aiPath1" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="1.3s" />
                </circle>
              </g>
              
              {/* Stage 2: AI Processing - Neural Network Core */}
              <g className="processing-stage" data-testid="stage-ai-processing">
                {/* Large outer glow */}
                <circle cx="460" cy="175" r="100" fill="url(#aiOrbGlow)" opacity="0.4">
                  <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
                </circle>
                
                {/* Main processing circle */}
                <circle cx="460" cy="175" r="75" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2.5">
                  <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
                </circle>
                
                {/* Neural network nodes - Rotating cluster */}
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 460 175" to="360 460 175" dur="15s" repeatCount="indefinite" />
                  <circle cx="460" cy="105" r="10" fill="#818cf8" opacity="0.9" filter="url(#aiGlow)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="520" cy="130" r="8" fill="#a78bfa" opacity="0.8" filter="url(#aiGlow)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.4s" />
                  </circle>
                  <circle cx="520" cy="220" r="9" fill="#818cf8" opacity="0.85" filter="url(#aiGlow)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.8s" />
                  </circle>
                  <circle cx="460" cy="245" r="7" fill="#a78bfa" opacity="0.75" filter="url(#aiGlow)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1.2s" />
                  </circle>
                  <circle cx="400" cy="220" r="10" fill="#818cf8" opacity="0.9" filter="url(#aiGlow)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="1.6s" />
                  </circle>
                  <circle cx="400" cy="130" r="8" fill="#a78bfa" opacity="0.8" filter="url(#aiGlow)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="2s" />
                  </circle>
                </g>
                
                {/* Counter-rotating inner ring */}
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="360 460 175" to="0 460 175" dur="12s" repeatCount="indefinite" />
                  <circle cx="460" cy="145" r="5" fill="#c4b5fd" opacity="0.7" />
                  <circle cx="480" cy="175" r="4" fill="#c4b5fd" opacity="0.6" />
                  <circle cx="460" cy="205" r="5" fill="#c4b5fd" opacity="0.7" />
                  <circle cx="440" cy="175" r="4" fill="#c4b5fd" opacity="0.6" />
                </g>
                
                {/* Center core with pulsing effect */}
                <circle cx="460" cy="175" r="32" fill="url(#aiCoreGradient)" opacity="0.3" filter="url(#aiStrongGlow)">
                  <animate attributeName="r" values="28;35;28" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="460" cy="175" r="25" fill="rgba(139,92,246,0.4)" stroke="#a78bfa" strokeWidth="1.5">
                  <animate attributeName="r" values="22;28;22" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Core text */}
                <text x="460" y="170" textAnchor="middle" fill="#e0e7ff" fontSize="12" fontWeight="bold">AI</text>
                <text x="460" y="185" textAnchor="middle" fill="#c4b5fd" fontSize="9">CORTEX</text>
              </g>
              
              {/* Connection 2: AI to Commands */}
              <g className="connection-2">
                <path d="M 535 175 C 610 100 680 100 755 175" fill="none" stroke="url(#aiPurpleGlow)" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
                </path>
                <path d="M 535 175 C 610 250 680 250 755 175" fill="none" stroke="url(#aiPurpleGlow)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
                </path>
                
                <path id="aiPath2" d="M 535 175 C 610 150 680 150 755 175" fill="none" stroke="none" />
                
                <circle r="6" fill="#a78bfa" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.2s">
                    <mpath href="#aiPath2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="0.2s" />
                </circle>
                <circle r="4" fill="#c4b5fd" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.7s">
                    <mpath href="#aiPath2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="0.7s" />
                </circle>
                <circle r="5" fill="#a78bfa" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.2s">
                    <mpath href="#aiPath2" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="1.2s" />
                </circle>
              </g>
              
              {/* Stage 3: Command Generation - Terminal Style */}
              <g className="command-stage" data-testid="stage-command-gen">
                {/* Outer glow */}
                <rect x="735" y="110" width="130" height="130" rx="16" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3">
                  <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
                </rect>
                
                {/* Main container */}
                <rect x="745" y="120" width="110" height="110" rx="12" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
                </rect>
                
                {/* Terminal header */}
                <rect x="750" y="125" width="100" height="20" rx="4" fill="rgba(139,92,246,0.2)" />
                <circle cx="762" cy="135" r="3" fill="#ef4444" opacity="0.8" />
                <circle cx="774" cy="135" r="3" fill="#fbbf24" opacity="0.8" />
                <circle cx="786" cy="135" r="3" fill="#22c55e" opacity="0.8" />
                
                {/* Animated terminal lines */}
                <rect x="755" y="152" width="0" height="10" fill="#a78bfa" rx="2">
                  <animate attributeName="width" values="0;70;70;0" dur="4s" repeatCount="indefinite" />
                </rect>
                <rect x="755" y="167" width="0" height="10" fill="#c4b5fd" rx="2">
                  <animate attributeName="width" values="0;55;55;0" dur="4s" repeatCount="indefinite" begin="0.6s" />
                </rect>
                <rect x="755" y="182" width="0" height="10" fill="#a78bfa" rx="2">
                  <animate attributeName="width" values="0;85;85;0" dur="4s" repeatCount="indefinite" begin="1.2s" />
                </rect>
                <rect x="755" y="197" width="0" height="10" fill="#c4b5fd" rx="2">
                  <animate attributeName="width" values="0;45;45;0" dur="4s" repeatCount="indefinite" begin="1.8s" />
                </rect>
                
                {/* Cursor blink */}
                <rect x="755" y="212" width="8" height="10" fill="#8b5cf6" rx="1">
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </rect>
              </g>
              
              {/* Connection 3: Commands to Execution */}
              <g className="connection-3">
                <path d="M 855 175 C 930 100 1000 100 1075 175" fill="none" stroke="url(#aiGreenGlow)" strokeWidth="2.5" strokeDasharray="8,4" opacity="0.8">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
                </path>
                <path d="M 855 175 C 930 250 1000 250 1075 175" fill="none" stroke="url(#aiGreenGlow)" strokeWidth="2" strokeDasharray="8,4" opacity="0.5">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
                </path>
                
                <path id="aiPath3" d="M 855 175 C 930 150 1000 150 1075 175" fill="none" stroke="none" />
                
                <circle r="6" fill="#4ade80" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.4s">
                    <mpath href="#aiPath3" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="0.4s" />
                </circle>
                <circle r="4" fill="#86efac" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="0.9s">
                    <mpath href="#aiPath3" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="0.9s" />
                </circle>
                <circle r="5" fill="#4ade80" filter="url(#aiGlow)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" begin="1.4s">
                    <mpath href="#aiPath3" />
                  </animateMotion>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.8s" repeatCount="indefinite" begin="1.4s" />
                </circle>
              </g>
              
              {/* Stage 4: Execution Success - Enhanced */}
              <g className="execute-stage" data-testid="stage-execute">
                {/* Outer success glow */}
                <circle cx="1100" cy="175" r="80" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.2">
                  <animate attributeName="r" values="80;100;80" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite" />
                </circle>
                
                {/* Main circle */}
                <circle cx="1100" cy="175" r="55" fill="rgba(34,197,94,0.08)" stroke="#22c55e" strokeWidth="2.5">
                  <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
                
                {/* Inner glow */}
                <circle cx="1100" cy="175" r="40" fill="rgba(34,197,94,0.15)">
                  <animate attributeName="r" values="35;42;35" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.15;0.25;0.15" dur="1.8s" repeatCount="indefinite" />
                </circle>
                
                {/* Animated Checkmark */}
                <path d="M 1078 175 L 1093 190 L 1122 155" fill="none" stroke="#4ade80" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#aiGlow)">
                  <animate attributeName="stroke-dasharray" values="0 100;100 0" dur="0.8s" fill="freeze" repeatCount="indefinite" begin="2s" />
                </path>
                
                <text x="1100" y="210" textAnchor="middle" fill="#86efac" fontSize="10" fontWeight="bold">SUCCESS</text>
                
                {/* Multiple success pulses */}
                <circle cx="1100" cy="175" r="55" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.5">
                  <animate attributeName="r" values="55;80;55" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="1100" cy="175" r="55" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.3">
                  <animate attributeName="r" values="55;95;55" dur="3s" repeatCount="indefinite" begin="0.5s" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" begin="0.5s" />
                </circle>
              </g>
              
              {/* Stage Labels - Enhanced */}
              <g className="stage-labels">
                <text x="120" y="260" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="700">01. Input</text>
                <text x="120" y="278" textAnchor="middle" fill="#6b7280" fontSize="10">Natural Language</text>
                
                <text x="460" y="280" textAnchor="middle" fill="#818cf8" fontSize="12" fontWeight="700">02. Process</text>
                <text x="460" y="298" textAnchor="middle" fill="#6b7280" fontSize="10">AI Understanding</text>
                
                <text x="800" y="260" textAnchor="middle" fill="#a78bfa" fontSize="12" fontWeight="700">03. Generate</text>
                <text x="800" y="278" textAnchor="middle" fill="#6b7280" fontSize="10">Optimized Commands</text>
                
                <text x="1100" y="260" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="700">04. Execute</text>
                <text x="1100" y="278" textAnchor="middle" fill="#6b7280" fontSize="10">Safe & Reversible</text>
              </g>
            </svg>
          </motion.div>

          {/* Feature Highlights - Enhanced */}
          <div
            className="mt-16 flex flex-wrap justify-center gap-4"
          >
            {[
              { label: "Natural Language", icon: MessageCircle, color: "blue" },
              { label: "Hardware Aware", icon: Cpu, color: "indigo" },
              { label: "Sandboxed", icon: Shield, color: "purple" },
              { label: "Instant Rollback", icon: RotateCcw, color: "green" },
              { label: "Context Memory", icon: Brain, color: "violet" },
            ].map((item, i) => {
              const colorMap: Record<string, string> = {
                blue: "text-blue-400 border-blue-500/30 bg-blue-500/5",
                indigo: "text-indigo-400 border-indigo-500/30 bg-indigo-500/5",
                purple: "text-purple-400 border-purple-500/30 bg-purple-500/5",
                green: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
                violet: "text-violet-400 border-violet-500/30 bg-violet-500/5",
              };
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${colorMap[item.color]} transition-transform duration-200 hover:scale-105`}
                  data-testid={`badge-feature-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* Community Section */}
      <section className="py-24 px-4 border-t border-white/5 relative">
        {/* Subtle background blobs */}
        <div className="bg-blob bg-blob-blue w-[500px] h-[500px] top-10 -right-20" style={{ animationDelay: '3s' }} />
        <div className="bg-blob bg-blob-blue w-[350px] h-[350px] bottom-0 left-10" style={{ animationDelay: '7s' }} />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join <span className="gradient-text">8,000+</span> Developers</h2>
            <p className="text-gray-400">Connect with the community.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FaDiscord, name: "Discord", color: "hover:border-indigo-500", link: "https://discord.gg/cortexlinux" },
              { icon: FaTwitter, name: "Twitter", color: "hover:border-sky-500", link: "https://twitter.com/cortexlinux" },
              { icon: Github, name: "GitHub", color: "hover:border-gray-500", link: "https://github.com/cortexlinux/cortex/discussions" },
            ].map((platform, i) => (
              <a
                key={i}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`glass-card rounded-xl p-6 text-center transition-colors ${platform.color}`}
              >
                <platform.icon size={32} className="mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold mb-1">{platform.name}</h3>
                <button className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
                  Join
                  <ChevronRight size={14} className="inline ml-1" />
                </button>
              </a>
            ))}
          </div>
        </div>
      </section>
      {/* Roadmap Timeline */}
      <section className="py-24 px-4 border-t border-white/5 relative overflow-hidden">
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
                        ? "bg-blue-500/10 border border-blue-500/30 hover:border-blue-400/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                        : "bg-white/5 border border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className={`text-xs font-bold uppercase tracking-wider mb-3 ${
                      item.status === "completed"
                        ? "text-green-400"
                        : item.status === "current"
                        ? "text-blue-400"
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
                        ? "text-blue-400"
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
                          {item.status === "completed" && <Check size={14} className="text-green-400 flex-shrink-0" />}
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mt-14"
          >
            <a
              href="https://github.com/cortexlinux/cortex/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/10 text-gray-400 hover:border-blue-500/50 hover:text-white hover:bg-blue-500/10 transition-all duration-300"
            >
              Suggest a feature
              <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </section>
      {/* Blog Preview Section */}
      <BlogPreview />
      {/* Final CTA */}
      <section id="join" className="py-32 px-4 relative overflow-hidden">
        <div className="gradient-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Something <span className="gradient-text">Amazing</span>?</h2>
            <p className="text-xl text-gray-400 mb-10">Start shipping faster with Cortex. Free forever.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://github.com/cortexlinux/cortex"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-lg font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
              <button
                onClick={() => onNavigate("preview")}
                className="px-8 py-4 glass-card rounded-xl text-lg font-semibold hover:border-blue-400/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Talk to Us
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Shield size={16} className="text-blue-400" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm" data-testid="badge-cta-open-source">
                <Github size={16} className="text-gray-400" />
                <span>100% Open Source</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm" data-testid="badge-cta-mit-licensed">
                <BadgeCheck size={16} className="text-purple-400" />
                <span>MIT Licensed</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">No credit card required · Deploy in 30 seconds · Free forever</p>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="col-span-2">
              <button 
                onClick={() => onNavigate("home")}
                className="text-2xl font-bold mb-4 text-left"
                data-testid="footer-logo"
              >
                <span className="text-white">CORTEX</span>{" "}
                <span className="text-blue-400">LINUX</span>
              </button>
              <p className="text-gray-400 text-sm max-w-xs mb-4">
                Open-source AI infrastructure for the modern developer.
              </p>
              <p className="text-gray-500 text-xs">
                Built in public. Open source on GitHub.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => onNavigate("about")} className="hover:text-white transition-colors" data-testid="footer-link-features">Features</button></li>
                <li><button onClick={() => onNavigate("pricing")} className="hover:text-white transition-colors" data-testid="footer-link-pricing">Pricing</button></li>
                <li><button onClick={() => onNavigate("preview")} className="hover:text-white transition-colors" data-testid="footer-link-docs">Documentation</button></li>
                <li><a href="/faq" className="hover:text-white transition-colors" data-testid="footer-link-faq">FAQ</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/blog" className="hover:text-white transition-colors" data-testid="footer-link-blog">Blog</a></li>
                <li><button onClick={() => onNavigate("preview")} className="hover:text-white transition-colors" data-testid="footer-link-api">API Reference</button></li>
                <li><a href="/beta" className="hover:text-white transition-colors" data-testid="footer-link-get-started">Get Started</a></li>
                <li><a href="/status" className="hover:text-white transition-colors" data-testid="footer-link-status">Status</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://discord.gg/cortexlinux" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-discord">Discord</a></li>
                <li><a href="https://twitter.com/cortexlinux" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-twitter">Twitter</a></li>
                <li><a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-github">GitHub</a></li>
                <li><button onClick={() => onNavigate("join")} className="hover:text-white transition-colors" data-testid="footer-link-community">Join Community</button></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/privacy" className="hover:text-white transition-colors" data-testid="footer-link-privacy">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors" data-testid="footer-link-terms">Terms of Service</a></li>
                <li><a href="/security-policy" className="hover:text-white transition-colors" data-testid="footer-link-security">Security</a></li>
                <li><a href="/license" className="hover:text-white transition-colors" data-testid="footer-link-license">License (MIT)</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; 2025 Cortex Linux. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-white transition-colors" data-testid="footer-bottom-privacy">Privacy</a>
              <a href="/terms" className="hover:text-white transition-colors" data-testid="footer-bottom-terms">Terms</a>
              <a href="/security-policy" className="hover:text-white transition-colors" data-testid="footer-bottom-security">Security</a>
              <a href="/status" className="hover:text-white transition-colors" data-testid="footer-bottom-status">Status</a>
            </div>
            <div className="flex gap-4">
              <a href="https://twitter.com/cortexlinux" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-twitter">
                <FaTwitter size={20} />
              </a>
              <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-github">
                <Github size={20} />
              </a>
              <a href="https://discord.gg/cortexlinux" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-discord">
                <FaDiscord size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
