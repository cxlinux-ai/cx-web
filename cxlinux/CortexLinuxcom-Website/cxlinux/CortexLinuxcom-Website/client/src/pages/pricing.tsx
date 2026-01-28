import { useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-pricing-table': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        'pricing-table-id': string;
        'publishable-key': string;
      }, HTMLElement>;
    }
  }
}

export default function PricingPage() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.pricing);
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <p className="text-blue-300 text-sm font-medium tracking-wide uppercase mb-3">Pricing</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Simple <span className="gradient-text">Transparent Pricing</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Start free, scale as you grow. All plans include a 14-day free trial.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <stripe-pricing-table 
              pricing-table-id="prctbl_1SrakHJ4X1wkC4EsY9tE8FA1"
              publishable-key="pk_live_51SplqUJ4X1wkC4Es4QV9JMmATE8vnJVloUTSC0pW1nNjr1soLEjB4shXfEfnoYRVm8K3vSzgCO6f2XrtTERLkWoH00u2jgUrQM"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-400" />
              <span>30-day money back</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={14} className="text-gray-400" />
              <span>Secure payment via Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-gray-400" />
              <span>Cancel anytime</span>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
