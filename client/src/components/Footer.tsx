import { Github } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { Link, useLocation } from "wouter";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Terminal", href: "/getting-started", internal: true },
      { label: "Distro", href: "https://github.com/cxlinux-ai/cx-distro", internal: false },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "GitHub", href: "https://github.com/cxlinux-ai/cx-core", internal: false },
      { label: "Blog", href: "/blog", internal: true },
      { label: "FAQ", href: "/pricing", scrollTo: "faq", internal: true },
    ],
  },
  {
    heading: "Commercial",
    links: [
      { label: "Pricing", href: "/pricing", internal: true },
      { label: "Affiliates (10%)", href: "/affiliates", internal: true },
      { label: "Contact Sales", href: "mailto:sales@cxlinux.com", internal: false },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "About Us", href: "/about", internal: true },
      { label: "System Status", href: "/status", internal: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy", internal: true },
      { label: "Terms of Service", href: "/terms", internal: true },
      { label: "License", href: "/license", internal: true },
    ],
  },
];

type FooterLink = {
  label: string;
  href: string;
  internal: boolean;
  scrollTo?: string;
};

function FooterLink({ link }: { link: FooterLink }) {
  const [location, navigate] = useLocation();

  if (link.scrollTo) {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (location === link.href) {
        document.getElementById(link.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(link.href);
        // After navigation, wait for the page to render then scroll
        setTimeout(() => {
          document.getElementById(link.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    };
    return (
      <a href={link.href} onClick={handleClick} className="text-sm text-gray-400 hover:text-[#00FF9F] transition-colors cursor-pointer">
        {link.label}
      </a>
    );
  }

  if (link.internal) {
    return (
      <Link href={link.href} className="text-sm text-gray-400 hover:text-[#00FF9F] transition-colors">
        {link.label}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      target={link.href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="text-sm text-gray-400 hover:text-[#00FF9F] transition-colors"
    >
      {link.label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] py-14 px-4 bg-[#1E1E1E]">
      <div className="max-w-6xl mx-auto">
        {/* Logo row */}
        <div className="flex items-center gap-3 mb-10">
          <img src="/logo-mark.svg" alt="CX Linux" className="w-7 h-7 object-contain" />
          <span className="text-base font-bold">
            <span className="text-white">CX</span>
            <span className="bg-gradient-to-r from-[#00FF9F] to-[#00FFCC] bg-clip-text text-transparent"> LINUX</span>
          </span>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link as FooterLink} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/[0.07] gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} CX Linux. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/cxlinux-ai" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#00FF9F] transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://discord.gg/q4FUyBW6z" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#00FF9F] transition-colors">
              <FaDiscord className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
