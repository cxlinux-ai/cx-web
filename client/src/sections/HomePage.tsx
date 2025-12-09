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
    { icon: Zap, title: "Instant Setup", description: "One command to scaffold. Zero config required. Start building in seconds.", code: "cortex init my-app && cd my-app && cortex dev" },
    { icon: Shield, title: "Secure by Default", description: "Built-in auth, rate limiting, and secrets management out of the box.", code: "cortex add auth --provider oauth2\ncortex add ratelimit --max 100/min" },
    { icon: Globe, title: "Edge-Ready", description: "Deploy globally in seconds. Auto-scaling included. 50ms latency worldwide.", code: "cortex deploy --edge --regions all" },
    { icon: Puzzle, title: "Plugin Ecosystem", description: "Extend with community modules or build your own. 200+ plugins available.", code: "cortex plugin install @cortex/analytics\ncortex plugin install @cortex/payments" },
  ];

  const comparisonData = [
    { feature: "Open Source", cortex: true, toolA: false, toolB: false },
    { feature: "Self-Hostable", cortex: true, toolA: false, toolB: true },
    { feature: "AI-Native", cortex: true, toolA: "partial", toolB: false },
    { feature: "Edge Runtime", cortex: true, toolA: true, toolB: false },
    { feature: "Free Tier", cortex: "Unlimited", toolA: "Limited", toolB: "None" },
    { feature: "Hardware Detection", cortex: true, toolA: false, toolB: false },
    { feature: "Auto Rollback", cortex: true, toolA: false, toolB: false },
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
            >
              <Star size={14} className="text-yellow-400" />
              <span className="text-gray-300">{githubStats?.stars?.toLocaleString() || "1.2k"} stars</span>
            </a>
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
            <span className="gradient-text">The AI-Native</span>
            <br />
            <span className="text-white">Operating System</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Linux that understands natural language. No documentation required.
            Just ask, and Cortex executes.
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
              Get Started Free
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
          <p className="text-sm text-gray-500 uppercase tracking-widest">Trusted by teams at</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Action</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Try these commands and see real responses. No signup required.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Built for developers who want to ship fast without sacrificing quality.</p>
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

      {/* Architecture Diagram */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Simple architecture, powerful results.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <svg viewBox="0 0 600 300" className="w-full max-w-2xl mx-auto">
              {/* Connection Lines */}
              <motion.path
                d="M300 60 L300 100"
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
              <motion.path
                d="M300 160 L150 200 M300 160 L300 200 M300 160 L450 200"
                stroke="#3b82f6"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              />
              
              {/* Your App Node */}
              <motion.g
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <rect x="225" y="20" width="150" height="40" rx="8" fill="#1a1a1a" stroke="#3b82f6" strokeWidth="2" />
                <text x="300" y="45" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Your App</text>
              </motion.g>

              {/* Cortex Runtime Node */}
              <motion.g
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <rect x="200" y="100" width="200" height="60" rx="12" fill="url(#blueGradient)" />
                <text x="300" y="125" textAnchor="middle" fill="white" fontSize="14" fontWeight="600">Cortex Runtime</text>
                <text x="300" y="145" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="12">AI Layer</text>
              </motion.g>

              {/* Bottom Nodes */}
              {[
                { x: 100, label: "Storage" },
                { x: 300, label: "Compute" },
                { x: 500, label: "CDN" },
              ].map((node, i) => (
                <motion.g
                  key={node.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                >
                  <rect x={node.x - 60} y="220" width="120" height="40" rx="8" fill="#1a1a1a" stroke="#374151" strokeWidth="1" />
                  <text x={node.x} y="245" textAnchor="middle" fill="#9ca3af" fontSize="13">{node.label}</text>
                </motion.g>
              ))}

              {/* Gradient Definition */}
              <defs>
                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
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

      {/* Comparison Table */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Is Cortex Different?</h2>
            <p className="text-gray-400">See how we compare to alternatives.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-gray-400 font-medium">Feature</th>
                  <th className="p-4 text-center bg-blue-500/10 text-blue-400 font-semibold">Cortex</th>
                  <th className="p-4 text-center text-gray-400 font-medium">Tool A</th>
                  <th className="p-4 text-center text-gray-400 font-medium">Tool B</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="p-4 text-gray-300">{row.feature}</td>
                    <td className="p-4 text-center bg-blue-500/5">
                      {row.cortex === true ? (
                        <Check size={20} className="text-green-400 mx-auto" />
                      ) : typeof row.cortex === "string" ? (
                        <span className="text-green-400">{row.cortex}</span>
                      ) : null}
                    </td>
                    <td className="p-4 text-center">
                      {row.toolA === true ? (
                        <Check size={20} className="text-gray-500 mx-auto" />
                      ) : row.toolA === "partial" ? (
                        <span className="text-yellow-500">Partial</span>
                      ) : row.toolA === false ? (
                        <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-gray-500">{row.toolA}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {row.toolB === true ? (
                        <Check size={20} className="text-gray-500 mx-auto" />
                      ) : row.toolB === false ? (
                        <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-gray-500">{row.toolB}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Open Source Momentum</h2>
            <p className="text-gray-400">Built by the community, for the community.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: Star, value: stars, label: "Stars" },
              { icon: GitFork, value: forks, label: "Forks" },
              { icon: Users, value: contributorCount, label: "Contributors" },
              { icon: Tag, value: 42, label: "Releases" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 text-center"
              >
                <stat.icon size={24} className="text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-1">{stat.value.toLocaleString()}</div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Quick Start</h2>
            <p className="text-gray-400">Get up and running in 30 seconds.</p>
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

      {/* AI Processing Visualization - Enhanced with Animated SVG */}
      <section id="ai-processing" className="py-24 px-4 border-t border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
              <Cpu size={14} />
              <span>How It Works</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI That Understands You</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Watch how Cortex transforms your natural language into system actions through intelligent processing.
            </p>
          </motion.div>

          {/* Animated Neural Network SVG Visualization */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="relative mb-16"
          >
            <svg
              viewBox="0 0 1200 300"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Gradient definitions */}
                <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
                </linearGradient>
                
                {/* Glow filter */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                {/* Animated particle */}
                <circle id="particle" r="4" fill="#60a5fa" filter="url(#glow)">
                  <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
                </circle>
              </defs>
              
              {/* Background grid pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Stage 1: Input Node */}
              <g className="input-stage">
                <circle cx="100" cy="150" r="50" fill="rgba(59,130,246,0.1)" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="100" cy="150" r="35" fill="rgba(59,130,246,0.2)" />
                <text x="100" y="145" textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="bold">INPUT</text>
                <text x="100" y="162" textAnchor="middle" fill="#9ca3af" fontSize="9">"Update packages"</text>
                
                {/* Pulsing ring */}
                <circle cx="100" cy="150" r="50" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="50;60;50" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
              
              {/* Connection Line 1 with particles */}
              <g className="connection-1">
                <path d="M 150 150 Q 250 100 350 150" fill="none" stroke="url(#blueGlow)" strokeWidth="2" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                </path>
                <path d="M 150 150 Q 250 200 350 150" fill="none" stroke="url(#blueGlow)" strokeWidth="2" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                </path>
                
                {/* Moving particles on path 1 */}
                <circle r="5" fill="#60a5fa" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite">
                    <mpath href="#path1" />
                  </animateMotion>
                </circle>
                <circle r="4" fill="#818cf8" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s">
                    <mpath href="#path1" />
                  </animateMotion>
                </circle>
                <circle r="3" fill="#60a5fa" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="1s">
                    <mpath href="#path1" />
                  </animateMotion>
                </circle>
              </g>
              
              {/* Hidden paths for particle animation */}
              <path id="path1" d="M 150 150 Q 250 120 350 150" fill="none" stroke="none" />
              <path id="path2" d="M 450 150 Q 550 120 650 150" fill="none" stroke="none" />
              <path id="path3" d="M 750 150 Q 850 120 950 150" fill="none" stroke="none" />
              
              {/* Stage 2: AI Processing - Neural network cluster */}
              <g className="processing-stage">
                <circle cx="400" cy="150" r="60" fill="rgba(99,102,241,0.1)" stroke="#6366f1" strokeWidth="2" />
                
                {/* Inner rotating circles */}
                <g>
                  <animateTransform attributeName="transform" type="rotate" from="0 400 150" to="360 400 150" dur="10s" repeatCount="indefinite" />
                  <circle cx="400" cy="100" r="8" fill="#818cf8" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="445" cy="125" r="6" fill="#a78bfa" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
                  </circle>
                  <circle cx="445" cy="175" r="7" fill="#818cf8" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
                  </circle>
                  <circle cx="400" cy="200" r="5" fill="#a78bfa" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
                  </circle>
                  <circle cx="355" cy="175" r="8" fill="#818cf8" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="1.2s" />
                  </circle>
                  <circle cx="355" cy="125" r="6" fill="#a78bfa" opacity="0.8">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" begin="1.5s" />
                  </circle>
                </g>
                
                {/* Center core */}
                <circle cx="400" cy="150" r="25" fill="rgba(99,102,241,0.3)" stroke="#818cf8" strokeWidth="1">
                  <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite" />
                </circle>
                <text x="400" y="147" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">AI</text>
                <text x="400" y="158" textAnchor="middle" fill="#a5b4fc" fontSize="8">PROCESS</text>
              </g>
              
              {/* Connection Line 2 with particles */}
              <g className="connection-2">
                <path d="M 460 150 Q 560 80 660 150" fill="none" stroke="url(#purpleGlow)" strokeWidth="2" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                </path>
                <path d="M 460 150 Q 560 220 660 150" fill="none" stroke="url(#purpleGlow)" strokeWidth="2" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                </path>
                
                {/* Moving particles */}
                <circle r="5" fill="#a78bfa" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="0.3s">
                    <mpath href="#path2" />
                  </animateMotion>
                </circle>
                <circle r="4" fill="#c4b5fd" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="0.8s">
                    <mpath href="#path2" />
                  </animateMotion>
                </circle>
                <circle r="3" fill="#a78bfa" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="1.3s">
                    <mpath href="#path2" />
                  </animateMotion>
                </circle>
              </g>
              
              {/* Stage 3: Command Generation */}
              <g className="command-stage">
                <rect x="660" y="100" width="100" height="100" rx="10" fill="rgba(139,92,246,0.1)" stroke="#8b5cf6" strokeWidth="2" />
                
                {/* Terminal lines animation */}
                <rect x="675" y="120" width="0" height="8" fill="#a78bfa" rx="2">
                  <animate attributeName="width" values="0;50;50;0" dur="3s" repeatCount="indefinite" />
                </rect>
                <rect x="675" y="135" width="0" height="8" fill="#c4b5fd" rx="2">
                  <animate attributeName="width" values="0;40;40;0" dur="3s" repeatCount="indefinite" begin="0.5s" />
                </rect>
                <rect x="675" y="150" width="0" height="8" fill="#a78bfa" rx="2">
                  <animate attributeName="width" values="0;60;60;0" dur="3s" repeatCount="indefinite" begin="1s" />
                </rect>
                <rect x="675" y="165" width="0" height="8" fill="#c4b5fd" rx="2">
                  <animate attributeName="width" values="0;35;35;0" dur="3s" repeatCount="indefinite" begin="1.5s" />
                </rect>
                
                <text x="710" y="190" textAnchor="middle" fill="#c4b5fd" fontSize="9" fontWeight="bold">COMMANDS</text>
              </g>
              
              {/* Connection Line 3 with particles */}
              <g className="connection-3">
                <path d="M 760 150 Q 860 100 960 150" fill="none" stroke="url(#greenGlow)" strokeWidth="2" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                </path>
                <path d="M 760 150 Q 860 200 960 150" fill="none" stroke="url(#greenGlow)" strokeWidth="2" strokeDasharray="5,5">
                  <animate attributeName="stroke-dashoffset" values="0;-20" dur="1s" repeatCount="indefinite" />
                </path>
                
                {/* Moving particles */}
                <circle r="5" fill="#4ade80" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="0.6s">
                    <mpath href="#path3" />
                  </animateMotion>
                </circle>
                <circle r="4" fill="#86efac" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="1.1s">
                    <mpath href="#path3" />
                  </animateMotion>
                </circle>
                <circle r="3" fill="#4ade80" filter="url(#glow)">
                  <animateMotion dur="2s" repeatCount="indefinite" begin="1.6s">
                    <mpath href="#path3" />
                  </animateMotion>
                </circle>
              </g>
              
              {/* Stage 4: Execution - Success state */}
              <g className="execute-stage">
                <circle cx="1010" cy="150" r="50" fill="rgba(34,197,94,0.1)" stroke="#22c55e" strokeWidth="2" />
                <circle cx="1010" cy="150" r="35" fill="rgba(34,197,94,0.2)">
                  <animate attributeName="r" values="30;35;30" dur="1.5s" repeatCount="indefinite" />
                </circle>
                
                {/* Checkmark */}
                <path d="M 990 150 L 1005 165 L 1030 135" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <animate attributeName="stroke-dasharray" values="0 100;100 0" dur="0.5s" fill="freeze" repeatCount="indefinite" begin="2s" />
                </path>
                
                <text x="1010" y="185" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">EXECUTED</text>
                
                {/* Success pulse */}
                <circle cx="1010" cy="150" r="50" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.5">
                  <animate attributeName="r" values="50;70;50" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>
              
              {/* Labels below each stage */}
              <text x="100" y="230" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="600">01. Natural Input</text>
              <text x="100" y="245" textAnchor="middle" fill="#6b7280" fontSize="9">Speak or type</text>
              
              <text x="400" y="230" textAnchor="middle" fill="#818cf8" fontSize="11" fontWeight="600">02. AI Processing</text>
              <text x="400" y="245" textAnchor="middle" fill="#6b7280" fontSize="9">Context analysis</text>
              
              <text x="710" y="230" textAnchor="middle" fill="#a78bfa" fontSize="11" fontWeight="600">03. Generate</text>
              <text x="710" y="245" textAnchor="middle" fill="#6b7280" fontSize="9">System commands</text>
              
              <text x="1010" y="230" textAnchor="middle" fill="#4ade80" fontSize="11" fontWeight="600">04. Execute</text>
              <text x="1010" y="245" textAnchor="middle" fill="#6b7280" fontSize="9">Safe & reversible</text>
            </svg>
          </motion.div>

          {/* Interactive Pipeline Cards */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
              {/* Stage 1: Input */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="group relative"
              >
                <div className="glass-card rounded-xl p-6 h-full border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <MessageCircle size={20} className="text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">01</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Natural Input</h3>
                  <p className="text-sm text-gray-400 mb-4">Speak or type in plain language</p>
                  
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <p className="text-sm font-mono text-blue-300">"Update all packages and clean cache"</p>
                  </div>
                </div>
              </motion.div>

              {/* Stage 2: Parse */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="group relative"
              >
                <div className="glass-card rounded-xl p-6 h-full border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                      <Cpu size={20} className="text-indigo-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">02</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">AI Processing</h3>
                  <p className="text-sm text-gray-400 mb-4">Context-aware understanding</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                      />
                      <span className="text-xs text-gray-500">Intent Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      />
                      <span className="text-xs text-gray-500">Context Mapping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-indigo-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                      />
                      <span className="text-xs text-gray-500">Safety Check</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stage 3: Generate */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group relative"
              >
                <div className="glass-card rounded-xl p-6 h-full border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Terminal size={20} className="text-purple-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">03</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Command Gen</h3>
                  <p className="text-sm text-gray-400 mb-4">Precise system commands</p>
                  
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-xs space-y-1">
                    <div className="text-purple-300">$ sudo pacman -Syu</div>
                    <div className="text-purple-300">$ sudo paccache -r</div>
                  </div>
                </div>
              </motion.div>

              {/* Stage 4: Execute */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
                className="group"
              >
                <div className="glass-card rounded-xl p-6 h-full border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Check size={20} className="text-emerald-400" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">04</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">Safe Execute</h3>
                  <p className="text-sm text-gray-400 mb-4">Sandboxed & reversible</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check size={14} />
                      <span className="text-xs">Packages updated</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check size={14} />
                      <span className="text-xs">Cache cleaned</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check size={14} />
                      <span className="text-xs">Rollback ready</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            {[
              { label: "Natural Language", icon: MessageCircle },
              { label: "Context Aware", icon: Cpu },
              { label: "Sandboxed", icon: Shield },
              { label: "Reversible", icon: RotateCcw },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <item.icon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
            ))}
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

            <p className="text-sm text-gray-500">No credit card required · Deploy in 30 seconds</p>
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
