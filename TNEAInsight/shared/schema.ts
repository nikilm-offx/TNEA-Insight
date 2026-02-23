import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with role support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // "student" or "admin"
  fullName: text("full_name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Colleges table
export const colleges = pgTable("colleges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  location: text("location").notNull(),
  type: text("type").notNull(), // "government", "private", etc.
  established: integer("established"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Branches/Courses table
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(), // "engineering", "arts", "science"
  duration: integer("duration").notNull().default(4), // years
});

// College branches - many to many relationship
export const collegeBranches = pgTable("college_branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collegeId: varchar("college_id").notNull().references(() => colleges.id),
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  totalSeats: integer("total_seats").notNull(),
  generalSeats: integer("general_seats").notNull(),
  obcSeats: integer("obc_seats").notNull(),
  scSeats: integer("sc_seats").notNull(),
  stSeats: integer("st_seats").notNull(),
});

// Historical cutoff data
export const cutoffHistory = pgTable("cutoff_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collegeId: varchar("college_id").notNull().references(() => colleges.id),
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  year: integer("year").notNull(),
  round: integer("round").notNull().default(1),
  generalCutoff: real("general_cutoff"),
  obcCutoff: real("obc_cutoff"),
  scCutoff: real("sc_cutoff"),
  stCutoff: real("st_cutoff"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student applications
export const applications = pgTable("applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  applicationNumber: text("application_number").notNull().unique(),
  marks: real("marks").notNull(),
  category: text("category").notNull(), // "general", "obc", "sc", "st"
  status: text("status").notNull().default("submitted"), // "submitted", "verified", "rejected"
  documents: jsonb("documents"), // JSON array of uploaded documents
  verificationNotes: text("verification_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Historical placement records
export const placements = pgTable("placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  studentMarks: real("student_marks").notNull(),
  category: text("category").notNull(),
  collegeId: varchar("college_id").notNull().references(() => colleges.id),
  branchId: varchar("branch_id").notNull().references(() => branches.id),
  round: integer("round").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat messages for AI assistant
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  response: text("response").notNull(),
  language: text("language").notNull().default("en"), // "en" or "ta"
  createdAt: timestamp("created_at").defaultNow(),
});

// DigiLocker OAuth Tokens table
export const digiLockerTokens = pgTable("digilocker_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  tokenType: text("token_type").notNull().default("Bearer"),
  expiresAt: timestamp("expires_at").notNull(),
  aadhaarHash: text("aadhaar_hash"), // SHA-256 hash of Aadhaar
  digiLockerUserId: text("digilocker_user_id"), // DigiLocker's unique identifier
  issuedAt: timestamp("issued_at").defaultNow(),
  lastRefreshedAt: timestamp("last_refreshed_at"),
  isActive: boolean("is_active").notNull().default(true),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Certificate Verifications table
export const certificateVerifications = pgTable(
  "certificate_verifications",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    documentType: text("document_type").notNull(), // "10th_marksheet", "12th_marksheet", "community_certificate", "nativity_certificate", "income_certificate"
    documentId: text("document_id").notNull(),
    issuerName: text("issuer_name").notNull(),
    issueDate: timestamp("issue_date"),
    expiryDate: timestamp("expiry_date"),
    studentName: text("student_name"),
    category: text("category"), // "general", "obc", "sc", "st"
    marks: real("marks"), // for marksheets
    metadataHash: text("metadata_hash").notNull(), // SHA-256 of metadata
    digitalSignature: text("digital_signature"), // Encrypted signature
    verificationStatus: text("verification_status").notNull().default("pending"), // "pending", "verified", "rejected", "expired"
    signatureValidation: boolean("signature_validation"),
    matchedWithProfile: boolean("matched_with_profile"),
    verificationNotes: text("verification_notes"),
    retrievedAt: timestamp("retrieved_at"),
    verifiedAt: timestamp("verified_at"),
    rawMetadata: jsonb("raw_metadata"), // Encrypted metadata for audit
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_user_cert_verification").on(table.userId),
    index("idx_cert_document_type").on(table.documentType),
  ]
);

// Eligibility Results table
export const eligibilityResults = pgTable(
  "eligibility_results",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    cutoffStatus: text("cutoff_status").notNull(), // "eligible", "border", "ineligible"
    cutoffMarks: real("cutoff_marks"),
    categoryValidation: text("category_validation").notNull().default("pending"), // "valid", "invalid", "pending"
    nativeValidation: text("native_validation").notNull().default("pending"), // "valid", "invalid", "pending"
    incomeValidation: text("income_validation").notNull().default("pending"), // "valid", "invalid", "pending"
    communityValidation: text("community_validation").notNull().default("pending"), // "valid", "invalid", "pending"
    overallStatus: text("overall_status").notNull().default("pending"), // "eligible", "needs_review", "rejected"
    eligibilityPercentage: real("eligibility_percentage"),
    remarks: text("remarks"),
    mismatches: jsonb("mismatches"), // Array of mismatched fields
    adminNotes: text("admin_notes"),
    reviewedBy: varchar("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    lastUpdatedBy: varchar("last_updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("idx_user_eligibility").on(table.userId)]
);

// Verification Policies - configurable rules
export const verificationPolicies = pgTable("verification_policies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  policyName: text("policy_name").notNull(),
  policyYear: integer("policy_year").notNull(),
  ruleType: text("rule_type").notNull(), // "cutoff", "category", "nativity", "income"
  conditions: jsonb("conditions").notNull(), // JSON configuration of rules
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs for compliance and security
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id),
    action: text("action").notNull(), // "certificate_retrieved", "verification_completed", "eligibility_checked", etc.
    resource: text("resource").notNull(), // "certificate", "eligibility", "token", etc.
    resourceId: text("resource_id"),
    statusCode: integer("status_code"),
    details: jsonb("details"), // Additional context
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    severity: text("severity").notNull().default("info"), // "info", "warning", "critical"
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("idx_audit_user").on(table.userId),
    index("idx_audit_action").on(table.action),
    index("idx_audit_created").on(table.createdAt),
  ]
);

// Admin Flags and Overrides
export const adminFlags = pgTable(
  "admin_flags",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => users.id),
    flagType: text("flag_type").notNull(), // "manual_review", "data_mismatch", "fraud_alert", "pending_approval"
    flagStatus: text("flag_status").notNull().default("active"), // "active", "resolved", "dismissed"
    severity: text("severity").notNull().default("medium"), // "low", "medium", "high", "critical"
    flaggedBy: varchar("flagged_by").notNull().references(() => users.id),
    description: text("description"),
    resolutionNotes: text("resolution_notes"),
    resolvedBy: varchar("resolved_by").references(() => users.id),
    resolvedAt: timestamp("resolved_at"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("idx_flag_user").on(table.userId),
    index("idx_flag_status").on(table.flagStatus),
  ]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  chatMessages: many(chatMessages),
}));

export const collegesRelations = relations(colleges, ({ many }) => ({
  collegeBranches: many(collegeBranches),
  cutoffHistory: many(cutoffHistory),
  placements: many(placements),
}));

export const branchesRelations = relations(branches, ({ many }) => ({
  collegeBranches: many(collegeBranches),
  cutoffHistory: many(cutoffHistory),
  placements: many(placements),
}));

export const collegeBranchesRelations = relations(collegeBranches, ({ one }) => ({
  college: one(colleges, {
    fields: [collegeBranches.collegeId],
    references: [colleges.id],
  }),
  branch: one(branches, {
    fields: [collegeBranches.branchId],
    references: [branches.id],
  }),
}));

export const cutoffHistoryRelations = relations(cutoffHistory, ({ one }) => ({
  college: one(colleges, {
    fields: [cutoffHistory.collegeId],
    references: [colleges.id],
  }),
  branch: one(branches, {
    fields: [cutoffHistory.branchId],
    references: [branches.id],
  }),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const placementsRelations = relations(placements, ({ one }) => ({
  college: one(colleges, {
    fields: [placements.collegeId],
    references: [colleges.id],
  }),
  branch: one(branches, {
    fields: [placements.branchId],
    references: [branches.id],
  }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const digiLockerTokensRelations = relations(digiLockerTokens, ({ one }) => ({
  user: one(users, {
    fields: [digiLockerTokens.userId],
    references: [users.id],
  }),
}));

export const certificateVerificationsRelations = relations(certificateVerifications, ({ one }) => ({
  user: one(users, {
    fields: [certificateVerifications.userId],
    references: [users.id],
  }),
}));

export const eligibilityResultsRelations = relations(eligibilityResults, ({ one }) => ({
  user: one(users, {
    fields: [eligibilityResults.userId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [eligibilityResults.reviewedBy],
    references: [users.id],
    relationName: "reviewedByUser",
  }),
  lastUpdatedByUser: one(users, {
    fields: [eligibilityResults.lastUpdatedBy],
    references: [users.id],
    relationName: "lastUpdatedByUser",
  }),
}));

export const verificationPoliciesRelations = relations(verificationPolicies, ({ one }) => ({
  createdByUser: one(users, {
    fields: [verificationPolicies.createdBy],
    references: [users.id],
    relationName: "createdByUser",
  }),
  approvedByUser: one(users, {
    fields: [verificationPolicies.approvedBy],
    references: [users.id],
    relationName: "approvedByUser",
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const adminFlagsRelations = relations(adminFlags, ({ one }) => ({
  user: one(users, {
    fields: [adminFlags.userId],
    references: [users.id],
  }),
  flaggedByUser: one(users, {
    fields: [adminFlags.flaggedBy],
    references: [users.id],
    relationName: "flaggedByUser",
  }),
  resolvedByUser: one(users, {
    fields: [adminFlags.resolvedBy],
    references: [users.id],
    relationName: "resolvedByUser",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  fullName: true,
  email: true,
});

export const insertCollegeSchema = createInsertSchema(colleges).omit({
  id: true,
  createdAt: true,
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCutoffHistorySchema = createInsertSchema(cutoffHistory).omit({
  id: true,
  createdAt: true,
});

export const insertPlacementSchema = createInsertSchema(placements).omit({
  id: true,
  createdAt: true,
});

export const insertDigiLockerTokenSchema = createInsertSchema(digiLockerTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateVerificationSchema = createInsertSchema(certificateVerifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEligibilityResultSchema = createInsertSchema(eligibilityResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVerificationPolicySchema = createInsertSchema(verificationPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertAdminFlagSchema = createInsertSchema(adminFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type College = typeof colleges.$inferSelect;
export type Branch = typeof branches.$inferSelect;
export type CollegeBranch = typeof collegeBranches.$inferSelect;
export type CutoffHistory = typeof cutoffHistory.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type Placement = typeof placements.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type DigiLockerToken = typeof digiLockerTokens.$inferSelect;
export type CertificateVerification = typeof certificateVerifications.$inferSelect;
export type EligibilityResult = typeof eligibilityResults.$inferSelect;
export type VerificationPolicy = typeof verificationPolicies.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type AdminFlag = typeof adminFlags.$inferSelect;
export type InsertDigiLockerToken = z.infer<typeof insertDigiLockerTokenSchema>;
export type InsertCertificateVerification = z.infer<typeof insertCertificateVerificationSchema>;
export type InsertEligibilityResult = z.infer<typeof insertEligibilityResultSchema>;
export type InsertVerificationPolicy = z.infer<typeof insertVerificationPolicySchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertAdminFlag = z.infer<typeof insertAdminFlagSchema>;
