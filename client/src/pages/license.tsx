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
            <span className="text-white">MIT</span>{" "}
            <span className="gradient-text">License</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            CX Linux software licensing terms
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
{`MIT License

Copyright (c) ${currentYear} CX Linux

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
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
                <h3 className="font-semibold text-white">Free to Use</h3>
                <p className="text-gray-400">
                  You can use CX Linux for personal, educational, or
                  commercial purposes without any licensing fees.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Modify and Distribute
                </h3>
                <p className="text-gray-400">
                  You can modify the source code and distribute your own
                  versions, as long as you include the original license.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">No Warranty</h3>
                <p className="text-gray-400">
                  The software is provided as-is without warranty. Use at your
                  own discretion.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Trademark Notice
          </h2>
          <p className="text-gray-300 leading-relaxed">
            "CX Linux" and the CX logo are trademarks of the CX
            Linux project. While the software is licensed under the
            MIT license, use of the CX name and branding for derivative
            works requires written permission. This ensures users can
            distinguish official releases from community modifications.
          </p>
          <p className="text-gray-400 mt-4 text-sm">
            For trademark inquiries, contact:{" "}
            <a
              href="mailto:legal@cxlinux.com"
              className="text-blue-300 hover:underline"
            >
              legal@cxlinux.com
            </a>
          </p>
        </div>

        <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-3 text-white">
            View on GitHub
          </h3>
          <p className="text-gray-400 mb-6">
            Explore the source code, report issues, and contribute to CX
            Linux.
          </p>
          <a
            href="https://github.com/cxlinux-ai/cx-core"
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
