import { type User, type InsertUser, type HackathonRegistration, type InsertHackathonRegistration, type FullHackathonRegistration, users, hackathonRegistrations } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createHackathonRegistration(registration: InsertHackathonRegistration): Promise<HackathonRegistration>;
  createFullRegistration(data: FullHackathonRegistration): Promise<HackathonRegistration>;
  getHackathonRegistrationByEmail(email: string): Promise<HackathonRegistration | undefined>;
  getRegistrationById(id: string): Promise<HackathonRegistration | undefined>;
  checkEmailExists(email: string): Promise<boolean>;
  getAllHackathonRegistrations(): Promise<HackathonRegistration[]>;
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
      fullName: registration.fullName || registration.name || "",
      name: registration.name || registration.fullName,
      email: registration.email.toLowerCase(),
      phone: registration.phone || null,
      githubUrl: registration.githubUrl || "",
    }).returning();
    return result[0];
  }

  async createFullRegistration(data: FullHackathonRegistration): Promise<HackathonRegistration> {
    const result = await db.insert(hackathonRegistrations).values({
      fullName: data.fullName,
      name: data.fullName,
      email: data.email.toLowerCase(),
      country: data.country || null,
      currentRole: data.currentRole,
      organization: data.organization || null,
      githubUrl: data.githubUrl,
      linkedinUrl: data.linkedinUrl || null,
      linuxExperience: data.linuxExperience,
      aiMlExperience: data.aiMlExperience,
      programmingLanguages: JSON.stringify(data.programmingLanguages),
      teamOrSolo: data.teamOrSolo,
      teamName: data.teamOrSolo === "team" ? data.teamName : null,
      projectIdea: data.projectIdea,
      usedCortexBefore: data.usedCortexBefore,
      howHeardAboutUs: data.howHeardAboutUs,
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

  async getRegistrationById(id: string): Promise<HackathonRegistration | undefined> {
    const result = await db
      .select()
      .from(hackathonRegistrations)
      .where(eq(hackathonRegistrations.id, id))
      .limit(1);
    return result[0];
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const result = await db
      .select()
      .from(hackathonRegistrations)
      .where(eq(hackathonRegistrations.email, email.toLowerCase()))
      .limit(1);
    return result.length > 0;
  }

  async getAllHackathonRegistrations(): Promise<HackathonRegistration[]> {
    const result = await db
      .select()
      .from(hackathonRegistrations)
      .orderBy(desc(hackathonRegistrations.registeredAt));
    return result;
  }
}

export const storage = new DatabaseStorage();
