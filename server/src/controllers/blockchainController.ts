import { Request, Response } from 'express';
import { blockchain } from '../blockchainInstance.js';
import { MerkleTree } from '../blockchain/MerkleTree.js';
import { prisma } from '../db.js';

export async function getChainStats(req: Request, res: Response) {
  try {
    const chainValidation = blockchain.validateChain();

    const totalBlocks = blockchain.chain.length;
    let totalTransactions = 0;
    blockchain.chain.forEach(b => {
      totalTransactions += b.transactions.length;
    });

    const activeInstitutionsCount = await prisma.institution.count();

    return res.json({
      totalBlocks,
      totalTransactions,
      latestBlock: {
        index: blockchain.getLatestBlock().index,
        hash: blockchain.getLatestBlock().hash,
        timestamp: blockchain.getLatestBlock().timestamp,
        merkleRoot: blockchain.getLatestBlock().merkleRoot,
      },
      activeInstitutionsCount,
      isChainValid: chainValidation.isValid,
      chainErrors: chainValidation.errors,
      consensusModel: 'Proof of Authority (PoA) Institutional Consensus',
      hashingAlgorithm: 'SHA-256',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch blockchain stats' });
  }
}

export async function getBlocks(req: Request, res: Response) {
  try {
    const { limit = 20, page = 1 } = req.query;

    const blocks = blockchain.chain
      .slice()
      .reverse()
      .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

    return res.json({
      blocks: blocks.map(b => ({
        index: b.index,
        timestamp: b.timestamp,
        previousHash: b.previousHash,
        hash: b.hash,
        merkleRoot: b.merkleRoot,
        issuerId: b.issuerId,
        issuerName: b.issuerName,
        transactionCount: b.transactions.length,
        digitalSignature: b.digitalSignature,
      })),
      totalBlocks: blockchain.chain.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch blocks' });
  }
}

export async function getBlockByIndex(req: Request, res: Response) {
  try {
    const index = parseInt(req.params.index, 10);
    const block = blockchain.chain.find(b => b.index === index);

    if (!block) {
      return res.status(404).json({ error: `Block #${index} not found` });
    }

    return res.json({ block });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch block details' });
  }
}

export async function getTransactions(req: Request, res: Response) {
  try {
    const transactions: any[] = [];
    blockchain.chain.forEach(b => {
      b.transactions.forEach(t => {
        transactions.push({
          ...t,
          blockNumber: b.index,
          blockHash: b.hash,
        });
      });
    });

    transactions.reverse();

    return res.json({
      transactions,
      totalTransactions: transactions.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch transactions' });
  }
}

export async function getTransactionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { transaction, block } = blockchain.getTransactionById(id);

    if (!transaction || !block) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const txHashes = block.transactions.map(t => t.transactionId);
    const merkleTree = new MerkleTree(txHashes);
    const merkleProof = merkleTree.getProof(transaction.transactionId);

    return res.json({
      transaction,
      block: {
        index: block.index,
        hash: block.hash,
        previousHash: block.previousHash,
        merkleRoot: block.merkleRoot,
        timestamp: block.timestamp,
        issuerName: block.issuerName,
      },
      merkleProof,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch transaction' });
  }
}

export async function getMerkleProof(req: Request, res: Response) {
  try {
    const { certificateId } = req.params;
    const history = blockchain.getCertificateHistory(certificateId);

    if (history.length === 0) {
      return res.status(404).json({ error: 'Certificate transaction not found' });
    }

    const tx = history[0];
    const { block } = blockchain.getTransactionById(tx.transactionId);

    if (!block) {
      return res.status(404).json({ error: 'Block not found for transaction' });
    }

    const txHashes = block.transactions.map(t => t.transactionId);
    const merkleTree = new MerkleTree(txHashes);
    const proof = merkleTree.getProof(tx.transactionId);

    return res.json({
      certificateId,
      transactionId: tx.transactionId,
      certificateHash: tx.certificateHash,
      blockIndex: block.index,
      blockHash: block.hash,
      merkleRoot: block.merkleRoot,
      proof,
      allBlockTxHashes: txHashes,
      merkleLayers: merkleTree.layers,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate Merkle proof' });
  }
}
