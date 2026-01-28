/**
 * CX LINUX CORE SYSTEM - AGENTS & FLEET DATABASE SCHEMA
 *
 * Critical missing infrastructure for Rust Core integration
 * These tables are required for the CX Terminal agent runtime to persist state
 */

import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { stripeSubscriptions } from "./schema";

// ==========================================
// AGENT MANAGEMENT SYSTEM
// ==========================================

/**
 * Agents - Active agents registered in the CX system
 * Maps to AgentRuntime in Rust (wezterm-gui/src/agents/runtime.rs)
 */
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Agent identification
  name: text("name").notNull().unique(), // system, file, git, docker, package
  version: text("version").notNull().default("1.0.0"),

  // Registration details
  subscriptionId: varchar("subscription_id").references(() => stripeSubscriptions.id),
  licenseKey: text("license_key").notNull(),

  // Agent capabilities and configuration
  description: text("description").notNull(),
  capabilities: jsonb("capabilities").notNull().default('[]'), // JSON array of supported operations
  config: jsonb("config").notNull().default('{}'), // Agent-specific configuration

  // Runtime status
  status: text("status").notNull().default("inactive"), // inactive, active, error, disabled
  lastSeen: timestamp("last_seen").defaultNow(),
  errorMessage: text("error_message"),

  // Performance metrics
  totalRequests: integer("total_requests").default(0),
  successfulRequests: integer("successful_requests").default(0),
  avgResponseTime: integer("avg_response_time_ms").default(0),

  // Host system information
  hostSystem: text("host_system").notNull(), // linux, darwin, windows
  hostArch: text("host_arch").notNull(), // x86_64, aarch64
  hostHostname: text("host_hostname").notNull(),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  activatedAt: timestamp("activated_at"),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

/**
 * Fleet Status - System-wide CX Linux deployment tracking
 * Critical for enterprise licensing and monitoring
 */
export const fleetStatus = pgTable("fleet_status", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Fleet identification
  subscriptionId: varchar("subscription_id").references(() => stripeSubscriptions.id).notNull(),
  organizationName: text("organization_name"),

  // Fleet metrics
  totalSystems: integer("total_systems").notNull().default(0),
  activeSystems: integer("active_systems").notNull().default(0),
  systemsWithErrors: integer("systems_with_errors").notNull().default(0),

  // License tracking
  licenseUtilization: integer("license_utilization").notNull().default(0), // percentage
  maxLicensedSystems: integer("max_licensed_systems").notNull().default(1),

  // Version distribution
  versionDistribution: jsonb("version_distribution").notNull().default('{}'), // {"1.0.0": 5, "1.1.0": 3}

  // Health metrics
  overallHealthScore: integer("overall_health_score").default(100), // 0-100
  lastHealthCheck: timestamp("last_health_check").defaultNow(),

  // Alerts and notifications
  activeAlerts: integer("active_alerts").default(0),
  lastAlertAt: timestamp("last_alert_at"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastReportedAt: timestamp("last_reported_at").notNull().defaultNow(),
});

export const insertFleetStatusSchema = createInsertSchema(fleetStatus).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFleetStatus = z.infer<typeof insertFleetStatusSchema>;
export type FleetStatus = typeof fleetStatus.$inferSelect;

/**
 * Agent Requests - Log of all agent command executions
 * Critical for debugging and performance monitoring
 */
export const agentRequests = pgTable("agent_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Request identification
  agentId: varchar("agent_id").references(() => agents.id).notNull(),
  requestId: text("request_id").notNull(), // Unique request ID from client

  // Request details
  command: text("command").notNull(),
  parameters: jsonb("parameters").default('{}'),

  // Response details
  success: boolean("success").notNull(),
  result: text("result"),
  errorMessage: text("error_message"),
  suggestions: jsonb("suggestions").default('[]'), // Array of suggestion strings

  // Performance metrics
  responseTimeMs: integer("response_time_ms"),

  // Context
  userId: text("user_id"), // For multi-user systems
  sessionId: text("session_id"), // Terminal session

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type AgentRequest = typeof agentRequests.$inferSelect;

/**
 * System Health - Real-time health monitoring for each CX system
 */
export const systemHealth = pgTable("system_health", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // System identification
  agentId: varchar("agent_id").references(() => agents.id).notNull(),
  hostname: text("hostname").notNull(),

  // System metrics
  cpuUsage: integer("cpu_usage"), // Percentage
  memoryUsage: integer("memory_usage"), // Percentage
  diskUsage: integer("disk_usage"), // Percentage
  uptime: integer("uptime_seconds"),

  // CX-specific health
  daemonStatus: text("daemon_status").notNull().default("unknown"), // running, stopped, error
  terminalSessions: integer("terminal_sessions").default(0),
  activeAgents: integer("active_agents").default(0),

  // Network connectivity
  internetConnected: boolean("internet_connected").default(true),
  cloudApiReachable: boolean("cloud_api_reachable").default(true),

  // License status
  licenseValid: boolean("license_valid").notNull().default(true),
  licenseExpiry: timestamp("license_expiry"),

  // Timestamps
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SystemHealth = typeof systemHealth.$inferSelect;

/**
 * Agent Capabilities - Define what each agent can do
 * Used for intelligent command routing and help generation
 */
export const agentCapabilities = pgTable("agent_capabilities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Agent association
  agentName: text("agent_name").notNull(), // References agents.name

  // Capability definition
  capability: text("capability").notNull(), // e.g., "file.search", "system.disk_usage"
  description: text("description").notNull(),

  // Command patterns this capability handles
  keywords: jsonb("keywords").notNull().default('[]'), // ["disk", "storage", "df"]
  examples: jsonb("examples").notNull().default('[]'), // ["show disk usage", "check free space"]

  // Requirements and constraints
  requiresRoot: boolean("requires_root").default(false),
  supportedPlatforms: jsonb("supported_platforms").notNull().default('["linux"]'), // ["linux", "darwin", "windows"]

  // Status
  enabled: boolean("enabled").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AgentCapability = typeof agentCapabilities.$inferSelect;

// ==========================================
// RUST CORE INTEGRATION SCHEMAS
// ==========================================

/**
 * Expected agent types that must be supported by the Rust core
 * Based on wezterm-gui/src/agents/runtime.rs built-in agents
 */
export const REQUIRED_AGENT_TYPES = {
  system: {
    name: "system",
    description: "System monitoring and management",
    capabilities: ["disk_usage", "memory_info", "cpu_info", "uptime", "services"],
    keywords: ["system", "disk", "memory", "cpu", "uptime", "service"],
  },
  file: {
    name: "file",
    description: "File and directory operations",
    capabilities: ["find", "search", "list", "read", "write", "permissions"],
    keywords: ["file", "directory", "folder", "find", "search", "ls", "cat"],
  },
  package: {
    name: "package",
    description: "Package management",
    capabilities: ["install", "uninstall", "search", "update", "list"],
    keywords: ["package", "install", "uninstall", "apt", "brew", "pacman"],
  },
  git: {
    name: "git",
    description: "Git repository management",
    capabilities: ["status", "commit", "push", "pull", "branch", "merge"],
    keywords: ["git", "commit", "branch", "merge", "push", "pull", "checkout"],
  },
  docker: {
    name: "docker",
    description: "Container management",
    capabilities: ["list", "start", "stop", "logs", "exec", "build"],
    keywords: ["docker", "container", "image", "podman", "compose"],
  },
} as const;

/**
 * Agent status enum for type safety
 */
export const AGENT_STATUS = {
  INACTIVE: "inactive",
  ACTIVE: "active",
  ERROR: "error",
  DISABLED: "disabled",
} as const;

/**
 * Fleet health score calculation weights
 */
export const HEALTH_WEIGHTS = {
  SYSTEM_AVAILABILITY: 40, // 40% weight for systems being online
  AGENT_FUNCTIONALITY: 30, // 30% weight for agents working correctly
  LICENSE_COMPLIANCE: 20, // 20% weight for valid licensing
  PERFORMANCE: 10, // 10% weight for response times
} as const;

// Validation schemas for API endpoints
export const agentRegistrationSchema = z.object({
  name: z.enum(["system", "file", "package", "git", "docker"]),
  licenseKey: z.string().min(10),
  hostSystem: z.enum(["linux", "darwin", "windows"]),
  hostArch: z.enum(["x86_64", "aarch64"]),
  hostHostname: z.string().min(1),
  capabilities: z.array(z.string()).optional(),
  config: z.record(z.any()).optional(),
});

export const fleetHealthUpdateSchema = z.object({
  cpuUsage: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  diskUsage: z.number().min(0).max(100),
  uptime: z.number().min(0),
  daemonStatus: z.enum(["running", "stopped", "error"]),
  terminalSessions: z.number().min(0),
  activeAgents: z.number().min(0),
  internetConnected: z.boolean(),
  cloudApiReachable: z.boolean(),
  licenseValid: z.boolean(),
});

export type AgentRegistration = z.infer<typeof agentRegistrationSchema>;
export type FleetHealthUpdate = z.infer<typeof fleetHealthUpdateSchema>;