/**
 * DigiLocker OAuth 2.0 Service
 * Handles Aadhaar-linked authentication via DigiLocker
 * Implements secure token management and refresh mechanisms
 */

import crypto from "crypto";
import { db } from "../db";
import { digiLockerTokens, users, auditLogs } from "../../shared/schema";
import { eq, and, lt } from "drizzle-orm";

// Configuration - should be in environment
const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID || "";
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET || "";
const DIGILOCKER_AUTH_URL = "https://api.digitallocker.gov.in/public/oauth2/authorize";
const DIGILOCKER_TOKEN_URL = "https://api.digitallocker.gov.in/public/oauth2/token";
const DIGILOCKER_API_BASE = "https://api.digitallocker.gov.in/public/v2/";
const REDIRECT_URI = process.env.DIGILOCKER_REDIRECT_URI || "http://localhost:5000/api/auth/digilocker/callback";

// Token encryption utilities
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${encrypted}:${authTag.toString("hex")}`;
}

function decryptToken(encryptedToken: string): string | null {
  try {
    const [ivHex, encrypted, authTagHex] = encryptedToken.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      Buffer.from(ENCRYPTION_KEY, "hex"),
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Token decryption failed:", error);
    return null;
  }
}

export interface DigiLockerAuthResponse {
  code: string;
  state: string;
}

export interface DigiLockerTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user_id?: string;
}

export interface DigiLockerUserInfo {
  uid: string;
  name: string;
  phone?: string;
  email?: string;
}

/**
 * Generate OAuth authorization URL
 */
export function generateAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: DIGILOCKER_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: "profile email certificates", // Request certificate access
    state: state,
  });

  return `${DIGILOCKER_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<DigiLockerTokenResponse | null> {
  try {
    const params = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      client_id: DIGILOCKER_CLIENT_ID,
      client_secret: DIGILOCKER_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
    });

    const response = await fetch(DIGILOCKER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error("Token exchange failed:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Token exchange error:", error);
    return null;
  }
}

/**
 * Get user info from DigiLocker
 */
export async function getUserInfo(accessToken: string): Promise<DigiLockerUserInfo | null> {
  try {
    const decryptedToken = decryptToken(accessToken);
    if (!decryptedToken) return null;

    const response = await fetch(`${DIGILOCKER_API_BASE}user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${decryptedToken}`,
      },
    });

    if (!response.ok) {
      console.error("User info fetch failed:", response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("User info error:", error);
    return null;
  }
}

/**
 * Store DigiLocker token securely in database
 */
export async function storeToken(
  userId: string,
  tokenData: DigiLockerTokenResponse,
  digiLockerUserId: string,
  aadhaarHash: string
): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const encryptedToken = encryptToken(tokenData.access_token);
    const encryptedRefreshToken = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null;

    await db.insert(digiLockerTokens).values({
      userId,
      accessToken: encryptedToken,
      refreshToken: encryptedRefreshToken,
      tokenType: tokenData.token_type || "Bearer",
      expiresAt,
      aadhaarHash,
      digiLockerUserId,
    });

    await logAudit(userId, "token_stored", "digilocker_token", userId, 200, {
      digiLockerUserId,
      expiresAt,
    });

    return true;
  } catch (error) {
    console.error("Store token error:", error);
    return false;
  }
}

/**
 * Retrieve and decrypt stored token
 */
export async function getStoredToken(userId: string): Promise<DigiLockerTokenResponse | null> {
  try {
    const token = await db.query.digiLockerTokens.findFirst({
      where: and(eq(digiLockerTokens.userId, userId), eq(digiLockerTokens.isActive, true)),
    });

    if (!token) return null;

    // Check if token is expired
    if (new Date() > token.expiresAt) {
      // Try to refresh
      const refreshed = await refreshToken(userId);
      if (!refreshed) {
        // Mark as inactive
        await db
          .update(digiLockerTokens)
          .set({ isActive: false })
          .where(eq(digiLockerTokens.id, token.id));
        return null;
      }
      return await getStoredToken(userId);
    }

    const decryptedToken = decryptToken(token.accessToken);
    if (!decryptedToken) return null;

    const expiresIn = Math.ceil((token.expiresAt.getTime() - Date.now()) / 1000);

    return {
      access_token: decryptedToken,
      token_type: token.tokenType,
      expires_in: expiresIn,
      user_id: token.digiLockerUserId || undefined,
    };
  } catch (error) {
    console.error("Get stored token error:", error);
    return null;
  }
}

/**
 * Refresh expired token
 */
export async function refreshToken(userId: string): Promise<boolean> {
  try {
    const token = await db.query.digiLockerTokens.findFirst({
      where: eq(digiLockerTokens.userId, userId),
    });

    if (!token || !token.refreshToken) return false;

    const decryptedRefreshToken = decryptToken(token.refreshToken);
    if (!decryptedRefreshToken) return false;

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: decryptedRefreshToken,
      client_id: DIGILOCKER_CLIENT_ID,
      client_secret: DIGILOCKER_CLIENT_SECRET,
    });

    const response = await fetch(DIGILOCKER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      await logAudit(userId, "token_refresh_failed", "digilocker_token", token.id, response.status);
      return false;
    }

    const newTokenData = (await response.json()) as DigiLockerTokenResponse;
    const expiresAt = new Date(Date.now() + newTokenData.expires_in * 1000);
    const encryptedToken = encryptToken(newTokenData.access_token);
    const encryptedRefreshToken = newTokenData.refresh_token ? encryptToken(newTokenData.refresh_token) : null;

    await db
      .update(digiLockerTokens)
      .set({
        accessToken: encryptedToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
        lastRefreshedAt: new Date(),
      })
      .where(eq(digiLockerTokens.id, token.id));

    await logAudit(userId, "token_refreshed", "digilocker_token", token.id, 200);

    return true;
  } catch (error) {
    console.error("Refresh token error:", error);
    return false;
  }
}

/**
 * Revoke token
 */
export async function revokeToken(userId: string): Promise<boolean> {
  try {
    const token = await db.query.digiLockerTokens.findFirst({
      where: eq(digiLockerTokens.userId, userId),
    });

    if (!token) return false;

    await db
      .update(digiLockerTokens)
      .set({
        isActive: false,
        revokedAt: new Date(),
      })
      .where(eq(digiLockerTokens.id, token.id));

    await logAudit(userId, "token_revoked", "digilocker_token", token.id, 200);

    return true;
  } catch (error) {
    console.error("Revoke token error:", error);
    return false;
  }
}

/**
 * Generate CSRF state token
 */
export function generateStateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Verify CSRF state token
 */
export function verifyStateToken(state: string, sessionState: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(state), Buffer.from(sessionState));
}

/**
 * Create Aadhaar hash (SHA-256)
 */
export function createAadhaarHash(aadhaar: string): string {
  return crypto.createHash("sha256").update(aadhaar).digest("hex");
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

/**
 * Clean up expired tokens periodically
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const result = await db
      .update(digiLockerTokens)
      .set({ isActive: false })
      .where(and(eq(digiLockerTokens.isActive, true), lt(digiLockerTokens.expiresAt, new Date())));

    console.log("Cleaned up expired tokens");
  } catch (error) {
    console.error("Token cleanup error:", error);
  }
}

// Run token cleanup every hour
setInterval(() => {
  cleanupExpiredTokens();
}, 60 * 60 * 1000);
