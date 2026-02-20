/**
 * Referral Dashboard Component
 *
 * User dashboard showing:
 * - Current position and progress
 * - Referral stats
 * - Referral link and sharing options
 * - Rewards progress
 * - Referred users list
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface DashboardData {
  user: {
    email: string;
    referralCode: string;
    emailVerified: boolean;
    currentPosition: number;
    originalPosition: number;
    positionGain: number;
    currentTier: string;
    githubConnected: boolean;
    twitterConnected: boolean;
    createdAt: string;
  };
  stats: {
    totalReferrals: number;
    verifiedReferrals: number;
    pendingReferrals: number;
    clicks: number;
  };
  referrals: Array<{
    email: string;
    source: string;
    verified: boolean;
    date: string;
  }>;
  rewards: {
    unlocked: Array<{ tier: string; reward: string; unlocked: boolean }>;
    next: { tier: string; referralsNeeded: number; reward: string } | null;
  };
  waitlist: {
    total: number;
    estimatedAccessDate: string | null;
  };
  referralLink: string;
}

interface ReferralDashboardProps {
  referralCode: string;
}

export function ReferralDashboard({ referralCode }: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "rewards">("overview");

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["referral-dashboard", referralCode],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/dashboard/${referralCode}`);
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleCopyLink = async () => {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQRCode = () => {
    if (!data) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data.referralLink)}`;
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dashboard-error">
        <h3>Dashboard Not Found</h3>
        <p>We couldn't find a dashboard for this referral code.</p>
        <a href="/" className="back-link">← Back to Home</a>
      </div>
    );
  }

  const { user, stats, referrals, rewards, waitlist } = data;

  return (
    <div className="referral-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="user-info">
          <h1>Your Referral Dashboard</h1>
          <p className="user-email">{user.email}</p>
          {!user.emailVerified && (
            <div className="verification-warning">
              ⚠️ Please verify your email to start earning rewards
            </div>
          )}
        </div>
        <div className={`tier-badge tier-${user.currentTier}`}>
          {user.currentTier === "none" ? "No Tier" : user.currentTier.charAt(0).toUpperCase() + user.currentTier.slice(1)}
        </div>
      </header>

      {/* Position Card */}
      <section className="position-section">
        <div className="position-card large">
          <div className="position-main">
            <div className="position-number">#{user.currentPosition.toLocaleString()}</div>
            <div className="position-context">
              of {waitlist.total.toLocaleString()} in line
            </div>
          </div>
          {user.positionGain > 0 && (
            <div className="position-gain">
              <span className="gain-icon">⬆️</span>
              <span className="gain-amount">+{user.positionGain.toLocaleString()}</span>
              <span className="gain-label">spots gained from referrals</span>
            </div>
          )}
        </div>
      </section>

      {/* Stats Grid */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalReferrals}</div>
            <div className="stat-label">Total Referrals</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.verifiedReferrals}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pendingReferrals}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.clicks}</div>
            <div className="stat-label">Link Clicks</div>
          </div>
        </div>
      </section>

      {/* Referral Link Section */}
      <section className="referral-link-section">
        <h2>Your Referral Link</h2>
        <div className="referral-link-container">
          <div className="link-box">
            <input
              type="text"
              readOnly
              value={data.referralLink}
              className="link-input"
            />
            <button onClick={handleCopyLink} className="copy-btn">
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>

          <div className="share-options">
            <h4>Share via:</h4>
            <div className="share-buttons-row">
              <button
                onClick={() => {
                  const text = encodeURIComponent("Join me on the CX Linux waitlist! AI that understands Linux.");
                  const url = encodeURIComponent(data.referralLink);
                  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                }}
                className="share-btn twitter"
              >
                𝕏 Twitter
              </button>
              <button
                onClick={() => {
                  const url = encodeURIComponent(data.referralLink);
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
                }}
                className="share-btn linkedin"
              >
                in LinkedIn
              </button>
              <button
                onClick={() => {
                  const subject = encodeURIComponent("Check out CX Linux");
                  const body = encodeURIComponent(`Hey! I thought you'd like CX Linux.\n\nJoin here: ${data.referralLink}`);
                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                }}
                className="share-btn email"
              >
                ✉️ Email
              </button>
            </div>
          </div>

          <div className="qr-code">
            <img src={generateQRCode()} alt="QR Code" />
            <span className="qr-label">Scan to share</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === "referrals" ? "active" : ""}`}
          onClick={() => setActiveTab("referrals")}
        >
          Referrals ({stats.totalReferrals})
        </button>
        <button
          className={`tab ${activeTab === "rewards" ? "active" : ""}`}
          onClick={() => setActiveTab("rewards")}
        >
          Rewards
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Next Reward Progress */}
            {rewards.next && (
              <div className="next-reward-card">
                <h3>Next Reward</h3>
                <div className="reward-progress">
                  <div className="progress-info">
                    <span className="reward-name">{rewards.next.reward}</span>
                    <span className="reward-tier">{rewards.next.tier}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, ((stats.verifiedReferrals) / (stats.verifiedReferrals + rewards.next.referralsNeeded)) * 100)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {rewards.next.referralsNeeded} more referral{rewards.next.referralsNeeded !== 1 ? "s" : ""} needed
                  </div>
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="tips-card">
              <h3>Tips to Get More Referrals</h3>
              <ul className="tips-list">
                <li>Share on Twitter with your unique link</li>
                <li>Add the GitHub badge to your repos</li>
                <li>Share your install success with friends</li>
                <li>Invite your dev team or colleagues</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="referrals-content">
            {referrals.length === 0 ? (
              <div className="empty-state">
                <p>No referrals yet. Share your link to start earning!</p>
              </div>
            ) : (
              <div className="referrals-list">
                <table className="referrals-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref, index) => (
                      <tr key={index}>
                        <td>{ref.email}</td>
                        <td className="source-badge">{ref.source || "direct"}</td>
                        <td>
                          <span className={`status-badge ${ref.verified ? "verified" : "pending"}`}>
                            {ref.verified ? "✓ Verified" : "Pending"}
                          </span>
                        </td>
                        <td>{new Date(ref.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="rewards-content">
            <div className="rewards-progress">
              <h3>Your Rewards Progress</h3>
              <div className="tiers-grid">
                {[
                  { tier: "bronze", referrals: 1, reward: "+100 spots" },
                  { tier: "silver", referrals: 3, reward: "+500 spots" },
                  { tier: "gold", referrals: 5, reward: "Discord Role" },
                  { tier: "platinum", referrals: 10, reward: "1 Free Pro Month" },
                  { tier: "diamond", referrals: 25, reward: "Founding Badge" },
                  { tier: "legendary", referrals: 50, reward: "Hackathon Fast-Track" },
                ].map((tier) => {
                  const isUnlocked = stats.verifiedReferrals >= tier.referrals;
                  return (
                    <div
                      key={tier.tier}
                      className={`tier-card ${tier.tier} ${isUnlocked ? "unlocked" : "locked"}`}
                    >
                      <div className="tier-header">
                        <span className={`tier-icon ${tier.tier}`}>
                          {isUnlocked ? "✓" : tier.referrals}
                        </span>
                        <span className="tier-name">{tier.tier}</span>
                      </div>
                      <div className="tier-reward">{tier.reward}</div>
                      <div className="tier-requirement">
                        {tier.referrals} referral{tier.referrals !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {rewards.unlocked.length > 0 && (
              <div className="unlocked-rewards">
                <h3>Unlocked Rewards</h3>
                <ul className="unlocked-list">
                  {rewards.unlocked.map((reward, index) => (
                    <li key={index} className="unlocked-item">
                      <span className="reward-check">✓</span>
                      <span className="reward-text">{reward.reward}</span>
                      <span className={`reward-tier ${reward.tier}`}>{reward.tier}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReferralDashboard;
