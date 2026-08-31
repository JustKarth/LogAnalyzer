import { ethers } from 'ethers';
import { config } from './config';
import { logger } from './logger';

// ABI for the EvidenceRegistry contract
const EVIDENCE_REGISTRY_ABI = [
  "function anchorEvidence(string evidenceId, bytes32 hash) external returns (uint256 recordId, bytes32 txHash, uint256 blockNumber)",
  "function verifyEvidence(string evidenceId) external view returns (bool isValid, bytes32 storedHash)",
  "function getRecord(uint256 recordId) external view returns (tuple(uint256 id, string evidenceId, bytes32 hash, address anchorer, uint256 timestamp, uint256 blockNumber, bytes32 txHash, bool exists))",
  "function getEvidenceByEvidenceId(string evidenceId) external view returns (uint256 recordId, tuple(uint256 id, string evidenceId, bytes32 hash, address anchorer, uint256 timestamp, uint256 blockNumber, bytes32 txHash, bool exists))",
  "function getTotalRecords() external view returns (uint256)",
  "function setAnchorAuthorization(address anchor, bool authorized) external",
  "function transferAdmin(address newAdmin) external",
  "function isAuthorized(address account) external view returns (bool)",
  "function admin() external view returns (address)",
  "event EvidenceAnchored(uint256 indexed recordId, string indexed evidenceId, bytes32 indexed hash, address anchorer, uint256 timestamp, uint256 blockNumber, bytes32 txHash)"
];

export interface BlockchainRecord {
  id: string;
  evidence_id: string;
  hash: string;
  anchorer: string;
  timestamp: string;
  block_number: string;
  tx_hash: string;
  exists: boolean;
}

export interface BlockchainVerification {
  valid: boolean;
  message: string;
  blockchain_record?: BlockchainRecord;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
    this.contract = new ethers.Contract(
      config.blockchain.contractAddress,
      EVIDENCE_REGISTRY_ABI,
      this.wallet
    );
    
    logger.info('Blockchain service initialized', {
      contractAddress: config.blockchain.contractAddress,
      rpcUrl: config.blockchain.rpcUrl,
    });
  }

  async anchorEvidence(evidenceId: string, hash: string): Promise<{ record_id: string; tx_hash: string; block_number: string }> {
    try {
      logger.info('Anchoring evidence', { evidenceId });
      
      const tx = await this.contract.anchorEvidence(evidenceId, hash);
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new Error('Transaction receipt not found');
      }

      // Get the record ID from the event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed && parsed.name === 'EvidenceAnchored';
        } catch {
          return false;
        }
      });

      let recordId = '0';
      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        if (parsed) {
          recordId = parsed.args.recordId.toString();
        }
      }

      logger.info('Evidence anchored successfully', { 
        evidenceId, 
        recordId, 
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber 
      });

      return {
        record_id: recordId,
        tx_hash: receipt.hash,
        block_number: receipt.blockNumber.toString()
      };
    } catch (error) {
      logger.error('Error anchoring evidence', { evidenceId, error });
      throw error;
    }
  }

  async verifyEvidence(evidenceId: string): Promise<BlockchainVerification> {
    try {
      logger.info('Verifying evidence', { evidenceId });
      
      const [isValid, storedHash] = await this.contract.verifyEvidence(evidenceId);
      
      if (!isValid) {
        return {
          valid: false,
          message: 'Evidence not found in blockchain registry'
        };
      }

      // Get the full record details
      const [recordId, record] = await this.contract.getEvidenceByEvidenceId(evidenceId);
      
      const blockchainRecord: BlockchainRecord = {
        id: recordId.toString(),
        evidence_id: record.evidenceId,
        hash: record.hash,
        anchorer: record.anchorer,
        timestamp: record.timestamp.toString(),
        block_number: record.blockNumber.toString(),
        tx_hash: record.txHash,
        exists: record.exists
      };

      logger.info('Evidence verified successfully', { evidenceId, recordId });

      return {
        valid: true,
        message: 'Evidence verified successfully',
        blockchain_record: blockchainRecord
      };
    } catch (error) {
      logger.error('Error verifying evidence', { evidenceId, error });
      return {
        valid: false,
        message: 'Error verifying evidence: ' + (error as Error).message
      };
    }
  }

  async getRecord(recordId: string): Promise<BlockchainRecord> {
    try {
      logger.info('Getting record', { recordId });
      
      const record = await this.contract.getRecord(recordId);
      
      const blockchainRecord: BlockchainRecord = {
        id: record.id.toString(),
        evidence_id: record.evidenceId,
        hash: record.hash,
        anchorer: record.anchorer,
        timestamp: record.timestamp.toString(),
        block_number: record.blockNumber.toString(),
        tx_hash: record.txHash,
        exists: record.exists
      };

      logger.info('Record retrieved successfully', { recordId });

      return blockchainRecord;
    } catch (error) {
      logger.error('Error getting record', { recordId, error });
      throw error;
    }
  }

  async getTotalRecords(): Promise<string> {
    try {
      const total = await this.contract.getTotalRecords();
      return total.toString();
    } catch (error) {
      logger.error('Error getting total records', { error });
      throw error;
    }
  }

  async isAuthorized(address: string): Promise<boolean> {
    try {
      return await this.contract.isAuthorized(address);
    } catch (error) {
      logger.error('Error checking authorization', { address, error });
      throw error;
    }
  }
}
