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

// Hackathon Registration - Extended with comprehensive fields
export const hackathonRegistrations = pgTable("hackathon_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").default(""),
  email: text("email").notNull().unique(),
  country: text("country"),
  currentRole: text("current_role"),
  organization: text("organization"),
  githubUrl: text("github_url").default(""),
  linkedinUrl: text("linkedin_url"),
  linuxExperience: integer("linux_experience"),
  aiMlExperience: integer("ai_ml_experience"),
  programmingLanguages: text("programming_languages"),
  teamOrSolo: text("team_or_solo"),
  teamName: text("team_name"),
  phaseParticipation: text("phase_participation"), // phase1, phase2, or both
  projectIdea: text("project_idea"),
  usedCortexBefore: text("used_cortex_before"),
  howHeardAboutUs: text("how_heard_about_us"),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
  // Legacy fields for backward compatibility
  name: text("name"),
  phone: text("phone"),
});

// Insert schema with comprehensive validation
export const insertHackathonRegistrationSchema = createInsertSchema(hackathonRegistrations)
  .omit({ id: true, registeredAt: true })
  .extend({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    country: z.string().optional(),
    currentRole: z.enum(["Student", "Professional", "Indie Hacker", "Other"]).optional(),
    organization: z.string().optional(),
    githubUrl: z.string()
      .min(1, "GitHub URL is required")
      .refine(
        (url) => url.startsWith("https://github.com/") || url.startsWith("github.com/") || /^[a-zA-Z0-9_-]+$/.test(url),
        "Please enter a valid GitHub URL or username"
      ),
    linkedinUrl: z.string().optional(),
    linuxExperience: z.number().min(1).max(5).optional(),
    aiMlExperience: z.number().min(1).max(5).optional(),
    programmingLanguages: z.string().optional(),
    teamOrSolo: z.enum(["team", "solo"]).optional(),
    teamName: z.string().optional(),
    phaseParticipation: z.enum(["phase1", "phase2", "both"]).optional(),
    projectIdea: z.string().optional(),
    usedCortexBefore: z.enum(["yes", "no", "whats_that"]).optional(),
    howHeardAboutUs: z.enum(["Twitter", "GitHub", "Discord", "Friend", "Other"]).optional(),
  });

// Full registration schema for new comprehensive form
export const fullHackathonRegistrationSchema = z.object({
  // Section 1: Personal Info
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  discordUsername: z.string().min(2, "Discord username is required"),
  country: z.string().optional(),
  organization: z.string().optional(),
  // Section 2: Technical Background
  githubUrl: z.string()
    .min(1, "GitHub URL is required")
    .refine(
      (url) => url.startsWith("https://github.com/") || url.startsWith("github.com/") || /^[a-zA-Z0-9_-]+$/.test(url),
      "Please enter a valid GitHub URL or username"
    ),
  linkedinUrl: z.string().optional(),
  technicalRole: z.string().min(1, "Please select your technical role"),
  technicalRoleOther: z.string().optional(),
  programmingLanguages: z.array(z.string()).min(1, "Select at least one programming language"),
  linuxExperience: z.number().min(1).max(5),
  aiMlExperience: z.number().min(1).max(5),
  // Section 3: Participation
  phaseParticipation: z.enum(["phase1", "phase2", "both"]),
  teamOrSolo: z.enum(["team", "solo"]),
  teamName: z.string().optional(),
  // Section 4: Motivations
  whyJoinHackathon: z.array(z.string()).min(1, "Please select at least one reason"),
  whyJoinOther: z.string().optional(),
  cortexAreaInterest: z.string().min(1, "Please select an area of interest"),
  // Section 5: Vision (Optional)
  whatExcitesYou: z.string().optional(),
  contributionPlan: z.string().optional(),
  // Section 6: Beyond Hackathon (Optional)
  postHackathonInvolvement: z.array(z.string()).optional(),
  threeYearVision: z.string().optional(),
});

export type InsertHackathonRegistration = z.infer<typeof insertHackathonRegistrationSchema>;
export type FullHackathonRegistration = z.infer<typeof fullHackathonRegistrationSchema>;
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

// ==========================================
// VIRAL REFERRAL SYSTEM
// ==========================================

/**
 * Waitlist Entries - Early access signups with referral tracking
 * Each entry gets a unique referral code and position in line
 */
export const waitlistEntries = pgTable("waitlist_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  verificationToken: text("verification_token"),
  verificationExpires: timestamp("verification_expires"),

  // Referral tracking
  referralCode: text("referral_code").notNull().unique(),
  referredByCode: text("referred_by_code"), // The code that referred this user

  // Position tracking (updated dynamically based on referrals)
  originalPosition: integer("original_position").notNull(),
  currentPosition: integer("current_position").notNull(),

  // OAuth connections (bonus perks)
  githubUsername: text("github_username"),
  githubConnected: boolean("github_connected").default(false),
  githubId: text("github_id"), // GitHub user ID for PR verification
  githubAccessToken: text("github_access_token"), // Encrypted OAuth token
  twitterUsername: text("twitter_username"),
  twitterConnected: boolean("twitter_connected").default(false),

  // Discord verification (required for referral to count)
  discordId: text("discord_id"),
  discordUsername: text("discord_username"),
  discordConnected: boolean("discord_connected").default(false),
  discordAccessToken: text("discord_access_token"), // Encrypted OAuth token
  discordJoinedServer: boolean("discord_joined_server").default(false),
  discordAcceptedRules: boolean("discord_accepted_rules").default(false),
  discordVerifiedAt: timestamp("discord_verified_at"),

  // GitHub contribution tracking (required for referral to count)
  prCompleted: boolean("pr_completed").default(false),
  prCount: integer("pr_count").default(0),
  firstPrUrl: text("first_pr_url"),
  firstPrMergedAt: timestamp("first_pr_merged_at"),

  // Hackathon participation (alternative to PR for referral verification)
  hackathonParticipated: boolean("hackathon_participated").default(false),
  hackathonId: varchar("hackathon_id").references(() => hackathonRegistrations.id),

  // Full verification status (discord_verified && (pr_completed || hackathon_participated))
  fullyVerified: boolean("fully_verified").default(false),
  fullyVerifiedAt: timestamp("fully_verified_at"),

  // Stats
  totalReferrals: integer("total_referrals").default(0),
  verifiedReferrals: integer("verified_referrals").default(0), // Only fully verified referrals count

  // Tier/rewards tracking
  currentTier: text("current_tier").default("none"), // none, bronze, silver, gold, platinum, diamond, legendary
  rewardsUnlocked: text("rewards_unlocked").default("[]"), // JSON array of reward IDs

  // Ambassador status (20+ referrals)
  isAmbassador: boolean("is_ambassador").default(false),
  ambassadorSince: timestamp("ambassador_since"),
  featuredOnContributors: boolean("featured_on_contributors").default(false),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWaitlistEntrySchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  referredByCode: true,
  githubUsername: true,
  twitterUsername: true,
});

export type InsertWaitlistEntry = z.infer<typeof insertWaitlistEntrySchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;

/**
 * Referral Events - Track all referral actions and conversions
 */
export const referralEvents = pgTable("referral_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referralCode: text("referral_code").notNull(), // The code that generated this event
  eventType: text("event_type").notNull(), // click, signup, verified, installed, shared

  // Event metadata
  source: text("source"), // twitter, linkedin, email, direct, github_badge, install_share
  referredEmail: text("referred_email"), // Only filled after signup
  ipAddress: text("ip_address"), // For rate limiting and fraud detection
  userAgent: text("user_agent"),

  // Conversion tracking
  convertedToSignup: boolean("converted_to_signup").default(false),
  convertedToVerified: boolean("converted_to_verified").default(false),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReferralEventSchema = createInsertSchema(referralEvents).pick({
  referralCode: true,
  eventType: true,
  source: true,
  referredEmail: true,
  ipAddress: true,
  userAgent: true,
});

export type InsertReferralEvent = z.infer<typeof insertReferralEventSchema>;
export type ReferralEvent = typeof referralEvents.$inferSelect;

/**
 * Rewards - Define available rewards and their requirements
 */
export const referralRewards = pgTable("referral_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tier: text("tier").notNull(), // bronze, silver, gold, platinum, diamond
  referralsRequired: integer("referrals_required").notNull(),
  positionBoost: integer("position_boost").default(0), // How many spots to move up

  // Reward details
  rewardType: text("reward_type").notNull(), // position_boost, discord_role, pro_month, badge, hackathon_perk
  rewardValue: text("reward_value"), // Additional details (e.g., role name, months, badge ID)

  // Display
  iconEmoji: text("icon_emoji"),
  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;

/**
 * User Rewards - Track which rewards each user has earned/claimed
 */
export const userRewards = pgTable("user_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  waitlistEntryId: varchar("waitlist_entry_id").references(() => waitlistEntries.id).notNull(),
  rewardId: varchar("reward_id").references(() => referralRewards.id).notNull(),

  earnedAt: timestamp("earned_at").notNull().defaultNow(),
  claimedAt: timestamp("claimed_at"),
  isClaimed: boolean("is_claimed").default(false),
});

export type UserReward = typeof userRewards.$inferSelect;

/**
 * Shareable Content - Track viral shares (install cards, command shares, etc.)
 */
export const shareableContent = pgTable("shareable_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  waitlistEntryId: varchar("waitlist_entry_id").references(() => waitlistEntries.id),

  contentType: text("content_type").notNull(), // waitlist_card, install_success, command_share, github_badge
  contentData: text("content_data"), // JSON with type-specific data

  // OG image generation
  ogImageUrl: text("og_image_url"),
  ogImageGenerated: boolean("og_image_generated").default(false),

  // Tracking
  shareCount: integer("share_count").default(0),
  clickCount: integer("click_count").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ShareableContent = typeof shareableContent.$inferSelect;

/**
 * Builder Referrals - Hackathon-specific referral tracking
 */
export const builderReferrals = pgTable("builder_referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerWaitlistId: varchar("referrer_waitlist_id").references(() => waitlistEntries.id).notNull(),

  // Builder being referred
  builderEmail: text("builder_email").notNull(),
  builderName: text("builder_name"),

  // Hackathon tracking
  hackathonRegistrationId: varchar("hackathon_registration_id").references(() => hackathonRegistrations.id),
  teamName: text("team_name"),
  projectSubmitted: boolean("project_submitted").default(false),

  // Status
  status: text("status").default("invited"), // invited, registered, submitted

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBuilderReferralSchema = createInsertSchema(builderReferrals).pick({
  referrerWaitlistId: true,
  builderEmail: true,
  builderName: true,
});

export type InsertBuilderReferral = z.infer<typeof insertBuilderReferralSchema>;
export type BuilderReferral = typeof builderReferrals.$inferSelect;

/**
 * Leaderboard Snapshots - Weekly leaderboard data for challenges
 */
export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  periodType: text("period_type").notNull(), // weekly, monthly, all_time
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),

  // Top referrers (JSON array)
  rankings: text("rankings").notNull(), // JSON array of {position, referralCode, displayName, score, isAnonymous}

  // Challenge type (if applicable)
  challengeType: text("challenge_type"), // most_referrals, best_command, most_installs
  challengeName: text("challenge_name"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;

/**
 * GitHub Contributions - Track PRs and contributions for verification
 */
export const githubContributions = pgTable("github_contributions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  waitlistEntryId: varchar("waitlist_entry_id").references(() => waitlistEntries.id).notNull(),

  // PR details
  prNumber: integer("pr_number").notNull(),
  prUrl: text("pr_url").notNull(),
  prTitle: text("pr_title").notNull(),
  repoOwner: text("repo_owner").notNull(), // e.g., "cortexlinux"
  repoName: text("repo_name").notNull(), // e.g., "cortex"

  // Status
  state: text("state").notNull(), // open, closed, merged
  isMerged: boolean("is_merged").default(false),
  mergedAt: timestamp("merged_at"),

  // Verification
  isVerified: boolean("is_verified").default(false), // Manually or automatically verified as legitimate
  verifiedAt: timestamp("verified_at"),
  verifiedBy: text("verified_by"), // "auto" or admin user ID

  // Metadata
  additions: integer("additions").default(0),
  deletions: integer("deletions").default(0),
  changedFiles: integer("changed_files").default(0),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type GitHubContribution = typeof githubContributions.$inferSelect;

/**
 * Discord Verification Events - Track Discord OAuth and server join events
 */
export const discordVerificationEvents = pgTable("discord_verification_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  waitlistEntryId: varchar("waitlist_entry_id").references(() => waitlistEntries.id).notNull(),

  eventType: text("event_type").notNull(), // oauth_started, oauth_completed, server_joined, rules_accepted, verified
  eventData: text("event_data"), // JSON with event-specific data

  // Status
  success: boolean("success").default(false),
  errorMessage: text("error_message"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type DiscordVerificationEvent = typeof discordVerificationEvents.$inferSelect;

/**
 * Fraud Detection - Track suspicious activity
 */
export const fraudDetection = pgTable("fraud_detection", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Associated entities
  waitlistEntryId: varchar("waitlist_entry_id").references(() => waitlistEntries.id),
  referralCode: text("referral_code"),
  ipAddress: text("ip_address"),

  // Detection
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  riskReasons: text("risk_reasons").notNull(), // JSON array of reasons
  riskScore: integer("risk_score").default(0), // 0-100

  // Actions taken
  actionTaken: text("action_taken"), // none, flagged, blocked, manual_review
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type FraudDetection = typeof fraudDetection.$inferSelect;

// Reward tier definitions (used in logic, not in DB)
export const REWARD_TIERS = {
  bronze: {
    referrals: 1,
    positionBoost: 100,
    tier: "bronze",
    badge: "Early Supporter",
    description: "Custom 'Early Supporter' badge",
    icon: "shield",
    color: "#cd7f32",
  },
  silver: {
    referrals: 3,
    positionBoost: 500,
    tier: "silver",
    badge: "Community Builder",
    description: "Access to private Discord channels + early beta features",
    icon: "users",
    color: "#c0c0c0",
    specialReward: "discord_access",
  },
  gold: {
    referrals: 5,
    positionBoost: 0,
    tier: "gold",
    badge: "Pioneer",
    description: "Exclusive swag pack (stickers + future crypto token airdrop)",
    icon: "gift",
    color: "#ffd700",
    specialReward: "swag_pack",
  },
  platinum: {
    referrals: 10,
    positionBoost: 0,
    tier: "platinum",
    badge: "Champion",
    description: "Free month of premium service / AI integrations",
    icon: "crown",
    color: "#e5e4e2",
    specialReward: "pro_month",
  },
  diamond: {
    referrals: 20,
    positionBoost: 0,
    tier: "diamond",
    badge: "Ambassador",
    description: "Featured on contributors page + Cortex 'Ambassador' title",
    icon: "star",
    color: "#b9f2ff",
    specialReward: "ambassador",
  },
  legendary: {
    referrals: 50,
    positionBoost: 0,
    tier: "legendary",
    badge: "Legend",
    description: "Lifetime VIP access + direct line to founders",
    icon: "flame",
    color: "linear-gradient(135deg, #ffd700, #ff6b6b)",
    specialReward: "vip_lifetime",
  },
} as const;

// Verification requirements
export const VERIFICATION_REQUIREMENTS = {
  // Referral only counts if the referred user completes these
  discordRequired: true,
  contributionRequired: true, // Either PR or hackathon

  // Minimum contribution requirements
  minPrAdditions: 10, // At least 10 lines added
  minPrFiles: 1, // At least 1 file changed

  // Anti-fraud thresholds
  maxReferralsPerIp: 5,
  maxReferralsPerDay: 20,
  suspiciousActivityThreshold: 3,
} as const;

/**
 * IP-based Referral Codes - One referral code per IP address
 * No email required - instant referral link generation
 */
export const ipReferralCodes = pgTable("ip_referral_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ipAddress: text("ip_address").notNull().unique(),
  referralCode: text("referral_code").notNull().unique(),
  
  // Browser fingerprint for additional fraud prevention
  userAgent: text("user_agent"),
  fingerprint: text("fingerprint"), // Canvas/WebGL fingerprint hash
  
  // Stats
  totalReferrals: integer("total_referrals").default(0),
  clickCount: integer("click_count").default(0),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastAccessedAt: timestamp("last_accessed_at").notNull().defaultNow(),
});

export type IpReferralCode = typeof ipReferralCodes.$inferSelect;

// Validation schemas for API
export const waitlistSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  referralCode: z.string().optional(),
  githubUsername: z.string().optional(),
  twitterUsername: z.string().optional(),
});

export const referralClickSchema = z.object({
  referralCode: z.string().min(1),
  source: z.string().optional(),
});

export type WaitlistSignup = z.infer<typeof waitlistSignupSchema>;
export type ReferralClick = z.infer<typeof referralClickSchema>;

// ==========================================
// DISCORD BOT - CONVERSATIONS & FEEDBACK
// ==========================================

/**
 * Bot Conversations - Persistent conversation memory
 */
export const botConversations = pgTable("bot_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Discord identifiers
  discordUserId: text("discord_user_id").notNull(),
  discordChannelId: text("discord_channel_id").notNull(),
  discordGuildId: text("discord_guild_id"),

  // Conversation data
  messages: text("messages").notNull().default("[]"), // JSON array of messages
  messageCount: integer("message_count").default(0),

  // Summary for long conversations
  summary: text("summary"),
  lastSummarizedAt: timestamp("last_summarized_at"),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
});

export type BotConversation = typeof botConversations.$inferSelect;

/**
 * Bot Feedback - Track thumbs up/down on responses
 */
export const botFeedback = pgTable("bot_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Discord identifiers
  discordUserId: text("discord_user_id").notNull(),
  discordMessageId: text("discord_message_id").notNull(),

  // The Q&A pair
  question: text("question").notNull(),
  answer: text("answer").notNull(),

  // Feedback
  rating: text("rating").notNull(), // "positive" or "negative"
  feedbackText: text("feedback_text"), // Optional user comment

  // Context
  modelUsed: text("model_used"), // opus, sonnet, haiku
  wasFromCache: boolean("was_from_cache").default(false),

  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BotFeedback = typeof botFeedback.$inferSelect;

/**
 * Bot Analytics - Track usage and performance
 */
export const botAnalytics = pgTable("bot_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),

  // Discord identifiers
  discordUserId: text("discord_user_id").notNull(),
  discordGuildId: text("discord_guild_id"),

  // Request details
  question: text("question").notNull(),
  questionCategory: text("question_category"), // Detected category

  // Response details
  modelUsed: text("model_used").notNull(),
  tokensUsed: integer("tokens_used").default(0),
  responseTimeMs: integer("response_time_ms"),
  wasFromCache: boolean("was_from_cache").default(false),

  // Outcome
  successful: boolean("successful").default(true),
  errorType: text("error_type"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type BotAnalytics = typeof botAnalytics.$inferSelect;
