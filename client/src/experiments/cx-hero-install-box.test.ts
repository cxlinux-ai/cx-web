// @vitest-environment node
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACTIVE,
  COOKIE_NAME,
  EXP_ID,
  HERO_B_COPY,
  INSTALL_COMMAND,
  experimentTag,
  parseOverride,
  readCookie,
  resolveAssignment,
  serializeCookie,
} from "./cx-hero-install-box";
import { gaMode } from "@/lib/ga";

const never = () => {
  throw new Error("random() must not be called");
};

/** Deterministic PRNG (mulberry32) so the split test is reproducible. */
function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("cx-hero-install-box assignment", () => {
  it("ships inactive", () => {
    expect(ACTIVE).toBe(false);
    expect(COOKIE_NAME).toBe("aivh_ab_cx-hero-install-box");
  });

  it("ACTIVE=false: always A, untagged, no cookie, even with a B cookie present", () => {
    for (const cookie of ["", `${COOKIE_NAME}=B`, `${COOKIE_NAME}=zzz`]) {
      expect(resolveAssignment({ active: false, cookie, search: "", random: never })).toEqual({
        variant: "A",
        tagged: false,
        cookieToWrite: null,
      });
    }
  });

  it("?ab= override forces the arm and rewrites the cookie, active or not", () => {
    for (const active of [false, true]) {
      expect(
        resolveAssignment({ active, cookie: `${COOKIE_NAME}=A`, search: `?ab=${EXP_ID}:B`, random: never }),
      ).toEqual({ variant: "B", tagged: true, cookieToWrite: "B" });
      expect(
        resolveAssignment({ active, cookie: `${COOKIE_NAME}=B`, search: `?ab_qa=1&ab=${EXP_ID}:a`, random: never }),
      ).toEqual({ variant: "A", tagged: true, cookieToWrite: "A" });
    }
  });

  it("ignores overrides for other experiments or unknown arms", () => {
    expect(parseOverride("?ab=allbots-hero-hands-full:B")).toBeNull();
    expect(parseOverride(`?ab=${EXP_ID}:C`)).toBeNull();
    expect(parseOverride(`?ab=${EXP_ID}`)).toBeNull();
    expect(parseOverride("")).toBeNull();
  });

  it("sticky: an existing valid cookie is never re-rolled", () => {
    for (const arm of ["A", "B"] as const) {
      const cookie = `other=1; ${COOKIE_NAME}=${arm}; x=y`;
      expect(resolveAssignment({ active: true, cookie, search: "", random: never })).toEqual({
        variant: arm,
        tagged: true,
        cookieToWrite: null,
      });
    }
  });

  it("invalid or missing cookie is re-rolled and written", () => {
    expect(resolveAssignment({ active: true, cookie: `${COOKIE_NAME}=garbage`, search: "", random: () => 0.9 })).toEqual({
      variant: "B",
      tagged: true,
      cookieToWrite: "B",
    });
    expect(resolveAssignment({ active: true, cookie: "", search: "", random: () => 0.1 })).toEqual({
      variant: "A",
      tagged: true,
      cookieToWrite: "A",
    });
  });

  it("splits ~50/50 over 10k draws", () => {
    const random = seeded(20261110);
    let b = 0;
    for (let i = 0; i < 10_000; i++) {
      if (resolveAssignment({ active: true, cookie: "", search: "", random }).variant === "B") b++;
    }
    expect(b).toBeGreaterThan(4_800);
    expect(b).toBeLessThan(5_200);
  });

  it("cookie attributes and GA tag follow the contract", () => {
    expect(serializeCookie("B", true)).toBe(`${COOKIE_NAME}=B; Max-Age=7776000; Path=/; SameSite=Lax; Secure`);
    expect(serializeCookie("A", false)).toBe(`${COOKIE_NAME}=A; Max-Age=7776000; Path=/; SameSite=Lax`);
    expect(readCookie(`a=1; ${COOKIE_NAME}=B`, COOKIE_NAME)).toBe("B");
    expect(experimentTag({ variant: "B", tagged: true, cookieToWrite: null })).toBe("cx-hero-install-box-B");
    expect(experimentTag({ variant: "A", tagged: false, cookieToWrite: null })).toBeNull();
  });
});

describe("variant B copy", () => {
  const repoRoot = path.resolve(__dirname, "../../..");
  const read = (p: string) => readFileSync(path.join(repoRoot, p), "utf8");

  it("uses the canonical install command the site already ships", () => {
    expect(INSTALL_COMMAND).toBe("curl -fsSL https://cxlinux.com/install.sh | bash");
    expect(read("client/src/sections/HomePage.tsx")).toContain(INSTALL_COMMAND);
    expect(read("client/src/pages/getting-started.tsx")).toContain(INSTALL_COMMAND);
    expect(HERO_B_COPY.readScriptHref).toBe("https://cxlinux.com/install.sh");
  });

  it("only rests on claims the live site states", () => {
    const home = read("client/src/sections/HomePage.tsx");
    expect(home).toContain("CX will never run a command without your explicit approval.");
    expect(home).toContain("Atomic Rollbacks");
    expect(home).toContain("Free forever for personal use. No credit card required.");
    expect(home).toContain("You can inspect the script before running it");
    expect(read("client/public/install.sh")).toContain("Supports: Ubuntu 20.04+, Debian 11+");
  });
});

describe("GA host / bot gate", () => {
  const env = (hostname: string, search = "", webdriver = false) => ({ hostname, search, webdriver });

  it("loads on cxlinux.com and www only", () => {
    expect(gaMode(env("cxlinux.com"))).toBe("production");
    expect(gaMode(env("www.cxlinux.com"))).toBe("production");
    expect(gaMode(env("cx-web.pages.dev"))).toBe("off");
    expect(gaMode(env("abc123.cx-web.pages.dev", "?ab_qa=1"))).toBe("off");
    expect(gaMode(env("localhost"))).toBe("off");
    expect(gaMode(env("127.0.0.1"))).toBe("off");
  });

  it("skips automated browsers unless ab_qa=1", () => {
    expect(gaMode(env("cxlinux.com", "", true))).toBe("off");
    expect(gaMode(env("cxlinux.com", "?ab_qa=1", true))).toBe("production");
  });

  it("allows localhost only for the ab_qa=1 QA capture", () => {
    expect(gaMode(env("localhost", "?ab_qa=1", true))).toBe("qa-local");
    expect(gaMode(env("127.0.0.1", "?ab_qa=1"))).toBe("qa-local");
    expect(gaMode(env("localhost", "?ab_qa=0"))).toBe("off");
  });
});
