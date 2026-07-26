import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import analytics from "./lib/analytics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import SiteHeader from "./components/SiteHeader";

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
  <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#00FF9F] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const [location] = useLocation();

  // Hide navigation on checkout pages
  const isCheckoutPage = location.includes("/checkout") || location.includes("/success");

  // Scroll to top when navigating
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <div className="min-h-screen bg-[#1E1E1E]">
        {/* Navigation */}
        {!isCheckoutPage && <SiteHeader />}

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
