# DigiLocker Certificate Verification Module - README

## 🎯 Project Overview

This module integrates secure Aadhaar-linked certificate verification into the TNEA counselling platform. Students can authenticate via DigiLocker OAuth 2.0, automatically retrieve official documents, and have their eligibility automatically validated against configurable rules.

## ✨ Key Features

### 🔐 Secure Authentication
- **Aadhaar-Linked OAuth 2.0**: Authenticate students securely via DigiLocker
- **CSRF Protection**: State token validation for security
- **Encrypted Token Storage**: AES-256-GCM encryption for access tokens
- **Token Refresh Mechanism**: Automatic token refresh before expiration
- **Secure Session Management**: HTTP-only cookies, fingerprint-based hijacking detection

### 📄 Digital Certificate Management
- **Automatic Retrieval**: Fetch documents directly from DigiLocker API
- **Multiple Document Types**: 10th marksheet, 12th marksheet, community certificate, nativity certificate, income certificate
- **Digital Signature Validation**: Verify certificate authenticity
- **Metadata Extraction**: SHA-256 hash for integrity checking
- **Expiry Tracking**: Automatic detection of expired documents

### ✅ Intelligent Eligibility Verification
- **Rule-Based Engine**: Configurable eligibility rules, update yearly
- **Multi-Factor Validation**:
  - Cutoff score eligibility
  - Category validation (SC/ST/OBC/General)
  - Nativity compliance (Tamil Nadu residency)
  - Income threshold verification
  - Community certificate validation
- **Automated Flagging**: Inconsistencies auto-flagged for manual review
- **Eligibility Score**: Percentage-based eligibility calculation

### 👨‍💼 Administrative Dashboard
- **Student Management**: View and manage verification status for all students
- **Certificate Approval**: Admin certificate verification with notes
- **Manual Flagging**: Flag students for manual review with severity levels
- **Bulk Approvals**: Approve eligible students for counselling
- **Audit Logging**: Complete compliance audit trail
- **Real-time Statistics**: Dashboard with live eligibility stats

### 🔒 Security & Compliance
- **Row-Level Security**: PostgreSQL RLS policies
- **Encrypted Storage**: pgcrypto for sensitive metadata
- **Rate Limiting**: Prevent brute force and DDoS attacks
- **Input Validation**: Sanitization of all user inputs
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **2FA Ready**: Template for Two-Factor Authentication
- **GDPR Compliant**: Data minimization, consent tracking

### 📊 Audit & Monitoring
- **Complete Audit Logs**: Track all system actions
- **IP Tracking**: Record IP addresses for security monitoring
- **Activity Timeline**: User-friendly activity history
- **Compliance Reports**: Generate audit reports for regulators

## 🏗️ Architecture

### Frontend Components
```
client/src/components/
├── DigiLockerVerificationWidget.tsx      # Student verification flow
├── AdminVerificationDashboard.tsx        # Admin dashboard
└── StudentVerificationRecords.tsx        # Student list view
```

### Backend Services
```
server/
├── digilocker/
│   ├── oauth.ts                          # OAuth 2.0 implementation
│   ├── certificates.ts                   # Certificate retrieval & validation
│   ├── eligibility.ts                    # Rule-based eligibility engine
│   └── routes.ts                         # API endpoints
├── admin/
│   └── routes.ts                         # Admin API endpoints
├── security.ts                           # Security utilities, middleware
└── db.ts                                 # Database connection
```

### Database Schema
```
digilocker_tokens          - OAuth token storage (encrypted)
certificate_verifications  - Certificate retrieval records
eligibility_results        - Eligibility check outcomes
verification_policies      - Configurable eligibility rules
admin_flags               - Manual review flags
audit_logs                - Compliance logging
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- DigiLocker API credentials (from https://staging.digitallocker.gov.in/)

### Installation

1. **Clone and Install**
```bash
cd TNEAInsight_web
npm install
```

2. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Database**
```bash
npm run db:push
```

4. **Start Server**
```bash
npm run dev
```

5. **Access Dashboard**
- Student Portal: http://localhost:5000
- Admin Dashboard: http://localhost:5000/admin

## 📱 User Workflows

### Student Workflow

```
1. Student logs into TNEA portal
   ↓
2. Chatbot prompts: "Verify your certificates?"
   ↓
3. Clicks "Start Verification"
   ↓
4. Redirected to DigiLocker login
   ↓
5. Authenticates with Aadhaar
   ↓
6. Grants permission for document access
   ↓
7. Documents retrieved and stored securely
   ↓
8. System performs eligibility check automatically
   ↓
9. Results displayed to student:
   - ✅ Eligible - ready for counselling
   - ⚠️ Needs Review - awaiting admin verification
   - ❌ Rejected - not eligible
```

### Admin Workflow

```
1. Admin logs in
   ↓
2. Views dashboard with stats
   ↓
3. See flagged students needing review
   ↓
4. Click on student to view:
   - Retrieved certificates
   - Eligibility check details
   - Any data mismatches
   ↓
5. Options:
   - Approve certificates individually
   - Reject with notes
   - Flag for further review
   - Approve overall eligibility
   ↓
6. Student notification sent
   ↓
7. Audit log recorded
```

## 📚 API Documentation

### Key Endpoints for Students

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/digilocker/authorize` | POST | Start OAuth flow |
| `/api/auth/digilocker/callback` | GET | OAuth callback |
| `/api/certificates/retrieve` | POST | Fetch documents |
| `/api/certificates/status` | GET | Check cert status |
| `/api/eligibility/check` | POST | Run eligibility check |
| `/api/eligibility/status` | GET | Get eligibility result |
| `/api/verification/complete-status` | GET | Full verification dashboard |
| `/api/auth/digilocker/logout` | POST | Revoke token |

### Key Endpoints for Admins

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/students` | GET | List students |
| `/api/admin/students/:id/verification-status` | GET | Student details |
| `/api/admin/certificates/:id/verify` | POST | Approve certificate |
| `/api/admin/certificates/:id/reject` | POST | Reject certificate |
| `/api/admin/students/:id/flag` | POST | Flag student |
| `/api/admin/students/:id/approve` | POST | Approve eligibility |
| `/api/admin/dashboard-stats` | GET | Dashboard statistics |
| `/api/admin/audit-logs` | GET | Audit trail |

## 🔐 Security Features Implemented

### ✅ Completed
- [x] OAuth 2.0 Authorization Code Flow
- [x] CSRF token protection
- [x] AES-256-GCM token encryption
- [x] Rate limiting (auth, API, certificates)
- [x] Input validation & sanitization
- [x] Security headers (HSTS, CSP, X-Frame)
- [x] Session fingerprinting
- [x] Encrypted column support ready
- [x] Row-level security ready
- [x] Audit logging
- [x] IP tracking

### 🔄 In Progress
- [ ] WebSocket real-time updates
- [ ] Two-Factor Authentication
- [ ] Anomaly detection

### 📋 Planned
- [ ] Biometric authentication
- [ ] Blockchain audit trail
- [ ] SMS/Email notifications

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

## 📊 Database Schema Details

### digilocker_tokens
```sql
id (UUID PK)
user_id (FK to users)
access_token (ENCRYPTED)
refresh_token (ENCRYPTED)
token_type
expires_at
aadhaar_hash (SHA-256)
digilocker_user_id
issued_at
last_refreshed_at
is_active
revoked_at
```

### certificate_verifications
```sql
id (UUID PK)
user_id (FK to users)
document_type (enum)
document_id
issuer_name
issue_date
expiry_date
student_name
category
marks
metadata_hash
digital_signature
verification_status
signature_validation
matched_with_profile
raw_metadata (JSONB, ENCRYPTED)
```

### eligibility_results
```sql
id (UUID PK)
user_id (FK to users)
cutoff_status (enum)
category_validation
nativity_validation
income_validation
community_validation
overall_status
eligibility_percentage
remarks
mismatches (JSONB)
admin_notes
reviewed_by (FK)
reviewed_at
```

## 🛠️ Configuration

### Eligibility Rules (verification_policies)

Example policy configuration:

```json
{
  "type": "cutoff",
  "policyYear": 2026,
  "conditions": {
    "general_cutoff": 180,
    "obc_cutoff": 170,
    "sc_cutoff": 160,
    "st_cutoff": 160
  }
}
```

### Certificate Validation Rules

Rules can be updated in the admin panel without code changes:

```javascript
{
  "type": "category",
  "approvedCategories": ["general", "obc", "sc", "st"]
}

{
  "type": "nativity",
  "nativeStateCode": "TN"
}

{
  "type": "income",
  "maxIncome": 800000
}
```

## 📈 Monitoring & Logs

### Key Metrics
- Certificate retrieval success rate
- Eligibility check completion time
- Admin approval average time
- Failed authentication attempts
- Active flag count by severity

### Log Locations
```
server/logs/
├── audit.log           # Compliance audit trail
├── error.log           # System errors
├── access.log          # API access logs
└── digilocker.log      # OAuth integration logs
```

## 🐛 Troubleshooting

### Common Issues

**"DigiLocker authentication failed"**
- Check CLIENT_ID and CLIENT_SECRET in .env
- Verify redirect URI matches configured value
- Check if DigiLocker API is accessible

**"Certificate retrieval timeout"**
- Implement retry logic
- Check network connectivity to DigiLocker
- Verify REQUEST_TIMEOUT setting

**"Token encryption failed"**
- Ensure TOKEN_ENCRYPTION_KEY is 32-byte hex key
- Check crypto module compatibility

**"Database connection error"**
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Verify credentials

## 📞 Support & Contributions

- **Issues**: Report via GitHub Issues
- **Documentation**: Check DIGILOCKER_INTEGRATION_GUIDE.md
- **Contributing**: See CONTRIBUTING.md
- **License**: MIT

## 📝 Changelog

### v1.0 (Feb 21, 2026)
- ✨ Initial release
- 🔐 Full OAuth 2.0 integration
- 📄 Certificate retrieval & validation
- ✅ Eligibility engine implementation
- 👨‍💼 Admin dashboard
- 🔒 Security hardening

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- DigiLocker for secure document API
- TNEA for counselling requirements
- Contributors and testers

---

**Made with ❤️ for transparent and secure education in Tamil Nadu**

*Last Updated: February 21, 2026*
