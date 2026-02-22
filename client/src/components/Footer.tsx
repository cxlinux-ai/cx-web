import { Github } from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-[#333] py-12 px-4 bg-[#1E1E1E]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/getting-started" className="hover:text-[#00FF9F] transition-colors">
                  Terminal
                </Link>
              </li>
              <li>
                <a href="https://github.com/cxlinux-ai/cx-distro" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF9F] transition-colors">
                  Distro
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://github.com/cxlinux-ai/cx-core" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF9F] transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Commercial */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Commercial</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/pricing" className="hover:text-[#00FF9F] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <a href="mailto:sales@cxlinux.com" className="hover:text-[#00FF9F] transition-colors">
                  Contact Sales
                </a>
              </li>
              <li>
                <a href="mailto:support@cxlinux.com" className="hover:text-[#00FF9F] transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-[#00FF9F] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#00FF9F] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/license" className="hover:text-[#00FF9F] transition-colors">
                  License
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[#333]">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2026 CX Linux. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/cxlinux-ai" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00FF9F] transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/cxlinux" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00FF9F] transition-colors">
              <FaTwitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
