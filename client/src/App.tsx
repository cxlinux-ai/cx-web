import { lazy, Suspense, useEffect, useState } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Shield, Mail } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import analytics from "./lib/analytics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Backdrop } from "./components/fx/Backdrop";

// Lazy load pages
const HomePage = lazy(() => import("./sections/HomePage"));
const GettingStarted = lazy(() => import("./pages/getting-started"));
const PricingPage = lazy(() => import("./pages/pricing"));
const PricingCheckout = lazy(() => import("./pages/pricing/checkout"));
const PricingSuccessPage = lazy(() => import("./pages/pricing-success"));
const PricingFAQ = lazy(() => import("./pages/pricing/faq"));
const Privacy = lazy(() => import("./pages/privacy"));
const Terms = lazy(() => import("./pages/terms"));
const NotFound = lazy(() => import("./pages/not-found"));
const FAQ = lazy(() => import("./pages/faq"));
const Affiliates = lazy(() => import("./pages/affiliates"));
const BlogIndex = lazy(() => import("./pages/blog/index"));
const BlogPost = lazy(() => import("./pages/blog/post"));
const BlogTagArchive = lazy(() => import("./pages/blog/tag/index"));
const AdminPanel = lazy(() => import("./pages/admin/index"));
const AboutPage = lazy(() => import("./pages/about"));
const StatusPage = lazy(() => import("./pages/status"));
const AccountPage = lazy(() => import("./pages/account"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <span className="cx-label">
      loading<span className="cx-caret" />
    </span>
  </div>
);

const NAV_LINKS = [
  { label: "Terminal", href: "/getting-started", match: (l: string) => l === "/getting-started" },
  { label: "Pricing", href: "/pricing", match: (l: string) => l.startsWith("/pricing") },
  { label: "Affiliates", href: "/affiliates", match: (l: string) => l === "/affiliates" },
  { label: "Blog", href: "/blog", match: (l: string) => l.startsWith("/blog") },
  { label: "About", href: "/about", match: (l: string) => l === "/about" },
];

function App() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide navigation on checkout pages
  const isCheckoutPage = location.includes("/checkout") || location.includes("/success");

  // Scroll-aware header background
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to top when navigating
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  }, [location]);

  const handleHomeClick = () => {
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <div className="min-h-screen">
        <Backdrop />

        {/* Navigation — two-tier, scroll-aware */}
        {!isCheckoutPage && (
          <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 backdrop-blur-md ${
              scrolled
                ? "bg-[#08080a]/85 border-b border-white/[0.08]"
                : "bg-[#08080a]/70 border-b border-transparent"
            }`}
          >
            {/* Top bar — trust + contact, desktop only */}
            <div className="hidden lg:block bg-[#0e0e12] border-b border-white/[0.08]">
              <div className="mx-auto max-w-7xl px-6 py-1.5 flex items-center justify-between text-[13px] text-white/60">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Sandboxed · previewed · reversible
                  </span>
                  <span className="text-white/25">|</span>
                  <a
                    href="https://discord.gg/q4FUyBW6z"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:text-[#7AA0FF] transition-colors"
                  >
                    <FaDiscord className="w-3.5 h-3.5" />
                    2,400+ engineers in Discord
                  </a>
                </div>
                <a
                  href="mailto:sales@cxlinux.com"
                  className="flex items-center gap-1.5 font-medium hover:text-[#7AA0FF] transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  sales@cxlinux.com
                </a>
              </div>
            </div>

            {/* Main navigation */}
            <nav className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="flex h-16 items-center justify-between">
                {/* Logo */}
                <button onClick={handleHomeClick} className="flex items-center gap-2.5 cursor-pointer shrink-0">
                  <img src="/logo-mark.svg" alt="" className="w-7 h-7 object-contain" />
                  <span className="font-bold text-[17px] tracking-tight text-white leading-none">
                    CX Linux
                  </span>
                </button>

                {/* Desktop nav */}
                <div className="hidden lg:flex items-center gap-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`inline-flex h-9 items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        link.match(location)
                          ? "text-[#7AA0FF]"
                          : "text-white/60 hover:text-[#7AA0FF] hover:bg-white/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                  <Link
                    href="/account"
                    className="inline-flex h-9 items-center px-3 text-sm font-medium rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Account
                  </Link>
                  <Link href="/getting-started" className="cx-btn cx-btn-primary">
                    Install CX
                  </Link>
                </div>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden text-white p-2"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden bg-[#08080a] border-b border-white/[0.08] overflow-hidden"
                >
                  <div className="px-5 py-3">
                    {NAV_LINKS.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center px-3 py-3 rounded-lg text-[15px] font-medium transition-colors ${
                          link.match(location)
                            ? "text-[#7AA0FF] bg-[#2F6BFF]/10"
                            : "text-white/70 hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-3 rounded-lg text-[15px] font-medium text-white/70 hover:bg-white/5 transition-colors"
                    >
                      Account
                    </Link>
                    <div className="pt-3 pb-3 px-1">
                      <Link
                        href="/getting-started"
                        onClick={() => setMobileMenuOpen(false)}
                        className="cx-btn cx-btn-primary w-full"
                      >
                        Install CX
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        )}

        {/* Main Content */}
        <main>
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/" component={HomePage} />
              <Route path="/getting-started" component={GettingStarted} />
              <Route path="/pricing" component={PricingPage} />
              <Route path="/pricing/checkout" component={PricingCheckout} />
              <Route path="/pricing/success" component={PricingSuccessPage} />
              <Route path="/pricing/faq" component={PricingFAQ} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/terms" component={Terms} />
              <Route path="/faq" component={FAQ} />
              <Route path="/about" component={AboutPage} />
              <Route path="/status" component={StatusPage} />
              <Route path="/affiliates" component={Affiliates} />
              <Route path="/blog" component={BlogIndex} />
              <Route path="/blog/tag/:tag" component={BlogTagArchive} />
              <Route path="/blog/:slug" component={BlogPost} />
              <Route path="/account" component={AccountPage} />
              <Route path="/admin" component={AdminPanel} />
              <Route path="/admin/referrals" component={AdminPanel} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>

        <Toaster />
      </div>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
