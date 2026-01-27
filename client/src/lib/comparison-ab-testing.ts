// Comparison Page A/B Testing System
// Traffic-segmented testing for organic Google search visitors

import { type ABVariant, type ComparisonData } from '@/data/comparisons';

// Cookie names
const VARIANT_COOKIE_PREFIX = 'cx_compare_';
const TRAFFIC_SOURCE_COOKIE = 'cx_traffic_source';

// Traffic source types
export type TrafficSource = 'organic' | 'direct' | 'referral' | 'paid' | 'unknown';

// Detect if user arrived from organic Google search
export function detectTrafficSource(): TrafficSource {
  if (typeof window === 'undefined') return 'unknown';
  
  const referrer = document.referrer;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check UTM parameters first (most reliable)
  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  
  if (utmMedium === 'cpc' || utmMedium === 'ppc') {
    return 'paid';
  }
  
  if (utmSource?.includes('google') && utmMedium === 'organic') {
    return 'organic';
  }
  
  // Check referrer for Google organic
  if (referrer) {
    const referrerUrl = new URL(referrer);
    const googleDomains = [
      'google.com', 'google.co.uk', 'google.ca', 'google.com.au',
      'google.de', 'google.fr', 'google.es', 'google.it', 'google.co.in',
      'google.co.jp', 'google.com.br', 'google.ru', 'google.nl'
    ];
    
    const isGoogle = googleDomains.some(domain => 
      referrerUrl.hostname.includes(domain)
    );
    
    if (isGoogle) {
      // If no UTM and from Google, assume organic
      return 'organic';
    }
    
    // Other referrals
    return 'referral';
  }
  
  // No referrer = direct
  if (!referrer) {
    return 'direct';
  }
  
  return 'unknown';
}

// Check if user is eligible for A/B testing (organic traffic only)
export function isEligibleForTesting(): boolean {
  const source = getPersistedTrafficSource();
  return source === 'organic';
}

// Get traffic source (persisted in cookie for session)
export function getPersistedTrafficSource(): TrafficSource {
  if (typeof window === 'undefined') return 'unknown';
  
  // Check if already stored
  const stored = getCookie(TRAFFIC_SOURCE_COOKIE);
  if (stored) {
    return stored as TrafficSource;
  }
  
  // Detect and store
  const detected = detectTrafficSource();
  setCookie(TRAFFIC_SOURCE_COOKIE, detected, 30); // 30 day persistence
  return detected;
}

// Get or assign variant for a comparison page
export function getComparisonVariant(comparison: ComparisonData): ABVariant {
  const { experiment } = comparison;
  const cookieName = `${VARIANT_COOKIE_PREFIX}${comparison.slug}`;
  
  // If not eligible for testing, return control
  if (!isEligibleForTesting()) {
    return experiment.variants[0]; // Control variant
  }
  
  // Check for existing assignment
  const storedVariantId = getCookie(cookieName);
  if (storedVariantId) {
    const existingVariant = experiment.variants.find(v => v.id === storedVariantId);
    if (existingVariant) {
      return existingVariant;
    }
  }
  
  // Assign new variant based on weights
  const variant = assignVariant(experiment.variants);
  setCookie(cookieName, variant.id, 90); // 90 day persistence
  
  return variant;
}

// Deterministic variant assignment based on weights
function assignVariant(variants: ABVariant[]): ABVariant {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      return variant;
    }
  }
  
  return variants[0]; // Fallback to control
}

// Cookie utilities
function setCookie(name: string, value: string, days: number): void {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Force a specific variant (for testing/preview)
export function forceVariant(slug: string, variantId: string): void {
  const cookieName = `${VARIANT_COOKIE_PREFIX}${slug}`;
  setCookie(cookieName, variantId, 1); // 1 day for testing
}

// Clear variant assignment (for testing)
export function clearVariant(slug: string): void {
  if (typeof window === 'undefined') return;
  
  const cookieName = `${VARIANT_COOKIE_PREFIX}${slug}`;
  document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// Get all active experiments and their assigned variants
export function getActiveExperiments(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const experiments: Record<string, string> = {};
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name?.startsWith(VARIANT_COOKIE_PREFIX)) {
      const slug = name.replace(VARIANT_COOKIE_PREFIX, '');
      experiments[slug] = decodeURIComponent(value || '');
    }
  }
  
  return experiments;
}

// React hook for using comparison A/B test
export function useComparisonABTest(comparison: ComparisonData): {
  variant: ABVariant;
  isOrganicTraffic: boolean;
  trafficSource: TrafficSource;
} {
  const trafficSource = getPersistedTrafficSource();
  const isOrganicTraffic = trafficSource === 'organic';
  const variant = getComparisonVariant(comparison);
  
  return {
    variant,
    isOrganicTraffic,
    trafficSource,
  };
}
