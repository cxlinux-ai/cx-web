/**
 * Builder Invite Component
 *
 * Hackathon-specific referral component for inviting builders.
 * Tracks separate metrics for hackathon funnel.
 */

import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface BuilderStats {
  stats: {
    totalInvited: number;
    registered: number;
    submitted: number;
    invites: Array<{
      email: string;
      name: string;
      status: string;
      teamName: string | null;
      projectSubmitted: boolean;
    }>;
  };
  rewards: string[];
}

interface BuilderInviteProps {
  referralCode: string;
}

export function BuilderInvite({ referralCode }: BuilderInviteProps) {
  const [builderEmail, setBuilderEmail] = useState("");
  const [builderName, setBuilderName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: stats, isLoading } = useQuery<BuilderStats>({
    queryKey: ["builder-stats", referralCode],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/referral/builder-stats/${referralCode}`);
      return response.json();
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { referralCode: string; builderEmail: string; builderName?: string }) => {
      const response = await apiRequest("POST", "/api/referral/invite-builder", data);
      return response.json();
    },
    onSuccess: () => {
      setBuilderEmail("");
      setBuilderName("");
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["builder-stats", referralCode] });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({
      referralCode,
      builderEmail,
      builderName: builderName || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="builder-invite-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="builder-invite-section">
      <header className="builder-header">
        <h2>🚀 Hackathon Builder Referrals</h2>
        <p>Invite developers to the CX Hackathon and unlock exclusive rewards!</p>
      </header>

      {/* Stats */}
      <div className="builder-stats-grid">
        <div className="builder-stat">
          <div className="stat-value">{stats?.stats.totalInvited || 0}</div>
          <div className="stat-label">Invited</div>
        </div>
        <div className="builder-stat">
          <div className="stat-value">{stats?.stats.registered || 0}</div>
          <div className="stat-label">Registered</div>
        </div>
        <div className="builder-stat">
          <div className="stat-value">{stats?.stats.submitted || 0}</div>
          <div className="stat-label">Submitted</div>
        </div>
      </div>

      {/* Rewards Progress */}
      <div className="builder-rewards">
        <h3>Hackathon Rewards</h3>
        <div className="reward-items">
          <div className={`reward-item ${(stats?.stats.registered || 0) >= 3 ? "unlocked" : ""}`}>
            <span className="reward-check">{(stats?.stats.registered || 0) >= 3 ? "✓" : "○"}</span>
            <span>Priority Review (3 registered)</span>
          </div>
          <div className={`reward-item ${(stats?.stats.submitted || 0) >= 1 ? "unlocked" : ""}`}>
            <span className="reward-check">{(stats?.stats.submitted || 0) >= 1 ? "✓" : "○"}</span>
            <span>Jury Visibility Boost (1 submitted)</span>
          </div>
          <div className={`reward-item ${(stats?.stats.totalInvited || 0) >= 10 ? "unlocked" : ""}`}>
            <span className="reward-check">{(stats?.stats.totalInvited || 0) >= 10 ? "✓" : "○"}</span>
            <span>Top Referrer Badge (10 invited)</span>
          </div>
        </div>
      </div>

      {/* Invite Form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="invite-btn">
          + Invite a Builder
        </button>
      ) : (
        <form onSubmit={handleInvite} className="invite-form">
          <div className="form-row">
            <input
              type="email"
              placeholder="Builder's email"
              value={builderEmail}
              onChange={(e) => setBuilderEmail(e.target.value)}
              required
              className="invite-input"
            />
            <input
              type="text"
              placeholder="Name (optional)"
              value={builderName}
              onChange={(e) => setBuilderName(e.target.value)}
              className="invite-input"
            />
          </div>
          <div className="form-actions">
            <button type="submit" disabled={inviteMutation.isPending} className="submit-btn">
              {inviteMutation.isPending ? "Inviting..." : "Send Invite"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
          {inviteMutation.isError && (
            <div className="error-message">Failed to send invite. Please try again.</div>
          )}
          {inviteMutation.isSuccess && (
            <div className="success-message">Invite sent successfully!</div>
          )}
        </form>
      )}

      {/* Invited Builders List */}
      {stats && stats.stats.invites.length > 0 && (
        <div className="invited-list">
          <h4>Your Invites</h4>
          <table className="invites-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Status</th>
                <th>Project</th>
              </tr>
            </thead>
            <tbody>
              {stats.stats.invites.map((invite, index) => (
                <tr key={index}>
                  <td>{invite.email}</td>
                  <td>{invite.name || "-"}</td>
                  <td>
                    <span className={`status-badge status-${invite.status}`}>
                      {invite.status}
                    </span>
                  </td>
                  <td>
                    {invite.projectSubmitted ? (
                      <span className="project-submitted">✓ Submitted</span>
                    ) : invite.teamName ? (
                      <span className="team-name">{invite.teamName}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BuilderInvite;
