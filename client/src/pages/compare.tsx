import { useEffect, useMemo } from 'react';
import { useParams, Redirect } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { getComparisonBySlug, getAllComparisonSlugs, type ComparisonData } from '@/data/comparisons';
import { useComparisonABTest } from '@/lib/comparison-ab-testing';
import { initComparisonAnalytics, type ComparisonEventContext } from '@/lib/comparison-analytics';
import {
  CompareHero,
  FeatureTable,
  UseCases,
  WhenToUse,
  MigrationGuide,
  CompareFAQ,
  CompareCTA,
  InternalLinks,
} from '@/components/compare';
import Footer from '@/components/Footer';

export default function ComparePage() {
  const params = useParams<{ competitor: string }>();
  const competitor = params.competitor || '';
  
  const comparison = getComparisonBySlug(competitor);
  
  if (!comparison) {
    return <Redirect to="/404" />;
  }
  
  return <ComparePageContent comparison={comparison} />;
}

interface ComparePageContentProps {
  comparison: ComparisonData;
}

function ComparePageContent({ comparison }: ComparePageContentProps) {
  const { variant, isOrganicTraffic, trafficSource } = useComparisonABTest(comparison);
  
  const context: ComparisonEventContext = useMemo(() => ({
    competitor: comparison.slug,
    variantId: variant.id,
    trafficSource,
  }), [comparison.slug, variant.id, trafficSource]);
  
  useEffect(() => {
    document.title = comparison.seo.title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', comparison.seo.description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = comparison.seo.description;
      document.head.appendChild(meta);
    }
    
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', comparison.seo.keywords.join(', '));
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = comparison.seo.keywords.join(', ');
      document.head.appendChild(meta);
    }
    
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://cxlinux-ai.com${comparison.seo.canonicalPath}`);
    } else {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', `https://cxlinux-ai.com${comparison.seo.canonicalPath}`);
      document.head.appendChild(canonical);
    }
    
    const cleanup = initComparisonAnalytics(context);
    
    return () => {
      cleanup();
    };
  }, [comparison, context]);
  
  const showInlineCTA = variant.ctaPlacement === 'after-use-cases' || variant.ctaPlacement === 'both';
  const showBottomCTA = variant.ctaPlacement === 'above-fold' || variant.ctaPlacement === 'both';
  
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-16 left-0 right-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            data-testid="link-back-home"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </nav>
      
      <CompareHero
        comparison={comparison}
        variant={variant}
        context={context}
      />
      
      <FeatureTable
        comparison={comparison}
        context={context}
      />
      
      <UseCases
        comparison={comparison}
        context={context}
      />
      
      {showInlineCTA && (
        <CompareCTA
          comparison={comparison}
          variant={variant}
          context={context}
          placement="inline"
        />
      )}
      
      <WhenToUse
        comparison={comparison}
        context={context}
      />
      
      <MigrationGuide comparison={comparison} />
      
      <CompareFAQ
        comparison={comparison}
        context={context}
      />
      
      <InternalLinks comparison={comparison} />
      
      {showBottomCTA && (
        <CompareCTA
          comparison={comparison}
          variant={variant}
          context={context}
          placement="bottom"
        />
      )}
      
      <OtherComparisons currentSlug={comparison.slug} />
      
      <Footer />
    </div>
  );
}

function OtherComparisons({ currentSlug }: { currentSlug: string }) {
  const allSlugs = getAllComparisonSlugs();
  const otherSlugs = allSlugs.filter(slug => slug !== currentSlug);
  
  if (otherSlugs.length === 0) return null;
  
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-lg font-semibold text-white mb-6">
          Other Comparisons
        </h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {otherSlugs.map(slug => {
            const comp = getComparisonBySlug(slug);
            if (!comp) return null;
            return (
              <Link
                key={slug}
                href={`/compare/${slug}`}
                className="px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 text-gray-300 hover:text-white transition-all"
                data-testid={`link-compare-${slug}`}
              >
                vs {comp.competitorDisplayName}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
