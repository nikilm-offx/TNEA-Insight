/**
 * Eligibility Engine
 * Implements rule-based verification for cutoff, category, nativity, and income
 * Configurable policy system for yearly updates
 */

import { db } from "../db";
import {
  eligibilityResults,
  certificateVerifications,
  verificationPolicies,
  auditLogs,
} from "../../shared/schema";
import { eq, and } from "drizzle-orm";

export interface EligibilityCheck {
  cutoffStatus: "eligible" | "border" | "ineligible";
  cutoffMarks: number;
  categoryValidation: "valid" | "invalid" | "pending";
  nativeValidation: "valid" | "invalid" | "pending";
  incomeValidation: "valid" | "invalid" | "pending";
  communityValidation: "valid" | "invalid" | "pending";
  overallStatus: "eligible" | "needs_review" | "rejected";
  eligibilityPercentage: number;
  mismatches: string[];
  remarks: string;
}

export interface VerificationPolicyConfig {
  type: "cutoff" | "category" | "nativity" | "income";
  minCutoff?: number;
  maxCutoff?: number;
  approvedCategories?: string[];
  nativeStateCode?: string;
  minIncome?: number;
  maxIncome?: number;
  conditions?: Record<string, any>;
}

/**
 * Load active verification policies for a given year
 */
export async function loadPoliciesForYear(year: number): Promise<VerificationPolicyConfig[]> {
  try {
    const policies = await db.query.verificationPolicies.findMany({
      where: and(eq(verificationPolicies.policyYear, year), eq(verificationPolicies.isActive, true)),
    });

    return policies.map((p: any) => ({
      type: p.ruleType as "cutoff" | "category" | "nativity" | "income",
      ...p.conditions,
    }));
  } catch (error) {
    console.error("Load policies error:", error);
    return [];
  }
}

/**
 * Validate cutoff eligibility
 */
export function validateCutoff(
  studentMarks: number,
  category: string,
  policies: VerificationPolicyConfig[]
): { status: "eligible" | "border" | "ineligible"; cutoffMarks: number; remarks: string } {
  const cutoffPolicy = policies.find((p) => p.type === "cutoff");

  if (!cutoffPolicy) {
    return {
      status: "eligible",
      cutoffMarks: 0,
      remarks: "No cutoff policy defined",
    };
  }

  const categoryKey = `${category}_cutoff`;
  const cutoffMarks = (cutoffPolicy.conditions as Record<string, any>)?.[categoryKey] || 0;

  const borderMargin = 2; // 2 marks margin for border cases
  const remarks = [];

  if (studentMarks >= cutoffMarks) {
    remarks.push(`Marks ${studentMarks} >= Cutoff ${cutoffMarks}`);
    return {
      status: "eligible",
      cutoffMarks,
      remarks: remarks.join("; "),
    };
  } else if (studentMarks >= cutoffMarks - borderMargin) {
    remarks.push(`Marks ${studentMarks} within border range (${cutoffMarks - borderMargin}-${cutoffMarks})`);
    return {
      status: "border",
      cutoffMarks,
      remarks: remarks.join("; "),
    };
  } else {
    remarks.push(`Marks ${studentMarks} < Cutoff ${cutoffMarks}`);
    return {
      status: "ineligible",
      cutoffMarks,
      remarks: remarks.join("; "),
    };
  }
}

/**
 * Validate category (SC/ST/OBC/General)
 */
export async function validateCategory(
  userId: string,
  claimedCategory: string,
  policies: VerificationPolicyConfig[]
): Promise<{ status: "valid" | "invalid" | "pending"; remarks: string }> {
  try {
    // Get community certificate
    const communityCert = await db.query.certificateVerifications.findFirst({
      where: and(
        eq(certificateVerifications.userId, userId),
        eq(certificateVerifications.documentType, "community_certificate")
      ),
    });

    if (!communityCert || communityCert.verificationStatus !== "verified") {
      return {
        status: "pending",
        remarks: "Community certificate not verified",
      };
    }

    const certCategory = communityCert.category;
    const categoryPolicy = policies.find((p) => p.type === "category");

    if (!certCategory) {
      return {
        status: "pending",
        remarks: "Certificate category not extracted",
      };
    }

    if (certCategory === claimedCategory) {
      return {
        status: "valid",
        remarks: `Category ${certCategory} matches claim`,
      };
    } else {
      return {
        status: "invalid",
        remarks: `Claimed ${claimedCategory}, but certificate shows ${certCategory}`,
      };
    }
  } catch (error) {
    console.error("Validate category error:", error);
    return {
      status: "pending",
      remarks: "Error validating category",
    };
  }
}

/**
 * Validate nativity
 */
export async function validateNativity(
  userId: string,
  claimedState: string,
  policies: VerificationPolicyConfig[]
): Promise<{ status: "valid" | "invalid" | "pending"; remarks: string }> {
  try {
    // Get nativity certificate
    const nativitCert = await db.query.certificateVerifications.findFirst({
      where: and(
        eq(certificateVerifications.userId, userId),
        eq(certificateVerifications.documentType, "nativity_certificate")
      ),
    });

    if (!nativitCert || nativitCert.verificationStatus !== "verified") {
      return {
        status: "pending",
        remarks: "Nativity certificate not verified",
      };
    }

    const nativePolicy = policies.find((p) => p.type === "nativity");
    const templateState = nativePolicy?.nativeStateCode || "TN"; // Default to Tamil Nadu

    // Parse certificate metadata to extract state
    const metadata = nativitCert.rawMetadata as Record<string, any>;
    const certState = metadata?.state || "";

    if (!certState) {
      return {
        status: "pending",
        remarks: "Certificate state not extracted",
      };
    }

    if (certState === templateState) {
      return {
        status: "valid",
        remarks: `Nativity verified for ${templateState}`,
      };
    } else {
      return {
        status: "invalid",
        remarks: `Certificate issued from ${certState}, application state is ${templateState}`,
      };
    }
  } catch (error) {
    console.error("Validate nativity error:", error);
    return {
      status: "pending",
      remarks: "Error validating nativity",
    };
  }
}

/**
 * Validate income for scholarship eligibility
 */
export async function validateIncome(
  userId: string,
  declaredIncome: number,
  policies: VerificationPolicyConfig[]
): Promise<{ status: "valid" | "invalid" | "pending"; remarks: string }> {
  try {
    // Get income certificate
    const incomeCert = await db.query.certificateVerifications.findFirst({
      where: and(
        eq(certificateVerifications.userId, userId),
        eq(certificateVerifications.documentType, "income_certificate")
      ),
    });

    if (!incomeCert || incomeCert.verificationStatus !== "verified") {
      return {
        status: "pending",
        remarks: "Income certificate not verified",
      };
    }

    const incomePolicy = policies.find((p) => p.type === "income");
    const maxIncome = incomePolicy?.maxIncome || 800000; // Default max income in INR

    const metadata = incomeCert.rawMetadata as Record<string, any>;
    const certIncome = metadata?.annualIncome || 0;

    if (Math.abs(certIncome - declaredIncome) > 50000) {
      // Allow 50k variance
      return {
        status: "invalid",
        remarks: `Income mismatch: Certificate shows ${certIncome}, declared ${declaredIncome}`,
      };
    }

    if (certIncome <= maxIncome) {
      return {
        status: "valid",
        remarks: `Income ${certIncome} is within limit of ${maxIncome}`,
      };
    } else {
      return {
        status: "invalid",
        remarks: `Income ${certIncome} exceeds limit of ${maxIncome}`,
      };
    }
  } catch (error) {
    console.error("Validate income error:", error);
    return {
      status: "pending",
      remarks: "Error validating income",
    };
  }
}

/**
 * Perform complete eligibility check
 */
export async function performEligibilityCheck(
  userId: string,
  studentMarks: number,
  category: string,
  nativeState: string,
  income: number,
  year: number = new Date().getFullYear()
): Promise<EligibilityCheck | null> {
  try {
    // Load policies
    const policies = await loadPoliciesForYear(year);

    // Perform validation checks
    const cutoffResult = validateCutoff(studentMarks, category, policies);
    const categoryResult = await validateCategory(userId, category, policies);
    const nativeResult = await validateNativity(userId, nativeState, policies);
    const incomeResult = await validateIncome(userId, income, policies);

    const mismatches: string[] = [];
    let eligibilityScore = 0;
    const totalChecks = 4;

    // Calculate eligibility
    if (categoryResult.status === "invalid") {
      mismatches.push(`Category mismatch: ${categoryResult.remarks}`);
    } else if (categoryResult.status === "valid") {
      eligibilityScore++;
    }

    if (nativeResult.status === "invalid") {
      mismatches.push(`Nativity mismatch: ${nativeResult.remarks}`);
    } else if (nativeResult.status === "valid") {
      eligibilityScore++;
    }

    if (incomeResult.status === "invalid") {
      mismatches.push(`Income mismatch: ${incomeResult.remarks}`);
    } else if (incomeResult.status === "valid") {
      eligibilityScore++;
    }

    if (cutoffResult.status === "eligible") {
      eligibilityScore++;
    } else if (cutoffResult.status === "border") {
      eligibilityScore += 0.5;
    }

    // Determine overall status
    let overallStatus: "eligible" | "needs_review" | "rejected" = "eligible";
    if (mismatches.length > 0 || eligibilityScore < 3) {
      overallStatus = "needs_review";
    }
    if (cutoffResult.status === "ineligible" && mismatches.length > 1) {
      overallStatus = "rejected";
    }

    const eligibilityPercentage = (eligibilityScore / totalChecks) * 100;

    return {
      cutoffStatus: cutoffResult.status,
      cutoffMarks: cutoffResult.cutoffMarks,
      categoryValidation: categoryResult.status,
      nativeValidation: nativeResult.status,
      incomeValidation: incomeResult.status,
      communityValidation: categoryResult.status, // Use category validation for community
      overallStatus,
      eligibilityPercentage,
      mismatches,
      remarks: [
        cutoffResult.remarks,
        categoryResult.remarks,
        nativeResult.remarks,
        incomeResult.remarks,
      ]
        .filter((r) => r)
        .join(" | "),
    };
  } catch (error) {
    console.error("Eligibility check error:", error);
    return null;
  }
}

/**
 * Store eligibility result in database
 */
export async function storeEligibilityResult(
  userId: string,
  checkResult: EligibilityCheck,
  cutoffMarks: number,
  adminNotes: string = ""
): Promise<string | null> {
  try {
    const result = await db
      .insert(eligibilityResults)
      .values({
        userId,
        cutoffStatus: checkResult.cutoffStatus,
        cutoffMarks,
        categoryValidation: checkResult.categoryValidation,
        nativeValidation: checkResult.nativeValidation,
        incomeValidation: checkResult.incomeValidation,
        communityValidation: checkResult.communityValidation,
        overallStatus: checkResult.overallStatus,
        eligibilityPercentage: checkResult.eligibilityPercentage,
        remarks: checkResult.remarks,
        mismatches: checkResult.mismatches,
        adminNotes,
      })
      .returning({ id: eligibilityResults.id });

    if (result && result.length > 0) {
      await logAudit(userId, "eligibility_checked", "eligibility_result", result[0].id, 200, {
        overallStatus: checkResult.overallStatus,
      });

      return result[0].id;
    }

    return null;
  } catch (error) {
    console.error("Store eligibility result error:", error);
    return null;
  }
}

/**
 * Get latest eligibility result for user
 */
export async function getLatestEligibilityResult(userId: string): Promise<any | null> {
  try {
    const result = await db.query.eligibilityResults.findFirst({
      where: eq(eligibilityResults.userId, userId),
      orderBy: (t: any) => t.createdAt,
    });

    return result || null;
  } catch (error) {
    console.error("Get eligibility result error:", error);
    return null;
  }
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
