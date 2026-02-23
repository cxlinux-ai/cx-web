import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Shield,
  Check,
  Loader2,
  ArrowLeft,
  Lock,
  Zap,
  Server,
  Gift,
  Mail,
  Key,
  Copy,
} from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LICENSE_SERVER = "https://license.cxlinux.com";

interface PlanDetails {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  icon: typeof Zap;
}

const plans: Record<string, PlanDetails> = {
  core: {
    id: "core",
    name: "Core",
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      "Full CLI commands",
      "Local LLM (Ollama)",
      "Dry-run safety mode",
      "Rollback support",
      "1 system",
      "Community support",
    ],
    stripePriceIdMonthly: "",
    stripePriceIdAnnual: "",
    icon: Server,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 20,
    annualPrice: 200,
    features: [
      "Cloud LLMs (GPT-4, Claude)",
      "Web console dashboard",
      "Email support (24h response)",
      "Priority updates",
      "API access",
    ],
    stripePriceIdMonthly: "price_1SqYQjJ4X1wkC4EsLDB6ZbOk",
    stripePriceIdAnnual: "price_1SqYQjJ4X1wkC4EslIkZEJFZ",
    icon: Zap,
  },
  team: {
    id: "team",
    name: "Team",
    monthlyPrice: 99,
    annualPrice: 990,
    features: [
      "Everything in Pro",
      "Team workspaces",
      "Role-based access control",
      "Shared command history",
      "Priority support (4h)",
    ],
    stripePriceIdMonthly: "price_1SqYQkJ4X1wkC4Es8OMt79pZ",
    stripePriceIdAnnual: "price_1SqYQkJ4X1wkC4EsWYwUgceu",
    icon: Shield,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 299,
    annualPrice: 2990,
    features: [
      "SSO/LDAP integration",
      "Audit logs & compliance",
      "SOC2 & HIPAA reports",
      "99.9% SLA guarantee",
      "Dedicated Slack channel",
    ],
    stripePriceIdMonthly: "price_1SqYQkJ4X1wkC4EsCFVBHYnT",
    stripePriceIdAnnual: "price_1SqYQlJ4X1wkC4EsJcPW7Of2",
    icon: Server,
  },
};

type FreeStep = "form" | "otp" | "success";

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Parse URL params
  const params = new URLSearchParams(window.location.search);
  const planId = params.get("plan") || "pro";
  const billingCycle = params.get("billing") || "monthly";
  const initialReferralCode = params.get("ref") || localStorage.getItem("cx_referral") || "";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [referralCode, setReferralCode] = useState(initialReferralCode);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(billingCycle === "annual");
  
  // Free tier OTP flow
  const [freeStep, setFreeStep] = useState<FreeStep>("form");
  const [otp, setOtp] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [copied, setCopied] = useState(false);

  const plan = plans[planId] || plans.pro;
  const priceId = isAnnual ? plan.stripePriceIdAnnual : plan.stripePriceIdMonthly;
  
  const monthlyCostIfAnnual = plan.annualPrice / 12;
  const annualSavings = (plan.monthlyPrice * 12) - plan.annualPrice;
  const savingsPercent = Math.round((annualSavings / (plan.monthlyPrice * 12)) * 100);

  useEffect(() => {
    const urlRef = params.get("ref");
    if (urlRef) {
      localStorage.setItem("cx_referral", urlRef);
    }
  }, []);

  useEffect(() => {
    setIsAnnual(billingCycle === "annual");
  }, [billingCycle]);

  // Handle free tier OTP send
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${LICENSE_SERVER}/api/v1/licenses/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if user already has a license
        if (data.existing && data.license_key) {
          setLicenseKey(data.license_key);
          setFreeStep("success");
          toast({
            title: "Welcome back!",
            description: "You already have a license. Here's your key.",
          });
          return;
        }
        throw new Error(data.error || "Failed to send verification code");
      }

      setFreeStep("otp");
      toast({
        title: "Check your email",
        description: "We sent a 6-digit verification code.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send verification code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle free tier OTP verification
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

    setIsLoading(true);

    try {
      const response = await fetch(`${LICENSE_SERVER}/api/v1/licenses/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setLicenseKey(data.license_key);
      setFreeStep("success");
      toast({
        title: "Welcome to CX Linux!",
        description: "Your free license is ready.",
      });
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Invalid or expired code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle paid tier checkout
  const handlePaidCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const ref = referralCode || localStorage.getItem("cx_referral") || "";
      
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          company,
          priceId,
          planId: plan.id,
          billingCycle: isAnnual ? "annual" : "monthly",
          referralCode: ref,
          successUrl: `${window.location.origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing/checkout?plan=${planId}&billing=${isAnnual ? "annual" : "monthly"}${ref ? `&ref=${ref}` : ""}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Failed to start checkout.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "License key copied to clipboard." });
  };

  // Free tier flow
  if (plan.id === "core") {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-2xl mx-auto px-4 py-24">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Pricing
          </Link>

          <AnimatePresence mode="wait">
            {freeStep === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-3xl font-bold mb-2">Get CX Core Free</h1>
                <p className="text-gray-400 mb-8">
                  Register to get your free license key. No credit card required.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-[#00FF9F]" />
                    CX Core includes:
                  </h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">
                      Full Name <span className="text-red-400">*</span>
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
                      Email Address <span className="text-red-400">*</span>
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
                    disabled={isLoading}
                    className="w-full py-4 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
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

            {freeStep === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
                <p className="text-gray-400 mb-8">
                  We sent a 6-digit code to <span className="text-[#00FF9F]">{email}</span>
                </p>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <Label htmlFor="otp" className="text-gray-300">
                      Verification Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F] text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-4 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Verify & Get License
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFreeStep("form")}
                    className="w-full py-2 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    ← Use different email
                  </button>
                </form>
              </motion.div>
            )}

            {freeStep === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#00FF9F]/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-[#00FF9F]" />
                </div>

                <h1 className="text-3xl font-bold mb-2">Welcome to CX Linux!</h1>
                <p className="text-gray-400 mb-8">
                  Your free license is ready. We've also sent it to your email.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                  <p className="text-sm text-gray-400 mb-3">Your License Key</p>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-xl font-mono text-[#00FF9F] font-bold">
                      {licenseKey}
                    </code>
                    <button
                      onClick={copyLicenseKey}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-[#1E1E1E] rounded-xl p-6 text-left mb-8">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#00FF9F]" />
                    Next Steps
                  </h3>
                  <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#00FF9F]/20 text-[#00FF9F] flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                      <span>Install CX Terminal from <a href="/getting-started" className="text-[#00FF9F] hover:underline">Getting Started</a></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#00FF9F]/20 text-[#00FF9F] flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                      <span>Run: <code className="bg-black/50 px-2 py-1 rounded text-[#00FF9F]">cx license activate {licenseKey}</code></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#00FF9F]/20 text-[#00FF9F] flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                      <span>Start using AI-powered terminal commands!</span>
                    </li>
                  </ol>
                </div>

                <Link
                  href="/getting-started"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all"
                >
                  Go to Getting Started
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Paid tier flow (unchanged)
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-24">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2">Complete Your Subscription</h1>
            <p className="text-gray-400 mb-8">Secure checkout powered by Stripe.</p>

            {initialReferralCode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <Gift className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">Referred by a friend</p>
                  <p className="text-sm text-gray-400">
                    Code: <span className="font-mono text-green-300">{initialReferralCode}</span>
                  </p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handlePaidCheckout} className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Full Name <span className="text-red-400">*</span>
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
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  required
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F]"
                />
              </div>

              <div>
                <Label htmlFor="company" className="text-gray-300">
                  Company Name <span className="text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Corp"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F]"
                />
              </div>

              <div>
                <Label htmlFor="referral" className="text-gray-300">
                  Referral Code <span className="text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="referral"
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    const code = e.target.value.toUpperCase();
                    setReferralCode(code);
                    if (code) localStorage.setItem("cx_referral", code);
                  }}
                  placeholder="Enter referral code"
                  className="mt-2 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F] font-mono uppercase"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-400 mb-3">Billing Cycle</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      !isAnnual ? "bg-[#00FF9F] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Monthly
                    <span className="block text-xs mt-1 opacity-75">${plan.monthlyPrice}/mo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                      isAnnual ? "bg-[#00FF9F] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    Annual
                    <span className="block text-xs mt-1 opacity-75">
                      ${plan.annualPrice}/yr <span className="text-green-400">Save {savingsPercent}%</span>
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Subscribe Now
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                Secured by Stripe. Your payment info is encrypted.
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="bg-gradient-to-r from-[#00FF9F]/10 to-[#00FF9F]/10 border border-[#00FF9F]/30 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#00FF9F]/20 rounded-lg flex items-center justify-center">
                    <plan.icon className="w-5 h-5 text-[#00FF9F]" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{plan.name} Plan</h3>
                    <p className="text-sm text-gray-400">
                      {isAnnual ? "Billed annually" : "Billed monthly"}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-400">
                  <span>{plan.name} ({isAnnual ? "Annual" : "Monthly"})</span>
                  <span>{isAnnual ? `$${plan.annualPrice}/yr` : `$${plan.monthlyPrice}/mo`}</span>
                </div>
                {isAnnual && (
                  <div className="flex justify-between text-green-400 text-sm">
                    <span>You save vs monthly</span>
                    <span>-${annualSavings}/yr</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Due today</span>
                    <span className="text-green-400">
                      {isAnnual ? `$${plan.annualPrice}` : `$${plan.monthlyPrice}`}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-gray-500 mt-1">
                      That's ~${monthlyCostIfAnnual.toFixed(2)}/mo
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-400 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-400">30-Day Money Back</p>
                    <p className="text-sm text-gray-400">
                      Not satisfied? Get a full refund within 30 days.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  <span>SSL Encrypted</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>SOC2 Compliant</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
