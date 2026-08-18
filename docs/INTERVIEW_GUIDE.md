# CertiChain Technical Interview Guide

Use this guide when presenting **CertiChain** during Full Stack Developer / Web3 interviews.

## 3-Minute Demo Walkthrough Script

1. **Introduction (30s)**:
   - *"CertiChain is an institutional Proof-of-Authority blockchain platform built to solve diploma fraud. Instead of relying on vulnerable paper degrees or unverified PDFs, CertiChain anchors document SHA-256 hashes and Ed25519 digital signatures into immutable blocks."*
2. **Certificate Issuance (45s)**:
   - Open `/dashboard/institution`, issue a certificate for student Nipun.
   - Highlight SHA-256 hash generation, key signing, block mining, and QR code PDF creation.
3. **Public Verification (45s)**:
   - Navigate to `/verify/CERT-2026-000001`.
   - Show the glowing animated green `✓ CERTIFICATE AUTHENTIC` badge and itemized cryptographic audit checks.
4. **Tamper Detection Lab (30s)**:
   - Open `/security-lab`. Change student name or course by 1 letter.
   - Point out real-time hash divergence and instant `❌ HASH MISMATCH` failure.
5. **Merkle Proof Path (30s)**:
   - Open `/merkle-tree`. Show how the leaf transaction hash traces to the Merkle Root without exposing surrounding transaction data.

## Key Technical Talking Points

- **Custom Blockchain Core**: Written in TypeScript using SHA-256 block hashing, Merkle proof trees, and Ed25519 signatures.
- **Zero-Knowledge Privacy**: Only cryptographic hashes are stored on the public ledger; student documents stay private.
- **PoA Consensus**: Optimized for institutional verification—no energy waste from Proof of Work.
