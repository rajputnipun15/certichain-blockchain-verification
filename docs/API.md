# CertiChain REST API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
- **Request Body**: `{ "email": "admin@university.edu", "password": "password123" }`
- **Response**: `{ "token": "...", "user": { ... } }`

### `POST /api/auth/register`
Registers a new user.

---

## Certificates

### `POST /api/certificates` (Protected: `INSTITUTION_ADMIN`)
Issues a new certificate, computes SHA-256 & Ed25519 signature, and mines a new PoA block.
- **Request Body**: `{ "studentName": "Nipun Kumar Kushwah", "course": "B.Tech Computer Science & Engineering", "issueDate": "18 August 2026" }`

### `GET /api/certificates`
Lists certificates with search & pagination.

### `GET /api/certificates/:id`
Retrieves certificate details and blockchain history.

### `GET /api/certificates/:id/pdf`
Generates and downloads the official PDF certificate with embedded QR code.

### `POST /api/certificates/:id/revoke` (Protected: `INSTITUTION_ADMIN`)
Anchors a revocation transaction on the blockchain.

---

## Public Verification

### `GET /api/verify/:certificateId`
Verifies certificate authenticity against blockchain ledger.

### `POST /api/verify/document`
Accepts raw PDF upload or hash for tamper detection auditing.

---

## Blockchain Explorer

### `GET /api/blockchain`
Returns total blocks, total transactions, latest hash, and chain validation status.

### `GET /api/blocks`
Lists blocks.

### `GET /api/merkle-proof/:certificateId`
Returns Merkle proof path for a given certificate.
