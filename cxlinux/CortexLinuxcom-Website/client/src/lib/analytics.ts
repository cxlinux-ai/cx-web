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

export default analytics;
