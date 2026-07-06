import { useState, useRef } from "react";
import { Link } from "wouter";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Terminal,
  Copy,
  Check,
  Shield,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  Server,
  Lock,
  Eye,
  Undo2,
  FileText,
  Users,
  Building2,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  Sparkles,
  X,
  MessageCircle,
  Github,
  ShieldCheck,
} from "lucide-react";

import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import { FleetMetricsPanel } from "@/components/HomeIllustrations";
import { RotatingBorderCard } from "@/components/RotatingBorderCard";

// ============================================
// CX Linux - Admin-Focused Homepage
// ============================================

function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [scrub, setScrub] = useState<{ x: number; time: number } | null>(null);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
    if (v.buffered.length > 0)
      setBuffered((v.buffered.end(v.buffered.length - 1) / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const bar = progressRef.current;
    if (!v || !bar) return;
    const rect = bar.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const handleScrubMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setScrub({ x: e.clientX - rect.left, time: ratio * v.duration });
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <video
        ref={videoRef}
        onClick={togglePlay}
        className="w-full h-full block bg-black cursor-pointer"
        style={{ transform: "scale(1.35)", transformOrigin: "center 75%", objectFit: "cover" }}
        poster="/cx-distro-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={(e) => {
          const v = e.currentTarget;
          v.style.display = "none";
          const fb = v.nextElementSibling as HTMLElement | null;
          if (fb) fb.style.display = "flex";
        }}
      >
        <source src="/cx-distro.mp4" type="video/mp4" />
      </video>

      {/* Error fallback */}
      <div
        style={{ display: "none" }}
        className="w-full h-full items-center justify-center bg-[#0A0A0A] text-gray-500 text-sm text-center px-6"
        role="img"
        aria-label="Demo video unavailable"
      >
        Demo unavailable — install CX to see it in action.
      </div>

      {/* Gradient scrim */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, transparent 100%)",
        }}
      />

      {/* Controls panel — slides up on hover */}
      <div
        className="absolute inset-x-0 bottom-0 px-3 pb-3 pointer-events-none transition-all duration-300"
        style={{
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateY(0)" : "translateY(6px)",
        }}
      >
        <div className="bg-black/50 backdrop-blur-md border border-white/[0.08] rounded-xl px-3 pt-2 pb-2.5 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative w-full py-2 cursor-pointer group/bar"
            onClick={handleSeek}
            onMouseMove={handleScrubMove}
            onMouseLeave={() => setScrub(null)}
          >
            {/* Scrub time tooltip */}
            {scrub && (
              <div
                className="absolute -top-7 -translate-x-1/2 bg-[#111] border border-white/10 text-white/90 text-[10px] font-mono px-2 py-0.5 rounded-md pointer-events-none shadow-lg whitespace-nowrap z-10"
                style={{ left: scrub.x }}
              >
                {fmt(scrub.time)}
              </div>
            )}
            {/* Track */}
            <div className="w-full h-[3px] group-hover/bar:h-[4px] bg-white/10 rounded-full relative transition-all duration-150">
              {/* Buffered */}
              <div className="absolute inset-y-0 left-0 bg-white/15 rounded-full" style={{ width: `${buffered}%` }} />
              {/* Played */}
              <div className="absolute inset-y-0 left-0 bg-[#00FF9F] rounded-full transition-none" style={{ width: `${progress}%` }}>
                {/* Scrub handle */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[13px] h-[13px] bg-white rounded-full shadow-[0_0_8px_rgba(0,255,159,0.5)] scale-0 group-hover/bar:scale-100 transition-transform duration-150 origin-center" />
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-1.5">
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-px" />}
            </button>

            {/* Mute */}
            <button
              onClick={toggleMute}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Time */}
            <span className="text-[11px] font-mono tabular-nums ml-1 text-white/40">
              <span className="text-white/75">{fmt(currentTime)}</span>
              <span className="mx-1">/</span>
              {fmt(duration)}
            </span>

            <div className="flex-1" />

            {/* Fullscreen */}
            <button
              onClick={() => containerRef.current?.requestFullscreen?.()}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Fullscreen"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Centre play button when paused */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group pointer-events-auto"
        >
          <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 group-hover:border-[#00FF9F]/50 group-hover:bg-black/75 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-200">
            <Play className="w-6 h-6 text-white/90 group-hover:text-[#00FF9F] translate-x-0.5 transition-colors" />
          </div>
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  // SEO
  updateSEO(seoConfigs.home);

  const [copiedApt, setCopiedApt] = useState(false);
  const [copiedNpm, setCopiedNpm] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
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
      {/* Hero Section, WIFM: User outcome first */}
      <section className="relative min-h-[600px] flex flex-col justify-center px-4 py-16 md:py-24 overflow-hidden">
        {/* Real photo: dark server room (Unsplash, Taylor Vick) */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.45]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E1E1E]/70 via-[#1E1E1E]/60 to-[#1E1E1E]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(0,255,159,0.08)_0%,transparent_65%)]" />
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.8" fill="#00FF9F" fillOpacity="0.12" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1E1E1E]" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#00FF9F]/10 border border-[#00FF9F]/25">
            <Sparkles className="w-3 h-3 text-[#00FF9F]" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#00FF9F]">Preview · Approve · Rollback</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Stop Googling Linux Commands.
            <br />
            <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">Just Tell CX What You Need.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            Set up servers, configure firewalls, deploy apps, in plain English.
            <br className="hidden md:block" />
            CX handles the commands. You stay in control.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Works on Ubuntu, Debian, RHEL, and Arch. Free forever for personal use. No credit card required.
          </p>

          {/* Hero demo video */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0A0A0A] border border-[#333] rounded-xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] aspect-video">
              <VideoPlayer />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/getting-started">
              <Button className="bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-semibold px-8 py-3 text-base">
                Install in 60s, free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10 px-8 py-3 text-base">
                See pricing
              </Button>
            </Link>
          </div>

          {/* Trust strip, only verifiable facts (Discord, source-available, version, GitHub) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-gray-500">
            <a
              href="https://discord.gg/7K6TR7qtS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#00FF9F] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#00FF9F]" />
              <span><span className="text-gray-300 font-medium">2,400+</span> engineers in Discord</span>
            </a>
            <span className="text-gray-700">·</span>
            <a
              href="https://github.com/cxlinux-ai/cx-core"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-[#00FF9F] transition-colors"
            >
              <Github className="w-3.5 h-3.5 text-[#00FF9F]" />
              <span>Source-available (BSL 1.1)</span>
            </a>
            <span className="text-gray-700">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF9F]" />
              <span>Sandboxed · previewed · reversible</span>
            </span>
          </div>
        </div>
      </section>

      {/* Fleet dashboard showcase */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-white/[0.05]">
        {/* Cinematic depth: radial + mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_60%_50%,rgba(0,255,159,0.04)_0%,transparent_65%)]" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00FF9F" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-[#1E1E1E] via-transparent to-[#1E1E1E]/60" />
        </div>

        {/* 42 / 58 asymmetric split */}
        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          {/* Left, 42% */}
          <div className="w-full md:w-[42%] order-2 md:order-1 flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-6 rounded-md bg-[#00FF9F]/[0.08] border border-[#00FF9F]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF9F]" />
              <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-[#00FF9F]">One brain, your whole fleet</span>
            </div>
            <h2 className="text-[2rem] md:text-[2.4rem] font-bold mb-4 leading-[1.1] tracking-[-0.01em] text-[#F3F5F7]">
              One prompt.
              <br />
              <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">Every server.</span>
            </h2>
            <p className="text-[#9CA3AF] text-base mb-7 leading-relaxed max-w-sm">
              Works on Ubuntu, Debian, RHEL, Arch—any Linux distro you SSH into.
            </p>
            <Link href="/getting-started">
              <Button
                className="bg-[#00FF9F] text-black hover:bg-[#00E090] font-semibold rounded-[10px] px-5 py-2.5 text-sm h-auto"
              >
                Install in 60s, free <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Right, 58% */}
          <div className="w-full md:w-[58%] order-1 md:order-2">
            <FleetMetricsPanel />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              How It{" "}
              <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-gray-500">From English to executed, in seconds.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-[4.5rem] left-[calc(33.33%+1.25rem)] right-[calc(33.33%+1.25rem)] h-px bg-gradient-to-r from-[#00FF9F]/20 via-[#00FF9F]/50 to-[#00FF9F]/20" />

            {/* Step 1 */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#00FF9F]/10 border border-[#00FF9F]/20 flex items-center justify-center mb-5">
                <span className="text-[#00FF9F] font-black text-sm">1</span>
              </div>
              <div className="bg-black/60 border border-[#1E1E1E] rounded-xl p-4 font-mono text-sm mb-5 h-[82px] flex items-center">
                <span className="text-[#00FF9F]">$</span>
                <span className="text-gray-400"> cx </span>
                <span className="text-white">"set up nginx"</span>
                <span className="ml-0.5 inline-block w-[7px] h-[15px] bg-[#00FF9F] animate-pulse rounded-sm" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">Describe the task</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Plain English. No man pages, no Stack Overflow, no syntax to memorize.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#00FF9F]/10 border border-[#00FF9F]/20 flex items-center justify-center mb-5">
                <span className="text-[#00FF9F] font-black text-sm">2</span>
              </div>
              <div className="bg-black/60 border border-[#1E1E1E] rounded-xl p-4 font-mono text-xs mb-5 h-[82px] space-y-1.5 overflow-hidden">
                <div className="text-gray-600 mb-1.5">CX will run:</div>
                <div className="text-[#00FF9F]">$ sudo apt install nginx</div>
                <div className="text-[#00FF9F]">$ sudo tee /etc/nginx/...</div>
                <div className="text-[#00FF9F]">$ sudo systemctl reload</div>
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">Review commands</h3>
              <p className="text-gray-500 text-sm leading-relaxed">See exactly what will run before anything happens. You're always in control.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl bg-[#00FF9F]/10 border border-[#00FF9F]/20 flex items-center justify-center mb-5">
                <span className="text-[#00FF9F] font-black text-sm">3</span>
              </div>
              <div className="bg-black/60 border border-[#1E1E1E] rounded-xl p-4 font-mono text-xs mb-5 h-[82px] space-y-1.5">
                <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-gray-400">nginx installed</span></div>
                <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-gray-400">config written</span></div>
                <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-gray-400">test: syntax ok</span></div>
                <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-[#00FF9F] font-semibold">done in 8s</span></div>
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">Approve & ship</h3>
              <p className="text-gray-500 text-sm leading-relaxed">One keystroke runs it all. Instant rollback available if anything goes wrong.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Security */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Real photo: cybersecurity / circuit board (Unsplash, Michael Dziedzic) */}
        <div className="pointer-events-none absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#1E1E1E] via-[#1E1E1E]/90 to-[#1E1E1E]/70" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: real photo, padlock on binary code (Unsplash, FLY:D) */}
            <div className="order-2 md:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1400&q=85"
                  alt="Encrypted command execution"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#00FF9F]/[0.05] via-transparent to-black/40" />

                {/* Floating compliance badges */}
                <div className="absolute top-5 left-5 flex flex-wrap gap-2 max-w-[80%]">
                  {["SOC2 Type II", "ISO 27001", "GDPR", "HIPAA"].map((b) => (
                    <span
                      key={b}
                      className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-black/70 backdrop-blur-md border border-[#00FF9F]/25 text-[#00FF9F]"
                    >
                      {b}
                    </span>
                  ))}
                </div>

                {/* Bottom info card */}
                <div className="absolute bottom-5 left-5 right-5 bg-black/70 backdrop-blur-md border border-white/[0.08] rounded-xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00FF9F]/10 border border-[#00FF9F]/25 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-[#00FF9F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">Zero-trust execution</div>
                      <div className="text-gray-400 text-xs">Sandboxed · previewed · audited · reversible</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -inset-6 bg-[#00FF9F]/[0.05] blur-3xl rounded-3xl -z-10" />
            </div>

            {/* Right: feature cards */}
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-[#00FF9F]/10 border border-[#00FF9F]/20">
                <Shield className="w-3 h-3 text-[#00FF9F]" />
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#00FF9F]">Zero-trust by default</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
                Built for{" "}
                <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">secure</span>{" "}
                operations.
              </h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Every command runs in a sandbox, previewed before execution, rollback-ready,
                and fully audited, so your auditors and your blast radius both stay small.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Lock, title: "Firejail Sandboxing", desc: "Every command runs in an isolated execution environment, never touching what it shouldn't." },
                  { icon: Eye, title: "Preview Before Execute", desc: "See the full command list before anything runs. No surprises, no accidents." },
                  { icon: Undo2, title: "Atomic Rollbacks", desc: "Made a mistake? Undo any change instantly with a single keystroke." },
                  { icon: FileText, title: "Full Audit Logs", desc: "Complete command history with timestamps, user, and output for every action." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-[#0D0D0D]/80 backdrop-blur border border-[#2A2A2A] rounded-xl hover:border-[#00FF9F]/30 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#00FF9F]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-[#00FF9F]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1 text-sm">{item.title}</h3>
                      <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/pricing">
                <Button variant="outline" className="border-[#00FF9F] text-[#00FF9F] hover:bg-[#00FF9F]/10">
                  See pricing <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Risk reversal, the CX Promise */}
          <div className="mt-16 relative overflow-hidden rounded-2xl border border-[#00FF9F]/25 bg-gradient-to-br from-[#00FF9F]/[0.06] via-[#0D0D0D]/80 to-[#0D0D0D]/80 p-6 md:p-8">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-[radial-gradient(ellipse_at_center,rgba(0,255,159,0.18)_0%,transparent_70%)] blur-2xl pointer-events-none" />
            <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#00FF9F]/15 border border-[#00FF9F]/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-7 h-7 text-[#00FF9F]" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2">The CX Promise</h3>
                <p className="text-gray-300 leading-relaxed">
                  CX will never run a command without your explicit approval. Every action is sandboxed, previewed, and reversible.
                  If our cloud-powered Pro plan doesn't save you time in your first 14 days, we'll refund every dollar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Pricing */}
      <section className="py-20 px-4 bg-[#080808]">
        <div className="max-w-[1180px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
              Simple{" "}
              <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">Transparent</span>{" "}
              Pricing
            </h2>
            <p className="text-gray-400 mb-3">Start free, scale as you grow. All paid plans include a 14-day free trial.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00FF9F]/[0.06] border border-[#00FF9F]/20">
              <Clock className="w-3 h-3 text-[#00FF9F]" />
              <span className="text-xs text-gray-300">
                <span className="font-semibold text-[#00FF9F]">Beta pricing locked</span> through public launch, annual plans rate-lock for 12 months.
              </span>
            </div>
          </div>

          {/* Billing toggle */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.05] border border-white/[0.08]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${billingCycle === "monthly" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${billingCycle === "annual" ? "bg-white text-black shadow-sm" : "text-gray-400"}`}
              >
                Annual
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${billingCycle === "annual" ? "bg-[#00FF9F] text-black" : "bg-[#00FF9F]/20 text-[#00FF9F]"}`}>
                  2 months free
                </span>
              </button>
            </div>
          </div>

          <PricingCards isAnnual={billingCycle === "annual"} />
        </div>
      </section>

      {/* Final CTA, split-card design with animated border, copyable install command, and trust bar */}
      <section className="relative py-24 px-4 overflow-hidden bg-[#1E1E1E]">
        <div className="max-w-6xl mx-auto">
          <RotatingBorderCard patternId="homeFinalCtaGrid" innerClassName="px-6 sm:px-10 md:px-14 py-14 md:py-16">
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-center">
              {/* Left: copy + CTAs */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#00FF9F]/10 border border-[#00FF9F]/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                  <Sparkles className="w-3 h-3 text-[#00FF9F]" />
                  <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#00FF9F]">60-second install</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-5 leading-[1.05] tracking-tight">
                  Take back your{" "}
                  <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">weekends.</span>
                </h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Stop typing the same commands at 2am. Let CX handle the toil so you can focus on the work that actually moves things forward.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Link href="/getting-started">
                    <Button className="group w-full sm:w-auto bg-[#00FF9F] text-black hover:bg-[#00CC7F] font-bold px-8 py-3.5 text-base shadow-[0_4px_14px_-6px_rgba(0,255,159,0.30),inset_0_1px_0_rgba(255,255,255,0.20),inset_0_-1px_0_rgba(0,0,0,0.15)]">
                      <span className="flex items-center">
                        Install CX free
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:border-[#00FF9F]/40 hover:text-white px-8 py-3.5 text-base font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    >
                      Compare plans
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                  {["Free forever for personal use", "No credit card required", "Cancel anytime"].map((t, i, arr) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#00FF9F]" />
                      <span>{t}</span>
                      {i < arr.length - 1 && <span className="text-gray-700 ml-3">·</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: terminal install preview */}
              <div className="relative">
                <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="bg-gradient-to-b from-[#161616] to-[#0F0F0F] border-b border-white/[0.05] px-4 py-2.5 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-[11px] text-gray-500 ml-2 font-mono">install.sh</span>
                    <span className="ml-auto text-[10px] text-gray-600 font-mono">~ 60s</span>
                  </div>
                  <div className="p-5 font-mono text-[13px] space-y-4">
                    <div>
                      <div className="text-gray-600 text-[11px] mb-2"># One line. Any Linux. No dependencies.</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("curl -fsSL cxlinux.com/install | sh");
                          setCopiedInstall(true);
                          setTimeout(() => setCopiedInstall(false), 2000);
                        }}
                        className="flex items-center gap-2 bg-black/50 border border-white/[0.06] hover:border-[#00FF9F]/30 rounded-lg p-3 w-full text-left transition-colors group"
                      >
                        <span className="text-gray-600 select-none">$</span>
                        <code className="text-[#00FF9F] flex-1 break-all text-xs sm:text-[13px]">
                          curl -fsSL cxlinux.com/install | sh
                        </code>
                        {copiedInstall ? (
                          <Check className="w-3.5 h-3.5 text-[#00FF9F] flex-shrink-0" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 flex-shrink-0 transition-colors" />
                        )}
                      </button>
                    </div>
                    <div className="space-y-1.5 text-[11.5px]">
                      <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-gray-400">Downloaded cx-cli (4.2 MB)</span></div>
                      <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-gray-400">Signature verified</span></div>
                      <div className="flex gap-2"><span className="text-[#00FF9F]">✓</span><span className="text-gray-400">Installed to /usr/local/bin</span></div>
                      <div className="flex gap-2 pt-1">
                        <span className="text-[#00FF9F]">▶</span>
                        <span className="text-[#00FF9F] font-semibold">Try: cx "what's eating my disk?"</span>
                        <motion.span
                          className="inline-block w-1.5 h-3.5 bg-[#00FF9F] align-middle"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>

                    {/* Why is curl | sh safe?, addresses the biggest install anxiety */}
                    <details className="group pt-2 -mx-1">
                      <summary className="cursor-pointer flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-[#00FF9F] transition-colors select-none">
                        <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                        Why is <code className="text-gray-400">curl | sh</code> safe here?
                      </summary>
                      <div className="mt-2 ml-4 text-[11px] text-gray-500 leading-relaxed space-y-1.5">
                        <div>· Script is served over HTTPS from <code className="text-gray-400">cxlinux.com</code></div>
                        <div>· Binary signature is verified before install</div>
                        <div>· You can <a href="https://github.com/cxlinux-ai/cx-core" target="_blank" rel="noopener noreferrer" className="text-[#00FF9F] hover:underline">read the source on GitHub</a> first</div>
                        <div>· Prefer not to pipe? <Link href="/getting-started"><a className="text-[#00FF9F] hover:underline">See manual install →</a></Link></div>
                      </div>
                    </details>
                  </div>
                </div>
                <div className="pointer-events-none absolute -inset-4 bg-[#00FF9F]/[0.06] blur-3xl rounded-3xl -z-10" />
              </div>
            </div>
          </RotatingBorderCard>
        </div>
      </section>

      <Footer />

      {/* Mobile-only sticky CTA, primary action always reachable on small screens */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-[#0A0A0A]/80 backdrop-blur-md border-t border-[#00FF9F]/20">
        <div className="px-4 py-3">
          <Link href="/getting-started">
            <a className="flex items-center justify-center gap-2 w-full bg-[#00FF9F] text-black font-bold py-3 rounded-xl text-sm shadow-[0_0_24px_rgba(0,255,159,0.25)]">
              Install in 60s, free
              <ArrowRight className="w-4 h-4" />
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
