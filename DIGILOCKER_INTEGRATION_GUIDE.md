# DigiLocker Certificate Verification Module - Integration Guide

## Overview

This integration enhances the TNEA counselling application with a secure DigiLocker-based certificate verification system. The module enables students to authenticate via Aadhaar, retrieve official documents, and automatically validate their eligibility.

## Architecture

```
┌─────────────────────────────────────────────────────────────═
│                    TNEA Web Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React/TypeScript)                               │
│  ├── DigiLockerVerificationWidget.tsx                      │
│  ├── AdminVerificationDashboard.tsx                        │
│  └── StudentVerificationRecords.tsx                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Backend (Express.js/Node.js)                              │
│  ├── OAuth Routes                                          │
│  │   ├── POST /api/auth/digilocker/authorize              │
│  │   └── GET /api/auth/digilocker/callback                │
│  ├── Certificate Routes                                    │
│  │   ├── POST /api/certificates/retrieve                  │
│  │   └── GET /api/certificates/status                     │
│  ├── Eligibility Routes                                    │
│  │   ├── POST /api/eligibility/check                      │
│  │   └── GET /api/eligibility/status                      │
│  ├── Admin Routes                                          │
│  │   ├── GET /api/admin/students                          │
│  │   ├── POST /api/admin/certificates/:id/verify          │
│  │   └── POST /api/admin/students/:id/approve             │
│  └── Security Middleware                                   │
│      ├── CSRF Protection                                   │
│      ├── Rate Limiting                                     │
│      └── Input Sanitization                                │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Database (PostgreSQL)                                     │
│  ├── digilocker_tokens                                    │
│  ├── certificate_verifications                            │
│  ├── eligibility_results                                  │
│  ├── verification_policies                                │
│  ├── admin_flags                                          │
│  └── audit_logs                                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  External Integration                                      │
│  └── DigiLocker OAuth 2.0 API                             │
│      ├── https://api.digitallocker.gov.in/...             │
│      └── (Requires DigiLocker Partnership)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Environment Configuration

Create or update your `.env` file with the following variables:

```bash
# DigiLocker OAuth Configuration
DIGILOCKER_CLIENT_ID=your_client_id
DIGILOCKER_CLIENT_SECRET=your_client_secret
DIGILOCKER_REDIRECT_URI=https://yourdomain.com/api/auth/digilocker/callback

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tnea

# Session
SESSION_SECRET=your-secure-session-secret

# Token Encryption
TOKEN_ENCRYPTION_KEY=your-32-byte-hex-key  # Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Optional: HTTPS configuration
NODE_ENV=production
HTTPS_ONLY=true
HSTS_MAX_AGE=31536000
```

### 2. Database Migration

Run the following to create the new tables:

```bash
npm run db:push
```

This will create:
- `digilocker_tokens` - OAuth token management
- `certificate_verifications` - Certificate retrieval and validation
- `eligibility_results` - Eligibility check outcomes
- `verification_policies` - Configurable eligibility rules
- `admin_flags` - Manual review flags
- `audit_logs` - Compliance and security logging

### 3. Install Dependencies

```bash
npm install express-rate-limit
# Token encryption is handled by Node.js built-in crypto
```

### 4. Security Middleware Setup

In `server/index.ts`, add the security middleware:

```typescript
import {
  securityHeaders,
  sanitizeInput,
  validateContentType,
  sessionSecurity,
  createAuthLimiter,
  createAPIPuimiter,
} from "./security";

// Add security headers
app.use(securityHeaders);

// Validate content type for API requests
app.use("/api", validateContentType);

// Input sanitization
app.use("/api", sanitizeInput);

// Session security
app.use(sessionSecurity);

// Rate limiting for auth endpoints
app.use("/api/auth/", createAuthLimiter());

// General API rate limiting
app.use("/api/", createAPIPuimiter());

// Certificate retrieval specific rate limit
app.use("/api/certificates/retrieve", createCertificateLimiter());
```

## API Endpoints

### Student Endpoints

#### 1. Initiate DigiLocker Authentication

**Endpoint:** `POST /api/auth/digilocker/authorize`

**Authentication:** Required (Student must be logged in)

**Request:**
```json
{}
```

**Response:**
```json
{
  "authUrl": "https://api.digitallocker.gov.in/...",
  "state": "csrf-token"
}
```

**Purpose:** Generate OAuth authorization URL and CSRF token

---

#### 2. OAuth Callback Handler

**Endpoint:** `GET /api/auth/digilocker/callback?code=...&state=...`

**Authentication:** None (Callback from DigiLocker)

**Response:** Redirects to `/dashboard?digilocker_success=true`

**Purpose:** Handle OAuth code exchange and token storage

---

#### 3. Retrieve Certificates

**Endpoint:** `POST /api/certificates/retrieve`

**Authentication:** Required

**Rate Limit:** 10 requests per hour

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "certificatesRetrieved": 4,
  "certificates": [
    {
      "id": "cert-uuid",
      "type": "10th_marksheet",
      "issuer": "Board of Examination",
      "status": "pending_verification"
    }
  ]
}
```

**Purpose:** Retrieve all documents from DigiLocker and store locally

---

#### 4. Get Certificate Status

**Endpoint:** `GET /api/certificates/status`

**Authentication:** Required

**Response:**
```json
{
  "summary": {
    "totalRetrieved": 4,
    "verified": 2,
    "pending": 2,
    "rejected": 0
  },
  "requiredDocuments": {
    "10th_marksheet": true,
    "12th_marksheet": false,
    "community_certificate": true,
    "nativity_certificate": false,
    "income_certificate": false
  },
  "certificates": [...]
}
```

**Purpose:** Get detailed certificate verification status

---

#### 5. Perform Eligibility Check

**Endpoint:** `POST /api/eligibility/check`

**Authentication:** Required

**Request:**
```json
{
  "studentMarks": 185.5,
  "category": "general",
  "nativeState": "TN",
  "income": 500000
}
```

**Response:**
```json
{
  "success": true,
  "resultId": "result-uuid",
  "cutoffStatus": "eligible",
  "cutoffMarks": 180,
  "categoryValidation": "valid",
  "nativeValidation": "valid",
  "incomeValidation": "valid",
  "communityValidation": "valid",
  "overallStatus": "eligible",
  "eligibilityPercentage": 100,
  "mismatches": [],
  "remarks": "..."
}
```

**Purpose:** Check if student meets eligibility criteria

---

#### 6. Get Complete Verification Status

**Endpoint:** `GET /api/verification/complete-status`

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "fullName": "John Doe",
    "email": "john@example.com"
  },
  "certificates": {
    "total": 4,
    "verified": 3,
    "byType": {...}
  },
  "eligibility": {
    "overallStatus": "eligible",
    "eligibilityPercentage": 95,
    ...
  },
  "lastUpdated": "2026-02-21T10:00:00Z"
}
```

**Purpose:** Dashboard view of all verification data

---

#### 7. Logout from DigiLocker

**Endpoint:** `POST /api/auth/digilocker/logout`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "DigiLocker token revoked"
}
```

**Purpose:** Revoke stored access token

---

### Admin Endpoints

#### 1. List Students for Verification

**Endpoint:** `GET /api/admin/students?page=1&limit=20&search=name`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "students": [
    {
      "id": "uuid",
      "username": "student1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "certificatesCount": 4,
      "certificatesVerified": 3,
      "eligibilityStatus": "needs_review",
      "flags": 1,
      "flagged": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

---

#### 2. Get Student Verification Details

**Endpoint:** `GET /api/admin/students/{id}/verification-status`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "student": {...},
  "certificates": {
    "total": 4,
    "verified": 3,
    "pending": 1,
    "rejected": 0,
    "list": [...]
  },
  "eligibility": {
    "overallStatus": "needs_review",
    "mismatches": [...],
    "reviewedAt": null
  },
  "flags": [...]
}
```

---

#### 3. Verify Certificate

**Endpoint:** `POST /api/admin/certificates/{id}/verify`

**Authentication:** Required (Admin only)

**Request:**
```json
{
  "matched": true,
  "notes": "Document verified against student profile"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate verified"
}
```

---

#### 4. Reject Certificate

**Endpoint:** `POST /api/admin/certificates/{id}/reject`

**Authentication:** Required (Admin only)

**Request:**
```json
{
  "notes": "Document signature validation failed"
}
```

---

#### 5. Flag Student for Review

**Endpoint:** `POST /api/admin/students/{id}/flag`

**Authentication:** Required (Admin only)

**Request:**
```json
{
  "flagType": "data_mismatch",
  "description": "Certificate data doesn't match application",
  "severity": "high"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student flagged",
  "flagId": "flag-uuid"
}
```

---

#### 6. Approve Student

**Endpoint:** `POST /api/admin/students/{id}/approve`

**Authentication:** Required (Admin only)

**Request:**
```json
{
  "adminNotes": "All documents verified, eligible for counselling"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Student approved for eligibility"
}
```

---

#### 7. Get Dashboard Statistics

**Endpoint:** `GET /api/admin/dashboard-stats`

**Authentication:** Required (Admin only)

**Response:**
```json
{
  "students": {"total": 500},
  "eligibility": {
    "total": 450,
    "eligible": 380,
    "needsReview": 50,
    "rejected": 20,
    "pending": 50
  },
  "flags": {
    "active": 15,
    "critical": 2,
    "high": 5
  },
  "recentActivities": [...]
}
```

---

## Chatbot Integration

Update the chatbot to prompt for and display verification status:

### Modified Chatbot Flow

```
Student Login
    ↓
Chatbot displays: "Would you like to verify your certificates via DigiLocker?"
    ↓
Student consent: Yes/No
    ↓
If Yes:
    - Initiate OAuth flow
    - Display verification widget
    - Auto-refresh eligibility status
    ↓
Display results:
    - ✅ Verification complete
    - 📋 Eligibility status
    - ⚠️ Any warnings/mismatches
```

### Chatbot Prompt Example

```python
# In Python chatbot service (chatbot_service/main.py)

async def handle_digilocker_verification(user_id: str, session_id: str):
    """
    Prompt user about certificate verification
    """
    if user_role == "student":
        return {
            "response": "Would you like to verify your certificates using DigiLocker? "
                       "This will securely authenticate you via Aadhaar and retrieve your official documents.",
            "suggested_actions": [
                {"label": "Start Verification", "action": "digilocker_auth_init"},
                {"label": "Check Status", "action": "digilocker_status_check"},
                {"label": "Ask Later", "action": "skip"},
            ],
            "trigger_condition": "user_first_login_or_no_verification"
        }
```

### Frontend Integration

```typescript
// In ChatBot.tsx component

const handleDigiLockerAction = async (action: string) => {
  if (action === "digilocker_auth_init") {
    // Show verification widget
    setShowVerificationWidget(true);
  } else if (action === "digilocker_status_check") {
    // Fetch and display current status
    const response = await fetch("/api/verification/complete-status");
    const status = await response.json();
    displayStatusMessage(status);
  }
};
```

## Security Considerations

### 1. OAuth 2.0 Security

- ✅ PKCE support (optional for additional security)
- ✅ State parameter validation for CSRF protection
- ✅ Secure token encryption with AES-256-GCM
- ✅ Token expiration and refresh mechanism

### 2. Data Protection

- ✅ Encrypted token storage in database
- ✅ Encrypted columns for sensitive metadata
- ✅ Row-level security policies in PostgreSQL
- ✅ SHA-256 hashing for metadata integrity

### 3. API Security

- ✅ HTTPS-only communication
- ✅ Rate limiting (auth: 5/15min, certificates: 10/hour)
- ✅ Input validation and sanitization
- ✅ CSRF token protection
- ✅ Security headers (HSTS, CSP, X-Frame-Options)

### 4. Audit Logging

All sensitive operations are logged:
- ✅ Certificate retrieval attempts
- ✅ Verification status changes
- ✅ Admin approvals/rejections
- ✅ Token creation/revocation
- ✅ Failed authentication attempts

### 5. Two-Factor Authentication (Optional)

For admin accounts, implement 2FA:

```typescript
// POST /api/admin/2fa/enable
// POST /api/admin/2fa/verify

import { generateOTP, hashOTP } from "./security";

const otp = generateOTP();
const salt = crypto.randomBytes(16).toString("hex");
const hashedOTP = hashOTP(otp, salt);

// Email OTP to admin
// Admin submits OTP for verification
```

## Database Backup & Recovery

### Backup Strategy

```bash
# Weekly backup
pg_dump -U postgres tnea > tnea_backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U postgres tnea < tnea_backup_20260221.sql
```

### Encryption Key Management

- Store encryption key in environment variable
- Rotate keys annually
- Keep backup keys secure
- Document key rotation procedure

## Compliance & Privacy

### GDPR/DPIA Compliance

- ✅ Data minimization (only essential fields stored)
- ✅ User consent tracking
- ✅ Right to be forgotten (delete user data endpoint)
- ✅ Data portability APIs

### Aadhaar Security

- ✅ Aadhaar data not stored directly
- ✅ Only hash of Aadhaar for verification
- ✅ Compliance with Aadhaar Act, 2016
- ✅ Regular security audits

## Monitoring & Alerts

### Key Metrics to Monitor

```typescript
// Grafana/DataDog compatible
{
  "metrics": {
    "certificate_retrieval_rate": "counter",
    "verification_success_rate": "gauge",
    "admin_approval_time": "histogram",
    "failed_authentications": "counter",
    "active_flags": "gauge"
  },
  "alerts": {
    "high_failure_rate": "> 10%",
    "unusual_admin_activity": "> 50 actions/hour",
    "database_errors": "any",
    "token_encryption_failures": "any"
  }
}
```

## Testing

### Test Scenarios

1. **OAuth Flow**
   - Valid CSRF token
   - Expired CSRF token
   - Code exchange failure
   - Token refresh

2. **Certificate Retrieval**
   - All documents retrieved
   - Partial documents
   - Expired documents
   - Signature validation

3. **Eligibility Check**
   - Passing all validations
   - Category mismatch
   - Income validation failure
   - Nativity mismatch

4. **Admin Operations**
   - Certificate approval
   - Student flagging
   - Flag resolution
   - Report generation

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Authorization failed" | CSRF token mismatch | Clear session cookies, try again |
| "Failed to exchange code" | Invalid DigiLocker credentials | Verify CLIENT_ID and CLIENT_SECRET |
| "Token decryption failed" | Encryption key mismatch | Check TOKEN_ENCRYPTION_KEY in .env |
| "Certificate retrieval timeout" | DigiLocker API slow | Implement retry logic with exponential backoff |
| "Eligibility check pending" | Missing certificates | Prompt user to retrieve all documents |

## Future Enhancements

1. **WebSocket Real-time Updates** - Live dashboard refresh
2. **Automated Anomaly Detection** - AI-based fraud detection
3. **Mobile App Integration** - Native iOS/Android support
4. **Biometric Authentication** - Face/fingerprint verification
5. **Blockchain Verification** - Immutable audit trail
6. **Multi-language Support** - Tamil, English, and regional languages
7. **SMS/Email Notifications** - Real-time status updates
8. **API Rate Increase** - Performance optimization

## Support & Contact

For issues or questions:
- GitHub Issues: [project-repo]
- Email: support@tnea-insight.gov.in
- Documentation: https://docs.tnea-insight.gov.in/digilocker

---

**Last Updated:** February 21, 2026
**Version:** 1.0
**Status:** Production Ready
