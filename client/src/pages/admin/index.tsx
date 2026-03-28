import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  BarChart3,
  Key,
  Users,
  Activity,
  PlusCircle,
  Copy,
  Check,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Monitor,
  DollarSign,
  UserPlus,
  Power,
  PowerOff,
  CircleDot,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowUpDown,
  Globe,
  Clock,
  Cpu,
} from "lucide-react";

const API_BASE = "https://license.cxlinux.com";

// ── Types ──────────────────────────────────────────────────────────

interface Stats {
  total_licenses: number;
  active_licenses: number;
  expired_licenses: number;
  by_tier: Record<string, number>;
  total_devices: number;
  active_devices: number;
  total_referrers: number;
  active_referrers: number;
  total_commissions: string;
  unpaid_commissions: string;
  recent_signups: number;
}

interface License {
  id: number;
  license_key: string;
  tier: string;
  customer_email: string;
  organization: string | null;
  active: boolean;
  systems_used: number;
  systems_allowed: number;
  expires_at: string;
  days_remaining: number;
  stripe_subscription_id: string | null;
  referral_code: string | null;
  created_at: string;
}

interface Device {
  hardware_id: string;
  device_name: string;
  platform: string;
  hostname: string;
  active: boolean;
  first_seen: string;
  last_seen: string;
}

interface Referrer {
  id?: number;
  referral_code: string;
  email: string;
  name: string | null;
  tier: string;
  commission_rate: number;
  second_level_rate?: number;
  commission_months?: number;
  parent_code?: string | null;
  l1_referrals: number;
  l2_referrals?: number;
  l1_earned?: string;
  l2_earned?: string;
  total_earned: string;
  unpaid: string;
  total_paid?: string;
  active: boolean;
  payout_email?: string;
  payout_method?: string;
  created_at: string;
}

interface Transaction {
  id: number;
  referral_code: string;
  referrer_name: string | null;
  tier: string;
  level: number;
  customer_email: string;
  license_tier: string;
  amount_paid: string;
  commission: string;
  commission_expires_at: string | null;
  paid: boolean;
  created_at: string;
}

interface ReferralDashboard {
  summary: {
    standard_referrers: number;
    founding_referrers: number;
    active_referrers: number;
    total_commissions: string;
    total_unpaid: string;
  };
  referrers: Referrer[];
  recent_transactions: Transaction[];
}

interface ActivityEntry {
  license_key: string;
  hardware_id: string;
  action: string;
  success: boolean;
  error_message: string | null;
  ip_address: string;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────

type Tab = "overview" | "licenses" | "affiliates" | "activity" | "create";

const tierBadge: Record<string, string> = {
  core: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  free: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  pro: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  team: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  enterprise: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const tierDefaults: Record<string, number> = {
  core: 1,
  pro: 5,
  team: 25,
  enterprise: 100,
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const tabMeta: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "licenses", label: "Licenses", icon: Key },
  { id: "affiliates", label: "Affiliates", icon: Users },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "create", label: "Create License", icon: PlusCircle },
];

// ── Component ──────────────────────────────────────────────────────

export default function AdminPanel() {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Overview
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Licenses
  const [licenses, setLicenses] = useState<License[]>([]);
  const [licensesTotal, setLicensesTotal] = useState(0);
  const [licensesLoading, setLicensesLoading] = useState(false);
  const [licenseSearch, setLicenseSearch] = useState("");
  const [licenseTierFilter, setLicenseTierFilter] = useState("all");
  const [licenseActiveFilter, setLicenseActiveFilter] = useState<"1" | "0" | "">("1");
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null);
  const [expandedDevices, setExpandedDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  // Affiliates
  const [referralData, setReferralData] = useState<ReferralDashboard | null>(null);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralTierFilter, setReferralTierFilter] = useState<"all" | "standard" | "founding">("all");
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addMessage, setAddMessage] = useState("");

  // Activity
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // Create License
  const [createForm, setCreateForm] = useState({
    customer_email: "",
    tier: "pro",
    systems_allowed: 5,
    days_valid: 365,
    organization: "",
    referral_code: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createResult, setCreateResult] = useState<{ success: boolean; message: string; license_key?: string } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // ── API helpers ────────────────────────────────────────────────

  const authHeaders = useCallback(
    () => ({ Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }),
    [apiKey],
  );

  const handleAuthError = (status: number) => {
    if (status === 401) {
      setIsAuthenticated(false);
      setAuthError("Invalid or expired API key");
      return true;
    }
    return false;
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Data fetchers ──────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
      if (handleAuthError(res.status)) return;
      const json = await res.json();
      setStats(json.stats);
    } catch { /* ignore */ } finally {
      setStatsLoading(false);
    }
  }, [authHeaders]);

  const fetchLicenses = useCallback(async () => {
    setLicensesLoading(true);
    try {
      const params = new URLSearchParams({
        tier: licenseTierFilter,
        active: licenseActiveFilter,
        search: licenseSearch,
        limit: "50",
        offset: "0",
      });
      const res = await fetch(`${API_BASE}/admin/licenses?${params}`, { headers: authHeaders() });
      if (handleAuthError(res.status)) return;
      const json = await res.json();
      setLicenses(json.licenses || []);
      setLicensesTotal(json.total || 0);
    } catch { /* ignore */ } finally {
      setLicensesLoading(false);
    }
  }, [authHeaders, licenseTierFilter, licenseActiveFilter, licenseSearch]);

  const fetchDevices = useCallback(async (licenseKey: string) => {
    setDevicesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/devices?license_key=${encodeURIComponent(licenseKey)}`, {
        headers: authHeaders(),
      });
      if (handleAuthError(res.status)) return;
      const json = await res.json();
      setExpandedDevices(json.devices || []);
    } catch { /* ignore */ } finally {
      setDevicesLoading(false);
    }
  }, [authHeaders]);

  const fetchReferrals = useCallback(async () => {
    setReferralLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/dashboard`, { headers: authHeaders() });
      if (handleAuthError(res.status)) return;
      const json = await res.json();
      setReferralData(json);
    } catch { /* ignore */ } finally {
      setReferralLoading(false);
    }
  }, [authHeaders]);

  const fetchActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/activity?limit=50`, { headers: authHeaders() });
      if (handleAuthError(res.status)) return;
      const json = await res.json();
      setActivity(json.activity || []);
    } catch { /* ignore */ } finally {
      setActivityLoading(false);
    }
  }, [authHeaders]);

  // ── Load data on tab switch ────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "overview") fetchStats();
    else if (activeTab === "licenses") fetchLicenses();
    else if (activeTab === "affiliates") fetchReferrals();
    else if (activeTab === "activity") fetchActivity();
  }, [isAuthenticated, activeTab, fetchStats, fetchLicenses, fetchReferrals, fetchActivity]);

  // Re-fetch licenses when filters change
  useEffect(() => {
    if (isAuthenticated && activeTab === "licenses") fetchLicenses();
  }, [licenseTierFilter, licenseActiveFilter, licenseSearch]);

  // ── Auth ───────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (res.status === 401) {
        setAuthError("Invalid API key");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setStats(json.stats);
      setIsAuthenticated(true);
    } catch (e: any) {
      setAuthError(e.message || "Connection failed");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Actions ────────────────────────────────────────────────────

  const toggleLicenseActive = async (licenseKey: string, currentActive: boolean) => {
    if (!confirm(`${currentActive ? "Deactivate" : "Activate"} license ${licenseKey}?`)) return;
    try {
      await fetch(`${API_BASE}/admin/licenses/update`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ license_key: licenseKey, active: !currentActive }),
      });
      fetchLicenses();
    } catch { /* ignore */ }
  };

  const expandLicense = async (licenseKey: string) => {
    if (expandedLicense === licenseKey) {
      setExpandedLicense(null);
      setExpandedDevices([]);
      return;
    }
    setExpandedLicense(licenseKey);
    await fetchDevices(licenseKey);
  };

  const handleAddFounding = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMessage("");
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/add-founding`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ email: addEmail, name: addName }),
      });
      const json = await res.json();
      if (json.success) {
        setAddMessage(`Created founding affiliate — Code: ${json.referral_code}`);
        setAddEmail("");
        setAddName("");
        fetchReferrals();
      } else {
        setAddMessage(`Error: ${json.error}`);
      }
    } catch (e: any) {
      setAddMessage(`Error: ${e.message}`);
    }
  };

  const handleToggleReferrerActive = async (code: string, currentlyActive: boolean) => {
    if (!confirm(`${currentlyActive ? "Deactivate" : "Reactivate"} referrer ${code}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/update-tier`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ referral_code: code, active: !currentlyActive }),
      });
      const json = await res.json();
      if (json.success) fetchReferrals();
    } catch { /* ignore */ }
  };

  const handleChangeTier = async (code: string, newTier: string) => {
    if (!confirm(`Change ${code} to ${newTier} tier?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/update-tier`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ referral_code: code, tier: newTier }),
      });
      const json = await res.json();
      if (json.success) fetchReferrals();
    } catch { /* ignore */ }
  };

  const handleMarkPaid = async (code: string) => {
    if (!confirm(`Mark all unpaid commissions for ${code} as paid?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/mark-paid`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ referral_code: code }),
      });
      const json = await res.json();
      if (json.success) fetchReferrals();
    } catch { /* ignore */ }
  };

  const handleCreateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const body: Record<string, unknown> = {
        customer_email: createForm.customer_email,
        tier: createForm.tier,
        systems_allowed: createForm.systems_allowed,
        days_valid: createForm.days_valid,
      };
      if (createForm.organization) body.organization = createForm.organization;
      if (createForm.referral_code) body.referral_code = createForm.referral_code;

      const res = await fetch(`${API_BASE}/admin/create-license`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      if (handleAuthError(res.status)) return;
      const json = await res.json();
      if (json.license_key || json.success) {
        setCreateResult({
          success: true,
          message: "License created successfully",
          license_key: json.license_key,
        });
        setCreateForm({ customer_email: "", tier: "pro", systems_allowed: 5, days_valid: 365, organization: "", referral_code: "" });
      } else {
        setCreateResult({ success: false, message: json.error || "Failed to create license" });
      }
    } catch (e: any) {
      setCreateResult({ success: false, message: e.message });
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredReferrers =
    referralData?.referrers.filter((r) => referralTierFilter === "all" || r.tier === referralTierFilter) || [];

  // ── Login Screen ───────────────────────────────────────────────

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00FF9F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-[#00FF9F]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400">Enter your admin API key to continue</p>
          </div>

          <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {authError}
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Admin API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your admin API key"
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={authLoading || !apiKey}
              className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {authLoading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard Shell ────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
              <p className="text-gray-400 mt-1">CX Linux License & Affiliate Management</p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors w-fit"
            >
              <Power className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap gap-1 mb-8 bg-white/5 rounded-xl p-1.5 w-fit"
        >
          {tabMeta.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === t.id
                    ? "bg-[#00FF9F] text-black"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <OverviewTab
              key="overview"
              stats={stats}
              loading={statsLoading}
              onRefresh={fetchStats}
            />
          )}
          {activeTab === "licenses" && (
            <LicensesTab
              key="licenses"
              licenses={licenses}
              total={licensesTotal}
              loading={licensesLoading}
              search={licenseSearch}
              setSearch={setLicenseSearch}
              tierFilter={licenseTierFilter}
              setTierFilter={setLicenseTierFilter}
              activeFilter={licenseActiveFilter}
              setActiveFilter={setLicenseActiveFilter}
              onRefresh={fetchLicenses}
              onToggleActive={toggleLicenseActive}
              expandedLicense={expandedLicense}
              expandedDevices={expandedDevices}
              devicesLoading={devicesLoading}
              onExpand={expandLicense}
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
          )}
          {activeTab === "affiliates" && (
            <AffiliatesTab
              key="affiliates"
              data={referralData}
              loading={referralLoading}
              onRefresh={fetchReferrals}
              tierFilter={referralTierFilter}
              setTierFilter={setReferralTierFilter}
              filteredReferrers={filteredReferrers}
              onToggleActive={handleToggleReferrerActive}
              onChangeTier={handleChangeTier}
              onMarkPaid={handleMarkPaid}
              addEmail={addEmail}
              setAddEmail={setAddEmail}
              addName={addName}
              setAddName={setAddName}
              addMessage={addMessage}
              onAddFounding={handleAddFounding}
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
          )}
          {activeTab === "activity" && (
            <ActivityTab
              key="activity"
              activity={activity}
              loading={activityLoading}
              onRefresh={fetchActivity}
            />
          )}
          {activeTab === "create" && (
            <CreateLicenseTab
              key="create"
              form={createForm}
              setForm={setCreateForm}
              loading={createLoading}
              result={createResult}
              onSubmit={handleCreateLicense}
              copiedField={copiedField}
              onCopy={copyToClipboard}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Shared Components ──────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-white",
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: typeof BarChart3;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 rounded-xl p-5"
    >
      <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}

function RefreshButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
    >
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
      Refresh
    </button>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const t = tier.toLowerCase();
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tierBadge[t] || tierBadge.core}`}>
      {tier.charAt(0).toUpperCase() + tier.slice(1)}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-center text-gray-500 py-12">{message}</p>;
}

// ── Tab 1: Overview ────────────────────────────────────────────────

function OverviewTab({
  stats,
  loading,
  onRefresh,
}: {
  stats: Stats | null;
  loading: boolean;
  onRefresh: () => void;
}) {
  if (!stats && loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#00FF9F]" />
      </motion.div>
    );
  }

  if (!stats) return null;

  const tiers = Object.entries(stats.by_tier);
  const maxTierCount = Math.max(...tiers.map(([, v]) => v), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Overview</h2>
        <RefreshButton loading={loading} onClick={onRefresh} />
      </div>

      {/* Row 1: Main stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Licenses" value={stats.active_licenses} icon={Key} color="text-[#00FF9F]" delay={0.05} />
        <StatCard label="Total Devices" value={stats.active_devices} icon={Monitor} color="text-blue-400" delay={0.1} />
        <StatCard label="Active Affiliates" value={stats.active_referrers} icon={Users} color="text-purple-400" delay={0.15} />
        <StatCard label="Recent Signups" value={stats.recent_signups} icon={UserPlus} color="text-yellow-400" delay={0.2} />
      </div>

      {/* Row 2: Revenue */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Total Commissions" value={`$${stats.total_commissions}`} icon={DollarSign} color="text-[#00FF9F]" delay={0.25} />
        <StatCard label="Unpaid Commissions" value={`$${stats.unpaid_commissions}`} icon={DollarSign} color="text-yellow-400" delay={0.3} />
      </div>

      {/* Row 3: Tier breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-sm text-gray-400 mb-4">License Tiers</h3>
        <div className="space-y-3">
          {tiers.map(([tier, count]) => {
            const colors: Record<string, string> = {
              core: "bg-gray-400",
              pro: "bg-emerald-400",
              team: "bg-blue-400",
              enterprise: "bg-purple-400",
            };
            return (
              <div key={tier} className="flex items-center gap-3">
                <span className="text-sm text-gray-300 w-24 capitalize">{tier}</span>
                <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxTierCount) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className={`h-full rounded-full ${colors[tier] || "bg-gray-400"} flex items-center justify-end pr-2`}
                  >
                    <span className="text-xs font-semibold text-black">{count}</span>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Additional stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Licenses</p>
          <p className="text-lg font-bold">{stats.total_licenses}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Expired Licenses</p>
          <p className="text-lg font-bold text-red-400">{stats.expired_licenses}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-gray-400 text-sm">Total Referrers</p>
          <p className="text-lg font-bold">{stats.total_referrers}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Tab 2: Licenses ────────────────────────────────────────────────

function LicensesTab({
  licenses,
  total,
  loading,
  search,
  setSearch,
  tierFilter,
  setTierFilter,
  activeFilter,
  setActiveFilter,
  onRefresh,
  onToggleActive,
  expandedLicense,
  expandedDevices,
  devicesLoading,
  onExpand,
  copiedField,
  onCopy,
}: {
  licenses: License[];
  total: number;
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  tierFilter: string;
  setTierFilter: (v: string) => void;
  activeFilter: "1" | "0" | "";
  setActiveFilter: (v: "1" | "0" | "") => void;
  onRefresh: () => void;
  onToggleActive: (key: string, active: boolean) => void;
  expandedLicense: string | null;
  expandedDevices: Device[];
  devicesLoading: boolean;
  onExpand: (key: string) => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Licenses <span className="text-gray-400 text-sm font-normal">({total})</span>
        </h2>
        <RefreshButton loading={loading} onClick={onRefresh} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
          />
        </div>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#00FF9F] transition-colors appearance-none cursor-pointer"
        >
          <option value="all">All Tiers</option>
          <option value="core">Core</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {([["1", "Active"], ["", "All"], ["0", "Inactive"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setActiveFilter(val as "1" | "0" | "")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === val ? "bg-[#00FF9F] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-gray-400 font-medium"></th>
                <th className="text-left p-3 text-gray-400 font-medium">Email</th>
                <th className="text-left p-3 text-gray-400 font-medium">License Key</th>
                <th className="text-left p-3 text-gray-400 font-medium">Tier</th>
                <th className="text-left p-3 text-gray-400 font-medium">Devices</th>
                <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                <th className="text-left p-3 text-gray-400 font-medium">Expires</th>
                <th className="text-right p-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => {
                const isExpanded = expandedLicense === lic.license_key;
                const truncatedKey = lic.license_key.length > 16 ? lic.license_key.slice(0, 16) + "..." : lic.license_key;
                return (
                  <React.Fragment key={lic.id}>
                    <tr
                      className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors"
                      onClick={() => onExpand(lic.license_key)}
                    >
                      <td className="p-3">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </td>
                      <td className="p-3 text-gray-300">{lic.customer_email}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[#00FF9F] text-xs bg-white/5 px-2 py-0.5 rounded">{truncatedKey}</code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCopy(lic.license_key, `lic-${lic.id}`);
                            }}
                            className="text-gray-500 hover:text-white transition-colors"
                          >
                            {copiedField === `lic-${lic.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#00FF9F]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <TierBadge tier={lic.tier} />
                      </td>
                      <td className="p-3 text-gray-300">
                        {lic.systems_used}/{lic.systems_allowed}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${lic.active ? "bg-emerald-500" : "bg-red-500"}`} />
                          <span className={lic.active ? "text-emerald-400" : "text-red-400"}>
                            {lic.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-400">
                        {lic.days_remaining > 0 ? (
                          <span>
                            {formatDate(lic.expires_at)}{" "}
                            <span className={`text-xs ${lic.days_remaining < 30 ? "text-yellow-400" : "text-gray-500"}`}>
                              ({lic.days_remaining}d)
                            </span>
                          </span>
                        ) : (
                          <span className="text-red-400">Expired</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleActive(lic.license_key, lic.active);
                          }}
                          className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                            lic.active
                              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                          }`}
                        >
                          {lic.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                    {/* Expanded device list */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="bg-white/[0.02] border-t border-white/5 px-6 py-4"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Cpu className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-300">Registered Devices</span>
                            </div>
                            {devicesLoading ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                              </div>
                            ) : expandedDevices.length === 0 ? (
                              <p className="text-gray-500 text-sm">No devices registered</p>
                            ) : (
                              <div className="grid gap-2">
                                {expandedDevices.map((d) => (
                                  <div
                                    key={d.hardware_id}
                                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white/5 rounded-lg p-3 text-sm"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Monitor className="w-4 h-4 text-gray-400 shrink-0" />
                                      <span className="text-white font-medium truncate">{d.hostname || d.device_name}</span>
                                    </div>
                                    <span className="text-gray-400 text-xs">{d.platform}</span>
                                    <code className="text-xs text-gray-500 truncate">{d.hardware_id}</code>
                                    <span className="text-xs text-gray-500 sm:ml-auto">
                                      Last seen: {formatDate(d.last_seen)}
                                    </span>
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${d.active ? "bg-emerald-500" : "bg-red-500"}`} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {licenses.length === 0 && !loading && <EmptyState message="No licenses found" />}
          {loading && licenses.length === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#00FF9F]" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Need React for Fragment
import React from "react";

// ── Tab 3: Affiliates ──────────────────────────────────────────────

function AffiliatesTab({
  data,
  loading,
  onRefresh,
  tierFilter,
  setTierFilter,
  filteredReferrers,
  onToggleActive,
  onChangeTier,
  onMarkPaid,
  addEmail,
  setAddEmail,
  addName,
  setAddName,
  addMessage,
  onAddFounding,
  copiedField,
  onCopy,
}: {
  data: ReferralDashboard | null;
  loading: boolean;
  onRefresh: () => void;
  tierFilter: "all" | "standard" | "founding";
  setTierFilter: (v: "all" | "standard" | "founding") => void;
  filteredReferrers: Referrer[];
  onToggleActive: (code: string, active: boolean) => void;
  onChangeTier: (code: string, tier: string) => void;
  onMarkPaid: (code: string) => void;
  addEmail: string;
  setAddEmail: (v: string) => void;
  addName: string;
  setAddName: (v: string) => void;
  addMessage: string;
  onAddFounding: (e: React.FormEvent) => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Affiliates</h2>
        <RefreshButton loading={loading} onClick={onRefresh} />
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Standard Referrers" value={data.summary.standard_referrers} icon={Users} color="text-[#00FF9F]" delay={0.05} />
          <StatCard label="Founding Affiliates" value={data.summary.founding_referrers} icon={Users} color="text-yellow-400" delay={0.1} />
          <StatCard label="Active Total" value={data.summary.active_referrers} icon={Users} color="text-blue-400" delay={0.15} />
          <StatCard label="Total Commissions" value={`$${data.summary.total_commissions}`} icon={DollarSign} color="text-[#00FF9F]" delay={0.2} />
          <StatCard label="Unpaid" value={`$${data.summary.total_unpaid}`} icon={DollarSign} color="text-red-400" delay={0.25} />
        </div>
      )}

      {/* Add Founding Affiliate (inline) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Add Founding Affiliate</h3>
        {addMessage && (
          <div
            className={`rounded-lg p-3 mb-4 text-sm ${
              addMessage.startsWith("Error")
                ? "bg-red-500/10 border border-red-500/30 text-red-400"
                : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
            }`}
          >
            {addMessage}
          </div>
        )}
        <form onSubmit={onAddFounding} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            placeholder="Email"
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
          />
          <input
            type="text"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            placeholder="Name (optional)"
            className="sm:w-48 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
          />
          <button
            type="submit"
            className="px-6 py-2.5 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors text-sm whitespace-nowrap"
          >
            Add Founding
          </button>
        </form>
      </motion.div>

      {/* Tier filter */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {(["all", "standard", "founding"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setTierFilter(f)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tierFilter === f ? "bg-[#00FF9F] text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Referrer Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3 text-gray-400 font-medium">Name / Email</th>
                <th className="text-left p-3 text-gray-400 font-medium">Code</th>
                <th className="text-left p-3 text-gray-400 font-medium">Tier</th>
                <th className="text-right p-3 text-gray-400 font-medium">L1</th>
                <th className="text-right p-3 text-gray-400 font-medium">L2</th>
                <th className="text-right p-3 text-gray-400 font-medium">Earned</th>
                <th className="text-right p-3 text-gray-400 font-medium">Unpaid</th>
                <th className="text-left p-3 text-gray-400 font-medium">Status</th>
                <th className="text-right p-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReferrers.map((r) => (
                <tr key={r.referral_code} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="p-3">
                    <div className="font-medium text-white">{r.name || "—"}</div>
                    <div className="text-xs text-gray-500">{r.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <code className="text-[#00FF9F] text-xs bg-white/5 px-2 py-0.5 rounded">{r.referral_code}</code>
                      <button
                        onClick={() => onCopy(r.referral_code, `ref-${r.referral_code}`)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        {copiedField === `ref-${r.referral_code}` ? (
                          <Check className="w-3.5 h-3.5 text-[#00FF9F]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    {r.parent_code && <div className="text-xs text-gray-500 mt-1">Parent: {r.parent_code}</div>}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        r.tier === "founding"
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      {r.tier === "founding" ? "Founding" : "Standard"}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {r.commission_rate * 100}%
                      {(r.second_level_rate ?? 0) > 0 && ` + ${(r.second_level_rate ?? 0) * 100}% L2`}
                      {(r.commission_months ?? 0) > 0 ? ` / ${r.commission_months}mo` : " / forever"}
                    </div>
                  </td>
                  <td className="p-3 text-right text-gray-300">{r.l1_referrals}</td>
                  <td className="p-3 text-right text-gray-300">{r.l2_referrals ?? 0}</td>
                  <td className="p-3 text-right text-[#00FF9F]">${r.total_earned}</td>
                  <td className="p-3 text-right text-yellow-400">${r.unpaid}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${r.active ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={r.active ? "text-emerald-400 text-xs" : "text-red-400 text-xs"}>
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      {parseFloat(r.unpaid) > 0 && (
                        <button
                          onClick={() => onMarkPaid(r.referral_code)}
                          className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                          title="Mark all as paid"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() =>
                          onChangeTier(r.referral_code, r.tier === "standard" ? "founding" : "standard")
                        }
                        className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-md hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                        title={`Switch to ${r.tier === "standard" ? "founding" : "standard"}`}
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleActive(r.referral_code, r.active)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors border ${
                          r.active
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                        }`}
                        title={r.active ? "Deactivate" : "Reactivate"}
                      >
                        {r.active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReferrers.length === 0 && !loading && <EmptyState message="No referrers found" />}
        </div>
      </div>

      {/* Transactions */}
      {data && data.recent_transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold text-gray-300">Recent Transactions</h3>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-gray-400 font-medium">Date</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Referrer</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Level</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Customer</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Plan</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Sale</th>
                    <th className="text-right p-3 text-gray-400 font-medium">Commission</th>
                    <th className="text-left p-3 text-gray-400 font-medium">Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_transactions.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 text-gray-400 text-xs">{formatDate(t.created_at)}</td>
                      <td className="p-3">
                        <code className="text-[#00FF9F] text-xs">{t.referral_code}</code>
                        <span className="text-gray-500 text-xs ml-1">({t.tier})</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            t.level === 1 ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                          }`}
                        >
                          L{t.level}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300 text-xs">{t.customer_email}</td>
                      <td className="p-3">
                        <TierBadge tier={t.license_tier} />
                      </td>
                      <td className="p-3 text-right text-gray-300">${t.amount_paid}</td>
                      <td className="p-3 text-right text-[#00FF9F] font-medium">${t.commission}</td>
                      <td className="p-3">
                        {t.paid ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-400 text-xs">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ── Tab 4: Activity ────────────────────────────────────────────────

function ActivityTab({
  activity,
  loading,
  onRefresh,
}: {
  activity: ActivityEntry[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const actionColors: Record<string, string> = {
    validate: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    activate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    deactivate: "bg-red-500/20 text-red-400 border-red-500/30",
    register: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Activity Log</h2>
        <RefreshButton loading={loading} onClick={onRefresh} />
      </div>

      {loading && activity.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#00FF9F]" />
        </div>
      ) : activity.length === 0 ? (
        <EmptyState message="No activity recorded" />
      ) : (
        <div className="space-y-2">
          {activity.map((entry, i) => (
            <motion.div
              key={`${entry.created_at}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              {/* Time */}
              <div className="text-xs text-gray-500 sm:w-36 shrink-0">
                <div>{formatDate(entry.created_at)}</div>
                <div>{formatTime(entry.created_at)}</div>
              </div>

              {/* Action badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium border w-fit ${
                  actionColors[entry.action] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                }`}
              >
                {entry.action}
              </span>

              {/* Status */}
              {entry.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}

              {/* Details */}
              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <code className="text-[#00FF9F] text-xs truncate">{entry.license_key}</code>
                {entry.hardware_id && (
                  <span className="text-gray-500 text-xs truncate">
                    <Cpu className="w-3 h-3 inline mr-1" />
                    {entry.hardware_id.slice(0, 12)}...
                  </span>
                )}
              </div>

              {/* IP */}
              <div className="flex items-center gap-1 text-gray-500 text-xs shrink-0">
                <Globe className="w-3 h-3" />
                {entry.ip_address}
              </div>

              {/* Error message */}
              {entry.error_message && (
                <div className="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                  {entry.error_message}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Tab 5: Create License ──────────────────────────────────────────

function CreateLicenseTab({
  form,
  setForm,
  loading,
  result,
  onSubmit,
  copiedField,
  onCopy,
}: {
  form: { customer_email: string; tier: string; systems_allowed: number; days_valid: number; organization: string; referral_code: string };
  setForm: (f: typeof form) => void;
  loading: boolean;
  result: { success: boolean; message: string; license_key?: string } | null;
  onSubmit: (e: React.FormEvent) => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const updateField = (key: keyof typeof form, value: string | number) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-xl">
      <h2 className="text-xl font-semibold mb-6">Create License</h2>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-4 mb-6 border ${
            result.success
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}
        >
          <p className={result.success ? "text-emerald-400" : "text-red-400"}>{result.message}</p>
          {result.license_key && (
            <div className="mt-3 flex items-center gap-2">
              <code className="text-[#00FF9F] text-sm bg-white/5 px-3 py-1.5 rounded-lg">{result.license_key}</code>
              <button
                onClick={() => onCopy(result.license_key!, "created-key")}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copiedField === "created-key" ? (
                  <Check className="w-4 h-4 text-[#00FF9F]" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      <form onSubmit={onSubmit} className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={form.customer_email}
            onChange={(e) => updateField("customer_email", e.target.value)}
            placeholder="customer@example.com"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
          />
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Tier</label>
          <div className="flex gap-2">
            {["core", "pro", "team", "enterprise"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  updateField("tier", t);
                  updateField("systems_allowed", tierDefaults[t]);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  form.tier === t
                    ? "bg-[#00FF9F] text-black border-[#00FF9F]"
                    : "bg-white/5 text-gray-400 border-white/10 hover:border-white/20"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Systems & Days */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Systems Allowed</label>
            <input
              type="number"
              min={1}
              value={form.systems_allowed}
              onChange={(e) => updateField("systems_allowed", parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Days Valid</label>
            <input
              type="number"
              min={1}
              value={form.days_valid}
              onChange={(e) => updateField("days_valid", parseInt(e.target.value) || 365)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Organization (optional)</label>
          <input
            type="text"
            value={form.organization}
            onChange={(e) => updateField("organization", e.target.value)}
            placeholder="Company name"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
          />
        </div>

        {/* Referral Code */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Referral Code (optional)</label>
          <input
            type="text"
            value={form.referral_code}
            onChange={(e) => updateField("referral_code", e.target.value)}
            placeholder="REF-ABC123"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00FF9F] transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !form.customer_email}
          className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
          {loading ? "Creating..." : "Create License"}
        </button>
      </form>
    </motion.div>
  );
}
