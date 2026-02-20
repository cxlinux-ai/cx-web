import { useEffect } from "react";
import { Scale, Github, ExternalLink, Shield, Users, Building, GraduationCap } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

export default function License() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.license);
    return cleanup;
  }, []);

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
            <span className="text-white">Business Source</span>{" "}
            <span className="gradient-text">License 1.1</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            CX Linux software licensing terms
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold mb-4 text-white">License Parameters</h2>
          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">Licensor</span>
              <span>AI Venture Holdings LLC</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">Licensed Work</span>
              <span>CX AI Terminal and associated components</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-2">
              <span className="text-gray-400">Change Date</span>
              <span>6 years from each version release</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Change License</span>
              <span>Apache License, Version 2.0</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white">
            Additional Use Grant
          </h2>
          <p className="text-gray-400 mb-6">You may use the Licensed Work for:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Personal Use</h3>
                <p className="text-gray-400 text-sm">Non-commercial use on 1 system</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <Building className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Internal Business</h3>
                <p className="text-gray-400 text-sm">Operations (not as a service)</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Education & Research</h3>
                <p className="text-gray-400 text-sm">Academic and research purposes</p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                <Github className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Contributing</h3>
                <p className="text-gray-400 text-sm">Contributing to the Licensed Work</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Terms
          </h2>
          <div className="space-y-4 text-gray-300 leading-relaxed">
            <p>
              The Licensor hereby grants you the right to copy, modify, create derivative works, 
              redistribute, and make non-production use of the Licensed Work.
            </p>
            <p>
              <strong className="text-white">Effective on the Change Date</strong>, the Licensor grants you rights 
              under the terms of the Change License, and the rights granted above terminate.
            </p>
            <p>
              If your use of the Licensed Work does not comply with the requirements currently 
              in effect as described in this License, you must purchase a commercial license from 
              the Licensor, its affiliated entities, or authorized resellers.
            </p>
            <p>
              <strong className="text-white">All copies</strong> of the original and modified Licensed Work must include 
              this License, the copyright notice, and the Change Date and Change License.
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Commercial Use
          </h2>
          <p className="text-gray-300 mb-4">
            <strong className="text-white">"Commercial Use"</strong> means using the Licensed Work to:
          </p>
          <ul className="space-y-2 text-gray-400">
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              Run on more than one (1) system
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              Offer a competing product or service
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              Provide managed services based on the Licensed Work
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">•</span>
              Sell, resell, or sublicense the Licensed Work
            </li>
          </ul>
          <p className="text-gray-400 mt-6 text-sm">
            For Commercial Use licensing, contact:{" "}
            <a
              href="mailto:licensing@cxlinux.com"
              className="text-blue-300 hover:underline"
            >
              licensing@cxlinux.com
            </a>
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Pricing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">Free</div>
              <div className="text-gray-400 text-sm">Personal (1 system)</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">$20<span className="text-base font-normal text-gray-400">/system/mo</span></div>
              <div className="text-gray-400 text-sm">Additional systems</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">$99<span className="text-base font-normal text-gray-400">/mo</span></div>
              <div className="text-gray-400 text-sm">Pro (up to 25 systems)</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">$299<span className="text-base font-normal text-gray-400">/mo</span></div>
              <div className="text-gray-400 text-sm">Enterprise (up to 100 systems)</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm mt-4 text-center">
            See <a href="/pricing" className="text-blue-300 hover:underline">pricing page</a> for current rates
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Disclaimer
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
            INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
            PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
            FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
            OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
            DEALINGS IN THE SOFTWARE.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">
            Trademark Notice
          </h2>
          <p className="text-gray-300 leading-relaxed">
            "CX Linux" and the CX logo are trademarks of AI Venture Holdings LLC. While the software 
            is licensed under the Business Source License 1.1, use of the CX name and branding for 
            derivative works requires written permission. This ensures users can distinguish official 
            releases from community modifications.
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
            Explore the source code, report issues, and contribute to CX Linux.
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

        <p className="text-center text-gray-500 text-sm mt-8">
          This license is based on the Business Source License 1.1, created by MariaDB Corporation.
          For more information, see{" "}
          <a href="https://mariadb.com/bsl11/" className="text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
            mariadb.com/bsl11
          </a>
        </p>
      </div>

      <Footer />
    </div>
  );
}
