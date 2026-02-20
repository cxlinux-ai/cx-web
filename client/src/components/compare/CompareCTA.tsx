import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Github, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ABVariant, type ComparisonData } from '@/data/comparisons';
import { type ComparisonEventContext, trackComparisonCTAClick, trackComparisonInstallClick, trackComparisonGitHubClick, trackComparisonDocsClick } from '@/lib/comparison-analytics';

interface CompareCTAProps {
  comparison: ComparisonData;
  variant: ABVariant;
  context: ComparisonEventContext;
  placement: 'inline' | 'bottom';
}

export function CompareCTA({ comparison, variant, context, placement }: CompareCTAProps) {
  const ctaText = variant.ctaText || 'Try CX Free';
  const isStrong = variant.ctaStyle === 'strong';

  const handleInstall = () => {
    trackComparisonCTAClick(context, 'primary', ctaText, placement);
    trackComparisonInstallClick(context);
    window.location.href = '/getting-started';
  };

  const handleDocs = () => {
    trackComparisonDocsClick(context, '/getting-started');
    window.location.href = '/getting-started';
  };

  const handleGitHub = () => {
    trackComparisonGitHubClick(context);
    window.open('https://github.com/cxlinux-ai/cx-core', '_blank');
  };

  if (placement === 'inline') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to try a smarter approach?
            </h3>
            <p className="text-gray-400 mb-6">
              Install CX alongside your existing tools. No commitment, no migration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleInstall}
                className={`${isStrong ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
                data-testid="button-inline-cta-install"
              >
                <Terminal className="mr-2 h-5 w-5" />
                {ctaText}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDocs}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                data-testid="button-inline-cta-docs"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Read the Docs
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-blue-500/5">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start Building Smarter Today
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have simplified their Linux workflows with CX.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={handleInstall}
              className="bg-blue-600 hover:bg-blue-500 text-white text-lg px-8 py-6"
              data-testid="button-bottom-cta-install"
            >
              {ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleGitHub}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 text-lg px-8 py-6"
              data-testid="button-bottom-cta-github"
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 justify-center text-sm text-gray-500">
            <span>Free tier available</span>
            <span>Works offline</span>
            <span>No migration required</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
