// Authentication Types
export interface LoginRequest {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface User {
  id: string
  username: string
  role: 'admin' | 'analyst' | 'auditor'
  created_at: string
}

// Log Sources Types
export interface LogSource {
  id: string
  name: string
  type: 'file' | 'syslog' | 'api'
  config: Record<string, any>
  status: 'active' | 'inactive' | 'error'
  last_collected: string
}

export interface LogSourceConfig {
  host?: string
  port?: number
  path?: string
  protocol?: string
  [key: string]: any
}

// Events Types
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

export interface EventFilter {
  page?: number
  page_size?: number
  severity?: string
  event_type?: string
  start_date?: string
  end_date?: string
  search?: string
  source_id?: string
  user?: string
  host?: string
  ip_address?: string
}

// Detections Types
export interface Detection {
  id: string
  rule_id: string
  rule_name: string
  event_id: string
  detected_at: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  confidence: number
  details: Record<string, any>
  status: 'new' | 'acknowledged' | 'false_positive'
}

export interface DetectionRule {
  id: string
  name: string
  description: string
  rule_type: string
  pattern: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  enabled: boolean
  created_at: string
  updated_at: string
}

// Incidents Types
export interface Incident {
  id: string
  title: string
  description: string
  risk_score: number // 0-100
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'detected' | 'open' | 'investigating' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  affected_entities: AffectedEntities
  detection_count: number
  evidence_count: number
}

export interface AffectedEntities {
  users: string[]
  hosts: string[]
  ips: string[]
  resources: string[]
}

export interface IncidentFilter {
  page?: number
  page_size?: number
  severity?: string
  status?: string
  search?: string
  min_risk_score?: number
  max_risk_score?: number
}

export interface IncidentUpdate {
  title?: string
  description?: string
  status?: 'detected' | 'open' | 'investigating' | 'resolved' | 'closed'
  analyst_notes?: string
}

// Evidence & Blockchain Types
export interface Evidence {
  id: string
  incident_id: string
  type: string
  content: Record<string, any>
  sha256_hash: string
  created_at: string
  blockchain_anchored: boolean
  blockchain_tx_hash?: string
}

export interface BlockchainRecord {
  id: string
  evidence_id: string
  hash: string
  tx_hash: string
  block_number: number
  timestamp: string
}

export interface BlockchainVerification {
  valid: boolean
  message: string
  blockchain_record?: BlockchainRecord
}

// Audit Types
export interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, any>
  timestamp: string
}

// API Response Types
export interface APIResponse<T> {
  data: T
  status: number
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ErrorResponse {
  error: string
  message: string
  details?: Record<string, any>
}

// Dashboard Types
export interface DashboardStats {
  total_logs: number
  total_events: number
  total_incidents: number
  critical_incidents: number
  high_incidents: number
  medium_incidents: number
  low_incidents: number
  active_sources: number
  error_rate: number
}

export interface TrendData {
  timestamp: string
  value: number
  label?: string
}

export interface SeverityDistribution {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

// Form Types
export interface LogUploadForm {
  source_id: string
  file: File
  description?: string
}

export interface SourceForm {
  name: string
  type: 'file' | 'syslog' | 'api'
  config: LogSourceConfig
}

export interface RuleForm {
  name: string
  description: string
  rule_type: string
  pattern: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

// UI Component Types
export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: any) => any
}

export interface FilterOption {
  value: string
  label: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  autoClose?: boolean
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error?: string
}

// Pagination
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Sort
export interface Sort {
  field: string
  direction: 'asc' | 'desc'
}