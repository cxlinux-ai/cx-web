import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

// Primary navigation — single source of truth for desktop + mobile
export const NAV_ITEMS: { href: string; label: string; isActive: (l: string) => boolean }[] = [
  { href: "/getting-started", label: "Terminal", isActive: (l) => l === "/getting-started" },
  { href: "/pricing", label: "Pricing", isActive: (l) => l.startsWith("/pricing") },
  { href: "/affiliates", label: "Affiliates", isActive: (l) => l === "/affiliates" },
  { href: "/blog", label: "Blog", isActive: (l) => l.startsWith("/blog") },
  { href: "/about", label: "About", isActive: (l) => l === "/about" },
];

/**
 * Sticky site header.
 *
 * Rest state: full-width, transparent, hairline bottom rule.
 * Scrolled state: condenses into an inset floating "island" — narrower,
 * rounded, blurred, ringed, with a soft drop shadow. A hairline scroll
 * progress bar tracks reading position. All motion is spring/ease based and
 * disabled under prefers-reduced-motion.
 */
export default function SiteHeader() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Close the mobile sheet on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  // Scroll-aware header: condense past the fold + drive the progress hairline
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 4 ? Math.min(1, Math.max(0, y / max)) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [location]);

  // Lock body scroll + Escape-to-close while the mobile sheet is open
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.7 };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Scroll progress hairline — transform-based so it never triggers layout */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden" aria-hidden="true">
        <div
          className="h-full origin-left bg-gradient-to-r from-[#00FF9F] via-[#00FFCC] to-[#00FF9F] shadow-[0_0_12px_rgba(0,255,159,0.6)]"
          style={{
            transform: `scaleX(${progress})`,
            opacity: scrolled ? 1 : 0,
            transition: reduceMotion
              ? "none"
              : "transform 120ms linear, opacity 300ms ease-out",
          }}
        />
      </div>

      {/* Ambient accent bloom behind the island */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(50%_60%_at_50%_100%,rgba(0,255,159,0.10),transparent_70%)] transition-opacity duration-700"
        style={{ opacity: scrolled ? 1 : 0 }}
      />

      <div
        className={`px-3 sm:px-5 lg:px-8 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? "pt-2.5 sm:pt-3" : "pt-0"
        }`}
      >
        <div
          className={`relative mx-auto flex items-center justify-between gap-3 px-3 sm:px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled
              ? "h-14 max-w-6xl rounded-2xl border border-white/[0.09] bg-[#0C0C0C]/75 backdrop-blur-2xl shadow-[0_18px_50px_-24px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.05)]"
              : "h-16 max-w-7xl rounded-none border border-transparent bg-transparent backdrop-blur-[6px]"
          }`}
        >
          {/* Bottom hairline in the rest state only */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent transition-opacity duration-500"
            style={{ opacity: scrolled ? 0 : 1 }}
          />

          {/* Logo */}
          <Link
            href="/"
            onClick={() => {
              if (location === "/") {
                window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
              }
            }}
            aria-label="CX Linux — home"
            className="group relative flex flex-shrink-0 items-center gap-2.5 rounded-xl px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9F]/40"
          >
            <span className="relative block h-8 w-8 flex-shrink-0">
              <span className="absolute inset-0 rounded-lg bg-[#00FF9F]/25 blur-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <img
                src="/logo-mark.svg"
                alt=""
                className="relative h-8 w-8 object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08] group-active:scale-95"
              />
            </span>
            <span className="text-[1.05rem] font-bold leading-none tracking-[0.02em]">
              <span className="text-white">CX</span>
              <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent">
                {" "}
                LINUX
              </span>
            </span>
          </Link>

          {/* Desktop navigation — segmented control with a sliding indicator */}
          <nav
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] p-1 md:flex"
            onMouseLeave={() => setHovered(null)}
            aria-label="Primary"
          >
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(location);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={() => setHovered(item.href)}
                  onFocus={() => setHovered(item.href)}
                  className={`relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9F]/40 ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {hovered === item.href && (
                    <motion.span
                      layoutId="nav-hover"
                      transition={spring}
                      className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                    />
                  )}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      transition={spring}
                      className="absolute inset-0 -z-10 rounded-full bg-[#00FF9F]/[0.12] shadow-[inset_0_0_0_1px_rgba(0,255,159,0.22)]"
                    >
                      <span className="absolute -bottom-[3px] left-1/2 h-[2px] w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] shadow-[0_0_10px_rgba(0,255,159,0.8)]" />
                    </motion.span>
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden flex-shrink-0 items-center gap-2 md:flex">
            <Link
              href="/account"
              className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-[#00FF9F] px-4 py-2 text-[13px] font-semibold !text-black shadow-[0_6px_18px_-8px_rgba(0,255,159,0.65),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#00E894] hover:shadow-[0_12px_28px_-10px_rgba(0,255,159,0.75),inset_0_1px_0_rgba(255,255,255,0.35)] active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9F]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0C0C]"
            >
              {/* Specular sweep on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-[700ms] ease-out group-hover:translate-x-full motion-reduce:hidden"
              />
              <span className="relative">My Account</span>
              <ArrowUpRight
                size={14}
                className="relative transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* Mobile trigger */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileOpen((v) => !v)}
            className="relative -mr-1 flex h-10 w-10 items-center justify-center rounded-xl text-white transition-colors hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF9F]/40 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={mobileOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: reduceMotion ? 0 : -90, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: reduceMotion ? 0 : 90, scale: 0.8 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm md:hidden"
              aria-hidden="true"
            />
            <motion.div
              key="sheet"
              id="mobile-nav"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 32, mass: 0.7 }
              }
              className="mx-3 mt-2 origin-top rounded-2xl border border-white/[0.09] bg-[#0A0A0A]/95 p-2.5 shadow-[0_28px_60px_-24px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl md:hidden"
            >
              {NAV_ITEMS.map((item, i) => {
                const active = item.isActive(location);
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reduceMotion ? 0 : 0.035 * i + 0.05,
                      duration: reduceMotion ? 0 : 0.25,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors ${
                        active
                          ? "border-[#00FF9F]/25 bg-[#00FF9F]/[0.10] text-[#00FF9F]"
                          : "border-transparent text-gray-300 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {item.label}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#00FF9F] shadow-[0_0_8px_rgba(0,255,159,0.9)]" />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: reduceMotion ? 0 : 0.035 * NAV_ITEMS.length + 0.06,
                  duration: reduceMotion ? 0 : 0.25,
                }}
                className="mt-2 border-t border-white/[0.07] pt-2.5"
              >
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#00FF9F] px-4 py-3 font-semibold !text-black shadow-[0_8px_22px_-10px_rgba(0,255,159,0.7),inset_0_1px_0_rgba(255,255,255,0.35)] active:scale-[0.99]"
                >
                  My Account
                  <ArrowUpRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
