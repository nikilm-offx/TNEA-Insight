/**
 * DigiLocker Authentication Routes
 * Implements OAuth 2.0 flow and certificate verification endpoints
 */

import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import {
  generateAuthorizationUrl,
  exchangeCodeForToken,
  getUserInfo,
  storeToken,
  getStoredToken,
  generateStateToken,
  verifyStateToken,
  createAadhaarHash,
  revokeToken as revokeStoredToken,
} from "./oauth";
import {
  retrieveCertificates,
  getCertificateDetails,
  extractMetadata,
  mapDocumentType,
  generateMetadataHash,
  storeCertificateVerification,
  updateCertificateVerificationStatus,
  getUserCertifications,
  checkRequiredCertificates,
  isCertificateExpired,
  validateDigitalSignature,
} from "./certificates";
import {
  performEligibilityCheck,
  storeEligibilityResult,
  getLatestEligibilityResult,
} from "./eligibility";
import { db } from "../db";
import { users, auditLogs } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// Middleware to require authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * POST /api/auth/digilocker/authorize
 * Initiates DigiLocker OAuth flow
 */
router.post("/api/auth/digilocker/authorize", requireAuth, (req: Request, res: Response) => {
  try {
    const state = generateStateToken();
    // Store state in session for CSRF protection
    (req.session as any).digiLockerState = state;

    const authUrl = generateAuthorizationUrl(state);
    res.json({ authUrl, state });
  } catch (error) {
    console.error("Authorization error:", error);
    res.status(500).json({ error: "Authorization failed" });
  }
});

/**
 * GET /api/auth/digilocker/callback
 * OAuth callback handler
 */
router.get("/api/auth/digilocker/callback", async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state parameter" });
    }

    // Verify CSRF token
    const sessionData = req.session as any;
    if (!sessionData.digiLockerState || !verifyStateToken(state as string, sessionData.digiLockerState)) {
      delete sessionData.digiLockerState;
      return res.status(403).json({ error: "CSRF validation failed" });
    }

    delete sessionData.digiLockerState;

    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Session expired" });
    }

    // Exchange code for token
    const tokenResponse = await exchangeCodeForToken(code as string);
    if (!tokenResponse) {
      return res.status(400).json({ error: "Failed to exchange code for token" });
    }

    // Get user info from DigiLocker
    // Note: In real implementation, validate and extract Aadhaar hash
    const aadhaarHash = createAadhaarHash(`${req.user.id}:${Date.now()}`); // Placeholder
    const digiLockerUserId = `digi_${req.user.id}`;

    // Store token securely
    const stored = await storeToken(req.user.id, tokenResponse, digiLockerUserId, aadhaarHash);

    if (stored) {
      await logAudit(req.user?.id, "digilocker_authenticated", "digilocker_auth", req.user.id, 200);
      res.redirect(`/dashboard?digilocker_success=true`);
    } else {
      res.status(500).json({ error: "Failed to store authentication token" });
    }
  } catch (error) {
    console.error("Callback error:", error);
    res.status(500).json({ error: "Callback processing failed" });
  }
});

/**
 * POST /api/certificates/retrieve
 * Retrieve certificates from DigiLocker
 */
router.post("/api/certificates/retrieve", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get stored access token
    const tokenData = await getStoredToken(req.user.id);
    if (!tokenData) {
      return res.status(401).json({ error: "DigiLocker authentication required" });
    }

    // Retrieve certificates from DigiLocker
    const certificates = await retrieveCertificates(tokenData.access_token);
    if (!certificates) {
      return res.status(500).json({ error: "Failed to retrieve certificates" });
    }

    // Process and store each certificate
    const results = [];
    for (const cert of certificates) {
      const docType = mapDocumentType(cert.docType);
      if (!docType) continue;

      const metadata = extractMetadata(cert, docType);
      const certId = await storeCertificateVerification(req.user.id, cert, docType, metadata);

      if (certId) {
        results.push({
          id: certId,
          type: docType,
          issuer: cert.issuerName,
          status: "pending_verification",
        });
      }
    }

    res.json({
      success: true,
      certificatesRetrieved: results.length,
      certificates: results,
    });
  } catch (error) {
    console.error("Certificate retrieval error:", error);
    res.status(500).json({ error: "Certificate retrieval failed" });
  }
});

/**
 * GET /api/certificates/status
 * Get user's certificate verification status
 */
router.get("/api/certificates/status", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const certs = await getUserCertifications(req.user.id);
    const required = await checkRequiredCertificates(req.user.id);

    const summary = {
      totalRetrieved: certs.length,
      verified: certs.filter((c) => c.verificationStatus === "verified").length,
      pending: certs.filter((c) => c.verificationStatus === "pending").length,
      rejected: certs.filter((c) => c.verificationStatus === "rejected").length,
    };

    res.json({
      summary,
      requiredDocuments: required,
      certificates: certs.map((c) => ({
        id: c.id,
        type: c.documentType,
        status: c.verificationStatus,
        issuer: c.issuerName,
        verifiedAt: c.verifiedAt,
      })),
    });
  } catch (error) {
    console.error("Get certificate status error:", error);
    res.status(500).json({ error: "Failed to get certificate status" });
  }
});

/**
 * POST /api/eligibility/check
 * Perform eligibility check
 */
router.post("/api/eligibility/check", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { studentMarks, category, nativeState, income } = req.body;

    if (!studentMarks || !category || !nativeState) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Perform eligibility check
    const checkResult = await performEligibilityCheck(req.user.id, studentMarks, category, nativeState, income || 0);

    if (!checkResult) {
      return res.status(500).json({ error: "Eligibility check failed" });
    }

    // Store result
    const resultId = await storeEligibilityResult(req.user.id, checkResult, checkResult.cutoffMarks);

    await logAudit(req.user?.id, "eligibility_checked", "eligibility_result", resultId || null, 200);

    res.json({
      success: true,
      resultId,
      ...checkResult,
    });
  } catch (error) {
    console.error("Eligibility check error:", error);
    res.status(500).json({ error: "Eligibility check failed" });
  }
});

/**
 * GET /api/eligibility/status
 * Get latest eligibility status
 */
router.get("/api/eligibility/status", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const result = await getLatestEligibilityResult(req.user.id);

    if (!result) {
      return res.status(404).json({ error: "No eligibility result found" });
    }

    res.json(result);
  } catch (error) {
    console.error("Get eligibility status error:", error);
    res.status(500).json({ error: "Failed to get eligibility status" });
  }
});

/**
 * POST /api/auth/digilocker/logout
 * Revoke DigiLocker token
 */
router.post("/api/auth/digilocker/logout", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const revoked = await revokeStoredToken(req.user.id);

    if (revoked) {
      res.json({ success: true, message: "DigiLocker token revoked" });
    } else {
      res.status(500).json({ error: "Failed to revoke token" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

/**
 * GET /api/verification/complete-status
 * Get complete verification status (all checks)
 */
router.get("/api/verification/complete-status", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "User not found" });
    }

    const certs = await getUserCertifications(req.user.id);
    const eligibility = await getLatestEligibilityResult(req.user.id);

    const status = {
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        email: req.user.email,
      },
      certificates: {
        total: certs.length,
        verified: certs.filter((c) => c.verificationStatus === "verified").length,
        byType: certs.reduce(
          (acc, c) => ({
            ...acc,
            [c.documentType]: {
              status: c.verificationStatus,
              issuer: c.issuerName,
            },
          }),
          {}
        ),
      },
      eligibility: eligibility
        ? {
            overallStatus: eligibility.overallStatus,
            categoryValidation: eligibility.categoryValidation,
            nativeValidation: eligibility.nativeValidation,
            incomeValidation: eligibility.incomeValidation,
            cutoffStatus: eligibility.cutoffStatus,
            eligibilityPercentage: eligibility.eligibilityPercentage,
            remarks: eligibility.remarks,
          }
        : null,
      lastUpdated: new Date().toISOString(),
    };

    res.json(status);
  } catch (error) {
    console.error("Get complete status error:", error);
    res.status(500).json({ error: "Failed to get verification status" });
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
