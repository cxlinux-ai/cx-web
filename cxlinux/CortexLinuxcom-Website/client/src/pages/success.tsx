import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Download,
  Users,
  Sparkles,
  ExternalLink,
  Shield,
  Zap
} from "lucide-react";
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

interface ReferralData {
  success: boolean;
  referralCode: string;
  commission: string;
  tier: string;
}

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copiedStates, setCopiedStates] = useState({
    licenseKey: false,
    installCommand: false,
    onelinerCommand: false,
    referralCode: false,
    isoDownload: false,
  });
  const { toast } = useToast();

  // Generate 12-character Founding 1000 referral code (enhanced from 8-char)
  const generateFoundingReferralCode = (): string => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
    let code = "";
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Welcome to CX Linux! | Success',
      description: 'Your CX Linux subscription is active. Download ISO, get your referral code, and start your Zero-Doc journey.',
      canonicalPath: '/success',
      noIndex: true
    });

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      fetchSessionDetails(sessionId);
    } else {
      // No session ID - could be direct access, generate referral code anyway
      generateReferralCode();
      setStatus('success');
    }

    return cleanup;
  }, []);

  const fetchSessionDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setSessionData(data);
        // Generate referral code for paying customer
        await generateReferralCode();
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setStatus('error');
    }
  };

  const generateReferralCode = async () => {
    try {
      const foundingCode = generateFoundingReferralCode();
      const response = await fetch('/api/referral/founding-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referralCode: foundingCode,
          email: sessionData?.email,
          subscriptionId: sessionData?.subscriptionId,
          planName: sessionData?.planName
        })
      });

      const data = await response.json();
      if (data.success) {
        setReferralData({
          success: true,
          referralCode: data.referralCode,
          commission: '$9.90',
          tier: 'Founding 1000'
        });
      } else {
        // Fallback to generated code
        setReferralData({
          success: true,
          referralCode: foundingCode,
          commission: '$9.90',
          tier: 'Founding 1000'
        });
      }
    } catch (error) {
      console.error('Failed to generate referral code:', error);
      // Generate local fallback
      setReferralData({
        success: true,
        referralCode: generateFoundingReferralCode(),
        commission: '$9.90',
        tier: 'Founding 1000'
      });
    }
  };

  const copyToClipboard = async (text: string, type: keyof typeof copiedStates) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [type]: true }));
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [type]: false }));
      }, 2000);

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

  // Zero-Doc installation commands
  const isoDownloadUrl = "https://releases.cxlinux.ai/latest/cxlinux-latest.iso";
  const installCommand = sessionData?.licenseKey
    ? `# Download ISO\nwget ${isoDownloadUrl}\n\n# Flash to USB\nsudo dd if=cxlinux-latest.iso of=/dev/sdX bs=4M status=progress\n\n# Boot from USB and activate\ncx activate ${sessionData.licenseKey}`
    : `# Download and try CX Linux\nwget ${isoDownloadUrl}\nsudo dd if=cxlinux-latest.iso of=/dev/sdX bs=4M status=progress`;

  const onelinerCommand = sessionData?.licenseKey
    ? `wget ${isoDownloadUrl} && sudo dd if=cxlinux-latest.iso of=/dev/sdX bs=4M && echo "Boot from USB and run: cx activate ${sessionData.licenseKey}"`
    : `wget ${isoDownloadUrl} && sudo dd if=cxlinux-latest.iso of=/dev/sdX bs=4M`;

  if (status === 'loading') {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Preparing your CX Linux experience...</p>
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
            We couldn't verify your session. Try refreshing or contact support.
          </p>
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/pricing">Back to Pricing</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="https://discord.gg/ASvzWcuTfk" target="_blank" rel="noopener noreferrer">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-black">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-20 h-20 rounded-full bg-terminal-green/20 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 size={48} className="text-terminal-green" />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="gradient-text">CX Linux</span>!
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto">
            {sessionData ?
              `Your ${sessionData.planName} subscription is active. Your 14-day free trial has started.` :
              "Ready to experience the AI Layer for Linux. Zero documentation required."
            }
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - ISO Download & Installation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* ISO Download */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <Download size={24} className="text-blue-400" />
                Direct ISO Download
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-2">CX Linux Latest Release</p>
                    <code className="block bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-terminal-green text-sm break-all">
                      {isoDownloadUrl}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(isoDownloadUrl, 'isoDownload')}
                  >
                    {copiedStates.isoDownload ? <Check size={18} className="text-terminal-green" /> : <Copy size={18} />}
                  </Button>
                </div>
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <a
                    href={isoDownloadUrl}
                    download="cxlinux-latest.iso"
                    className="flex items-center justify-center gap-2"
                  >
                    <Download size={20} />
                    Download ISO (2.8GB)
                  </a>
                </Button>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={14} />
                  <span>SHA256 verified • GPG signed • Ubuntu 24.04 base</span>
                </div>
              </div>
            </div>

            {/* License Key (if available) */}
            {sessionData?.licenseKey && (
              <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Terminal size={20} className="text-green-400" />
                  Your License Key
                </h2>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-terminal-green text-sm break-all">
                    {sessionData.licenseKey}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(sessionData.licenseKey, 'licenseKey')}
                  >
                    {copiedStates.licenseKey ? <Check size={18} className="text-terminal-green" /> : <Copy size={18} />}
                  </Button>
                </div>
                <p className="text-gray-500 text-sm mt-3">
                  Save this key - you'll need it to activate CX Linux after installation.
                </p>
              </div>
            )}
          </motion.div>

          {/* Right Column - Referral Code & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Founding 1000 Referral Code */}
            {referralData && (
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                  <Sparkles size={24} className="text-yellow-400" />
                  Founding 1000 Referral Code
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300 mb-2">Your Unique 12-Character Code</p>
                      <code className="block bg-black/50 border border-white/10 rounded-lg px-4 py-3 font-mono text-yellow-400 text-lg font-bold break-all">
                        {referralData.referralCode}
                      </code>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(referralData.referralCode, 'referralCode')}
                    >
                      {copiedStates.referralCode ? <Check size={18} className="text-terminal-green" /> : <Copy size={18} />}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-black/30 rounded-lg">
                      <p className="text-2xl font-bold text-terminal-green">{referralData.commission}</p>
                      <p className="text-xs text-gray-400">per month, lifetime</p>
                    </div>
                    <div className="text-center p-3 bg-black/30 rounded-lg">
                      <p className="text-2xl font-bold text-blue-400">∞</p>
                      <p className="text-xs text-gray-400">referral limit</p>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
                  >
                    <Link href={`/referrals?code=${referralData.referralCode}`}>
                      <Users size={20} />
                      View Referral Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Zap size={16} className="text-yellow-400" />
                  <span className="text-gray-300">Zero documentation required</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={16} className="text-blue-400" />
                  <span className="text-gray-300">BSL 1.1 licensed (competitive protection)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-green-400" />
                  <span className="text-gray-300">Founding member status</span>
                </div>
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-purple-400" />
                  <span className="text-gray-300">Natural language system administration</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Zero-Doc Installation Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white/5 border border-white/10 rounded-xl p-8"
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Terminal size={28} className="text-blue-400" />
            Zero-Doc Installation Guide
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Step-by-step */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Step-by-Step</h3>
              <ol className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">1</span>
                  <div>
                    <p className="font-medium">Download ISO</p>
                    <p className="text-sm text-gray-400">Click the download button above or use wget</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">2</span>
                  <div>
                    <p className="font-medium">Flash to USB</p>
                    <p className="text-sm text-gray-400">Use dd, Rufus, or balenaEtcher</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">3</span>
                  <div>
                    <p className="font-medium">Boot from USB</p>
                    <p className="text-sm text-gray-400">BIOS/UEFI settings may be required</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-medium">4</span>
                  <div>
                    <p className="font-medium">Activate & Start</p>
                    <p className="text-sm text-gray-400">
                      {sessionData?.licenseKey ?
                        `Run: cx activate ${sessionData.licenseKey}` :
                        'Try: cx "install nginx" or cx "setup development environment"'
                      }
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Command Reference */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Command Reference</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Complete installation:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(installCommand, 'installCommand')}
                      className="h-7 px-2"
                    >
                      {copiedStates.installCommand ? <Check size={14} className="text-terminal-green" /> : <Copy size={14} />}
                      <span className="ml-1 text-xs">Copy</span>
                    </Button>
                  </div>
                  <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-gray-300 whitespace-pre-wrap">{installCommand}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">One-liner:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(onelinerCommand, 'onelinerCommand')}
                      className="h-7 px-2"
                    >
                      {copiedStates.onelinerCommand ? <Check size={14} className="text-terminal-green" /> : <Copy size={14} />}
                      <span className="ml-1 text-xs">Copy</span>
                    </Button>
                  </div>
                  <pre className="bg-black/50 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm">
                    <code className="text-gray-300 whitespace-pre-wrap">{onelinerCommand}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Natural Language Examples */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Try These Natural Language Commands</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <code className="block bg-black/40 px-3 py-2 rounded text-terminal-green">cx "install docker"</code>
              <code className="block bg-black/40 px-3 py-2 rounded text-terminal-green">cx "setup postgres"</code>
              <code className="block bg-black/40 px-3 py-2 rounded text-terminal-green">cx "create react app"</code>
              <code className="block bg-black/40 px-3 py-2 rounded text-terminal-green">cx "backup my data"</code>
              <code className="block bg-black/40 px-3 py-2 rounded text-terminal-green">cx "fix my wifi"</code>
              <code className="block bg-black/40 px-3 py-2 rounded text-terminal-green">cx "optimize performance"</code>
            </div>
          </div>
        </motion.div>

        {/* Help Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
        >
          <span className="text-gray-500">Need help?</span>
          <a
            href="https://discord.gg/ASvzWcuTfk"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <SiDiscord size={16} />
            Discord Community
          </a>
          <span className="text-gray-600">|</span>
          <a
            href="https://docs.cxlinux.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ExternalLink size={14} />
            Documentation
          </a>
          <span className="text-gray-600">|</span>
          <Link
            href="/support"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            Support Center
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
          >
            Return to Homepage
          </Link>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}