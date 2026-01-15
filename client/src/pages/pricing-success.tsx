import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { CheckCircle2, ArrowRight, Github, MessageCircle, Book } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";

export default function PricingSuccessPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Subscription Confirmed | Cortex Linux',
      description: 'Your Cortex Linux subscription has been confirmed. Welcome to the team!',
      canonicalPath: '/pricing/success',
      noIndex: true
    });

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      setStatus('success');
    } else {
      setStatus('error');
    }

    return cleanup;
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-8">
            We couldn't verify your subscription. If you completed payment, please contact support.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full" data-testid="link-back-pricing">
              <Link href="/pricing">
                Back to Pricing
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full" data-testid="link-contact-support">
              <a
                href="https://discord.gg/ASvzWcuTfk"
                target="_blank"
                rel="noopener noreferrer"
              >
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-20 h-20 rounded-full bg-terminal-green/20 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={48} className="text-terminal-green" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to Cortex Pro!
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Your 14-day free trial has started. Check your email for login instructions and your license key.
          </p>

          {/* Quick Start Actions */}
          <div className="grid gap-4 mb-12">
            <a
              href="https://github.com/cortexlinux/cortex#installation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl hover:border-blue-500/50 transition-colors group"
              data-testid="link-quickstart"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Book size={24} className="text-blue-300" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Quick Start Guide</h3>
                  <p className="text-sm text-gray-400">Get up and running in 5 minutes</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>

            <a
              href="https://github.com/cortexlinux/cortex"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
              data-testid="link-github"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <Github size={24} className="text-gray-300" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">GitHub Repository</h3>
                  <p className="text-sm text-gray-400">Access the source code and contribute</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>

            <a
              href="https://discord.gg/ASvzWcuTfk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors group"
              data-testid="link-discord"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-lg">
                  <MessageCircle size={24} className="text-gray-300" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Join Discord</h3>
                  <p className="text-sm text-gray-400">Connect with the community and get support</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* What's Next */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left mb-8">
            <h3 className="font-semibold text-white mb-4">What happens next?</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-terminal-green mt-0.5 flex-shrink-0" />
                <span>You'll receive a welcome email with your license key and setup instructions</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-terminal-green mt-0.5 flex-shrink-0" />
                <span>Your 14-day free trial starts today - no charge until trial ends</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-terminal-green mt-0.5 flex-shrink-0" />
                <span>Cancel anytime before the trial ends - no questions asked</span>
              </li>
            </ul>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-300 transition-colors"
            data-testid="link-home"
          >
            Return to Homepage
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
