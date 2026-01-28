/**
 * Copyright (c) 2026 CX Linux
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  CheckCircle,
  Award,
  Cpu,
  Activity,
  Clock,
  Server,
  Lock,
  Zap,
  Eye,
  AlertTriangle,
  Trophy,
  Download,
  Share2
} from "lucide-react";
import { Agent } from "@shared/agents-schema";

interface AutonomousWin {
  id: string;
  type: "security" | "performance" | "automation" | "prevention";
  action: string;
  count: number;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  impact: string;
}

interface AgentServiceRecordProps {
  agent: Agent & {
    autonomousWins: AutonomousWin[];
    complianceScore: number;
    uptimePercentage: number;
    threatsBlocked: number;
    commandsExecuted: number;
  };
}

export default function AgentServiceRecord({ agent }: AgentServiceRecordProps) {
  const [showFullRecord, setShowFullRecord] = useState(false);

  const getWinIcon = (type: AutonomousWin['type']) => {
    switch (type) {
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'automation':
        return <Cpu className="w-4 h-4" />;
      case 'prevention':
        return <Eye className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getWinColor = (severity: AutonomousWin['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-purple-200 bg-purple-800/30';
      case 'high':
        return 'text-purple-300 bg-purple-700/30';
      case 'medium':
        return 'text-purple-400 bg-purple-600/30';
      case 'low':
        return 'text-purple-500 bg-purple-500/30';
      default:
        return 'text-purple-400 bg-purple-600/30';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const exportRecord = () => {
    const recordData = {
      agent: agent.name,
      id: agent.id,
      status: agent.status,
      compliance: `BSL 1.1 Compliant (${agent.complianceScore}%)`,
      uptime: `${agent.uptimePercentage}%`,
      autonomousWins: agent.autonomousWins.length,
      threatsBlocked: agent.threatsBlocked,
      generated: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(recordData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${agent.name}-service-record.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareRecord = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `CX Linux Agent: ${agent.name}`,
        text: `Service Record - ${agent.autonomousWins.length} autonomous wins, ${agent.threatsBlocked} threats blocked`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`CX Linux Agent ${agent.name}: ${agent.autonomousWins.length} autonomous wins, ${agent.complianceScore}% BSL 1.1 compliance`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-purple-950 to-purple-900 border-2 border-purple-400/30 rounded-xl p-8 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='0.1'%3E%3Ccircle cx='60' cy='60' r='50'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-100">CX Agent Service Record</h1>
              <p className="text-purple-300">Agent Classification: {agent.name.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={shareRecord}
              className="p-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg border border-purple-400/30"
            >
              <Share2 className="w-5 h-5 text-purple-200" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportRecord}
              className="p-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg border border-purple-400/30"
            >
              <Download className="w-5 h-5 text-purple-200" />
            </motion.button>
          </div>
        </div>

        {/* Agent Status Indicator */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-3 h-3 rounded-full ${
            agent.status === 'active' ? 'bg-green-400 animate-pulse' :
            agent.status === 'error' ? 'bg-red-400' :
            'bg-yellow-400'
          }`} />
          <span className="text-purple-200 font-medium">
            Status: {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
          </span>
        </div>

        {/* Core Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Agent Identification
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-400">Unique Agent ID:</span>
                <span className="text-purple-100 font-mono">{agent.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Host System:</span>
                <span className="text-purple-100">{agent.hostSystem} ({agent.hostArch})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Version:</span>
                <span className="text-purple-100">{agent.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Hostname:</span>
                <span className="text-purple-100">{agent.hostHostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-400">Activated:</span>
                <span className="text-purple-100">
                  {agent.activatedAt ? new Date(agent.activatedAt).toLocaleDateString() : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              BSL 1.1 Compliance Status
            </h3>
            <div className="space-y-4">
              <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-400/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-300">Compliance Score</span>
                  <span className="text-2xl font-bold text-purple-100">{agent.complianceScore}%</span>
                </div>
                <div className="w-full bg-purple-900/50 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.complianceScore}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-2 bg-gradient-to-r from-purple-500 to-purple-300 rounded-full"
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-purple-200">License Key Validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-purple-200">Source Code Protection Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-purple-200">Commercial Use Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-400/20 text-center">
            <Activity className="w-6 h-6 text-purple-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-100">{agent.uptimePercentage}%</div>
            <div className="text-xs text-purple-400">Uptime</div>
          </div>
          <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-400/20 text-center">
            <Shield className="w-6 h-6 text-purple-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-100">{agent.threatsBlocked}</div>
            <div className="text-xs text-purple-400">Threats Blocked</div>
          </div>
          <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-400/20 text-center">
            <Zap className="w-6 h-6 text-purple-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-100">{agent.commandsExecuted}</div>
            <div className="text-xs text-purple-400">Commands Executed</div>
          </div>
          <div className="bg-purple-800/20 rounded-lg p-4 border border-purple-400/20 text-center">
            <Clock className="w-6 h-6 text-purple-300 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-100">{agent.avgResponseTime}ms</div>
            <div className="text-xs text-purple-400">Avg Response</div>
          </div>
        </div>

        {/* Autonomous Wins */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Autonomous Wins ({agent.autonomousWins.length})
            </h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFullRecord(!showFullRecord)}
              className="text-sm text-purple-300 hover:text-purple-100"
            >
              {showFullRecord ? 'Show Less' : 'View Full Record'}
            </motion.button>
          </div>

          <div className="space-y-3">
            {(showFullRecord ? agent.autonomousWins : agent.autonomousWins.slice(0, 5)).map((win, index) => (
              <motion.div
                key={win.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-purple-800/20 rounded-lg border border-purple-400/10 hover:border-purple-400/30 transition-all"
              >
                <div className={`p-2 rounded-lg ${getWinColor(win.severity)}`}>
                  {getWinIcon(win.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-purple-100 font-medium">{win.action}</span>
                    {win.count > 1 && (
                      <span className="px-2 py-1 bg-purple-600/30 rounded-full text-xs text-purple-200">
                        {win.count}x
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-purple-400">{win.impact}</div>
                </div>

                <div className="text-xs text-purple-500">
                  {new Date(win.timestamp).toLocaleDateString()}
                </div>
              </motion.div>
            ))}

            {!showFullRecord && agent.autonomousWins.length > 5 && (
              <div className="text-center pt-2">
                <span className="text-purple-400 text-sm">
                  +{agent.autonomousWins.length - 5} more wins
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Capabilities */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Agent Capabilities
          </h3>
          <div className="flex flex-wrap gap-2">
            {JSON.parse(agent.capabilities as string).map((capability: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-700/30 text-purple-200 rounded-full text-sm border border-purple-400/20"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-purple-400/20">
          <div className="flex items-center justify-between text-sm text-purple-400">
            <div>
              Generated on {new Date().toLocaleString()} • CX Linux BSL 1.1
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Real-time monitoring active</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}