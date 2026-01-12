/**
 * Referral Link Generator Component
 *
 * Automatically generates a unique referral link per IP address.
 * No email required - instant referral link generation and display.
 */

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Copy, Check, ChevronRight, Sparkles, Users, Trophy, Star, Share2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  clickCount: number;
  isNew: boolean;
}

interface WaitlistSignupProps {
  referralCode?: string;
  onSuccess?: (data: ReferralData) => void;
}

export function WaitlistSignup({ referralCode: initialReferralCode, onSuccess }: WaitlistSignupProps) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/referral/generate", {});
      return response.json();
    },
    onSuccess: (data: ReferralData) => {
      setReferralData(data);
      setError(null);
      onSuccess?.(data);
    },
    onError: () => {
      setError("Failed to generate referral link. Please refresh the page.");
    },
  });

  useEffect(() => {
    generateMutation.mutate();
  }, []);

  const handleCopyLink = async () => {
    if (!referralData) return;
    const link = `https://cortexlinux.com/referrals?ref=${referralData.referralCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    if (!referralData) return;
    const text = encodeURIComponent(
      "Just discovered Cortex Linux - AI that actually understands Linux.\nJoin me and get early access 👇"
    );
    const url = encodeURIComponent(`https://cortexlinux.com/referrals?ref=${referralData.referralCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    if (!referralData) return;
    const url = encodeURIComponent(`https://cortexlinux.com/referrals?ref=${referralData.referralCode}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  if (generateMutation.isPending) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mb-4" />
          <p className="text-gray-400">Generating your unique referral link...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
      >
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => generateMutation.mutate()}
            className="bg-blue-500 hover:bg-blue-600"
            data-testid="button-retry-generate"
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  if (referralData) {
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4"
          >
            <Link2 className="w-8 h-8 text-blue-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Your Referral Link</h2>
          <p className="text-gray-400">
            Share this link to earn rewards and unlock exclusive perks!
          </p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              readOnly
              value={`cortexlinux.com/referrals?ref=${referralData.referralCode}`}
              className="bg-black/40 border-white/10 text-gray-300 text-sm font-mono"
              data-testid="input-referral-link"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="shrink-0 border-white/20 hover:bg-white/10"
              data-testid="button-copy-link"
            >
              {copied ? <Check className="w-4 h-4 text-terminal-green" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {copied && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-terminal-green mt-2 text-center"
            >
              Link copied to clipboard!
            </motion.p>
          )}
        </div>

        {referralData.totalReferrals > 0 && (
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 mb-6 text-center border border-white/10">
            <div className="flex items-center justify-center gap-8">
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  {referralData.totalReferrals}
                </div>
                <div className="text-gray-400 flex items-center justify-center gap-2 text-sm">
                  <Users className="w-4 h-4" />
                  Referrals
                </div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  {referralData.clickCount}
                </div>
                <div className="text-gray-400 flex items-center justify-center gap-2 text-sm">
                  <Share2 className="w-4 h-4" />
                  Clicks
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            Share Your Link
          </h3>
          <p className="text-sm text-gray-400 mb-4">Each referral helps grow the Cortex community!</p>

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
                const subject = encodeURIComponent("Check out Cortex Linux");
                const body = encodeURIComponent(
                  `Hey! I thought you might like Cortex Linux - AI that understands Linux.\n\nJoin here: https://cortexlinux.com/referrals?ref=${referralData.referralCode}`
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

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            Unlock Rewards with Referrals
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { count: 1, reward: "Bronze Badge", color: "bg-amber-700" },
              { count: 3, reward: "Silver Status", color: "bg-gray-400" },
              { count: 5, reward: "Gold Tier", color: "bg-yellow-500" },
              { count: 10, reward: "Platinum Perks", color: "bg-cyan-400" },
              { count: 25, reward: "Diamond Elite", color: "bg-purple-500" },
            ].map((tier) => (
              <div
                key={tier.count}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  referralData.totalReferrals >= tier.count
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <span className={`w-5 h-5 rounded-full ${tier.color} flex items-center justify-center text-xs font-bold text-black`}>
                  {tier.count}
                </span>
                <span className={`text-xs ${referralData.totalReferrals >= tier.count ? "text-white" : "text-gray-400"}`}>
                  {tier.reward}
                </span>
                {referralData.totalReferrals >= tier.count && (
                  <Check className="w-3 h-3 text-terminal-green" />
                )}
              </div>
            ))}
          </div>
        </div>

        {initialReferralCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-terminal-green/10 border border-terminal-green/20"
          >
            <Sparkles className="w-5 h-5 text-terminal-green" />
            <p className="text-sm text-gray-300">
              You were referred by a friend! Welcome to the community.
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return null;
}

export default WaitlistSignup;
