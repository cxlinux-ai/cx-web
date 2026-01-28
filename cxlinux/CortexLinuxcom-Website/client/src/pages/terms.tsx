import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronLeft, FileCheck, Scale, UserCheck, AlertTriangle, ShieldOff, Gavel } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

export default function Terms() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.terms);
    return cleanup;
  }, []);

  const sections = [
    {
      icon: FileCheck,
      title: "Acceptance of Terms",
      content: `By accessing or using Cortex Linux ("the Software"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Software.

These Terms apply to all users, including visitors, registered users, and contributors.

We reserve the right to update these Terms at any time. Your continued use of the Software after changes constitutes acceptance of the new Terms.

If you are using the Software on behalf of an organization, you represent that you have authority to bind that organization to these Terms.`
    },
    {
      icon: Scale,
      title: "License Grant",
      content: `Cortex Linux software is licensed under the MIT License, which grants you the right to:

• Use the Software for any purpose, including commercial applications
• Copy, modify, and distribute the Software
• Sublicense the Software
• Merge the Software with other software

The above rights are granted free of charge, subject to the conditions of the MIT License.

TRADEMARK NOTICE: While the code is MIT licensed, the Cortex Linux name, logo, and branding are protected trademarks. You may not use these marks without prior written permission, except as required for reasonable attribution.`
    },
    {
      icon: UserCheck,
      title: "User Conduct",
      content: `When using Cortex Linux, you agree to:

• Use the Software in compliance with all applicable laws and regulations
• Not attempt to circumvent security features or access restrictions
• Not use the Software to distribute malware, viruses, or harmful code
• Not use the Software for unauthorized access to other systems
• Not misrepresent your affiliation with Cortex Linux or its maintainers
• Respect the intellectual property rights of others

Violation of these terms may result in termination of access to community resources and reporting to appropriate authorities.`
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers",
      content: `THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.

We do not warrant that:
• The Software will meet your specific requirements
• The Software will be uninterrupted, timely, secure, or error-free
• Results obtained from the Software will be accurate or reliable
• Any errors in the Software will be corrected

You understand that using the Software involves inherent risks, including but not limited to system modifications, data loss, and hardware interactions. You assume full responsibility for:
• Backing up your data before using the Software
• Testing in non-production environments first
• Reviewing commands before execution`
    },
    {
      icon: ShieldOff,
      title: "Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CORTEX LINUX, ITS MAINTAINERS, CONTRIBUTORS, OR AFFILIATES BE LIABLE FOR:

• Any indirect, incidental, special, consequential, or punitive damages
• Loss of profits, data, use, goodwill, or other intangible losses
• Damages resulting from unauthorized access to or alteration of your systems
• Damages resulting from any third-party conduct or content
• Any other damages arising from your use of the Software

This limitation applies regardless of the legal theory (contract, tort, strict liability, or otherwise) and whether or not we have been advised of the possibility of such damages.

Some jurisdictions do not allow the exclusion of certain warranties or limitations, so some of the above may not apply to you.`
    },
    {
      icon: Gavel,
      title: "Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions.

Any disputes arising from these Terms or your use of the Software shall be resolved through:

1. Good faith negotiation between the parties
2. If negotiation fails, binding arbitration under the rules of the American Arbitration Association
3. Arbitration shall take place in Delaware, and the decision shall be final and binding

You agree to waive any right to participate in class action lawsuits or class-wide arbitration.

For users outside the United States, you agree to comply with all local laws regarding online conduct and acceptable content.`
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
            <span className="text-white">Terms of</span>{" "}
            <span className="gradient-text">Service</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Legal terms governing your use of Cortex Linux
          </p>
          <p className="text-gray-500 text-sm mt-2">Effective Date: December 15, 2025</p>
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
