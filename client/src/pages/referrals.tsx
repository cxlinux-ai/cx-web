import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/Footer";
import {
  WaitlistSignup,
  Leaderboard,
} from "@/components/referral";
import { Trophy, Shield, Gift, Zap, Users, Lightbulb, Building, Star, Award } from "lucide-react";
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

      {/* Viral Loop Reward Tiers Section */}
      <section className="py-16 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The More You Share, The More You <span className="text-terminal-green">Earn</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Build your network of hackathon participants and unlock valuable rewards at each tier
            </p>
          </motion.div>

          {/* Viral Loop Visual Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-8"
          >
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-2">
                  <Gift size={28} className="text-blue-400" />
                </div>
                <span className="text-sm text-white font-medium">You Share</span>
                <span className="text-xs text-gray-500">Your referral link</span>
              </div>
              <div className="text-2xl text-gray-600 rotate-90 md:rotate-0">→</div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                  <Users size={28} className="text-purple-400" />
                </div>
                <span className="text-sm text-white font-medium">Friends Register</span>
                <span className="text-xs text-gray-500">Both hackathon phases</span>
              </div>
              <div className="text-2xl text-gray-600 rotate-90 md:rotate-0">→</div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                  <Lightbulb size={28} className="text-amber-400" />
                </div>
                <span className="text-sm text-white font-medium">They Participate</span>
                <span className="text-xs text-gray-500">Submit idea + project</span>
              </div>
              <div className="text-2xl text-gray-600 rotate-90 md:rotate-0">→</div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-terminal-green/20 flex items-center justify-center mb-2">
                  <Trophy size={28} className="text-terminal-green" />
                </div>
                <span className="text-sm text-white font-medium">You Earn Rewards</span>
                <span className="text-xs text-gray-500">Credits, swag & more</span>
              </div>
            </div>
          </motion.div>

          {/* Reward Tier Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Tier 1: $20 Credit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 border-2 border-emerald-500/30 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-400">5</span>
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-medium uppercase tracking-wide">Referrals</div>
                  <div className="text-lg font-bold text-white">Starter Tier</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-terminal-green mb-1">$20</div>
                <div className="text-sm text-gray-400">Worth of Cortex Linux Credit</div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-emerald-400" />
                  Apply to Pro subscription
                </li>
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-emerald-400" />
                  Or use for managed services
                </li>
              </ul>
            </motion.div>

            {/* Tier 2: Goodies Package + $50 Credit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 border-2 border-purple-500/30 rounded-2xl p-6 pt-8 relative transform md:scale-105 md:-translate-y-2"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-xs font-bold rounded-full z-10">
                POPULAR
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-400">20</span>
                </div>
                <div>
                  <div className="text-xs text-purple-400 font-medium uppercase tracking-wide">Referrals</div>
                  <div className="text-lg font-bold text-white">Community Tier</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-purple-400 mb-1">$50 + Goodies</div>
                <div className="text-sm text-gray-400">Credit + Exclusive Swag Package</div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-purple-400" />
                  $50 Cortex Linux Credit
                </li>
                <li className="flex items-center gap-2">
                  <Gift size={14} className="text-purple-400" />
                  Cortex Linux T-Shirt
                </li>
                <li className="flex items-center gap-2">
                  <Gift size={14} className="text-purple-400" />
                  Premium Water Bottle
                </li>
                <li className="flex items-center gap-2">
                  <Gift size={14} className="text-purple-400" />
                  Developer Notebook
                </li>
              </ul>
            </motion.div>

            {/* Tier 3: Premium + Bundle + $200 Credit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-500/10 to-yellow-900/5 border-2 border-yellow-500/30 rounded-2xl p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-yellow-400">50</span>
                </div>
                <div>
                  <div className="text-xs text-yellow-400 font-medium uppercase tracking-wide">Referrals</div>
                  <div className="text-lg font-bold text-white">Ambassador Tier</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-yellow-400 mb-1">$200 + Premium</div>
                <div className="text-sm text-gray-400">The Ultimate Package</div>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" />
                  $200 Cortex Linux Credit
                </li>
                <li className="flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-400" />
                  Cortex Linux Premium (3 months)
                </li>
                <li className="flex items-center gap-2">
                  <Gift size={14} className="text-yellow-400" />
                  Full Goodies Bundle
                </li>
                <li className="flex items-center gap-2">
                  <Award size={14} className="text-yellow-400" />
                  Ambassador Recognition
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Requirements Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6 mb-12"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Shield size={24} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Important: Referral Requirements</h3>
                <p className="text-gray-400 text-sm mb-4">
                  To ensure quality participation, referrals only count when they complete these requirements:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">1</span>
                      <span className="font-medium text-white">Register for BOTH Phases</span>
                    </div>
                    <p className="text-xs text-gray-500">Must sign up for both the Ideathon (Phase 1) AND Hackathon (Phase 2)</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">2</span>
                      <span className="font-medium text-white">Submit Real Work</span>
                    </div>
                    <p className="text-xs text-gray-500">Must submit an idea (Phase 1) AND a project (Phase 2) to count as valid</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Special Awards Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold text-white text-center mb-8">
              Special Recognition Awards
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Building size={24} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Multi-University Recruiter</h4>
                    <p className="text-xs text-blue-400">Special recognition award</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Teams or individuals who successfully recruit participants from multiple universities receive special recognition awards and increased visibility in our community.
                </p>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500">
                    Recruiting from 3+ universities earns you a dedicated shoutout on our website and Discord
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Star size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Community Ambassador</h4>
                    <p className="text-xs text-purple-400">For large group recruiters</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Those who bring in large groups (clubs, bootcamps, study groups) receive special Community Ambassador status with exclusive perks.
                </p>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-xs text-gray-500">
                    Includes: Ambassador badge, direct team access, early feature previews, and consideration for future partnerships
                  </p>
                </div>
              </div>
            </div>
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
              <h2 className="text-2xl font-bold text-white">Why Join the Referral Program?</h2>

              <div className="space-y-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">1</div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Earn Real Rewards</h3>
                      <p className="text-gray-400 text-sm">
                        Get $20+ in credits, exclusive swag, and Premium subscriptions by building your network.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">2</div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Build Your Team</h3>
                      <p className="text-gray-400 text-sm">
                        Recruit teammates for the hackathon and earn rewards at the same time.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">3</div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Ambassador Status</h3>
                      <p className="text-gray-400 text-sm">
                        Top recruiters get special recognition and direct access to the Cortex team.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">4</div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">Grow the Community</h3>
                      <p className="text-gray-400 text-sm">
                        Help build the Linux community while earning rewards for your contributions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Tier Summary */}
              <div className="mt-6 bg-terminal-green/10 border border-terminal-green/30 rounded-lg p-4">
                <h4 className="font-medium text-terminal-green text-sm mb-3">Quick Tier Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">5 referrals</span>
                    <span className="text-emerald-400 font-medium">$20 credit</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">20 referrals</span>
                    <span className="text-purple-400 font-medium">$50 + swag package</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">50 referrals</span>
                    <span className="text-yellow-400 font-medium">$200 + premium + bundle</span>
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
