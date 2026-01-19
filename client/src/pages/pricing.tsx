import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Building2, Rocket, Crown, ExternalLink, Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const STRIPE_PRICES = {
  pro: {
    monthly: 'price_1SpotMJ4X1wkC4EspVzV5tT6',
    annual: 'price_1SpotMJ4X1wkC4Es3tuZGVHY'
  },
  enterprise: {
    monthly: 'price_1SpotNJ4X1wkC4EsN13pV2dA',
    annual: 'price_1SpotNJ4X1wkC4Esw5ienNNQ'
  },
  managed: {
    monthly: 'price_1SpotOJ4X1wkC4Es7ZqOzh1H',
    annual: 'price_1SpotOJ4X1wkC4EslmMmWWZI'
  }
};

type TierKey = 'pro' | 'enterprise' | 'managed';

interface Tier {
  name: string;
  icon: typeof Sparkles;
  price: { monthly: number; annual: number };
  description: string;
  features: string[];
  cta: string;
  ctaLink?: string;
  stripeKey?: TierKey;
  highlighted: boolean;
  badge?: string;
}

const tiers: Tier[] = [
  {
    name: 'Core',
    icon: Rocket,
    price: { monthly: 0, annual: 0 },
    description: 'Everything you need to get started',
    features: [
      'Full CLI commands',
      'Natural language to apt',
      'Local LLM (Ollama)',
      'Dry-run safety mode',
      'Rollback support',
      'Hardware detection',
      'Network diagnostics',
      'Basic security audit',
      '1 system'
    ],
    cta: 'Download Free',
    ctaLink: 'https://github.com/cortexlinux/cortex',
    highlighted: false
  },
  {
    name: 'Core+',
    icon: Sparkles,
    price: { monthly: 20, annual: 192 },
    description: 'Unlimited systems for commercial use',
    features: [
      'Everything in Core',
      'Unlimited systems',
      'Commercial use permitted',
      'Email support (48hr)',
      'License management portal'
    ],
    cta: 'Start Free Trial',
    stripeKey: 'pro',
    highlighted: false,
    badge: 'PER SYSTEM'
  },
  {
    name: 'Pro',
    icon: Building2,
    price: { monthly: 99, annual: 948 },
    description: 'Cloud AI power for teams',
    features: [
      'Everything in Core+',
      'Cloud LLM fallback (Claude/GPT-4)',
      'Team management dashboard',
      'Usage analytics',
      'Audit logging',
      'REST API access',
      'Early access to features',
      'Priority support (24hr)',
      '25 systems included',
      '+$10/system beyond 25'
    ],
    cta: 'Start Free Trial',
    stripeKey: 'enterprise',
    highlighted: true,
    badge: 'MOST POPULAR'
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: { monthly: 299, annual: 2868 },
    description: 'Full compliance & dedicated support',
    features: [
      'Everything in Pro',
      'Web admin console',
      'SSO/SAML integration',
      'Compliance reports (SOC2, HIPAA, ISO 27001)',
      'Air-gapped deployment',
      'Custom integrations',
      '99.9% SLA guarantee',
      'Dedicated support channel',
      'Quarterly business reviews',
      '100 systems included',
      '+$5/system beyond 100'
    ],
    cta: 'Schedule Demo',
    ctaLink: 'https://calendly.com/cortexlinux/demo',
    highlighted: false
  }
];

const comparisonFeatures = [
  ['Local LLM (Ollama)', true, true, true, true],
  ['Cloud LLM Fallback', false, false, true, true],
  ['Team Dashboard', false, false, true, true],
  ['Systems', '1', 'Unlimited', '25 included', '100 included'],
  ['Additional Systems', '-', '$20/each', '$10/each', '$5/each'],
  ['License', 'BSL 1.1', 'Commercial', 'Commercial', 'Commercial'],
  ['SSO/SAML', false, false, false, true],
  ['Audit Logs', false, false, true, true],
  ['Compliance Reports', false, false, false, true],
  ['SLA', 'None', 'None', 'None', '99.9%'],
  ['Support', 'Community', 'Email (48hr)', 'Priority (24hr)', 'Dedicated'],
  ['Air-gapped Deployment', false, false, false, true],
];

const faqs = [
  {
    q: 'Can I try before I buy?',
    a: 'Yes! All paid plans include a 14-day free trial. No credit card required to start.'
  },
  {
    q: 'What happens if I exceed my server limit?',
    a: "We'll notify you and give you the option to upgrade. We won't cut off your access."
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Absolutely. Upgrade or downgrade at any time. We prorate charges automatically.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'Yes, 30-day money-back guarantee on all paid plans, no questions asked.'
  }
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.pricing);
    return cleanup;
  }, []);

  const handleCheckout = async (tier: Tier) => {
    if (!tier.stripeKey) {
      if (tier.ctaLink) {
        window.open(tier.ctaLink, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const priceId = annual 
      ? STRIPE_PRICES[tier.stripeKey].annual
      : STRIPE_PRICES[tier.stripeKey].monthly;

    // Check if price ID is configured
    if (!priceId) {
      toast({
        title: "Coming Soon",
        description: `${tier.name} ${annual ? 'annual' : 'monthly'} pricing is not yet available. Please try monthly billing or contact us.`,
        variant: "default"
      });
      return;
    }

    setLoading(tier.name);

    try {
      const response = await apiRequest('POST', '/api/stripe/create-checkout-session', { 
        priceId,
        annual 
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.message || "Unable to start checkout. Please try again.";
      toast({
        title: "Checkout Unavailable",
        description: errorMessage.includes("being set up") 
          ? "This plan is currently being configured. Please try again later or contact support@cortexlinux.com"
          : errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Simple, Transparent</span>{" "}
            <span className="gradient-text">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start free, scale as you grow. All plans include a 14-day free trial.
          </p>

          {/* Annual Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span 
              className={`text-sm font-medium transition-colors ${annual ? 'text-gray-500' : 'text-white'}`}
              data-testid="text-monthly-label"
            >
              Monthly
            </span>
            <Switch
              checked={annual}
              onCheckedChange={setAnnual}
              data-testid="toggle-annual"
            />
            <span 
              className={`text-sm font-medium transition-colors ${annual ? 'text-white' : 'text-gray-500'}`}
              data-testid="text-annual-label"
            >
              Annual <span className="text-terminal-green text-xs">(Save 10%)</span>
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500 lg:scale-105'
                    : 'bg-white/5 border border-white/10'
                }`}
                data-testid={`pricing-card-${tier.name.toLowerCase()}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${tier.highlighted ? 'bg-blue-500/20' : 'bg-white/10'}`}>
                    <Icon size={20} className={tier.highlighted ? 'text-blue-300' : 'text-gray-300'} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                </div>
                
                <p className="text-gray-400 text-sm h-10">{tier.description}</p>
                
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-bold text-white">
                    ${annual ? Math.round(tier.price.annual / 12) : tier.price.monthly}
                  </span>
                  <span className="text-gray-400">/mo</span>
                  {annual && tier.price.annual > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${tier.price.annual} billed annually
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => handleCheckout(tier)}
                  disabled={loading === tier.name}
                  variant={tier.highlighted ? "default" : tier.price.monthly === 0 ? "secondary" : "outline"}
                  className={`w-full ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-blue-600'
                      : ''
                  }`}
                  data-testid={`button-checkout-${tier.name.toLowerCase()}`}
                >
                  {loading === tier.name ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {tier.cta}
                      {tier.ctaLink && <ExternalLink size={14} />}
                    </>
                  )}
                </Button>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-terminal-green mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-12">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Community</th>
                  <th className="text-center py-4 px-4 text-blue-300 font-medium bg-blue-900/10">Pro</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Enterprise</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-medium">Managed</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {comparisonFeatures.map(([feature, ...values], i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-gray-300">{feature}</td>
                    {values.map((val, j) => (
                      <td key={j} className={`py-3 px-4 text-center ${j === 1 ? 'bg-blue-900/5' : ''}`}>
                        {typeof val === 'boolean' ? (
                          val ? (
                            <Check size={16} className="text-terminal-green mx-auto" />
                          ) : (
                            <span className="text-gray-600">—</span>
                          )
                        ) : (
                          <span className="text-white">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="text-gray-500 mb-4">Enterprise-ready security</p>
          <div className="flex justify-center items-center gap-8 text-gray-400 flex-wrap">
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">SOC2 Ready</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">HIPAA Ready</span>
            <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm">GDPR Compliant</span>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-white mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <h3 className="font-semibold text-lg text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
