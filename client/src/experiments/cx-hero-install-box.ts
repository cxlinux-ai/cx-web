/**
 * A/B experiment `cx-hero-install-box` (AIVH experiment contract v1, 2026-11-10).
 *
 * Question: does replacing the homepage hero's primary CTA ("Install in 60s, free" → /getting-started)
 * with the install command itself, copyable in place, raise install intent? H1 and sub-copy are the
 * same in both arms, so only the first action differs.
 *
 *   A (control) = today's live hero, unchanged.
 *   B           = copyable command box + "Read install.sh first" link + reassurance lines.
 *
 * Assignment runs synchronously in `client/src/main.tsx` before React renders and before GA's
 * `config` call, so the very first page_view already carries `exp_variant_string`.
 *
 * Every visible B string lives in this file and cites the live-site claim (or voice-of-customer
 * source) it rests on. Claims whitelist: only what cxlinux.com already states.
 */

export const EXP_ID = "cx-hero-install-box" as const;

/**
 * Launch switch. `false` = everyone sees A, no cookie is written, nothing is tagged.
 * The `?ab=cx-hero-install-box:B` QA override still works while this is false.
 * Flip to `true` only at launch, after the GA4 custom dimensions exist (they never backfill).
 */
export const ACTIVE = false;

export type Variant = "A" | "B";

export const COOKIE_NAME = `aivh_ab_${EXP_ID}`;
export const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

// ─── Variant B copy ──────────────────────────────────────────────────────────

/**
 * Canonical install command. Same string the site already ships in the homepage "Take back your
 * weekends" block (HomePage.tsx), /getting-started (`INSTALL.curl`), the FAQ install answer and the
 * server-rendered homepage (shared/home-prerender.ts).
 */
export const INSTALL_COMMAND = "curl -fsSL https://cxlinux.com/install.sh | bash";

export const HERO_B_COPY = {
  copyLabel: "Copy",
  copiedLabel: "Copied",
  copyAriaLabel: "Copy install command",
  copiedAriaLabel: "Install command copied",

  /**
   * Transparency link, Homebrew pattern (brew.sh shows the one-liner and links the script it runs).
   * Live claim it rests on: "You can inspect the script before running it" (HomePage.tsx,
   * "Why is curl | bash safe here?").
   */
  readScriptLabel: "Read install.sh first ↗",
  readScriptHref: "https://cxlinux.com/install.sh",

  /**
   * Docs-first path: same destination as A's primary CTA (/getting-started), counted as
   * install_intent method "cta".
   */
  installGuideLabel: "Install guide →",
  installGuideHref: "/getting-started",

  /**
   * Live claims (HomePage.tsx): "CX will never run a command without your explicit approval." (The
   * CX Promise) and the security feature cards "Firejail Sandboxing", "Full Audit Logs" and
   * "Atomic Rollbacks" ("Made a mistake? Undo any change instantly with a single keystroke.").
   * VoC: fear of a blind `rm -rf` / not being able to verify what an AI runs,
   * https://news.ycombinator.com/item?id=38988164 and
   * https://news.ycombinator.com/item?id=39012590 (sources cited by the approved plan).
   */
  approvalLine: "Nothing runs until you approve it. Firejail sandbox, full audit log, atomic rollback if it's wrong.",
} as const;

// The hero's "Works on Ubuntu, Debian, RHEL, and Arch. Free forever for personal use. No credit
// card required." line sits above the CTA block and is identical in both arms: B adds no
// microcopy of its own, so only the first action differs.

// ─── Assignment (pure, unit-tested) ──────────────────────────────────────────

export interface Assignment {
  variant: Variant;
  /** True when the visitor is in the experiment (ACTIVE, or forced via `?ab=`): tag GA. */
  tagged: boolean;
  /** Arm to persist in the cookie on this page load, or null to leave the cookie alone. */
  cookieToWrite: Variant | null;
}

export interface AssignmentInput {
  active: boolean;
  /** `document.cookie` */
  cookie: string;
  /** `location.search` */
  search: string;
  /** Uniform [0, 1). */
  random: () => number;
}

const CONTROL: Assignment = { variant: "A", tagged: false, cookieToWrite: null };

function isVariant(value: unknown): value is Variant {
  return value === "A" || value === "B";
}

export function readCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}

/** `?ab=cx-hero-install-box:B` → "B". Any other experiment id or arm is ignored. */
export function parseOverride(search: string): Variant | null {
  const raw = new URLSearchParams(search).get("ab");
  if (!raw) return null;
  const sep = raw.lastIndexOf(":");
  if (sep === -1 || raw.slice(0, sep) !== EXP_ID) return null;
  const arm = raw.slice(sep + 1).toUpperCase();
  return isVariant(arm) ? arm : null;
}

export function resolveAssignment({ active, cookie, search, random }: AssignmentInput): Assignment {
  const forced = parseOverride(search);
  if (forced) {
    return { variant: forced, tagged: true, cookieToWrite: forced };
  }
  if (!active) {
    return CONTROL;
  }
  const existing = readCookie(cookie, COOKIE_NAME);
  if (isVariant(existing)) {
    return { variant: existing, tagged: true, cookieToWrite: null };
  }
  const variant: Variant = random() < 0.5 ? "A" : "B";
  return { variant, tagged: true, cookieToWrite: variant };
}

export function serializeCookie(variant: Variant, secure: boolean): string {
  return `${COOKIE_NAME}=${variant}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Value for GA's `exp_variant_string` / `ab_test`, or null when the visitor is not tagged. */
export function experimentTag(assignment: Assignment): string | null {
  return assignment.tagged ? `${EXP_ID}-${assignment.variant}` : null;
}

// ─── Browser side effects ────────────────────────────────────────────────────

let current: Assignment = CONTROL;

function cryptoRandom(): number {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
  } catch {
    return Math.random();
  }
}

/** Call once, synchronously, before the first render and before GA is configured. */
export function assignHeroExperiment(): Assignment {
  if (typeof document === "undefined") return current;
  current = resolveAssignment({
    active: ACTIVE,
    cookie: document.cookie,
    search: window.location.search,
    random: cryptoRandom,
  });
  if (current.cookieToWrite) {
    document.cookie = serializeCookie(current.cookieToWrite, window.location.protocol === "https:");
  }
  return current;
}

export function getHeroAssignment(): Assignment {
  return current;
}
