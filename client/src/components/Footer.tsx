import { FaDiscord } from "react-icons/fa";
import { Link, useLocation } from "wouter";

const columns = [
  {
    heading: "Product",
    links: [
      { label: "Terminal", href: "/getting-started", internal: true },
    ],
  },
  {
    heading: "Resources",
    links: [
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
  const cls = "cx-link text-sm text-white/45";

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
      <a href={link.href} onClick={handleClick} className={`${cls} cursor-pointer`}>
        {link.label}
      </a>
    );
  }

  if (link.internal) {
    return (
      <Link href={link.href} className={cls}>
        {link.label}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      target={link.href.startsWith("mailto") ? undefined : "_blank"}
      rel="noopener noreferrer"
      className={cls}
    >
      {link.label}
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08]">
      <div className="cx-wrap">
          <div className="py-14 lg:py-16 grid gap-12 lg:grid-cols-[1fr_2fr]">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <img src="/logo-mark.svg" alt="" className="w-6 h-6 object-contain" />
                <span className="font-semibold text-[15px] tracking-tight text-white">CX Linux</span>
              </div>
              <p className="text-sm text-white/45 leading-relaxed max-w-[30ch]">
                The AI-native terminal for Linux. Plain English in, safe
                commands out — previewed, approved, reversible.
              </p>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {columns.map((col) => (
                <div key={col.heading}>
                  <h4 className="cx-label mb-4">{col.heading}</h4>
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
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span className="cx-label">
              © {new Date().getFullYear()} CX Linux — built by engineers who hate toil
            </span>
            <a
              href="https://discord.gg/q4FUyBW6z"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-[#5865F2] transition-colors"
              aria-label="Discord"
            >
              <FaDiscord className="w-4 h-4" />
            </a>
          </div>
      </div>
    </footer>
  );
}
