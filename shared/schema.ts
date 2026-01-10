import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
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
