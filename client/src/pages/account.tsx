import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronLeft,
  Key,
  Copy,
  Check,
  Server,
  Trash2,
  AlertTriangle,
  Clock,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Footer from "@/components/Footer";

interface Activation {
  id: string;
  machine_id: string;
  hostname: string | null;
  activated_at: string;
  last_seen: string;
}

interface License {
  id: string;
  license_key: string;
  plan: string;
  status: string;
  max_systems: number;
  active_systems: number;
  created_at: string;
  expires_at: string | null;
  activations: Activation[];
}

interface LicensesResponse {
  licenses: License[];
}

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<License[] | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const fetchLicenses = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/license/by-email/${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch licenses");
      }

      setLicenses((data as LicensesResponse).licenses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch licenses");
      setLicenses(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const deactivateSystem = async (licenseKey: string, activationId: string) => {
    if (!confirm("Are you sure you want to deactivate this system?")) {
      return;
    }

    setDeactivating(activationId);

    try {
      const response = await fetch("/api/license/deactivate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          license_key: licenseKey,
          activation_id: activationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to deactivate");
      }

      // Refresh licenses
      await fetchLicenses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Deactivation failed");
    } finally {
      setDeactivating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "pro":
        return "bg-blue-500/20 text-blue-400 border-blue-400/30";
      case "enterprise":
        return "bg-purple-500/20 text-purple-400 border-purple-400/30";
      case "managed":
        return "bg-amber-500/20 text-amber-400 border-amber-400/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-400/30";
      case "suspended":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-400/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-400/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-400/30";
    }
  };

  return (
    <div id="account-page-container" className="min-h-screen bg-black text-white pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          id="account-back-link"
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          Back to Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 id="account-title" className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-white">License</span>{" "}
            <span className="gradient-text">Management</span>
          </h1>
          <p id="account-subtitle" className="text-gray-400 text-lg">
            View your licenses, manage activated systems, and monitor usage
          </p>
        </motion.div>

        {/* Email Lookup Form */}
        <motion.div
          id="account-lookup-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Key size={20} className="text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Find Your Licenses</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Enter the email address associated with your subscription to view your license keys.
          </p>
          <div className="flex gap-3">
            <input
              id="account-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/50"
              onKeyDown={(e) => e.key === "Enter" && fetchLicenses()}
            />
            <button
              id="account-lookup-button"
              onClick={fetchLicenses}
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <RefreshCw size={18} />
              )}
              {loading ? "Loading..." : "Lookup"}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-400/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}
        </motion.div>

        {/* Licenses List */}
        {licenses && licenses.length > 0 && (
          <div id="account-licenses-list" className="space-y-6">
            {licenses.map((license, index) => (
              <motion.div
                key={license.id}
                id={`account-license-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                {/* License Header */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Shield size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getPlanBadgeColor(license.plan)}`}>
                          {license.plan.toUpperCase()}
                        </span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium border ${getStatusBadgeColor(license.status)}`}>
                          {license.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        Created: {formatDate(license.created_at)}
                      </div>
                      {license.expires_at && (
                        <div className="mt-1">
                          Expires: {formatDate(license.expires_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License Key */}
                  <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                    <code className="flex-1 text-green-400 font-mono text-sm overflow-x-auto">
                      {license.license_key}
                    </code>
                    <button
                      onClick={() => copyToClipboard(license.license_key)}
                      className="p-2 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                      title="Copy license key"
                    >
                      {copiedKey === license.license_key ? (
                        <Check size={18} className="text-green-400" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>

                  {/* Usage Stats */}
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Server size={16} className="text-blue-400" />
                      <span className="text-gray-400">
                        {license.active_systems} / {license.max_systems} systems activated
                      </span>
                    </div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, (license.active_systems / license.max_systems) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Activations List */}
                {license.activations.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                      <Server size={14} />
                      Activated Systems ({license.activations.length})
                    </h3>
                    <div className="space-y-2">
                      {license.activations.map((activation) => (
                        <div
                          key={activation.id}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-sm text-white truncate">
                              {activation.hostname || "Unknown Host"}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Machine ID: {activation.machine_id.substring(0, 20)}...
                            </div>
                            <div className="text-xs text-gray-500">
                              Last seen: {formatDate(activation.last_seen)}
                            </div>
                          </div>
                          <button
                            onClick={() => deactivateSystem(license.license_key, activation.id)}
                            disabled={deactivating === activation.id}
                            className="p-2 hover:bg-red-500/20 rounded transition-colors text-gray-400 hover:text-red-400 disabled:opacity-50"
                            title="Deactivate this system"
                          >
                            {deactivating === activation.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {license.activations.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No systems activated yet. Use your license key to activate CX Linux on your machines.
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* No Licenses Found */}
        {licenses && licenses.length === 0 && (
          <motion.div
            id="account-no-licenses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-xl p-8 text-center"
          >
            <AlertTriangle size={48} className="mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Licenses Found</h3>
            <p className="text-gray-400 mb-6">
              No licenses are associated with this email address.
            </p>
            <Link
              href="/pricing"
              className="inline-block px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
            >
              View Pricing Plans
            </Link>
          </motion.div>
        )}

        {/* CLI Instructions */}
        <motion.div
          id="account-cli-instructions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Key size={18} className="text-blue-400" />
            How to Activate Your License
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            After installing CX Linux, activate your license using the CLI:
          </p>
          <div className="bg-black/50 rounded-lg p-4">
            <code className="text-green-400 text-sm font-mono">
              cx activate YOUR-LICENSE-KEY
            </code>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Your license key will be validated and your system will be registered automatically.
          </p>
        </motion.div>

        {/* Support CTA */}
        <motion.div
          id="account-support-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-400 mb-4">
            Having issues with your license? We're here to help.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:support@cxlinux.com"
              className="px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-all"
            >
              Contact Support
            </a>
            <Link
              href="/support"
              className="px-6 py-3 border border-blue-400 text-blue-400 font-medium rounded-lg hover:bg-blue-400/10 transition-all"
            >
              Help Center
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
