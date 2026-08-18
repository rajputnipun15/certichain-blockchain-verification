import { Router } from 'express';
import multer from 'multer';
import * as authController from '../controllers/authController.js';
import * as certificateController from '../controllers/certificateController.js';
import * as verifyController from '../controllers/verifyController.js';
import * as blockchainController from '../controllers/blockchainController.js';
import * as institutionController from '../controllers/institutionController.js';
import * as statsController from '../controllers/statsController.js';
import * as healthController from '../controllers/healthController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Health
router.get('/health', healthController.getHealth);

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authenticateToken, authController.me);

// Certificates
router.post('/certificates', authenticateToken, requireRole('INSTITUTION_ADMIN', 'SUPER_ADMIN'), certificateController.issueCertificate);
router.get('/certificates', certificateController.getCertificates);
router.get('/certificates/:id', certificateController.getCertificateById);
router.get('/certificates/:id/pdf', certificateController.downloadCertificatePDF);
router.post('/certificates/:id/revoke', authenticateToken, requireRole('INSTITUTION_ADMIN', 'SUPER_ADMIN'), certificateController.revokeCertificate);

// Verification (Public)
router.get('/verify/:certificateId', verifyController.verifyById);
router.post('/verify/document', upload.single('file'), verifyController.verifyDocument);

// Blockchain Explorer
router.get('/blockchain', blockchainController.getChainStats);
router.get('/blocks', blockchainController.getBlocks);
router.get('/blocks/:index', blockchainController.getBlockByIndex);
router.get('/transactions', blockchainController.getTransactions);
router.get('/transactions/:id', blockchainController.getTransactionById);
router.get('/merkle-proof/:certificateId', blockchainController.getMerkleProof);

// Institutions
router.get('/institutions', institutionController.getInstitutions);
router.post('/institutions', authenticateToken, requireRole('SUPER_ADMIN'), institutionController.createInstitution);

// Stats & Dashboard
router.get('/stats', statsController.getDashboardStats);

export default router;
