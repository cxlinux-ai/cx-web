// Comparison Page Analytics
// Enhanced tracking for comparison pages with experiment context

import { type TrafficSource } from './comparison-ab-testing';

export interface ComparisonEventContext {
  competitor: string;
  variantId: string;
  trafficSource: TrafficSource;
}

// Base event tracking with comparison context
function trackComparisonEvent(
  eventName: string,
  context: ComparisonEventContext,
  additionalParams?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', eventName, {
    competitor: context.competitor,
    variant_id: context.variantId,
    traffic_source: context.trafficSource,
    ...additionalParams,
  });
}

// Page view with comparison context
export function trackComparisonPageView(context: ComparisonEventContext): void {
  trackComparisonEvent('comparison_page_view', context);
}

// Scroll depth tracking (25%, 50%, 75%, 100%)
export function trackComparisonScrollDepth(
  context: ComparisonEventContext,
  percentage: number
): void {
  trackComparisonEvent('comparison_scroll_depth', context, {
    scroll_percentage: percentage,
  });
}

// Time on page tracking
export function trackComparisonTimeOnPage(
  context: ComparisonEventContext,
  seconds: number
): void {
  trackComparisonEvent('comparison_time_on_page', context, {
    time_seconds: seconds,
  });
}

// CTA click tracking
export function trackComparisonCTAClick(
  context: ComparisonEventContext,
  ctaType: 'primary' | 'secondary' | 'inline',
  ctaText: string,
  placement: string
): void {
  trackComparisonEvent('comparison_cta_click', context, {
    cta_type: ctaType,
    cta_text: ctaText,
    cta_placement: placement,
  });
}

// Install click (conversion)
export function trackComparisonInstallClick(context: ComparisonEventContext): void {
  trackComparisonEvent('comparison_install_click', context, {
    conversion_type: 'install',
  });
}

// Docs click
export function trackComparisonDocsClick(
  context: ComparisonEventContext,
  docLink: string
): void {
  trackComparisonEvent('comparison_docs_click', context, {
    doc_link: docLink,
  });
}

// GitHub click (conversion)
export function trackComparisonGitHubClick(context: ComparisonEventContext): void {
  trackComparisonEvent('comparison_github_click', context, {
    conversion_type: 'github',
  });
}

// Feature table interaction
export function trackComparisonFeatureView(
  context: ComparisonEventContext,
  featureName: string
): void {
  trackComparisonEvent('comparison_feature_view', context, {
    feature_name: featureName,
  });
}

// Use case section viewed
export function trackComparisonUseCaseView(
  context: ComparisonEventContext,
  useCaseTitle: string
): void {
  trackComparisonEvent('comparison_usecase_view', context, {
    usecase_title: useCaseTitle,
  });
}

// "When to use" section engagement (trust signal)
export function trackComparisonTrustSectionView(
  context: ComparisonEventContext,
  sectionType: 'cx_better' | 'competitor_better' | 'who_should_not_switch'
): void {
  trackComparisonEvent('comparison_trust_section_view', context, {
    section_type: sectionType,
  });
}

// FAQ expansion
export function trackComparisonFAQExpand(
  context: ComparisonEventContext,
  question: string
): void {
  trackComparisonEvent('comparison_faq_expand', context, {
    faq_question: question,
  });
}

// Bounce detection (left before 10 seconds)
export function trackComparisonBounce(context: ComparisonEventContext): void {
  trackComparisonEvent('comparison_bounce', context);
}

// Scroll depth tracker hook utility
export function createScrollDepthTracker(
  context: ComparisonEventContext
): {
  handleScroll: () => void;
  cleanup: () => void;
} {
  const thresholds = [25, 50, 75, 100];
  const trackedThresholds = new Set<number>();
  
  const handleScroll = () => {
    if (typeof window === 'undefined') return;
    
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.round((scrollTop / docHeight) * 100);
    
    for (const threshold of thresholds) {
      if (scrollPercentage >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold);
        trackComparisonScrollDepth(context, threshold);
      }
    }
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  
  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll);
    }
  };
  
  return { handleScroll, cleanup };
}

// Time on page tracker hook utility
export function createTimeOnPageTracker(
  context: ComparisonEventContext,
  onBounce?: () => void
): {
  cleanup: () => void;
} {
  const startTime = Date.now();
  let hasTrackedBounce = false;
  
  // Track time every 30 seconds
  const intervalId = typeof window !== 'undefined' 
    ? setInterval(() => {
        const seconds = Math.round((Date.now() - startTime) / 1000);
        if (seconds >= 10 && !hasTrackedBounce) {
          // Not a bounce if stayed more than 10 seconds
          hasTrackedBounce = true;
        }
        if (seconds % 30 === 0) {
          trackComparisonTimeOnPage(context, seconds);
        }
      }, 1000)
    : null;
  
  // Track on page leave
  const handleBeforeUnload = () => {
    const seconds = Math.round((Date.now() - startTime) / 1000);
    trackComparisonTimeOnPage(context, seconds);
    
    if (seconds < 10 && !hasTrackedBounce) {
      trackComparisonBounce(context);
      onBounce?.();
    }
  };
  
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', handleBeforeUnload);
  }
  
  const cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  };
  
  return { cleanup };
}

// Combined analytics hook for comparison pages
export function initComparisonAnalytics(context: ComparisonEventContext): () => void {
  // Track page view on mount
  trackComparisonPageView(context);
  
  // Set up scroll tracking
  const { cleanup: cleanupScroll } = createScrollDepthTracker(context);
  
  // Set up time tracking
  const { cleanup: cleanupTime } = createTimeOnPageTracker(context);
  
  // Return cleanup function (for useEffect)
  return () => {
    cleanupScroll();
    cleanupTime();
  };
}

// Analytics summary for dashboard
export interface ComparisonAnalyticsSummary {
  competitor: string;
  variant: string;
  trafficSource: TrafficSource;
  pageViews: number;
  avgTimeOnPage: number;
  scrollDepthAvg: number;
  ctaClickRate: number;
  conversionRate: number;
  bounceRate: number;
}

// Note: This would typically come from your analytics backend
// This is a placeholder structure for the dashboard component
export function getAnalyticsSummaryQueryStructure(): string {
  return `
-- Example BigQuery / GA4 query for comparison analytics
SELECT
  event_params.competitor AS competitor,
  event_params.variant_id AS variant,
  event_params.traffic_source AS traffic_source,
  COUNT(DISTINCT user_pseudo_id) AS unique_visitors,
  COUNT(CASE WHEN event_name = 'comparison_page_view' THEN 1 END) AS page_views,
  AVG(CASE WHEN event_name = 'comparison_time_on_page' 
      THEN event_params.time_seconds END) AS avg_time_on_page,
  AVG(CASE WHEN event_name = 'comparison_scroll_depth' 
      THEN event_params.scroll_percentage END) AS avg_scroll_depth,
  COUNT(CASE WHEN event_name = 'comparison_cta_click' THEN 1 END) / 
    NULLIF(COUNT(CASE WHEN event_name = 'comparison_page_view' THEN 1 END), 0) AS cta_click_rate,
  COUNT(CASE WHEN event_name IN ('comparison_install_click', 'comparison_github_click') THEN 1 END) / 
    NULLIF(COUNT(CASE WHEN event_name = 'comparison_page_view' THEN 1 END), 0) AS conversion_rate,
  COUNT(CASE WHEN event_name = 'comparison_bounce' THEN 1 END) / 
    NULLIF(COUNT(CASE WHEN event_name = 'comparison_page_view' THEN 1 END), 0) AS bounce_rate
FROM \`your-project.analytics_123456789.events_*\`
WHERE event_name LIKE 'comparison_%'
GROUP BY competitor, variant, traffic_source
ORDER BY competitor, variant;
  `;
}
