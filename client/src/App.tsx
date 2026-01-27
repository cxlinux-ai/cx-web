import { useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X, Sparkles, Github, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FAQ from "./pages/faq";
import BetaPage from "./pages/beta";
import Blog from "./pages/blog";
import BlogPostPage from "./pages/blog-post";
import HomePage from "./sections/HomePage";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";
import SecurityPage from "./pages/security-page";
import Status from "./pages/status";
import License from "./pages/license";
import GettingStarted from "./pages/getting-started";
import Hackathon from "./pages/hackathon";
import StartupPage from "./pages/startup";
import NewsPage from "./pages/news";
import NewsArticlePage from "./pages/news-article";
import PricingPage from "./pages/pricing";
import PricingCheckout from "./pages/pricing/checkout";
import PricingSuccess from "./pages/pricing/success";
import PricingFAQ from "./pages/pricing/faq";
import Support from "./pages/support";
import AccountPage from "./pages/account";
import CareersPage from "./pages/careers";

export default function App() {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  // Handle pending scroll after navigation
  useEffect(() => {
    if (location === "/" && pendingScroll) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        const element = document.getElementById(pendingScroll);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          setActiveSection(pendingScroll);
        }
        setPendingScroll(null);
      }, 100);
    }
  }, [location, pendingScroll]);

  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    
    if (location !== "/") {
      // Navigate to home first, then scroll after render
      setPendingScroll(sectionId);
      navigate("/");
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  // Scroll to top smoothly when navigating home
  const handleHomeClick = () => {
    setMobileMenuOpen(false);
    if (location === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPendingScroll("home");
      navigate("/");
    }
  };

  // Scroll to top when navigating to a new page (not homepage sections)
  useEffect(() => {
    // Don't scroll to top if we have a pending section scroll or if on homepage
    if (pendingScroll || location === "/") {
      return;
    }
    // Smooth scroll to top for all other pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location, pendingScroll]);

  // Track active section on scroll (only on homepage)
  useEffect(() => {
    if (location !== "/") {
      return;
    }

    const handleScroll = () => {
      const sections = ["home", "about", "security", "pricing", "join"];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-black text-white">
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10 h-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
              {/* Logo */}
              <button
                onClick={handleHomeClick}
                className="text-2xl font-bold cursor-pointer hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-300"
                data-testid="logo-cortex"
              >
                <span className="text-white">CX</span>{" "}
                <span className="gradient-text">LINUX</span>
              </button>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => scrollToSection("security")}
                  className={`text-base font-medium transition-colors duration-300 ${
                    location === "/" && activeSection === "security"
                      ? "text-brand-blue"
                      : "text-gray-400 hover:text-brand-blue"
                  }`}
                  data-testid="link-security"
                >
                  Security
                </button>
                <Link
                  href="/getting-started"
                  className={`text-base font-medium transition-colors duration-300 ${
                    location === "/getting-started" ? "text-brand-blue" : "text-gray-400 hover:text-brand-blue"
                  }`}
                  data-testid="link-getting-started"
                >
                  Get Started
                </Link>
                <Link
                  href="/news"
                  className={`text-base font-medium transition-colors duration-300 ${
                    location.startsWith("/news") ? "text-brand-blue" : "text-gray-400 hover:text-brand-blue"
                  }`}
                  data-testid="link-news"
                >
                  News
                </Link>
                <Link
                  href="/pricing"
                  className={`text-base font-medium transition-colors duration-300 ${
                    location.startsWith("/pricing") ? "text-brand-blue" : "text-gray-400 hover:text-brand-blue"
                  }`}
                  data-testid="link-pricing"
                >
                  Pricing
                </Link>
                <Link
                  href="/startup"
                  className={`text-base font-medium transition-colors duration-300 ${
                    location === "/startup" ? "text-brand-blue" : "text-gray-400 hover:text-brand-blue"
                  }`}
                  data-testid="link-startup"
                >AI Agencys</Link>
                <Link
                  href="/careers"
                  className={`text-base font-medium transition-colors duration-300 ${
                    location === "/careers" ? "text-brand-blue" : "text-gray-400 hover:text-brand-blue"
                  }`}
                  data-testid="link-careers"
                >
                  Careers
                </Link>
                <Link
                  href="/hackathon"
                  className={`relative text-base font-medium transition-colors duration-300 flex items-center gap-1.5 ${
                    location === "/hackathon" ? "text-terminal-green" : "text-terminal-green hover:text-white"
                  }`}
                  data-testid="link-hackathon"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green" />
                  </span>
                  Hackathon
                </Link>
              </div>

              {/* GitHub Stars & Get Started Button (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <a
                  href="https://github.com/cxlinux-ai/cx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-300 hover:border-blue-400/50 hover:text-white transition-all"
                >
                  <Github size={16} />
                  <Star size={14} className="text-yellow-400" />
                  <span>1.2k</span>
                </a>
                <a
                  href="https://github.com/cxlinux-ai/cx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300"
                  data-testid="button-try-beta"
                >
                  Get Started
                </a>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white p-2"
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
              {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="md:hidden backdrop-blur-xl bg-black/95 border-b border-white/10 overflow-hidden"
              >
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="px-4 py-6 space-y-4"
                >
                  <button
                    onClick={() => scrollToSection("security")}
                    className="block w-full text-left py-2 text-gray-400 hover:text-brand-blue transition-colors duration-300"
                    data-testid="mobile-link-security"
                  >
                    Security
                  </button>
                  <Link
                    href="/getting-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-gray-400 hover:text-brand-blue transition-colors duration-300"
                    data-testid="mobile-link-getting-started"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/news"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-gray-400 hover:text-brand-blue transition-colors duration-300"
                    data-testid="mobile-link-news"
                  >
                    News
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-gray-400 hover:text-brand-blue transition-colors duration-300"
                    data-testid="mobile-link-pricing"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/startup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-gray-400 hover:text-brand-blue transition-colors duration-300"
                    data-testid="mobile-link-startup"
                  >
                    Startups
                  </Link>
                  <Link
                    href="/careers"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-gray-400 hover:text-brand-blue transition-colors duration-300"
                    data-testid="mobile-link-careers"
                  >
                    Careers
                  </Link>
                  <Link
                    href="/hackathon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 w-full text-left py-2 text-terminal-green hover:text-white transition-colors duration-300"
                    data-testid="mobile-link-hackathon"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-terminal-green" />
                    </span>
                    Hackathon
                  </Link>
                  <a
                    href="https://github.com/cxlinux-ai/cx"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-2 bg-brand-blue rounded-lg text-white font-semibold hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] transition-all duration-300"
                    data-testid="mobile-button-try-beta"
                  >
                    Get Started
                  </a>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>
          </nav>

          {/* Routes */}
          <Switch>
            <Route path="/" component={() => <HomePage onNavigate={scrollToSection} />} />
            <Route path="/faq" component={FAQ} />
            <Route path="/beta" component={BetaPage} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPostPage} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/security-policy" component={SecurityPage} />
            <Route path="/status" component={Status} />
            <Route path="/license" component={License} />
            <Route path="/getting-started" component={GettingStarted} />
            <Route path="/hackathon" component={Hackathon} />
            <Route path="/startup" component={StartupPage} />
            <Route path="/news" component={NewsPage} />
            <Route path="/news/:slug" component={NewsArticlePage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/pricing/checkout" component={PricingCheckout} />
            <Route path="/pricing/success" component={PricingSuccess} />
            <Route path="/pricing/faq" component={PricingFAQ} />
            <Route path="/support" component={Support} />
            <Route path="/account" component={AccountPage} />
            <Route path="/careers" component={CareersPage} />
          </Switch>

          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
