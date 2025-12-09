import { useQuery } from "@tanstack/react-query";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
  Info,
} from "lucide-react";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import type { Contributor } from "@shared/schema";

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
    { icon: Zap, title: "Get Started in Minutes, Not Hours", description: "Skip the setup headaches. One command creates your entire ML environment, pre-configured and production-ready.", code: "cortex init my-app && cd my-app && cortex dev" },
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

  const logos = ["Vercel", "Stripe", "Linear", "Supabase", "Railway", "Planetscale", "Clerk", "Resend"];

  const installCommands = {
    npm: "npm install -g cortex-cli",
    yarn: "yarn global add cortex-cli",
    pnpm: "pnpm add -g cortex-cli",
    bun: "bun add -g cortex-cli",
  };

  return (
    <div className="min-h-screen bg-black text-white noise-texture">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
        <div className="gradient-glow top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
        <div className="gradient-glow bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-50" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap justify-center gap-3 mb-8"
          >
            <a
              href="https://github.com/cortexlinux/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm hover:border-blue-400/50 transition-all"
              data-testid="link-github-stars"
            >
              <Star size={14} className="text-yellow-400" />
              <span className="text-gray-300">{githubStats?.stars?.toLocaleString() || "1.2k"} stars</span>
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
            Stop wrestling with configs and drivers. Describe what you need in plain English,
            and Cortex handles the rest — from GPU optimization to deployment.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <button
              onClick={() => onNavigate("join")}
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-lg font-semibold hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Start Building Now — Free Forever
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://github.com/cortexlinux/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 glass-card rounded-xl text-lg font-semibold hover:border-blue-400/50 hover:bg-white/5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Github size={20} />
              View on GitHub
            </a>
          </motion.div>

          {/* Professional Terminal Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <CodeEditor 
              title="terminal — cortex" 
              actions={<CopyButton text="cortex install tensorflow --optimize-gpu" size="sm" />}
            >
              <CodeLine lineNumber={1}>
                <span className="syntax-prompt">$</span>{" "}
                <span className="syntax-command">cortex</span>{" "}
                <span className="syntax-keyword">install</span>{" "}
                <span className="syntax-string">tensorflow</span>{" "}
                <span className="syntax-flag">--optimize-gpu</span>
              </CodeLine>
              <div className="code-output">
                <OutputLine>Detected <span className="syntax-accent">NVIDIA RTX 4090</span></OutputLine>
                <OutputLine>Installing <span className="syntax-info">CUDA 12.3</span> drivers</OutputLine>
                <OutputLine>Configuring TensorFlow for <span className="syntax-accent">GPU</span></OutputLine>
                <OutputLine>Optimized for your hardware — <span className="syntax-success">Ready in 8s</span></OutputLine>
              </div>
            </CodeEditor>
          </motion.div>
        </div>
      </section>

      {/* Social Proof - Logo Wall */}
      <section className="py-16 border-t border-white/5 overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-widest">Trusted by teams at industry-leading companies</p>
          <p className="text-xs text-gray-600 mt-2">Over 50,000+ developers use Cortex daily</p>
        </div>
        <div className="relative">
          <div className="logo-scroll flex gap-16 items-center">
            {[...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className="text-2xl font-bold text-gray-600 hover:text-white transition-colors duration-300 whitespace-nowrap opacity-50 hover:opacity-100"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Product Preview */}
      <section id="preview" className="py-24 px-4 relative">
        <div className="gradient-glow left-0 top-1/2 -translate-y-1/2" />
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
      <section id="about" className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Complete ML Toolkit</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Everything data scientists and DevOps teams need to go from prototype to production — without the infrastructure headaches.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setExpandedFeature(expandedFeature === i ? null : i)}
                className="glass-card glass-card-hover rounded-2xl p-8 cursor-pointer transition-all duration-300"
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
                    
                    <button className="text-blue-400 text-sm flex items-center gap-1 mt-3 hover:gap-2 transition-all">
                      {expandedFeature === i ? "Hide code" : "View code"}
                      <ChevronRight size={14} className={`transition-transform duration-200 ${expandedFeature === i ? "rotate-90" : ""}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Playground */}
      <section className="py-24 px-4 border-t border-white/5 relative">
        <div className="gradient-glow right-0 top-1/2 -translate-y-1/2" />
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Try It Yourself</h2>
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
              How Cortex Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A powerful layered architecture that transforms your natural language into optimized system operations.
            </p>
          </motion.div>

          {/* Interactive 3D Architecture Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative mb-16"
          >
            <svg
              viewBox="0 0 1000 500"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
              data-testid="svg-architecture-diagram"
            >
              <defs>
                {/* Gradient Definitions */}
                <linearGradient id="archBlueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="archPurpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                <linearGradient id="archGreenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#16a34a" />
                </linearGradient>
                <linearGradient id="archCyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
                <linearGradient id="flowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
                </linearGradient>
                
                {/* Glow Filters */}
                <filter id="archGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="archSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                {/* Grid Pattern */}
                <pattern id="archGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                </pattern>
              </defs>
              
              {/* Background Grid */}
              <rect width="100%" height="100%" fill="url(#archGrid)" />

              {/* Layer 1: User Input (Top) */}
              <g className="layer-user">
                <rect x="350" y="30" width="300" height="70" rx="12" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
                </rect>
                <rect x="360" y="40" width="280" height="50" rx="8" fill="rgba(59,130,246,0.05)" />
                <text x="500" y="55" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">USER LAYER</text>
                <text x="500" y="75" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Your Application</text>
                {/* Icon placeholder */}
                <circle cx="380" cy="65" r="15" fill="rgba(59,130,246,0.3)" />
                <text x="380" y="69" textAnchor="middle" fill="#60a5fa" fontSize="12">CLI</text>
              </g>

              {/* Animated Flow Lines: User to Cortex */}
              <g className="flow-user-to-cortex">
                <path d="M 500 100 L 500 140" fill="none" stroke="url(#flowGradient)" strokeWidth="3" strokeDasharray="8,4">
                  <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.5s" repeatCount="indefinite" />
                </path>
                {/* Flow Particles */}
                <circle r="6" fill="#3b82f6" filter="url(#archGlow)">
                  <animate attributeName="cy" values="100;140" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </circle>
                <circle r="4" fill="#818cf8" filter="url(#archGlow)">
                  <animate attributeName="cy" values="100;140" dur="1s" repeatCount="indefinite" begin="0.3s" />
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.3s" />
                </circle>
                <circle r="3" fill="#a78bfa" filter="url(#archGlow)">
                  <animate attributeName="cy" values="100;140" dur="1s" repeatCount="indefinite" begin="0.6s" />
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" begin="0.6s" />
                </circle>
                {/* All particles at x=500 */}
                <circle cx="500" r="6" fill="#3b82f6" filter="url(#archGlow)">
                  <animate attributeName="cy" values="100;140" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Layer 2: Cortex Runtime (AI Core) */}
              <g className="layer-cortex">
                {/* Outer glow ring */}
                <ellipse cx="500" cy="200" rx="200" ry="50" fill="none" stroke="#8b5cf6" strokeWidth="1" opacity="0.3">
                  <animate attributeName="rx" values="200;210;200" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.5;0.3" dur="4s" repeatCount="indefinite" />
                </ellipse>
                
                <rect x="300" y="150" width="400" height="100" rx="16" fill="rgba(139,92,246,0.15)" stroke="#8b5cf6" strokeWidth="2">
                  <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
                </rect>
                
                {/* Inner content area */}
                <rect x="320" y="165" width="360" height="70" rx="10" fill="url(#archPurpleGradient)" opacity="0.2" />
                
                {/* AI Brain icon area */}
                <circle cx="380" cy="200" r="25" fill="rgba(139,92,246,0.4)" stroke="#a78bfa" strokeWidth="1">
                  <animate attributeName="r" values="25;28;25" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="380" y="195" textAnchor="middle" fill="#c4b5fd" fontSize="10">AI</text>
                <text x="380" y="208" textAnchor="middle" fill="#c4b5fd" fontSize="8">CORE</text>
                
                <text x="530" y="185" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">CORTEX RUNTIME</text>
                <text x="530" y="205" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">AI Processing Layer</text>
                <text x="530" y="225" textAnchor="middle" fill="#9ca3af" fontSize="10">NLP + Context Analysis + Command Generation</text>
              </g>

              {/* Animated Flow Lines: Cortex to Services */}
              <g className="flow-cortex-to-services">
                {/* Left branch */}
                <path d="M 400 250 Q 300 290 200 330" fill="none" stroke="url(#flowGradient)" strokeWidth="2" strokeDasharray="6,3">
                  <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
                </path>
                {/* Center branch */}
                <path d="M 500 250 L 500 330" fill="none" stroke="url(#flowGradient)" strokeWidth="2" strokeDasharray="6,3">
                  <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
                </path>
                {/* Right branch */}
                <path d="M 600 250 Q 700 290 800 330" fill="none" stroke="url(#flowGradient)" strokeWidth="2" strokeDasharray="6,3">
                  <animate attributeName="stroke-dashoffset" values="0;-18" dur="1.2s" repeatCount="indefinite" />
                </path>

                {/* Animated particles on paths */}
                <circle r="5" fill="#8b5cf6" filter="url(#archSoftGlow)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 400 250 Q 300 290 200 330" />
                </circle>
                <circle r="4" fill="#22c55e" filter="url(#archSoftGlow)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 500 250 L 500 330" begin="0.2s" />
                </circle>
                <circle r="5" fill="#8b5cf6" filter="url(#archSoftGlow)">
                  <animateMotion dur="1.5s" repeatCount="indefinite" path="M 600 250 Q 700 290 800 330" begin="0.4s" />
                </circle>
              </g>

              {/* Layer 3: Services (Storage, Compute, CDN) */}
              <g className="layer-services">
                {/* Storage Node */}
                <g className="service-storage">
                  <rect x="100" y="330" width="200" height="80" rx="12" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="1.5">
                    <animate attributeName="stroke-opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" />
                  </rect>
                  <circle cx="150" cy="370" r="20" fill="rgba(34,197,94,0.2)" />
                  <text x="150" y="366" textAnchor="middle" fill="#4ade80" fontSize="8">DB</text>
                  <text x="150" y="378" textAnchor="middle" fill="#4ade80" fontSize="7">ICON</text>
                  <text x="230" y="360" textAnchor="middle" fill="#86efac" fontSize="10" fontWeight="600">STORAGE</text>
                  <text x="230" y="378" textAnchor="middle" fill="#9ca3af" fontSize="9">Persistent Data</text>
                  <text x="230" y="395" textAnchor="middle" fill="#6b7280" fontSize="8">PostgreSQL, Redis</text>
                </g>

                {/* Compute Node */}
                <g className="service-compute">
                  <rect x="400" y="330" width="200" height="80" rx="12" fill="rgba(6,182,212,0.1)" stroke="#06b6d4" strokeWidth="1.5">
                    <animate attributeName="stroke-opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" begin="0.5s" />
                  </rect>
                  <circle cx="450" cy="370" r="20" fill="rgba(6,182,212,0.2)" />
                  <text x="450" y="366" textAnchor="middle" fill="#22d3ee" fontSize="8">CPU</text>
                  <text x="450" y="378" textAnchor="middle" fill="#22d3ee" fontSize="7">GPU</text>
                  <text x="530" y="360" textAnchor="middle" fill="#67e8f9" fontSize="10" fontWeight="600">COMPUTE</text>
                  <text x="530" y="378" textAnchor="middle" fill="#9ca3af" fontSize="9">ML Processing</text>
                  <text x="530" y="395" textAnchor="middle" fill="#6b7280" fontSize="8">CUDA, TensorFlow</text>
                </g>

                {/* CDN Node */}
                <g className="service-cdn">
                  <rect x="700" y="330" width="200" height="80" rx="12" fill="rgba(249,115,22,0.1)" stroke="#f97316" strokeWidth="1.5">
                    <animate attributeName="stroke-opacity" values="0.5;0.8;0.5" dur="3s" repeatCount="indefinite" begin="1s" />
                  </rect>
                  <circle cx="750" cy="370" r="20" fill="rgba(249,115,22,0.2)" />
                  <text x="750" y="366" textAnchor="middle" fill="#fb923c" fontSize="8">CDN</text>
                  <text x="750" y="378" textAnchor="middle" fill="#fb923c" fontSize="7">EDGE</text>
                  <text x="830" y="360" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="600">EDGE NETWORK</text>
                  <text x="830" y="378" textAnchor="middle" fill="#9ca3af" fontSize="9">Global Delivery</text>
                  <text x="830" y="395" textAnchor="middle" fill="#6b7280" fontSize="8">12 Regions</text>
                </g>
              </g>

              {/* Layer 4: Hardware (Bottom) */}
              <g className="layer-hardware">
                <rect x="200" y="450" width="600" height="40" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <text x="500" y="475" textAnchor="middle" fill="#6b7280" fontSize="11">HARDWARE ABSTRACTION LAYER</text>
                
                {/* Hardware icons */}
                <circle cx="280" cy="470" r="12" fill="rgba(255,255,255,0.05)" />
                <text x="280" y="474" textAnchor="middle" fill="#4b5563" fontSize="8">GPU</text>
                <circle cx="400" cy="470" r="12" fill="rgba(255,255,255,0.05)" />
                <text x="400" y="474" textAnchor="middle" fill="#4b5563" fontSize="8">CPU</text>
                <circle cx="520" cy="470" r="12" fill="rgba(255,255,255,0.05)" />
                <text x="520" y="474" textAnchor="middle" fill="#4b5563" fontSize="8">RAM</text>
                <circle cx="640" cy="470" r="12" fill="rgba(255,255,255,0.05)" />
                <text x="640" y="474" textAnchor="middle" fill="#4b5563" fontSize="8">SSD</text>
                <circle cx="720" cy="470" r="12" fill="rgba(255,255,255,0.05)" />
                <text x="720" y="474" textAnchor="middle" fill="#4b5563" fontSize="8">NET</text>
              </g>

              {/* Flow Labels */}
              <text x="520" y="125" textAnchor="start" fill="#60a5fa" fontSize="9" opacity="0.8">Natural Language</text>
              <text x="300" y="300" textAnchor="middle" fill="#a78bfa" fontSize="9" opacity="0.8">Query</text>
              <text x="500" y="300" textAnchor="middle" fill="#a78bfa" fontSize="9" opacity="0.8">Process</text>
              <text x="700" y="300" textAnchor="middle" fill="#a78bfa" fontSize="9" opacity="0.8">Serve</text>
            </svg>
          </motion.div>

          {/* Architecture Component Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Terminal,
                title: "Application Layer",
                description: "Your CLI interface for natural language commands",
                color: "blue",
                features: ["Voice Input", "Text Commands", "Real-time Feedback"]
              },
              {
                icon: Brain,
                title: "AI Runtime",
                description: "Context-aware processing with NLP understanding",
                color: "purple",
                features: ["Intent Analysis", "Context Memory", "Safe Generation"]
              },
              {
                icon: Boxes,
                title: "Service Layer",
                description: "Modular services for storage, compute, and delivery",
                color: "cyan",
                features: ["Auto-scaling", "Load Balancing", "Edge Caching"]
              },
              {
                icon: Cpu,
                title: "Hardware Layer",
                description: "Automatic GPU detection and driver optimization",
                color: "green",
                features: ["GPU Passthrough", "Driver Mgmt", "Performance Tuning"]
              }
            ].map((layer, i) => {
              const colorClasses: Record<string, { bg: string; border: string; text: string; icon: string }> = {
                blue: { bg: "bg-blue-500/10", border: "border-blue-500/30 hover:border-blue-500/50", text: "text-blue-400", icon: "text-blue-400" },
                purple: { bg: "bg-purple-500/10", border: "border-purple-500/30 hover:border-purple-500/50", text: "text-purple-400", icon: "text-purple-400" },
                cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30 hover:border-cyan-500/50", text: "text-cyan-400", icon: "text-cyan-400" },
                green: { bg: "bg-green-500/10", border: "border-green-500/30 hover:border-green-500/50", text: "text-green-400", icon: "text-green-400" },
              };
              const colors = colorClasses[layer.color];
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  data-testid={`card-architecture-layer-${i}`}
                  className="group"
                >
                  <div className={`glass-card rounded-xl p-6 h-full border ${colors.border} transition-all duration-300`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <layer.icon size={24} className={colors.icon} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{layer.title}</h3>
                        <span className={`text-xs font-mono ${colors.text}`}>0{i + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{layer.description}</p>
                    <div className="space-y-2">
                      {layer.features.map((feature, fi) => (
                        <div key={fi} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('/10', '/50')}`} />
                          <span className="text-xs text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Data Journey Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 glass-card rounded-xl p-8 border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 text-center">Request Journey</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {[
                { step: 1, label: "You Type", example: '"Install PyTorch"', color: "blue" },
                { step: 2, label: "AI Parses", example: "Intent: install, Target: pytorch", color: "purple" },
                { step: 3, label: "Context Check", example: "GPU: RTX 4090, CUDA: 12.3", color: "indigo" },
                { step: 4, label: "Command Gen", example: "pip install torch+cu123", color: "violet" },
                { step: 5, label: "Safe Execute", example: "Sandboxed, Reversible", color: "green" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full bg-${item.color}-500/20 border border-${item.color}-500/40 flex items-center justify-center mb-2 mx-auto`}>
                      <span className={`text-${item.color}-400 font-bold`}>{item.step}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                    <p className="text-xs text-gray-500 font-mono max-w-[120px]">{item.example}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden md:block">
                      <ArrowRight size={20} className="text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Security</h2>
            <p className="text-gray-400">Built with security-first principles from day one.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Lock, title: "Sandboxed Execution", description: "AI never has direct kernel access. Every command runs in isolated Firejail container." },
              { icon: Eye, title: "Preview Before Execute", description: "Review all commands before they run. You approve every system change." },
              { icon: RotateCcw, title: "Instant Rollback", description: "Undo any change in seconds. Full system snapshots before major operations." },
              { icon: FileText, title: "Complete Audit Logging", description: "Track every command, every change. Full transparency for compliance." },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-6 glass-card rounded-xl"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
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
              How Is Cortex Different?
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
                  Tool A
                </div>
                <div className="p-6 text-center text-gray-500 font-medium">
                  Tool B
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-white/5">
                {comparisonData.map((row, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="grid grid-cols-4 group transition-all duration-300 hover:bg-white/[0.02]"
                  >
                    {/* Feature Name with Icon */}
                    <div className="p-5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 group-hover:from-blue-900/30 group-hover:to-gray-900 transition-all duration-300">
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
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 + 0.2, type: "spring", stiffness: 300 }}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25"
                          >
                            <Check size={16} className="text-white" strokeWidth={3} />
                          </motion.div>
                        ) : typeof row.cortex === "string" ? (
                          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-400 font-semibold text-sm">
                            {row.cortex}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Tool A Column */}
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

                    {/* Tool B Column */}
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
                  </motion.div>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
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

                  {/* Tool A */}
                  <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                    <div className="text-xs text-gray-500 font-medium mb-2">Tool A</div>
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

                  {/* Tool B */}
                  <div className="text-center p-3 rounded-lg bg-white/[0.02]">
                    <div className="text-xs text-gray-500 font-medium mb-2">Tool B</div>
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
              </motion.div>
            ))}

            {/* Mobile CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="pt-4"
            >
              <button
                onClick={() => onNavigate("join")}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              >
                Start Building with Cortex — Free
                <ArrowRight size={16} />
              </button>
            </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join a Growing Community of Engineers</h2>
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
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 text-center"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <stat.icon size={24} className="text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}{stat.suffix}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Be Up and Running in 30 Seconds</h2>
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
                <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Full Documentation</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">API Reference</a>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Examples</a>
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
              The AI That Understands You
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

          {/* Enhanced Interactive Pipeline Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stage 1: Natural Input */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="group"
              data-testid="card-stage-input"
            >
              <div className="glass-card rounded-xl p-6 h-full border border-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                    <MessageCircle size={22} className="text-blue-400" />
                  </div>
                  <span className="text-xs text-blue-400/60 font-mono font-bold">01</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Natural Input</h3>
                <p className="text-sm text-gray-400 mb-4">Speak or type in plain language. No syntax to learn.</p>
                
                <div className="bg-black/50 rounded-lg p-4 border border-blue-500/10">
                  <p className="text-sm font-mono text-blue-300 leading-relaxed">"Install PyTorch with GPU support for my RTX 4090"</p>
                </div>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Info size={12} />
                  <span>Voice and text input supported</span>
                </div>
              </div>
            </motion.div>

            {/* Stage 2: AI Processing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="group"
              data-testid="card-stage-ai"
            >
              <div className="glass-card rounded-xl p-6 h-full border border-indigo-500/20 hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Brain size={22} className="text-indigo-400" />
                  </div>
                  <span className="text-xs text-indigo-400/60 font-mono font-bold">02</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">AI Processing</h3>
                <p className="text-sm text-gray-400 mb-4">Context-aware understanding of your system.</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-xs text-gray-400">Intent Analysis</span>
                    <span className="text-xs text-indigo-400 ml-auto">install pytorch</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <span className="text-xs text-gray-400">Hardware Detection</span>
                    <span className="text-xs text-indigo-400 ml-auto">RTX 4090</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    <span className="text-xs text-gray-400">CUDA Version</span>
                    <span className="text-xs text-indigo-400 ml-auto">12.3</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stage 3: Command Generation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="group"
              data-testid="card-stage-generate"
            >
              <div className="glass-card rounded-xl p-6 h-full border border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <Code2 size={22} className="text-purple-400" />
                  </div>
                  <span className="text-xs text-purple-400/60 font-mono font-bold">03</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Command Generation</h3>
                <p className="text-sm text-gray-400 mb-4">Optimized commands for your hardware.</p>
                
                <div className="bg-black/50 rounded-lg p-3 border border-purple-500/10 font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">$</span>
                    <span className="text-gray-300">pip install torch+cu123</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400">$</span>
                    <span className="text-gray-300">pip install torchvision</span>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-purple-400/70">Auto-optimized for CUDA 12.3</div>
              </div>
            </motion.div>

            {/* Stage 4: Safe Execution */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="group"
              data-testid="card-stage-execute"
            >
              <div className="glass-card rounded-xl p-6 h-full border border-emerald-500/20 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)] transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle2 size={22} className="text-emerald-400" />
                  </div>
                  <span className="text-xs text-emerald-400/60 font-mono font-bold">04</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Safe Execution</h3>
                <p className="text-sm text-gray-400 mb-4">Sandboxed execution with instant rollback.</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check size={14} />
                    <span className="text-xs">PyTorch installed</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check size={14} />
                    <span className="text-xs">GPU verified: RTX 4090</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Check size={14} />
                    <span className="text-xs">CUDA 12.3 compatible</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <RotateCcw size={14} />
                    <span className="text-xs">Rollback point created</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature Highlights - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full border ${colorMap[item.color]} transition-all duration-200 hover:scale-105`}
                  data-testid={`badge-feature-${item.label.toLowerCase().replace(' ', '-')}`}
                >
                  <item.icon size={16} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join 8,000+ Developers</h2>
            <p className="text-gray-400">Connect with the community.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FaDiscord, name: "Discord", count: "5.2k members", color: "hover:border-indigo-500", link: "#" },
              { icon: FaTwitter, name: "Twitter", count: "12.4k followers", color: "hover:border-sky-500", link: "#" },
              { icon: Github, name: "GitHub", count: "Discussions", color: "hover:border-gray-500", link: "https://github.com/cortexlinux/cortex/discussions" },
            ].map((platform, i) => (
              <motion.a
                key={i}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card rounded-xl p-6 text-center transition-all ${platform.color}`}
              >
                <platform.icon size={32} className="mx-auto mb-4 text-gray-400" />
                <h3 className="font-semibold mb-1">{platform.name}</h3>
                <p className="text-sm text-gray-400">{platform.count}</p>
                <button className="mt-4 px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
                  Join
                  <ChevronRight size={14} className="inline ml-1" />
                </button>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Roadmap</h2>
            <p className="text-gray-400">Where we're headed.</p>
          </motion.div>

          <div className="relative">
            {/* Timeline with dots and line together */}
            <div className="flex items-center justify-between mb-8">
              {roadmapItems.map((item, i) => (
                <div key={i} className="flex items-center flex-1">
                  {/* Timeline Dot */}
                  <div
                    className={`w-4 h-4 rounded-full flex-shrink-0 z-10 ${
                      item.status === "completed"
                        ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        : item.status === "current"
                        ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        : "bg-gray-600"
                    }`}
                  />
                  {/* Connector line (except for last item) */}
                  {i < roadmapItems.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-700" />
                  )}
                </div>
              ))}
            </div>
            
            {/* Content below timeline */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {roadmapItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-center">
                    <div className={`text-sm font-semibold mb-2 ${
                      item.status === "completed" || item.status === "current"
                        ? "text-blue-400"
                        : "text-gray-500"
                    }`}>
                      {item.quarter}
                    </div>
                    <div className="space-y-1">
                      {item.items.map((task, j) => (
                        <div
                          key={j}
                          className={`text-sm ${
                            item.status === "completed"
                              ? "text-white"
                              : item.status === "current"
                              ? "text-gray-300"
                              : "text-gray-500"
                          }`}
                        >
                          {item.status === "completed" && <Check size={12} className="inline mr-1 text-green-400" />}
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href="https://github.com/cortexlinux/cortex/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-blue-400"
            >
              Suggest a feature →
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="join" className="py-32 px-4 relative overflow-hidden">
        <div className="gradient-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Build Something Amazing?</h2>
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="col-span-2">
              <div className="text-2xl font-bold mb-4">
                <span className="text-white">CORTEX</span>{" "}
                <span className="text-blue-400">LINUX</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Open-source AI infrastructure for the modern developer.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Examples</a></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition-colors">YouTube</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">© 2024 Cortex. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <FaDiscord size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
