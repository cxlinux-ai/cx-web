import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  Copy,
  Check,
  Shield,
  Clock,
  Server,
  Lock,
  Eye,
  Undo2,
  FileText,
  Zap,
  Users,
  Building2,
  ChevronRight,
  Play,
  Loader2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";
import Footer from "@/components/Footer";

// ============================================
// CX Linux - Admin-Focused Homepage
// ============================================

// ============================================
// Try Panel — Interactive CX Demo (3 commands/IP/day)
// ============================================
const DEMO_RESPONSES: Record<string, { commands: string[]; explanation: string }> = {
  "set up nginx reverse proxy for port 3000": {
    commands: [
      "sudo apt install -y nginx",
      "sudo tee /etc/nginx/sites-available/app <<EOF\nserver {\n    listen 80;\n    server_name _;\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n    }\n}\nEOF",
      "sudo ln -sf /etc/nginx/sites-available/app /etc/nginx/sites-enabled/",
      "sudo nginx -t && sudo systemctl reload nginx",
    ],
    explanation: "Installs nginx, creates a reverse proxy config for your app on port 3000, enables the site, and reloads nginx after testing the config.",
  },
  "harden ssh and set up firewall": {
    commands: [
      "sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak",
      "sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config",
      "sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config",
      "sudo systemctl restart sshd",
      "sudo ufw default deny incoming",
      "sudo ufw default allow outgoing",
      "sudo ufw allow ssh && sudo ufw allow http && sudo ufw allow https",
      "sudo ufw --force enable",
    ],
    explanation: "Backs up SSH config, disables root login and password auth, restarts SSH, then configures UFW firewall to allow only SSH, HTTP, and HTTPS.",
  },
  "install docker and docker compose": {
    commands: [
      "sudo apt update",
      "sudo apt install -y ca-certificates curl gnupg",
      "sudo install -m 0755 -d /etc/apt/keyrings",
      'curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg',
      'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list',
      "sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin",
      "sudo usermod -aG docker $USER",
    ],
    explanation: "Adds Docker's official GPG key and repository, installs Docker Engine + Compose plugin, and adds your user to the docker group.",
  },
};

const DEMO_SUGGESTIONS = [
  "set up nginx reverse proxy for port 3000",
  "harden ssh and set up firewall",
  "install docker and docker compose",
];

function TryPanel() {
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ commands: string[]; explanation: string } | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const MAX_TRIES = 3;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check usage from localStorage
    const stored = localStorage.getItem("cx_demo_usage");
    if (stored) {
      const { count, date } = JSON.parse(stored);
      const today = new Date().toISOString().slice(0, 10);
      if (date === today) {
        setUsageCount(count);
      }
    }
  }, []);

  const incrementUsage = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem("cx_demo_usage", JSON.stringify({ count: newCount, date: today }));
  };

  const handleRun = async (command?: string) => {
    const cmd = (command || input).trim().toLowerCase();
    if (!cmd) return;
    if (usageCount >= MAX_TRIES) return;

    setIsRunning(true);
    setInput(cmd);
    setResult(null);

    // Find best matching demo response
    let bestMatch = DEMO_RESPONSES[cmd];
    if (!bestMatch) {
      // Fuzzy match
      for (const key of Object.keys(DEMO_RESPONSES)) {
        if (cmd.includes("nginx") || cmd.includes("reverse proxy") || cmd.includes("proxy")) {
          bestMatch = DEMO_RESPONSES["set up nginx reverse proxy for port 3000"];
          break;
        }
        if (cmd.includes("ssh") || cmd.includes("firewall") || cmd.includes("harden") || cmd.includes("ufw")) {
          bestMatch = DEMO_RESPONSES["harden ssh and set up firewall"];
          break;
        }
        if (cmd.includes("docker") || cmd.includes("container")) {
          bestMatch = DEMO_RESPONSES["install docker and docker compose"];
          break;
        }
      }
    }

    // Simulate processing time
    await new Promise((r) => setTimeout(r, 1200));

    if (bestMatch) {
      setResult(bestMatch);
      incrementUsage();
    } else {
      setResult({
        commands: [`# CX would analyze your system and generate commands for: "${cmd}"`],
        explanation: "In the full version, CX analyzes your system state, generates the right commands, and lets you review before executing. Try one of the suggested commands above to see a real example!",
      });
      incrementUsage();
    }

    setIsRunning(false);
  };

  const remaining = MAX_TRIES - usageCount;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#0A0A0A] border border-[#333] rounded-xl overflow-hidden">
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#161616] border-b border-[#333]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 ml-2 font-mono">cx — try it live</span>
          <div className="ml-auto flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00FF9F]" />
            <span className="text-xs text-gray-500">{remaining} tries left today</span>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="px-4 pt-3 pb-2 flex flex-wrap gap-2">
          {DEMO_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleRun(s)}
              disabled={isRunning || remaining <= 0}
              className="text-xs px-3 py-1.5 rounded-full bg-[#00FF9F]/10 text-[#00FF9F] hover:bg-[#00FF9F]/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-[#111] rounded-lg border border-[#333] px-3 py-2">
            <span className="text-[#00FF9F] font-mono text-sm font-bold">cx</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRun()}
              placeholder={remaining > 0 ? '"describe what you want to do..."' : "Daily limit reached — install CX for unlimited use"}
              disabled={isRunning || remaining <= 0}
              className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-gray-600 outline-none disabled:opacity-50"
            />
            <button
              onClick={() => handleRun()}
              disabled={isRunning || !input.trim() || remaining <= 0}
              className="p-1.5 rounded bg-[#00FF9F]/10 hover:bg-[#00FF9F]/20 transition-colors disabled:opacity-30"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 text-[#00FF9F] animate-spin" />
              ) : (
                <Play className="w-4 h-4 text-[#00FF9F]" />
              )}
            </button>
          </div>
        </div>

        {/* Result */}
        {(isRunning || result) && (
          <div className="px-4 pb-4 border-t border-[#222]">
            {isRunning && (
              <div className="flex items-center gap-2 py-3 text-gray-400 text-sm font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-[#00FF9F]" />
                Analyzing system and generating commands...
              </div>
            )}
            {result && !isRunning && (
              <div className="pt-3 space-y-2">
                <p className="text-xs text-gray-500 mb-2">📋 CX would generate and preview these commands:</p>
                <div className="bg-black/50 rounded-lg p-3 max-h-48 overflow-y-auto">
                  {result.commands.map((cmd, i) => (
                    <div key={i} className="font-mono text-xs text-[#00FF9F] mb-1 whitespace-pre-wrap">
                      <span className="text-gray-600">$ </span>{cmd}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  💡 {result.explanation}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  In CX, you'd review these commands then approve with one keystroke. Every action has instant rollback.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  // SEO
  updateSEO(seoConfigs.home);

  const [copiedApt, setCopiedApt] = useState(false);
  const [copiedNpm, setCopiedNpm] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const copyToClipboard = (text: string, type: "apt" | "npm") => {
    navigator.clipboard.writeText(text);
    if (type === "apt") {
      setCopiedApt(true);
      setTimeout(() => setCopiedApt(false), 2000);
    } else {
      setCopiedNpm(true);
      setTimeout(() => setCopiedNpm(false), 2000);
    }
  };

  const aptCommand = 'sudo apt update && sudo apt install cx-terminal && cx "your command here"';
  const npmCommand = "npm install -g cx-cli";

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Hero Section — WIFM: User outcome first */}
      <section className="min-h-[500px] flex flex-col justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Stop Googling Linux Commands.
            <br />
            <span className="text-[#00FF9F]">Just Tell CX What You Need.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Set up servers, configure firewalls, deploy apps — in plain English.
            <br className="hidden md:block" />
            CX handles the commands. You stay in control.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Works on any Ubuntu/Debian system. Free to start. No credit card required.
          </p>

          {/* Try It Now — Interactive Demo */}
          <TryPanel />

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/getting-started">
              <Button className="bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-semibold px-8 py-3 text-base">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10 px-8 py-3 text-base">
                View Plans
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: Admin Math */}
      <section className="py-16 px-4 bg-[#161616]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-[#00FF9F]" />
            <h2 className="text-2xl md:text-3xl font-bold">Save Time on Admin Tasks</h2>
          </div>
          
          <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-6 mb-8">
            <p className="text-xl text-gray-300 mb-6">
              <span className="text-red-400">Manual SSH: 30min/server</span> → <span className="text-[#00FF9F]">CX: 5min with AI commands</span>
            </p>
            
            <ul className="grid md:grid-cols-2 gap-4">
              {[
                "Automate backups across fleet",
                "Configure firewalls with natural language",
                "Analyze logs instantly",
                "Hardware detection & inventory",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <Zap className="w-5 h-5 text-[#00FF9F] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CLI Example */}
          <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
            <code className="text-[#00FF9F] font-mono text-sm">
              cx "backup /data to s3 and verify checksums"
            </code>
          </div>

          <div className="mt-8 text-center">
            <Link href="/pricing">
              <Button className="bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-semibold">
                Start Free Trial <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: Security */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#00FF9F]" />
            <h2 className="text-2xl md:text-3xl font-bold">Built for Secure Operations</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              { icon: Lock, title: "Firejail Sandboxing", desc: "Isolated execution environment" },
              { icon: Eye, title: "Preview Before Execute", desc: "Review commands before running" },
              { icon: Undo2, title: "Atomic Rollbacks", desc: "Undo any change instantly" },
              { icon: FileText, title: "Audit Logs", desc: "Complete command history" },
            ].map((item, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-[#333] rounded-lg p-6 flex items-start gap-4">
                <item.icon className="w-6 h-6 text-[#00FF9F] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/pricing">
              <Button variant="outline" className="border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10">
                Register Pro for Advanced Security <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Pricing */}
      <section className="py-16 px-4 bg-[#161616]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Choose Your Plan</h2>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-10">
            <span className={billingCycle === "monthly" ? "text-white" : "text-gray-500"}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                billingCycle === "annual" ? "bg-[#00FF9F]" : "bg-gray-600"
              }`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                billingCycle === "annual" ? "translate-x-8" : "translate-x-1"
              }`} />
            </button>
            <span className={billingCycle === "annual" ? "text-white" : "text-gray-500"}>
              Annual <span className="text-[#00FF9F] text-sm">(Save 20%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Core",
                price: 0,
                icon: Terminal,
                features: ["Natural language commands", "Local LLM support", "1 server", "Community support"],
                cta: "Sign Up Free",
                highlight: false,
              },
              {
                name: "Pro",
                price: billingCycle === "monthly" ? 20 : 16,
                icon: Zap,
                features: ["Everything in Core", "Cloud LLMs (GPT-4, Claude)", "Up to 10 servers", "Email support", "Priority updates"],
                cta: "Upgrade to Pro",
                highlight: true,
              },
              {
                name: "Team",
                price: billingCycle === "monthly" ? 99 : 79,
                icon: Users,
                features: ["Everything in Pro", "Unlimited servers", "Team collaboration", "SSO/LDAP", "Audit logs"],
                cta: "Get Team",
                highlight: false,
              },
              {
                name: "Enterprise",
                price: billingCycle === "monthly" ? 299 : 239,
                icon: Building2,
                features: ["Everything in Team", "Dedicated support", "Custom integrations", "SLA guarantee", "Compliance reports"],
                cta: "Contact Sales",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 ${
                  plan.highlight
                    ? "bg-gradient-to-b from-[#00FF9F]/20 to-[#00FF9F]/5 border-2 border-[#00FF9F]"
                    : "bg-[#0D0D0D] border border-[#333]"
                }`}
              >
                <plan.icon className={`w-8 h-8 mb-4 ${plan.highlight ? "text-[#00FF9F]" : "text-gray-400"}`} />
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-400">/mo</span>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-[#00FF9F] flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button
                    className={`w-full ${
                      plan.highlight
                        ? "bg-[#00FF9F] text-black hover:bg-[#00CC7F]"
                        : "bg-[#333] text-white hover:bg-[#444]"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-[#333]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/getting-started" className="hover:text-[#00FF9F]">Terminal</Link></li>
                <li><a href="https://github.com/cxlinux-ai/cx-distro" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF9F]">Distro</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://github.com/cxlinux-ai/cx-core" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF9F]">GitHub</a></li>
              </ul>
            </div>
            {/* Commercial */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Commercial</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/pricing" className="hover:text-[#00FF9F]">Pricing</Link></li>
                <li><Link href="/affiliates" className="hover:text-[#00FF9F]">Affiliates (10%)</Link></li>
                <li><a href="mailto:sales@cxlinux.com" className="hover:text-[#00FF9F]">Contact Sales</a></li>
                <li><a href="mailto:support@cxlinux.com" className="hover:text-[#00FF9F]">Support</a></li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/privacy" className="hover:text-[#00FF9F]">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[#00FF9F]">Terms of Service</Link></li>
                <li><Link href="/license" className="hover:text-[#00FF9F]">License</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#333]">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © 2026 CX Linux. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://github.com/cxlinux-ai" className="text-gray-400 hover:text-[#00FF9F]">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/cxlinux" className="text-gray-400 hover:text-[#00FF9F]">
                <FaTwitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
