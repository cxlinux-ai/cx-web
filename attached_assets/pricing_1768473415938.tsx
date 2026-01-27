import React, { useState } from 'react';

const STRIPE_PRICES = {
  pro: {
    monthly: 'price_1SplSDJYu2dtDKcZK5xtW7Mx',
    annual: 'price_1SplW0JYu2dtDKcZY2LnD5qE'
  },
  team: {
    monthly: 'price_1SplWCJYu2dtDKcZ3gvLplfr', // UPDATE: Will need new Stripe price for Team
    annual: 'price_1SplWCJYu2dtDKcZCn2ZHFxm'  // UPDATE: Will need new Stripe price for Team
  },
  enterprise: {
    monthly: 'price_1SplWGJYu2dtDKcZJBiik4mV',
    annual: 'price_1SplWHJYu2dtDKcZgG2RvuFx'
  },
  managed: {
    monthly: 'price_1SplWMJYu2dtDKcZNewManaged', // UPDATE: Will need new Stripe price for Managed
    annual: 'price_1SplWNJYu2dtDKcZNewManagedAnnual'  // UPDATE: Will need new Stripe price for Managed
  }
};

const tiers = [
  {
    name: 'Community',
    price: { monthly: 0, annual: 0 },
    description: 'Perfect for learning and personal projects',
    features: [
      'Local LLM (Mistral 7B)',
      'Full CLI access',
      'Community Discord',
      'Basic documentation',
      '1 server'
    ],
    cta: 'Download Free',
    ctaLink: '/download',
    highlighted: false
  },
  {
    name: 'Pro',
    price: { monthly: 20, annual: 192 },
    description: 'For professionals who need cloud AI power',
    features: [
      'Everything in Community',
      'Cloud LLMs (GPT-4, Claude)',
      'Web Console',
      'Email support',
      'Up to 3 servers',
      '90-day history'
    ],
    cta: 'Start Free Trial',
    stripeKey: 'pro',
    highlighted: false
  },
  {
    name: 'Team',
    price: { monthly: 99, annual: 948 },
    description: 'Growth tier for startups and scaling teams',
    features: [
      'Everything in Pro',
      'Up to 25 systems (flat rate)',
      'Team collaboration features',
      'Advanced analytics',
      'Priority support',
      '1-year history retention',
      'Slack/Teams integration'
    ],
    cta: 'Start Free Trial',
    stripeKey: 'team',
    highlighted: true
  },
  {
    name: 'Enterprise',
    price: { monthly: 199, annual: 1908 },
    description: 'For large teams requiring compliance & security',
    features: [
      'Everything in Team',
      'SSO/LDAP integration',
      'Audit logs & compliance reports',
      'SOC2, HIPAA, GDPR ready',
      'Up to 100 servers',
      '99.9% SLA',
      'Dedicated support channel'
    ],
    cta: 'Start Free Trial',
    stripeKey: 'enterprise',
    highlighted: false
  },
  {
    name: 'Managed',
    price: { monthly: 399, annual: 3828 },
    description: 'We handle everything for you',
    features: [
      'Everything in Enterprise',
      'Fully managed infrastructure',
      '24/7 dedicated support team',
      'Custom integrations & development',
      'Unlimited servers',
      '99.99% SLA guarantee',
      'Dedicated Customer Success Manager'
    ],
    cta: 'Schedule Demo',
    ctaLink: 'https://calendly.com/cxlinux-ai/demo',
    highlighted: false
  }
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const handleCheckout = async (tier: typeof tiers[0]) => {
    if (!tier.stripeKey) {
      window.location.href = tier.ctaLink || '/download';
      return;
    }

    const priceId = annual 
      ? STRIPE_PRICES[tier.stripeKey as keyof typeof STRIPE_PRICES].annual
      : STRIPE_PRICES[tier.stripeKey as keyof typeof STRIPE_PRICES].monthly;

    // Redirect to Stripe Checkout
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });
    
    const { url } = await response.json();
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <div className="text-center pt-20 pb-12 px-4">
        <h1 className="text-5xl font-bold mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Start free, scale as you grow. All plans include a 14-day free trial.
        </p>
        
        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={annual ? 'text-gray-500' : 'text-white font-medium'}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              annual ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
              annual ? 'translate-x-8' : 'translate-x-1'
            }`} />
          </button>
          <span className={annual ? 'text-white font-medium' : 'text-gray-500'}>
            Annual <span className="text-green-400 text-sm">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 ${
                tier.highlighted
                  ? 'bg-gradient-to-b from-blue-600/20 to-purple-600/20 border-2 border-blue-500 scale-105'
                  : 'bg-gray-900/50 border border-gray-800'
              }`}
            >
              {tier.highlighted && (
                <div className="text-center mb-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold">{tier.name}</h3>
              <p className="text-gray-400 text-sm mt-1 h-10">{tier.description}</p>
              
              <div className="mt-4 mb-6">
                <span className="text-4xl font-bold">
                  ${annual ? Math.round(tier.price.annual / 12) : tier.price.monthly}
                </span>
                <span className="text-gray-400">/mo</span>
                {annual && tier.price.annual > 0 && (
                  <p className="text-sm text-gray-500">
                    ${tier.price.annual} billed annually
                  </p>
                )}
              </div>

              <button
                onClick={() => handleCheckout(tier)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                    : tier.price.monthly === 0
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {tier.cta}
              </button>

              <ul className="mt-6 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-4 px-4">Feature</th>
                <th className="text-center py-4 px-4">Community</th>
                <th className="text-center py-4 px-4">Pro</th>
                <th className="text-center py-4 px-4 bg-green-900/20">Team</th>
                <th className="text-center py-4 px-4">Enterprise</th>
                <th className="text-center py-4 px-4">Managed</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                ['Local LLM (Mistral 7B)', '✓', '✓', '✓', '✓', '✓'],
                ['Cloud LLMs (GPT/Claude)', '—', '✓', '✓', '✓', '✓'],
                ['Web Console', '—', '✓', '✓', '✓', '✓'],
                ['Servers', '1', '3', '25', '100', '∞'],
                ['History Retention', '7 days', '90 days', '1 year', '2 years', '∞'],
                ['Team Collaboration', '—', '—', '✓', '✓', '✓'],
                ['Advanced Analytics', '—', '—', '✓', '✓', '✓'],
                ['SSO/LDAP', '—', '—', '—', '✓', '✓'],
                ['Audit Logs', '—', '—', '—', '✓', '✓'],
                ['Compliance Reports', '—', '—', '—', '✓', '✓'],
                ['SLA', '—', '—', '—', '99.9%', '99.99%'],
                ['Support', 'Community', 'Email', 'Priority', 'Dedicated', '24/7 Dedicated'],
                ['Managed Infrastructure', '—', '—', '—', '—', '✓'],
              ].map(([feature, ...values], i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  <td className="py-3 px-4 text-gray-300">{feature}</td>
                  {values.map((val, j) => (
                    <td key={j} className={`py-3 px-4 text-center ${j === 2 ? 'bg-green-900/10' : ''}`}>
                      <span className={val === '✓' ? 'text-green-400' : val === '—' ? 'text-gray-600' : 'text-white'}>
                        {val}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="text-center pb-20">
        <p className="text-gray-500 mb-4">Enterprise-ready security</p>
        <div className="flex justify-center gap-8 text-gray-600">
          <span>SOC2 Ready</span>
          <span>•</span>
          <span>HIPAA Ready</span>
          <span>•</span>
          <span>GDPR Compliant</span>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">FAQ</h2>
        <div className="space-y-6">
          {[
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
          ].map((faq, i) => (
            <div key={i} className="border-b border-gray-800 pb-6">
              <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
