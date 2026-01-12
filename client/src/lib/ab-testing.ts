declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface Variant {
  id: string;
  weight: number;
  content: Record<string, string>;
}

export interface ABTestConfig {
  testId: string;
  variants: Variant[];
  metrics: string[];
  status: 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
}

export interface ABTestResult {
  variant: Variant;
  trackClick: (element?: string) => void;
  trackScroll: (depth: number) => void;
  trackConversion: (conversionType: string, value?: number) => void;
  trackEvent: (event: string, data?: Record<string, any>) => void;
}

export interface ABTestContextValue {
  getTest: (testId: string) => ABTestConfig | undefined;
  getVariant: (testId: string) => Variant | null;
  trackEvent: (testId: string, event: string, data?: Record<string, any>) => void;
  isInitialized: boolean;
}

const STORAGE_PREFIX = 'cortex_ab_';

export function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function getPagePath(): string {
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  return '/';
}

export function isTestActive(test: ABTestConfig): boolean {
  if (test.status !== 'active') return false;
  
  const now = new Date();
  if (now < test.startDate) return false;
  if (test.endDate && now > test.endDate) return false;
  
  return true;
}

export function selectVariant(variants: Variant[]): Variant {
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      return variant;
    }
  }
  
  return variants[0];
}

export function getStoredVariantId(testId: string): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${testId}`);
  } catch {
    return null;
  }
}

export function storeVariantId(testId: string, variantId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${testId}`, variantId);
  } catch {
    // localStorage not available
  }
}

export function trackVariantAssignment(testId: string, variantId: string): void {
  if (!isAnalyticsAvailable()) return;
  
  window.gtag('event', 'ab_test_variant', {
    test_id: testId,
    variant_id: variantId,
    page_path: getPagePath(),
  });
}

export function getVariant(testId: string, testRegistry: Map<string, ABTestConfig>): Variant | null {
  const test = testRegistry.get(testId);
  if (!test) return null;
  
  if (!isTestActive(test)) {
    return test.variants[0];
  }
  
  const storedId = getStoredVariantId(testId);
  if (storedId) {
    const storedVariant = test.variants.find(v => v.id === storedId);
    if (storedVariant) return storedVariant;
  }
  
  const variant = selectVariant(test.variants);
  storeVariantId(testId, variant.id);
  
  trackVariantAssignment(testId, variant.id);
  
  return variant;
}

export function trackEvent(testId: string, event: string, data?: Record<string, any>): void {
  if (!isAnalyticsAvailable()) return;
  
  const variantId = getStoredVariantId(testId);
  
  window.gtag('event', event, {
    test_id: testId,
    variant_id: variantId,
    page_path: getPagePath(),
    ...data,
  });
}

export function trackClick(testId: string, element?: string): void {
  trackEvent(testId, 'ab_test_click', { element });
}

export function trackScroll(testId: string, depth: number): void {
  trackEvent(testId, 'ab_test_scroll', { scroll_depth: depth });
}

export function trackConversion(testId: string, conversionType: string, value?: number): void {
  trackEvent(testId, 'ab_test_conversion', { 
    conversion_type: conversionType,
    value 
  });
}

const globalTestRegistry: Map<string, ABTestConfig> = new Map();

export function registerTests(tests: ABTestConfig[]): void {
  tests.forEach(test => {
    globalTestRegistry.set(test.testId, test);
  });
}

export function getRegisteredTest(testId: string): ABTestConfig | undefined {
  return globalTestRegistry.get(testId);
}

export function getGlobalTestRegistry(): Map<string, ABTestConfig> {
  return globalTestRegistry;
}

export function getVariantContent(variant: Variant, key: string, fallback: string = ''): string {
  return variant.content[key] || fallback;
}

export function getAllStoredVariants(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const variants: Record<string, string> = {};
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        const testId = key.replace(STORAGE_PREFIX, '');
        variants[testId] = localStorage.getItem(key) || '';
      }
    }
  } catch {
    // localStorage not available
  }
  
  return variants;
}

export function clearVariant(testId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${testId}`);
  } catch {
    // localStorage not available
  }
}

export function clearAllVariants(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch {
    // localStorage not available
  }
}

export const defaultVariant: Variant = {
  id: 'control',
  weight: 100,
  content: {},
};

export const abTests = {
  heroHeadline: {
    testId: 'hero_headline_v1',
    variants: [
      { id: 'control', weight: 50, content: { headline: 'Execute Your Intent' } },
      { id: 'variant_a', weight: 25, content: { headline: 'Linux, But Smarter' } },
      { id: 'variant_b', weight: 25, content: { headline: 'AI-Powered Linux' } },
    ],
    metrics: ['ctr', 'scroll_depth', 'dwell_time'],
    status: 'active' as const,
    startDate: new Date('2026-01-01'),
  },
  heroCTA: {
    testId: 'hero_cta_v1',
    variants: [
      { id: 'control', weight: 50, content: { cta: 'Get Started' } },
      { id: 'variant_a', weight: 25, content: { cta: 'Try Cortex Free' } },
      { id: 'variant_b', weight: 25, content: { cta: 'Start Building' } },
    ],
    metrics: ['ctr', 'conversion_rate'],
    status: 'active' as const,
    startDate: new Date('2026-01-01'),
  },
  hackathonCTA: {
    testId: 'hackathon_cta_v1',
    variants: [
      { id: 'control', weight: 50, content: { cta: 'Join the Hackathon' } },
      { id: 'variant_a', weight: 50, content: { cta: 'Start Building Now' } },
    ],
    metrics: ['ctr', 'registration_rate'],
    status: 'active' as const,
    startDate: new Date('2026-01-01'),
  },
};
