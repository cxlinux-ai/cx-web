/**
 * Waitlist Signup Component
 *
 * Landing page component for early access signup with referral tracking.
 * Shows:
 * - Email capture form
 * - Optional GitHub connect
 * - Post-signup: position, referral link, share buttons
 */

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Github, Mail, Copy, Check, ChevronRight, Sparkles, Users, Trophy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface SignupResponse {
  message: string;
  referralCode: string;
  position: number;
  totalWaitlist: number;
  verificationRequired?: boolean;
}

interface WaitlistSignupProps {
  referralCode?: string;
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

  // Post-signup success view
  if (signupData) {
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terminal-green/20 mb-4"
          >
            <Sparkles className="w-8 h-8 text-terminal-green" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">You're on the list!</h2>
          <p className="text-gray-400">
            {signupData.verificationRequired
              ? "Check your email to verify and lock in your spot."
              : "Your spot is confirmed."}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 mb-6 text-center border border-white/10">
          <div className="text-5xl font-bold text-white mb-1">
            #{signupData.position.toLocaleString()}
          </div>
          <div className="text-gray-400 flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            of {signupData.totalWaitlist.toLocaleString()} in line
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Move up the list. Earn real perks.
          </h3>
          <p className="text-sm text-gray-400 mb-4">Each verified referral moves you up the waitlist.</p>

          <div className="flex gap-2">
            <Input
              type="text"
              readOnly
              value={`cortexlinux.com/join?ref=${signupData.referralCode}`}
              className="bg-black/40 border-white/10 text-gray-300 text-sm"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="shrink-0 border-white/20 hover:bg-white/10"
            >
              {copied ? <Check className="w-4 h-4 text-terminal-green" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={shareOnTwitter}
            variant="outline"
            className="border-white/10 hover:bg-white/10 text-sm"
          >
            <span className="font-bold mr-1">𝕏</span> Share
          </Button>
          <Button
            onClick={shareOnLinkedIn}
            variant="outline"
            className="border-white/10 hover:bg-white/10 text-sm"
          >
            <span className="font-bold mr-1 text-blue-400">in</span> LinkedIn
          </Button>
          <Button
            onClick={() => {
              const subject = encodeURIComponent("Check out Cortex Linux");
              const body = encodeURIComponent(
                `Hey! I thought you might like Cortex Linux - AI that understands Linux.\n\nJoin here: https://cortexlinux.com/join?ref=${signupData.referralCode}`
              );
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
            variant="outline"
            className="border-white/10 hover:bg-white/10 text-sm"
          >
            <Mail className="w-4 h-4 mr-1" /> Email
          </Button>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            Unlock Rewards
          </h4>
          <div className="flex flex-wrap gap-2">
            {[
              { count: 1, reward: "+100 spots", color: "bg-amber-700" },
              { count: 3, reward: "+500 spots", color: "bg-gray-400" },
              { count: 5, reward: "Discord Role", color: "bg-yellow-500" },
              { count: 10, reward: "Free Pro Month", color: "bg-cyan-400" },
              { count: 25, reward: "Founding Badge", color: "bg-purple-500" },
            ].map((tier) => (
              <div
                key={tier.count}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10"
              >
                <span className={`w-5 h-5 rounded-full ${tier.color} flex items-center justify-center text-xs font-bold text-black`}>
                  {tier.count}
                </span>
                <span className="text-xs text-gray-300">{tier.reward}</span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={`/dashboard/${signupData.referralCode}`}
          className="flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
        >
          View Your Dashboard
          <ChevronRight className="w-4 h-4" />
        </a>
      </motion.div>
    );
  }

  // Signup form
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Get Early Access to Cortex Linux</h2>
        <p className="text-gray-400">Join the waitlist for the AI-native operating system.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={signupMutation.isPending}
            className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 h-12"
            data-testid="input-waitlist-email"
          />
        </div>

        <AnimatePresence>
          {!showOptional && (
            <motion.button
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              type="button"
              onClick={() => setShowOptional(true)}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              data-testid="button-show-github"
            >
              <Github className="w-4 h-4" />
              + Connect GitHub for bonus perks
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOptional && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label className="text-sm text-gray-400 flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Username (optional)
              </label>
              <Input
                type="text"
                placeholder="yourusername"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="bg-black/40 border-white/10 text-white placeholder:text-gray-500"
                data-testid="input-github-username"
              />
              <p className="text-xs text-gray-500">Get bonus perks for connected accounts</p>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={signupMutation.isPending || !email}
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold"
          data-testid="button-join-waitlist"
        >
          {signupMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Joining...
            </span>
          ) : (
            "Join Waitlist"
          )}
        </Button>

        {signupMutation.isError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-red-400 text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            Something went wrong. Please try again.
          </motion.div>
        )}
      </form>

      {initialReferralCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-terminal-green/10 border border-terminal-green/20"
        >
          <span className="text-2xl">🎁</span>
          <p className="text-sm text-gray-300">
            You were referred by a friend! You'll both benefit when you verify.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default WaitlistSignup;
