import { useState } from "react";
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
} from "lucide-react";
import { FaGithub, FaTwitter } from "react-icons/fa";
import Footer from "@/components/Footer";

// ============================================
// CX Linux - Admin-Focused Homepage
// ============================================

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
      {/* Hero Section */}
      <section className="min-h-[400px] flex flex-col justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            CX Linux: <span className="text-[#00FF9F]">AI-Powered Fleet Management</span> for Linux Admins
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Natural language commands for servers—no manual SSH, automate backups/firewalls/logs.
          </p>

          {/* Install Commands */}
          <div className="space-y-4 mb-8">
            {/* APT Install */}
            <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <code className="text-[#00FF9F] font-mono text-sm md:text-base flex-1 text-left overflow-x-auto">
                  {aptCommand}
                </code>
                <button
                  onClick={() => copyToClipboard(aptCommand, "apt")}
                  className="p-2 hover:bg-[#333] rounded transition-colors flex-shrink-0"
                  aria-label="Copy APT install command"
                >
                  {copiedApt ? <Check className="w-5 h-5 text-[#00FF9F]" /> : <Copy className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            {/* NPM Install (alternative) */}
            <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between gap-4">
                <code className="text-[#00FF9F] font-mono text-sm md:text-base flex-1 text-left">
                  {npmCommand}
                </code>
                <button
                  onClick={() => copyToClipboard(npmCommand, "npm")}
                  className="p-2 hover:bg-[#333] rounded transition-colors flex-shrink-0"
                  aria-label="Copy NPM install command"
                >
                  {copiedNpm ? <Check className="w-5 h-5 text-[#00FF9F]" /> : <Copy className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <p className="text-yellow-500 text-sm">
              ⚠️ Review script/code before running; use sudo if needed.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pricing">
              <Button className="bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-semibold px-6 py-3">
                Register Free Core
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10 px-6 py-3">
                Upgrade to Pro
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-800 px-6 py-3">
                Get Team Plan
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
                <li><Link href="/getting-started" className="hover:text-[#00FF9F]">CLI Engine</Link></li>
                <li><Link href="/getting-started" className="hover:text-[#00FF9F]">Distro</Link></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="https://docs.cxlinux.com" className="hover:text-[#00FF9F]">Docs</a></li>
                <li><a href="https://docs.cxlinux.com/api" className="hover:text-[#00FF9F]">API Reference</a></li>
                <li><a href="https://github.com/cxlinux-ai/cx-core" className="hover:text-[#00FF9F]">GitHub</a></li>
              </ul>
            </div>
            {/* Commercial */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Commercial</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/pricing" className="hover:text-[#00FF9F]">Pricing</Link></li>
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
