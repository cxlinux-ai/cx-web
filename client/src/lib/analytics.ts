// Analytics utility for GA4 event tracking and Microsoft Clarity

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    clarity: (...args: any[]) => void;
  }
}

// GA4 Event Types
type EventCategory = 'engagement' | 'conversion' | 'navigation' | 'cta' | 'form';

interface TrackEventParams {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
}

// Track custom events in GA4
export function trackEvent({ category, action, label, value }: TrackEventParams) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// ─── Experiment + conversion events (AIVH experiment contract v1) ────────────
// Exact event and param names are read by the AIVH analytics dashboard; do not rename.
// No PII in params. All calls are no-ops when GA is not loaded (see lib/ga.ts host/bot gate).

type EventParams = Record<string, string | number | undefined>;

export function sendEvent(name: string, params: EventParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const clean: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) clean[key] = value;
  }
  window.gtag("event", name, clean);
}

/** Runs `fn` at most once per browser session for `key`. Storage failures fall back to "run". */
function oncePerSession(key: string, fn: () => void) {
  try {
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Private mode / blocked storage: still record the event.
  }
  fn();
}

export type HeroCta = "hero_primary" | "hero_secondary";
export type InstallIntentMethod = "copy" | "cta";

export const conversionEvents = {
  /** Once per session, when the experiment hero renders for a tagged visitor. */
  experienceImpression(expId: string, tag: string) {
    oncePerSession(`aivh_exp_impression_${expId}`, () =>
      sendEvent("experience_impression", { exp_variant_string: tag }),
    );
  },

  ctaClick(cta: HeroCta, tag: string | null) {
    sendEvent("cta_click", { cta, exp_variant_string: tag ?? undefined });
  },

  /** First install signal of the session: a copy of the install command or a click on an install CTA. */
  installIntent(method: InstallIntentMethod, location: string) {
    oncePerSession("aivh_install_intent", () => sendEvent("install_intent", { method, location }));
  },

  /** Checkout page reached. */
  beginCheckout(plan: string, billing: string) {
    oncePerSession(`aivh_begin_checkout_${plan}_${billing}`, () =>
      sendEvent("begin_checkout", { plan, billing }),
    );
  },

  /** Success page with a Stripe `session_id`; deduped per session id, which is never sent to GA. */
  checkoutCompleted(sessionId: string) {
    oncePerSession(`aivh_checkout_completed_${sessionId}`, () => sendEvent("checkout_completed"));
  },
};

// Pre-built event trackers
export const analytics = {
  // CTA Clicks
  trackCTAClick: (ctaName: string, location: string) => {
    trackEvent({
      category: 'cta',
      action: 'cta_click',
      label: `${ctaName}_${location}`,
    });
  },

  // Form Submissions
  trackFormSubmit: (formName: string, success: boolean) => {
    trackEvent({
      category: 'form',
      action: success ? 'form_submit_success' : 'form_submit_error',
      label: formName,
    });
  },

  // Page Navigation
  trackNavigation: (from: string, to: string) => {
    trackEvent({
      category: 'navigation',
      action: 'page_navigation',
      label: `${from}_to_${to}`,
    });
  },

  // Conversions
  trackConversion: (conversionType: string, value?: number) => {
    trackEvent({
      category: 'conversion',
      action: 'conversion',
      label: conversionType,
      value,
    });
  },

  // Engagement
  trackEngagement: (action: string, details?: string) => {
    trackEvent({
      category: 'engagement',
      action: action,
      label: details,
    });
  },

  // Scroll Depth
  trackScrollDepth: (percentage: number) => {
    trackEvent({
      category: 'engagement',
      action: 'scroll_depth',
      value: percentage,
    });
  },

  // Time on Page (call on unmount)
  trackTimeOnPage: (pagePath: string, seconds: number) => {
    trackEvent({
      category: 'engagement',
      action: 'time_on_page',
      label: pagePath,
      value: seconds,
    });
  },
};

// Blog-specific events
export const blogAnalytics = {
  articleViewed: (slug: string) =>
    trackEvent({ category: "engagement", action: "blog_article_viewed", label: slug }),
  scrollDepth: (slug: string, pct: 25 | 50 | 75 | 100) =>
    trackEvent({ category: "engagement", action: "blog_scroll_depth", label: `${slug}::${pct}` }),
  copyCodeClick: (slug: string) =>
    trackEvent({ category: "engagement", action: "blog_copy_code_click", label: slug }),
  outboundClicked: (slug: string, url: string) =>
    trackEvent({ category: "engagement", action: "blog_outbound_clicked", label: `${slug}::${url}` }),
};

export default analytics;
