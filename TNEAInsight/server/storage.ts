// Blueprint: javascript_database and javascript_auth_all_persistance integrations
import { 
  users, 
  colleges,
  branches,
  collegeBranches,
  cutoffHistory,
  applications,
  placements,
  chatMessages,
  type User, 
  type InsertUser,
  type College,
  type Branch,
  type Application,
  type Placement,
  type ChatMessage
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { randomUUID } from "crypto";
// import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

const NO_DB = !process.env.DATABASE_URL;

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // College and branch data
  getAllColleges(): Promise<College[]>;
  getAllBranches(): Promise<Branch[]>;
  getCollegeSuggestions(marks: number, category: string, branchPreference?: string): Promise<any[]>;
  
  // Historical data
  getPlacementHistory(limit?: number): Promise<any[]>;
  getCutoffHistory(collegeId?: string, branchId?: string): Promise<any[]>;
  
  // Applications
  createApplication(application: any): Promise<Application>;
  getApplicationsByUser(userId: string): Promise<Application[]>;
  getAllApplications(): Promise<any[]>;
  
  // Chat functionality
  saveChatMessage(message: any): Promise<ChatMessage>;
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;
  
  // Session store for authentication
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  // In NO_DB mode we keep a tiny in-memory store with demo users so the UI demo login works
  private _users: User[] = [];

  constructor() {
    if (NO_DB) {
      // Do not use Postgres session store when no DB is configured — fall back to default MemoryStore
      this.sessionStore = undefined;

      // Seed demo users (passwords are plain-text for the fallback and handled by auth compare)
      this._users = [
        {
          id: "demo-admin-id",
          username: "admin",
          password: "admin123" as unknown as string,
          role: "admin",
          fullName: "TNEA Administrator",
          email: "admin@tnea.gov.in",
          createdAt: new Date() as any,
        } as User,
        {
          id: "demo-student-id",
          username: "student_demo",
          password: "student123" as unknown as string,
          role: "student",
          fullName: "Demo Student",
          email: "demo@student.com",
          createdAt: new Date() as any,
        } as User,
      ];
      return;
    }

    this.sessionStore = new PostgresSessionStore({ 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    if (NO_DB) {
      return this._users.find((u) => u.id === id) as User | undefined;
    }

    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (NO_DB) {
      return this._users.find((u) => u.username === username) as User | undefined;
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (NO_DB) {
      const newUser: any = {
        id: randomUUID(),
        ...insertUser,
        createdAt: new Date(),
      };
      this._users.push(newUser as User);
      return newUser as User;
    }

    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllColleges(): Promise<College[]> {
    if (NO_DB) return [];
    return await db.select().from(colleges).orderBy(asc(colleges.name));
  }

  async getAllBranches(): Promise<Branch[]> {
    if (NO_DB) return [];
    return await db.select().from(branches).orderBy(asc(branches.name));
  }

  async getCollegeSuggestions(marks: number, category: string, branchPreference?: string): Promise<any[]> {
    if (NO_DB) return [];

    // Get colleges with their cutoff data and calculate match scores
    const query = db
      .select({
        id: colleges.id,
        name: colleges.name,
        location: colleges.location,
        branchName: branches.name,
        branchCode: branches.code,
        cutoff: cutoffHistory.generalCutoff, // Simplified for now
        seats: collegeBranches.totalSeats,
      })
      .from(colleges)
      .innerJoin(collegeBranches, eq(colleges.id, collegeBranches.collegeId))
      .innerJoin(branches, eq(collegeBranches.branchId, branches.id))
      .leftJoin(cutoffHistory, and(
        eq(cutoffHistory.collegeId, colleges.id),
        eq(cutoffHistory.branchId, branches.id),
        eq(cutoffHistory.year, 2023) // Latest year
      ))
      .orderBy(asc(colleges.name));

    const results = await query;
    
    // Calculate match scores based on marks vs cutoff
    return results.map((result: any) => ({
      ...result,
      matchScore: result.cutoff ? Math.min(95, Math.max(0, ((marks / result.cutoff) * 100) - 5)) : 85
    })).filter((r: any) => r.matchScore > 50).slice(0, 10);
  }

  async getPlacementHistory(limit: number = 10): Promise<any[]> {
    if (NO_DB) return [];

    return await db
      .select({
        year: placements.year,
        studentMarks: placements.studentMarks,
        category: placements.category,
        collegeName: colleges.name,
        branchName: branches.name,
        round: placements.round,
      })
      .from(placements)
      .innerJoin(colleges, eq(placements.collegeId, colleges.id))
      .innerJoin(branches, eq(placements.branchId, branches.id))
      .orderBy(desc(placements.year), desc(placements.studentMarks))
      .limit(limit);
  }

  async getCutoffHistory(collegeId?: string, branchId?: string): Promise<any[]> {
    if (NO_DB) return [];

    let conditions = [];
    if (collegeId) {
      conditions.push(eq(cutoffHistory.collegeId, collegeId));
    }
    if (branchId) {
      conditions.push(eq(cutoffHistory.branchId, branchId));
    }

    let query = db
      .select({
        year: cutoffHistory.year,
        round: cutoffHistory.round,
        generalCutoff: cutoffHistory.generalCutoff,
        obcCutoff: cutoffHistory.obcCutoff,
        scCutoff: cutoffHistory.scCutoff,
        stCutoff: cutoffHistory.stCutoff,
        collegeName: colleges.name,
        branchName: branches.name,
      })
      .from(cutoffHistory)
      .innerJoin(colleges, eq(cutoffHistory.collegeId, colleges.id))
      .innerJoin(branches, eq(cutoffHistory.branchId, branches.id));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(cutoffHistory.year), desc(cutoffHistory.round));
  }

  async createApplication(application: any): Promise<Application> {
    if (NO_DB) {
      const newApp: any = { id: randomUUID(), ...application, createdAt: new Date() };
      return newApp as Application;
    }

    const [newApp] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApp;
  }

  async getApplicationsByUser(userId: string): Promise<Application[]> {
    if (NO_DB) return [];

    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
  }

  async getAllApplications(): Promise<any[]> {
    if (NO_DB) return [];

    return await db
      .select({
        id: applications.id,
        applicationNumber: applications.applicationNumber,
        marks: applications.marks,
        category: applications.category,
        status: applications.status,
        createdAt: applications.createdAt,
        username: users.username,
        fullName: users.fullName,
      })
      .from(applications)
      .innerJoin(users, eq(applications.userId, users.id))
      .orderBy(desc(applications.createdAt));
  }

  async saveChatMessage(message: any): Promise<ChatMessage> {
    if (NO_DB) {
      const saved: any = { id: randomUUID(), ...message, createdAt: new Date() };
      return saved as ChatMessage;
    }

    const [saved] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return saved;
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    if (NO_DB) return [];

    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();

