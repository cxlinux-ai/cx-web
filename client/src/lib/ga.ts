/**
 * GA4 bootstrap. Replaces the inline gtag snippet that used to live in client/index.html.
 *
 * Why here and not inline:
 * - Host gate: the inline snippet fired everywhere, so localhost / 127.0.0.1 and *.pages.dev
 *   previews were polluting the production property. GA now loads only on cxlinux.com.
 * - Bot gate: automated browsers (`navigator.webdriver`) never load GA unless the URL carries
 *   `ab_qa=1` (AIVH experiment contract).
 * - Experiment tag: `main.tsx` assigns the A/B arm first and passes the tag in, so
 *   `gtag('set', …)` is queued before `gtag('config', …)` and the first page_view carries
 *   `exp_variant_string`. An inline snippet in <head> runs before the module bundle and would
 *   send that page_view untagged.
 */

export const GA_MEASUREMENT_ID = "G-KW1EVSFJLM";

const PRODUCTION_HOSTS = new Set(["cxlinux.com", "www.cxlinux.com"]);

/**
 * Local QA capture only (Playwright run against `npm run build` output). Requires `ab_qa=1` in the
 * URL, so a developer browsing localhost never loads GA by accident, and every hit is sent with
 * `debug_mode` so GA4's "Developer traffic" data filter can drop it. Preview hosts
 * (*.pages.dev) are never allowed, with or without the flag.
 */
const QA_LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export type GaMode = "production" | "qa-local" | "off";

export interface GaEnvironment {
  hostname: string;
  search: string;
  webdriver: boolean;
}

export function gaMode({ hostname, search, webdriver }: GaEnvironment): GaMode {
  const qa = new URLSearchParams(search).get("ab_qa") === "1";
  if (webdriver && !qa) return "off";
  if (PRODUCTION_HOSTS.has(hostname)) return "production";
  if (qa && QA_LOCAL_HOSTS.has(hostname)) return "qa-local";
  return "off";
}

export interface InitGaOptions {
  /** `<expId>-<A|B>` when the visitor is in an experiment, else null. */
  experimentTag: string | null;
}

/** Call once, synchronously, from main.tsx after experiment assignment and before render. */
export function initGA({ experimentTag }: InitGaOptions): GaMode {
  if (typeof window === "undefined" || typeof document === "undefined") return "off";

  const mode = gaMode({
    hostname: window.location.hostname,
    search: window.location.search,
    webdriver: navigator.webdriver === true,
  });
  if (mode === "off") return mode;

  window.dataLayer = window.dataLayer || [];
  // gtag.js expects the real `arguments` object in dataLayer, exactly like Google's snippet.
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());

  if (experimentTag) {
    window.gtag("set", { exp_variant_string: experimentTag });
    window.gtag("set", "user_properties", { ab_test: experimentTag });
  }

  const config: Record<string, unknown> = {
    anonymize_ip: true,
    cookie_flags: "SameSite=None;Secure",
  };
  if (experimentTag) {
    // Verified in the local GA capture: gtag.js does NOT copy custom keys from gtag('set', {...})
    // onto GA4 events (page_view and install_intent arrived without ep.exp_variant_string), while
    // custom `config` params are attached to every event of this tag. So the tag rides on config;
    // the `set` calls above stay for the contract and for any other destination.
    config.exp_variant_string = experimentTag;
  }
  if (mode === "qa-local") {
    config.debug_mode = true;
  }
  window.gtag("config", GA_MEASUREMENT_ID, config);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  return mode;
}
