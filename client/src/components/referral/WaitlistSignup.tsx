/**
 * Waitlist Signup Component
 *
 * Email-based waitlist signup with referral tracking.
 * Shows friendly message if user is already registered.
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Check, Users, Trophy, Share2, Link2, Mail, Loader2, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface SignupResponse {
  message: string;
  referralCode: string;
  position?: number;
  totalWaitlist?: number;
  verificationRequired?: boolean;
  alreadyRegistered?: boolean;
  emailVerified?: boolean;
}

interface WaitlistSignupProps {
  referralCode?: string;
  onSuccess?: (data: SignupResponse) => void;
}

export function WaitlistSignup({ referralCode: initialReferralCode, onSuccess }: WaitlistSignupProps) {
  const [email, setEmail] = useState("");
  const [signupData, setSignupData] = useState<SignupResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useMutation({
    mutationFn: async (userEmail: string) => {
      const response = await apiRequest("POST", "/api/referral/signup", {
        email: userEmail,
        referralCode: initialReferralCode,
      });
      return response.json();
    },
    onSuccess: (data: SignupResponse) => {
      setSignupData(data);
      setError(null);
      onSuccess?.(data);
    },
    onError: () => {
      setError("Failed to join waitlist. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    signupMutation.mutate(email.trim());
  };

  const handleCopyLink = async () => {
    if (!signupData) return;
    const link = `https://cxlinux.com/referrals?ref=${signupData.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    if (!signupData) return;
    const text = encodeURIComponent(
      "Just joined the CX Linux waitlist - AI that actually understands Linux.\nJoin me and get early access 👇"
    );
    const url = encodeURIComponent(`https://cxlinux.com/referrals?ref=${signupData.referralCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    if (!signupData) return;
    const url = encodeURIComponent(`https://cxlinux.com/referrals?ref=${signupData.referralCode}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  // Show success state after signup
  if (signupData) {
    const isAlreadyRegistered = signupData.alreadyRegistered;
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isAlreadyRegistered ? "bg-blue-500/20" : "bg-green-500/20"
            }`}
          >
            {isAlreadyRegistered ? (
              <PartyPopper className="w-8 h-8 text-blue-400" />
            ) : (
              <Check className="w-8 h-8 text-green-400" />
            )}
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isAlreadyRegistered ? "Welcome Back!" : "You're In!"}
          </h2>
          <p className="text-gray-400">
            {isAlreadyRegistered
              ? "You're already on the waitlist. Here's your referral link!"
              : "Check your email to verify and unlock your referral rewards."
            }
          </p>
          {signupData.position && !isAlreadyRegistered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10"
            >
              <span className="text-gray-400">Your position:</span>
              <span className="text-xl font-bold text-white">#{signupData.position}</span>
            </motion.div>
          )}
          {isAlreadyRegistered && !signupData.emailVerified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
            >
              <p className="text-sm text-yellow-400">
                Don't forget to verify your email to activate your referral rewards!
              </p>
            </motion.div>
          )}
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              readOnly
              value={`cxlinux.com/referrals?ref=${signupData.referralCode}`}
              className="bg-black/40 border-white/10 text-gray-300 text-sm font-mono"
              data-testid="input-referral-link"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="shrink-0 border-white/20 hover:bg-white/10"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-400 mt-2 text-center"
            >
              Link copied to clipboard!
            </motion.p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            Share Your Link
          </h3>
          <p className="text-sm text-gray-400 mb-4">Each referral helps grow the CX community!</p>

          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={shareOnTwitter}
              variant="outline"
              className="border-white/10 hover:bg-white/10 text-sm"
              data-testid="button-share-twitter"
            >
              <span className="font-bold mr-1">𝕏</span> Share
            </Button>
            <Button
              onClick={shareOnLinkedIn}
              variant="outline"
              className="border-white/10 hover:bg-white/10 text-sm"
              data-testid="button-share-linkedin"
            >
              <span className="font-bold mr-1 text-blue-400">in</span> LinkedIn
            </Button>
            <Button
              onClick={() => {
                const subject = encodeURIComponent("Check out CX Linux");
                const body = encodeURIComponent(
                  `Hey! I thought you might like CX Linux - AI that understands Linux.\n\nJoin here: https://cxlinux.com/referrals?ref=${signupData.referralCode}`
                );
                window.location.href = `mailto:?subject=${subject}&body=${body}`;
              }}
              variant="outline"
              className="border-white/10 hover:bg-white/10 text-sm"
              data-testid="button-share-email"
            >
              <Mail className="w-4 h-4 mr-1" /> Email
            </Button>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Unlock Rewards with Referrals
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { count: 1, reward: "+100 spots", color: "bg-amber-700" },
              { count: 3, reward: "+500 spots", color: "bg-gray-400" },
              { count: 5, reward: "Discord Role", color: "bg-yellow-500" },
              { count: 10, reward: "Free Pro Month", color: "bg-cyan-400" },
            ].map((tier) => (
              <div
                key={tier.count}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10"
              >
                <span className={`w-5 h-5 rounded-full ${tier.color} flex items-center justify-center text-xs font-bold text-black`}>
                  {tier.count}
                </span>
                <span className="text-xs text-gray-400">{tier.reward}</span>
              </div>
            ))}
          </div>
        </div>

        {initialReferralCode && !isAlreadyRegistered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20"
          >
            <Sparkles className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-300">
              You were referred by a friend! Welcome to the community.
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Email signup form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4"
        >
          <Mail className="w-8 h-8 text-blue-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
        <p className="text-gray-400">
          Get early access and earn rewards by referring friends.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 h-12"
            required
            data-testid="input-email"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        <Button
          type="submit"
          disabled={signupMutation.isPending || !email.trim()}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          data-testid="button-join-waitlist"
        >
          {signupMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Joining...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Join Waitlist
              <Sparkles className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      {initialReferralCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
        >
          <Users className="w-5 h-5 text-blue-400" />
          <p className="text-sm text-gray-300">
            You were invited by a friend! Join to help them earn rewards.
          </p>
        </motion.div>
      )}

      <p className="text-xs text-gray-500 text-center mt-4">
        We'll send you a verification email. No spam, ever.
      </p>
    </motion.div>
  );
}

export default WaitlistSignup;
