import { Router, Request, Response } from 'express';
import { BlockchainService } from './blockchain';
import { logger } from './logger';

const router = Router();
let blockchainService: BlockchainService;

export function setBlockchainService(service: BlockchainService) {
  blockchainService = service;
}

// API Key middleware
function apiKeyMiddleware(req: Request, res: Response, next: Function) {
  const apiKey = req.headers['x-api-key'] as string;
  const configuredApiKey = process.env.API_KEY;
  
  // If API key is configured, require it
  if (configuredApiKey && apiKey !== configuredApiKey) {
    logger.warn('Unauthorized API access attempt', { ip: req.ip });
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  
  next();
}

// Anchor evidence to blockchain
router.post('/anchor', apiKeyMiddleware, async (req: Request, res: Response) => {
  try {
    const { evidence_id, hash } = req.body;
    
    // Enhanced input validation
    if (!evidence_id || typeof evidence_id !== 'string' || evidence_id.trim().length === 0) {
      return res.status(400).json({ error: 'evidence_id is required and must be a non-empty string' });
    }
    
    if (!hash || typeof hash !== 'string' || !hash.startsWith('0x') || hash.length !== 66) {
      return res.status(400).json({ error: 'hash is required and must be a valid 32-byte hex string starting with 0x' });
    }
    
    // Sanitize input
    const sanitizedEvidenceId = evidence_id.trim();
    const sanitizedHash = hash.toLowerCase();
    
    logger.info('POST /anchor request', { evidence_id: sanitizedEvidenceId });
    
    const result = await blockchainService.anchorEvidence(sanitizedEvidenceId, sanitizedHash);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in POST /anchor', { error });
    res.status(500).json({ 
      error: 'Failed to anchor evidence',
      details: (error as Error).message 
    });
  }
});

// Verify evidence integrity
router.post('/verify', apiKeyMiddleware, async (req: Request, res: Response) => {
  try {
    const { evidence_id } = req.body;
    
    // Enhanced input validation
    if (!evidence_id || typeof evidence_id !== 'string' || evidence_id.trim().length === 0) {
      return res.status(400).json({ error: 'evidence_id is required and must be a non-empty string' });
    }
    
    // Sanitize input
    const sanitizedEvidenceId = evidence_id.trim();
    
    logger.info('POST /verify request', { evidence_id: sanitizedEvidenceId });
    
    const result = await blockchainService.verifyEvidence(sanitizedEvidenceId);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in POST /verify', { error });
    res.status(500).json({ 
      error: 'Failed to verify evidence',
      details: (error as Error).message 
    });
  }
});

// Get blockchain record details
router.get('/records/:id', apiKeyMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Enhanced input validation
    if (!id || typeof id !== 'string' || !/^\d+$/.test(id)) {
      return res.status(400).json({ error: 'id is required and must be a valid number' });
    }
    
    logger.info('GET /records/:id request', { id });
    
    const record = await blockchainService.getRecord(id);
    
    res.status(200).json(record);
  } catch (error) {
    logger.error('Error in GET /records/:id', { error });
    res.status(500).json({ 
      error: 'Failed to get record',
      details: (error as Error).message 
    });
  }
});

// Get total records count
router.get('/total', apiKeyMiddleware, async (req: Request, res: Response) => {
  try {
    logger.info('GET /total request');
    
    const total = await blockchainService.getTotalRecords();
    
    res.status(200).json({ total });
  } catch (error) {
    logger.error('Error in GET /total', { error });
    res.status(500).json({ 
      error: 'Failed to get total records',
      details: (error as Error).message 
    });
  }
});

// Health check endpoint (no API key required)
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'blockchain-evidence-service',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Metrics endpoint (no API key required)
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    environment: process.env.NODE_ENV || 'development',
    service: 'blockchain-evidence-service'
  };
  
  res.status(200).json(metrics);
});

export default router;
