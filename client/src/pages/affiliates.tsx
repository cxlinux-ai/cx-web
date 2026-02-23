import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Gift, 
  DollarSign, 
  Users, 
  Copy, 
  Check, 
  Loader2,
  TrendingUp,
  Link as LinkIcon,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const LICENSE_SERVER = "https://license.cxlinux.com";

export default function AffiliatesPage() {
  const { toast } = useToast();
  
  // Registration form
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  
  // After registration
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  
  // Stats lookup
  const [lookupCode, setLookupCode] = useState("");
  const [stats, setStats] = useState<{
    totalReferrals: number;
    pendingCommission: number;
    paidCommission: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and email.",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    
    try {
      const response = await fetch(`${LICENSE_SERVER}/api/v1/referrals/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register");
      }

      setReferralCode(data.referral_code);
      toast({
        title: "Success!",
        description: "Your referral code has been created.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLookupStats = async () => {
    if (!lookupCode) {
      toast({
        title: "Enter Code",
        description: "Please enter your referral code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingStats(true);
    
    try {
      const response = await fetch(
        `${LICENSE_SERVER}/api/v1/referrals/stats?code=${lookupCode}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Code not found");
      }

      setStats(data);
    } catch (error) {
      toast({
        title: "Not Found",
        description: "Invalid referral code or no stats available.",
        variant: "destructive",
      });
      setStats(null);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Link copied to clipboard.",
    });
  };

  const referralLink = referralCode 
    ? `https://cxlinux.com/pricing?ref=${referralCode}`
    : "";

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF9F]/10 border border-[#00FF9F]/30 rounded-full mb-6"
          >
            <Gift className="w-4 h-4 text-[#00FF9F]" />
            <span className="text-[#00FF9F] text-sm font-medium">
              Affiliate Program
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Earn <span className="text-[#00FF9F]">10% Commission</span>
            <br />
            on Every Referral
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Share CX Linux with your network and earn recurring commission 
            on every paid subscription. No limits, no caps.
          </motion.p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "1. Sign Up",
                desc: "Register below to get your unique referral code",
              },
              {
                icon: LinkIcon,
                title: "2. Share",
                desc: "Share your link with developers who'd love CX Linux",
              },
              {
                icon: DollarSign,
                title: "3. Earn",
                desc: "Get 10% of every subscription payment they make",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#00FF9F]/10 flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-[#00FF9F]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration / Code Display */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          {!referralCode ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">
                Get Your Referral Code
              </h2>
              
              <form onSubmit={handleRegister} className="space-y-4">
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
                  <p className="text-xs text-gray-500 mt-1">
                    Commission contact email (payouts processed monthly via Stripe or bank transfer)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Get My Referral Code
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#00FF9F]/20 to-emerald-500/10 border border-[#00FF9F]/30 rounded-2xl p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00FF9F]/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-[#00FF9F]" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">You're In!</h2>
              <p className="text-gray-400 mb-6">
                Share this link to start earning commission.
              </p>

              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-2">Your Referral Code</p>
                <p className="text-2xl font-mono font-bold text-[#00FF9F]">
                  {referralCode}
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 mb-2">Your Referral Link</p>
                <p className="text-sm font-mono text-gray-300 break-all">
                  {referralLink}
                </p>
              </div>

              <button
                onClick={() => copyToClipboard(referralLink)}
                className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-all flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Referral Link
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Lookup */}
      <section className="py-16 px-4 border-t border-white/10">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Check Your Stats
          </h2>
          
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="flex gap-3 mb-6">
              <Input
                type="text"
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value.toUpperCase())}
                placeholder="Enter your referral code"
                className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00FF9F] font-mono uppercase"
              />
              <button
                onClick={handleLookupStats}
                disabled={isLoadingStats}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all disabled:opacity-50"
              >
                {isLoadingStats ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <TrendingUp className="w-5 h-5" />
                )}
              </button>
            </div>

            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="bg-black/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#00FF9F]">
                    {stats.totalReferrals}
                  </p>
                  <p className="text-xs text-gray-500">Referrals</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    ${stats.pendingCommission.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-black/30 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">
                    ${stats.paidCommission.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Paid</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Questions?</h2>
          <p className="text-gray-400 mb-6">
            Reach out to us for any questions about the affiliate program.
          </p>
          <a
            href="mailto:affiliates@cxlinux.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
