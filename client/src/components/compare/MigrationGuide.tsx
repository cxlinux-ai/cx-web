import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Info } from 'lucide-react';
import { type MigrationStep, type ComparisonData } from '@/data/comparisons';

interface MigrationGuideProps {
  comparison: ComparisonData;
}

export function MigrationGuide({ comparison }: MigrationGuideProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Getting Started
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Ready to try CX? Here is how to get started alongside your existing {comparison.competitorDisplayName} workflow.
          </p>

          <div className="space-y-6">
            {comparison.migrationSteps.map((step, index) => (
              <MigrationStepCard
                key={index}
                step={step}
                isLast={index === comparison.migrationSteps.length - 1}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
              <Info className="h-4 w-4" />
              <span className="text-sm">No migration deadline—use both tools as long as you need</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

interface MigrationStepCardProps {
  step: MigrationStep;
  isLast: boolean;
}

function MigrationStepCard({ step, isLast }: MigrationStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: step.step * 0.1 }}
      className="relative"
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 font-bold">
            {step.step}
          </div>
          {!isLast && (
            <div className="w-px h-full bg-gradient-to-b from-blue-500/30 to-transparent mt-2" />
          )}
        </div>

        <div className="flex-1 pb-8">
          <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
          <p className="text-gray-400 mb-4">{step.description}</p>

          {step.command && (
            <div className="bg-black/50 rounded-lg p-4 mb-3 font-mono text-sm text-green-400 flex items-center gap-3">
              <Terminal className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <code className="overflow-x-auto">{step.command}</code>
            </div>
          )}

          {step.note && (
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{step.note}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
