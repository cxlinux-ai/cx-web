import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ChevronLeft, 
  MessageCircle, 
  Github, 
  BookOpen, 
  Mail, 
  Clock, 
  Check, 
  X,
  ChevronDown,
  HelpCircle,
  Headphones
} from "lucide-react";
import { FaDiscord, FaSlack } from "react-icons/fa";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const supportOptions = [
  {
    icon: FaDiscord,
    title: "Community Discord",
    description: "Join our active community for real-time help and discussions",
    link: "https://discord.gg/uCqHvxjU83",
    linkText: "Join Discord",
    color: "from-indigo-500 to-purple-600"
  },
  {
    icon: Github,
    title: "GitHub Issues",
    description: "Report bugs, request features, or browse existing issues",
    link: "https://github.com/cxlinux-ai/cx-core/issues",
    linkText: "Open Issue",
    color: "from-gray-600 to-gray-800"
  },
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Comprehensive guides, tutorials, and API reference",
    link: "https://github.com/cxlinux-ai/cx-core/wiki",
    linkText: "View Docs",
    color: "from-blue-500 to-cyan-600"
  }
];

const responseTimes = [
  { tier: "Community", time: "Community-driven", icon: MessageCircle },
  { tier: "Pro", time: "24-48 hours", icon: Mail },
  { tier: "Enterprise", time: "4 hours", icon: Clock },
  { tier: "Managed", time: "15 minutes", icon: Headphones }
];

const supportTiers = [
  { feature: "Discord Community", community: true, pro: true, enterprise: true, managed: true },
  { feature: "GitHub Issues", community: true, pro: true, enterprise: true, managed: true },
  { feature: "Email Support", community: false, pro: true, enterprise: true, managed: true },
  { feature: "Priority Response", community: false, pro: false, enterprise: true, managed: true },
  { feature: "Dedicated Slack Channel", community: false, pro: false, enterprise: true, managed: true },
  { feature: "24/7 Emergency Support", community: false, pro: false, enterprise: false, managed: true },
  { feature: "Dedicated Account Manager", community: false, pro: false, enterprise: false, managed: true }
];

const faqs = [
  {
    question: "How do I activate my license?",
    answer: "After purchasing a Pro, Enterprise, or Managed plan, you'll receive a license key via email. Run `cx license activate YOUR-LICENSE-KEY` in your terminal to activate. The license is automatically tied to your machine ID for security."
  },
  {
    question: "How do I add more systems to my license?",
    answer: "Pro licenses support up to 3 systems, Enterprise up to 50, and Managed includes unlimited systems. To add a new system, simply run the activation command on that machine. If you've reached your limit, you can deactivate a system using `cx license deactivate MACHINE-ID` or upgrade your plan."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel anytime from your account dashboard or by emailing support@cxlinux.com. Your access continues until the end of your billing period. We don't offer refunds for partial months, but you won't be charged again after cancellation."
  },
  {
    question: "Can I transfer my license to another account?",
    answer: "Yes, license transfers are supported for Enterprise and Managed plans. Contact your account manager or email support@cxlinux.com with the details of the transfer request."
  },
  {
    question: "What happens if I exceed my server limit?",
    answer: "You'll receive a notification when you're approaching your limit. If you try to activate on additional servers beyond your limit, the activation will fail with an error message. You can either deactivate unused servers or upgrade to a higher tier."
  }
];

export default function SupportPage() {
  useEffect(() => {
    updateSEO({
      title: "Support & Help - CX Linux",
      description: "Get help with CX Linux. Access community Discord, GitHub issues, documentation, and email support for Pro, Enterprise, and Managed plans.",
      canonicalPath: "/support",
      ogType: "website"
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 py-16">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8" data-testid="link-back-home">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-support-title">
              Support & <span className="text-blue-400">Help</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto" data-testid="text-support-subtitle">
              We're here to help you get the most out of CX Linux
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Get Help</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {supportOptions.map((option, index) => (
                <motion.a
                  key={option.title}
                  href={option.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                  className="group relative bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                  data-testid={`card-support-${option.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-4`}>
                    <option.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{option.description}</p>
                  <span className="text-blue-400 text-sm font-medium group-hover:underline">
                    {option.linkText} →
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Contact Us</h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Email Support</h3>
                      <a 
                        href="mailto:support@cxlinux.com" 
                        className="text-blue-400 hover:underline"
                        data-testid="link-support-email"
                      >
                        support@cxlinux.com
                      </a>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm">
                    For billing inquiries, account issues, or general questions
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Response Times
                  </h3>
                  <div className="space-y-3">
                    {responseTimes.map((item) => (
                      <div key={item.tier} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{item.tier}</span>
                        <span className="text-white font-medium">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 text-center">Support by Plan</h2>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-support-tiers">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Feature</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Community</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Pro</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Enterprise</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Managed</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTiers.map((row, index) => (
                    <tr 
                      key={row.feature} 
                      className={`border-b border-white/5 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="py-4 px-4 text-sm">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {row.community ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.pro ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.enterprise ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.managed ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-center mt-8">
              <Link href="/pricing">
                <Button variant="outline" data-testid="button-view-pricing">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <h2 className="text-2xl font-bold mb-8 text-center flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-blue-400" />
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`faq-${index}`}
                    className="bg-white/5 border border-white/10 rounded-lg px-6"
                    data-testid={`accordion-faq-${index}`}
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-400 mb-4">Can't find what you're looking for?</p>
              <Link href="/faq">
                <Button variant="outline" data-testid="button-view-all-faqs">
                  View All FAQs
                </Button>
              </Link>
            </div>
          </motion.section>

        </div>
      </div>
      
      <Footer />
    </div>
  );
}
