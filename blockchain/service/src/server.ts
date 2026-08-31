import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config, validateConfig } from './config';
import { logger } from './logger';
import { BlockchainService } from './blockchain';
import routes, { setBlockchainService } from './routes';

const app = express();

// Validate configuration on startup
try {
  validateConfig();
  logger.info('Configuration validated successfully');
} catch (error) {
  logger.error('Configuration validation failed', { error });
  process.exit(1);
}

// Initialize blockchain service
const blockchainService = new BlockchainService();
setBlockchainService(blockchainService);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.api.rateLimitWindowMs,
  max: config.api.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/v1/blockchain', limiter);

// Routes
app.use('/api/v1/blockchain', routes);

// Root endpoint
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    name: 'Blockchain Evidence Registry Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/v1/blockchain/health',
      metrics: '/api/v1/blockchain/metrics',
      anchor: '/api/v1/blockchain/anchor',
      verify: '/api/v1/blockchain/verify',
      records: '/api/v1/blockchain/records/:id',
      total: '/api/v1/blockchain/total'
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ 
    error: 'Internal server error',
    details: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Blockchain Evidence Service started on port ${PORT}`, {
    port: PORT,
    nodeEnv: config.nodeEnv,
    contractAddress: config.blockchain.contractAddress
  });
});

export default app;
