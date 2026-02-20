import { motion } from 'framer-motion';
import { ArrowRight, FileText, Shield, Zap, DollarSign } from 'lucide-react';
import { Link } from 'wouter';
import { type ComparisonData } from '@/data/comparisons';

interface InternalLinksProps {
  comparison: ComparisonData;
}

const iconMap: Record<string, typeof FileText> = {
  'Getting Started Guide': FileText,
  'Security Architecture': Shield,
  'Feature Overview': Zap,
  'Pricing': DollarSign,
};

export function InternalLinks({ comparison }: InternalLinksProps) {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-white mb-6 text-center">
            Learn More About CX Linux
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {comparison.internalLinks.map((link, index) => {
              const Icon = iconMap[link.text] || FileText;
              return (
                <Link
                  key={index}
                  href={link.href}
                  className="group flex items-center gap-3 p-4 rounded-lg bg-gray-900/50 border border-gray-800 hover:border-blue-500/30 hover:bg-gray-800/50 transition-all"
                  data-testid={`link-internal-${link.text.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="h-5 w-5 text-blue-300" />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {link.text}
                  </span>
                  <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-blue-300 ml-auto transition-colors" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
