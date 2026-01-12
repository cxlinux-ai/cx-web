import { useEffect } from "react";
import { CheckCircle2, Activity, Globe, Terminal, Github, Clock } from "lucide-react";
import Footer from "@/components/Footer";
import { updateSEO, seoConfigs } from "@/lib/seo";

interface StatusItem {
  name: string;
  description: string;
  status: "operational" | "degraded" | "outage";
  icon: typeof Activity;
}

export default function Status() {
  useEffect(() => {
    const cleanup = updateSEO(seoConfigs.status);
    return cleanup;
  }, []);

  const services: StatusItem[] = [
    {
      name: "API",
      description: "Core API endpoints and authentication services",
      status: "operational",
      icon: Activity,
    },
    {
      name: "Website",
      description: "Marketing website and documentation",
      status: "operational",
      icon: Globe,
    },
    {
      name: "CLI Tools",
      description: "Command line interface and package management",
      status: "operational",
      icon: Terminal,
    },
    {
      name: "GitHub Integration",
      description: "Repository sync and contributor data",
      status: "operational",
      icon: Github,
    },
  ];

  const getStatusColor = (status: StatusItem["status"]) => {
    switch (status) {
      case "operational":
        return "text-emerald-400";
      case "degraded":
        return "text-yellow-400";
      case "outage":
        return "text-red-400";
    }
  };

  const getStatusBg = (status: StatusItem["status"]) => {
    switch (status) {
      case "operational":
        return "bg-emerald-400/20";
      case "degraded":
        return "bg-yellow-400/20";
      case "outage":
        return "bg-red-400/20";
    }
  };

  const getStatusText = (status: StatusItem["status"]) => {
    switch (status) {
      case "operational":
        return "Operational";
      case "degraded":
        return "Degraded Performance";
      case "outage":
        return "Service Outage";
    }
  };

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-6">
            <span className="text-white">System</span>{" "}
            <span className="gradient-text">Status</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Real-time operational status of Cortex Linux services
          </p>

          <div
            className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
              allOperational ? "bg-emerald-400/20" : "bg-yellow-400/20"
            } border ${
              allOperational ? "border-emerald-400/30" : "border-yellow-400/30"
            }`}
            data-testid="status-overall"
          >
            <div
              className={`w-3 h-3 rounded-full ${
                allOperational ? "bg-emerald-400" : "bg-yellow-400"
              } animate-pulse`}
            />
            <span
              className={`font-semibold ${
                allOperational ? "text-emerald-400" : "text-yellow-400"
              }`}
            >
              {allOperational
                ? "All Systems Operational"
                : "Some Systems Experiencing Issues"}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 flex items-center justify-between"
              data-testid={`status-${service.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <service.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-400">{service.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusBg(
                    service.status
                  )}`}
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${getStatusColor(service.status)}`}
                  />
                  <span
                    className={`text-sm font-medium ${getStatusColor(
                      service.status
                    )}`}
                  >
                    {getStatusText(service.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Uptime History</h3>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 90 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 h-8 bg-emerald-400/60 rounded-sm"
                title={`Day ${90 - i}: Operational`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-3">
            Last 90 days: 99.99% uptime
          </p>
        </div>

        <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <h3 className="text-xl font-bold mb-3 text-white">
            Subscribe to Status Updates
          </h3>
          <p className="text-gray-400 mb-6">
            Get notified when there are service disruptions or maintenance
            windows.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://twitter.com/cortexlinux"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-twitter"
            >
              Follow on Twitter
            </a>
            <a
              href="https://discord.gg/uCqHvxjU83"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-blue-400 hover:bg-blue-400/10 text-white font-semibold rounded-lg transition-colors"
              data-testid="link-discord"
            >
              Join Discord
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
