import apiClient from './api'

export type UploadStatus = 'completed' | 'failed'

export interface UploadedLog {
  id: string
  file_name: string
  size: number
  source_id?: string
  uploaded_at: string
  status: UploadStatus
}

const mockUploads: UploadedLog[] = [
  { id: 'sample-access', file_name: 'nginx-access-2026-08-29.log', size: 248320, source_id: '2', uploaded_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), status: 'completed' },
  { id: 'sample-auth', file_name: 'auth-server-2026-08-29.json', size: 121504, source_id: '1', uploaded_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'completed' },
]

export const logService = {
  list: async (): Promise<UploadedLog[]> => {
    if (apiClient.isMock) {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      return [...mockUploads]
    }
    const response = await apiClient.instance.get<UploadedLog[]>('/api/v1/logs')
    return response.data
  },

  upload: async (file: File, sourceId: string | undefined, onProgress?: (progress: number) => void): Promise<UploadedLog> => {
    if (apiClient.isMock) {
      onProgress?.(20)
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      onProgress?.(70)
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      onProgress?.(100)
      const uploadedLog: UploadedLog = {
        id: crypto.randomUUID(),
        file_name: file.name,
        size: file.size,
        source_id: sourceId,
        uploaded_at: new Date().toISOString(),
        status: 'completed',
      }
      mockUploads.unshift(uploadedLog)
      return uploadedLog
    }

    const formData = new FormData()
    formData.append('file', file)
    if (sourceId) formData.append('source_id', sourceId)
    const response = await apiClient.instance.post<UploadedLog>('/api/v1/logs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total))
      },
    })
    return response.data
  },
}
