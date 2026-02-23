/**
 * Admin Dashboard Routes
 * Handles administrative verification operations, flags, and approvals
 */

import { Router, Request, Response, NextFunction } from "express";
import {
  certificateVerifications,
  eligibilityResults,
  adminFlags,
  users,
  auditLogs,
} from "../../shared/schema";
import { db } from "../db";
import { eq, and, desc, like } from "drizzle-orm";

const router = Router();

// Middleware to require admin authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "admin" && req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

// Middleware to require super admin
function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required" });
  }

  next();
}

/**
 * GET /api/admin/students
 * Get paginated list of students for verification
 */
router.get("/api/admin/students", requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const offset = (page - 1) * limit;

    let query = db.select().from(users).where(eq(users.role, "student"));

    if (search) {
      query = query.where(like(users.fullName, `%${search}%`));
    }

    const students = await query.limit(limit).offset(offset);

    // Get total count
    const countResult = await db
      .selectDistinct()
      .from(users)
      .where(eq(users.role, "student"));

    // Enhance with verification status
    const enriched = await Promise.all(
      students.map(async (student) => {
        const certs = await db
          .select()
          .from(certificateVerifications)
          .where(eq(certificateVerifications.userId, student.id));

        const eligibility = await db
          .select()
          .from(eligibilityResults)
          .where(eq(eligibilityResults.userId, student.id))
          .orderBy(desc(eligibilityResults.createdAt))
          .limit(1);

        const flags = await db
          .select()
          .from(adminFlags)
          .where(and(eq(adminFlags.userId, student.id), eq(adminFlags.flagStatus, "active")));

        return {
          ...student,
          certificatesCount: certs.length,
          certificatesVerified: certs.filter((c) => c.verificationStatus === "verified").length,
          eligibilityStatus: eligibility[0]?.overallStatus || "pending",
          flags: flags.length,
          flagged: flags.length > 0,
        };
      })
    );

    res.json({
      students: enriched,
      pagination: {
        page,
        limit,
        total: countResult.length,
      },
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

/**
 * GET /api/admin/students/:id/verification-status
 * Get detailed verification status for a student
 */
router.get("/api/admin/students/:id/verification-status", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get student info
    const student = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Get certificates
    const certs = await db.query.certificateVerifications.findMany({
      where: eq(certificateVerifications.userId, id),
    });

    // Get eligibility
    const eligibility = await db.query.eligibilityResults.findFirst({
      where: eq(eligibilityResults.userId, id),
      orderBy: desc(eligibilityResults.createdAt),
    });

    // Get flags
    const activeFlags = await db.query.adminFlags.findMany({
      where: and(eq(adminFlags.userId, id), eq(adminFlags.flagStatus, "active")),
    });

    res.json({
      student: {
        id: student.id,
        username: student.username,
        fullName: student.fullName,
        email: student.email,
        createdAt: student.createdAt,
      },
      certificates: {
        total: certs.length,
        verified: certs.filter((c) => c.verificationStatus === "verified").length,
        pending: certs.filter((c) => c.verificationStatus === "pending").length,
        rejected: certs.filter((c) => c.verificationStatus === "rejected").length,
        list: certs.map((c) => ({
          id: c.id,
          type: c.documentType,
          issuer: c.issuerName,
          status: c.verificationStatus,
          verifiedAt: c.verifiedAt,
          matched: c.matchedWithProfile,
          notes: c.verificationNotes,
        })),
      },
      eligibility: eligibility
        ? {
            id: eligibility.id,
            overallStatus: eligibility.overallStatus,
            cutoffStatus: eligibility.cutoffStatus,
            categoryValidation: eligibility.categoryValidation,
            nativeValidation: eligibility.nativeValidation,
            incomeValidation: eligibility.incomeValidation,
            eligibilityPercentage: eligibility.eligibilityPercentage,
            mismatches: eligibility.mismatches,
            remarks: eligibility.remarks,
            reviewedAt: eligibility.reviewedAt,
            adminNotes: eligibility.adminNotes,
          }
        : null,
      flags: activeFlags.map((f) => ({
        id: f.id,
        type: f.flagType,
        severity: f.severity,
        description: f.description,
        flaggedBy: f.flaggedBy,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({ error: "Failed to fetch verification status" });
  }
});

/**
 * POST /api/admin/certificates/:id/verify
 * Verify a certificate as admin
 */
router.post("/api/admin/certificates/:id/verify", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { matched, notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    await db
      .update(certificateVerifications)
      .set({
        verificationStatus: "verified",
        matchedWithProfile: matched || false,
        verificationNotes: notes || "",
        verifiedAt: new Date(),
      })
      .where(eq(certificateVerifications.id, id));

    await logAudit(req.user.id, "certificate_admin_verified", "certificate", id, 200);

    res.json({ success: true, message: "Certificate verified" });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({ error: "Failed to verify certificate" });
  }
});

/**
 * POST /api/admin/certificates/:id/reject
 * Reject a certificate as admin
 */
router.post("/api/admin/certificates/:id/reject", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    await db
      .update(certificateVerifications)
      .set({
        verificationStatus: "rejected",
        verificationNotes: notes || "",
        verifiedAt: new Date(),
      })
      .where(eq(certificateVerifications.id, id));

    await logAudit(req.user.id, "certificate_admin_rejected", "certificate", id, 200);

    res.json({ success: true, message: "Certificate rejected" });
  } catch (error) {
    console.error("Reject certificate error:", error);
    res.status(500).json({ error: "Failed to reject certificate" });
  }
});

/**
 * POST /api/admin/students/:id/flag
 * Flag a student for manual review
 */
router.post("/api/admin/students/:id/flag", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { flagType, description, severity } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const result = await db
      .insert(adminFlags)
      .values({
        userId: studentId,
        flagType: flagType || "manual_review",
        description: description || "",
        severity: severity || "medium",
        flaggedBy: req.user.id,
        flagStatus: "active",
      })
      .returning({ id: adminFlags.id });

    if (result && result.length > 0) {
      await logAudit(req.user.id, "student_flagged", "admin_flag", result[0].id, 200);

      res.json({
        success: true,
        message: "Student flagged",
        flagId: result[0].id,
      });
    } else {
      res.status(500).json({ error: "Failed to flag student" });
    }
  } catch (error) {
    console.error("Flag student error:", error);
    res.status(500).json({ error: "Failed to flag student" });
  }
});

/**
 * POST /api/admin/flags/:id/resolve
 * Resolve a flag
 */
router.post("/api/admin/flags/:id/resolve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    await db
      .update(adminFlags)
      .set({
        flagStatus: "resolved",
        resolutionNotes: resolutionNotes || "",
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      })
      .where(eq(adminFlags.id, id));

    await logAudit(req.user.id, "flag_resolved", "admin_flag", id, 200);

    res.json({ success: true, message: "Flag resolved" });
  } catch (error) {
    console.error("Resolve flag error:", error);
    res.status(500).json({ error: "Failed to resolve flag" });
  }
});

/**
 * POST /api/admin/students/:id/approve
 * Approve eligibility for a student
 */
router.post("/api/admin/students/:id/approve", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id: studentId } = req.params;
    const { adminNotes } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get latest eligibility result
    const eligibility = await db.query.eligibilityResults.findFirst({
      where: eq(eligibilityResults.userId, studentId),
      orderBy: desc(eligibilityResults.createdAt),
    });

    if (!eligibility) {
      return res.status(404).json({ error: "No eligibility result found" });
    }

    // Update eligibility result
    await db
      .update(eligibilityResults)
      .set({
        overallStatus: "eligible",
        adminNotes: adminNotes || "",
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      })
      .where(eq(eligibilityResults.id, eligibility.id));

    // Resolve any related flags
    await db
      .update(adminFlags)
      .set({
        flagStatus: "resolved",
        resolutionNotes: "Approved by admin",
        resolvedBy: req.user.id,
        resolvedAt: new Date(),
      })
      .where(and(eq(adminFlags.userId, studentId), eq(adminFlags.flagStatus, "active")));

    await logAudit(req.user.id, "student_approved", "student", studentId, 200);

    res.json({ success: true, message: "Student approved for eligibility" });
  } catch (error) {
    console.error("Approve student error:", error);
    res.status(500).json({ error: "Failed to approve student" });
  }
});

/**
 * GET /api/admin/audit-logs
 * Get audit logs for compliance
 */
router.get("/api/admin/audit-logs", requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    const action = (req.query.action as string) || "";

    let query = db.select().from(auditLogs);

    if (action) {
      query = query.where(like(auditLogs.action, `%${action}%`));
    }

    const logs = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db.selectDistinct().from(auditLogs);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total: countResult.length,
      },
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

/**
 * GET /api/admin/dashboard-stats
 * Get dashboard statistics
 */
router.get("/api/admin/dashboard-stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    // Count students
    const totalStudents = await db.select().from(users).where(eq(users.role, "student"));

    // Count eligibility results
    const eligibilityStats = await db.selectDistinct().from(eligibilityResults);

    const eligible = eligibilityStats.filter((e) => e.overallStatus === "eligible").length;
    const needsReview = eligibilityStats.filter((e) => e.overallStatus === "needs_review").length;
    const rejected = eligibilityStats.filter((e) => e.overallStatus === "rejected").length;

    // Count active flags
    const activeFlags = await db
      .select()
      .from(adminFlags)
      .where(eq(adminFlags.flagStatus, "active"));

    // Get recent activities
    const recentLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(10);

    res.json({
      students: {
        total: totalStudents.length,
      },
      eligibility: {
        total: eligibilityStats.length,
        eligible,
        needsReview,
        rejected,
        pending: totalStudents.length - eligibilityStats.length,
      },
      flags: {
        active: activeFlags.length,
        critical: activeFlags.filter((f) => f.severity === "critical").length,
        high: activeFlags.filter((f) => f.severity === "high").length,
      },
      recentActivities: recentLogs.map((log) => ({
        action: log.action,
        resource: log.resource,
        createdAt: log.createdAt,
        severity: log.severity,
      })),
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

/**
 * Audit logging helper
 */
async function logAudit(
  userId: string | null | undefined,
  action: string,
  resource: string,
  resourceId: string | null,
  statusCode: number = 200,
  details?: Record<string, any>
): Promise<void> {
  try {
    if (!userId) return;
    await db.insert(auditLogs).values({
      userId,
      action,
      resource,
      resourceId: resourceId || undefined,
      statusCode,
      details: details || null,
      severity: statusCode >= 400 ? "warning" : "info",
    });
  } catch (error) {
    console.error("Audit logging error:", error);
  }
}

export default router;
