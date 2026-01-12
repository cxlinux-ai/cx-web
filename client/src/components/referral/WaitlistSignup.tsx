/**
 * Waitlist Signup Component
 *
 * Landing page component for early access signup with referral tracking.
 * Shows:
 * - Email capture form
 * - Optional GitHub/Twitter connect
 * - Post-signup: position, referral link, share buttons
 */

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface SignupResponse {
  message: string;
  referralCode: string;
  position: number;
  totalWaitlist: number;
  verificationRequired?: boolean;
}

interface WaitlistSignupProps {
  referralCode?: string; // Pre-filled from URL
  onSuccess?: (data: SignupResponse) => void;
}

export function WaitlistSignup({ referralCode: initialReferralCode, onSuccess }: WaitlistSignupProps) {
  const [email, setEmail] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [signupData, setSignupData] = useState<SignupResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const signupMutation = useMutation({
    mutationFn: async (data: { email: string; referralCode?: string; githubUsername?: string }) => {
      const response = await apiRequest("POST", "/api/referral/signup", data);
      return response.json();
    },
    onSuccess: (data: SignupResponse) => {
      setSignupData(data);
      onSuccess?.(data);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({
      email,
      referralCode: initialReferralCode,
      githubUsername: githubUsername || undefined,
    });
  };

  const handleCopyLink = async () => {
    if (!signupData) return;
    const link = `https://cortexlinux.com/join?ref=${signupData.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    if (!signupData) return;
    const text = encodeURIComponent(
      "Just joined the Cortex Linux early access.\nAI that actually understands Linux.\nJoin me 👇"
    );
    const url = encodeURIComponent(`https://cortexlinux.com/join?ref=${signupData.referralCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    if (!signupData) return;
    const url = encodeURIComponent(`https://cortexlinux.com/join?ref=${signupData.referralCode}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  // Post-signup view
  if (signupData) {
    return (
      <div className="waitlist-success">
        <div className="success-header">
          <div className="success-icon">🎉</div>
          <h2>You're on the list!</h2>
          <p className="verification-notice">
            {signupData.verificationRequired
              ? "Check your email to verify and lock in your spot."
              : "Your spot is confirmed."}
          </p>
        </div>

        <div className="position-card">
          <div className="position-number">#{signupData.position.toLocaleString()}</div>
          <div className="position-label">
            of {signupData.totalWaitlist.toLocaleString()} in line
          </div>
        </div>

        <div className="referral-section">
          <h3>🚀 Move up the list. Earn real perks.</h3>
          <p className="referral-hint">Each verified referral moves you up the waitlist.</p>

          <div className="referral-link-box">
            <input
              type="text"
              readOnly
              value={`cortexlinux.com/join?ref=${signupData.referralCode}`}
              className="referral-link-input"
            />
            <button onClick={handleCopyLink} className="copy-button">
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>

          <div className="share-buttons">
            <button onClick={shareOnTwitter} className="share-button twitter">
              <span className="share-icon">𝕏</span>
              Share on X
            </button>
            <button onClick={shareOnLinkedIn} className="share-button linkedin">
              <span className="share-icon">in</span>
              LinkedIn
            </button>
            <button
              onClick={() => {
                const subject = encodeURIComponent("Check out Cortex Linux");
                const body = encodeURIComponent(
                  `Hey! I thought you might like Cortex Linux - AI that understands Linux.\n\nJoin here: https://cortexlinux.com/join?ref=${signupData.referralCode}`
                );
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              className="share-button email"
            >
              <span className="share-icon">✉️</span>
              Email
            </button>
          </div>
        </div>

        <div className="rewards-preview">
          <h4>Unlock Rewards</h4>
          <div className="rewards-tiers">
            <div className="reward-tier">
              <span className="tier-badge bronze">1</span>
              <span>+100 spots</span>
            </div>
            <div className="reward-tier">
              <span className="tier-badge silver">3</span>
              <span>+500 spots</span>
            </div>
            <div className="reward-tier">
              <span className="tier-badge gold">5</span>
              <span>Discord Role</span>
            </div>
            <div className="reward-tier">
              <span className="tier-badge platinum">10</span>
              <span>Free Pro Month</span>
            </div>
            <div className="reward-tier">
              <span className="tier-badge diamond">25</span>
              <span>Founding Badge</span>
            </div>
          </div>
        </div>

        <a
          href={`/dashboard/${signupData.referralCode}`}
          className="dashboard-link"
        >
          View Your Dashboard →
        </a>
      </div>
    );
  }

  // Signup form
  return (
    <div className="waitlist-signup">
      <div className="signup-header">
        <h2>Get Early Access to Cortex Linux</h2>
        <p>Join the waitlist for the AI-native operating system.</p>
      </div>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="email-input"
            disabled={signupMutation.isPending}
          />
        </div>

        {!showOptional && (
          <button
            type="button"
            onClick={() => setShowOptional(true)}
            className="optional-toggle"
          >
            + Connect GitHub for bonus perks
          </button>
        )}

        {showOptional && (
          <div className="optional-fields">
            <div className="form-group">
              <label>GitHub Username (optional)</label>
              <input
                type="text"
                placeholder="yourusername"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="github-input"
              />
              <span className="input-hint">Get bonus perks for connected accounts</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={signupMutation.isPending || !email}
          className="submit-button"
        >
          {signupMutation.isPending ? "Joining..." : "Join Waitlist"}
        </button>

        {signupMutation.isError && (
          <div className="error-message">
            Something went wrong. Please try again.
          </div>
        )}
      </form>

      {initialReferralCode && (
        <div className="referral-notice">
          <span className="referral-icon">🎁</span>
          You were referred by a friend! You'll both benefit when you verify.
        </div>
      )}
    </div>
  );
}

export default WaitlistSignup;
