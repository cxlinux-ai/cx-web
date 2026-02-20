import { motion } from 'framer-motion';
import { Clock, Terminal, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { type UseCase, type ComparisonData } from '@/data/comparisons';
import { type ComparisonEventContext, trackComparisonUseCaseView } from '@/lib/comparison-analytics';

interface UseCasesProps {
  comparison: ComparisonData;
  context: ComparisonEventContext;
}

export function UseCases({ comparison, context }: UseCasesProps) {
  const handleUseCaseView = (title: string) => {
    trackComparisonUseCaseView(context, title);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Real-World Use Cases
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            See how CX Linux compares to {comparison.competitorDisplayName} in common scenarios developers face every day.
          </p>

          <div className="space-y-8">
            {comparison.useCases.map((useCase, index) => (
              <UseCaseCard
                key={index}
                useCase={useCase}
                competitorName={comparison.competitorDisplayName}
                onView={() => handleUseCaseView(useCase.title)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface UseCaseCardProps {
  useCase: UseCase;
  competitorName: string;
  onView: () => void;
}

function UseCaseCard({ useCase, competitorName, onView }: UseCaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden"
      onMouseEnter={onView}
    >
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
        <p className="text-gray-400">{useCase.description}</p>
      </div>

      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <h4 className="font-semibold text-blue-300">With CX Linux</h4>
          </div>

          <div className="bg-black/50 rounded-lg p-4 mb-4 font-mono text-sm text-green-400 overflow-x-auto">
            <code>{useCase.cortexCommand}</code>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="h-4 w-4 text-blue-300" />
              <span>{useCase.cortexTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Terminal className="h-4 w-4 text-blue-300" />
              <span>{useCase.cortexSteps} step{useCase.cortexSteps > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <h4 className="font-semibold text-gray-400">With {competitorName}</h4>
          </div>

          <div className="bg-black/50 rounded-lg p-4 mb-4 font-mono text-xs text-gray-400 overflow-x-auto max-h-32 overflow-y-auto">
            {useCase.competitorCommands.map((cmd, i) => (
              <div key={i} className="py-0.5">
                <code>{cmd}</code>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{useCase.competitorTime}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Terminal className="h-4 w-4" />
              <span>{useCase.competitorSteps} steps</span>
            </div>
            <div className="flex items-center gap-2">
              <ErrorRiskBadge risk={useCase.errorRisk} />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-800/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Time saved: {useCase.timeSaved}</span>
        </div>
        <ArrowRight className="h-5 w-5 text-gray-500" />
      </div>
    </motion.div>
  );
}

function ErrorRiskBadge({ risk }: { risk: 'low' | 'medium' | 'high' }) {
  const colors = {
    low: 'text-green-400 bg-green-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    high: 'text-red-400 bg-red-400/10',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[risk]}`}>
      {risk} error risk
    </span>
  );
}
