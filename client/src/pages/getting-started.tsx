import { useEffect, useState } from "react";
import { Link } from "wouter";
import { 
  Terminal, 
  Cpu, 
  Download,
  Shield,
  Code,
  Database,
  Zap,
  Monitor,
  Copy,
  Check,
  ChevronRight,
  Server,
  Lock,
  Eye,
  Undo2,
} from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export default function GettingStarted() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.gettingStarted);
    return cleanup;
  }, []);

  const [copiedApt, setCopiedApt] = useState(false);
  const [copiedNpm, setCopiedNpm] = useState(false);

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

  const prerequisites = [
    { text: "64-bit x86 processor (AMD64/Intel)", icon: Cpu },
    { text: "8GB RAM minimum (16GB recommended)", icon: Database },
    { text: "50GB free disk space", icon: Monitor },
    { text: "NVIDIA GPU with CUDA (optional)", icon: Zap },
  ];

  const cliExamples = [
    { cmd: 'cx "backup /data to s3"', desc: "Automate backups" },
    { cmd: 'cx "configure nginx with SSL"', desc: "Server setup" },
    { cmd: 'cx "set up firewall rules"', desc: "Security config" },
    { cmd: 'cx "analyze logs for errors"', desc: "Log analysis" },
    { cmd: 'cx "install monitoring stack"', desc: "DevOps tools" },
    { cmd: 'cx "detect hardware inventory"', desc: "Fleet management" },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF9F]/10 border border-[#00FF9F]/30 rounded-full mb-6">
            <Terminal className="w-4 h-4 text-[#00FF9F]" />
            <span className="text-[#00FF9F] text-sm font-medium">CX Terminal</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Get Started with <span className="text-[#00FF9F]">CX Linux</span>
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Install CX Terminal and start managing your Linux servers with natural language commands.
          </p>
        </div>
      </section>

      {/* Install Commands */}
      <section className="py-12 px-4 bg-[#161616]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Download className="w-6 h-6 text-[#00FF9F]" />
            Quick Install
          </h2>

          <div className="space-y-4">
            {/* APT */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Ubuntu/Debian (APT):</p>
              <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-[#00FF9F] font-mono text-sm flex-1 overflow-x-auto">
                    {aptCommand}
                  </code>
                  <button
                    onClick={() => copyToClipboard(aptCommand, "apt")}
                    className="p-2 hover:bg-[#333] rounded transition-colors flex-shrink-0"
                    aria-label="Copy APT command"
                  >
                    {copiedApt ? <Check className="w-5 h-5 text-[#00FF9F]" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* NPM */}
            <div>
              <p className="text-sm text-gray-400 mb-2">CLI via npm:</p>
              <div className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="text-[#00FF9F] font-mono text-sm flex-1">
                    {npmCommand}
                  </code>
                  <button
                    onClick={() => copyToClipboard(npmCommand, "npm")}
                    className="p-2 hover:bg-[#333] rounded transition-colors flex-shrink-0"
                    aria-label="Copy npm command"
                  >
                    {copiedNpm ? <Check className="w-5 h-5 text-[#00FF9F]" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-yellow-500 text-sm">
              ⚠️ Review script/code before running; use sudo if needed.
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Server className="w-6 h-6 text-[#00FF9F]" />
            System Requirements
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {prerequisites.map((req, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
                <req.icon className="w-5 h-5 text-[#00FF9F] flex-shrink-0" />
                <span className="text-gray-300 text-sm">{req.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLI Examples */}
      <section className="py-12 px-4 bg-[#161616]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Code className="w-6 h-6 text-[#00FF9F]" />
            Example Commands
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {cliExamples.map((ex, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4">
                <code className="text-[#00FF9F] font-mono text-sm block mb-2">{ex.cmd}</code>
                <p className="text-gray-500 text-sm">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#00FF9F]" />
            Built-in Security
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Lock, title: "Firejail Sandboxing", desc: "Isolated execution" },
              { icon: Eye, title: "Preview Commands", desc: "Review before running" },
              { icon: Undo2, title: "Atomic Rollbacks", desc: "Instant undo" },
              { icon: Shield, title: "Audit Logs", desc: "Full history" },
            ].map((item, i) => (
              <div key={i} className="bg-[#0D0D0D] border border-[#333] rounded-lg p-4 flex items-start gap-3">
                <item.icon className="w-5 h-5 text-[#00FF9F] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-[#161616]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8">
            Sign up for free and start managing your servers with AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pricing">
              <Button className="bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-semibold px-6 py-3">
                Register Free Core <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <a href="https://docs.cxlinux.com" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-[#333] text-white hover:bg-[#333] px-6 py-3">
                Read Docs
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
