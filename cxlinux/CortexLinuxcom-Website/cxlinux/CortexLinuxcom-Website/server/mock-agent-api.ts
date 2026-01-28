/**
 * Copyright (c) 2026 CX Linux
 * Licensed under the Business Source License 1.1
 * You may not use this file except in compliance with the License.
 */

import { Request, Response } from "express";

// In-memory mock database for demonstration
let mockAgents: any[] = [];
let agentIdCounter = 1;

interface MockAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  licenseKey: string;
  hostSystem: string;
  hostArch: string;
  hostHostname: string;
  status: string;
  version: string;
  totalRequests: number;
  successfulRequests: number;
  avgResponseTime: number;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
  activatedAt: string;
}

/**
 * Generate autonomous wins for demo
 */
function generateMockAutonomousWins(agentName: string) {
  const baseWins = [
    {
      id: `${agentName}_sec_001`,
      type: "security",
      action: `Blocked ${Math.floor(Math.random() * 15) + 5} unauthorized login attempts`,
      count: Math.floor(Math.random() * 15) + 5,
      severity: "high",
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      impact: "Prevented potential privilege escalation attack"
    },
    {
      id: `${agentName}_perf_001`,
      type: "performance",
      action: "Optimized system resource allocation",
      count: Math.floor(Math.random() * 20) + 10,
      severity: "medium",
      timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
      impact: `Improved system performance by ${Math.floor(Math.random() * 30) + 15}%`
    },
    {
      id: `${agentName}_auto_001`,
      type: "automation",
      action: "Automated security updates",
      count: Math.floor(Math.random() * 25) + 15,
      severity: "low",
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      impact: `Applied ${Math.floor(Math.random() * 20) + 10} critical security patches automatically`
    }
  ];

  return baseWins;
}

/**
 * Create mock agent
 */
export async function createMockAgent(req: Request, res: Response) {
  try {
    const { name, description, capabilities, licenseKey, hostSystem, hostArch, hostHostname } = req.body;

    const newAgent: MockAgent = {
      id: `agent_${agentIdCounter.toString().padStart(8, '0')}`,
      name: name || "system",
      description: description || "Mock agent for stress testing",
      capabilities: Array.isArray(capabilities) ? capabilities : ["monitoring", "security"],
      licenseKey: licenseKey || `BSL-${name.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
      hostSystem: hostSystem || "linux",
      hostArch: hostArch || "x86_64",
      hostHostname: hostHostname || `cx-${name}-${agentIdCounter.toString().padStart(3, '0')}`,
      status: "active",
      version: "1.0.0",
      totalRequests: Math.floor(Math.random() * 1000) + 500,
      successfulRequests: Math.floor(Math.random() * 900) + 450,
      avgResponseTime: Math.floor(Math.random() * 200) + 50,
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString()
    };

    mockAgents.push(newAgent);
    agentIdCounter++;

    console.log(`✅ Mock Agent Created: ${newAgent.name} (${newAgent.id})`);

    res.status(201).json({
      message: "Agent created successfully",
      agent: newAgent
    });

  } catch (error) {
    console.error("Error creating mock agent:", error);
    res.status(500).json({ error: "Failed to create agent" });
  }
}

/**
 * Get all mock agents
 */
export async function getAllMockAgents(req: Request, res: Response) {
  try {
    const profiles = mockAgents.map(agent => {
      const autonomousWins = generateMockAutonomousWins(agent.name);
      const complianceScore = Math.floor(Math.random() * 15) + 85; // 85-100%
      const uptimePercentage = Math.floor(Math.random() * 5) + 95; // 95-99%
      const threatsBlocked = autonomousWins.filter(w => w.type === 'security').reduce((sum, w) => sum + w.count, 0);

      return {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        complianceScore,
        uptimePercentage,
        threatsBlocked,
        autonomousWinsCount: autonomousWins.length,
        lastSeen: agent.lastSeen,
        hostSystem: agent.hostSystem
      };
    });

    res.json(profiles);
  } catch (error) {
    console.error("Error fetching mock agents:", error);
    res.status(500).json({ error: "Failed to fetch agent profiles" });
  }
}

/**
 * Get detailed agent profile
 */
export async function getMockAgentProfile(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    const agent = mockAgents.find(a => a.id === agentId);
    if (!agent) {
      return res.status(404).json({ error: "Agent not found" });
    }

    const autonomousWins = generateMockAutonomousWins(agent.name);
    const complianceScore = Math.floor(Math.random() * 15) + 85;
    const uptimePercentage = Math.floor(Math.random() * 5) + 95;
    const threatsBlocked = autonomousWins.filter(w => w.type === 'security').reduce((sum, w) => sum + w.count, 0);
    const commandsExecuted = Math.floor(Math.random() * 1000) + 500;

    const enhancedAgent = {
      ...agent,
      autonomousWins,
      complianceScore,
      uptimePercentage,
      threatsBlocked,
      commandsExecuted
    };

    res.json(enhancedAgent);
  } catch (error) {
    console.error("Error generating agent profile:", error);
    res.status(500).json({ error: "Failed to generate agent profile" });
  }
}

/**
 * Clear all mock agents
 */
export async function clearMockAgents(req: Request, res: Response) {
  mockAgents = [];
  agentIdCounter = 1;
  res.json({ message: "All mock agents cleared", count: 0 });
}

/**
 * Get mock database stats
 */
export async function getMockStats(req: Request, res: Response) {
  res.json({
    totalAgents: mockAgents.length,
    activeAgents: mockAgents.filter(a => a.status === 'active').length,
    lastAgentCreated: mockAgents.length > 0 ? mockAgents[mockAgents.length - 1].createdAt : null,
    nextAgentId: agentIdCounter
  });
}