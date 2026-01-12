import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, Sparkles } from 'lucide-react';
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

  const cortexWins = comparison.features.filter(
    f => f.cortex === 'yes' && f.competitor !== 'yes'
  ).length;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <span 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
              data-testid="badge-cortex-leads-count"
            >
              <Sparkles className="h-4 w-4" />
              {cortexWins} features where Cortex leads
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Feature Comparison
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              See exactly how Cortex Linux compares to {comparison.competitorDisplayName} across every important feature.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800/80 via-gray-800/60 to-gray-800/80">
                    <th className="py-5 px-6 text-left text-gray-300 font-semibold text-sm uppercase tracking-wide">
                      Feature
                    </th>
                    <th className="py-5 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-blue-400 font-bold text-lg">Cortex Linux</span>
                        <span className="text-xs text-blue-400/60">Our solution</span>
                      </div>
                    </th>
                    <th className="py-5 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-400 font-semibold">{comparison.competitorDisplayName}</span>
                        <span className="text-xs text-gray-500">Competitor</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.features.map((feature, index) => {
                    const cortexAdvantage = feature.cortex === 'yes' && feature.competitor !== 'yes';
                    
                    return (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        data-testid={`row-feature-${index}`}
                        className={`
                          border-t border-gray-800/50 transition-all duration-200
                          ${cortexAdvantage 
                            ? 'bg-blue-500/5 hover:bg-blue-500/10' 
                            : 'hover:bg-gray-800/30'
                          }
                        `}
                        onMouseEnter={() => handleFeatureHover(feature.name)}
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            {cortexAdvantage && (
                              <span className="flex-shrink-0 w-1.5 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full" />
                            )}
                            <span className={`font-medium ${cortexAdvantage ? 'text-white' : 'text-gray-200'}`}>
                              {feature.name}
                            </span>
                            {feature.tooltip && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-gray-500 hover:text-gray-300 transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col items-center gap-1.5">
                            <StatusIcon status={feature.cortex} enhanced={cortexAdvantage} />
                            {feature.cortexNote && (
                              <span className="text-xs text-blue-300/80 text-center max-w-[140px]">
                                {feature.cortexNote}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col items-center gap-1.5">
                            <StatusIcon status={feature.competitor} />
                            {feature.competitorNote && (
                              <span className="text-xs text-gray-500 text-center max-w-[140px]">
                                {feature.competitorNote}
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-8 justify-center text-sm">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-green-300">Full Support</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span className="text-yellow-300">Partial Support</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">Not Supported</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function StatusIcon({ status, enhanced = false }: { status: 'yes' | 'no' | 'partial'; enhanced?: boolean }) {
  switch (status) {
    case 'yes':
      return (
        <div className="relative flex items-center justify-center">
          <CheckCircle 
            className={`h-6 w-6 text-green-400 ${enhanced ? 'drop-shadow-sm' : ''}`}
            data-testid={`icon-status-yes${enhanced ? '-enhanced' : ''}`}
          />
        </div>
      );
    case 'no':
      return <XCircle className="h-6 w-6 text-red-400/80" data-testid="icon-status-no" />;
    case 'partial':
      return <AlertTriangle className="h-6 w-6 text-yellow-400/90" data-testid="icon-status-partial" />;
  }
}
