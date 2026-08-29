import apiClient from './api'
import mockApi from './mockApi'

export interface LogSource {
  id: string
  name: string
  type: 'file' | 'syslog' | 'api'
  config: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  last_collected: string
}

export const sourceService = {
  list: async () => {
    if (apiClient.isMock) {
      return mockApi.sources.list()
    }
    const response = await apiClient.instance.get<LogSource[]>('/api/v1/sources')
    return response.data
  },

  create: async (source: Omit<LogSource, 'id' | 'status' | 'last_collected'>) => {
    if (apiClient.isMock) {
      return mockApi.sources.create(source)
    }
    const response = await apiClient.instance.post<LogSource>('/api/v1/sources', source)
    return response.data
  },

  getById: async (id: string) => {
    const response = await apiClient.instance.get<LogSource>(`/api/v1/sources/${id}`)
    return response.data
  },

  update: async (id: string, source: Partial<LogSource>) => {
    const response = await apiClient.instance.put<LogSource>(`/api/v1/sources/${id}`, source)
    return response.data
  },

  delete: async (id: string) => {
    await apiClient.instance.delete(`/api/v1/sources/${id}`)
  },

  testConnection: async (id: string) => {
    const response = await apiClient.instance.post(`/api/v1/sources/${id}/test`)
    return response.data
  },
}