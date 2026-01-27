import { useEffect } from "react";
import { Scale, Github, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

export default function License() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.license);
    return cleanup;
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/20 border border-emerald-400/30 mb-6">
            <Scale className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Software License
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
            <span className="text-white">BSL 1.1</span>{" "}
            <span className="gradient-text">License</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            CX Linux Business Source License - 6-year competitive moat
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
{`Business Source License 1.1

Parameters:
Licensor: AI Venture Holdings LLC
Licensed Work: CX Linux v0.1.0 and later versions
The Licensed Work is (c) 2025-2026 AI Venture Holdings LLC

Additional Use Grant: You may use the Licensed Work for:
- Personal, non-commercial use (1 system)
- Internal business operations (not offering as a service)
- Educational and research purposes
- Contributing to the Licensed Work

Change Date: January 15, 2032 (6 years from release)
Change License: Apache License, Version 2.0

The Licensor hereby grants you the right to copy, modify, create derivative works,
redistribute, and make non-production use of the Licensed Work.

Effective on the Change Date, the Licensor grants you rights under the terms of
the Change License, and the rights granted above terminate.

If your use of the Licensed Work does not comply with the requirements currently
in effect as described in this License, you must purchase a commercial license
from the Licensor, its affiliated entities, or authorized resellers.

For Commercial Use licensing, contact: licensing@cxlinux.ai

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.`}
          </pre>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            What This Means
          </h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Free for Non-Commercial Use</h3>
                <p className="text-gray-400">
                  You can use CX Linux for personal, educational, and internal business
                  operations. Commercial service offerings require a commercial license.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  6-Year Competitive Protection
                </h3>
                <p className="text-gray-400">
                  Commercial use restrictions apply until January 15, 2032. After that date,
                  the license converts to Apache 2.0 with full commercial freedom.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Source Available</h3>
                <p className="text-gray-400">
                  Full source code is available for inspection, modification, and
                  contribution, ensuring transparency while protecting business interests.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Commercial Licensing & Trademark Notice
          </h2>
          <p className="text-gray-300 leading-relaxed">
            "CX Linux" and the CX logo are trademarks of AI Venture Holdings LLC.
            Commercial use of CX Linux as a service offering requires a commercial
            license. The BSL 1.1 license ensures a 6-year competitive moat while
            keeping the source code available for inspection and contribution.
          </p>
          <p className="text-gray-400 mt-4 text-sm">
            For commercial licensing or trademark inquiries, contact:{" "}
            <a
              href="mailto:licensing@cxlinux.ai"
              className="text-blue-300 hover:underline"
            >
              licensing@cxlinux.ai
            </a>
          </p>
        </div>

        <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-3 text-white">
            View on GitHub
          </h3>
          <p className="text-gray-400 mb-6">
            Explore the source code, report issues, and contribute to CX Linux
            under the BSL 1.1 license.
          </p>
          <a
            href="https://github.com/cxlinux-ai/cx-distro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            data-testid="link-github"
          >
            <Github className="h-5 w-5" />
            View Repository
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
