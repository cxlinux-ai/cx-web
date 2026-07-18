import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { RotatingBorderCard, IconPlate } from "@/components/RotatingBorderCard";
import { Copy, Check, ArrowRight, Lock, Eye, Undo2, Shield } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { Button } from "@/components/ui/button";

type Tab = "curl" | "apt" | "npm";

const INSTALL: Record<Tab, { label: string; cmd: string }> = {
  curl: { label: "any linux",      cmd: "curl -fsSL cxlinux.com/install | sh" },
  apt:  { label: "ubuntu/debian",  cmd: "sudo apt install cx-terminal" },
  npm:  { label: "node.js",        cmd: "npm install -g cx-cli" },
};

export default function GettingStarted() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.gettingStarted);
    return cleanup;
  }, []);

  const [tab, setTab] = useState<Tab>("curl");
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(INSTALL[tab].cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen text-white">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(47,107,255,0.07)_0%,transparent_65%)]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="inline-flex items-center gap-2 rounded-full bg-[#2F6BFF]/[0.08] border border-[#2F6BFF]/20 px-3.5 py-1.5 text-[11px] text-[#7AA0FF] font-mono tracking-wider mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2F6BFF] animate-pulse" />
            Free to install · no account required
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-[4rem] font-bold mb-5 leading-[1.05] tracking-tight text-[#F3F5F7]"
          >
            Get Started in{" "}
            <span className="bg-gradient-to-r from-[#7AA0FF] to-[#B9CCFF] bg-clip-text text-transparent">
              60 Seconds
            </span>
            <br />
            with CX Linux
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-[#9CA3AF] text-lg mb-10 leading-relaxed max-w-xl mx-auto"
          >
            One command installs CX. Then you describe what you want done, patching, configs, deploys, log forensics, and it does it.
          </motion.p>

          {/* Install widget */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
            className="max-w-xl mx-auto rounded-xl bg-[#0F100E]/90 backdrop-blur-md border border-white/[0.1] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)]"
          >
            <div className="flex border-b border-white/[0.05]">
              {(Object.keys(INSTALL) as Tab[]).map((key) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 px-3 py-2.5 text-[11px] font-mono tracking-wider transition-colors ${
                      active
                        ? "text-[#7AA0FF] bg-[#2F6BFF]/[0.04] border-b border-[#2F6BFF]"
                        : "text-gray-500 hover:text-gray-300 border-b border-transparent"
                    }`}
                  >
                    {INSTALL[key].label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={copy}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors group"
            >
              <span className="text-gray-600 font-mono text-sm select-none flex-shrink-0">$</span>
              <code className="text-[#7AA0FF] font-mono text-sm flex-1 break-all">
                {INSTALL[tab].cmd}
              </code>
              {copied ? (
                <Check className="w-4 h-4 text-[#7AA0FF] flex-shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-gray-500 group-hover:text-gray-300 flex-shrink-0 transition-colors" />
              )}
            </button>
          </motion.div>

          {/* Trust chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            {["Works offline", "Rollback-safe", "SSH-native"].map((t) => (
              <span key={t} className="text-[11px] text-gray-500 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-[#2F6BFF]/50" />{t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Photo strip, devs at work ─────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-center">
            {/* Photo, different from homepage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-[4/3] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              <img
                src="https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=1600&q=85"
                alt="Developer working in a terminal"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 md:right-auto md:max-w-[280px] bg-black/70 backdrop-blur-md border border-white/[0.1] rounded-xl p-4">
                <p className="text-[13px] text-gray-200 leading-snug mb-2">
                  "Replaced a 200-line bash script with one prompt. Friday afternoon I'm back to actual work."
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">, SRE, Series B startup</p>
              </div>
            </motion.div>

            <div>
              <h2 className="text-2xl md:text-[2rem] font-bold mb-5 tracking-tight text-[#F3F5F7] leading-[1.15]">
                Built for people who already know Linux.
              </h2>
              <p className="text-[#9CA3AF] mb-5 leading-relaxed">
                CX isn't a chatbot wrapper. It generates real shell commands, shows them to you, and only runs what you approve. You stay in the loop, you just stop typing the boring parts.
              </p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-2 flex-shrink-0" />
                  <span>Every command previewed before execution, copy, edit, or reject</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-2 flex-shrink-0" />
                  <span>Local LLM by default, cloud models when you opt in</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1 h-1 rounded-full bg-[#2F6BFF] mt-2 flex-shrink-0" />
                  <span>Works alongside your dotfiles, aliases, and existing tooling</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Try these prompts (black highlight) ───────────────── */}
      <section className="relative py-20 px-4 bg-black border-y border-white/[0.05] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          {/* Different from homepage: fiber optic lights */}
          <img
            src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=2200&q=85"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
        </div>
        <div className="relative max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-[2rem] font-bold mb-3 tracking-tight text-[#F3F5F7]">
            Things people ask it on day one.
          </h2>
          <p className="text-gray-500 mb-10 max-w-md">
            Real prompts, no marketing fluff. Each one expands to 3–8 commands you can review.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "backup /data to s3 nightly, alert me on failure",
              "harden this server: ssh keys only, ufw, fail2ban",
              "find what's eating the disk in /var",
              "set up postgres with daily logical backups",
              "deploy this docker-compose with a let's encrypt cert",
              "tail journald for nginx errors in the last hour",
            ].map((cmd, i) => (
              <motion.div
                key={cmd}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-[#2F6BFF]/25 transition-colors p-4 flex items-start gap-3"
              >
                <span className="text-[#7AA0FF]/60 font-mono text-sm mt-0.5">❯</span>
                <code className="text-gray-200 font-mono text-[13px] leading-relaxed">{cmd}</code>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Safety with photo ──────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-2xl md:text-[2rem] font-bold mb-5 tracking-tight text-[#F3F5F7] leading-[1.15]">
                Production-safe out of the box.
              </h2>
              <p className="text-[#9CA3AF] mb-7 leading-relaxed">
                You wouldn't paste a script from a stranger. CX treats every command the same way, sandbox first, preview always, snapshot before, rollback ready.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Eye,    t: "Preview",  d: "Read the exact commands before they run." },
                  { icon: Lock,   t: "Sandbox",  d: "Firejail isolation for risky operations." },
                  { icon: Undo2,  t: "Rollback", d: "Filesystem snapshot before every change." },
                  { icon: Shield, t: "Audit",    d: "Every prompt and command logged locally." },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-lg bg-[#2F6BFF]/[0.08] border border-[#2F6BFF]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#7AA0FF]" />
                    </div>
                    <div>
                      <h3 className="text-[#F3F5F7] text-sm font-semibold mb-0.5">{t}</h3>
                      <p className="text-gray-500 text-[13px] leading-relaxed">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-[4/5] order-1 md:order-2 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]"
            >
              {/* Different from homepage: physical security/vault photo */}
              <img
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1400&q=85"
                alt="Security and privacy"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2">
                {["SOC2", "ISO 27001", "GDPR", "HIPAA"].map((b) => (
                  <span
                    key={b}
                    className="text-[10px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-[#2F6BFF]/30 text-[#7AA0FF]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA, shared rotating-border shell (matches homepage Final CTA) ─────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-white/[0.05] bg-[#08080A]">
        <div className="max-w-4xl mx-auto">
          <RotatingBorderCard
            patternId="gsCtaGrid"
            innerClassName="px-6 sm:px-10 md:px-14 py-14 md:py-16 text-center"
          >
            <div className="max-w-xl mx-auto">
              <div className="mb-6 flex justify-center">
                <IconPlate>
                  <ArrowRight className="w-6 h-6" />
                </IconPlate>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-[1.05] tracking-tight">
                Your terminal, smarter.
                <br />
                <span className="bg-gradient-to-r from-[#7AA0FF] to-[#B9CCFF] bg-clip-text text-transparent">
                  No subscription required.
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Free forever for personal use. Upgrade only if you need cloud AI or fleet management.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/pricing">
                  <Button className="group w-full sm:w-auto bg-[#2F6BFF] text-white hover:bg-[#2257E0] font-bold px-8 py-3.5 text-base shadow-[0_4px_14px_-6px_rgba(47,107,255,0.30),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.15)]">
                    See pricing <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </RotatingBorderCard>
        </div>
      </section>

      <Footer />
    </div>
  );
}
