import { Blockchain } from './blockchain/Blockchain.js';
import { Block } from './blockchain/Block.js';
import { Transaction } from './blockchain/Transaction.js';
import { prisma } from './db.js';

export const blockchain = new Blockchain();

export async function syncBlockchainFromDb(): Promise<Blockchain> {
  try {
    const blocks = await prisma.blockchainBlock.findMany({
      orderBy: { index: 'asc' },
      include: { transactions: true },
    });

    if (blocks.length > 0) {
      // Reconstruct chain from DB
      const loadedChain: Block[] = blocks.map(b => {
        const txs = b.transactions.map(t => new Transaction({
          certificateId: t.certificateId,
          certificateHash: t.certificateHash,
          studentName: t.studentName,
          course: t.course,
          institution: t.institutionName,
          issueDate: t.issueDate,
          issuerId: t.issuerId,
          metadataHash: t.metadataHash,
          timestamp: t.timestamp,
          digitalSignature: t.digitalSignature,
          type: t.type as any,
          revokedCertificateId: t.revokedCertificateId || undefined,
          revocationReason: t.revocationReason || undefined,
        }));

        const blockObj = new Block({
          index: b.index,
          timestamp: b.timestamp,
          previousHash: b.previousHash,
          transactions: txs,
          issuerId: b.issuerId,
          issuerName: b.issuerName,
          nonce: b.nonce,
          hash: b.hash,
          merkleRoot: b.merkleRoot,
          digitalSignature: b.digitalSignature,
        });

        return blockObj;
      });

      blockchain.chain = loadedChain;
    }
  } catch (err) {
    console.error('Error syncing blockchain from DB:', err);
  }
  return blockchain;
}
