import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import analytics from '@/lib/analytics';

export function usePageAnalytics() {
  const [location] = useLocation();
  const startTime = useRef(Date.now());
  const lastLocation = useRef(location);

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location,
        page_title: document.title,
      });
    }

    // Track navigation if location changed
    if (lastLocation.current !== location) {
      analytics.trackNavigation(lastLocation.current, location);
      lastLocation.current = location;
    }

    // Reset timer
    startTime.current = Date.now();

    // Track time on page when leaving
    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (timeSpent > 5) { // Only track if > 5 seconds
        analytics.trackTimeOnPage(location, timeSpent);
      }
    };
  }, [location]);
}

export function useScrollTracking() {
  const tracked = useRef(new Set<number>());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((window.scrollY / scrollHeight) * 100);
      
      // Track at 25%, 50%, 75%, 100% milestones
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !tracked.current.has(milestone)) {
          tracked.current.add(milestone);
          analytics.trackScrollDepth(milestone);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
