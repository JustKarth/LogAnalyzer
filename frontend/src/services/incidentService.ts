import apiClient from './api'
import mockApi from './mockApi'

export interface Incident {
  id: string
  title: string
  description: string
  risk_score: number
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'detected' | 'open' | 'investigating' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  affected_entities: {
    users: string[]
    hosts: string[]
    ips: string[]
    resources: string[]
  }
  detection_count: number
  evidence_count: number
}

export interface PaginatedIncidents {
  data: Incident[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const incidentService = {
  list: async (params?: {
    page?: number
    page_size?: number
    severity?: string
    status?: string
    search?: string
  }): Promise<PaginatedIncidents> => {
    if (apiClient.isMock) {
      return mockApi.incidents.list(params)
    }
    const response = await apiClient.instance.get<PaginatedIncidents>('/api/v1/incidents', { params })
    return response.data
  },

  getById: async (id: string): Promise<Incident> => {
    if (apiClient.isMock) {
      return mockApi.incidents.getById(id)
    }
    const response = await apiClient.instance.get<Incident>(`/api/v1/incidents/${id}`)
    return response.data
  },

  create: async (incident: Omit<Incident, 'id' | 'created_at' | 'updated_at' | 'detection_count' | 'evidence_count'>) => {
    const response = await apiClient.instance.post<Incident>('/api/v1/incidents', incident)
    return response.data
  },

  update: async (id: string, incident: Partial<Incident>) => {
    const response = await apiClient.instance.put<Incident>(`/api/v1/incidents/${id}`, incident)
    return response.data
  },

  acknowledge: async (id: string) => {
    const response = await apiClient.instance.post(`/api/v1/incidents/${id}/acknowledge`)
    return response.data
  },

  investigate: async (id: string) => {
    const response = await apiClient.instance.post(`/api/v1/incidents/${id}/investigate`)
    return response.data
  },

  resolve: async (id: string) => {
    const response = await apiClient.instance.post(`/api/v1/incidents/${id}/resolve`)
    return response.data
  },

  markFalsePositive: async (id: string) => {
    const response = await apiClient.instance.post(`/api/v1/incidents/${id}/false-positive`)
    return response.data
  },

  getTimeline: async (id: string) => {
    const response = await apiClient.instance.get(`/api/v1/incidents/${id}/timeline`)
    return response.data
  },

  getEvidence: async (id: string) => {
    const response = await apiClient.instance.get(`/api/v1/incidents/${id}/evidence`)
    return response.data
  },

  getRelatedEvents: async (id: string) => {
    const response = await apiClient.instance.get(`/api/v1/incidents/${id}/related-events`)
    return response.data
  },
}