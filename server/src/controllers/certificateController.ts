import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { blockchain } from '../blockchainInstance.js';
import { Transaction } from '../blockchain/Transaction.js';
import { Wallet } from '../blockchain/Wallet.js';
import { generateCertificatePDF } from '../services/pdfService.js';

export async function issueCertificate(req: AuthRequest, res: Response) {
  try {
    const { studentName, studentId, course, grade, issueDate } = req.body;
    let institutionId = req.user?.institutionId;

    if (!studentName || !course) {
      return res.status(400).json({ error: 'studentName and course are required' });
    }

    // Default to first institution if not bound
    let institution = await prisma.institution.findFirst({
      where: institutionId ? { id: institutionId } : {},
    });

    if (!institution) {
      // Fallback: create default institution if none exists
      const keys = Wallet.generateKeyPair();
      institution = await prisma.institution.create({
        data: {
          name: 'CertiChain Academic Authority',
          code: 'CERT-AUTH-01',
          publicKey: keys.publicKey,
          privateKey: keys.privateKey,
        },
      });
    }

    // Generate unique Certificate ID
    const count = await prisma.certificate.count();
    const certNum = String(count + 1).padStart(6, '0');
    const certificateId = req.body.certificateId || `CERT-2026-${certNum}`;

    const dateStr = issueDate || new Date().toISOString().split('T')[0];

    // Compute document & metadata hash
    let certificateHash = req.body.certificateHash;
    if (!certificateHash) {
      const rawPayload = `${certificateId}:${studentName}:${course}:${institution.name}:${dateStr}`;
      certificateHash = crypto.createHash('sha256').update(rawPayload).digest('hex');
    }

    // Create & sign Blockchain Transaction
    const tx = new Transaction({
      certificateId,
      certificateHash,
      studentName,
      course,
      institution: institution.name,
      issueDate: dateStr,
      issuerId: institution.code,
      type: 'ISSUE',
    });

    tx.digitalSignature = Wallet.sign(institution.privateKey, tx.getSigningData());

    // Add transaction to pending pool & mine block immediately
    blockchain.addTransaction(tx);
    const block = blockchain.minePendingTransactions(
      institution.code,
      institution.name,
      institution.privateKey
    );

    // Save Block to DB if not saved
    const dbBlock = await prisma.blockchainBlock.create({
      data: {
        index: block.index,
        timestamp: block.timestamp,
        previousHash: block.previousHash,
        hash: block.hash,
        merkleRoot: block.merkleRoot,
        issuerId: block.issuerId,
        issuerName: block.issuerName,
        digitalSignature: block.digitalSignature,
        nonce: block.nonce,
      },
    });

    // Save Transaction to DB
    const dbTx = await prisma.transaction.create({
      data: {
        transactionId: tx.transactionId,
        certificateId: tx.certificateId,
        certificateHash: tx.certificateHash,
        studentName: tx.studentName,
        course: tx.course,
        institutionName: tx.institution,
        issueDate: tx.issueDate,
        issuerId: tx.issuerId,
        metadataHash: tx.metadataHash,
        timestamp: tx.timestamp,
        digitalSignature: tx.digitalSignature,
        type: tx.type,
        blockNumber: block.index,
        blockId: dbBlock.id,
      },
    });

    // Save Certificate record to DB
    const certificate = await prisma.certificate.create({
      data: {
        certificateId,
        certificateHash,
        studentName,
        studentId: studentId || null,
        course,
        grade: grade || null,
        issueDate: dateStr,
        institutionId: institution.id,
        status: 'ACTIVE',
        blockNumber: block.index,
        transactionId: tx.transactionId,
      },
    });

    return res.status(201).json({
      message: 'Certificate successfully issued & anchored to blockchain',
      certificate,
      blockchainRecord: {
        blockNumber: block.index,
        blockHash: block.hash,
        merkleRoot: block.merkleRoot,
        transactionId: tx.transactionId,
        digitalSignature: tx.digitalSignature,
      },
    });
  } catch (err: any) {
    console.error('Error issuing certificate:', err);
    return res.status(500).json({ error: err.message || 'Failed to issue certificate' });
  }
}

export async function getCertificates(req: AuthRequest, res: Response) {
  try {
    const { search, status, limit = 50, page = 1 } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (search) {
      where.OR = [
        { certificateId: { contains: String(search) } },
        { studentName: { contains: String(search) } },
        { course: { contains: String(search) } },
      ];
    }

    const certificates = await prisma.certificate.findMany({
      where,
      include: { institution: true, revocation: true },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
    });

    const total = await prisma.certificate.count({ where });

    return res.json({
      certificates,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch certificates' });
  }
}

export async function getCertificateById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateId: id }],
      },
      include: { institution: true, revocation: true },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const history = blockchain.getCertificateHistory(certificate.certificateId);

    return res.json({
      certificate,
      blockchainHistory: history,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch certificate details' });
  }
}

export async function revokeCertificate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Revocation reason is required' });
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateId: id }],
      },
      include: { institution: true },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (certificate.status === 'REVOKED') {
      return res.status(400).json({ error: 'Certificate is already revoked' });
    }

    const institution = certificate.institution;

    // Create & Sign Revocation Blockchain Transaction
    const tx = new Transaction({
      certificateId: `REVOKE-${certificate.certificateId}`,
      certificateHash: certificate.certificateHash,
      studentName: certificate.studentName,
      course: certificate.course,
      institution: institution.name,
      issueDate: certificate.issueDate,
      issuerId: institution.code,
      type: 'REVOKE',
      revokedCertificateId: certificate.certificateId,
      revocationReason: reason,
    });

    tx.digitalSignature = Wallet.sign(institution.privateKey, tx.getSigningData());

    blockchain.addTransaction(tx);
    const block = blockchain.minePendingTransactions(
      institution.code,
      institution.name,
      institution.privateKey
    );

    // Save Block to DB
    const dbBlock = await prisma.blockchainBlock.create({
      data: {
        index: block.index,
        timestamp: block.timestamp,
        previousHash: block.previousHash,
        hash: block.hash,
        merkleRoot: block.merkleRoot,
        issuerId: block.issuerId,
        issuerName: block.issuerName,
        digitalSignature: block.digitalSignature,
        nonce: block.nonce,
      },
    });

    // Save Transaction to DB
    await prisma.transaction.create({
      data: {
        transactionId: tx.transactionId,
        certificateId: tx.certificateId,
        certificateHash: tx.certificateHash,
        studentName: tx.studentName,
        course: tx.course,
        institutionName: tx.institution,
        issueDate: tx.issueDate,
        issuerId: tx.issuerId,
        metadataHash: tx.metadataHash,
        timestamp: tx.timestamp,
        digitalSignature: tx.digitalSignature,
        type: tx.type,
        revokedCertificateId: tx.revokedCertificateId,
        revocationReason: tx.revocationReason,
        blockNumber: block.index,
        blockId: dbBlock.id,
      },
    });

    // Update Certificate Status to REVOKED
    await prisma.certificate.update({
      where: { id: certificate.id },
      data: { status: 'REVOKED' },
    });

    // Save Revocation Record
    const revocation = await prisma.revocation.create({
      data: {
        certificateId: certificate.certificateId,
        reason,
        revokedBy: req.user?.email || 'INSTITUTION_ADMIN',
        transactionId: tx.transactionId,
      },
    });

    return res.json({
      message: 'Certificate administratively revoked and revocation transaction anchored to blockchain',
      revocation,
      blockchainRecord: {
        blockNumber: block.index,
        blockHash: block.hash,
        transactionId: tx.transactionId,
      },
    });
  } catch (err: any) {
    console.error('Error revoking certificate:', err);
    return res.status(500).json({ error: err.message || 'Failed to revoke certificate' });
  }
}

export async function downloadCertificatePDF(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [{ id }, { certificateId: id }],
      },
      include: { institution: true },
    });

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const verificationUrl = `${protocol}://${host}/verify/${certificate.certificateId}`;

    const pdfBuffer = await generateCertificatePDF({
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      course: certificate.course,
      institutionName: certificate.institution.name,
      issueDate: certificate.issueDate,
      grade: certificate.grade || undefined,
      certificateHash: certificate.certificateHash,
      digitalSignature: certificate.transactionId || 'SIG-VERIFIED-CERTICHAIN',
      verificationUrl,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${certificate.certificateId}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err: any) {
    console.error('PDF generation error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate PDF certificate' });
  }
}
