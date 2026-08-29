// Mock API service for development before backend is ready
// This will be replaced with real API calls when backend is implemented

export const mockApi = {
  // Mock delay to simulate network requests
  delay: (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock authentication
  auth: {
    login: async (username: string, password: string) => {
      await mockApi.delay()
      if (username === 'admin' && password === 'admin123') {
        return {
          access_token: 'mock-jwt-token',
          refresh_token: 'mock-refresh-token',
          user: {
            id: '1',
            username: 'admin',
            role: 'admin' as const,
            created_at: new Date().toISOString(),
          },
        }
      }
      throw new Error('Invalid credentials')
    },
    logout: async () => {
      await mockApi.delay()
    },
    getCurrentUser: async () => {
      await mockApi.delay()
      return {
        id: '1',
        username: 'admin',
        role: 'admin' as const,
        created_at: new Date().toISOString(),
      }
    },
  },

  // Mock log sources
  sources: {
    list: async () => {
      await mockApi.delay()
      return [
        {
          id: '1',
          name: 'Auth Server Logs',
          type: 'syslog' as const,
          config: { host: '192.168.1.100', port: 514 },
          status: 'active' as const,
          last_collected: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Web Server Access Logs',
          type: 'file' as const,
          config: { path: '/var/log/nginx/access.log' },
          status: 'active' as const,
          last_collected: new Date().toISOString(),
        },
      ]
    },
    create: async (source: any) => {
      await mockApi.delay()
      return { ...source, id: Math.random().toString(), status: 'active' as const }
    },
  },

  // Mock events
  events: {
    list: async (_params?: any) => {
      await mockApi.delay()
      return {
        data: [
          {
            id: '1',
            timestamp: new Date().toISOString(),
            source_id: '1',
            event_type: 'AUTH_FAILURE',
            severity: 'high' as const,
            message: 'Failed login attempt for user admin',
            user: 'admin',
            host: '192.168.1.50',
            ip_address: '192.168.1.50',
            raw_data: {},
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            source_id: '2',
            event_type: 'HTTP_REQUEST',
            severity: 'info' as const,
            message: 'GET /api/users - 200 OK',
            user: 'user1',
            host: '192.168.1.51',
            ip_address: '192.168.1.51',
            raw_data: {},
          },
        ],
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      }
    },
    stats: async () => {
      await mockApi.delay()
      return {
        total_events: 15234,
        critical: 23,
        high: 156,
        medium: 432,
        low: 8921,
        info: 5702,
      }
    },
  },

  // Mock incidents
  incidents: {
    list: async (_params?: any) => {
      await mockApi.delay()
      return {
        data: [
          {
            id: '1',
            title: 'Brute Force Attack Detected',
            description: 'Multiple failed login attempts from IP 192.168.1.50',
            risk_score: 85,
            severity: 'high' as const,
            status: 'open' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            affected_entities: {
              users: ['admin'],
              hosts: ['192.168.1.50'],
              ips: ['192.168.1.50'],
              resources: [],
            },
            detection_count: 15,
            evidence_count: 3,
          },
        ],
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      }
    },
    getById: async (id: string) => {
      await mockApi.delay()
      return {
        id,
        title: 'Brute Force Attack Detected',
        description: 'Multiple failed login attempts from IP 192.168.1.50',
        risk_score: 85,
        severity: 'high' as const,
        status: 'open' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        affected_entities: {
          users: ['admin'],
          hosts: ['192.168.1.50'],
          ips: ['192.168.1.50'],
          resources: [],
        },
        detection_count: 15,
        evidence_count: 3,
      }
    },
  },

  // Mock blockchain
  blockchain: {
    anchor: async (_evidenceId: string) => {
      await mockApi.delay(2000) // Simulate blockchain transaction time
      return {
        success: true,
        tx_hash: '0x' + Math.random().toString(16).substr(2, 64),
        block_number: Math.floor(Math.random() * 1000000),
      }
    },
    verify: async (_evidenceId: string) => {
      await mockApi.delay(1000)
      return {
        valid: true,
        message: 'Evidence integrity verified',
      }
    },
  },
}

export default mockApi