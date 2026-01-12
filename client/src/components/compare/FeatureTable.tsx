import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { type ComparisonFeature, type ComparisonData } from '@/data/comparisons';
import { type ComparisonEventContext, trackComparisonFeatureView } from '@/lib/comparison-analytics';

interface FeatureTableProps {
  comparison: ComparisonData;
  context: ComparisonEventContext;
}

export function FeatureTable({ comparison, context }: FeatureTableProps) {
  const handleFeatureHover = (featureName: string) => {
    trackComparisonFeatureView(context, featureName);
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
            Feature Comparison
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            A detailed look at how Cortex Linux and {comparison.competitorDisplayName} compare across key features.
          </p>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="py-4 px-6 text-left text-gray-300 font-semibold">Feature</th>
                    <th className="py-4 px-6 text-center text-blue-400 font-semibold">Cortex Linux</th>
                    <th className="py-4 px-6 text-center text-gray-400 font-semibold">{comparison.competitorDisplayName}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.features.map((feature, index) => (
                    <tr
                      key={index}
                      className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      onMouseEnter={() => handleFeatureHover(feature.name)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{feature.name}</span>
                          {feature.tooltip && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{feature.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon status={feature.cortex} />
                          {feature.cortexNote && (
                            <span className="text-xs text-gray-400 text-center">{feature.cortexNote}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col items-center gap-1">
                          <StatusIcon status={feature.competitor} />
                          {feature.competitorNote && (
                            <span className="text-xs text-gray-500 text-center">{feature.competitorNote}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Full Support</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              <span>Partial Support</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span>Not Supported</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatusIcon({ status }: { status: 'yes' | 'no' | 'partial' }) {
  switch (status) {
    case 'yes':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'no':
      return <XCircle className="h-5 w-5 text-red-400" />;
    case 'partial':
      return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
  }
}
