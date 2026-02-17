import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// GitHub Contributor type
export const contributorSchema = z.object({
  login: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
  contributions: z.number(),
});

export type Contributor = z.infer<typeof contributorSchema>;

// Hackathon Registration
export const hackathonRegistrations = pgTable("hackathon_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  registeredAt: text("registered_at").notNull().default(sql`now()`),
  // Extended hackathon fields (existing in database)
  fullName: text("full_name"),
  country: text("country"),
  currentRole: text("current_role"),
  organization: text("organization"),
  githubUrl: text("github_url"),
  linkedinUrl: text("linkedin_url"),
  linuxExperience: text("linux_experience"),
  aiMlExperience: text("ai_ml_experience"),
  programmingLanguages: text("programming_languages"),
  teamOrSolo: text("team_or_solo"),
  teamName: text("team_name"),
  projectIdea: text("project_idea"),
  usedCxBefore: text("used_cx_before"),
  howHeardAboutUs: text("how_heard_about_us"),
  phaseParticipation: text("phase_participation"),
});

export const insertHackathonRegistrationSchema = createInsertSchema(hackathonRegistrations).pick({
  name: true,
  email: true,
  phone: true,
  fullName: true,
  country: true,
  currentRole: true,
  organization: true,
  githubUrl: true,
  linkedinUrl: true,
  linuxExperience: true,
  aiMlExperience: true,
  programmingLanguages: true,
  teamOrSolo: true,
  teamName: true,
  projectIdea: true,
  usedCxBefore: true,
  howHeardAboutUs: true,
  phaseParticipation: true,
});

export type InsertHackathonRegistration = z.infer<typeof insertHackathonRegistrationSchema>;
export type HackathonRegistration = typeof hackathonRegistrations.$inferSelect;

// Stripe Customers
export const stripeCustomers = pgTable("stripe_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStripeCustomerSchema = createInsertSchema(stripeCustomers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStripeCustomer = z.infer<typeof insertStripeCustomerSchema>;
export type StripeCustomer = typeof stripeCustomers.$inferSelect;

// Stripe Subscriptions
export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => stripeCustomers.id),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  stripePriceId: text("stripe_price_id").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  pausedAt: timestamp("paused_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStripeSubscriptionSchema = createInsertSchema(stripeSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStripeSubscription = z.infer<typeof insertStripeSubscriptionSchema>;
export type StripeSubscription = typeof stripeSubscriptions.$inferSelect;

// Stripe Payments
export const stripePayments = pgTable("stripe_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => stripeCustomers.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStripePaymentSchema = createInsertSchema(stripePayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStripePayment = z.infer<typeof insertStripePaymentSchema>;
export type StripePayment = typeof stripePayments.$inferSelect;

// Stripe Refunds
export const stripeRefunds = pgTable("stripe_refunds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  paymentId: varchar("payment_id").references(() => stripePayments.id),
  stripeRefundId: text("stripe_refund_id").notNull().unique(),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStripeRefundSchema = createInsertSchema(stripeRefunds).omit({
  id: true,
  createdAt: true,
});

export type InsertStripeRefund = z.infer<typeof insertStripeRefundSchema>;
export type StripeRefund = typeof stripeRefunds.$inferSelect;

// Stripe Disputes
export const stripeDisputes = pgTable("stripe_disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeDisputeId: text("stripe_dispute_id").notNull().unique(),
  chargeId: text("charge_id").notNull(),
  paymentIntentId: text("payment_intent_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStripeDisputeSchema = createInsertSchema(stripeDisputes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStripeDispute = z.infer<typeof insertStripeDisputeSchema>;
export type StripeDispute = typeof stripeDisputes.$inferSelect;

// Stripe Invoice Payments
export const stripeInvoicePayments = pgTable("stripe_invoice_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => stripeCustomers.id),
  stripeInvoiceId: text("stripe_invoice_id").notNull().unique(),
  subscriptionId: varchar("subscription_id").references(() => stripeSubscriptions.id),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStripeInvoicePaymentSchema = createInsertSchema(stripeInvoicePayments).omit({
  id: true,
  createdAt: true,
});

export type InsertStripeInvoicePayment = z.infer<typeof insertStripeInvoicePaymentSchema>;
export type StripeInvoicePayment = typeof stripeInvoicePayments.$inferSelect;

// =============================================================================
// LICENSE KEY SYSTEM
// =============================================================================

// Plan limits configuration (max servers per plan)
// Matches pricing page tiers
export const PLAN_LIMITS: Record<string, number> = {
  core: 1,        // CX Core (Free) - 1 server
  pro: 5,         // CX Pro ($19/mo) - Up to 5 servers
  team: 25,       // CX Team ($99/mo) - Up to 25 servers
  enterprise: 9999, // CX Enterprise ($199/mo) - Unlimited
};

// Licenses table
export const licenses = pgTable("licenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseKey: varchar("license_key").notNull().unique().default(sql`gen_random_uuid()`),
  userEmail: text("user_email").notNull(),
  plan: text("plan").notNull(), // pro, enterprise, managed
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeCustomerId: text("stripe_customer_id"),
  maxSystems: integer("max_systems").notNull().default(5),
  status: text("status").notNull().default("active"), // active, suspended, cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertLicenseSchema = createInsertSchema(licenses).omit({
  id: true,
  licenseKey: true,
  createdAt: true,
});

export type InsertLicense = z.infer<typeof insertLicenseSchema>;
export type License = typeof licenses.$inferSelect;

// Activations table
export const activations = pgTable("activations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseId: varchar("license_id").notNull().references(() => licenses.id, { onDelete: "cascade" }),
  machineId: text("machine_id").notNull(),
  hostname: text("hostname"),
  activatedAt: timestamp("activated_at").notNull().defaultNow(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});

export const insertActivationSchema = createInsertSchema(activations).omit({
  id: true,
  activatedAt: true,
  lastSeen: true,
});

export type InsertActivation = z.infer<typeof insertActivationSchema>;
export type Activation = typeof activations.$inferSelect;

// =============================================================================
// REFERRAL SYSTEM
// =============================================================================

// Referral program configuration
export const REFERRAL_CONFIG = {
  rewardPercentage: 10,       // 10% of referred customer's payments
  expirationMonths: 36,       // Referral rewards expire after 36 months (NOT lifetime)
  minPayoutAmount: 50,        // Minimum $50 to request payout
};

// Referrers table (users who refer others)
export const referrers = pgTable("referrers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  referralCode: varchar("referral_code").notNull().unique().default(sql`'REF-' || upper(substr(md5(random()::text), 1, 8))`),
  stripeConnectAccountId: text("stripe_connect_account_id"), // For payouts via Stripe Connect
  totalEarnings: integer("total_earnings").notNull().default(0), // In cents
  pendingPayout: integer("pending_payout").notNull().default(0), // In cents
  status: text("status").notNull().default("active"), // active, suspended, banned
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferrerSchema = createInsertSchema(referrers).omit({
  id: true,
  referralCode: true,
  totalEarnings: true,
  pendingPayout: true,
  createdAt: true,
});

export type InsertReferrer = z.infer<typeof insertReferrerSchema>;
export type Referrer = typeof referrers.$inferSelect;

// Referrals table (tracking referred customers)
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => referrers.id),
  referredEmail: text("referred_email").notNull(),
  referredCustomerId: text("referred_customer_id"), // Stripe customer ID
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull().default("pending"), // pending, active, cancelled, expired
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // 36 months from creation - HARD LIMIT
  convertedAt: timestamp("converted_at"), // When they became a paying customer
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type Referral = typeof referrals.$inferSelect;

// Referral rewards table (tracking individual reward payments)
export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralId: varchar("referral_id").notNull().references(() => referrals.id),
  referrerId: varchar("referrer_id").notNull().references(() => referrers.id),
  stripeInvoiceId: text("stripe_invoice_id").notNull(),
  invoiceAmount: integer("invoice_amount").notNull(), // Original invoice amount in cents
  rewardAmount: integer("reward_amount").notNull(), // 10% reward in cents
  status: text("status").notNull().default("pending"), // pending, paid, expired
  createdAt: timestamp("created_at").notNull().defaultNow(),
  paidAt: timestamp("paid_at"),
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).omit({
  id: true,
  createdAt: true,
});

export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;

// =============================================================================
// HRM AI - AGENT MANAGEMENT SYSTEM
// =============================================================================

// Agent roles - predefined AI employee types
export const AGENT_ROLES = {
  devops: {
    name: "DevOps Engineer",
    description: "Handles deployments, CI/CD, and infrastructure automation",
    capabilities: ["deploy", "rollback", "scale", "monitor"],
  },
  security: {
    name: "Security Analyst",
    description: "Monitors threats, manages patches, and enforces compliance",
    capabilities: ["audit", "patch", "firewall", "scan"],
  },
  database: {
    name: "Database Administrator",
    description: "Manages backups, optimization, and database migrations",
    capabilities: ["backup", "restore", "optimize", "migrate"],
  },
  network: {
    name: "Network Engineer",
    description: "Configures networking, load balancing, and DNS",
    capabilities: ["configure", "route", "dns", "loadbalance"],
  },
  support: {
    name: "Support Agent",
    description: "Handles monitoring alerts and first-response troubleshooting",
    capabilities: ["respond", "escalate", "diagnose", "report"],
  },
} as const;

export type AgentRole = keyof typeof AGENT_ROLES;

// Agent statuses
export type AgentStatus = "idle" | "working" | "paused" | "error" | "terminated";

// Agents table - AI employees in your fleet
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  licenseId: varchar("license_id").notNull().references(() => licenses.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Human-readable name like "DeployBot-1"
  role: text("role").notNull(), // devops, security, database, network, support
  status: text("status").notNull().default("idle"), // idle, working, paused, error, terminated
  assignedServerId: varchar("assigned_server_id"), // Which server/activation this agent manages
  lastTaskId: varchar("last_task_id"), // Reference to last executed task
  lastTaskStatus: text("last_task_status"), // success, failed, running
  lastActiveAt: timestamp("last_active_at"),
  config: text("config"), // JSON string for agent-specific configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Agent tasks - work history for agents
export const agentTasks = pgTable("agent_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agentId: varchar("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  command: text("command").notNull(), // Natural language command
  resolvedCommand: text("resolved_command"), // Actual shell/API command executed
  status: text("status").notNull().default("pending"), // pending, running, success, failed, cancelled
  output: text("output"), // Command output or error message
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAgentTaskSchema = createInsertSchema(agentTasks).omit({
  id: true,
  createdAt: true,
});

export type InsertAgentTask = z.infer<typeof insertAgentTaskSchema>;
export type AgentTask = typeof agentTasks.$inferSelect;

// Plan feature flags for HRM AI
export const HRM_PLAN_ACCESS: Record<string, boolean> = {
  core: false,      // No HRM access
  pro: false,       // No HRM access
  team: true,       // HRM enabled - up to 10 agents
  enterprise: true, // HRM enabled - unlimited agents
};

export const HRM_AGENT_LIMITS: Record<string, number> = {
  core: 0,
  pro: 0,
  team: 10,
  enterprise: 9999,
};
