import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ABVariant, type ComparisonData } from '@/data/comparisons';
import { type ComparisonEventContext, trackComparisonCTAClick } from '@/lib/comparison-analytics';

interface CompareHeroProps {
  comparison: ComparisonData;
  variant: ABVariant;
  context: ComparisonEventContext;
}

export function CompareHero({ comparison, variant, context }: CompareHeroProps) {
  const headline = variant.headline || `CX Linux vs ${comparison.competitorDisplayName}`;
  const subheadline = variant.subheadline || comparison.tagline;
  const ctaText = variant.ctaText || 'Try CX Free';
  const ctaSecondary = variant.ctaSecondary || 'View Documentation';

  const handlePrimaryCTA = () => {
    trackComparisonCTAClick(context, 'primary', ctaText, 'hero');
    window.location.href = '/getting-started';
  };

  const handleSecondaryCTA = () => {
    trackComparisonCTAClick(context, 'secondary', ctaSecondary, 'hero');
    window.location.href = '/getting-started';
  };

  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 mb-6">
            Comparison Guide
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">{headline.split(' vs ')[0]}</span>
            <span className="text-gray-400"> vs </span>
            <span className="gradient-text">{headline.split(' vs ')[1] || comparison.competitorDisplayName}</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {subheadline}
          </p>

          {(variant.ctaPlacement === 'above-fold' || variant.ctaPlacement === 'both') && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={handlePrimaryCTA}
                className={`${variant.ctaStyle === 'strong' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                data-testid="button-hero-cta-primary"
              >
                {ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleSecondaryCTA}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                data-testid="button-hero-cta-secondary"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                {ctaSecondary}
              </Button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Quick Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="py-2 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="py-2 px-4 text-blue-300 font-medium">CX Linux</th>
                  <th className="py-2 px-4 text-gray-400 font-medium">{comparison.competitorDisplayName}</th>
                </tr>
              </thead>
              <tbody>
                {comparison.summaryTable.map((row, index) => (
                  <tr key={index} className="border-b border-gray-800/50">
                    <td className="py-3 px-4 text-gray-300">{row.label}</td>
                    <td className="py-3 px-4 text-white font-medium">{row.cortex}</td>
                    <td className="py-3 px-4 text-gray-400">{row.competitor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function getStatusIcon(status: 'yes' | 'no' | 'partial') {
  switch (status) {
    case 'yes':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'no':
      return <XCircle className="h-5 w-5 text-red-400" />;
    case 'partial':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
  }
}
