import crypto from 'crypto';
import { Transaction } from './Transaction.js';
import { MerkleTree } from './MerkleTree.js';
import { Wallet } from './Wallet.js';

export interface BlockPayload {
  index: number;
  timestamp?: string;
  previousHash: string;
  transactions: Transaction[];
  issuerId: string;
  issuerName: string;
  nonce?: number;
  hash?: string;
  merkleRoot?: string;
  digitalSignature?: string;
}

export class Block {
  public index: number;
  public timestamp: string;
  public previousHash: string;
  public merkleRoot: string;
  public transactions: Transaction[];
  public issuerId: string;
  public issuerName: string;
  public nonce: number;
  public hash: string;
  public digitalSignature: string;

  constructor(payload: BlockPayload) {
    this.index = payload.index;
    this.timestamp = payload.timestamp || new Date().toISOString();
    this.previousHash = payload.previousHash;
    this.transactions = payload.transactions.map(tx => tx instanceof Transaction ? tx : new Transaction(tx));
    this.issuerId = payload.issuerId;
    this.issuerName = payload.issuerName;
    this.nonce = payload.nonce || 0;

    // Calculate Merkle root
    const txHashes = this.transactions.map(t => t.transactionId);
    const merkleTree = new MerkleTree(txHashes);
    this.merkleRoot = payload.merkleRoot || merkleTree.getRoot();

    // Calculate block hash
    this.hash = payload.hash || this.calculateHash();
    this.digitalSignature = payload.digitalSignature || '';
  }

  public calculateHash(): string {
    const data = `${this.index}:${this.timestamp}:${this.previousHash}:${this.merkleRoot}:${this.issuerId}:${this.nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public signBlock(privateKeyPem: string): string {
    const blockData = `${this.hash}:${this.merkleRoot}:${this.issuerId}`;
    this.digitalSignature = Wallet.sign(privateKeyPem, blockData);
    return this.digitalSignature;
  }

  public verifyBlockSignature(publicKeyPem: string): boolean {
    if (!this.digitalSignature) return false;
    const blockData = `${this.hash}:${this.merkleRoot}:${this.issuerId}`;
    return Wallet.verify(publicKeyPem, blockData, this.digitalSignature);
  }
}
