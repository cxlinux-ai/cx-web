import { Github } from "lucide-react";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-16 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <Link 
              href="/"
              className="text-2xl font-bold mb-4 block text-left"
              data-testid="footer-logo"
            >
              <span className="text-white">CX</span>{" "}
              <span className="text-blue-400">LINUX</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs mb-4">
              The AI Layer for Linux. Execute any task with natural language.
            </p>
            <p className="text-gray-500 text-xs">
              Built in public. Source available on GitHub.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><Link href="/#about" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-features">Features</Link></li>
              <li><Link href="/#pricing" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-pricing">Pricing</Link></li>
              <li><Link href="/account" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-account">My Licenses</Link></li>
              <li><Link href="/faq" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-faq">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><Link href="/blog" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-blog">Blog</Link></li>
              <li><Link href="/support" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-support">Support</Link></li>
              <li><a href="https://github.com/cxlinux-ai/cx" target="_blank" rel="noopener noreferrer" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-get-started">Get Started</a></li>
              <li><Link href="/status" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-status">Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><a href="https://discord.gg/cxlinux" target="_blank" rel="noopener noreferrer" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-discord">Discord</a></li>
              <li><a href="https://twitter.com/cxlinux" target="_blank" rel="noopener noreferrer" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-twitter">Twitter</a></li>
              <li><a href="https://github.com/cxlinux-ai/cx" target="_blank" rel="noopener noreferrer" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-github">GitHub</a></li>
              <li><Link href="/hackathon" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-hackathon">Hackathon</Link></li>
              <li><Link href="/careers" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-careers">Careers</Link></li>
              <li><Link href="/partners" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-partners">Partner Program <span className="text-purple-400 text-xs">(10% for 36mo)</span></Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li><Link href="/privacy" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-privacy">Privacy Policy</Link></li>
              <li><Link href="/terms" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-terms">Terms of Service</Link></li>
              <li><Link href="/security-policy" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-security">Security</Link></li>
              <li><Link href="/license" className="block py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-link-license">License (BSL 1.1)</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 CX Linux. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-bottom-privacy">Privacy</Link>
            <Link href="/terms" className="py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-bottom-terms">Terms</Link>
            <Link href="/security-policy" className="py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-bottom-security">Security</Link>
            <Link href="/status" className="py-2 hover:text-white transition-colors touch-manipulation" data-testid="footer-bottom-status">Status</Link>
          </div>
          <div className="flex gap-6">
            <a href="https://twitter.com/cxlinux" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-white transition-colors touch-manipulation" data-testid="footer-social-twitter">
              <FaTwitter size={22} />
            </a>
            <a href="https://github.com/cxlinux-ai/cx" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-white transition-colors touch-manipulation" data-testid="footer-social-github">
              <Github size={22} />
            </a>
            <a href="https://discord.gg/cxlinux" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-white transition-colors touch-manipulation" data-testid="footer-social-discord">
              <FaDiscord size={22} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
