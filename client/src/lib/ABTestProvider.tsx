import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  ABTestConfig,
  ABTestContextValue,
  ABTestResult,
  Variant,
  getVariant,
  trackEvent,
  trackClick,
  trackScroll,
  trackConversion,
  isTestActive,
  getGlobalTestRegistry,
  registerTests,
  defaultVariant,
} from './ab-testing';

const ABTestContext = createContext<ABTestContextValue | null>(null);

interface ABTestProviderProps {
  children: ReactNode;
  tests: ABTestConfig[];
}

export function ABTestProvider({ children, tests }: ABTestProviderProps) {
  const [testRegistry] = useState<Map<string, ABTestConfig>>(() => {
    const registry = new Map<string, ABTestConfig>();
    tests.forEach(test => registry.set(test.testId, test));
    return registry;
  });
  const [variantCache] = useState<Map<string, Variant>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    registerTests(tests);
    
    tests.forEach(test => {
      if (isTestActive(test)) {
        const variant = getVariant(test.testId, testRegistry);
        if (variant) {
          variantCache.set(test.testId, variant);
        }
      }
    });
    
    setIsInitialized(true);
  }, [tests, testRegistry, variantCache]);
  
  const getTest = useCallback((testId: string): ABTestConfig | undefined => {
    return testRegistry.get(testId);
  }, [testRegistry]);
  
  const getVariantFromContext = useCallback((testId: string): Variant | null => {
    if (variantCache.has(testId)) {
      return variantCache.get(testId)!;
    }
    
    const variant = getVariant(testId, testRegistry);
    if (variant) {
      variantCache.set(testId, variant);
    }
    return variant;
  }, [testRegistry, variantCache]);
  
  const trackEventFromContext = useCallback((testId: string, event: string, data?: Record<string, any>) => {
    trackEvent(testId, event, data);
  }, []);
  
  const contextValue: ABTestContextValue = {
    getTest,
    getVariant: getVariantFromContext,
    trackEvent: trackEventFromContext,
    isInitialized,
  };
  
  return (
    <ABTestContext.Provider value={contextValue}>
      {children}
    </ABTestContext.Provider>
  );
}

export function useABTestContext(): ABTestContextValue | null {
  return useContext(ABTestContext);
}

export function useABTest(testId: string): ABTestResult {
  const context = useContext(ABTestContext);
  const [variant, setVariant] = useState<Variant | null>(null);
  
  useEffect(() => {
    let selectedVariant: Variant | null = null;
    
    if (context) {
      selectedVariant = context.getVariant(testId);
    } else {
      selectedVariant = getVariant(testId, getGlobalTestRegistry());
    }
    
    if (selectedVariant) {
      setVariant(selectedVariant);
    }
  }, [testId, context]);
  
  const handleTrackClick = useCallback((element?: string) => {
    if (context) {
      context.trackEvent(testId, 'ab_test_click', { element });
    } else {
      trackClick(testId, element);
    }
  }, [testId, context]);
  
  const handleTrackScroll = useCallback((depth: number) => {
    if (context) {
      context.trackEvent(testId, 'ab_test_scroll', { scroll_depth: depth });
    } else {
      trackScroll(testId, depth);
    }
  }, [testId, context]);
  
  const handleTrackConversion = useCallback((conversionType: string, value?: number) => {
    if (context) {
      context.trackEvent(testId, 'ab_test_conversion', { conversion_type: conversionType, value });
    } else {
      trackConversion(testId, conversionType, value);
    }
  }, [testId, context]);
  
  const handleTrackEvent = useCallback((event: string, data?: Record<string, any>) => {
    if (context) {
      context.trackEvent(testId, event, data);
    } else {
      trackEvent(testId, event, data);
    }
  }, [testId, context]);
  
  return {
    variant: variant || defaultVariant,
    trackClick: handleTrackClick,
    trackScroll: handleTrackScroll,
    trackConversion: handleTrackConversion,
    trackEvent: handleTrackEvent,
  };
}

export { ABTestContext };
