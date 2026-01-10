import { type User, type InsertUser, type HackathonRegistration, type InsertHackathonRegistration } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createHackathonRegistration(registration: InsertHackathonRegistration): Promise<HackathonRegistration>;
  getHackathonRegistrationByEmail(email: string): Promise<HackathonRegistration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private hackathonRegistrations: Map<string, HackathonRegistration>;

  constructor() {
    this.users = new Map();
    this.hackathonRegistrations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createHackathonRegistration(registration: InsertHackathonRegistration): Promise<HackathonRegistration> {
    const id = randomUUID();
    const newRegistration: HackathonRegistration = {
      ...registration,
      id,
      phone: registration.phone || null,
      registeredAt: new Date().toISOString(),
    };
    this.hackathonRegistrations.set(id, newRegistration);
    return newRegistration;
  }

  async getHackathonRegistrationByEmail(email: string): Promise<HackathonRegistration | undefined> {
    return Array.from(this.hackathonRegistrations.values()).find(
      (reg) => reg.email.toLowerCase() === email.toLowerCase(),
    );
  }
}

export const storage = new MemStorage();
