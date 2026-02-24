import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// USERS
// ============================================
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

// ============================================
// GITHUB CONTRIBUTOR (for API response typing)
// ============================================
export const contributorSchema = z.object({
  login: z.string(),
  avatar_url: z.string(),
  html_url: z.string(),
  contributions: z.number(),
});

export type Contributor = z.infer<typeof contributorSchema>;

// ============================================
// STRIPE TABLES
// ============================================
export const stripeCustomers = pgTable("stripe_customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name"),
  company: text("company"),
  userId: text("user_id"),
  metadata: text("metadata"),
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

export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  customerId: varchar("customer_id").notNull().references(() => stripeCustomers.id),
  stripePriceId: text("stripe_price_id"),
  status: text("status").notNull(),
  priceId: text("price_id"),
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

export const stripePayments = pgTable("stripe_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  customerId: varchar("customer_id").references(() => stripeCustomers.id),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("usd"),
  status: text("status").notNull(),
  description: text("description"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

export const insertStripePaymentSchema = createInsertSchema(stripePayments).omit({
  id: true,
  createdAt: true,
});

export type InsertStripePayment = z.infer<typeof insertStripePaymentSchema>;
export type StripePayment = typeof stripePayments.$inferSelect;

export const stripeRefunds = pgTable("stripe_refunds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeRefundId: text("stripe_refund_id").notNull().unique(),
  paymentId: varchar("payment_id").references(() => stripePayments.id),
  amount: integer("amount").notNull(),
  status: text("status"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStripeRefundSchema = createInsertSchema(stripeRefunds).omit({
  id: true,
  createdAt: true,
});

export type InsertStripeRefund = z.infer<typeof insertStripeRefundSchema>;
export type StripeRefund = typeof stripeRefunds.$inferSelect;

export const stripeDisputes = pgTable("stripe_disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeDisputeId: text("stripe_dispute_id").notNull().unique(),
  paymentId: varchar("payment_id").references(() => stripePayments.id),
  paymentIntentId: text("payment_intent_id"),
  chargeId: text("charge_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").default("usd"),
  reason: text("reason"),
  status: text("status").notNull(),
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

export const stripeInvoicePayments = pgTable("stripe_invoice_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stripeInvoiceId: text("stripe_invoice_id").notNull().unique(),
  customerId: varchar("customer_id").references(() => stripeCustomers.id),
  subscriptionId: varchar("subscription_id").references(() => stripeSubscriptions.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("usd"),
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
