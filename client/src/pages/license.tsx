import { Scale, Github, ExternalLink } from "lucide-react";
import Footer from "@/components/Footer";

export default function License() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-400/20 border border-emerald-400/30 mb-6">
            <Scale className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Source Available
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
            <span className="text-white">BSL 1.1</span>{" "}
            <span className="gradient-text">License</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Business Source License - Source available with commercial protections
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
{`Business Source License 1.1

Licensor: CX Linux

Licensed Work: CX Linux
               The Licensed Work is (c) ${currentYear} CX Linux

Additional Use Grant: You may use the Licensed Work for non-commercial
                      purposes, personal use, educational purposes, and
                      internal business operations with up to 1 server.

Change Date: Four years from release date of each version

Change License: Apache License, Version 2.0

For information about alternative licensing arrangements, contact:
licensing@cxlinux.com

Notice

The Business Source License (this document, or the "License") is not an Open
Source license. However, the Licensed Work will eventually be made available
under an Open Source License, as stated in this License.

License text copyright (c) 2017 MariaDB Corporation Ab, All Rights Reserved.
"Business Source License" is a trademark of MariaDB Corporation Ab.`}
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
                <h3 className="font-semibold text-white">Free for Personal Use</h3>
                <p className="text-gray-400">
                  You can use CX Linux for free on 1 server for personal,
                  educational, or non-commercial purposes.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  Commercial Use Requires License
                </h3>
                <p className="text-gray-400">
                  Using CX Linux in production for commercial purposes or on
                  multiple servers requires a paid subscription (Pro, Team, or Enterprise).
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
                  The source code is publicly available. You can inspect, learn from,
                  and contribute to the codebase.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-400 text-sm">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">Converts to Apache 2.0</h3>
                <p className="text-gray-400">
                  After 4 years, each version automatically converts to the permissive
                  Apache 2.0 license.
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
            "CX Linux" and the CX Linux logo are trademarks of the CX
            Linux project. Use of the CX Linux name and branding for derivative
            works requires written permission. This ensures users can
            distinguish official releases from community modifications.
          </p>
          <p className="text-gray-400 mt-4 text-sm">
            For trademark inquiries, contact:{" "}
            <a
              href="mailto:legal@cxlinux.com"
              className="text-purple-400 hover:underline"
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
            href="https://github.com/cxlinux-ai/cx"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors"
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
