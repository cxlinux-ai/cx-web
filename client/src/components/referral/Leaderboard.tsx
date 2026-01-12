/**
 * Leaderboard Component - Enhanced with Framer Motion
 *
 * Displays top referrers with gamified animations.
 * Features:
 * - Animated podium for top 3
 * - Live ranking updates with transitions
 * - Tier badges with shimmer effects
 * - Weekly/Monthly filters
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Crown, Flame, Star, Users } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  displayName: string;
  referrals: number;
  tier: string;
  isAnonymous: boolean;
}

interface LeaderboardData {
  type: string;
  entries: LeaderboardEntry[];
  updatedAt: string;
}

const TIER_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; glow: string }> = {
  legendary: {
    icon: <Flame className="w-4 h-4" />,
    color: "text-orange-400",
    bg: "bg-gradient-to-r from-orange-500/20 to-red-500/20",
    glow: "shadow-[0_0_20px_rgba(251,146,60,0.4)]",
  },
  diamond: {
    icon: <Star className="w-4 h-4" />,
    color: "text-cyan-300",
    bg: "bg-cyan-500/20",
    glow: "shadow-[0_0_15px_rgba(34,211,238,0.3)]",
  },
  platinum: {
    icon: <Crown className="w-4 h-4" />,
    color: "text-slate-200",
    bg: "bg-slate-400/20",
    glow: "",
  },
  gold: {
    icon: <Trophy className="w-4 h-4" />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    glow: "",
  },
  silver: {
    icon: <Medal className="w-4 h-4" />,
    color: "text-gray-300",
    bg: "bg-gray-500/20",
    glow: "",
  },
  bronze: {
    icon: <Medal className="w-4 h-4" />,
    color: "text-amber-600",
    bg: "bg-amber-700/20",
    glow: "",
  },
  none: {
    icon: <Users className="w-4 h-4" />,
    color: "text-gray-500",
    bg: "bg-gray-800/20",
    glow: "",
  },
};

function TierBadge({ tier }: { tier: string }) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.none;

  return (
    <motion.span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${config.color} ${config.bg} ${config.glow}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {config.icon}
      {tier}
    </motion.span>
  );
}

function PodiumSpot({
  entry,
  position,
}: {
  entry: LeaderboardEntry;
  position: 1 | 2 | 3;
}) {
  const heights = { 1: "h-32", 2: "h-24", 3: "h-20" };
  const delays = { 1: 0.2, 2: 0.1, 3: 0.3 };
  const colors = {
    1: "from-yellow-500/30 to-yellow-600/10 border-yellow-500/50",
    2: "from-gray-400/30 to-gray-500/10 border-gray-400/50",
    3: "from-amber-700/30 to-amber-800/10 border-amber-600/50",
  };
  const medals = { 1: "text-yellow-400", 2: "text-gray-300", 3: "text-amber-600" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delays[position], type: "spring", stiffness: 100 }}
      className={`flex flex-col items-center ${position === 1 ? "order-2" : position === 2 ? "order-1" : "order-3"}`}
    >
      {/* Avatar/Crown */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delays[position] + 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-2"
      >
        {position === 1 && (
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl"
          >
            <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />
          </motion.div>
        )}
        <div
          className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors[position]} border-2 flex items-center justify-center text-2xl font-bold ${medals[position]}`}
        >
          {position}
        </div>
      </motion.div>

      {/* Name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delays[position] + 0.3 }}
        className="text-white font-semibold text-sm mb-1 truncate max-w-[100px]"
      >
        {entry.displayName}
      </motion.div>

      {/* Referrals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delays[position] + 0.4 }}
        className="text-gray-400 text-xs mb-3"
      >
        {entry.referrals} referrals
      </motion.div>

      {/* Podium */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: "auto" }}
        transition={{ delay: delays[position] + 0.1, duration: 0.5 }}
        className={`${heights[position]} w-24 bg-gradient-to-t ${colors[position]} border rounded-t-lg flex items-end justify-center pb-2`}
      >
        <TierBadge tier={entry.tier} />
      </motion.div>
    </motion.div>
  );
}

function LeaderboardRow({
  entry,
  index,
  isHighlighted,
}: {
  entry: LeaderboardEntry;
  index: number;
  isHighlighted?: boolean;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
      className={`border-b border-slate-700/50 ${isHighlighted ? "bg-blue-500/10" : ""}`}
    >
      <td className="py-3 px-4">
        <span className="text-gray-400 font-mono">{entry.rank}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`${entry.isAnonymous ? "text-gray-500 italic" : "text-white"}`}>
          {entry.displayName}
        </span>
      </td>
      <td className="py-3 px-4">
        <TierBadge tier={entry.tier} />
      </td>
      <td className="py-3 px-4 text-right">
        <motion.span
          key={entry.referrals}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-white font-semibold"
        >
          {entry.referrals}
        </motion.span>
      </td>
    </motion.tr>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {/* Podium skeleton */}
      <div className="flex justify-center items-end gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`animate-pulse ${i === 1 ? "order-2" : i === 2 ? "order-1" : "order-3"}`}
          >
            <div className="w-14 h-14 rounded-full bg-slate-700 mb-2" />
            <div className="w-20 h-4 bg-slate-700 rounded mb-1" />
            <div className={`w-24 ${i === 1 ? "h-32" : i === 2 ? "h-24" : "h-20"} bg-slate-700 rounded-t-lg`} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-8 h-6 bg-slate-700 rounded" />
          <div className="flex-1 h-6 bg-slate-700 rounded" />
          <div className="w-20 h-6 bg-slate-700 rounded" />
          <div className="w-12 h-6 bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export function Leaderboard({ highlightCode }: { highlightCode?: string }) {
  const [timeFilter, setTimeFilter] = useState<"all_time" | "monthly" | "weekly">("all_time");

  const { data, isLoading, error } = useQuery<LeaderboardData>({
    queryKey: ["leaderboard", timeFilter],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/leaderboard?type=${timeFilter}`);
      return response.json();
    },
    refetchInterval: 60000 * 5, // Refresh every 5 minutes
  });

  const filterButtons = [
    { value: "all_time" as const, label: "All Time" },
    { value: "monthly" as const, label: "This Month" },
    { value: "weekly" as const, label: "This Week" },
  ];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              <Trophy className="w-6 h-6 text-yellow-400" />
            </motion.div>
            <h2 className="text-xl font-bold text-white">Top Referrers</h2>
          </div>

          {/* Time Filter */}
          <div className="flex gap-2">
            {filterButtons.map((btn) => (
              <motion.button
                key={btn.value}
                onClick={() => setTimeFilter(btn.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === btn.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-700"
                }`}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error || !data ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-4xl mb-4">:(</div>
            <p className="text-gray-400">Failed to load leaderboard. Please try again.</p>
          </motion.div>
        ) : data.entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-semibold text-white mb-2">No referrers yet!</h3>
            <p className="text-gray-400">Be the first to climb the leaderboard.</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={timeFilter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Podium for top 3 */}
              {data.entries.length >= 3 && (
                <div className="flex justify-center items-end gap-4 mb-8">
                  <PodiumSpot entry={data.entries[1]} position={2} />
                  <PodiumSpot entry={data.entries[0]} position={1} />
                  <PodiumSpot entry={data.entries[2]} position={3} />
                </div>
              )}

              {/* Table for rest */}
              {data.entries.length > 3 && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-400 text-sm border-b border-slate-700/50">
                        <th className="py-3 px-4 font-medium">Rank</th>
                        <th className="py-3 px-4 font-medium">Referrer</th>
                        <th className="py-3 px-4 font-medium">Tier</th>
                        <th className="py-3 px-4 font-medium text-right">Referrals</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.slice(3).map((entry, index) => (
                        <LeaderboardRow
                          key={entry.rank}
                          entry={entry}
                          index={index}
                          isHighlighted={highlightCode === entry.displayName}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      {data && data.entries.length > 0 && (
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <span>Updated {new Date(data.updatedAt).toLocaleString()}</span>
            <span>Showing public referrers. Others appear anonymously.</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
