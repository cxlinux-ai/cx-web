import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateSEO, seoConfigs } from "@/lib/seo";
import { 
  Gift, 
  DollarSign, 
  Users, 
  Copy, 
  Check, 
  Loader2,
  TrendingUp,
  Link as LinkIcon,
  Mail,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LICENSE_SERVER = "https://license.cxlinux.com";

type Step = "form" | "otp" | "success";

export default function AffiliatesPage() {
  const { toast } = useToast();
  
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.affiliates);
    return cleanup;
  }, []);
  
  const [step, setStep] = useState<Step>("form");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  
  // Loading states
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Result
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Stats
  const [lookupCode, setLookupCode] = useState("");
  const [stats, setStats] = useState<{
    totalReferrals: number;
    pendingCommission: number;
    paidCommission: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const referralLink = referralCode 
    ? `https://cxlinux.com/pricing?ref=${referralCode}`
    : "";

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOTP(true);
    
    try {
      const response = await fetch(`${LICENSE_SERVER}/api/v1/referrals/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setStep("otp");
      toast({
        title: "Code Sent!",
        description: "Check your email for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Failed to Send Code",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch(`${LICENSE_SERVER}/api/v1/referrals/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setReferralCode(data.referral_code);
      setStep("success");
      toast({
        title: "Welcome to CX Linux Affiliates!",
        description: "Your referral code is ready.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLookupStats = async () => {
    if (!lookupCode) {
      toast({
        title: "Enter Code",
        description: "Please enter your referral code or email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingStats(true);
    
    try {
      const isEmail = lookupCode.includes("@");
      const param = isEmail ? `email=${lookupCode}` : `code=${lookupCode}`;
      const response = await fetch(
        `${LICENSE_SERVER}/api/v1/referrals/stats?${param}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch stats");
      }

      setStats({
        totalReferrals: data.total_referrals || 0,
        pendingCommission: data.pending_commission || 0,
        paidCommission: data.paid_commission || 0,
      });
    } catch (error) {
      toast({
        title: "Failed to Load Stats",
        description: error instanceof Error ? error.message : "Please check your code.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const resetForm = () => {
    setStep("form");
    setEmail("");
    setName("");
    setOtp("");
    setReferralCode("");
  };

  const features = [
    {
      icon: DollarSign,
      title: "10% Commission",
      desc: "Earn 10% of every subscription payment",
    },
    {
      icon: TrendingUp,
      title: "Recurring Revenue",
      desc: "Get paid every month they stay subscribed",
    },
    {
      icon: Users,
      title: "No Limits",
      desc: "Refer as many developers as you want",
    },
  ];

  return (
    <div className="min-h-screen bg-[#121212] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Earn <span className="text-[#00FF9F]">10% Commission</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Share CX Linux with your network and earn recurring commission 
            on every subscription.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-6 text-center"
            >
              <feature.icon className="w-10 h-10 text-[#00FF9F] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Card */}
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                Get Your Referral Code
              </h2>
              
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F]"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSendingOTP}
                  className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSendingOTP ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Send Verification Code
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold mb-2 text-center">
                Check Your Email
              </h2>
              <p className="text-gray-400 text-center mb-6">
                We sent a 6-digit code to <span className="text-[#00FF9F]">{email}</span>
              </p>
              
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-gray-300">
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    maxLength={6}
                    className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F] text-center text-2xl tracking-widest font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otp.length !== 6}
                  className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Verify & Get Code
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Use different email
                </button>
              </form>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gradient-to-br from-[#00FF9F]/20 to-emerald-500/10 border border-[#00FF9F]/30 rounded-2xl p-8 max-w-md mx-auto text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00FF9F]/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-[#00FF9F]" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">You're In!</h2>
              <p className="text-gray-400 mb-6">
                Start sharing your link to earn commissions.
              </p>

              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Your Referral Code</p>
                <p className="text-3xl font-mono font-bold text-[#00FF9F]">
                  {referralCode}
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2">Your Referral Link</p>
                <p className="text-sm font-mono text-gray-300 break-all mb-3">
                  {referralLink}
                </p>
                <button
                  onClick={() => copyToClipboard(referralLink)}
                  className="w-full py-2 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>

              <p className="text-sm text-gray-500">
                We've also sent this to your email for safekeeping.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Lookup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto"
        >
          <h3 className="text-xl font-bold mb-4 text-center">Check Your Stats</h3>
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="Enter code or email"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F]"
            />
            <button
              onClick={handleLookupStats}
              disabled={isLoadingStats}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoadingStats ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <ArrowRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-[#00FF9F]">{stats.totalReferrals}</p>
                <p className="text-xs text-gray-500">Referrals</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-yellow-400">
                  ${stats.pendingCommission.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-400">
                  ${stats.paidCommission.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
