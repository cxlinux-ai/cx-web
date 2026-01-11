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
