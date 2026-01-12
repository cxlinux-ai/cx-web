// Simple A/B Testing Framework
// Uses localStorage to ensure consistent experience per user

export interface ABTestVariant {
  id: string;
  weight: number; // 0-100, must sum to 100 across all variants
}

export interface ABTest {
  name: string;
  variants: ABTestVariant[];
}

// Get or assign a variant for a test
export function getVariant(testName: string, variants: ABTestVariant[]): string {
  const storageKey = `ab_test_${testName}`;
  
  // Check if user already has an assigned variant
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored && variants.some(v => v.id === stored)) {
        return stored;
      }
    } catch {
      // localStorage not available, fall through to random assignment
    }
  }
  
  // Assign new variant based on weights
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const variant of variants) {
    cumulative += variant.weight;
    if (random <= cumulative) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, variant.id);
        } catch {
          // localStorage not available, continue without persisting
        }
      }
      return variant.id;
    }
  }
  
  // Fallback to first variant
  return variants[0].id;
}

// Pre-configured tests
export const abTests = {
  // Hero headline test
  heroHeadline: {
    name: 'hero_headline_v1',
    variants: [
      { id: 'control', weight: 50 },      // "Execute Your Intent"
      { id: 'variant_a', weight: 25 },    // "Linux, But Smarter"
      { id: 'variant_b', weight: 25 },    // "AI-Powered Linux"
    ],
  },
  
  // Hero CTA test
  heroCTA: {
    name: 'hero_cta_v1',
    variants: [
      { id: 'control', weight: 50 },      // "Get Started"
      { id: 'variant_a', weight: 25 },    // "Try Cortex Free"
      { id: 'variant_b', weight: 25 },    // "Start Building"
    ],
  },
  
  // Hackathon CTA test
  hackathonCTA: {
    name: 'hackathon_cta_v1',
    variants: [
      { id: 'control', weight: 50 },      // "Join the Hackathon"
      { id: 'variant_a', weight: 50 },    // "Start Building Now"
    ],
  },
};

// Helper hook for React components
export function useABTest(test: ABTest): string {
  // This is a simple implementation - variant is determined on first render
  return getVariant(test.name, test.variants);
}

// Track which variant was shown (call this after render)
export function trackVariantView(testName: string, variantId: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ab_test_view', {
      test_name: testName,
      variant_id: variantId,
    });
  }
}

// Track conversion for a test
export function trackVariantConversion(testName: string, variantId: string, conversionType: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ab_test_conversion', {
      test_name: testName,
      variant_id: variantId,
      conversion_type: conversionType,
    });
  }
}
