import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { syncBlockchainFromDb } from './blockchainInstance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', apiRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'CertiChain Core Protocol API',
    description: 'Blockchain-Based Certificate Issuance & Verification Platform',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Sync Blockchain state from DB and start server
async function startServer() {
  await syncBlockchainFromDb();
  app.listen(PORT, () => {
    console.log(`🚀 CertiChain Backend API Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
