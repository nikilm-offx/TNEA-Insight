/**
 * WebSocket Real-time Updates Service
 * Enables live dashboard updates for admin and student verification status
 */

import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { db } from "./db";
import { eligibilityResults, certificateVerifications, adminFlags } from "../shared/schema";
import { eq } from "drizzle-orm";

let io: SocketIOServer | null = null;

export function initializeWebSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Middleware for authentication
  io.use((socket: Socket, next: (err?: Error) => void) => {
    const user = (socket.handshake as any).user;
    if (!user) {
      next(new Error("Authentication error"));
    } else {
      next();
    }
  });

  // Connection handling
  io.on("connection", (socket: Socket) => {
    const userId = (socket.handshake as any).user?.id;
    const userRole = (socket.handshake as any).user?.role;

    console.log(`User ${userId} connected via WebSocket`);

    // Join user-specific room
    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined room user:${userId}`);
    }

    // Admin joins admin dashboard
    if (userRole === "admin" || userRole === "super_admin") {
      socket.join("admin:dashboard");
      console.log(`Admin ${userId} joined admin:dashboard`);

      // Send initial stats
      emitAdminDashboardStats();
    }

    // Handle certificate verification subscription
    socket.on("subscribe:certificates", (studentId: string) => {
      if (userRole === "admin" || userRole === "super_admin") {
        socket.join(`admin:student:${studentId}`);
        console.log(`Admin subscribed to student ${studentId} certificates`);
      }
    });

    // Handle eligibility subscription
    socket.on("subscribe:eligibility", (studentId: string) => {
      if (userRole === "admin" || userRole === "super_admin") {
        socket.join(`admin:eligibility:${studentId}`);
        console.log(`Admin subscribed to student ${studentId} eligibility`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  // Periodically emit dashboard stats (every 10 seconds)
  setInterval(() => {
    if (io) {
      emitAdminDashboardStats();
    }
  }, 10000);

  return io;
}

/**
 * Broadcast certificate update to relevant clients
 */
export async function broadcastCertificateUpdate(
  userId: string,
  certId: string,
  status: string
): Promise<void> {
  if (!io) return;

  const cert = await db.query.certificateVerifications.findFirst({
    where: eq(certificateVerifications.id, certId),
  });

  if (!cert) return;

  // Notify student
  io.to(`user:${userId}`).emit("certificate:updated", {
    certificateId: certId,
    type: cert.documentType,
    status: cert.verificationStatus,
    issuer: cert.issuerName,
    verifiedAt: cert.verifiedAt,
    timestamp: new Date().toISOString(),
  });

  // Notify admin
  io.to("admin:dashboard").emit("certificate:updated", {
    userId,
    certificateId: certId,
    status: cert.verificationStatus,
    timestamp: new Date().toISOString(),
  });

  io.to(`admin:student:${userId}`).emit("student:certificate-updated", {
    certificateId: certId,
    type: cert.documentType,
    status: cert.verificationStatus,
  });
}

/**
 * Broadcast eligibility result update
 */
export async function broadcastEligibilityUpdate(userId: string): Promise<void> {
  if (!io) return;

  const eligibility = await db.query.eligibilityResults.findFirst({
    where: eq(eligibilityResults.userId, userId),
  });

  if (!eligibility) return;

  const updateData = {
    userId,
    overallStatus: eligibility.overallStatus,
    eligibilityPercentage: eligibility.eligibilityPercentage,
    cutoffStatus: eligibility.cutoffStatus,
    categoryValidation: eligibility.categoryValidation,
    nativeValidation: eligibility.nativeValidation,
    incomeValidation: eligibility.incomeValidation,
    timestamp: new Date().toISOString(),
  };

  // Notify student
  io.to(`user:${userId}`).emit("eligibility:updated", {
    ...updateData,
    remarks: eligibility.remarks,
    mismatches: eligibility.mismatches,
  });

  // Notify admin
  io.to("admin:dashboard").emit("eligibility:updated", updateData);

  io.to(`admin:eligibility:${userId}`).emit("student:eligibility-updated", updateData);
}

/**
 * Broadcast admin flag updates
 */
export async function broadcastFlagUpdate(
  userId: string,
  flagId: string,
  action: "created" | "resolved"
): Promise<void> {
  if (!io) return;

  const flag = await db.query.adminFlags.findFirst({
    where: eq(adminFlags.id, flagId),
  });

  if (!flag) return;

  const flagData = {
    flagId,
    userId,
    flagType: flag.flagType,
    severity: flag.severity,
    status: flag.flagStatus,
    timestamp: new Date().toISOString(),
  };

  // Notify student (if applicable)
  io.to(`user:${userId}`).emit("flag:updated", {
    ...flagData,
    description: flag.description,
  });

  // Notify admins
  io.to("admin:dashboard").emit("flag:updated", {
    ...flagData,
    action,
  });
}

/**
 * Emit admin dashboard statistics
 */
async function emitAdminDashboardStats(): Promise<void> {
  if (!io) return;

  try {
    const eligibilityStats = await db.query.eligibilityResults.findMany({});
    const activeFlags = await db.query.adminFlags.findMany({});

    const eligible = eligibilityStats.filter((e: any) => e.overallStatus === "eligible").length;
    const needsReview = eligibilityStats.filter((e: any) => e.overallStatus === "needs_review").length;
    const rejected = eligibilityStats.filter((e: any) => e.overallStatus === "rejected").length;
    const totalStudents = eligibilityStats.length > 0 ? eligibilityStats.length : 0;

    const stats = {
      timestamp: new Date().toISOString(),
      students: {
        total: totalStudents,
      },
      eligibility: {
        total: eligibilityStats.length,
        eligible,
        needsReview,
        rejected,
        pending: 0,
      },
      flags: {
        active: activeFlags.filter((f: any) => f.flagStatus === "active").length,
        critical: activeFlags.filter((f: any) => f.severity === "critical").length,
        high: activeFlags.filter((f: any) => f.severity === "high").length,
      },
    };

    io.to("admin:dashboard").emit("dashboard:stats-updated", stats);
  } catch (error) {
    console.error("Error emitting dashboard stats:", error);
  }
}

/**
 * Notify admin of new events
 */
export function notifyAdminEvent(
  event: "new_verification" | "flag_raised" | "approval_needed" | "document_rejected",
  data: Record<string, any>
): void {
  if (!io) return;

  io.to("admin:dashboard").emit("event:admin-notification", {
    event,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Send real-time notification to student
 */
export function notifyStudent(userId: string, notification: Record<string, any>): void {
  if (!io) return;

  io.to(`user:${userId}`).emit("notification:new", {
    ...notification,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Broadcast system-wide event
 */
export function broadcastSystemEvent(event: string, data: Record<string, any>): void {
  if (!io) return;

  io.emit("event:system", {
    event,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get connected clients count
 */
export function getConnectedCount(): number {
  if (!io) return 0;
  return io.engine.clientsCount;
}

/**
 * Get room members count
 */
export function getRoomMembersCount(room: string): number {
  if (!io) return 0;
  const sockets = io.sockets.adapter.rooms.get(room);
  return sockets?.size || 0;
}

export default { initializeWebSocket };
