import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  blockchain: {
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    privateKey: process.env.PRIVATE_KEY || '',
  },
  
  api: {
    apiKey: process.env.API_KEY || '',
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  },
  
  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },
};

// Validate required configuration
export function validateConfig(): void {
  if (!config.blockchain.contractAddress) {
    throw new Error('CONTRACT_ADDRESS is required in environment variables');
  }
  if (!config.blockchain.rpcUrl) {
    throw new Error('RPC_URL is required in environment variables');
  }
  if (!config.blockchain.privateKey) {
    throw new Error('PRIVATE_KEY is required in environment variables');
  }
}
