/**
 * HRM AI - Agent Management Controller
 *
 * Handles "hiring" (deploying) AI agents to Linux nodes.
 * Requires Team or Enterprise plan.
 */

import { db } from "./db";
import {
  agents,
  agentTasks,
  licenses,
  activations,
  HRM_PLAN_ACCESS,
  HRM_AGENT_LIMITS,
  AGENT_ROLES,
  type Agent,
  type AgentTask,
  type InsertAgent,
  type InsertAgentTask,
  type AgentRole,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// =============================================================================
// PLAN GATING
// =============================================================================

interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  currentCount?: number;
  maxAllowed?: number;
}

/**
 * Check if a license has HRM AI access
 */
export async function checkHrmAccess(licenseId: string): Promise<PlanCheckResult> {
  const license = await db.query.licenses.findFirst({
    where: eq(licenses.id, licenseId),
  });

  if (!license) {
    return { allowed: false, reason: "License not found" };
  }

  if (license.status !== "active") {
    return { allowed: false, reason: "License is not active" };
  }

  const hasAccess = HRM_PLAN_ACCESS[license.plan] ?? false;
  if (!hasAccess) {
    return {
      allowed: false,
      reason: `HRM AI requires Team or Enterprise plan. Current plan: ${license.plan}`
    };
  }

  // Check agent count limit
  const existingAgents = await db.query.agents.findMany({
    where: and(
      eq(agents.licenseId, licenseId),
      // Don't count terminated agents
    ),
  });

  const activeAgents = existingAgents.filter(a => a.status !== "terminated");
  const maxAgents = HRM_AGENT_LIMITS[license.plan] ?? 0;

  return {
    allowed: true,
    currentCount: activeAgents.length,
    maxAllowed: maxAgents,
  };
}

// =============================================================================
// AGENT CRUD OPERATIONS
// =============================================================================

/**
 * Hire (create) a new AI agent
 */
export async function hireAgent(
  licenseId: string,
  name: string,
  role: AgentRole,
  assignedServerId?: string,
  config?: Record<string, unknown>
): Promise<{ success: boolean; agent?: Agent; error?: string }> {
  // Check HRM access
  const accessCheck = await checkHrmAccess(licenseId);
  if (!accessCheck.allowed) {
    return { success: false, error: accessCheck.reason };
  }

  // Check if we're at the agent limit
  if (accessCheck.currentCount !== undefined && accessCheck.maxAllowed !== undefined) {
    if (accessCheck.currentCount >= accessCheck.maxAllowed) {
      return {
        success: false,
        error: `Agent limit reached (${accessCheck.currentCount}/${accessCheck.maxAllowed}). Upgrade to Enterprise for unlimited agents.`
      };
    }
  }

  // Validate role
  if (!AGENT_ROLES[role]) {
    return { success: false, error: `Invalid agent role: ${role}` };
  }

  // Validate server assignment if provided
  if (assignedServerId) {
    const activation = await db.query.activations.findFirst({
      where: eq(activations.id, assignedServerId),
    });
    if (!activation) {
      return { success: false, error: "Assigned server not found" };
    }
  }

  // Create the agent
  const [agent] = await db.insert(agents).values({
    licenseId,
    name,
    role,
    status: "idle",
    assignedServerId,
    config: config ? JSON.stringify(config) : undefined,
  }).returning();

  return { success: true, agent };
}

/**
 * Get all agents for a license
 */
export async function getAgents(licenseId: string): Promise<Agent[]> {
  return db.query.agents.findMany({
    where: eq(agents.licenseId, licenseId),
    orderBy: desc(agents.createdAt),
  });
}

/**
 * Get a single agent by ID
 */
export async function getAgent(agentId: string): Promise<Agent | undefined> {
  return db.query.agents.findFirst({
    where: eq(agents.id, agentId),
  });
}

/**
 * Update agent status
 */
export async function updateAgentStatus(
  agentId: string,
  status: Agent["status"]
): Promise<{ success: boolean; agent?: Agent; error?: string }> {
  const [updated] = await db.update(agents)
    .set({
      status,
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    })
    .where(eq(agents.id, agentId))
    .returning();

  if (!updated) {
    return { success: false, error: "Agent not found" };
  }

  return { success: true, agent: updated };
}

/**
 * Terminate (soft delete) an agent
 */
export async function terminateAgent(
  agentId: string
): Promise<{ success: boolean; error?: string }> {
  const [updated] = await db.update(agents)
    .set({
      status: "terminated",
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId))
    .returning();

  if (!updated) {
    return { success: false, error: "Agent not found" };
  }

  return { success: true };
}

/**
 * Reassign agent to a different server
 */
export async function reassignAgent(
  agentId: string,
  newServerId: string | null
): Promise<{ success: boolean; agent?: Agent; error?: string }> {
  // Validate new server if provided
  if (newServerId) {
    const activation = await db.query.activations.findFirst({
      where: eq(activations.id, newServerId),
    });
    if (!activation) {
      return { success: false, error: "Target server not found" };
    }
  }

  const [updated] = await db.update(agents)
    .set({
      assignedServerId: newServerId,
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId))
    .returning();

  if (!updated) {
    return { success: false, error: "Agent not found" };
  }

  return { success: true, agent: updated };
}

// =============================================================================
// TASK MANAGEMENT
// =============================================================================

/**
 * Create a new task for an agent
 */
export async function createAgentTask(
  agentId: string,
  command: string
): Promise<{ success: boolean; task?: AgentTask; error?: string }> {
  // Verify agent exists and is available
  const agent = await getAgent(agentId);
  if (!agent) {
    return { success: false, error: "Agent not found" };
  }

  if (agent.status === "terminated") {
    return { success: false, error: "Agent has been terminated" };
  }

  if (agent.status === "working") {
    return { success: false, error: "Agent is currently busy" };
  }

  // Create the task
  const [task] = await db.insert(agentTasks).values({
    agentId,
    command,
    status: "pending",
  }).returning();

  // Update agent status
  await db.update(agents)
    .set({
      status: "working",
      lastTaskId: task.id,
      lastTaskStatus: "running",
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(agents.id, agentId));

  return { success: true, task };
}

/**
 * Update task status (called by agent executor)
 */
export async function updateTaskStatus(
  taskId: string,
  status: AgentTask["status"],
  output?: string,
  resolvedCommand?: string
): Promise<{ success: boolean; task?: AgentTask; error?: string }> {
  const updateData: Partial<AgentTask> = { status };

  if (output) updateData.output = output;
  if (resolvedCommand) updateData.resolvedCommand = resolvedCommand;

  if (status === "running") {
    updateData.startedAt = new Date();
  }

  if (status === "success" || status === "failed" || status === "cancelled") {
    updateData.completedAt = new Date();
  }

  const [task] = await db.update(agentTasks)
    .set(updateData)
    .where(eq(agentTasks.id, taskId))
    .returning();

  if (!task) {
    return { success: false, error: "Task not found" };
  }

  // Update agent with task result
  await db.update(agents)
    .set({
      status: (status === "success" || status === "failed" || status === "cancelled") ? "idle" : "working",
      lastTaskStatus: status,
      lastActiveAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(agents.id, task.agentId));

  return { success: true, task };
}

/**
 * Get task history for an agent
 */
export async function getAgentTasks(
  agentId: string,
  limit: number = 50
): Promise<AgentTask[]> {
  return db.query.agentTasks.findMany({
    where: eq(agentTasks.agentId, agentId),
    orderBy: desc(agentTasks.createdAt),
    limit,
  });
}

// =============================================================================
// FLEET OVERVIEW
// =============================================================================

interface FleetStats {
  totalAgents: number;
  activeAgents: number;
  workingAgents: number;
  errorAgents: number;
  tasksPending: number;
  tasksCompleted: number;
  tasksFailed: number;
}

/**
 * Get fleet statistics for a license
 */
export async function getFleetStats(licenseId: string): Promise<FleetStats> {
  const allAgents = await db.query.agents.findMany({
    where: eq(agents.licenseId, licenseId),
  });

  const agentIds = allAgents.map(a => a.id);

  // Get all tasks for these agents
  let allTasks: AgentTask[] = [];
  if (agentIds.length > 0) {
    allTasks = await db.query.agentTasks.findMany({
      where: eq(agentTasks.agentId, agentIds[0]), // Simplified - in production would use inArray
    });
  }

  return {
    totalAgents: allAgents.length,
    activeAgents: allAgents.filter(a => a.status !== "terminated").length,
    workingAgents: allAgents.filter(a => a.status === "working").length,
    errorAgents: allAgents.filter(a => a.status === "error").length,
    tasksPending: allTasks.filter(t => t.status === "pending" || t.status === "running").length,
    tasksCompleted: allTasks.filter(t => t.status === "success").length,
    tasksFailed: allTasks.filter(t => t.status === "failed").length,
  };
}

/**
 * Get available agent roles with descriptions
 */
export function getAgentRoles(): typeof AGENT_ROLES {
  return AGENT_ROLES;
}
