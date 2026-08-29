import apiClient from './api'
import mockApi from './mockApi'

export interface Event {
  id: string
  timestamp: string
  source_id: string
  event_type: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  message: string
  user?: string
  host?: string
  ip_address?: string
  raw_data: Record<string, any>
}

export interface EventStats {
  total_events: number
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export interface PaginatedEvents {
  data: Event[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export const eventService = {
  list: async (params?: {
    page?: number
    page_size?: number
    severity?: string
    event_type?: string
    start_date?: string
    end_date?: string
    search?: string
  }): Promise<PaginatedEvents> => {
    if (apiClient.isMock) {
      return mockApi.events.list(params)
    }
    const response = await apiClient.instance.get<PaginatedEvents>('/api/v1/events', { params })
    return response.data
  },

  getById: async (id: string): Promise<Event> => {
    const response = await apiClient.instance.get<Event>(`/api/v1/events/${id}`)
    return response.data
  },

  getStats: async (): Promise<EventStats> => {
    if (apiClient.isMock) {
      return mockApi.events.stats()
    }
    const response = await apiClient.instance.get<EventStats>('/api/v1/events/stats')
    return response.data
  },
}