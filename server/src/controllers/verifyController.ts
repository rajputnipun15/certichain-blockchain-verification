import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../db.js';
import { blockchain } from '../blockchainInstance.js';

export async function verifyById(req: Request, res: Response) {
  try {
    const { certificateId } = req.params;
    const providedHash = req.query.hash as string | undefined;

    const certInDb = await prisma.certificate.findFirst({
      where: { certificateId },
      include: { institution: true, revocation: true },
    });

    const issuerPublicKeyPem = certInDb?.institution.publicKey;

    // Perform Blockchain Core Verification
    const verification = blockchain.verifyCertificate(certificateId, providedHash, issuerPublicKeyPem);

    // Save Verification Log to DB
    await prisma.verificationLog.create({
      data: {
        certificateId,
        providedHash: providedHash || null,
        isVerified: verification.isValid,
        status: verification.status,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('user-agent') || 'Public Verifier',
      },
    });

    return res.json({
      verification,
      certificateDetails: certInDb ? {
        id: certInDb.id,
        certificateId: certInDb.certificateId,
        studentName: certInDb.studentName,
        course: certInDb.course,
        grade: certInDb.grade,
        issueDate: certInDb.issueDate,
        institutionName: certInDb.institution.name,
        institutionLogo: certInDb.institution.logoUrl,
        institutionCode: certInDb.institution.code,
        status: certInDb.status,
        revocation: certInDb.revocation,
      } : null,
    });
  } catch (err: any) {
    console.error('Error verifying certificate by ID:', err);
    return res.status(500).json({ error: err.message || 'Verification process failed' });
  }
}

export async function verifyDocument(req: Request, res: Response) {
  try {
    let certificateId = req.body.certificateId;
    let computedPdfHash = req.body.hash || req.body.providedHash;

    // Handle file upload if provided
    if (req.file) {
      computedPdfHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    }

    if (!computedPdfHash) {
      return res.status(400).json({ error: 'Either PDF file upload or hash is required for document verification' });
    }

    // Search database for certificate matching computed file hash if certificateId was not provided
    let certInDb = null;
    if (certificateId) {
      certInDb = await prisma.certificate.findFirst({
        where: { certificateId },
        include: { institution: true, revocation: true },
      });
    } else {
      certInDb = await prisma.certificate.findFirst({
        where: { certificateHash: computedPdfHash },
        include: { institution: true, revocation: true },
      });
      if (certInDb) {
        certificateId = certInDb.certificateId;
      }
    }

    if (!certificateId || !certInDb) {
      // Save failed log
      await prisma.verificationLog.create({
        data: {
          certificateId: certificateId || 'UNKNOWN_DOC',
          providedHash: computedPdfHash,
          isVerified: false,
          status: 'NOT_FOUND',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.get('user-agent') || 'Public Verifier',
        },
      });

      return res.status(200).json({
        verification: {
          isValid: false,
          certificateId: certificateId || 'UNKNOWN_DOC',
          status: 'NOT_FOUND',
          reason: 'Document hash does not match any anchored record on the CertiChain blockchain.',
          auditChecks: {
            documentIntegrity: false,
            digitalSignatureValid: false,
            blockchainAnchored: false,
            chainIntegrityValid: true,
            notRevoked: true,
          },
        },
        computedHash: computedPdfHash,
        certificateDetails: null,
      });
    }

    const verification = blockchain.verifyCertificate(
      certificateId,
      computedPdfHash,
      certInDb.institution.publicKey
    );

    await prisma.verificationLog.create({
      data: {
        certificateId,
        providedHash: computedPdfHash,
        isVerified: verification.isValid,
        status: verification.status,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.get('user-agent') || 'Public Verifier',
      },
    });

    return res.json({
      verification,
      computedHash: computedPdfHash,
      expectedHash: certInDb.certificateHash,
      isHashMatch: computedPdfHash.toLowerCase() === certInDb.certificateHash.toLowerCase(),
      certificateDetails: {
        id: certInDb.id,
        certificateId: certInDb.certificateId,
        studentName: certInDb.studentName,
        course: certInDb.course,
        grade: certInDb.grade,
        issueDate: certInDb.issueDate,
        institutionName: certInDb.institution.name,
        institutionLogo: certInDb.institution.logoUrl,
        institutionCode: certInDb.institution.code,
        status: certInDb.status,
        revocation: certInDb.revocation,
      },
    });
  } catch (err: any) {
    console.error('Error verifying document:', err);
    return res.status(500).json({ error: err.message || 'Document verification failed' });
  }
}
