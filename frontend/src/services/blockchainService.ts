import apiClient from './api'
import mockApi from './mockApi'

export interface BlockchainRecord {
  id: string
  evidence_id: string
  hash: string
  tx_hash: string
  block_number: number
  timestamp: string
}

export const blockchainService = {
  anchorEvidence: async (evidenceId: string) => {
    if (apiClient.isMock) {
      return mockApi.blockchain.anchor(evidenceId)
    }
    const response = await apiClient.instance.post('/api/v1/blockchain/anchor', { evidence_id: evidenceId })
    return response.data
  },

  verifyEvidence: async (evidenceId: string) => {
    if (apiClient.isMock) {
      return mockApi.blockchain.verify(evidenceId)
    }
    const response = await apiClient.instance.post('/api/v1/blockchain/verify', { evidence_id: evidenceId })
    return response.data
  },

  getRecord: async (id: string): Promise<BlockchainRecord> => {
    const response = await apiClient.instance.get<BlockchainRecord>(`/api/v1/blockchain/records/${id}`)
    return response.data
  },
}