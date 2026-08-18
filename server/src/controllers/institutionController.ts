import { Request, Response } from 'express';
import { prisma } from '../db.js';
import { Wallet } from '../blockchain/Wallet.js';

export async function getInstitutions(req: Request, res: Response) {
  try {
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        logoUrl: true,
        publicKey: true,
        website: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { certificates: true },
        },
      },
    });
    return res.json({ institutions });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch institutions' });
  }
}

export async function createInstitution(req: Request, res: Response) {
  try {
    const { name, code, logoUrl, website } = req.body;
    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const existing = await prisma.institution.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: 'Institution code already exists' });
    }

    const keys = Wallet.generateKeyPair();
    const institution = await prisma.institution.create({
      data: {
        name,
        code,
        logoUrl: logoUrl || null,
        website: website || null,
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        isVerified: true,
      },
    });

    return res.status(201).json({
      institution: {
        id: institution.id,
        name: institution.name,
        code: institution.code,
        publicKey: institution.publicKey,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create institution' });
  }
}
