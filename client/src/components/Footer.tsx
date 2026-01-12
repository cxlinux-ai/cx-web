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
              <span className="text-white">CORTEX</span>{" "}
              <span className="text-blue-400">LINUX</span>
            </Link>
            <p className="text-gray-400 text-sm max-w-xs mb-4">
              The AI Layer for Linux. Execute any task with natural language.
            </p>
            <p className="text-gray-500 text-xs">
              Built in public. Open source on GitHub.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/#about" className="hover:text-white transition-colors" data-testid="footer-link-features">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors" data-testid="footer-link-pricing">Pricing</Link></li>
              <li><Link href="/#preview" className="hover:text-white transition-colors" data-testid="footer-link-docs">Documentation</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors" data-testid="footer-link-faq">FAQ</Link></li>
              <li><Link href="/hackathon" className="hover:text-white transition-colors" data-testid="footer-link-hackathon">Hackathon</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/blog" className="hover:text-white transition-colors" data-testid="footer-link-blog">Blog</Link></li>
              <li><Link href="/#preview" className="hover:text-white transition-colors" data-testid="footer-link-api">API Reference</Link></li>
              <li><a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-get-started">Get Started</a></li>
              <li><Link href="/status" className="hover:text-white transition-colors" data-testid="footer-link-status">Status</Link></li>
              <li><Link href="/mission" className="hover:text-white transition-colors" data-testid="footer-link-mission">Mission</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="https://discord.gg/cortexlinux" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-discord">Discord</a></li>
              <li><a href="https://twitter.com/cortexlinux" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-twitter">Twitter</a></li>
              <li><a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-github">GitHub</a></li>
              <li><Link href="/bounties" className="hover:text-white transition-colors" data-testid="footer-link-bounties">Bounties</Link></li>
              <li><Link href="/waitlist" className="hover:text-white transition-colors" data-testid="footer-link-waitlist">Join Waitlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors" data-testid="footer-link-privacy">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors" data-testid="footer-link-terms">Terms of Service</Link></li>
              <li><Link href="/security-policy" className="hover:text-white transition-colors" data-testid="footer-link-security">Security</Link></li>
              <li><Link href="/license" className="hover:text-white transition-colors" data-testid="footer-link-license">License (MIT)</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2025 Cortex Linux. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors" data-testid="footer-bottom-privacy">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors" data-testid="footer-bottom-terms">Terms</Link>
            <Link href="/security-policy" className="hover:text-white transition-colors" data-testid="footer-bottom-security">Security</Link>
            <Link href="/status" className="hover:text-white transition-colors" data-testid="footer-bottom-status">Status</Link>
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com/cortexlinux" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-twitter">
              <FaTwitter size={20} />
            </a>
            <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-github">
              <Github size={20} />
            </a>
            <a href="https://discord.gg/cortexlinux" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-discord">
              <FaDiscord size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
