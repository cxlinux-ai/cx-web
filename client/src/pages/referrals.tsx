import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/Footer";
import { WaitlistSignup, ReferralDashboard, Leaderboard } from "@/components/referral";
import { Users, Gift, Trophy, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SignupResponse {
  message: string;
  referralCode: string;
  position: number;
  totalWaitlist: number;
  verificationRequired?: boolean;
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [, setLocation] = useLocation();

  // Redirect /waitlist to /referrals for backward compatibility
  useEffect(() => {
    if (window.location.pathname === "/waitlist") {
      const searchParams = window.location.search;
      setLocation(`/referrals${searchParams}`);
    }
  }, [setLocation]);

  // Check URL for referral code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
    }

    // Check if user has their own referral code stored
    const storedCode = localStorage.getItem("cortex_referral_code");
    if (storedCode) {
      setShowDashboard(true);
      setReferralCode(storedCode);
    }
  }, []);

  const handleSignupSuccess = (data: SignupResponse) => {
    localStorage.setItem("cortex_referral_code", data.referralCode);
    setReferralCode(data.referralCode);
    setShowDashboard(true);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Hero Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm mb-6"
          >
            <Gift size={16} />
            Referral Program
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            <span className="gradient-text">Invite Friends, Earn Rewards</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto mb-8"
          >
            Join the Cortex Linux community. Refer friends to move up the list and unlock exclusive perks like Discord roles, Pro subscriptions, and Hackathon fast-tracks.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-400"
          >
            <span className="flex items-center gap-2">
              <Trophy size={16} className="text-yellow-400" />
              6 reward tiers
            </span>
            <span className="flex items-center gap-2">
              <Zap size={16} className="text-emerald-400" />
              Instant perks
            </span>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {showDashboard && referralCode ? (
            <div className="space-y-12">
              {/* Dashboard */}
              <ReferralDashboard referralCode={referralCode} />

              {/* Leaderboard */}
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Top Referrers</h2>
                <Leaderboard />
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Signup Form */}
              <div>
                <WaitlistSignup
                  referralCode={referralCode || undefined}
                  onSuccess={handleSignupSuccess}
                />
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Why Join Early?</h2>

                <div className="space-y-4">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">1</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Priority Access</h3>
                        <p className="text-gray-400 text-sm">
                          Be among the first to experience the future of Linux with AI-powered natural language commands.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">2</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Referral Rewards</h3>
                        <p className="text-gray-400 text-sm">
                          Earn tier badges, exclusive Discord roles, and Pro subscriptions by inviting friends.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">3</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Skip the Line</h3>
                        <p className="text-gray-400 text-sm">
                          Each successful referral moves you up in the queue. Top referrers get VIP access.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">4</div>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Shape the Product</h3>
                        <p className="text-gray-400 text-sm">
                          Early users get direct input into features and development priorities.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reward Tiers Preview */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Reward Tiers</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-700/30 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">1</div>
                      <div className="text-xs text-amber-400 font-medium">Bronze</div>
                      <div className="text-xs text-gray-500">+100 spots</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-400/20 to-gray-500/10 border border-gray-500/30 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">3</div>
                      <div className="text-xs text-gray-300 font-medium">Silver</div>
                      <div className="text-xs text-gray-500">+500 spots</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600/30 to-yellow-700/10 border border-yellow-600/30 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">5</div>
                      <div className="text-xs text-yellow-400 font-medium">Gold</div>
                      <div className="text-xs text-gray-500">Discord Role</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard Section (shown when not logged in) */}
      {!showDashboard && (
        <section className="py-16 px-4 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Leaderboard</h2>
            <p className="text-gray-400 text-center mb-8">See who's leading the referral race</p>
            <Leaderboard />
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
