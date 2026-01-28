import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Mail,
  Loader2,
  Sparkles,
} from "lucide-react";
import Footer from "@/components/Footer";

interface SubscriptionDetails {
  email: string;
  planName: string;
  billingCycle: string;
  trialEnds: string;
  licenseKey?: string;
}

export default function SuccessPage() {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id");

  useEffect(() => {
    // Fetch subscription details
    const fetchSubscription = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/checkout-session/${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch subscription details");
        }

        setSubscription(data);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(err instanceof Error ? err.message : "Failed to load subscription details");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [sessionId]);

  const nextSteps = [
    {
      icon: Download,
      title: "Install CX Linux",
      description: "Download and install CX Linux on your Linux machine",
      link: "https://github.com/cxlinux-ai/cx",
      external: true,
    },
    {
      icon: BookOpen,
      title: "Manage License",
      description: "View your license key and activated systems",
      link: "/account",
      external: false,
    },
    {
      icon: MessageSquare,
      title: "Join Discord",
      description: "Connect with the community and get support",
      link: "https://discord.gg/uCqHvxjU83",
      external: true,
    },
  ];

  return (
    <div id="success-page-container" className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Success Icon */}
          <div id="success-icon-container" className="relative inline-block mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>

          {/* Main Heading */}
          <motion.h1
            id="success-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl font-extrabold mb-4"
          >
            <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to CX Linux!
            </span>
          </motion.h1>

          <motion.p
            id="success-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Your subscription has been activated successfully.
          </motion.p>
        </motion.div>

        {/* Subscription Details Card */}
        {loading ? (
          <div id="success-loading" className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            id="success-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 mb-12 text-center"
          >
            <p className="text-red-400">{error}</p>
            <p className="text-gray-400 text-sm mt-2">
              Don't worry - your subscription is active. Check your email for confirmation.
            </p>
          </motion.div>
        ) : subscription ? (
          <motion.div
            id="success-details-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">Confirmation sent to:</span>
              <span className="text-white font-medium">{subscription.email}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Plan</p>
                <p className="text-white font-semibold">{subscription.planName}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Billing</p>
                <p className="text-white font-semibold capitalize">{subscription.billingCycle}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Trial Ends</p>
                <p className="text-white font-semibold">{subscription.trialEnds}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            id="success-generic-message"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-12 text-center"
          >
            <p className="text-gray-400">
              Your subscription is being processed. Check your email for confirmation details.
            </p>
          </motion.div>
        )}

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 id="success-next-steps-title" className="text-2xl font-bold mb-6 text-center">
            Get Started
          </h2>
          <div id="success-next-steps-grid" className="grid sm:grid-cols-3 gap-6">
            {nextSteps.map((step, index) => (
              <motion.div
                key={step.title}
                id={`success-step-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 hover:border-purple-400/50 transition-all"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{step.description}</p>
                {step.external ? (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-purple-400 text-sm hover:text-purple-300 transition-colors"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href={step.link}
                    className="inline-flex items-center gap-1 text-purple-400 text-sm hover:text-purple-300 transition-colors"
                  >
                    Get Started <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          id="success-support-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Have questions? Our support team is here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              id="success-email-support"
              href="mailto:support@cxlinux.com"
              className="px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all"
            >
              Contact Support
            </a>
            <Link
              id="success-faq-link"
              href="/pricing/faq"
              className="px-6 py-3 border-2 border-purple-400 text-purple-400 font-semibold rounded-lg hover:bg-purple-400/10 transition-all"
            >
              View FAQ
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
