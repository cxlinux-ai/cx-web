import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/Footer";
import {
  WaitlistSignup,
  Leaderboard,
} from "@/components/referral";
import { Trophy, Shield, Gift, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { FaDiscord, FaGithub } from "react-icons/fa";

interface IpDashboardData {
  referralCode: string;
  referralLink: string;
  currentTier: string;
  stats: {
    totalReferrals: number;
    clicks: number;
    shares: number;
    signups: number;
  };
  rewards: {
    unlocked: Array<{ tier: string; reward: string; unlocked: boolean }>;
    next: { tier: string; referralsNeeded: number; reward: string } | null;
  };
  createdAt: string;
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [hasGeneratedCode, setHasGeneratedCode] = useState(false);
  const [, setLocation] = useLocation();

  // Redirect /waitlist to /referrals for backward compatibility
  useEffect(() => {
    if (window.location.pathname === "/waitlist") {
      const searchParams = window.location.search;
      setLocation(`/referrals${searchParams}`);
    }
  }, [setLocation]);

  // Check URL for referral code and track click
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setReferralCode(ref);
      // Track the referral click
      apiRequest("POST", "/api/referral/click", {
        referralCode: ref,
        source: "direct",
      }).catch(() => {});
    }
  }, []);

  // Fetch IP-based dashboard data
  const { data: dashboardData, refetch: refetchDashboard } = useQuery<IpDashboardData>({
    queryKey: ["ip-dashboard"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/referral/ip-dashboard");
      return response.json();
    },
    enabled: hasGeneratedCode,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleSignupSuccess = () => {
    setHasGeneratedCode(true);
    refetchDashboard();
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
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Signup Form / Referral Link Generator */}
            <div>
              <WaitlistSignup
                referralCode={referralCode || undefined}
                onSuccess={handleSignupSuccess}
              />

              {/* Dashboard Stats (shown after code is generated) */}
              {dashboardData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Your Referral Stats
                  </h3>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-white">{dashboardData.stats.totalReferrals}</div>
                      <div className="text-sm text-gray-400">Referrals</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-white">{dashboardData.stats.clicks}</div>
                      <div className="text-sm text-gray-400">Link Clicks</div>
                    </div>
                  </div>

                  {/* Current Tier */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-400">Current Tier</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      dashboardData.currentTier === "none"
                        ? "bg-gray-500/20 text-gray-400"
                        : dashboardData.currentTier === "bronze"
                          ? "bg-amber-500/20 text-amber-400"
                          : dashboardData.currentTier === "silver"
                            ? "bg-gray-300/20 text-gray-300"
                            : dashboardData.currentTier === "gold"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-purple-500/20 text-purple-400"
                    }`}>
                      {dashboardData.currentTier === "none" ? "No Tier Yet" : dashboardData.currentTier.charAt(0).toUpperCase() + dashboardData.currentTier.slice(1)}
                    </span>
                  </div>

                  {/* Next Reward Progress */}
                  {dashboardData.rewards.next && (
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Next: {dashboardData.rewards.next.reward}</span>
                        <span className="text-xs text-blue-400">{dashboardData.rewards.next.tier}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (dashboardData.stats.totalReferrals / (dashboardData.stats.totalReferrals + dashboardData.rewards.next.referralsNeeded)) * 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {dashboardData.rewards.next.referralsNeeded} more referral{dashboardData.rewards.next.referralsNeeded !== 1 ? "s" : ""} needed
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
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
                    <div className="text-xs text-gray-500">Beta Access</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-600/30 to-yellow-700/10 border border-yellow-600/30 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">5</div>
                    <div className="text-xs text-yellow-400 font-medium">Gold</div>
                    <div className="text-xs text-gray-500">Swag Pack</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  +3 more tiers: Platinum, Diamond, Legendary
                </p>
              </div>

              {/* Verification Requirements */}
              <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-400 text-sm">Quality Referrals Only</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Referrals count when they join Discord AND submit a PR or join a hackathon. This ensures real engagement.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FaDiscord className="w-3 h-3" /> Discord
                      </span>
                      <span className="text-gray-600">+</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <FaGithub className="w-3 h-3" /> PR or Hackathon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-16 px-4 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Leaderboard</h2>
          <p className="text-gray-400 text-center mb-8">See who's leading the referral race</p>
          <Leaderboard />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
