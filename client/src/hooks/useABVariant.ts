import { useEffect, useState } from 'react';
import { getVariant, trackVariantView } from '@/lib/ab-testing';

export function useABVariant(test: { name: string; variants: { id: string; weight: number }[] }) {
  const [variant, setVariant] = useState<string>('control');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const selectedVariant = getVariant(test.name, test.variants);
    setVariant(selectedVariant);
    setIsLoaded(true);
    
    // Track that this variant was viewed
    trackVariantView(test.name, selectedVariant);
  }, [test.name]);

  return { variant, isLoaded };
}
