import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Mail,
  Loader2,
  Copy,
  Check,
  LogOut,
  Monitor,
  Trash2,
  CreditCard,
  ArrowUpRight,
  Users,
  DollarSign,
  Gift,
  BookOpen,
  MessageCircle,
  Shield,
  Clock,
  Cpu,
  Key,
  Terminal,
  TrendingUp,
  Star,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

const LICENSE_SERVER = "https://license.cxlinux.com";

type Mode = "login" | "otp" | "dashboard";

interface Device {
  hardware_id: string;
  hostname: string;
  platform: string;
  device_name: string;
  last_seen: string;
}

interface AffiliateData {
  referral_code: string;
  referral_link: string;
  tier: string;
  tier_label: string;
  commission_rate: string;
  commission_duration: string;
  total_referrals: number;
  unpaid_amount: string;
  paid_amount: string;
}

interface DashboardData {
  user: {
    name: string | null;
    email: string;
    created_at: string;
  };
  license: {
    key: string;
    plan: string;
    status: string;
    max_devices: number;
    activated_devices: number;
    expires_at: string;
    billing_cycle: string | null;
    price: string | null;
  } | null;
  devices: Device[];
  affiliate: AffiliateData | null;
}

// Transform backend response to frontend DashboardData
function transformDashboard(raw: any): DashboardData {
  const licenses = raw.licenses || [];
  // Pick primary active license (highest tier first: enterprise > team > pro > core)
  const tierOrder = ['enterprise', 'team', 'pro', 'core'];
  const activeLicenses = licenses.filter((l: any) => l.active);
  activeLicenses.sort((a: any, b: any) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
  const primary = activeLicenses[0] || licenses[0] || null;

  // Determine billing info from tier
  const priceMap: Record<string, string> = {
    core: 'Free',
    pro: '$20/mo',
    team: '$99/mo',
    enterprise: '$299/mo',
  };

  // Display-friendly plan names
  const planNameMap: Record<string, string> = {
    core: 'Free',
    pro: 'Pro',
    team: 'Team',
    enterprise: 'Enterprise',
  };

  return {
    user: {
      name: raw.account?.name || null,
      email: raw.account?.email || '',
      created_at: raw.account?.member_since || new Date().toISOString(),
    },
    license: primary ? {
      key: primary.license_key,
      plan: planNameMap[primary.tier] || primary.tier.charAt(0).toUpperCase() + primary.tier.slice(1),
      status: primary.active ? 'active' : 'expired',
      max_devices: primary.systems_allowed,
      activated_devices: primary.systems_used || 0,
      expires_at: primary.expires_at,
      billing_cycle: primary.stripe_subscription_id ? 'Monthly' : null,
      price: priceMap[primary.tier] || null,
    } : null,
    devices: (raw.devices || []).filter((d: any) => d.active),
    affiliate: raw.affiliate ? {
      ...raw.affiliate,
      unpaid_amount: `$${raw.affiliate.unpaid_amount}`,
      paid_amount: `$${raw.affiliate.paid_amount}`,
      total_earned: raw.affiliate.total_earned,
    } : null,
  };
}

const planColors: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  core: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  pro: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  team: "bg-[#00FF9F]/15 text-[#00FF9F] border-[#00FF9F]/30",
  enterprise: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

export default function AccountPage() {
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [token, setToken] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isJoiningAffiliate, setIsJoiningAffiliate] = useState(false);
  const [removingDevice, setRemovingDevice] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: "Copied to clipboard." });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSessionExpired = () => {
    toast({
      title: "Session Expired",
      description: "Please log in again.",
      variant: "destructive",
    });
    setToken("");
    setDashboard(null);
    setMode("login");
  };

  const apiCall = async (url: string, body: Record<string, unknown>) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.status === 401) {
      handleSessionExpired();
      throw new Error("Session expired");
    }
    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  };

  const loadDashboard = async (authToken: string) => {
    setIsLoading(true);
    try {
      const raw = await apiCall(`${LICENSE_SERVER}/api/v1/user/dashboard`, {
        token: authToken,
      });
      setDashboard(transformDashboard(raw));
      setMode("dashboard");
    } catch (error) {
      if ((error as Error).message !== "Session expired") {
        toast({
          title: "Failed to Load Dashboard",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSendingOTP(true);
    try {
      await apiCall(`${LICENSE_SERVER}/api/v1/user/send-otp`, { email });
      setMode("otp");
      toast({
        title: "Code Sent!",
        description: "Check your email for the verification code.",
      });
    } catch (error) {
      if ((error as Error).message !== "Session expired") {
        toast({
          title: "Failed to Send Code",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    setIsVerifying(true);
    try {
      const data = await apiCall(`${LICENSE_SERVER}/api/v1/user/login`, {
        email,
        otp,
      });
      setToken(data.token);
      await loadDashboard(data.token);
    } catch (error) {
      if ((error as Error).message !== "Session expired") {
        toast({
          title: "Verification Failed",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveDevice = async (hardwareId: string) => {
    if (!dashboard?.license) return;
    setRemovingDevice(hardwareId);
    try {
      await apiCall(`${LICENSE_SERVER}/api/v1/user/deactivate-device`, {
        token,
        license_key: dashboard.license.key,
        hardware_id: hardwareId,
      });
      toast({ title: "Device Removed", description: "Device deactivated." });
      await loadDashboard(token);
    } catch (error) {
      if ((error as Error).message !== "Session expired") {
        toast({
          title: "Failed to Remove Device",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setRemovingDevice(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const data = await apiCall(
        `${LICENSE_SERVER}/api/v1/user/billing-portal`,
        { token },
      );
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      if ((error as Error).message !== "Session expired") {
        toast({
          title: "Failed to Open Billing",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleJoinAffiliate = async () => {
    setIsJoiningAffiliate(true);
    try {
      await apiCall(`${LICENSE_SERVER}/api/v1/user/join-affiliate`, { token });
      toast({
        title: "Welcome to Affiliates!",
        description: "You're now part of the affiliate program.",
      });
      await loadDashboard(token);
    } catch (error) {
      if ((error as Error).message !== "Session expired") {
        toast({
          title: "Failed to Join",
          description:
            error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsJoiningAffiliate(false);
    }
  };

  const handleSignOut = () => {
    setToken("");
    setEmail("");
    setOtp("");
    setDashboard(null);
    setMode("login");
  };

  // Helpers
  const daysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusColor = (status: string, expiresAt?: string) => {
    if (status !== "active") return "bg-red-500";
    if (expiresAt && daysRemaining(expiresAt) < 30) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  // ========== LOGIN SCREEN ==========
  const renderLogin = () => (
    <motion.div
      key="login"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#00FF9F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-[#00FF9F]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
        <p className="text-gray-400">
          Sign in with your email to access your dashboard
        </p>
      </div>

      <form
        onSubmit={handleSendOTP}
        className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
      >
        <div>
          <Label htmlFor="email" className="text-gray-300">
            Email Address
          </Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSendingOTP}
          className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSendingOTP ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {isSendingOTP ? "Sending..." : "Send Verification Code"}
        </button>
      </form>
    </motion.div>
  );

  // ========== OTP SCREEN ==========
  const renderOTP = () => (
    <motion.div
      key="otp"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#00FF9F]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-[#00FF9F]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Enter Code</h1>
        <p className="text-gray-400">
          We sent a 6-digit code to{" "}
          <span className="text-white">{email}</span>
        </p>
      </div>

      <form
        onSubmit={handleVerifyOTP}
        className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4"
      >
        <div>
          <Label htmlFor="otp" className="text-gray-300">
            Verification Code
          </Label>
          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className="mt-1 text-center text-2xl tracking-[0.5em] bg-white/5 border-white/10 text-white placeholder:text-gray-600"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isVerifying || isLoading}
          className="w-full py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isVerifying || isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : null}
          {isVerifying
            ? "Verifying..."
            : isLoading
              ? "Loading Dashboard..."
              : "Verify & Sign In"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOtp("");
            setMode("login");
          }}
          className="w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
        >
          Back to Login
        </button>
      </form>
    </motion.div>
  );

  // ========== DASHBOARD ==========
  const renderDashboard = () => {
    if (!dashboard) return null;
    const { user, license, devices, affiliate } = dashboard;
    const plan = license?.plan?.toLowerCase() || "core";
    const isFreePlan = !license || plan === "Free" || plan === "core";
    const days = license ? daysRemaining(license.expires_at) : 0;

    return (
      <motion.div
        key="dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user.name || email.split("@")[0]}
            </h1>
            <p className="text-gray-400 mt-1">
              Member since {formatDate(user.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${planColors[plan] || planColors.core}`}
            >
              {license?.plan || "Core"} Plan
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Shield className="w-4 h-4" />
              Plan Status
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${license ? statusColor(license.status, license.expires_at) : "bg-gray-500"}`}
              />
              <span className="text-xl font-bold text-white">
                {license?.status === "active" ? "Active" : (license?.status || "No License")}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Monitor className="w-4 h-4" />
              Devices
            </div>
            <span className="text-xl font-bold text-white">
              {license
                ? `${license.activated_devices} / ${license.max_devices}`
                : "0 / 0"}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="w-4 h-4" />
              Days Remaining
            </div>
            <span
              className={`text-xl font-bold ${days < 30 && days > 0 && !isFreePlan ? "text-yellow-400" : "text-white"}`}
            >
              {!license ? "," : isFreePlan ? "∞" : days}
            </span>
          </motion.div>
        </div>

        {/* Section 2: License & Devices */}
        {license && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6"
          >
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-[#00FF9F]" />
              License & Devices
            </h2>

            {/* License Key */}
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400 mb-1">License Key</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-[#00FF9F] font-mono text-sm break-all">
                    {license.key}
                  </code>
                  <button
                    onClick={() => copyToClipboard(license.key, "license")}
                    className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {copiedField === "license" ? (
                      <Check className="w-4 h-4 text-[#00FF9F]" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Quick Install</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 font-mono text-sm">
                    <span className="text-[#00FF9F]">cx</span> activate{" "}
                    {license.key}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `cx activate ${license.key}`,
                        "activate",
                      )
                    }
                    className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {copiedField === "activate" ? (
                      <Check className="w-4 h-4 text-[#00FF9F]" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Device Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">
                  {license.activated_devices} of {license.max_devices} devices
                  used
                </span>
                <span className="text-gray-400">
                  {isFreePlan ? "No Expiry" : `Expires ${formatDate(license.expires_at)}`}
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00FF9F] rounded-full transition-all"
                  style={{
                    width: `${(license.activated_devices / license.max_devices) * 100}%`,
                  }}
                />
              </div>
              {days < 30 && days > 0 && !isFreePlan && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠ Your license expires in {days} days
                </p>
              )}
            </div>

            {/* Device List */}
            {devices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">
                  Active Devices
                </h3>
                {devices.map((device) => (
                  <div
                    key={device.hardware_id}
                    className="flex items-center justify-between bg-black/20 border border-white/5 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-white text-sm font-medium">
                          {device.device_name || device.hostname}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {device.platform} · {device.hostname} · Last seen{" "}
                          {formatDate(device.last_seen)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDevice(device.hardware_id)}
                      disabled={removingDevice === device.hardware_id}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {removingDevice === device.hardware_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Section 3: Subscription & Billing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5"
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#00FF9F]" />
            Subscription & Billing
          </h2>

          {isFreePlan ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-1">
                You're on the <span className="text-white font-medium">Free Plan</span>
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Upgrade to unlock more devices and features
              </p>
              <Link href="/pricing">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors cursor-pointer">
                  Upgrade Plan
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Current Plan</p>
                  <p className="text-white font-medium mt-1">
                    {license?.plan}{" "}
                    {license?.billing_cycle
                      ? `(${license.billing_cycle})`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Price</p>
                  <p className="text-white font-medium mt-1">
                    {license?.price || ","}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Next Billing Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className={`w-2 h-2 rounded-full ${license ? statusColor(license.status, license.expires_at) : "bg-gray-500"}`}
                    />
                    <p className="text-white font-medium">
                      {!license ? "," : isFreePlan ? "No Expiry" : formatDate(license.expires_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleManageBilling}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  Manage Billing & Cancel
                </button>
                <Link href="/pricing">
                  <span className="flex items-center gap-2 px-4 py-2 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors cursor-pointer">
                    Upgrade Plan
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
              </div>

              {/* Recent Payments placeholder */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Recent Payments
                </h3>
                <div className="bg-black/20 border border-white/5 rounded-lg p-4 text-center text-gray-500 text-sm">
                  Payment history coming soon
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Section 4: Affiliate Program */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5"
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00FF9F]" />
            Affiliate Program
          </h2>

          {affiliate ? (
            <div className="space-y-5">
              {/* Referral Code & Link */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Referral Code</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-[#00FF9F] font-mono text-sm">
                      {affiliate.referral_code}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          affiliate.referral_code,
                          "referral-code",
                        )
                      }
                      className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedField === "referral-code" ? (
                        <Check className="w-4 h-4 text-[#00FF9F]" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Referral Link</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-gray-300 font-mono text-sm break-all">
                      {affiliate.referral_link}
                    </code>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          affiliate.referral_link,
                          "referral-link",
                        )
                      }
                      className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      {copiedField === "referral-link" ? (
                        <Check className="w-4 h-4 text-[#00FF9F]" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tier & Commission */}
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    affiliate.tier === "founding"
                      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      : "bg-white/10 text-gray-300 border-white/20"
                  }`}
                >
                  {affiliate.tier === "founding" ? "⭐ Founding" : "Standard"}{" "}
                  Tier
                </span>
                <span className="text-gray-400 text-sm">
                  {affiliate.commission_rate} commission ·{" "}
                  {affiliate.commission_duration}
                </span>
              </div>

              {/* Affiliate Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Total Referrals</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {affiliate.total_referrals}
                  </p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Pending Earnings</p>
                  <p className="text-2xl font-bold text-[#00FF9F] mt-1">
                    {affiliate.unpaid_amount}
                  </p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400">Paid Earnings</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {affiliate.paid_amount}
                  </p>
                </div>
              </div>

              <div className="bg-[#00FF9F]/5 border border-[#00FF9F]/20 rounded-lg p-4 text-sm text-gray-300">
                🎁 People who use your link get 3 months free, mention this
                when sharing!
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="text-center py-2">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Earn 10% Commission
                </h3>
                <p className="text-gray-400 text-sm">
                  Share CX Linux and earn recurring revenue
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 rounded-lg p-4 text-center">
                  <DollarSign className="w-6 h-6 text-[#00FF9F] mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">
                    10% Commission
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    On every referral
                  </p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-lg p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-[#00FF9F] mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">
                    Recurring Revenue
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Earn as long as they stay
                  </p>
                </div>
                <div className="bg-black/20 border border-white/5 rounded-lg p-4 text-center">
                  <Gift className="w-6 h-6 text-[#00FF9F] mx-auto mb-2" />
                  <p className="text-white font-medium text-sm">
                    3 Months Free
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    For your referrals
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleJoinAffiliate}
                  disabled={isJoiningAffiliate}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF9F] text-black font-semibold rounded-lg hover:bg-[#00CC7F] transition-colors disabled:opacity-50"
                >
                  {isJoiningAffiliate ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                  {isJoiningAffiliate
                    ? "Joining..."
                    : "Join Affiliate Program"}
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Section 5: Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <a
            href="https://docs.cxlinux.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group"
          >
            <BookOpen className="w-6 h-6 text-[#00FF9F] mb-3" />
            <h3 className="text-white font-medium mb-1">Documentation</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Browse the docs{" "}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </a>

          <a
            href="https://discord.gg/q4FUyBW6z"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group"
          >
            <MessageCircle className="w-6 h-6 text-[#00FF9F] mb-3" />
            <h3 className="text-white font-medium mb-1">Discord Community</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Join the chat{" "}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </a>

          <a
            href="mailto:support@cxlinux.com"
            className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group"
          >
            <Mail className="w-6 h-6 text-[#00FF9F] mb-3" />
            <h3 className="text-white font-medium mb-1">Support</h3>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Get help{" "}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </p>
          </a>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#1E1E1E] overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#00FF9F]/[0.04] rounded-full blur-[110px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-[#00FF9F]/[0.025] rounded-full blur-[100px]" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <AnimatePresence mode="wait">
          {mode === "login" && renderLogin()}
          {mode === "otp" && renderOTP()}
          {mode === "dashboard" && renderDashboard()}
        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
}
