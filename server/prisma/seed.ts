import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Wallet } from '../src/blockchain/Wallet.js';
import { Blockchain } from '../src/blockchain/Blockchain.js';
import { Transaction } from '../src/blockchain/Transaction.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CertiChain database...');

  // Clean existing tables
  await prisma.verificationLog.deleteMany({});
  await prisma.revocation.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.blockchainBlock.deleteMany({});
  await prisma.certificate.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.institution.deleteMany({});

  // Generate Ed25519 KeyPair for Institution
  const keys = Wallet.generateKeyPair();

  // Create Institution
  const institution = await prisma.institution.create({
    data: {
      name: 'Example University',
      code: 'UNIV-01',
      logoUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80',
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      website: 'https://university.example.edu',
      isVerified: true,
    },
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Institution Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@university.edu',
      password: hashedPassword,
      name: 'Dr. Arthur Pendelton',
      role: 'INSTITUTION_ADMIN',
      institutionId: institution.id,
    },
  });

  // Create Student
  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: hashedPassword,
      name: 'Nipun Kumar Kushwah',
      role: 'STUDENT',
    },
  });

  // Initialize Blockchain engine and seed blocks
  const blockchain = new Blockchain();

  // Certificate 1 (Valid)
  const cert1Tx = new Transaction({
    certificateId: 'CERT-2026-000001',
    certificateHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    studentName: 'Nipun Kumar Kushwah',
    course: 'B.Tech Computer Science & Engineering',
    institution: institution.name,
    issueDate: '18 August 2026',
    issuerId: institution.code,
  });
  cert1Tx.digitalSignature = Wallet.sign(keys.privateKey, cert1Tx.getSigningData());
  blockchain.addTransaction(cert1Tx);

  const block1 = blockchain.minePendingTransactions(institution.code, institution.name, keys.privateKey);

  // Certificate 2 (Valid)
  const cert2Tx = new Transaction({
    certificateId: 'CERT-2026-000002',
    certificateHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    studentName: 'Sophia Lin',
    course: 'Master of Science in Artificial Intelligence',
    institution: institution.name,
    issueDate: '15 June 2026',
    issuerId: institution.code,
  });
  cert2Tx.digitalSignature = Wallet.sign(keys.privateKey, cert2Tx.getSigningData());
  blockchain.addTransaction(cert2Tx);

  const block2 = blockchain.minePendingTransactions(institution.code, institution.name, keys.privateKey);

  // Certificate 3 (Revoked Sample)
  const cert3Tx = new Transaction({
    certificateId: 'CERT-2026-000003',
    certificateHash: '9a31a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ef9',
    studentName: 'Marcus Vance',
    course: 'Executive MBA',
    institution: institution.name,
    issueDate: '10 January 2026',
    issuerId: institution.code,
  });
  cert3Tx.digitalSignature = Wallet.sign(keys.privateKey, cert3Tx.getSigningData());
  blockchain.addTransaction(cert3Tx);

  const block3 = blockchain.minePendingTransactions(institution.code, institution.name, keys.privateKey);

  // Revocation transaction for CERT-2026-000003
  const cert3RevokeTx = new Transaction({
    certificateId: `REVOKE-CERT-2026-000003`,
    certificateHash: '9a31a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ef9',
    studentName: 'Marcus Vance',
    course: 'Executive MBA',
    institution: institution.name,
    issueDate: '10 January 2026',
    issuerId: institution.code,
    type: 'REVOKE',
    revokedCertificateId: 'CERT-2026-000003',
    revocationReason: 'Administrative revocation due to credential misrepresentation',
  });
  cert3RevokeTx.digitalSignature = Wallet.sign(keys.privateKey, cert3RevokeTx.getSigningData());
  blockchain.addTransaction(cert3RevokeTx);

  const block4 = blockchain.minePendingTransactions(institution.code, institution.name, keys.privateKey);

  // Persist Blocks and Transactions to Database
  for (const b of blockchain.chain) {
    const dbBlock = await prisma.blockchainBlock.create({
      data: {
        index: b.index,
        timestamp: b.timestamp,
        previousHash: b.previousHash,
        hash: b.hash,
        merkleRoot: b.merkleRoot,
        issuerId: b.issuerId,
        issuerName: b.issuerName,
        digitalSignature: b.digitalSignature,
        nonce: b.nonce,
      },
    });

    for (const tx of b.transactions) {
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
          blockNumber: b.index,
          blockId: dbBlock.id,
        },
      });
    }
  }

  // Persist Certificates to DB
  await prisma.certificate.create({
    data: {
      certificateId: 'CERT-2026-000001',
      certificateHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      studentName: 'Nipun Kumar Kushwah',
      studentId: 'STU-9921',
      course: 'B.Tech Computer Science & Engineering',
      grade: 'Distinction (9.4 CGPA)',
      issueDate: '18 August 2026',
      institutionId: institution.id,
      status: 'ACTIVE',
      blockNumber: 1,
      transactionId: cert1Tx.transactionId,
    },
  });

  await prisma.certificate.create({
    data: {
      certificateId: 'CERT-2026-000002',
      certificateHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      studentName: 'Sophia Lin',
      studentId: 'STU-4402',
      course: 'Master of Science in Artificial Intelligence',
      grade: 'Summa Cum Laude',
      issueDate: '15 June 2026',
      institutionId: institution.id,
      status: 'ACTIVE',
      blockNumber: 2,
      transactionId: cert2Tx.transactionId,
    },
  });

  const cert3 = await prisma.certificate.create({
    data: {
      certificateId: 'CERT-2026-000003',
      certificateHash: '9a31a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ef9',
      studentName: 'Marcus Vance',
      studentId: 'STU-1088',
      course: 'Executive MBA',
      grade: 'Passed',
      issueDate: '10 January 2026',
      institutionId: institution.id,
      status: 'REVOKED',
      blockNumber: 3,
      transactionId: cert3Tx.transactionId,
    },
  });

  await prisma.revocation.create({
    data: {
      certificateId: cert3.certificateId,
      reason: 'Administrative revocation due to credential misrepresentation',
      revokedBy: admin.email,
      transactionId: cert3RevokeTx.transactionId,
    },
  });

  console.log('✅ CertiChain Database Seeded Successfully!');
  console.log(`📌 Admin Email: admin@university.edu | Password: password123`);
  console.log(`📌 Student Email: student@example.com | Password: password123`);
  console.log(`📌 Sample Certificate IDs: CERT-2026-000001, CERT-2026-000002, CERT-2026-000003 (REVOKED)`);
}

main()
  .catch(e => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
