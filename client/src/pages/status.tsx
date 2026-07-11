import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Server,
  Database,
  Shield,
  Terminal,
  RefreshCw,
  ExternalLink,
  Clock,
} from "lucide-react";
import Footer from "@/components/Footer";

interface ServiceStatus {
  name: string;
  url: string;
  icon: typeof Globe;
  status: "operational" | "checking" | "degraded" | "down";
  responseTime?: number;
  description: string;
}

const initialServices: ServiceStatus[] = [
  {
    name: "Website",
    url: "https://cxlinux.com",
    icon: Globe,
    status: "checking",
    description: "Main website (Cloudflare Pages)",
  },
  {
    name: "License Server",
    url: "https://license.cxlinux.com/health",
    icon: Shield,
    status: "checking",
    description: "License validation & checkout (Cloudflare Worker)",
  },
  {
    name: "APT Repository",
    url: "https://repo.cxlinux.com/apt/dists/stable/Release",
    icon: Server,
    status: "checking",
    description: "Package repository for Ubuntu/Debian",
  },

  {
    name: "GitHub",
    url: "https://github.com/cxlinux-ai/cx-core",
    icon: Database,
    status: "checking",
    description: "Source code repositories",
  },
];

function StatusBadge({ status }: { status: ServiceStatus["status"] }) {
  const config = {
    operational: { color: "text-green-400", bg: "bg-green-400/10", icon: CheckCircle2, label: "Operational" },
    checking: { color: "text-gray-400", bg: "bg-gray-400/10", icon: RefreshCw, label: "Checking..." },
    degraded: { color: "text-yellow-400", bg: "bg-yellow-400/10", icon: AlertTriangle, label: "Degraded" },
    down: { color: "text-red-400", bg: "bg-red-400/10", icon: XCircle, label: "Down" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
      <config.icon className={`w-3.5 h-3.5 ${status === "checking" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>(initialServices);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkServices = async () => {
    setIsRefreshing(true);
    const updated = await Promise.all(
      services.map(async (service) => {
        try {
          const start = Date.now();
          const res = await fetch(service.url, {
            method: "HEAD",
            mode: "no-cors",
            signal: AbortSignal.timeout(10000),
          });
          const responseTime = Date.now() - start;
          return { ...service, status: "operational" as const, responseTime };
        } catch {
          // no-cors requests may still succeed (opaque response)
          // Try with a longer timeout to be sure
          try {
            const start = Date.now();
            await fetch(service.url, { method: "HEAD", mode: "no-cors", signal: AbortSignal.timeout(15000) });
            return { ...service, status: "operational" as const, responseTime: Date.now() - start };
          } catch {
            return { ...service, status: "down" as const, responseTime: undefined };
          }
        }
      })
    );
    setServices(updated);
    setLastChecked(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkServices();
    const interval = setInterval(checkServices, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const allOperational = services.every((s) => s.status === "operational");
  const anyDown = services.some((s) => s.status === "down");

  return (
    <div className="relative min-h-screen bg-[#1E1E1E] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00FF9F]/[0.04] rounded-full blur-[110px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[350px] bg-[#00FF9F]/[0.025] rounded-full blur-[100px]" />
      </div>
      {/* Hero */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-[#00FF9F] text-sm font-semibold tracking-wider uppercase mb-4 block">
              SYSTEM STATUS
            </span>
            <h1 className="text-5xl font-extrabold mb-6">
              {allOperational ? (
                <span className="text-green-400">All Systems Operational</span>
              ) : anyDown ? (
                <span className="text-red-400">Service Disruption</span>
              ) : (
                <span className="text-yellow-400">Checking Services...</span>
              )}
            </h1>
            {lastChecked && (
              <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Last checked: {lastChecked.toLocaleTimeString()}
                <button
                  onClick={checkServices}
                  disabled={isRefreshing}
                  className="ml-2 text-[#00FF9F] hover:text-[#00FF9F]/80 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Overall Status Bar */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-xl p-4 text-center font-semibold ${
            allOperational
              ? "bg-green-400/10 border border-green-400/20 text-green-400"
              : anyDown
              ? "bg-red-400/10 border border-red-400/20 text-red-400"
              : "bg-gray-400/10 border border-gray-400/20 text-gray-400"
          }`}>
            {allOperational ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                All services are operating normally
              </span>
            ) : anyDown ? (
              <span className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Some services are experiencing issues
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Checking service health...
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Service List */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-3">
          {services.map((service, i) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center justify-between hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4">
                <service.icon className="w-6 h-6 text-[#00FF9F]" />
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {service.name}
                    <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </h3>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {service.responseTime && (
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {service.responseTime}ms
                  </span>
                )}
                <StatusBadge status={service.status} />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Info */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
            <p className="text-gray-400 text-sm">
              Service checks run automatically every 60 seconds.
              For real-time incident updates, join our{" "}
              <a href="https://discord.gg/q4FUyBW6z" target="_blank" rel="noopener noreferrer" className="text-[#00FF9F] hover:underline">
                Discord community
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
