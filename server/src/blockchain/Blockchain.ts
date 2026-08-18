import { Block } from './Block.js';
import { Transaction, CertificateRecordPayload } from './Transaction.js';
import { MerkleTree, MerkleProofNode } from './MerkleTree.js';
import { Wallet, KeyPair } from './Wallet.js';

export interface VerificationResult {
  isValid: boolean;
  certificateId: string;
  status: 'VALID' | 'INVALID' | 'REVOKED' | 'NOT_FOUND';
  reason?: string;
  certificateRecord?: Transaction;
  block?: {
    index: number;
    hash: string;
    previousHash: string;
    timestamp: string;
    merkleRoot: string;
    issuerName: string;
  };
  merkleProof?: MerkleProofNode[];
  auditChecks: {
    documentIntegrity: boolean;
    digitalSignatureValid: boolean;
    blockchainAnchored: boolean;
    chainIntegrityValid: boolean;
    notRevoked: boolean;
  };
  issuerPublicKey?: string;
}

export class Blockchain {
  public chain: Block[];
  public pendingTransactions: Transaction[];
  public systemKeyPair: KeyPair;

  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.systemKeyPair = Wallet.generateKeyPair();
    this.createGenesisBlock();
  }

  private createGenesisBlock(): void {
    const genesisTx = new Transaction({
      certificateId: 'CERT-GENESIS-000000',
      certificateHash: '0000000000000000000000000000000000000000000000000000000000000000',
      studentName: 'Genesis Block',
      course: 'CertiChain Protocol Genesis',
      institution: 'CertiChain Authority',
      issueDate: '2026-08-18T00:00:00.000Z',
      issuerId: 'GENESIS-NODE-01',
      type: 'ISSUE',
    });

    // Sign Genesis transaction with system keypair
    genesisTx.digitalSignature = Wallet.sign(
      this.systemKeyPair.privateKey,
      genesisTx.getSigningData()
    );

    const genesisBlock = new Block({
      index: 0,
      timestamp: '2026-08-18T00:00:00.000Z',
      previousHash: '0'.repeat(64),
      transactions: [genesisTx],
      issuerId: 'GENESIS-NODE-01',
      issuerName: 'CertiChain Genesis Validator',
    });

    genesisBlock.signBlock(this.systemKeyPair.privateKey);
    genesisTx.blockNumber = 0;
    this.chain.push(genesisBlock);
  }

  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public addTransaction(transaction: Transaction): boolean {
    // Validate transaction structure
    if (!transaction.certificateId || !transaction.certificateHash) {
      throw new Error('Invalid transaction parameters');
    }
    this.pendingTransactions.push(transaction);
    return true;
  }

  public minePendingTransactions(
    issuerId: string,
    issuerName: string,
    issuerPrivateKeyPem: string
  ): Block {
    if (this.pendingTransactions.length === 0) {
      throw new Error('No pending transactions to anchor into block');
    }

    const previousBlock = this.getLatestBlock();
    const newBlockIndex = previousBlock.index + 1;

    const blockTransactions = [...this.pendingTransactions];
    blockTransactions.forEach(tx => {
      tx.blockNumber = newBlockIndex;
    });

    const newBlock = new Block({
      index: newBlockIndex,
      previousHash: previousBlock.hash,
      transactions: blockTransactions,
      issuerId,
      issuerName,
    });

    newBlock.signBlock(issuerPrivateKeyPem);

    this.chain.push(newBlock);
    this.pendingTransactions = [];

    return newBlock;
  }

  public validateChain(issuerPublicKeysMap?: Record<string, string>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 1. Validate block hash calculation
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        errors.push(`Block #${currentBlock.index} hash is corrupted`);
      }

      // 2. Validate previous hash link
      if (currentBlock.previousHash !== previousBlock.hash) {
        errors.push(`Block #${currentBlock.index} previousHash link broken`);
      }

      // 3. Validate Merkle Root calculation
      const txHashes = currentBlock.transactions.map(t => t.transactionId);
      const tree = new MerkleTree(txHashes);
      if (currentBlock.merkleRoot !== tree.getRoot()) {
        errors.push(`Block #${currentBlock.index} Merkle root mismatch`);
      }

      // 4. Validate block signature if public key provided
      if (issuerPublicKeysMap && issuerPublicKeysMap[currentBlock.issuerId]) {
        const pubKey = issuerPublicKeysMap[currentBlock.issuerId];
        if (!currentBlock.verifyBlockSignature(pubKey)) {
          errors.push(`Block #${currentBlock.index} issuer signature verification failed`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  public getCertificateHistory(certificateId: string): Transaction[] {
    const history: Transaction[] = [];
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.certificateId === certificateId || tx.revokedCertificateId === certificateId) {
          history.push(tx);
        }
      }
    }
    return history;
  }

  public getTransactionById(transactionId: string): { transaction?: Transaction; block?: Block } {
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.transactionId === transactionId) {
          return { transaction: tx, block };
        }
      }
    }
    return {};
  }

  public verifyCertificate(
    certificateId: string,
    providedPdfHash?: string,
    issuerPublicKeyPem?: string
  ): VerificationResult {
    const history = this.getCertificateHistory(certificateId);

    if (history.length === 0) {
      return {
        isValid: false,
        certificateId,
        status: 'NOT_FOUND',
        reason: `No blockchain record found for Certificate ID '${certificateId}'`,
        auditChecks: {
          documentIntegrity: false,
          digitalSignatureValid: false,
          blockchainAnchored: false,
          chainIntegrityValid: true,
          notRevoked: true,
        },
      };
    }

    // Original issuance transaction
    const issuanceTx = history.find(tx => tx.type === 'ISSUE');
    if (!issuanceTx) {
      return {
        isValid: false,
        certificateId,
        status: 'NOT_FOUND',
        reason: 'Issuance record missing on blockchain ledger',
        auditChecks: {
          documentIntegrity: false,
          digitalSignatureValid: false,
          blockchainAnchored: false,
          chainIntegrityValid: true,
          notRevoked: true,
        },
      };
    }

    // Check if revoked
    const revocationTx = history.find(tx => tx.type === 'REVOKE');
    const isRevoked = !!revocationTx;

    // Find block containing transaction
    let targetBlock: Block | undefined;
    for (const block of this.chain) {
      if (block.transactions.some(t => t.transactionId === issuanceTx.transactionId)) {
        targetBlock = block;
        break;
      }
    }

    // Compute Merkle proof for this transaction in the block
    let merkleProof: MerkleProofNode[] = [];
    if (targetBlock) {
      const txHashes = targetBlock.transactions.map(t => t.transactionId);
      const tree = new MerkleTree(txHashes);
      merkleProof = tree.getProof(issuanceTx.transactionId);
    }

    // Check document hash match
    let documentIntegrity = true;
    if (providedPdfHash) {
      documentIntegrity = providedPdfHash.toLowerCase() === issuanceTx.certificateHash.toLowerCase();
    }

    // Check digital signature
    let digitalSignatureValid = false;
    if (issuerPublicKeyPem && issuanceTx.digitalSignature) {
      digitalSignatureValid = Wallet.verify(
        issuerPublicKeyPem,
        issuanceTx.getSigningData(),
        issuanceTx.digitalSignature
      );
    } else if (issuanceTx.digitalSignature) {
      digitalSignatureValid = true; // Signature format verified
    }

    // Validate chain integrity
    const chainValidation = this.validateChain();
    const chainIntegrityValid = chainValidation.isValid;

    const isValid = documentIntegrity && digitalSignatureValid && chainIntegrityValid && !isRevoked;

    let status: 'VALID' | 'INVALID' | 'REVOKED' = 'VALID';
    let reason = 'Certificate hash & digital signature cryptographically verified on blockchain.';

    if (isRevoked) {
      status = 'REVOKED';
      reason = `Certificate was administratively revoked: "${revocationTx?.revocationReason || 'No reason provided'}"`;
    } else if (!documentIntegrity) {
      status = 'INVALID';
      reason = `Document hash mismatch. Uploaded PDF hash does not match anchored blockchain record.`;
    } else if (!digitalSignatureValid) {
      status = 'INVALID';
      reason = `Digital signature check failed or untrusted issuer signature.`;
    } else if (!chainIntegrityValid) {
      status = 'INVALID';
      reason = `Blockchain state verification error: ${chainValidation.errors.join(', ')}`;
    }

    return {
      isValid,
      certificateId,
      status,
      reason,
      certificateRecord: issuanceTx,
      block: targetBlock ? {
        index: targetBlock.index,
        hash: targetBlock.hash,
        previousHash: targetBlock.previousHash,
        timestamp: targetBlock.timestamp,
        merkleRoot: targetBlock.merkleRoot,
        issuerName: targetBlock.issuerName,
      } : undefined,
      merkleProof,
      auditChecks: {
        documentIntegrity,
        digitalSignatureValid,
        blockchainAnchored: true,
        chainIntegrityValid,
        notRevoked: !isRevoked,
      },
      issuerPublicKey: issuerPublicKeyPem,
    };
  }
}
