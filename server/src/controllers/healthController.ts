import { Request, Response } from 'express';
import { blockchain } from '../blockchainInstance.js';

export function getHealth(req: Request, res: Response) {
  const chainValidation = blockchain.validateChain();
  return res.json({
    status: 'UP',
    service: 'CertiChain Core Protocol API',
    timestamp: new Date().toISOString(),
    blockchain: {
      blocks: blockchain.chain.length,
      isValid: chainValidation.isValid,
    },
  });
}
