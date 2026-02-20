import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { type FAQItem, type ComparisonData } from '@/data/comparisons';
import { type ComparisonEventContext, trackComparisonFAQExpand } from '@/lib/comparison-analytics';

interface CompareFAQProps {
  comparison: ComparisonData;
  context: ComparisonEventContext;
}

export function CompareFAQ({ comparison, context }: CompareFAQProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleExpand = (index: number) => {
    if (expandedIndex !== index) {
      trackComparisonFAQExpand(context, comparison.faqs[index].question);
    }
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const faqSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: comparison.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }), [comparison.faqs]);

  useEffect(() => {
    const existingScript = document.querySelector('script[data-faq-schema="compare"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-faq-schema', 'compare');
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[data-faq-schema="compare"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [faqSchema]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Common questions about using CX Linux alongside or instead of {comparison.competitorDisplayName}.
          </p>

          <div className="space-y-4">
            {comparison.faqs.map((faq, index) => (
              <FAQAccordionItem
                key={index}
                faq={faq}
                isExpanded={expandedIndex === index}
                onToggle={() => handleExpand(index)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface FAQAccordionItemProps {
  faq: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

function FAQAccordionItem({ faq, isExpanded, onToggle }: FAQAccordionItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/30 transition-colors"
        data-testid={`button-faq-${faq.question.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span className="font-medium text-white pr-4">{faq.question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className="px-6 pb-4 text-gray-400 leading-relaxed">
          {faq.answer}
        </div>
      </motion.div>
    </motion.div>
  );
}
