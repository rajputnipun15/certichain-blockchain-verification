import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { syncBlockchainFromDb } from '../src/blockchainInstance.js';

describe('CertiChain REST API Integration Tests', () => {
  beforeAll(async () => {
    await syncBlockchainFromDb();
  });

  it('GET /api/health should return UP status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.blockchain.blocks).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/blockchain should return chain statistics', async () => {
    const res = await request(app).get('/api/blockchain');
    expect(res.status).toBe(200);
    expect(res.body.totalBlocks).toBeGreaterThanOrEqual(1);
    expect(res.body.isChainValid).toBe(true);
    expect(res.body.consensusModel).toBe('Proof of Authority (PoA) Institutional Consensus');
  });

  it('GET /api/verify/CERT-2026-000001 should verify valid certificate', async () => {
    const res = await request(app).get('/api/verify/CERT-2026-000001');
    expect(res.status).toBe(200);
    expect(res.body.verification.isValid).toBe(true);
    expect(res.body.verification.status).toBe('VALID');
    expect(res.body.certificateDetails.studentName).toBe('Nipun Kumar Kushwah');
  });

  it('GET /api/verify/CERT-2026-000003 should return REVOKED status', async () => {
    const res = await request(app).get('/api/verify/CERT-2026-000003');
    expect(res.status).toBe(200);
    expect(res.body.verification.isValid).toBe(false);
    expect(res.body.verification.status).toBe('REVOKED');
    expect(res.body.verification.reason).toContain('Administrative revocation');
  });

  it('POST /api/verify/document with tampered hash should fail verification', async () => {
    const res = await request(app)
      .post('/api/verify/document')
      .send({ certificateId: 'CERT-2026-000001', hash: 'TAMPERED_HASH_1234567890' });
    expect(res.status).toBe(200);
    expect(res.body.verification.isValid).toBe(false);
    expect(res.body.verification.status).toBe('INVALID');
    expect(res.body.isHashMatch).toBe(false);
  });

  it('POST /api/auth/login with seeded admin credentials should authenticate', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@university.edu', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('INSTITUTION_ADMIN');
  });
});
