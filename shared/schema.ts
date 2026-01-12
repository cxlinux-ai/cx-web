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
});

export const insertHackathonRegistrationSchema = createInsertSchema(hackathonRegistrations).pick({
  name: true,
  email: true,
  phone: true,
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
  twitterUsername: text("twitter_username"),
  twitterConnected: boolean("twitter_connected").default(false),

  // Stats
  totalReferrals: integer("total_referrals").default(0),
  verifiedReferrals: integer("verified_referrals").default(0),

  // Tier/rewards tracking
  currentTier: text("current_tier").default("none"), // none, bronze, silver, gold, platinum, diamond
  rewardsUnlocked: text("rewards_unlocked").default("[]"), // JSON array of reward IDs

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

// Reward tier definitions (used in logic, not in DB)
export const REWARD_TIERS = {
  bronze: { referrals: 1, positionBoost: 100, tier: "bronze" },
  silver: { referrals: 3, positionBoost: 500, tier: "silver" },
  gold: { referrals: 5, positionBoost: 0, tier: "gold", specialReward: "discord_role" },
  platinum: { referrals: 10, positionBoost: 0, tier: "platinum", specialReward: "pro_month" },
  diamond: { referrals: 25, positionBoost: 0, tier: "diamond", specialReward: "founding_badge" },
  legendary: { referrals: 50, positionBoost: 0, tier: "legendary", specialReward: "hackathon_fasttrack" },
} as const;

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
