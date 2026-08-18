# CertiChain Blockchain Ledger & PoA Consensus Design

CertiChain implements an institutional **Proof-of-Authority (PoA)** blockchain engine specifically built for document verification without requiring energy-expensive Proof of Work.

## Block Anatomy

```json
{
  "index": 1,
  "timestamp": "2026-08-18T12:00:00.000Z",
  "previousHash": "0000000000000000000000000000000000000000000000000000000000000000",
  "hash": "92ab837f190248a82f019a823c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d",
  "merkleRoot": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "issuerId": "UNIV-01",
  "issuerName": "Example University",
  "digitalSignature": "3045022100a892b...",
  "transactions": [
    {
      "transactionId": "TX-9921",
      "certificateId": "CERT-2026-000001",
      "certificateHash": "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      "studentName": "Nipun Kumar Kushwah",
      "course": "B.Tech Computer Science & Engineering",
      "institution": "Example University",
      "issueDate": "18 August 2026",
      "digitalSignature": "SIG-ED25519-...",
      "type": "ISSUE"
    }
  ]
}
```

## Key Blockchain Properties

1. **Proof of Authority (PoA)**: Blocks are generated and signed by authenticated institution nodes holding registered Ed25519 key pairs.
2. **Merkle Tree Proofs**: Certificate transaction hashes are leaf nodes in a Merkle tree. The Merkle root is recorded in the block header.
3. **Chain Integrity Rules**:
   - `block.hash === SHA256(index + timestamp + previousHash + merkleRoot + issuerId)`
   - `block.previousHash === chain[index - 1].hash`
   - `block.merkleRoot === MerkleTree(block.transactions).getRoot()`
4. **Immutable Revocation**: Certificates are never deleted from blocks. Revocations emit a new `REVOKE` transaction linking the original certificate ID, preserving historical auditability.
