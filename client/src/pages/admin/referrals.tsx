import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const API_BASE = "https://license.cxlinux.com";

interface Referrer {
  id: number;
  referral_code: string;
  email: string;
  name: string | null;
  tier: string;
  commission_rate: number;
  second_level_rate: number;
  commission_months: number;
  parent_code: string | null;
  l1_referrals: number;
  l2_referrals: number;
  l1_earned: string;
  l2_earned: string;
  total_earned: string;
  unpaid: string;
  total_paid: string;
  active: boolean;
  payout_email: string;
  payout_method: string;
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

interface DashboardData {
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

export default function AdminReferrals() {
  const [apiKey, setApiKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "referrers" | "transactions" | "add">("overview");
  
  // Add private form
  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");
  const [addMessage, setAddMessage] = useState("");

  // Filter
  const [tierFilter, setTierFilter] = useState<"all" | "standard" | "founding">("all");

  const fetchDashboard = useCallback(async () => {
    if (!apiKey) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/dashboard`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setIsAuthenticated(false);
          setError("Invalid API key");
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json);
      setIsAuthenticated(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDashboard();
  };

  const handleAddFounding = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMessage("");
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/add-founding`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: addEmail, name: addName }),
      });
      const json = await res.json();
      if (json.success) {
        setAddMessage(`✅ ${json.message} — Code: ${json.referral_code}`);
        setAddEmail("");
        setAddName("");
        fetchDashboard();
      } else {
        setAddMessage(`❌ ${json.error}`);
      }
    } catch (e: any) {
      setAddMessage(`❌ ${e.message}`);
    }
  };

  const handleToggleActive = async (code: string, currentlyActive: boolean) => {
    if (!confirm(`${currentlyActive ? "Deactivate" : "Reactivate"} referrer ${code}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/update-tier`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referral_code: code, active: !currentlyActive }),
      });
      const json = await res.json();
      if (json.success) fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeTier = async (code: string, newTier: string) => {
    if (!confirm(`Change ${code} to ${newTier} tier?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/update-tier`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referral_code: code, tier: newTier }),
      });
      const json = await res.json();
      if (json.success) fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkPaid = async (code: string) => {
    if (!confirm(`Mark all unpaid commissions for ${code} as paid?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/referrals/mark-paid`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referral_code: code }),
      });
      const json = await res.json();
      if (json.success) fetchDashboard();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredReferrers = data?.referrers.filter(
    (r) => tierFilter === "all" || r.tier === tierFilter
  ) || [];

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-8">
            <h1 className="text-2xl font-bold text-white mb-2">🔐 Admin Access</h1>
            <p className="text-gray-400 mb-6">Referral Management Dashboard</p>
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4 text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <label className="block text-sm text-gray-400 mb-1">Admin API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your admin API key"
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#444] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF9F] mb-4"
              />
              <button
                type="submit"
                disabled={loading || !apiKey}
                className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00cc7f] transition disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Referral Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage founding & standard affiliates</p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-sm hover:border-[#00FF9F] transition"
          >
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1a1a1a] rounded-lg p-1 w-fit">
          {(["overview", "referrers", "transactions", "add"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-[#00FF9F] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "overview" && "📊 Overview"}
              {tab === "referrers" && `👥 Referrers (${data?.referrers.length || 0})`}
              {tab === "transactions" && `💰 Transactions`}
              {tab === "add" && "➕ Add Founding"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Standard Referrers", value: data.summary.standard_referrers, color: "#00FF9F" },
              { label: "Founding Affiliates", value: data.summary.founding_referrers, color: "#FFD700" },
              { label: "Active Total", value: data.summary.active_referrers, color: "#00BFFF" },
              { label: "Total Commissions", value: `$${data.summary.total_commissions}`, color: "#00FF9F" },
              { label: "Unpaid", value: `$${data.summary.total_unpaid}`, color: "#FF6B6B" },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5">
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Referrers Tab */}
        {activeTab === "referrers" && (
          <>
            <div className="flex gap-2 mb-4">
              {(["all", "standard", "founding"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTierFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    tierFilter === f
                      ? "border-[#00FF9F] text-[#00FF9F]"
                      : "border-[#444] text-gray-400 hover:border-[#666]"
                  }`}
                >
                  {f === "all" ? "All" : f === "standard" ? "📋 Standard" : "⭐ Founding"}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-[#333]">
                    <th className="text-left p-3">Name / Email</th>
                    <th className="text-left p-3">Code</th>
                    <th className="text-left p-3">Tier</th>
                    <th className="text-right p-3">L1</th>
                    <th className="text-right p-3">L2</th>
                    <th className="text-right p-3">Earned</th>
                    <th className="text-right p-3">Unpaid</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrers.map((r) => (
                    <tr key={r.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                      <td className="p-3">
                        <div className="font-medium text-white">{r.name || "—"}</div>
                        <div className="text-xs text-gray-500">{r.email}</div>
                      </td>
                      <td className="p-3">
                        <code className="text-[#00FF9F] text-xs bg-[#0d0d0d] px-2 py-1 rounded">
                          {r.referral_code}
                        </code>
                        {r.parent_code && (
                          <div className="text-xs text-gray-500 mt-1">↑ {r.parent_code}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            r.tier === "founding"
                              ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30"
                              : "bg-green-900/30 text-green-400 border border-green-500/30"
                          }`}
                        >
                          {r.tier === "founding" ? "⭐ Founding" : "📋 Standard"}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {r.commission_rate * 100}%{r.second_level_rate > 0 && ` + ${r.second_level_rate * 100}% L2`}
                          {r.commission_months > 0 ? ` / ${r.commission_months}mo` : " / ∞"}
                        </div>
                      </td>
                      <td className="p-3 text-right">{r.l1_referrals}</td>
                      <td className="p-3 text-right">{r.l2_referrals}</td>
                      <td className="p-3 text-right text-[#00FF9F]">${r.total_earned}</td>
                      <td className="p-3 text-right text-yellow-400">
                        ${r.unpaid}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            r.active
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {r.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-1 justify-end">
                          {parseFloat(r.unpaid) > 0 && (
                            <button
                              onClick={() => handleMarkPaid(r.referral_code)}
                              className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 transition"
                              title="Mark all as paid"
                            >
                              💸
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleChangeTier(
                                r.referral_code,
                                r.tier === "standard" ? "founding" : "standard"
                              )
                            }
                            className="px-2 py-1 text-xs bg-[#00FF9F]/10 text-[#00FF9F] rounded hover:bg-[#00FF9F]/20 transition"
                            title={`Switch to ${r.tier === "standard" ? "founding" : "standard"}`}
                          >
                            🔄
                          </button>
                          <button
                            onClick={() => handleToggleActive(r.referral_code, r.active)}
                            className={`px-2 py-1 text-xs rounded transition ${
                              r.active
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                            }`}
                            title={r.active ? "Deactivate" : "Reactivate"}
                          >
                            {r.active ? "⛔" : "✅"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredReferrers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No referrers found</p>
              )}
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#333]">
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Referrer</th>
                  <th className="text-left p-3">Level</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Plan</th>
                  <th className="text-right p-3">Sale</th>
                  <th className="text-right p-3">Commission</th>
                  <th className="text-left p-3">Expires</th>
                  <th className="text-left p-3">Paid</th>
                </tr>
              </thead>
              <tbody>
                {data?.recent_transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[#222] hover:bg-[#1a1a1a]">
                    <td className="p-3 text-gray-400 text-xs">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <code className="text-[#00FF9F] text-xs">{t.referral_code}</code>
                      <span className="text-gray-500 text-xs ml-1">
                        ({t.tier})
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          t.level === 1
                            ? "bg-[#00FF9F]/10 text-[#00FF9F]"
                            : "bg-purple-900/30 text-purple-400"
                        }`}
                      >
                        L{t.level}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 text-xs">{t.customer_email}</td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-0.5 bg-[#1a1a1a] border border-[#444] rounded">
                        {t.license_tier}
                      </span>
                    </td>
                    <td className="p-3 text-right">${t.amount_paid}</td>
                    <td className="p-3 text-right text-[#00FF9F] font-medium">
                      ${t.commission}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {t.commission_expires_at
                        ? new Date(t.commission_expires_at).toLocaleDateString()
                        : "∞"}
                    </td>
                    <td className="p-3">
                      {t.paid ? (
                        <span className="text-green-400 text-xs">✅ Paid</span>
                      ) : (
                        <span className="text-yellow-400 text-xs">⏳ Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!data?.recent_transactions || data.recent_transactions.length === 0) && (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            )}
          </div>
        )}

        {/* Add Founding Tab */}
        {activeTab === "add" && (
          <div className="max-w-lg">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
              <h2 className="text-xl font-bold mb-1">Add Founding Affiliate</h2>
              <p className="text-gray-400 text-sm mb-6">
                Founding affiliates get 10% L1 + 5% L2 commissions for 36 months.
                If the email already exists as standard, they'll be upgraded.
              </p>
              {addMessage && (
                <div
                  className={`rounded-lg p-3 mb-4 text-sm ${
                    addMessage.startsWith("✅")
                      ? "bg-green-900/30 border border-green-500/30 text-green-400"
                      : "bg-red-900/30 border border-red-500/30 text-red-400"
                  }`}
                >
                  {addMessage}
                </div>
              )}
              <form onSubmit={handleAddFounding}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    placeholder="kim@example.com"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#444] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF9F]"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Kim"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#444] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF9F]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#e6c200] transition"
                >
                  Add Founding Referrer
                </button>
              </form>
            </div>

            {/* Tier comparison */}
            <div className="mt-6 bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
              <h3 className="font-bold mb-4">Tier Comparison</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-[#333]">
                    <th className="text-left p-2"></th>
                    <th className="text-left p-2">📋 Standard</th>
                    <th className="text-left p-2">⭐ Founding</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-[#222]">
                    <td className="p-2 text-gray-400">L1 Commission</td>
                    <td className="p-2">10%</td>
                    <td className="p-2">10%</td>
                  </tr>
                  <tr className="border-b border-[#222]">
                    <td className="p-2 text-gray-400">L2 Commission</td>
                    <td className="p-2 text-gray-500">—</td>
                    <td className="p-2 text-[#FFD700]">5%</td>
                  </tr>
                  <tr className="border-b border-[#222]">
                    <td className="p-2 text-gray-400">Duration</td>
                    <td className="p-2 text-[#00FF9F]">Forever</td>
                    <td className="p-2">36 months</td>
                  </tr>
                  <tr className="border-b border-[#222]">
                    <td className="p-2 text-gray-400">Referred User Gets</td>
                    <td className="p-2">3 mo free PRO</td>
                    <td className="p-2">3 mo free PRO</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-gray-400">Access</td>
                    <td className="p-2">Self-register</td>
                    <td className="p-2">Admin invite only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
