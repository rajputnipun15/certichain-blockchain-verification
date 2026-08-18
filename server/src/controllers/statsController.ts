import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { blockchain } from '../blockchainInstance.js';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const totalCertificates = await prisma.certificate.count();
    const activeCertificates = await prisma.certificate.count({ where: { status: 'ACTIVE' } });
    const revokedCertificates = await prisma.certificate.count({ where: { status: 'REVOKED' } });
    const totalVerifications = await prisma.verificationLog.count();
    const successfulVerifications = await prisma.verificationLog.count({ where: { isVerified: true } });

    const totalBlocks = blockchain.chain.length;
    let totalTransactions = 0;
    blockchain.chain.forEach(b => { totalTransactions += b.transactions.length; });

    // Recent activity log
    const recentCertificates = await prisma.certificate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { institution: true },
    });

    const recentVerifications = await prisma.verificationLog.findMany({
      take: 5,
      orderBy: { verifiedAt: 'desc' },
    });

    return res.json({
      stats: {
        totalCertificates,
        activeCertificates,
        revokedCertificates,
        totalVerifications,
        successfulVerifications,
        totalBlocks,
        totalTransactions,
      },
      recentCertificates,
      recentVerifications,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch dashboard stats' });
  }
}
