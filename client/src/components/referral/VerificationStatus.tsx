/**
 * Verification Status Component
 *
 * Shows the status of Discord and GitHub verification
 * with connect buttons and progress tracking.
 */

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Github,
  AlertCircle,
  Loader2,
  Code2,
  Trophy,
} from "lucide-react";
import { FaDiscord } from "react-icons/fa";

interface OAuthStatus {
  discord: {
    connected: boolean;
    username: string | null;
    joinedServer: boolean;
    verified: boolean;
  };
  github: {
    connected: boolean;
    username: string | null;
    prCompleted: boolean;
    prCount: number;
    firstPrUrl: string | null;
  };
  hackathon: {
    participated: boolean;
  };
  verification: {
    fullyVerified: boolean;
    verifiedAt: string | null;
    requirements: {
      discordRequired: boolean;
      contributionRequired: boolean;
      discordComplete: boolean;
      contributionComplete: boolean;
    };
  };
}

interface VerificationStatusProps {
  referralCode: string;
}

function StepIndicator({
  completed,
  current,
  label,
  description,
}: {
  completed: boolean;
  current: boolean;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative">
        {completed ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </motion.div>
        ) : current ? (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Circle className="w-6 h-6 text-blue-500" />
          </motion.div>
        ) : (
          <Circle className="w-6 h-6 text-gray-600" />
        )}
      </div>
      <div className="flex-1">
        <div className={`font-medium ${completed ? "text-green-500" : current ? "text-white" : "text-gray-500"}`}>
          {label}
        </div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
      </div>
    </div>
  );
}

export function VerificationStatus({ referralCode }: VerificationStatusProps) {
  const queryClient = useQueryClient();

  const { data: status, isLoading, error } = useQuery<OAuthStatus>({
    queryKey: ["oauth-status", referralCode],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/oauth/status/${referralCode}`);
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const checkContributionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/oauth/github/check-contributions", {
        referralCode,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oauth-status", referralCode] });
    },
  });

  const verifyDiscordMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/oauth/discord/verify-membership", {
        referralCode,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oauth-status", referralCode] });
    },
  });

  const handleConnectDiscord = async () => {
    try {
      const response = await apiRequest("GET", `/api/oauth/discord/authorize?referralCode=${referralCode}`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      console.error("Failed to start Discord OAuth:", err);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      const response = await apiRequest("GET", `/api/oauth/github/authorize?referralCode=${referralCode}`);
      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      console.error("Failed to start GitHub OAuth:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading verification status...
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          Failed to load verification status
        </div>
      </div>
    );
  }

  const isFullyVerified = status.verification.fullyVerified;
  const discordComplete = status.verification.requirements.discordComplete;
  const contributionComplete = status.verification.requirements.contributionComplete;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/50 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Verification Status
          </h3>
          {isFullyVerified ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium"
            >
              Verified
            </motion.span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
              Pending
            </span>
          )}
        </div>
        {!isFullyVerified && (
          <p className="text-sm text-gray-400 mt-2">
            Complete all steps to verify your referrals and unlock rewards.
          </p>
        )}
      </div>

      {/* Steps */}
      <div className="p-6 space-y-6">
        {/* Discord Verification */}
        <div className="space-y-3">
          <StepIndicator
            completed={discordComplete}
            current={!discordComplete}
            label="1. Join Discord Server"
            description="Connect your Discord and join our community"
          />

          <div className="ml-9">
            {status.discord.connected ? (
              <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <FaDiscord className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-white font-medium">{status.discord.username}</div>
                    <div className="text-xs text-gray-400">
                      {status.discord.joinedServer ? (
                        <span className="text-green-400">Server member</span>
                      ) : (
                        <span className="text-yellow-400">Not in server</span>
                      )}
                    </div>
                  </div>
                </div>
                {!status.discord.joinedServer && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => verifyDiscordMutation.mutate()}
                    disabled={verifyDiscordMutation.isPending}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg disabled:opacity-50"
                  >
                    {verifyDiscordMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </motion.button>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnectDiscord}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
              >
                <FaDiscord className="w-5 h-5" />
                Connect Discord
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>

        {/* GitHub/Contribution Verification */}
        <div className="space-y-3">
          <StepIndicator
            completed={contributionComplete}
            current={discordComplete && !contributionComplete}
            label="2. Make a Contribution"
            description="Submit a PR or participate in a hackathon"
          />

          <div className="ml-9 space-y-3">
            {/* GitHub Connection */}
            {status.github.connected ? (
              <div className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-white font-medium">@{status.github.username}</div>
                      <div className="text-xs text-gray-400">
                        {status.github.prCount} merged PR{status.github.prCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => checkContributionsMutation.mutate()}
                    disabled={checkContributionsMutation.isPending}
                    className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg disabled:opacity-50"
                  >
                    {checkContributionsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Check PRs"
                    )}
                  </motion.button>
                </div>

                {status.github.firstPrUrl && (
                  <a
                    href={status.github.firstPrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <Code2 className="w-4 h-4" />
                    View first contribution
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConnectGitHub}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
              >
                <Github className="w-5 h-5" />
                Connect GitHub
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            )}

            {/* Hackathon Alternative */}
            <div className="text-center">
              <span className="text-xs text-gray-500">or</span>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-white font-medium">Hackathon Participation</div>
                    <div className="text-xs text-gray-400">
                      {status.hackathon.participated ? (
                        <span className="text-green-400">Registered</span>
                      ) : (
                        "Join our hackathon"
                      )}
                    </div>
                  </div>
                </div>
                {!status.hackathon.participated && (
                  <a
                    href="/hackathon"
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium rounded-lg"
                  >
                    Register
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Final Verification Status */}
        <AnimatePresence>
          {isFullyVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div>
                  <div className="font-medium text-green-400">Fully Verified!</div>
                  <div className="text-xs text-gray-400">
                    Your referrals now count towards your rewards.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span className="text-white font-medium">
            {(discordComplete ? 1 : 0) + (contributionComplete ? 1 : 0)}/2
          </span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((discordComplete ? 1 : 0) + (contributionComplete ? 1 : 0)) * 50}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isFullyVerified
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-blue-500 to-cyan-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default VerificationStatus;
