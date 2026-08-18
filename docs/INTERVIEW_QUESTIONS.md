# 20 Technical Interview Questions & Answers: CertiChain

### 1. What is a Merkle Tree and why is it used in CertiChain?
**Answer**: A Merkle Tree is a binary cryptographic hash tree where leaf nodes are hashes of individual transactions (certificates) and non-leaf nodes are hashes of their children. The root hash (Merkle Root) summarizes all transactions in a block. CertiChain uses it to enable efficient inclusion proofs—allowing verifiers to confirm a certificate is anchored in a block without downloading the entire block's dataset.

### 2. How does CertiChain handle tamper detection?
**Answer**: When a certificate is issued, a SHA-256 hash of its payload (or document bytes) is computed and stored on the blockchain. If any character in the PDF or student details is modified, the SHA-256 hash recalculation produces a completely different hash due to the avalanche effect. Comparing the recalculated hash against the anchored block hash yields a mismatch (`❌ HASH MISMATCH`).

### 3. Why use Proof of Authority (PoA) instead of Proof of Work (PoW)?
**Answer**: CertiChain is an institutional credential infrastructure system, not a cryptocurrency. Proof of Work wastes immense electrical energy solving arbitrary puzzles. PoA relies on pre-authenticated, accountable institutional validator nodes (e.g. accredited universities) that sign blocks using cryptographic private keys.

### 4. How are digital signatures implemented in CertiChain?
**Answer**: Issuing institutions possess an Ed25519 asymmetric key pair. When a certificate is issued, the backend hashes the payload and signs it using the institution's private key (`crypto.sign`). Verifiers authenticate the signature using the institution's public key exposed on the blockchain (`crypto.verify`).

### 5. How does certificate revocation work on an immutable blockchain?
**Answer**: In an immutable ledger, historical blocks cannot be deleted or edited. When an institution revokes a credential, CertiChain appends a new `REVOKE` transaction referencing the original certificate ID. Verification logic checks ledger history: if a revocation transaction is found, status returns `⚠ CERTIFICATE REVOKED` with the reason, while maintaining historical auditability.

### 6. What is the SHA-256 algorithm and what is the avalanche effect?
**Answer**: SHA-256 is a cryptographic hash function producing a 256-bit (64 hex character) digest. The avalanche effect dictates that changing even a single bit in the input string changes on average 50% of the output hash bits unpredictably.

### 7. Why not store sensitive student documents directly on the blockchain?
**Answer**: Public blockchains are transparent and immutable. Storing full student PDF documents on-chain would violate privacy regulations (like GDPR) and bloat ledger storage. CertiChain stores zero-knowledge SHA-256 hashes on-chain while keeping raw documents stored locally or in object storage.

### 8. How does client-side PDF hashing work in the browser?
**Answer**: The React frontend reads the uploaded PDF file as an `ArrayBuffer` and uses the Web Crypto API (`window.crypto.subtle.digest('SHA-256', arrayBuffer)`) to compute the hash locally before transmitting it to the API server.

### 9. How is database consistency maintained between Prisma and the Blockchain engine?
**Answer**: When a block is mined in the in-memory Blockchain engine, the server executes a database transaction persisting the `BlockchainBlock`, `Transaction`, and `Certificate` models atomically. On server startup, `syncBlockchainFromDb()` rebuilds the ledger state.

### 10. How does JWT authentication secure admin endpoints?
**Answer**: Institution admins log in with credentials and receive a signed JSON Web Token containing their user ID, role (`INSTITUTION_ADMIN`), and institution ID. Middleware validates the token signature and enforces role-based access control (RBAC).

### 11. How does PDF generation with embedded QR codes work?
**Answer**: Using `pdf-lib` and `qrcode`, the server dynamically constructs a high-resolution landscape certificate, computes the verification URL (`/verify/:certificateId`), converts the QR code into a PNG buffer, embeds it onto the canvas, and streams the compiled PDF back to the client.

### 12. How do you prevent replay attacks on blockchain transactions?
**Answer**: Each transaction includes a unique `transactionId` computed from the certificate ID, metadata hash, timestamp, and issuer ID, ensuring identical certificate data issued at different times creates distinct transaction hashes.

### 13. How does the system validate chain linkage?
**Answer**: During `validateChain()`, the engine iterates through blocks checking that `block[i].previousHash === block[i-1].hash` and re-calculating `block.hash` and `merkleRoot`. Any tampered block invalidates all downstream blocks.

### 14. What is the purpose of the Docker multi-stage build?
**Answer**: Multi-stage Dockerfiles separate the heavy build environment (node_modules, TypeScript compilers) from the production runner image. Only compiled JavaScript files (`dist`) and production dependencies are included in the runner, producing a lightweight, secure container image.

### 15. How does GitHub Actions CI automate project quality?
**Answer**: On every push/PR, the CI workflow checks out code, installs dependencies, runs database migrations, executes Vitest unit/API tests, and compiles production bundles for both server and client.

### 16. How would CertiChain scale to millions of certificates?
**Answer**: By batching multiple certificate transactions into a single block, storing Merkle roots on-chain, and using PostgreSQL indexing on `certificateId` and `certificateHash`.

### 17. What is the role of Prisma ORM in CertiChain?
**Answer**: Prisma provides type-safe database queries, declarative schema migrations, and seamless compatibility across SQLite (for zero-config dev) and PostgreSQL (for production).

### 18. How does the frontend handle smooth state transitions and animations?
**Answer**: Framer Motion powers page animations, glassmorphism cards, and success/failure indicator transitions, while `canvas-confetti` provides feedback when a certificate is verified.

### 19. How are key pairs safely managed in CertiChain?
**Answer**: Institution private keys are stored securely in encrypted database fields or environment variables and are never exposed over public API endpoints or client bundles.

### 20. How can an employer verify a certificate without logging in?
**Answer**: Public verification endpoints (`/verify` and `/api/verify/:id`) do not require authentication headers, allowing recruiters to scan QR codes or enter IDs instantly.
