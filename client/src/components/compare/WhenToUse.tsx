import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { type WhenToUse as WhenToUseType, type ComparisonData } from '@/data/comparisons';
import { type ComparisonEventContext, trackComparisonTrustSectionView } from '@/lib/comparison-analytics';

interface WhenToUseProps {
  comparison: ComparisonData;
  context: ComparisonEventContext;
}

export function WhenToUse({ comparison, context }: WhenToUseProps) {
  const handleSectionView = (sectionType: 'cortex_better' | 'competitor_better' | 'who_should_not_switch') => {
    trackComparisonTrustSectionView(context, sectionType);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            When to Use Which
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            We believe in honest comparisons. Here is when each tool excels and when you might want to stick with what you have.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6"
              onMouseEnter={() => handleSectionView('cortex_better')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Choose Cortex When...</h3>
              </div>
              <ul className="space-y-3">
                {comparison.whenToUse.cortexBetter.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-blue-400 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gray-500/5 border border-gray-500/20 rounded-xl p-6"
              onMouseEnter={() => handleSectionView('competitor_better')}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Choose {comparison.competitorDisplayName} When...</h3>
              </div>
              <ul className="space-y-3">
                {comparison.whenToUse.competitorBetter.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <CheckCircle className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-6"
            onMouseEnter={() => handleSectionView('who_should_not_switch')}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Who Should Not Switch Yet</h3>
            </div>
            <ul className="grid md:grid-cols-2 gap-3">
              {comparison.whenToUse.whoShouldNotSwitch.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <XCircle className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
