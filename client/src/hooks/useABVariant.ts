import { useEffect, useState } from 'react';
import { 
  Variant, 
  ABTestConfig,
  getVariant, 
  getGlobalTestRegistry,
  trackEvent,
  defaultVariant 
} from '@/lib/ab-testing';

export function useABVariant(test: ABTestConfig) {
  const [variant, setVariant] = useState<Variant>(defaultVariant);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const registry = getGlobalTestRegistry();
    
    if (!registry.has(test.testId)) {
      registry.set(test.testId, test);
    }
    
    const selectedVariant = getVariant(test.testId, registry);
    if (selectedVariant) {
      setVariant(selectedVariant);
    }
    setIsLoaded(true);
  }, [test.testId]);

  const trackClick = (element?: string) => {
    trackEvent(test.testId, 'ab_test_click', { element });
  };

  const trackConversion = (conversionType: string, value?: number) => {
    trackEvent(test.testId, 'ab_test_conversion', { conversion_type: conversionType, value });
  };

  return { variant, isLoaded, trackClick, trackConversion };
}

export function useLegacyABVariant(test: { name: string; variants: { id: string; weight: number }[] }) {
  const [variantId, setVariantId] = useState<string>('control');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const abTest: ABTestConfig = {
      testId: test.name,
      variants: test.variants.map(v => ({ ...v, content: {} })),
      metrics: [],
      status: 'active',
      startDate: new Date(0),
    };
    
    const registry = getGlobalTestRegistry();
    registry.set(test.name, abTest);
    
    const selectedVariant = getVariant(test.name, registry);
    if (selectedVariant) {
      setVariantId(selectedVariant.id);
    }
    setIsLoaded(true);
  }, [test.name]);

  return { variant: variantId, isLoaded };
}
