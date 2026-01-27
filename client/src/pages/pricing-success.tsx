import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle2, Copy, Check, Terminal, ExternalLink } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SessionData {
  success: boolean;
  email: string;
  planName: string;
  licenseKey: string;
  subscriptionId: string;
  trialEnd: string | null;
}

export default function PricingSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedOneliner, setCopiedOneliner] = useState(false);
  const { toast } = useToast();

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
      fetchSessionDetails(sessionId);
    } else {
      setStatus('error');
    }

    return cleanup;
  }, []);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setSessionData(data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setStatus('error');
    }
  };

  const copyToClipboard = async (text: string, type: 'key' | 'install' | 'oneliner') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'key') {
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
      } else if (type === 'install') {
        setCopiedInstall(true);
        setTimeout(() => setCopiedInstall(false), 2000);
      } else {
        setCopiedOneliner(true);
        setTimeout(() => setCopiedOneliner(false), 2000);
      }
      toast({
        title: "Copied!",
        description: "Copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Retrieving your license key...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-black">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-red-400">!</span>
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
                href="https://discord.gg/uCqHvxjU83"
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

  const installCommand = `pip install cortex-pro\ncortex-pro activate ${sessionData?.licenseKey}`;
  const onelinerCommand = `pip install cortex-pro && cortex-pro activate ${sessionData?.licenseKey}`;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-black">
      <div className="max-w-3xl mx-auto px-4">
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
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Cortex {sessionData?.planName}!
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Your 14-day free trial has started. Here's everything you need to get going.
          </p>
        </motion.div>

        {/* License Key Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Terminal size={20} className="text-blue-400" />
            Your License Key
          </h2>
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-terminal-green text-sm md:text-base break-all">
              {sessionData?.licenseKey}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(sessionData?.licenseKey || '', 'key')}
              data-testid="button-copy-license"
            >
              {copiedKey ? <Check size={18} className="text-terminal-green" /> : <Copy size={18} />}
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-3">
            Save this key - you'll need it to activate Cortex on your systems.
          </p>
        </motion.div>

        {/* Installation Commands */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Install Cortex Pro</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Standard installation:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(installCommand, 'install')}
                  className="h-7 px-2"
                  data-testid="button-copy-install"
                >
                  {copiedInstall ? <Check size={14} className="text-terminal-green" /> : <Copy size={14} />}
                  <span className="ml-1 text-xs">Copy</span>
                </Button>
              </div>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">
                  <span className="text-gray-500">$</span> pip install cortex-pro{'\n'}
                  <span className="text-gray-500">$</span> cortex-pro activate <span className="text-terminal-green">{sessionData?.licenseKey}</span>
                </code>
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Or one-liner:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(onelinerCommand, 'oneliner')}
                  className="h-7 px-2"
                  data-testid="button-copy-oneliner"
                >
                  {copiedOneliner ? <Check size={14} className="text-terminal-green" /> : <Copy size={14} />}
                  <span className="ml-1 text-xs">Copy</span>
                </Button>
              </div>
              <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-gray-300">
                  <span className="text-gray-500">$</span> pip install cortex-pro && cortex-pro activate <span className="text-terminal-green">{sessionData?.licenseKey}</span>
                </code>
              </pre>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Next Steps</h2>
          <ol className="space-y-3 text-gray-400">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">1</span>
              <span>Open a terminal on any Linux system</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">2</span>
              <span>Run the install command above to activate Cortex</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">3</span>
              <span>Start using natural language: <code className="bg-black/50 px-2 py-0.5 rounded text-terminal-green">cortex install nginx</code></span>
            </li>
          </ol>
        </motion.div>

        {/* Help Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 text-sm"
        >
          <span className="text-gray-500">Need help?</span>
          <a
            href="https://discord.gg/uCqHvxjU83"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            data-testid="link-discord"
          >
            <SiDiscord size={16} />
            Discord
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="https://github.com/cxlinux-ai/cortex"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            data-testid="link-docs"
          >
            <ExternalLink size={14} />
            Documentation
          </a>
          <span className="text-gray-600">|</span>
          <Link
            href="/support"
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            data-testid="link-support"
          >
            Support
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-8"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-300 transition-colors text-sm"
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
