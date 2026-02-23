/**
 * Security Utilities and Hardening
 * Implements CSRF protection, rate limiting, IP tracking, and secure headers
 */

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

// CSRF Token Management
const csrfTokens = new Map<string, { token: string; createdAt: Date }>();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Store and manage CSRF tokens
 */
export function storeCSRFToken(sessionId: string): string {
  // Clean up expired tokens
  const entriesToDelete: string[] = [];
  csrfTokens.forEach((value, key) => {
    if (Date.now() - value.createdAt.getTime() > TOKEN_EXPIRY) {
      entriesToDelete.push(key);
    }
  });
  entriesToDelete.forEach((key) => csrfTokens.delete(key));

  const token = generateCSRFToken();
  csrfTokens.set(sessionId, { token, createdAt: new Date() });
  return token;
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;

  // Check expiry
  if (Date.now() - stored.createdAt.getTime() > TOKEN_EXPIRY) {
    csrfTokens.delete(sessionId);
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(stored.token), Buffer.from(token));
}

/**
 * CSRF Protection Middleware
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === "GET" || req.method === "HEAD") {
    // Generate fresh CSRF token for GET requests
    const token = storeCSRFToken(req.sessionID);
    res.locals.csrfToken = token;
    return next();
  }

  // For POST/PUT/DELETE, verify CSRF token
  const token = req.body._csrf || req.headers["x-csrf-token"];

  if (!token || !verifyCSRFToken(req.sessionID, token as string)) {
    return res.status(403).json({ error: "CSRF validation failed" });
  }

  next();
};

/**
 * Rate Limiting Configuration
 */
export const createAuthLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many authentication attempts, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });

export const createAPIPuimiter = () =>
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
  });

export const createCertificateLimiter = () =>
  rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 certificate retrievals per hour
    message: "Too many certificate retrieval attempts",
    standardHeaders: true,
    legacyHeaders: false,
  });

/**
 * IP Tracking and Security Headers
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Get client IP
  const clientIP =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  // Add to response locals for logging
  res.locals.clientIP = clientIP;

  // Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");

  next();
};

/**
 * Sensitive Option Validation
 */
export function validateInputSanitization(input: any): boolean {
  if (typeof input === "string") {
    // Check for common injection patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+.*set/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(input)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Input Sanitization Middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Check body
  if (req.body && typeof req.body === "object") {
    for (const [key, value] of Object.entries(req.body)) {
      if (!validateInputSanitization(value)) {
        return res.status(400).json({ error: "Invalid input detected" });
      }
    }
  }

  // Check query
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (!validateInputSanitization(value)) {
        return res.status(400).json({ error: "Invalid input detected" });
      }
    }
  }

  next();
};

/**
 * Two-Factor Authentication
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP
 */
export function hashOTP(otp: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

/**
 * Verify OTP
 */
export function verifyOTP(providedOTP: string, hashedOTP: string, salt: string): boolean {
  const provided = hashOTP(providedOTP, salt);
  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(hashedOTP));
}

/**
 * Password strength validation
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain number");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Session Security Middleware
 */
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Check if session is still valid
  if (req.user && req.sessionID) {
    // Optional: Add session fingerprinting
    const fingerprint = `${req.headers["user-agent"]}_${res.locals.clientIP}`;
    const fingerprintHash = crypto.createHash("sha256").update(fingerprint).digest("hex");

    // Store or verify fingerprint in session
    const sessionData = req.session as any;
    if (!sessionData.fingerprint) {
      sessionData.fingerprint = fingerprintHash;
    } else if (sessionData.fingerprint !== fingerprintHash) {
      // Session fingerprint mismatch - potential session hijacking
      req.logout(() => {
        res.status(401).json({ error: "Session security check failed" });
      });
      return;
    }
  }

  next();
};

/**
 * Content Type Validation
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    const contentType = req.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({ error: "Content-Type must be application/json" });
    }
  }

  next();
};
