/**
 * Bounties Board Component
 *
 * Displays GitHub issues labeled "bounty" from the cortexlinux organization.
 *
 * Features:
 * - Filter by status (all/open/closed)
 * - Sort by newest/oldest/most active
 * - Search by keyword
 * - Loading skeleton
 * - Error state with retry
 * - Auto-refresh every 30 minutes
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// ==========================================
// TYPES
// ==========================================

interface BountyAuthor {
  username: string;
  avatarUrl: string;
  profileUrl: string;
}

interface BountyLabel {
  name: string;
  color: string;
}

interface Bounty {
  id: number;
  number: number;
  title: string;
  url: string;
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  author: BountyAuthor;
  repositoryName: string;  // e.g., "cortex", "cortex-cli"
  repositoryUrl: string;   // Full GitHub repo URL
  bountyAmount: number | null;
  bountyLabel: string | null;
  difficulty: "beginner" | "medium" | "advanced" | null;
  labels: BountyLabel[];
  comments: number;
  description: string;
}

interface BountiesStats {
  totalOpen: number;
  totalClosed: number;
  totalOpenAmount: number;
  totalClosedAmount: number;
}

interface BountiesResponse {
  success: boolean;
  data?: {
    open: Bounty[];
    closed: Bounty[];
    stats: BountiesStats;
  };
  error?: string;
  cached: boolean;
  cacheAge?: number;
  nextRefresh?: number;
}

type FilterStatus = "all" | "open" | "closed";
type SortOption = "newest" | "oldest" | "most_active" | "highest_bounty";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDifficultyColor(difficulty: string | null): string {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "advanced":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
}

function getLabelColor(hexColor: string): string {
  return `bg-[#${hexColor}]/20 text-[#${hexColor}] border-[#${hexColor}]/30`;
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function BountyCard({ bounty }: { bounty: Bounty }) {
  const isHighValue = (bounty.bountyAmount || 0) >= 300;
  const isPremium = (bounty.bountyAmount || 0) >= 500;

  return (
    <div
      className={`
        relative glass-card rounded-2xl p-6 group
        transition-all duration-300 ease-out
        ${isPremium 
          ? "border-yellow-500/40 hover:border-yellow-500/60 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20" 
          : isHighValue 
            ? "border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
            : "hover:border-white/20"
        }
        hover:-translate-y-1
      `}
      data-testid={`bounty-card-${bounty.number}`}
    >
      {/* Premium Glow Effect - subtle */}
      {isPremium && (
        <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-yellow-500/10 blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
      )}
      
      {/* High Value Badge */}
      {isHighValue && (
        <div 
          className={`
            absolute -top-3 -right-3 text-xs font-bold px-3 py-1 rounded-full shadow-lg
            ${isPremium 
              ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black" 
              : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            }
          `}
          data-testid={`badge-bounty-${isPremium ? 'premium' : 'high-value'}`}
        >
          {isPremium ? "Premium Bounty" : "High Value"}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div
            className={`
              w-3 h-3 rounded-full flex-shrink-0
              ${bounty.state === "open" ? "bg-green-500 animate-pulse" : "bg-slate-500"}
            `}
          />
          <span
            className={`
              text-xs font-semibold uppercase tracking-wider
              ${bounty.state === "open" ? "text-green-400" : "text-slate-400"}
            `}
          >
            {bounty.state}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Bounty Amount */}
          {bounty.bountyAmount ? (
            <span className={`
              text-xl font-bold
              ${bounty.bountyAmount >= 500 
                ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                : bounty.bountyAmount >= 300 
                  ? "text-blue-300 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]"
                  : "text-green-400"
              }
            `}>
              {formatCurrency(bounty.bountyAmount)}
            </span>
          ) : (
            <span className="text-sm font-medium text-gray-400 italic">
              Bounty to be discussed
            </span>
          )}

          {/* Difficulty Badge */}
          {bounty.difficulty && (
            <span
              className={`
                px-2 py-0.5 text-xs font-medium border rounded-md capitalize
                ${getDifficultyColor(bounty.difficulty)}
              `}
            >
              {bounty.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
        <a
          href={bounty.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary-400 transition-colors"
        >
          {bounty.title}
        </a>
      </h3>

      {/* Description */}
      {bounty.description && (
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{bounty.description}</p>
      )}

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 mb-4">
        {/* Repository */}
        <a
          href={bounty.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-blue-300 transition-colors"
          title={`View ${bounty.repositoryName} repository`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <span className="font-medium">{bounty.repositoryName}</span>
        </a>

        {/* Author */}
        <a
          href={bounty.author.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          <img
            src={bounty.author.avatarUrl}
            alt={bounty.author.username}
            className="w-5 h-5 rounded-full"
          />
          <span>{bounty.author.username}</span>
        </a>

        {/* Comments */}
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {bounty.comments}
        </span>

        {/* Date */}
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {bounty.state === "closed" && bounty.closedAt
            ? `Closed ${formatTimeAgo(bounty.closedAt)}`
            : formatTimeAgo(bounty.createdAt)}
        </span>
      </div>

      {/* Labels */}
      {bounty.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {bounty.labels.map((label) => (
            <span
              key={label.name}
              className="px-2 py-0.5 text-xs font-medium border rounded-md"
              style={{
                backgroundColor: `#${label.color}20`,
                color: `#${label.color}`,
                borderColor: `#${label.color}30`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* View on GitHub */}
      <a
        href={bounty.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`link-claim-bounty-${bounty.number}`}
        className={`
          inline-flex items-center gap-2 text-sm font-medium
          px-4 py-2 rounded-lg border transition-all duration-200
          ${(bounty.bountyAmount || 0) >= 500
            ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 hover:border-yellow-500/50"
            : (bounty.bountyAmount || 0) >= 300
              ? "text-blue-300 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50"
              : "text-blue-300 border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-blue-500/50"
          }
        `}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
        </svg>
        Claim Bounty
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  );
}

function BountyCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-12 h-4 bg-white/10 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-6 bg-white/10 rounded-lg" />
          <div className="w-16 h-5 bg-white/10 rounded-lg" />
        </div>
      </div>
      <div className="h-6 bg-white/10 rounded-lg w-3/4 mb-2" />
      <div className="h-4 bg-white/10 rounded w-full mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <div className="w-24 h-4 bg-white/10 rounded" />
        <div className="w-16 h-4 bg-white/10 rounded" />
        <div className="w-20 h-4 bg-white/10 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-white/10 rounded-lg" />
        <div className="w-16 h-5 bg-white/10 rounded-lg" />
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  subValue,
  icon,
  color,
}: {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-current/10">{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-slate-400">{label}</div>
          {subValue && <div className="text-xs text-slate-500">{subValue}</div>}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filter, onClear }: { filter: FilterStatus; onClear: () => void }) {
  const isFiltered = filter !== "all";

  return (
    <div className="text-center py-16 px-4">
      <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-3">
          {isFiltered ? `No ${filter} bounties` : "No Live Bounties Yet"}
        </h3>

        {/* Description */}
        <p className="text-gray-400 mb-6 leading-relaxed">
          {isFiltered ? (
            "Try adjusting your filters to see more results."
          ) : (
            <>
              Bounties are added when there are open issues labeled with a dollar amount on our GitHub. 
              Want to earn rewards? Watch our repository for new opportunities.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isFiltered ? (
            <button
              onClick={onClear}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-colors font-medium"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </button>
          ) : (
            <>
              <a
                href="https://github.com/cortexlinux"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
                data-testid="link-github-org"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                View GitHub Org
              </a>
              <a
                href="https://github.com/cortexlinux/cortex/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl transition-colors font-medium"
                data-testid="link-propose-bounty"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                View Open Issues
              </a>
            </>
          )}
        </div>

        {/* Footer note */}
        {!isFiltered && (
          <p className="text-sm text-gray-500 mt-8">
            Issues labeled with dollar amounts (e.g., $100, $500) will appear here as bounties.
          </p>
        )}
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="glass-card rounded-2xl p-8 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to load bounties</h3>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors font-medium shadow-lg shadow-blue-500/25"
          data-testid="button-retry"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function BountiesBoard() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fetch bounties from server API
  // Server caches data for 5 minutes to prevent GitHub rate limits
  // Client refreshes every 5 minutes to stay in sync with server cache
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<BountiesResponse>({
    queryKey: ["bounties"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bounties");
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes (matches server cache)
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes (slightly before server refresh)
  });

  // Update last refresh time
  useEffect(() => {
    if (response?.success) {
      setLastRefresh(new Date());
    }
  }, [response]);

  // Filter and sort bounties
  const filteredBounties = useMemo(() => {
    if (!response?.data) return [];

    let bounties: Bounty[] = [];

    // Apply filter
    if (filter === "open") {
      bounties = [...response.data.open];
    } else if (filter === "closed") {
      bounties = [...response.data.closed];
    } else {
      bounties = [...response.data.open, ...response.data.closed];
    }

    // Apply search (searches title, description, author, repository, and labels)
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      bounties = bounties.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.description.toLowerCase().includes(searchLower) ||
          b.author.username.toLowerCase().includes(searchLower) ||
          b.repositoryName.toLowerCase().includes(searchLower) ||
          b.labels.some((l) => l.name.toLowerCase().includes(searchLower))
      );
    }

    // Apply sort
    bounties.sort((a, b) => {
      switch (sort) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most_active":
          return b.comments - a.comments;
        case "highest_bounty":
          return (b.bountyAmount || 0) - (a.bountyAmount || 0);
        default:
          return 0;
      }
    });

    return bounties;
  }, [response?.data, filter, sort, search]);

  const handleClearFilters = useCallback(() => {
    setFilter("all");
    setSort("newest");
    setSearch("");
  }, []);

  const stats = response?.data?.stats;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="gradient-text">Bounty Board</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-4">
            Earn rewards by contributing to Cortex Linux projects.
          </p>
          
          {/* How It Works Section */}
          <div className="max-w-3xl mx-auto mb-6">
            <div className="glass-card rounded-xl p-4 border-blue-500/20">
              <h3 className="text-sm font-semibold text-blue-300 mb-3 flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                How to Earn Bounties
              </h3>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Join our Discord</span>
                </div>
                <svg className="w-4 h-4 text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Get assigned to a bounty</span>
                </div>
                <svg className="w-4 h-4 text-gray-600 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Submit your PR & get paid on merge</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Discord Assignment Note */}
          <a
            href="https://discord.gg/ASvzWcuTfk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all text-purple-300 text-sm font-medium"
            data-testid="link-discord-bounty-assignment"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
            </svg>
            Join Discord to get assigned
          </a>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            {isFetching && (
              <span className="flex items-center gap-2 text-blue-300">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Refreshing...
              </span>
            )}
            {lastRefresh && !isFetching && (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Updated {formatTimeAgo(lastRefresh.toISOString())}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-lg hover:border-blue-500/40 transition-colors disabled:opacity-50"
              title="Refresh"
              data-testid="button-refresh-bounties"
            >
              <svg
                className={`w-4 h-4 text-blue-300 ${isFetching ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-gray-300 text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="glass-card rounded-2xl p-6 border-green-500/20 hover:border-green-500/40 transition-colors" data-testid="stats-open">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">{stats.totalOpen}</div>
                  <div className="text-sm text-gray-400">Open Bounties</div>
                </div>
              </div>
              <div className="text-sm text-green-300/80">{formatCurrency(stats.totalOpenAmount)} available</div>
            </div>
            <div className="glass-card rounded-2xl p-6 border-blue-500/20 hover:border-blue-500/40 transition-colors" data-testid="stats-completed">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-300">{stats.totalClosed}</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
              </div>
              <div className="text-sm text-blue-300/80">{formatCurrency(stats.totalClosedAmount)} paid out</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bounties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
                  data-testid="input-search-bounties"
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterStatus)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              data-testid="select-filter"
            >
              <option value="all" className="bg-gray-900">All Bounties</option>
              <option value="open" className="bg-gray-900">Open Only</option>
              <option value="closed" className="bg-gray-900">Completed Only</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              data-testid="select-sort"
            >
              <option value="newest" className="bg-gray-900">Newest First</option>
              <option value="oldest" className="bg-gray-900">Oldest First</option>
              <option value="most_active" className="bg-gray-900">Most Active</option>
              <option value="highest_bounty" className="bg-gray-900">Highest Bounty</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="text-sm text-gray-400 mb-6">
            Showing <span className="text-blue-300 font-medium">{filteredBounties.length}</span> bounties
            {search && <span className="text-gray-500"> matching "{search}"</span>}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <BountyCardSkeleton key={i} />
            ))}
          </div>
        ) : error || (response && !response.success) ? (
          <ErrorState
            error={response?.error || "Failed to fetch bounties. Please try again."}
            onRetry={() => refetch()}
          />
        ) : filteredBounties.length === 0 ? (
          <EmptyState filter={filter} onClear={handleClearFilters} />
        ) : (
          <div className="grid gap-4">
            {filteredBounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <div className="glass-card rounded-2xl p-8 max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <svg className="w-6 h-6 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to earn?</h3>
            <p className="text-gray-400 mb-4">
              Join our Discord to get assigned to a bounty. Once your PR is merged, you'll receive payment!
            </p>
            <div className="text-sm text-gray-500 mb-6 space-y-1">
              <p>Bounties without amounts will be discussed after assignment</p>
            </div>
            <a
              href="https://discord.gg/ASvzWcuTfk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-indigo-500/25"
              data-testid="link-discord-community"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord to Start
            </a>
            <p className="text-sm text-gray-500 mt-4">Data refreshes automatically every 5 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BountiesBoard;
