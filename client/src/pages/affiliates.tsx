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
  ArrowRight,
  LogIn,
  UserPlus,
  Shield,
  BarChart3,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

const LICENSE_SERVER = "https://license.cxlinux.com";

type Mode = "landing" | "signup" | "signup-otp" | "signup-success" | "login" | "login-otp" | "dashboard";

interface DashboardData {
  referral_code: string;
  referral_link: string;
  name: string | null;
  total_referrals: number;
  total_earned: string;
  unpaid_amount: string;
  paid_amount: string;
  payout_email: string;
  payout_method: string;
  joined_at: string;
  recent_referrals: Array<{
    date: string;
    tier: string;
    commission: string;
    paid: boolean;
  }>;
}

export default function AffiliatesPage() {
  const { toast } = useToast();
  
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.affiliates);
    return cleanup;
  }, []);
  
  const [mode, setMode] = useState<Mode>("landing");
  
  // Form fields
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  
  // Loading states
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Results
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const referralLink = referralCode 
    ? `https://cxlinux.com/pricing?ref=${referralCode}`
    : "";

  // ============================================
  // SIGN UP FLOW
  // ============================================
  const handleSignupSendOTP = async (e: React.FormEvent) => {
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

      setMode("signup-otp");
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

  const handleSignupVerifyOTP = async (e: React.FormEvent) => {
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
      setMode("signup-success");
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

  // ============================================
  // LOGIN / DASHBOARD FLOW
  // ============================================
  const handleLoginSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOTP(true);
    
    try {
      const response = await fetch(`${LICENSE_SERVER}/api/v1/referrals/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setMode("login-otp");
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

  const handleDashboardLogin = async (e: React.FormEvent) => {
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
      const response = await fetch(`${LICENSE_SERVER}/api/v1/referrals/dashboard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load dashboard");
      }

      setDashboard(data);
      setReferralCode(data.referral_code);
      setMode("dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const copyToClipboard = (text: string, type: "link" | "code" = "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast({
      title: "Copied!",
      description: type === "code" ? "Referral code copied." : "Link copied to clipboard.",
    });
  };

  const resetToLanding = () => {
    setMode("landing");
    setEmail("");
    setName("");
    setOtp("");
    setReferralCode("");
    setDashboard(null);
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
            {mode === "dashboard" ? (
              <>Your <span className="text-[#00FF9F]">Affiliate Dashboard</span></>
            ) : (
              <>Earn <span className="text-[#00FF9F]">10% Commission</span></>
            )}
          </h1>
          {mode !== "dashboard" && (
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Share CX Linux with your network and earn recurring commission 
              on every subscription.
            </p>
          )}
        </motion.div>

        {/* Features — only show on landing/signup */}
        {(mode === "landing" || mode === "signup" || mode === "signup-otp" || mode === "signup-success") && (
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
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {/* ============================================ */}
          {/* LANDING — Choose Sign Up or Login */}
          {/* ============================================ */}
          {mode === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              <button
                onClick={() => setMode("signup")}
                className="border-2 border-[#00FF9F] rounded-2xl p-8 text-center bg-[#00FF9F]/5 hover:bg-[#00FF9F]/15 hover:shadow-[0_0_30px_rgba(0,255,159,0.15)] transition-all duration-300 group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#00FF9F]/10 flex items-center justify-center group-hover:bg-[#00FF9F]/20 transition-colors">
                  <UserPlus className="w-7 h-7 text-[#00FF9F]" />
                </div>
                <h2 className="text-xl font-bold mb-2">Become an Affiliate</h2>
                <p className="text-sm text-gray-400">
                  Sign up and get your unique referral code
                </p>
              </button>

              <button
                onClick={() => setMode("login")}
                className="border-2 border-[#00FF9F]/50 rounded-2xl p-8 text-center bg-transparent hover:border-[#00FF9F] hover:bg-[#00FF9F]/10 hover:shadow-[0_0_30px_rgba(0,255,159,0.1)] transition-all duration-300 group"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#00FF9F]/10 transition-colors">
                  <BarChart3 className="w-7 h-7 text-[#00FF9F]" />
                </div>
                <h2 className="text-xl font-bold mb-2">View Dashboard</h2>
                <p className="text-sm text-gray-400">
                  Check your referrals, earnings & performance
                </p>
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* SIGN UP — Name + Email */}
          {/* ============================================ */}
          {mode === "signup" && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                Get Your Referral Code
              </h2>
              
              <form onSubmit={handleSignupSendOTP} className="space-y-4">
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

              <button
                type="button"
                onClick={resetToLanding}
                className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* SIGN UP OTP */}
          {/* ============================================ */}
          {mode === "signup-otp" && (
            <motion.div
              key="signup-otp"
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
              
              <form onSubmit={handleSignupVerifyOTP} className="space-y-4">
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
                  onClick={() => { setMode("signup"); setOtp(""); }}
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Use different email
                </button>
              </form>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* SIGN UP SUCCESS */}
          {/* ============================================ */}
          {mode === "signup-success" && (
            <motion.div
              key="signup-success"
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

              <p className="text-sm text-gray-500 mb-6">
                We've also sent this to your email for safekeeping.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setOtp("");
                    setMode("login");
                  }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Dashboard
                </button>
                <button
                  onClick={resetToLanding}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* LOGIN — Email */}
          {/* ============================================ */}
          {mode === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto"
            >
              <div className="flex items-center justify-center gap-2 mb-6">
                <Shield className="w-6 h-6 text-[#00FF9F]" />
                <h2 className="text-2xl font-bold">Affiliate Dashboard</h2>
              </div>
              <p className="text-gray-400 text-center mb-6 text-sm">
                Enter your email to receive a one-time login code.
              </p>
              
              <form onSubmit={handleLoginSendOTP} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="login-email"
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
                      <LogIn className="w-5 h-5" />
                      Send Login Code
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={resetToLanding}
                className="w-full mt-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* LOGIN OTP */}
          {/* ============================================ */}
          {mode === "login-otp" && (
            <motion.div
              key="login-otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md mx-auto"
            >
              <h2 className="text-2xl font-bold mb-2 text-center">
                Enter Verification Code
              </h2>
              <p className="text-gray-400 text-center mb-6">
                We sent a 6-digit code to <span className="text-[#00FF9F]">{email}</span>
              </p>
              
              <form onSubmit={handleDashboardLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-otp" className="text-gray-300">
                    Verification Code
                  </Label>
                  <Input
                    id="login-otp"
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
                      Loading Dashboard...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      View Dashboard
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode("login"); setOtp(""); }}
                  className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  ← Use different email
                </button>
              </form>
            </motion.div>
          )}

          {/* ============================================ */}
          {/* DASHBOARD */}
          {/* ============================================ */}
          {mode === "dashboard" && dashboard && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* Welcome bar */}
              <div className="flex items-center justify-between">
                <p className="text-gray-400">
                  Welcome back{dashboard.name ? `, ${dashboard.name}` : ""}
                </p>
                <button
                  onClick={resetToLanding}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <Users className="w-6 h-6 text-[#00FF9F] mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{dashboard.total_referrals}</p>
                  <p className="text-xs text-gray-500 mt-1">Total Referrals</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-400">${dashboard.unpaid_amount}</p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <DollarSign className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-400">${dashboard.paid_amount}</p>
                  <p className="text-xs text-gray-500 mt-1">Paid</p>
                </div>
              </div>

              {/* Referral Link Card */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#00FF9F]" />
                  Your Referral Link
                </h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <code className="flex-1 bg-black/30 rounded-lg px-4 py-3 text-sm font-mono text-gray-300 break-all">
                    {dashboard.referral_link}
                  </code>
                  <button
                    onClick={() => copyToClipboard(dashboard.referral_link)}
                    className="shrink-0 p-3 bg-[#00FF9F] text-black rounded-lg hover:bg-[#00CC7F] transition-all"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <code className="bg-black/30 rounded-lg px-4 py-2 text-lg font-mono font-bold text-[#00FF9F]">
                    {dashboard.referral_code}
                  </code>
                  <button
                    onClick={() => copyToClipboard(dashboard.referral_code, "code")}
                    className="shrink-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-sm"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <span className="text-xs text-gray-500">Referral Code</span>
                </div>
              </div>

              {/* Recent Referrals */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00FF9F]" />
                  Recent Referrals
                </h3>
                
                {dashboard.recent_referrals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No referrals yet. Start sharing your link!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dashboard.recent_referrals.map((ref, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-black/20 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                            ref.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                            ref.tier === 'team' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-[#00FF9F]/20 text-[#00FF9F]'
                          }`}>
                            {ref.tier}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(ref.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-[#00FF9F]">
                            +${ref.commission}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            ref.paid 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {ref.paid ? 'Paid' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payout Info */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="font-semibold mb-3">Payout Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Payout Email</p>
                    <p className="text-gray-300">{dashboard.payout_email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Method</p>
                    <p className="text-gray-300 capitalize">{dashboard.payout_method}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Earned</p>
                    <p className="text-[#00FF9F] font-semibold">${dashboard.total_earned}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Member Since</p>
                    <p className="text-gray-300">
                      {dashboard.joined_at ? new Date(dashboard.joined_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
