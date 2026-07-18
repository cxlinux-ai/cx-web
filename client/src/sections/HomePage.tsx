import { useState, useRef, useEffect, ReactNode } from "react";
import { Link } from "wouter";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { updateSEO, seoConfigs } from "@/lib/seo";
import {
  Copy,
  Check,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Users,
  Timer,
  Eye,
  Undo2,
  Server,
  Shield,
  Rocket,
  Activity,
  Network,
  FileText,
  Terminal,
  CheckCircle,
} from "lucide-react";
import { FaDiscord, FaReddit } from "react-icons/fa";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import { FleetMetricsPanel } from "@/components/HomeIllustrations";

// ============================================
// CX Linux — homepage
// Structure: full-width alternating bands (baier-transport pattern) —
// hero band with action card, marquee strip, icon stats bar, staggered
// card grids, circle-step walkthrough, split feature, gradient CTA banner.
// ============================================

/* ── Live terminal demo ──────────────────────────────────────────────────── */

type TermLine = {
  text: string;
  cls?: string;
  prompt?: boolean;
  typed?: boolean;
  pause?: number;
};

const SCENARIOS: TermLine[][] = [
  [
    { text: 'cx "set up nginx with tls for api.acme.dev"', prompt: true, typed: true },
    { text: "plan — 3 commands · 1 config write", cls: "text-white/40", pause: 500 },
    { text: "  1  apt-get install -y nginx", cls: "text-white/75", pause: 210 },
    { text: "  2  certbot --nginx -d api.acme.dev", cls: "text-white/75", pause: 210 },
    { text: "  3  systemctl reload nginx", cls: "text-white/75", pause: 210 },
    { text: "run plan? [y/N] y", cls: "text-white/40", pause: 900 },
    { text: "✓ done in 8.2s — rollback point saved", cls: "text-[#4ade80]", pause: 600 },
  ],
  [
    { text: 'cx "what is eating my disk?"', prompt: true, typed: true },
    { text: "/var/log/journal      4.1 GB   61%", cls: "text-white/75", pause: 420 },
    { text: "/var/cache/apt        1.2 GB   18%", cls: "text-white/75", pause: 240 },
    { text: "suggest: journalctl --vacuum-size=500M", cls: "text-white/40", pause: 700 },
    { text: "run suggestion? [y/N] y", cls: "text-white/40", pause: 900 },
    { text: "✓ freed 3.6 GB", cls: "text-[#4ade80]", pause: 600 },
  ],
  [
    { text: 'cx "patch openssl across the fleet"', prompt: true, typed: true },
    { text: "fleet — 12 servers reachable", cls: "text-white/40", pause: 500 },
    { text: "web-01 … web-08        ✓ patched", cls: "text-white/75", pause: 420 },
    { text: "db-01 … db-04          ✓ patched", cls: "text-white/75", pause: 420 },
    { text: "✓ fleet consistent — 0 drift", cls: "text-[#4ade80]", pause: 600 },
  ],
];

function TerminalDemo() {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [partial, setPartial] = useState<string | null>(null);
  const [scenario, setScenario] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLines(SCENARIOS[0]);
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(window.setTimeout(res, ms));
      });

    (async () => {
      const script = SCENARIOS[scenario];
      setLines([]);
      setPartial(null);
      await wait(650);

      for (const line of script) {
        if (cancelled) return;
        if (line.typed) {
          for (let i = 1; i <= line.text.length; i++) {
            if (cancelled) return;
            setPartial(line.text.slice(0, i));
            await wait(26);
          }
          await wait(340);
          setPartial(null);
          setLines((prev) => [...prev, line]);
        } else {
          await wait(line.pause ?? 300);
          if (cancelled) return;
          setLines((prev) => [...prev, line]);
        }
      }

      await wait(2800);
      if (!cancelled) setScenario((s) => (s + 1) % SCENARIOS.length);
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [scenario]);

  return (
    <div className="cx-term w-full" aria-hidden>
      <div className="cx-term-head">
        <span className="cx-term-dot" />
        <span className="cx-term-dot" />
        <span className="cx-term-dot" />
        <span className="cx-term-title">cx — ssh root@prod-web-01</span>
        <span className="ml-auto flex items-center gap-2">
          <span className="cx-dot-ok" />
          <span className="cx-term-title !ml-0">live</span>
        </span>
      </div>
      <div className="cx-term-body">
        {lines.map((l, i) => (
          <div key={i} className={l.cls ?? "text-white"}>
            {l.prompt && <span className="text-[#7AA0FF]">$ </span>}
            {l.text}
          </div>
        ))}
        {partial !== null ? (
          <div className="text-white">
            <span className="text-[#7AA0FF]">$ </span>
            {partial}
            <span className="cx-caret" />
          </div>
        ) : (
          <div>
            <span className="text-[#7AA0FF]">$ </span>
            <span className="cx-caret" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Demo video player (existing capture) ────────────────────────────────── */

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
        style={{ objectFit: "contain" }}
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
        className="w-full h-full items-center justify-center bg-[#0a0a0d] text-gray-500 text-sm text-center px-6"
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
        <div className="bg-black/50 backdrop-blur-md border border-white/[0.08] rounded-lg px-3 pt-2 pb-2.5 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative w-full py-2 cursor-pointer group/bar"
            onClick={handleSeek}
            onMouseMove={handleScrubMove}
            onMouseLeave={() => setScrub(null)}
          >
            {scrub && (
              <div
                className="absolute -top-7 -translate-x-1/2 bg-[#0e0e12] border border-white/10 text-white/90 text-[10px] font-mono px-2 py-0.5 rounded-md pointer-events-none shadow-lg whitespace-nowrap z-10"
                style={{ left: scrub.x }}
              >
                {fmt(scrub.time)}
              </div>
            )}
            <div className="w-full h-[3px] group-hover/bar:h-[4px] bg-white/10 rounded-full relative transition-all duration-150">
              <div className="absolute inset-y-0 left-0 bg-white/15 rounded-full" style={{ width: `${buffered}%` }} />
              <div className="absolute inset-y-0 left-0 bg-[#2F6BFF] rounded-full transition-none" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[13px] h-[13px] bg-white rounded-full shadow-[0_0_8px_rgba(47,107,255,0.5)] scale-0 group-hover/bar:scale-100 transition-transform duration-150 origin-center" />
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={togglePlay}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 translate-x-px" />}
            </button>

            <button
              onClick={toggleMute}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] font-mono tabular-nums ml-1 text-white/40">
              <span className="text-white/75">{fmt(currentTime)}</span>
              <span className="mx-1">/</span>
              {fmt(duration)}
            </span>

            <div className="flex-1" />

            <button
              onClick={() => containerRef.current?.requestFullscreen?.()}
              className="w-7 h-7 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-all"
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
          <div className="w-16 h-16 rounded-full bg-black/55 backdrop-blur-sm border border-white/15 group-hover:border-[#2F6BFF]/60 group-hover:bg-black/75 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all duration-200">
            <Play className="w-6 h-6 text-white/90 group-hover:text-[#7AA0FF] translate-x-0.5 transition-colors" />
          </div>
        </button>
      )}
    </div>
  );
}

/* ── Section scaffolding (baier band pattern) ────────────────────────────── */

type BandVariant = "plain" | "soft" | "elevated";

const BAND_STYLES: Record<BandVariant, string> = {
  plain: "bg-transparent",
  soft: "bg-[#0c0c0f]",
  elevated: "bg-[#0e0e12] border-y border-white/[0.08]",
};

function Section({
  title,
  subtitle,
  background = "plain",
  id,
  children,
}: {
  title?: string;
  subtitle?: string;
  background?: BandVariant;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`py-16 md:py-24 ${BAND_STYLES[background]}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="text-center mb-12 md:mb-16">
            {title && (
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg text-white/55 max-w-2xl mx-auto">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

const INSTALL_CMD = "curl -fsSL cxlinux.com/install | sh";

function CopyCmd({ light = false }: { light?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`cx-cmd ${light ? "!border-white/30 hover:!border-white/60" : ""}`}
      onClick={() => {
        navigator.clipboard.writeText(INSTALL_CMD);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      aria-label="Copy install command"
    >
      <span className="cx-cmd-prompt">$</span>
      <span>{INSTALL_CMD}</span>
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#4ade80]" />
      ) : (
        <Copy className="w-3.5 h-3.5 opacity-50" />
      )}
    </button>
  );
}

/* ── Content data ────────────────────────────────────────────────────────── */

const TRUST_BADGES = [
  { label: "Sandboxed & reversible", icon: ShieldCheck },
  { label: "60-second install", icon: Timer },
  { label: "2,400+ engineers", icon: Users },
  { label: "Free for personal use", icon: BadgeCheck },
];

const STATS = [
  { value: 2400, format: (n: number) => `${n.toLocaleString("en-US")}+`, label: "Engineers in Discord", icon: Users },
  { value: 60, format: (n: number) => `${n} s`, label: "Median Install Time", icon: Timer },
  { value: 100, format: (n: number) => `${n} %`, label: "Previewed Before Run", icon: Eye },
  { value: 1, format: (n: number) => `${n} key`, label: "Atomic Rollback", icon: Undo2 },
];

/* Count-up number that animates when scrolled into view. */
function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setN(value);
      return;
    }
    const t0 = performance.now();
    const dur = 1300;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return <span ref={ref}>{format(n)}</span>;
}

const SERVICES = [
  {
    icon: Server,
    title: "Server Setup",
    description: "Provision nginx, Postgres, Docker, anything — described in a sentence, configured in seconds.",
  },
  {
    icon: Shield,
    title: "Security & Firewalls",
    description: "Harden SSH, configure ufw and iptables, rotate keys — with a preview of every rule before it applies.",
  },
  {
    icon: Rocket,
    title: "Deployments",
    description: "Ship apps, wire up CI runners, and roll a bad release back with a single keystroke.",
  },
  {
    icon: Activity,
    title: "Diagnostics",
    description: "“Why is disk at 94%?” CX finds the culprit, explains it, and suggests the fix.",
  },
  {
    icon: Network,
    title: "Fleet Operations",
    description: "Patch and configure every server you can SSH into — from one prompt, with per-host results.",
  },
  {
    icon: FileText,
    title: "Audit & Rollback",
    description: "Every action logged with user, timestamp, and output. Every change reversible.",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Describe the task",
    description:
      "Plain English, straight into your terminal. No man pages, no Stack Overflow tabs, no syntax to memorize.",
    icon: Terminal,
  },
  {
    number: "2",
    title: "Review the plan",
    description:
      "CX shows the exact command list before anything touches the machine. No surprises, no accidents.",
    icon: Eye,
  },
  {
    number: "3",
    title: "Approve & ship",
    description:
      "One keystroke runs it all, sandboxed and logged. Anything goes sideways — one keystroke rolls it back.",
    icon: CheckCircle,
  },
];

const FLEET_BULLETS = [
  "Any distro you can SSH into — Ubuntu, Debian, RHEL, Arch, and more",
  "Per-host previews and results, one prompt for the whole fleet",
  "Zero drift: every server ends up in the same verified state",
  "Rollback points saved on every host, every run",
];

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const gridItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function HomePage() {
  updateSEO(seoConfigs.home);

  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const { scrollYProgress } = useScroll();
  const progressX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });

  return (
    <div className="min-h-screen text-white">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left bg-gradient-to-r from-[#2F6BFF] via-[#5B8CFF] to-[#7AA0FF]"
        style={{ scaleX: progressX }}
        aria-hidden
      />
      {/* ── Hero band — split layout, terminal action card ── */}
      <section className="relative overflow-hidden bg-[#0e0e12]">
        {/* Background: product capture, heavily darkened */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <img
            src="/cx-distro-poster.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/85 to-[#08080a]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            {/* Left column — 60% */}
            <div className="lg:col-span-3 cx-hero-in">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Stop Googling
                <br />
                Linux commands.
                <br />
                <span className="text-[#7AA0FF] cx-text-glow">Just tell CX.</span>
              </h1>
              <p className="mt-6 text-lg text-white/70 max-w-lg leading-relaxed">
                Describe what you need in plain English. CX plans the exact
                commands, shows you everything before it runs, and rolls back
                with one keystroke.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/getting-started" className="cx-btn cx-btn-primary cx-btn-lg">
                  Install in 60 seconds
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <CopyCmd />
              </div>

              {/* Trust badges */}
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
                {TRUST_BADGES.map((badge) => (
                  <div key={badge.label} className="flex items-center gap-1.5">
                    <badge.icon className="w-4 h-4 text-[#7AA0FF]" />
                    <span className="text-sm font-medium text-white/80">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — 40% */}
            <div className="lg:col-span-2 cx-rise-late">
              <div className="cx-float">
                <TerminalDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-[#0c0c0f] border-y border-white/[0.08] py-4">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-2"
            variants={gridContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={gridItem}
                className="flex flex-col items-center text-center px-4 py-6"
              >
                <div className="cx-breathe flex items-center justify-center w-12 h-12 rounded-xl bg-[#2F6BFF]/10 text-[#7AA0FF] mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight tabular-nums">
                  <CountUp value={stat.value} format={stat.format} />
                </div>
                <div className="mt-1 text-sm text-white/50 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Services grid ── */}
      <Section
        title="What CX Handles For You"
        subtitle="One tool for the whole job — from a fresh VPS to a hardened, audited fleet."
      >
        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={gridContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          {SERVICES.map((service) => (
            <motion.div key={service.title} variants={gridItem}>
              <Link
                href="/getting-started"
                className="cx-card group flex h-full flex-col p-6"
              >
                <div className="cx-icon-tile mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#2F6BFF]/12">
                  <service.icon className="h-5 w-5 text-[#7AA0FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/50">
                  {service.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-[#7AA0FF]">
                  Learn more
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ── How it works ── */}
      <Section
        background="soft"
        title="How It Works"
        subtitle="Three simple steps from plain English to executed — and reversible."
      >
        <div className="relative mt-4">
          {/* Connecting line — draws itself in on scroll */}
          <motion.div
            className="absolute left-1/2 top-8 hidden h-0.5 w-[calc(66%-120px)] -translate-x-1/2 origin-left bg-gradient-to-r from-[#2F6BFF]/15 via-[#2F6BFF]/45 to-[#2F6BFF]/15 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                className="relative text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
              >
                <div className="cx-ring relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2F6BFF] text-white shadow-[0_10px_30px_rgba(47,107,255,0.35)]">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-[#08080a] shadow">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50 max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Demo video ── */}
      <Section
        title="See It Run"
        subtitle="A real session — from question to fixed, in under a minute."
      >
        <motion.div
          className="cx-panel overflow-hidden aspect-video max-w-4xl mx-auto shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <VideoPlayer />
        </motion.div>
      </Section>

      {/* ── Fleet split section ── */}
      <Section background="soft">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              One Prompt. Every Server.
            </h2>
            <p className="mt-4 text-lg text-white/55">
              Based anywhere, reaching everywhere. CX runs on any box you can
              SSH into and keeps the whole fleet consistent — patches,
              configs, and diagnostics from a single line of English.
            </p>
            <ul className="mt-6 space-y-3 text-white/55">
              {FLEET_BULLETS.map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2F6BFF]" />
                  {item}
                </motion.li>
              ))}
            </ul>
            <Link
              href="/getting-started"
              className="cx-btn cx-btn-primary cx-btn-lg mt-8"
            >
              Connect Your Fleet
              <ArrowRight className="ml-1 w-5 h-5" />
            </Link>
          </div>
          <motion.div
            className="cx-panel overflow-hidden p-2"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <FleetMetricsPanel />
          </motion.div>
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section
        id="pricing"
        title="Simple, Transparent Pricing"
        subtitle="Start free, scale as you grow. All paid plans include a 14-day free trial."
      >
        {/* Billing toggle */}
        <div className="flex justify-center mb-12 -mt-4">
          <div className="flex items-center border border-white/[0.13] rounded-lg overflow-hidden">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 h-10 text-sm font-semibold transition-colors ${
                billingCycle === "monthly" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Monthly
            </button>
            <div className="w-px self-stretch bg-white/[0.13]" />
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-6 h-10 text-sm font-semibold transition-colors ${
                billingCycle === "annual" ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              Annual <span className="text-[#7AA0FF] ml-1">2 months free</span>
            </button>
          </div>
        </div>

        <PricingCards isAnnual={billingCycle === "annual"} />
      </Section>

      {/* ── CTA banner ── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl px-8 py-12 md:px-16 md:py-16 text-center bg-gradient-to-br from-[#0e0e12] to-[#0c0c0f] border border-white/[0.08]"
          >
            {/* Decorative elements — breathing blobs */}
            <div className="cx-breathe absolute top-0 right-0 w-64 h-64 bg-[#2F6BFF]/[0.09] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="cx-breathe absolute bottom-0 left-0 w-48 h-48 bg-[#2F6BFF]/[0.07] rounded-full translate-y-1/3 -translate-x-1/3 [animation-delay:2.2s]" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight max-w-xl mx-auto text-white">
                Take Back Your Weekends
              </h2>
              <p className="mt-4 text-lg text-white/60 max-w-lg mx-auto">
                Stop typing the same commands at 2 a.m. Free forever for
                personal use — no credit card required.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/getting-started"
                  className="cx-btn cx-btn-primary cx-btn-lg hover:scale-105"
                >
                  Install CX Free
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <CopyCmd light />
              </div>

              {/* Community row */}
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/50">
                <a
                  href="https://discord.gg/q4FUyBW6z"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#5865F2] transition-colors"
                >
                  <FaDiscord className="w-4 h-4" />
                  Discord
                </a>
                <a
                  href="https://reddit.com/r/cxlinux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#FF4500] transition-colors"
                >
                  <FaReddit className="w-4 h-4" />
                  r/cxlinux
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Mobile-only sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)] bg-[#08080a]/90 backdrop-blur-md border-t border-white/[0.08]">
        <div className="px-4 py-3">
          <Link href="/getting-started" className="cx-btn cx-btn-primary w-full">
            Install in 60 seconds
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
