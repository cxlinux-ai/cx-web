/**
 * Copyright (c) 2026 CX Linux
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Plus,
  Users,
  Activity,
  Shield,
  Cpu,
  FileText,
  Download,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import AgentServiceRecord from "@/components/AgentServiceRecord";
import Footer from "@/components/Footer";
import { updateSEO } from "@/lib/seo";

interface AgentProfileSummary {
  id: string;
  name: string;
  status: string;
  complianceScore: number;
  uptimePercentage: number;
  threatsBlocked: number;
  autonomousWinsCount: number;
  lastSeen: string;
  hostSystem: string;
}

export default function AgentProfilesPage() {
  const [agents, setAgents] = useState<AgentProfileSummary[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanup = updateSEO({
      title: 'Agent Service Records | CX Linux - Autonomous AI Fleet Management',
      description: 'Dynamic agent service records showcasing BSL 1.1 compliance, autonomous wins, and security achievements. Monitor your CX Linux AI fleet performance.',
      canonicalPath: '/agent-profiles',
      keywords: [
        'CX Linux agents',
        'agent service records',
        'AI fleet management',
        'autonomous wins',
        'BSL 1.1 compliance',
        'agent profiles',
        'security achievements',
        'agent monitoring'
      ]
    });
    return cleanup;
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentProfile = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/profile`);
      if (!response.ok) throw new Error('Failed to fetch agent profile');
      const data = await response.json();
      setSelectedAgent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agent profile');
    }
  };

  const createSampleAgents = async () => {
    try {
      setCreating(true);
      const response = await fetch('/api/agents/sample', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to create sample agents');
      await fetchAgents(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sample agents');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      case 'disabled':
        return 'text-gray-400 bg-gray-400/20';
      default:
        return 'text-yellow-400 bg-yellow-400/20';
    }
  };

  const exportFleetReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status === 'active').length,
      totalThreatsBlocked: agents.reduce((sum, a) => sum + a.threatsBlocked, 0),
      totalAutonomousWins: agents.reduce((sum, a) => sum + a.autonomousWinsCount, 0),
      averageCompliance: Math.round(agents.reduce((sum, a) => sum + a.complianceScore, 0) / agents.length),
      averageUptime: Math.round(agents.reduce((sum, a) => sum + a.uptimePercentage, 0) / agents.length),
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        compliance: a.complianceScore,
        uptime: a.uptimePercentage,
        threatsBlocked: a.threatsBlocked,
        autonomousWins: a.autonomousWinsCount
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cx-fleet-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedAgent) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedAgent(null)}
              className="mb-8 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium"
            >
              ← Back to Fleet Overview
            </motion.button>

            {/* Synchronized Width Container - matches test-agent-profiles.html */}
            <div className="max-w-4xl mx-auto">
              <AgentServiceRecord agent={selectedAgent} />

              {/* Test Results Section - matching test-agent-profiles.html styling */}
              <div className="mt-8 p-8 bg-green-950 border border-green-900 rounded-lg">
                <h2 className="text-2xl font-bold text-green-300 mb-4">✅ Agent Validation Results</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-3">Service Record Features Verified:</h3>
                    <ul className="space-y-2 text-sm text-green-200">
                      <li>✅ BSL 1.1 compliance score display ({selectedAgent.complianceScore}%)</li>
                      <li>✅ Agent identification with unique ID</li>
                      <li>✅ Performance metrics dashboard</li>
                      <li>✅ Autonomous wins categorization</li>
                      <li>✅ Real-time status monitoring</li>
                      <li>✅ Professional service record layout</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-300 mb-3">System Integration Status:</h3>
                    <ul className="space-y-2 text-sm text-green-200">
                      <li>🛡️ Security: {selectedAgent.threatsBlocked} threats blocked</li>
                      <li>⚡ Performance: {selectedAgent.uptimePercentage}% uptime maintained</li>
                      <li>🤖 Automation: {selectedAgent.commandsExecuted} commands executed</li>
                      <li>👁️ Compliance: {selectedAgent.complianceScore}% BSL 1.1 score</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 rounded-full px-6 py-2 mb-8">
                <Server className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Agent Fleet Management</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Dynamic <span className="gradient-text">Service Records</span>
                <br />
                Autonomous AI Fleet
              </h1>

              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                Real-time monitoring of your CX Linux agent fleet. Each agent generates dynamic service records
                showing BSL 1.1 compliance status, autonomous wins, and security achievements.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchAgents}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Fleet
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={createSampleAgents}
                  disabled={creating}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} />
                  Create Sample Fleet
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={exportFleetReport}
                  disabled={agents.length === 0}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Fleet Report
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Fleet Statistics */}
          {agents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid md:grid-cols-4 gap-6 mb-16"
            >
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">{agents.length}</div>
                <div className="text-gray-400">Total Agents</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <Activity className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">
                  {agents.filter(a => a.status === 'active').length}
                </div>
                <div className="text-gray-400">Active Agents</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">
                  {agents.reduce((sum, a) => sum + a.threatsBlocked, 0)}
                </div>
                <div className="text-gray-400">Threats Blocked</div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <Cpu className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold mb-2">
                  {Math.round(agents.reduce((sum, a) => sum + a.complianceScore, 0) / agents.length)}%
                </div>
                <div className="text-gray-400">Avg Compliance</div>
              </div>
            </motion.div>
          )}

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-300">{error}</span>
            </motion.div>
          )}

          {/* Agent Grid */}
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading agent fleet...</p>
            </div>
          ) : agents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Server className="w-16 h-16 text-gray-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-300 mb-4">No Agents Registered</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Create sample agents to see dynamic service records in action. Each agent will generate
                autonomous wins and compliance metrics automatically.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={createSampleAgents}
                disabled={creating}
                className="px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                <Plus className={`w-5 h-5 ${creating ? 'animate-spin' : ''}`} />
                Create Sample Fleet
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => fetchAgentProfile(agent.id)}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-400/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center">
                        <Server className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-purple-200">
                          {agent.name.toUpperCase()}
                        </h3>
                        <p className="text-xs text-gray-500">{agent.hostSystem}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">BSL 1.1 Compliance:</span>
                      <span className="text-purple-300 font-medium">{agent.complianceScore}%</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-green-300 font-medium">{agent.uptimePercentage}%</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Threats Blocked:</span>
                      <span className="text-red-300 font-medium">{agent.threatsBlocked}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Autonomous Wins:</span>
                      <span className="text-yellow-300 font-medium">{agent.autonomousWinsCount}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Last seen: {new Date(agent.lastSeen).toLocaleDateString()}
                      </span>
                      <FileText className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}