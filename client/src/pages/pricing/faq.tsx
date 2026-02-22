import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Search,
  CreditCard,
  RefreshCw,
  Users,
  Shield,
  HelpCircle,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Footer from "@/components/Footer";

interface Question {
  q: string;
  a: string;
}

interface FAQCategory {
  category: string;
  icon: typeof CreditCard;
  questions: Question[];
}

const faqData: FAQCategory[] = [
  {
    category: "Billing & Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) and debit cards through Stripe. For Enterprise and Managed plans, we also offer invoicing with NET-30 terms for annual contracts.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes! All paid plans include a 14-day free trial. No credit card is required to start your trial. You'll have full access to all plan features during the trial period.",
      },
      {
        q: "How does the annual billing discount work?",
        a: "When you choose annual billing, you save 20% compared to monthly billing. For example, the Pro plan is $20/month billed monthly, or $16/month when billed annually ($192/year instead of $240).",
      },
      {
        q: "Can I change my billing cycle?",
        a: "Yes, you can switch between monthly and annual billing at any time. If you switch from monthly to annual, the change takes effect immediately and you'll receive a prorated credit. Switching from annual to monthly takes effect at the end of your current billing period.",
      },
      {
        q: "Do prices include taxes?",
        a: "Displayed prices do not include applicable taxes. Sales tax, VAT, or GST will be calculated and added at checkout based on your location. Enterprise customers with tax exemptions can provide documentation during the sales process.",
      },
      {
        q: "What happens if my payment fails?",
        a: "If a payment fails, we'll notify you immediately and retry the payment automatically over the next few days. Your service continues uninterrupted during this grace period. If payment cannot be collected after multiple attempts, your account may be downgraded to the Community plan.",
      },
    ],
  },
  {
    category: "Plans & Features",
    icon: Users,
    questions: [
      {
        q: "What's included in the Community (free) plan?",
        a: "The Community plan includes:\n• Local LLM (Mistral 7B) for offline AI capabilities\n• Full CLI access and core CX Linux features\n• Community Discord support\n• Open source updates and basic documentation\n\nIt's perfect for individual developers and hobbyists.",
      },
      {
        q: "What's the difference between Pro and Enterprise?",
        a: "Pro is designed for developers and small teams who need cloud LLMs and basic support. Enterprise adds security and compliance features:\n\n• Pro: Cloud LLMs (GPT-4, Claude), web console, email support (24h), API access\n• Enterprise: Everything in Pro + SSO/LDAP, audit logs, compliance reports (SOC2, HIPAA), 99.9% SLA, dedicated Slack channel",
      },
      {
        q: "What does 'Managed' include that Enterprise doesn't?",
        a: "The Managed plan is a white-glove service where we handle everything:\n\n• Fully managed infrastructure (we provision and maintain your servers)\n• 24/7 phone support (not just email/Slack)\n• 99.99% SLA (higher than Enterprise's 99.9%)\n• Dedicated account manager\n• Custom deployment configurations\n• On-call engineering support",
      },
      {
        q: "Can I use multiple Cloud LLMs on the Pro plan?",
        a: "Yes! Pro and higher plans include access to multiple cloud LLMs including GPT-4, Claude, and more. You can switch between models based on your task requirements. Usage is included in your subscription - no per-token charges.",
      },
      {
        q: "Are there any usage limits?",
        a: "Community: Limited to local LLM only (no cloud API calls)\nPro: 100,000 cloud LLM tokens/month included\nEnterprise: 500,000 tokens/month included\nManaged: Unlimited tokens\n\nAdditional tokens can be purchased at $0.01 per 1,000 tokens for Pro/Enterprise plans.",
      },
    ],
  },
  {
    category: "Upgrades & Downgrades",
    icon: RefreshCw,
    questions: [
      {
        q: "Can I upgrade or downgrade my plan anytime?",
        a: "Yes, you can change your plan at any time:\n\n• Upgrades: Take effect immediately. You'll be charged a prorated amount for the remainder of your billing period.\n• Downgrades: Take effect at the end of your current billing period. You keep access to your current plan until then.",
      },
      {
        q: "What happens to my data if I downgrade?",
        a: "Your data is never deleted when you downgrade. However, you may lose access to certain features:\n\n• Downgrading from Enterprise to Pro: Audit logs become read-only, SSO is disabled\n• Downgrading from Pro to Community: Cloud LLM access is disabled, web console becomes view-only\n\nYou can always re-upgrade to regain access.",
      },
      {
        q: "Is there a minimum commitment?",
        a: "No minimum commitment for monthly plans - you can cancel anytime. Annual plans have a 12-month commitment but include a 30-day money-back guarantee. Enterprise contracts may have custom terms negotiated during the sales process.",
      },
      {
        q: "Can I add team members to my plan?",
        a: "Yes! All plans support team collaboration:\n\n• Community: 1 user\n• Pro: Up to 5 users ($5/user/month for additional seats)\n• Enterprise: Up to 25 users included ($3/user/month for additional seats)\n• Managed: Unlimited users included",
      },
    ],
  },
  {
    category: "Cancellation & Refunds",
    icon: Shield,
    questions: [
      {
        q: "How do I cancel my subscription?",
        a: "You can cancel your subscription anytime from your account settings or by contacting support. When you cancel:\n\n• Monthly plans: Access continues until the end of your current billing period\n• Annual plans: Access continues until the end of your annual term\n\nWe'll send you a confirmation email and your data will be retained for 30 days after cancellation.",
      },
      {
        q: "What's your refund policy?",
        a: "We offer a 30-day money-back guarantee for all new subscriptions. If you're not satisfied within the first 30 days, contact support for a full refund - no questions asked.\n\nAfter 30 days:\n• Monthly plans: No refunds for partial months\n• Annual plans: Prorated refund minus a 10% early termination fee",
      },
      {
        q: "Can I pause my subscription instead of canceling?",
        a: "Yes! Enterprise and Managed plans can be paused for up to 3 months. During the pause:\n\n• No charges are incurred\n• Your configuration and data are preserved\n• Access is suspended until you resume\n\nContact support to set up a pause. Pro plans can downgrade to Community to retain access with limited features.",
      },
      {
        q: "What happens to my data after I cancel?",
        a: "When you cancel, we retain your data for 30 days in case you decide to return. After 30 days:\n\n• Account data is permanently deleted\n• Usage logs are anonymized for analytics\n• You can request immediate deletion by contacting support\n\nWe comply with GDPR, CCPA, and other data protection regulations.",
      },
    ],
  },
  {
    category: "Enterprise & Compliance",
    icon: Shield,
    questions: [
      {
        q: "What compliance certifications do you have?",
        a: "CX Linux maintains the following certifications:\n\n• SOC2 Type II (available for Enterprise and Managed)\n• HIPAA BAA (available for healthcare customers on Enterprise+)\n• GDPR compliant (all plans)\n• ISO 27001 certified\n\nCompliance reports are available in the Enterprise dashboard or upon request.",
      },
      {
        q: "Do you sign Business Associate Agreements (BAA)?",
        a: "Yes, we sign BAAs for customers on Enterprise and Managed plans who handle PHI. The BAA is included at no additional cost. Contact sales@cxlinux.com to initiate the BAA process.",
      },
      {
        q: "Can I get a custom enterprise agreement?",
        a: "Yes! For Enterprise and Managed plans, we offer custom agreements including:\n\n• Custom SLA terms\n• Dedicated infrastructure options\n• Custom data residency requirements\n• Volume discounts for large teams\n• Extended payment terms (NET-30/60/90)\n\nContact our sales team to discuss your requirements.",
      },
      {
        q: "Is there a Service Level Agreement (SLA)?",
        a: "SLA availability varies by plan:\n\n• Community: No SLA\n• Pro: No SLA (but typically 99.5% uptime)\n• Enterprise: 99.9% SLA with credits for downtime\n• Managed: 99.99% SLA with credits for downtime\n\nSLA credits are automatically applied to your next invoice.",
      },
    ],
  },
];

export default function PricingFAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFAQ = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqData;
    }

    const lowerSearch = searchTerm.toLowerCase();

    return faqData
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(lowerSearch) ||
            q.a.toLowerCase().includes(lowerSearch)
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchTerm]);

  return (
    <div id="pricing-faq-page-container" className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Back Link */}
        <Link
          id="pricing-faq-back-link"
          href="/pricing"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        {/* Header */}
        <div id="pricing-faq-header" className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6"
          >
            <span className="bg-gradient-to-r from-gray-300 via-gray-200 to-[#00CC7F] bg-clip-text text-transparent">
              Pricing
            </span>{" "}
            <span className="text-[#00FF9F]">FAQ</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          >
            Everything you need to know about billing, plans, and subscriptions
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="pricing-faq-search"
              type="search"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/5 border-white/10 backdrop-blur-xl text-white placeholder:text-gray-500 focus-visible:ring-purple-400"
            />
          </motion.div>
        </div>

        {/* FAQ Categories */}
        <div id="pricing-faq-categories" className="space-y-8">
          {filteredFAQ.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              id={`pricing-faq-category-${categoryIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * categoryIndex }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#00FF9F]/20 rounded-xl flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-[#00FF9F]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {category.category}
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((question, questionIndex) => {
                  const globalIndex =
                    faqData
                      .slice(0, categoryIndex)
                      .reduce((acc, cat) => acc + cat.questions.length, 0) +
                    questionIndex;

                  return (
                    <AccordionItem
                      key={questionIndex}
                      value={`question-${globalIndex}`}
                      id={`pricing-faq-question-${globalIndex}`}
                      className="border-white/10"
                    >
                      <AccordionTrigger className="text-left hover:no-underline hover:text-[#00FF9F] transition-colors">
                        <span className="text-lg font-semibold pr-4">
                          {question.q}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                          {question.a}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </motion.div>
          ))}

          {filteredFAQ.length === 0 && (
            <div id="pricing-faq-no-results" className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                No questions found matching "{searchTerm}"
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Try a different search term or browse all categories above
              </p>
            </div>
          )}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div
          id="pricing-faq-contact-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-[#00FF9F]/10 to-[#00CC7F]/10 border border-[#00FF9F]/30 rounded-2xl p-8 text-center"
        >
          <MessageSquare className="w-12 h-12 text-[#00FF9F] mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Can't find what you're looking for? Our sales and support teams are here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              id="pricing-faq-sales-link"
              href="https://calendly.com/ai-consultant/vip"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#00FF9F] text-white font-semibold rounded-lg hover:bg-[#00FF9F] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all"
            >
              Schedule Demo
            </a>
            <a
              id="pricing-faq-support-link"
              href="mailto:support@cxlinux.com"
              className="px-6 py-3 border-2 border-[#00FF9F] text-[#00FF9F] font-semibold rounded-lg hover:bg-[#00FF9F]/10 transition-all"
            >
              Email Support
            </a>
            <a
              id="pricing-faq-discord-link"
              href="https://discord.gg/cxlinux"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-[#00FF9F] text-[#00FF9F] font-semibold rounded-lg hover:bg-[#00FF9F]/10 transition-all"
            >
              Ask on Discord
            </a>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
