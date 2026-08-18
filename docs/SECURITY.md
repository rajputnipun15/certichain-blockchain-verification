# CertiChain Security Model

CertiChain is engineered around zero-trust cryptographic principles.

## 1. Zero-Knowledge Document Privacy
Raw student degree PDFs and sensitive grade transcripts are **never stored on the public blockchain**. Only non-reversible SHA-256 cryptographic hashes and metadata hashes are recorded.

## 2. Digital Signatures (Ed25519)
- Every issuing institution is provisioned an Ed25519 key pair (`spki`/`pkcs8` PEM format).
- Certificate payloads are signed by the institution's private key.
- Anyone can verify the signature using the institution's public key exposed on the blockchain.

## 3. Cryptographic Tamper Detection
Any alteration to student details (name, degree, score, issue date) alters the SHA-256 hash output entirely due to the avalanche effect. The recalculated hash diverges from the anchored block record, resulting in instant verification failure (`❌ HASH MISMATCH`).

## 4. Immutable Historical Audit Trail
Revoking a certificate does **not** erase or mutate historical blocks. A new `REVOKE` transaction is appended to the chain. Verifiers see `⚠ CERTIFICATE REVOKED` along with the official administrative reason while preserving past audit history.
