import { useState, useEffect } from "react";
import { Switch, Route, Link, useLocation } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Menu, X, Sparkles, Github, Star } from "lucide-react";
import FAQ from "./pages/faq";
import BetaPage from "./pages/beta";
import HomePage from "./sections/HomePage";

export default function App() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Smooth scroll handler
  const scrollToSection = (sectionId: string) => {
    if (location !== "/") {
      // Navigate to home first, then scroll
      window.location.href = "/#" + sectionId;
      return;
    }
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
      setActiveSection(sectionId);
    }
  };

  // Track active section on scroll (only on homepage)
  useEffect(() => {
    if (location !== "/") {
      return;
    }

    const handleScroll = () => {
      const sections = ["home", "about", "security", "pricing", "join", "sponsor"];
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
              <Link
                href="/"
                className="text-2xl font-bold cursor-pointer hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-300"
                data-testid="logo-cortex"
              >
                <span className="text-white">CORTEX</span>{" "}
                <span className="text-blue-400">LINUX</span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                {[
                  { name: "Features", id: "about" },
                  { name: "Docs", id: "preview" },
                  { name: "Security", id: "security" },
                  { name: "Community", id: "join" },
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`text-base font-medium transition-colors duration-300 ${
                      location === "/" && activeSection === link.id
                        ? "text-blue-400"
                        : "text-gray-400 hover:text-blue-400"
                    }`}
                    data-testid={`link-${link.id}`}
                  >
                    {link.name}
                  </button>
                ))}
                <Link
                  href="/faq"
                  className={`text-base font-medium transition-colors duration-300 ${
                    location === "/faq" ? "text-blue-400" : "text-gray-400 hover:text-blue-400"
                  }`}
                  data-testid="link-faq"
                >
                  FAQ
                </Link>
              </div>

              {/* GitHub Stars & Get Started Button (Desktop) */}
              <div className="hidden md:flex items-center gap-3">
                <a
                  href="https://github.com/cortexlinux/cortex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-gray-300 hover:border-blue-400/50 hover:text-white transition-all"
                >
                  <Github size={16} />
                  <Star size={14} className="text-yellow-400" />
                  <span>1.2k</span>
                </a>
                <Link
                  href="/beta"
                  className="flex items-center gap-2 px-5 py-2 bg-blue-500 rounded-lg text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300"
                  data-testid="button-try-beta"
                >
                  Get Started
                </Link>
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
            {mobileMenuOpen && (
              <div className="md:hidden backdrop-blur-xl bg-black/95 border-b border-white/10">
                <div className="px-4 py-6 space-y-4">
                  {[
                    { name: "Features", id: "about" },
                    { name: "Docs", id: "preview" },
                    { name: "Security", id: "security" },
                    { name: "Community", id: "join" },
                  ].map((link) => (
                    <button
                      key={link.id}
                      onClick={() => scrollToSection(link.id)}
                      className="block w-full text-left py-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                      data-testid={`mobile-link-${link.id}`}
                    >
                      {link.name}
                    </button>
                  ))}
                  <Link
                    href="/faq"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-left py-2 text-gray-400 hover:text-blue-400 transition-colors duration-300"
                    data-testid="mobile-link-faq"
                  >
                    FAQ
                  </Link>
                  <Link
                    href="/beta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-2 bg-blue-500 rounded-lg text-white font-semibold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300"
                    data-testid="mobile-button-try-beta"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </nav>

          {/* Routes */}
          <Switch>
            <Route path="/" component={() => <HomePage onNavigate={scrollToSection} />} />
            <Route path="/faq" component={FAQ} />
            <Route path="/beta" component={BetaPage} />
          </Switch>

          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
