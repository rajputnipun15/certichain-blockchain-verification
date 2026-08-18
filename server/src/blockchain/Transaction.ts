import crypto from 'crypto';

export type TransactionType = 'ISSUE' | 'REVOKE';

export interface CertificateRecordPayload {
  certificateId: string;
  certificateHash: string;
  studentName: string;
  course: string;
  institution: string;
  issueDate: string;
  issuerId: string;
  metadataHash?: string;
  timestamp?: string;
  digitalSignature?: string;
  type?: TransactionType;
  revokedCertificateId?: string;
  revocationReason?: string;
}

export class Transaction {
  public transactionId: string;
  public certificateId: string;
  public certificateHash: string;
  public studentName: string;
  public course: string;
  public institution: string;
  public issueDate: string;
  public issuerId: string;
  public metadataHash: string;
  public timestamp: string;
  public digitalSignature: string;
  public type: TransactionType;
  public revokedCertificateId?: string;
  public revocationReason?: string;
  public blockNumber?: number;

  constructor(payload: CertificateRecordPayload) {
    this.certificateId = payload.certificateId;
    this.certificateHash = payload.certificateHash;
    this.studentName = payload.studentName;
    this.course = payload.course;
    this.institution = payload.institution;
    this.issueDate = payload.issueDate;
    this.issuerId = payload.issuerId;
    this.timestamp = payload.timestamp || new Date().toISOString();
    this.type = payload.type || 'ISSUE';
    this.revokedCertificateId = payload.revokedCertificateId;
    this.revocationReason = payload.revocationReason;

    // Calculate metadata hash
    this.metadataHash = payload.metadataHash || this.calculateMetadataHash();
    this.digitalSignature = payload.digitalSignature || '';
    
    // Generate transaction ID
    this.transactionId = this.calculateTransactionId();
  }

  public calculateMetadataHash(): string {
    const raw = `${this.certificateId}:${this.studentName}:${this.course}:${this.institution}:${this.issueDate}:${this.issuerId}:${this.type}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  public calculateTransactionId(): string {
    const data = `${this.certificateId}:${this.certificateHash}:${this.metadataHash}:${this.timestamp}:${this.issuerId}:${this.type}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public getSigningData(): string {
    return `${this.transactionId}:${this.certificateHash}:${this.metadataHash}`;
  }
}
