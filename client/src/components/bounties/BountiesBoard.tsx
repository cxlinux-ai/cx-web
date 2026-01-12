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
        relative rounded-xl p-6 group
        transition-all duration-300 ease-out
        ${isPremium 
          ? "bg-gradient-to-br from-yellow-500/10 via-slate-800/80 to-slate-800/80 border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 hover:border-yellow-500/60" 
          : isHighValue 
            ? "bg-gradient-to-br from-blue-500/10 via-slate-800/70 to-slate-800/70 border border-blue-500/30 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
            : "bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600/50"
        }
        hover:-translate-y-1
      `}
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
          {bounty.bountyAmount && (
            <span className={`
              text-xl font-bold
              ${(bounty.bountyAmount || 0) >= 500 
                ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                : (bounty.bountyAmount || 0) >= 300 
                  ? "text-blue-300 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]"
                  : "text-green-400"
              }
            `}>
              {formatCurrency(bounty.bountyAmount)}
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
      <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
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
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <div className="w-12 h-4 bg-slate-600 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-16 h-6 bg-slate-600 rounded" />
          <div className="w-16 h-5 bg-slate-600 rounded" />
        </div>
      </div>
      <div className="h-6 bg-slate-600 rounded w-3/4 mb-2" />
      <div className="h-4 bg-slate-600 rounded w-full mb-4" />
      <div className="flex items-center gap-4 mb-4">
        <div className="w-24 h-4 bg-slate-600 rounded" />
        <div className="w-16 h-4 bg-slate-600 rounded" />
        <div className="w-20 h-4 bg-slate-600 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-5 bg-slate-600 rounded" />
        <div className="w-16 h-5 bg-slate-600 rounded" />
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
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🎉</div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {filter === "all" ? "No bounties found" : `No ${filter} bounties`}
      </h3>
      <p className="text-slate-400 mb-6">
        {filter === "all"
          ? "Check back later for new bounty opportunities."
          : "Try adjusting your filters or check back later."}
      </p>
      {filter !== "all" && (
        <button
          onClick={onClear}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-white mb-2">Failed to load bounties</h3>
      <p className="text-slate-400 mb-6">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
      >
        Retry
      </button>
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

  // Fetch bounties
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
    refetchInterval: 30 * 60 * 1000, // Auto-refresh every 30 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
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

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      bounties = bounties.filter(
        (b) =>
          b.title.toLowerCase().includes(searchLower) ||
          b.description.toLowerCase().includes(searchLower) ||
          b.author.username.toLowerCase().includes(searchLower) ||
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
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <span className="text-4xl">💰</span>
              Bounty Board
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {isFetching && (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Refreshing...
                </span>
              )}
              {lastRefresh && !isFetching && (
                <span>Updated {formatTimeAgo(lastRefresh.toISOString())}</span>
              )}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <svg
                  className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-slate-400">
            Earn rewards by contributing to Cortex Linux open source projects.
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              label="Open Bounties"
              value={stats.totalOpen}
              subValue={formatCurrency(stats.totalOpenAmount) + " available"}
              color="text-green-400"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
            <StatsCard
              label="Completed"
              value={stats.totalClosed}
              subValue={formatCurrency(stats.totalClosedAmount) + " paid out"}
              color="text-slate-400"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search bounties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterStatus)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Bounties</option>
            <option value="open">Open Only</option>
            <option value="closed">Completed Only</option>
          </select>

          {/* Sort Dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_active">Most Active</option>
            <option value="highest_bounty">Highest Bounty</option>
          </select>
        </div>

        {/* Results Count */}
        {!isLoading && !error && (
          <div className="text-sm text-slate-400 mb-4">
            Showing {filteredBounties.length} bounties
            {search && ` matching "${search}"`}
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

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          <p>
            Want to contribute?{" "}
            <a
              href="https://github.com/cortexlinux"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300"
            >
              Check out our GitHub organization
            </a>
          </p>
          <p className="mt-1">Data refreshes automatically every 30 minutes</p>
        </div>
      </div>
    </div>
  );
}

export default BountiesBoard;
