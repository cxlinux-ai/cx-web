import { lazy, Suspense, useEffect, useState, useRef } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Github } from "lucide-react";
import analytics from "./lib/analytics";

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

// Loading component
const PageLoader = () => (
  <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hide navigation on checkout pages
  const isCheckoutPage = location.includes("/checkout") || location.includes("/success");

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
                  target="_blank"
                  rel="noopener noreferrer"
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
              </div>

              {/* Desktop CTAs */}
              <div className="hidden md:flex items-center gap-4">
                <a
                  href="https://github.com/cxlinux-ai/cx-core"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <Github size={20} />
                </a>
                <Link href="/pricing">
                  <button className="px-4 py-2 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors">
                    Sign Up Free
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
                      target="_blank"
                      rel="noopener noreferrer"
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
                      href="/pricing"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full text-center px-4 py-2 bg-[#00FF9F] text-black font-semibold rounded-lg"
                    >
                      Sign Up Free
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
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>

        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
