import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, Shield, Database, Cookie, Users, FileText, Bell, Mail } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

export default function Privacy() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.privacy);
    return cleanup;
  }, []);

  const sections = [
    {
      icon: Database,
      title: "Data Collection",
      content: `We collect information that you provide directly to us, including:

• Account Information: Email address, username, and password when you create an account
• Usage Data: Information about how you interact with our services, including commands executed, features used, and error reports
• Device Information: Hardware specifications, operating system version, and system configuration for optimization purposes
• Communication Data: Messages you send to us for support or feedback

We do not collect sensitive personal information unless explicitly provided by you.`
    },
    {
      icon: FileText,
      title: "How We Use Your Data",
      content: `Your data is used to:

• Provide and maintain our services
• Improve and optimize CX Linux performance for your hardware
• Send you technical notices, updates, and security alerts
• Respond to your comments, questions, and support requests
• Analyze usage patterns to improve our products
• Detect, investigate, and prevent fraudulent or unauthorized activity

We process your data based on legitimate interests, contract performance, and your consent where applicable.`
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: `We use minimal cookies and similar technologies:

• Essential Cookies: Required for basic functionality and security
• Analytics Cookies: Help us understand how visitors interact with our website (optional)
• Preference Cookies: Remember your settings and preferences

You can control cookie preferences through your browser settings. Our services remain functional with essential cookies only.

We do not use cookies for advertising purposes or sell your data to third parties.`
    },
    {
      icon: Users,
      title: "Third-Party Services",
      content: `We may share data with trusted third parties:

• Cloud Infrastructure: We use reputable cloud providers for hosting and data storage
• Analytics Services: To understand usage patterns and improve our services
• Payment Processors: For handling transactions securely (we never store payment card details)
• Communication Tools: For customer support and notifications

All third-party providers are contractually bound to protect your data and comply with applicable privacy laws.`
    },
    {
      icon: Shield,
      title: "Your Data Rights",
      content: `You have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you
• Correction: Request correction of inaccurate personal data
• Deletion: Request deletion of your personal data (subject to legal requirements)
• Portability: Request transfer of your data to another service
• Objection: Object to processing based on legitimate interests
• Withdrawal: Withdraw consent at any time where processing is based on consent

To exercise these rights, contact us at privacy@cxlinux.com.`
    },
    {
      icon: Bell,
      title: "Policy Updates",
      content: `We may update this Privacy Policy periodically to reflect:

• Changes in our practices or services
• Legal or regulatory requirements
• Feedback from users and stakeholders

We will notify you of significant changes via email or prominent notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy.

Last updated: February 2026`
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: `For privacy-related inquiries or concerns:

Email: privacy@cxlinux.com
GitHub: github.com/cxlinux-ai/cx-core/issues
Discord: discord.gg/ASvzWcuTfk

We aim to respond to all privacy requests within 30 days.

Data Protection Officer: Available for enterprise customers with specific compliance requirements.`
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-300 transition-colors mb-8" data-testid="link-back-home">
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">Privacy</span>{" "}
            <span className="gradient-text">Policy</span>
          </h1>
          <p className="text-gray-400 text-lg">
            How CX Linux collects, uses, and protects your data
          </p>
          <p className="text-gray-500 text-sm mt-2">Effective Date: February 20, 2026</p>
        </motion.div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <section.icon size={20} className="text-blue-300" />
                </div>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
              </div>
              <div className="text-gray-400 whitespace-pre-line leading-relaxed text-sm">
                {section.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
