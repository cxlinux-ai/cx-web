import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { 
  ArrowLeft, 
  Download, 
  Users, 
  Mail, 
  Phone, 
  Calendar,
  Search,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { HackathonRegistration } from "@shared/schema";

export default function AdminRegistrations() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: registrations, isLoading, refetch, isRefetching } = useQuery<HackathonRegistration[]>({
    queryKey: ["/api/hackathon/registrations"],
    refetchInterval: 30000,
  });

  const filteredRegistrations = registrations?.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExportCSV = () => {
    window.open("/api/hackathon/registrations/csv", "_blank");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-black text-white noise-texture">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/hackathon" className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-300 mb-6 transition-colors" data-testid="link-back-hackathon">
          <ArrowLeft size={16} />
          Back to Hackathon
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Hackathon <span className="text-blue-300">Registrations</span>
          </h1>
          <p className="text-gray-400">
            Track and manage all hackathon participants
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Users className="text-blue-300" size={24} />
              <span className="text-gray-400">Total Registrations</span>
            </div>
            <p className="text-3xl font-bold">{registrations?.length || 0}</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="text-emerald-400" size={24} />
              <span className="text-gray-400">Email Collected</span>
            </div>
            <p className="text-3xl font-bold">{registrations?.length || 0}</p>
          </div>
          <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="text-purple-400" size={24} />
              <span className="text-gray-400">Phone Provided</span>
            </div>
            <p className="text-3xl font-bold">
              {registrations?.filter(r => r.phone).length || 0}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10"
                data-testid="input-search-registrations"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                disabled={isRefetching}
                data-testid="button-refresh"
              >
                <RefreshCw size={16} className={isRefetching ? "animate-spin" : ""} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                onClick={handleExportCSV}
                className="bg-brand-blue hover:bg-blue-600"
                data-testid="button-export-csv"
              >
                <Download size={16} />
                Export CSV
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400">
              Loading registrations...
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {searchTerm ? "No matching registrations found" : "No registrations yet"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-registrations">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">#</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Phone</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map((registration, index) => (
                    <tr 
                      key={registration.id} 
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                      data-testid={`row-registration-${registration.id}`}
                    >
                      <td className="p-4 text-gray-500">{index + 1}</td>
                      <td className="p-4 font-medium">{registration.name}</td>
                      <td className="p-4 text-blue-300">{registration.email}</td>
                      <td className="p-4 text-gray-400">{registration.phone || "—"}</td>
                      <td className="p-4 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          {formatDate(registration.registeredAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
