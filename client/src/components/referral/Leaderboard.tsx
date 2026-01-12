/**
 * Leaderboard Component
 *
 * Displays top referrers with optional anonymization.
 * Features:
 * - Global leaderboard (top 100)
 * - Weekly/Monthly filters
 * - Tier badges
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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

export function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<"all_time" | "monthly" | "weekly">("all_time");

  const { data, isLoading, error } = useQuery<LeaderboardData>({
    queryKey: ["leaderboard", timeFilter],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/leaderboard?type=${timeFilter}`);
      return response.json();
    },
    refetchInterval: 60000 * 5, // Refresh every 5 minutes
  });

  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      legendary: "#FFD700",
      diamond: "#B9F2FF",
      platinum: "#E5E4E2",
      gold: "#FFD700",
      silver: "#C0C0C0",
      bronze: "#CD7F32",
      none: "#808080",
    };
    return colors[tier] || colors.none;
  };

  const getTierEmoji = (tier: string): string => {
    const emojis: Record<string, string> = {
      legendary: "👑",
      diamond: "💎",
      platinum: "⭐",
      gold: "🥇",
      silver: "🥈",
      bronze: "🥉",
      none: "",
    };
    return emojis[tier] || "";
  };

  if (isLoading) {
    return (
      <div className="leaderboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="leaderboard-error">
        <p>Failed to load leaderboard. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <h2>🏆 Top Referrers</h2>
        <div className="time-filters">
          <button
            className={`filter-btn ${timeFilter === "all_time" ? "active" : ""}`}
            onClick={() => setTimeFilter("all_time")}
          >
            All Time
          </button>
          <button
            className={`filter-btn ${timeFilter === "monthly" ? "active" : ""}`}
            onClick={() => setTimeFilter("monthly")}
          >
            This Month
          </button>
          <button
            className={`filter-btn ${timeFilter === "weekly" ? "active" : ""}`}
            onClick={() => setTimeFilter("weekly")}
          >
            This Week
          </button>
        </div>
      </header>

      {data.entries.length === 0 ? (
        <div className="leaderboard-empty">
          <p>No referrers yet for this period. Be the first!</p>
        </div>
      ) : (
        <div className="leaderboard-list">
          {/* Top 3 Podium */}
          {data.entries.length >= 3 && (
            <div className="podium">
              {/* 2nd Place */}
              <div className="podium-spot second">
                <div className="podium-rank">2</div>
                <div className="podium-avatar">
                  {getTierEmoji(data.entries[1].tier) || "🥈"}
                </div>
                <div className="podium-name">{data.entries[1].displayName}</div>
                <div className="podium-score">{data.entries[1].referrals} referrals</div>
              </div>

              {/* 1st Place */}
              <div className="podium-spot first">
                <div className="podium-crown">👑</div>
                <div className="podium-rank">1</div>
                <div className="podium-avatar">
                  {getTierEmoji(data.entries[0].tier) || "🥇"}
                </div>
                <div className="podium-name">{data.entries[0].displayName}</div>
                <div className="podium-score">{data.entries[0].referrals} referrals</div>
              </div>

              {/* 3rd Place */}
              <div className="podium-spot third">
                <div className="podium-rank">3</div>
                <div className="podium-avatar">
                  {getTierEmoji(data.entries[2].tier) || "🥉"}
                </div>
                <div className="podium-name">{data.entries[2].displayName}</div>
                <div className="podium-score">{data.entries[2].referrals} referrals</div>
              </div>
            </div>
          )}

          {/* Rest of the list */}
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Referrer</th>
                <th>Tier</th>
                <th>Referrals</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.slice(3).map((entry) => (
                <tr key={entry.rank} className={`rank-${entry.rank}`}>
                  <td className="rank-cell">
                    <span className="rank-number">{entry.rank}</span>
                  </td>
                  <td className="name-cell">
                    <span className={entry.isAnonymous ? "anonymous" : ""}>
                      {entry.displayName}
                    </span>
                  </td>
                  <td className="tier-cell">
                    <span
                      className={`tier-badge ${entry.tier}`}
                      style={{ borderColor: getTierColor(entry.tier) }}
                    >
                      {getTierEmoji(entry.tier)} {entry.tier}
                    </span>
                  </td>
                  <td className="referrals-cell">
                    <span className="referrals-count">{entry.referrals}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="leaderboard-footer">
        <p className="updated-time">
          Updated {new Date(data.updatedAt).toLocaleString()}
        </p>
        <p className="opt-in-notice">
          Names shown for users who opted in. Others appear anonymously.
        </p>
      </footer>
    </div>
  );
}

export default Leaderboard;
