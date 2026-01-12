import { Github } from "lucide-react";
import { FaTwitter, FaDiscord } from "react-icons/fa";
import { Link, useLocation } from "wouter";
import { scrollToElement } from "@/lib/smooth-scroll";

interface SmoothLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}

function SmoothLink({ href, children, className, "data-testid": testId }: SmoothLinkProps) {
  const [, setLocation] = useLocation();

  const isHashLink = href.includes("#");
  const isExternalLink = href.startsWith("http") || href.startsWith("mailto:");

  if (isExternalLink) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-testid={testId}
      >
        {children}
      </a>
    );
  }

  if (isHashLink) {
    const [pathname, hash] = href.split("#");
    const targetPath = pathname === "" ? "/" : pathname;
    
    return (
      <a
        href={href}
        className={className}
        data-testid={testId}
        onClick={(e) => {
          e.preventDefault();
          const currentPath = window.location.pathname;

          if (currentPath === targetPath) {
            scrollToElement(hash);
            window.history.pushState(null, "", `${targetPath}#${hash}`);
          } else {
            setLocation(targetPath);
            const maxAttempts = 60;
            let attempts = 0;
            
            const waitForRouteAndScroll = () => {
              attempts++;
              const nowPath = window.location.pathname;
              
              if (nowPath === targetPath) {
                const element = document.getElementById(hash);
                if (element) {
                  scrollToElement(hash);
                  window.history.replaceState(null, "", `${targetPath}#${hash}`);
                  return;
                }
              }
              
              if (attempts < maxAttempts) {
                setTimeout(waitForRouteAndScroll, 50);
              }
            };
            
            setTimeout(waitForRouteAndScroll, 100);
          }
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} data-testid={testId}>
      {children}
    </Link>
  );
}

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
              <span className="text-blue-300">LINUX</span>
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
              <li>
                <SmoothLink href="/#about" className="hover:text-white transition-colors" data-testid="footer-link-features">
                  Features
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/#pricing" className="hover:text-white transition-colors" data-testid="footer-link-pricing">
                  Pricing
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/#preview" className="hover:text-white transition-colors" data-testid="footer-link-docs">
                  Documentation
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/faq" className="hover:text-white transition-colors" data-testid="footer-link-faq">
                  FAQ
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/hackathon" className="hover:text-white transition-colors" data-testid="footer-link-hackathon">
                  Hackathon
                </SmoothLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <SmoothLink href="/blog" className="hover:text-white transition-colors" data-testid="footer-link-blog">
                  Blog
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/#preview" className="hover:text-white transition-colors" data-testid="footer-link-api">
                  API Reference
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/getting-started" className="hover:text-white transition-colors" data-testid="footer-link-get-started">
                  Get Started
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/status" className="hover:text-white transition-colors" data-testid="footer-link-status">
                  Status
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/mission" className="hover:text-white transition-colors" data-testid="footer-link-mission">
                  Mission
                </SmoothLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="https://discord.gg/ASvzWcuTfk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-discord">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://twitter.com/cortexlinux" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-twitter">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" data-testid="footer-link-github">
                  GitHub
                </a>
              </li>
              <li>
                <SmoothLink href="/bounties" className="hover:text-white transition-colors" data-testid="footer-link-bounties">
                  Bounties
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/referrals" className="hover:text-white transition-colors" data-testid="footer-link-referrals">
                  Referrals
                </SmoothLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <SmoothLink href="/privacy" className="hover:text-white transition-colors" data-testid="footer-link-privacy">
                  Privacy Policy
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/terms" className="hover:text-white transition-colors" data-testid="footer-link-terms">
                  Terms of Service
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/security-policy" className="hover:text-white transition-colors" data-testid="footer-link-security">
                  Security
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/license" className="hover:text-white transition-colors" data-testid="footer-link-license">
                  License (MIT)
                </SmoothLink>
              </li>
              <li>
                <SmoothLink href="/hackathon-rules" className="hover:text-white transition-colors" data-testid="footer-link-hackathon-rules">
                  Hackathon Rules
                </SmoothLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">&copy; 2026 Cortex Linux. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <SmoothLink href="/privacy" className="hover:text-white transition-colors" data-testid="footer-bottom-privacy">
              Privacy
            </SmoothLink>
            <SmoothLink href="/terms" className="hover:text-white transition-colors" data-testid="footer-bottom-terms">
              Terms
            </SmoothLink>
            <SmoothLink href="/security-policy" className="hover:text-white transition-colors" data-testid="footer-bottom-security">
              Security
            </SmoothLink>
            <SmoothLink href="/status" className="hover:text-white transition-colors" data-testid="footer-bottom-status">
              Status
            </SmoothLink>
          </div>
          <div className="flex gap-4">
            <a href="https://twitter.com/cortexlinux" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-twitter">
              <FaTwitter size={20} />
            </a>
            <a href="https://github.com/cortexlinux/cortex" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-github">
              <Github size={20} />
            </a>
            <a href="https://discord.gg/ASvzWcuTfk" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors" data-testid="footer-social-discord">
              <FaDiscord size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
