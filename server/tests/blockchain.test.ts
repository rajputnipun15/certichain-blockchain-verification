import { describe, it, expect, beforeEach } from 'vitest';
import { Blockchain } from '../src/blockchain/Blockchain.js';
import { Transaction } from '../src/blockchain/Transaction.js';
import { MerkleTree } from '../src/blockchain/MerkleTree.js';
import { Wallet } from '../src/blockchain/Wallet.js';

describe('CertiChain Blockchain Engine', () => {
  let blockchain: Blockchain;
  let institutionKeys: ReturnType<typeof Wallet.generateKeyPair>;

  beforeEach(() => {
    blockchain = new Blockchain();
    institutionKeys = Wallet.generateKeyPair();
  });

  it('should initialize genesis block correctly', () => {
    expect(blockchain.chain.length).toBe(1);
    const genesis = blockchain.getLatestBlock();
    expect(genesis.index).toBe(0);
    expect(genesis.previousHash).toBe('0'.repeat(64));
    expect(genesis.transactions[0].certificateId).toBe('CERT-GENESIS-000000');
  });

  it('should add a certificate transaction and mine a new block', () => {
    const tx = new Transaction({
      certificateId: 'CERT-2026-000001',
      certificateHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      studentName: 'Nipun Kumar Kushwah',
      course: 'B.Tech Computer Science & Engineering',
      institution: 'Example University',
      issueDate: '2026-08-18',
      issuerId: 'UNIV-NODE-01',
    });

    // Sign transaction with institution key
    tx.digitalSignature = Wallet.sign(institutionKeys.privateKey, tx.getSigningData());

    blockchain.addTransaction(tx);
    expect(blockchain.pendingTransactions.length).toBe(1);

    const newBlock = blockchain.minePendingTransactions(
      'UNIV-NODE-01',
      'Example University Node',
      institutionKeys.privateKey
    );

    expect(blockchain.chain.length).toBe(2);
    expect(newBlock.index).toBe(1);
    expect(newBlock.previousHash).toBe(blockchain.chain[0].hash);
    expect(newBlock.transactions.length).toBe(1);
    expect(newBlock.transactions[0].certificateId).toBe('CERT-2026-000001');
  });

  it('should compute Merkle Tree root and proof correctly', () => {
    const txHashes = ['hash1', 'hash2', 'hash3', 'hash4'];
    const tree = new MerkleTree(txHashes);
    const root = tree.getRoot();
    expect(root).toBeDefined();
    expect(root.length).toBe(64);

    const proof = tree.getProof('hash2');
    expect(proof.length).toBeGreaterThan(0);

    const isValid = MerkleTree.verifyProof('hash2', proof, root);
    expect(isValid).toBe(true);
  });

  it('should verify digital signatures using Ed25519', () => {
    const data = 'CERT-2026-000001:hash123:metadata456';
    const signature = Wallet.sign(institutionKeys.privateKey, data);
    const isValid = Wallet.verify(institutionKeys.publicKey, data, signature);
    expect(isValid).toBe(true);

    const isTamperedValid = Wallet.verify(institutionKeys.publicKey, 'TAMPERED_DATA', signature);
    expect(isTamperedValid).toBe(false);
  });

  it('should correctly verify valid certificates and detect tampered hashes', () => {
    const certHash = 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
    const tx = new Transaction({
      certificateId: 'CERT-2026-000002',
      certificateHash: certHash,
      studentName: 'Alice Smith',
      course: 'M.Sc Data Science',
      institution: 'Example University',
      issueDate: '2026-08-18',
      issuerId: 'UNIV-NODE-01',
    });

    tx.digitalSignature = Wallet.sign(institutionKeys.privateKey, tx.getSigningData());
    blockchain.addTransaction(tx);
    blockchain.minePendingTransactions('UNIV-NODE-01', 'Example University Node', institutionKeys.privateKey);

    // 1. Verify valid hash
    const resValid = blockchain.verifyCertificate('CERT-2026-000002', certHash, institutionKeys.publicKey);
    expect(resValid.isValid).toBe(true);
    expect(resValid.status).toBe('VALID');

    // 2. Verify tampered hash
    const resTampered = blockchain.verifyCertificate('CERT-2026-000002', 'TAMPERED_PDF_HASH_9999', institutionKeys.publicKey);
    expect(resTampered.isValid).toBe(false);
    expect(resTampered.status).toBe('INVALID');
    expect(resTampered.auditChecks.documentIntegrity).toBe(false);
  });

  it('should handle certificate revocation correctly', () => {
    const certHash = 'b775a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae4';
    const txIssue = new Transaction({
      certificateId: 'CERT-2026-000003',
      certificateHash: certHash,
      studentName: 'Bob Johnson',
      course: 'B.Sc Physics',
      institution: 'Example University',
      issueDate: '2026-08-18',
      issuerId: 'UNIV-NODE-01',
    });

    blockchain.addTransaction(txIssue);
    blockchain.minePendingTransactions('UNIV-NODE-01', 'Example University Node', institutionKeys.privateKey);

    // Add Revocation Transaction
    const txRevoke = new Transaction({
      certificateId: 'REVOKE-CERT-2026-000003',
      certificateHash: certHash,
      studentName: 'Bob Johnson',
      course: 'B.Sc Physics',
      institution: 'Example University',
      issueDate: '2026-08-18',
      issuerId: 'UNIV-NODE-01',
      type: 'REVOKE',
      revokedCertificateId: 'CERT-2026-000003',
      revocationReason: 'Academic misconduct investigation',
    });

    blockchain.addTransaction(txRevoke);
    blockchain.minePendingTransactions('UNIV-NODE-01', 'Example University Node', institutionKeys.privateKey);

    // Verify revoked status
    const res = blockchain.verifyCertificate('CERT-2026-000003', certHash, institutionKeys.publicKey);
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('REVOKED');
    expect(res.auditChecks.notRevoked).toBe(false);
    expect(res.reason).toContain('Academic misconduct investigation');
  });
});
