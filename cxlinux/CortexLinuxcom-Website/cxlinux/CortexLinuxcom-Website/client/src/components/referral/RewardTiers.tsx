/**
 * Reward Tiers Component
 *
 * Displays the gamified reward structure with
 * progress tracking and tier badges.
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Gift,
  Crown,
  Star,
  Flame,
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface RewardTier {
  id: string;
  name: string;
  badge: string;
  referrals: number;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
  rewards: string[];
}

const TIERS: RewardTier[] = [
  {
    id: "bronze",
    name: "Bronze",
    badge: "Early Supporter",
    referrals: 1,
    description: "+100 spots in line",
    icon: <Shield className="w-6 h-6" />,
    color: "text-amber-600",
    bgGradient: "from-amber-900/30 to-amber-800/10",
    borderColor: "border-amber-700/50",
    glowColor: "",
    rewards: ["Custom 'Early Supporter' badge", "Move up 100 spots in the waitlist"],
  },
  {
    id: "silver",
    name: "Silver",
    badge: "Community Builder",
    referrals: 3,
    description: "+500 spots & Discord access",
    icon: <Users className="w-6 h-6" />,
    color: "text-gray-300",
    bgGradient: "from-gray-400/20 to-gray-500/10",
    borderColor: "border-gray-500/50",
    glowColor: "",
    rewards: [
      "Move up 500 additional spots",
      "Access to private Discord channels",
      "Early beta feature access",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    badge: "Pioneer",
    referrals: 5,
    description: "Exclusive swag pack",
    icon: <Gift className="w-6 h-6" />,
    color: "text-yellow-400",
    bgGradient: "from-yellow-600/30 to-yellow-700/10",
    borderColor: "border-yellow-600/50",
    glowColor: "shadow-[0_0_20px_rgba(234,179,8,0.2)]",
    rewards: [
      "Exclusive sticker pack shipped to you",
      "Priority for future crypto token airdrop",
      "Gold Discord role",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    badge: "Champion",
    referrals: 10,
    description: "Free Pro month",
    icon: <Crown className="w-6 h-6" />,
    color: "text-slate-200",
    bgGradient: "from-slate-400/20 to-slate-500/10",
    borderColor: "border-slate-400/50",
    glowColor: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
    rewards: [
      "1 month free Pro subscription",
      "Priority support channel access",
      "Platinum Discord role",
    ],
  },
  {
    id: "diamond",
    name: "Diamond",
    badge: "Ambassador",
    referrals: 20,
    description: "Featured on contributors page",
    icon: <Star className="w-6 h-6" />,
    color: "text-cyan-300",
    bgGradient: "from-cyan-500/20 to-cyan-600/10",
    borderColor: "border-cyan-500/50",
    glowColor: "shadow-[0_0_25px_rgba(34,211,238,0.3)]",
    rewards: [
      "Featured on our contributors page",
      "Official 'Cortex Ambassador' title",
      "Direct input on product features",
      "Diamond Discord role",
    ],
  },
  {
    id: "legendary",
    name: "Legendary",
    badge: "Legend",
    referrals: 50,
    description: "Lifetime VIP access",
    icon: <Flame className="w-6 h-6" />,
    color: "text-orange-400",
    bgGradient: "from-orange-500/20 to-red-500/20",
    borderColor: "border-orange-500/50",
    glowColor: "shadow-[0_0_30px_rgba(251,146,60,0.4)]",
    rewards: [
      "Lifetime VIP access to all features",
      "Direct line to founders",
      "Name in credits / about page",
      "Exclusive founding member NFT",
      "Legendary Discord role",
    ],
  },
];

interface TierCardProps {
  tier: RewardTier;
  currentReferrals: number;
  index: number;
}

function TierCard({ tier, currentReferrals, index }: TierCardProps) {
  const isUnlocked = currentReferrals >= tier.referrals;
  const isNext =
    !isUnlocked &&
    (index === 0 || currentReferrals >= TIERS[index - 1].referrals);
  const progress = Math.min(100, (currentReferrals / tier.referrals) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: isUnlocked || isNext ? 1.02 : 1 }}
      className={`relative overflow-hidden rounded-xl border ${tier.borderColor} bg-gradient-to-br ${tier.bgGradient} ${tier.glowColor} ${
        !isUnlocked && !isNext ? "opacity-60" : ""
      }`}
    >
      {/* Locked Overlay */}
      {!isUnlocked && !isNext && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-gray-500" />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-slate-800/50 ${tier.color}`}>
              {tier.icon}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${tier.color}`}>{tier.name}</h3>
              <p className="text-xs text-gray-400">{tier.badge}</p>
            </div>
          </div>

          {isUnlocked ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium"
            >
              <CheckCircle2 className="w-3 h-3" />
              Unlocked
            </motion.div>
          ) : (
            <span className="text-sm font-mono text-gray-400">
              {tier.referrals} refs
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-300 mb-4">{tier.description}</p>

        {/* Progress Bar (if next tier) */}
        {isNext && !isUnlocked && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>
                {currentReferrals}/{tier.referrals}
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  tier.id === "legendary"
                    ? "from-orange-500 to-red-500"
                    : tier.id === "diamond"
                      ? "from-cyan-400 to-cyan-600"
                      : `from-${tier.id === "gold" ? "yellow" : tier.id === "platinum" ? "slate" : tier.id === "silver" ? "gray" : "amber"}-500 to-${tier.id === "gold" ? "yellow" : tier.id === "platinum" ? "slate" : tier.id === "silver" ? "gray" : "amber"}-600`
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {tier.referrals - currentReferrals} more referral
              {tier.referrals - currentReferrals !== 1 ? "s" : ""} to unlock
            </p>
          </div>
        )}

        {/* Rewards List */}
        <div className="space-y-2">
          {tier.rewards.slice(0, isUnlocked ? undefined : 2).map((reward, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isUnlocked ? "text-green-500" : "text-gray-600"
                }`}
              />
              <span className={isUnlocked ? "text-gray-300" : "text-gray-500"}>
                {reward}
              </span>
            </div>
          ))}
          {!isUnlocked && tier.rewards.length > 2 && (
            <p className="text-xs text-gray-500 ml-6">
              +{tier.rewards.length - 2} more reward
              {tier.rewards.length - 2 !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface RewardTiersProps {
  referralCode?: string;
  currentReferrals?: number;
  currentTier?: string;
}

interface DashboardStats {
  stats: {
    verifiedReferrals: number;
  };
  user: {
    currentTier: string;
  };
}

export function RewardTiers({ referralCode, currentReferrals: propReferrals, currentTier: propTier }: RewardTiersProps) {
  // Fetch dashboard data if referralCode is provided
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ["referral-dashboard", referralCode],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/dashboard/${referralCode}`);
      return response.json();
    },
    enabled: !!referralCode,
    refetchInterval: 60000,
  });

  // Use fetched data or props
  const currentReferrals = data?.stats?.verifiedReferrals ?? propReferrals ?? 0;
  const currentTier = data?.user?.currentTier ?? propTier;

  // Find next tier
  const nextTierIndex = TIERS.findIndex((t) => currentReferrals < t.referrals);
  const nextTier = nextTierIndex >= 0 ? TIERS[nextTierIndex] : null;

  if (referralCode && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-3 text-gray-400 py-8">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading reward tiers...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Reward Tiers</h2>
          <p className="text-sm text-gray-400">
            {currentReferrals} verified referral{currentReferrals !== 1 ? "s" : ""}
          </p>
        </div>

        {nextTier && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Next reward:</span>
            <span className={`font-medium ${TIERS.find((t) => t.id === nextTier.id)?.color}`}>
              {nextTier.name}
            </span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <span className="text-gray-400">
              {nextTier.referrals - currentReferrals} more needed
            </span>
          </div>
        )}
      </div>

      {/* Tier Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TIERS.map((tier, index) => (
          <TierCard
            key={tier.id}
            tier={tier}
            currentReferrals={currentReferrals}
            index={index}
          />
        ))}
      </div>

      {/* Verification Notice */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-400">Verification Required</h4>
            <p className="text-sm text-gray-400 mt-1">
              Referrals only count when the referred user joins Discord AND
              either submits a PR or participates in a hackathon. This ensures
              quality contributions and prevents spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RewardTiers;
