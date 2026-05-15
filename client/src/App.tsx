import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Github, Star } from "lucide-react";
import analytics from "./lib/analytics";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load pages
const HomePage = lazy(() => import("./sections/HomePage"));
const GettingStarted = lazy(() => import("./pages/getting-started"));
const PricingPage = lazy(() => import("./pages/pricing"));
const PricingCheckout = lazy(() => import("./pages/pricing/checkout"));
const PricingSuccessPage = lazy(() => import("./pages/pricing-success"));
const PricingFAQ = lazy(() => import("./pages/pricing/faq"));
const Privacy = lazy(() => import("./pages/privacy"));
const Terms = lazy(() => import("./pages/terms"));
const License = lazy(() => import("./pages/license"));
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
  <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);

  // Hide navigation on checkout pages
  const isCheckoutPage = location.includes("/checkout") || location.includes("/success");

  // Fetch GitHub star count
  useEffect(() => {
    fetch("https://api.github.com/repos/cxlinux-ai/cx-core")
      .then((res) => res.json())
      .then((data) => {
        if (data.stargazers_count) {
          setStarCount(data.stargazers_count);
        }
      })
      .catch(() => {
        // Silently fail, badge will just not show count
      });
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
      <div className="min-h-screen bg-[#1E1E1E]">
        {/* Navigation */}
        {!isCheckoutPage && (
          <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#1E1E1E]/80 border-b border-[#333] h-16">
            <nav className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
              {/* Logo */}
              <button
                onClick={handleHomeClick}
                className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
              >
                <span className="text-white">CX</span>{" "}
                <span className="text-[#00FF9F]">LINUX</span>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/getting-started"
                  className={`text-sm font-medium transition-colors ${
                    location === "/getting-started" ? "text-[#00FF9F]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Terminal
                </Link>
                <a
                  href="https://github.com/cxlinux-ai/cx-distro"
                  className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  target="_blank" rel="noopener noreferrer"
                >
                  Distro
                </a>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors ${
                    location.startsWith("/pricing") ? "text-[#00FF9F]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Pricing
                </Link>
                <Link
                  href="/affiliates"
                  className={`text-sm font-medium transition-colors ${
                    location === "/affiliates" ? "text-[#00FF9F]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Affiliates
                </Link>
                <Link
                  href="/blog"
                  className={`text-sm font-medium transition-colors ${
                    location.startsWith("/blog") ? "text-[#00FF9F]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Blog
                </Link>
                <Link
                  href="/about"
                  className={`text-sm font-medium transition-colors ${
                    location === "/about" ? "text-[#00FF9F]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  About
                </Link>
              </div>

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="https://github.com/cxlinux-ai/cx-core"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#333] border border-[#444] rounded-lg transition-colors"
                >
                  <Github size={18} className="text-white" />
                  <Star size={16} className="text-[#FFD700] fill-[#FFD700]" />
                  {starCount !== null && (
                    <span className="text-white text-sm font-medium">{starCount}</span>
                  )}
                </a>
                <Link href="/account">
                  <button className="px-4 py-2 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors">
                    My Account
                  </button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden bg-[#1E1E1E] border-b border-[#333]"
                >
                  <div className="px-4 py-4 space-y-4">
                    <Link
                      href="/getting-started"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-400 hover:text-white"
                    >
                      Terminal
                    </Link>
                    <a
                      href="https://github.com/cxlinux-ai/cx-distro"
                      className="block text-gray-400 hover:text-white"
                      target="_blank" rel="noopener noreferrer"
                    >
                      Distro
                    </a>
                    <Link
                      href="/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-400 hover:text-white"
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/affiliates"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-400 hover:text-white"
                    >
                      Affiliates
                    </Link>
                    <Link
                      href="/blog"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-400 hover:text-white"
                    >
                      Blog
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-gray-400 hover:text-white"
                    >
                      About
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-2 bg-[#00FF9F] text-black font-semibold rounded-lg"
                    >
                      My Account
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>
        )}

        {/* Main Content */}
        <main className={!isCheckoutPage ? "pt-16" : ""}>
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
              <Route path="/license" component={License} />
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
