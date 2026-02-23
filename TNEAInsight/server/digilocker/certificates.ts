/**
 * Certificate Retrieval and Validation Service
 * Handles API calls to DigiLocker for certificate retrieval
 * Implements digital signature validation
 */

import crypto from "crypto";
import { db } from "../db";
import { certificateVerifications, auditLogs } from "../../shared/schema";
import { eq } from "drizzle-orm";

const DIGILOCKER_API_BASE = "https://api.digitallocker.gov.in/public/v2/";

export type DocumentType = "10th_marksheet" | "12th_marksheet" | "community_certificate" | "nativity_certificate" | "income_certificate";

export interface DigiLockerCertificate {
  id: string;
  docType: string;
  docName: string;
  issuerName: string;
  issueDate: string;
  expiryDate?: string;
  issuedTo?: string;
  category?: string;
  marks?: number;
  metadata?: Record<string, any>;
  signature?: string;
}

export interface CertificateMetadata {
  documentId: string;
  documentType: DocumentType;
  issuerName: string;
  issueDate: Date | null;
  expiryDate: Date | null;
  studentName: string | null;
  category: string | null;
  marks: number | null;
}

/**
 * Map DigiLocker document types to our schema
 */
export function mapDocumentType(docType: string): DocumentType | null {
  const mapping: Record<string, DocumentType> = {
    "10th_marksheet": "10th_marksheet",
    "12th_marksheet": "12th_marksheet",
    "community_certificate": "community_certificate",
    "nativity_certificate": "nativity_certificate",
    "income_certificate": "income_certificate",
  };

  return mapping[docType] || null;
}

/**
 * Retrieve certificates from DigiLocker API
 */
export async function retrieveCertificates(accessToken: string): Promise<DigiLockerCertificate[] | null> {
  try {
    const response = await fetch(`${DIGILOCKER_API_BASE}documents`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Certificate retrieval failed:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.certificates || data;
  } catch (error) {
    console.error("Certificate retrieval error:", error);
    return null;
  }
}

/**
 * Retrieve specific certificate details
 */
export async function getCertificateDetails(
  accessToken: string,
  documentId: string
): Promise<DigiLockerCertificate | null> {
  try {
    const response = await fetch(`${DIGILOCKER_API_BASE}documents/${documentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Certificate details fetch failed:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Certificate details error:", error);
    return null;
  }
}

/**
 * Extract metadata from certificate
 */
export function extractMetadata(certificate: DigiLockerCertificate, documentType: DocumentType): CertificateMetadata {
  return {
    documentId: certificate.id,
    documentType,
    issuerName: certificate.issuerName || "",
    issueDate: certificate.issueDate ? new Date(certificate.issueDate) : null,
    expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate) : null,
    studentName: certificate.issuedTo || null,
    category: certificate.category || null,
    marks: certificate.marks || null,
  };
}

/**
 * Validate digital signature of certificate
 */
export async function validateDigitalSignature(
  data: Record<string, any>,
  signature: string,
  issuerPublicKey: string
): Promise<boolean> {
  try {
    const dataString = JSON.stringify(data);
    const verifier = crypto.createVerify("sha256");
    verifier.update(dataString);

    const signatureBuffer = Buffer.from(signature, "base64");
    const publicKeyBuffer = Buffer.from(issuerPublicKey, "base64");

    return verifier.verify(publicKeyBuffer, signatureBuffer);
  } catch (error) {
    console.error("Signature validation error:", error);
    return false;
  }
}

/**
 * Generate metadata hash for integrity verification
 */
export function generateMetadataHash(metadata: CertificateMetadata): string {
  const hashInput = JSON.stringify({
    documentId: metadata.documentId,
    documentType: metadata.documentType,
    issuerName: metadata.issuerName,
    issueDate: metadata.issueDate?.toISOString(),
    studentName: metadata.studentName,
    marks: metadata.marks,
  });

  return crypto.createHash("sha256").update(hashInput).digest("hex");
}

/**
 * Store certificate verification in database
 */
export async function storeCertificateVerification(
  userId: string,
  certificate: DigiLockerCertificate,
  documentType: DocumentType,
  metadata: CertificateMetadata,
  signatureValid: boolean = false
): Promise<string | null> {
  try {
    const metadataHash = generateMetadataHash(metadata);

    const result = await db
      .insert(certificateVerifications)
      .values({
        userId,
        documentType,
        documentId: certificate.id,
        issuerName: certificate.issuerName,
        issueDate: metadata.issueDate || undefined,
        expiryDate: metadata.expiryDate || undefined,
        studentName: metadata.studentName || undefined,
        category: metadata.category || undefined,
        marks: metadata.marks || undefined,
        metadataHash,
        verificationStatus: "pending",
        signatureValidation: signatureValid,
        retrievedAt: new Date(),
        rawMetadata: JSON.parse(JSON.stringify(metadata)),
      })
      .returning({ id: certificateVerifications.id });

    if (result && result.length > 0) {
      await logAudit(
        userId,
        "certificate_retrieved",
        "certificate",
        result[0].id,
        200,
        {
          documentType,
          issuerName: certificate.issuerName,
          signatureValid,
        }
      );

      return result[0].id;
    }

    return null;
  } catch (error) {
    console.error("Store certificate verification error:", error);
    return null;
  }
}

/**
 * Update certificate verification status
 */
export async function updateCertificateVerificationStatus(
  certificationId: string,
  verificationStatus: "verified" | "rejected" | "expired" | "pending",
  isMatched: boolean = false,
  notes: string = ""
): Promise<boolean> {
  try {
    await db
      .update(certificateVerifications)
      .set({
        verificationStatus,
        matchedWithProfile: isMatched,
        verificationNotes: notes,
        verifiedAt: new Date(),
      })
      .where(eq(certificateVerifications.id, certificationId));

    await logAudit(
      null,
      `certificate_${verificationStatus}`,
      "certificate",
      certificationId,
      200,
      { isMatched, notes }
    );

    return true;
  } catch (error) {
    console.error("Update certificate status error:", error);
    return false;
  }
}

/**
 * Get user's certificate verifications
 */
export async function getUserCertifications(userId: string): Promise<any[]> {
  try {
    return await db.query.certificateVerifications.findMany({
      where: eq(certificateVerifications.userId, userId),
    });
  } catch (error) {
    console.error("Get user certifications error:", error);
    return [];
  }
}

/**
 * Check if all required certificates are retrieved
 */
export async function checkRequiredCertificates(userId: string): Promise<Record<DocumentType, boolean>> {
  try {
    const certs = await getUserCertifications(userId);
    const required: DocumentType[] = [
      "10th_marksheet",
      "12th_marksheet",
      "community_certificate",
      "nativity_certificate",
    ];

    const result: Record<DocumentType, boolean> = {
      "10th_marksheet": false,
      "12th_marksheet": false,
      "community_certificate": false,
      "nativity_certificate": false,
      "income_certificate": false,
    };

    certs.forEach((cert) => {
      if (cert.verificationStatus === "verified" && cert.documentType in result) {
        result[cert.documentType as DocumentType] = true;
      }
    });

    return result;
  } catch (error) {
    console.error("Check required certificates error:", error);
    return {
      "10th_marksheet": false,
      "12th_marksheet": false,
      "community_certificate": false,
      "nativity_certificate": false,
      "income_certificate": false,
    };
  }
}

/**
 * Validate certificate expiry
 */
export function isCertificateExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return false;
  return new Date() > expiryDate;
}

/**
 * Audit logging
 */
async function logAudit(
  userId: string | null,
  action: string,
  resource: string,
  resourceId: string | null,
  statusCode: number = 200,
  details?: Record<string, any>
): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: userId || undefined,
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
