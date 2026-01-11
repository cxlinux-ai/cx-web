import { type User, type InsertUser, type HackathonRegistration, type InsertHackathonRegistration, users, hackathonRegistrations } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createHackathonRegistration(registration: InsertHackathonRegistration): Promise<HackathonRegistration>;
  getHackathonRegistrationByEmail(email: string): Promise<HackathonRegistration | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async createHackathonRegistration(registration: InsertHackathonRegistration): Promise<HackathonRegistration> {
    const result = await db.insert(hackathonRegistrations).values({
      name: registration.name,
      email: registration.email.toLowerCase(),
      phone: registration.phone || null,
    }).returning();
    return result[0];
  }

  async getHackathonRegistrationByEmail(email: string): Promise<HackathonRegistration | undefined> {
    const result = await db
      .select()
      .from(hackathonRegistrations)
      .where(eq(hackathonRegistrations.email, email.toLowerCase()))
      .limit(1);
    return result[0];
  }
}

export const storage = new DatabaseStorage();
