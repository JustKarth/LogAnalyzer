# IT System Log Analyzer - Frontend

An intelligent IT security log analysis platform frontend that transforms heterogeneous organisational logs into correlated, prioritized security incidents while providing blockchain-backed, tamper-evident integrity for critical security evidence and audit records.

## Project Overview

This frontend application provides analysts with a comprehensive dashboard for:
- Real-time log monitoring and analysis
- Security incident investigation and management
- Evidence integrity verification through blockchain
- Audit trail access and compliance reporting
- Risk-based alert prioritization

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization library

## API Specification

### Base URL
```
http://localhost:8000/api/v1
```

### API Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login` - User login, returns JWT token
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `GET /api/v1/auth/me` - Get current user info

#### Log Sources (`/api/v1/sources`)
- `GET /api/v1/sources` - List all log sources
- `POST /api/v1/sources` - Register new log source
- `GET /api/v1/sources/{id}` - Get source details
- `PUT /api/v1/sources/{id}` - Update source configuration
- `DELETE /api/v1/sources/{id}` - Remove log source
- `POST /api/v1/sources/{id}/test` - Test source connection

#### Raw Logs (`/api/v1/logs`)
- `POST /api/v1/logs/upload` - Upload log files
- `GET /api/v1/logs` - List raw logs with pagination
- `GET /api/v1/logs/{id}` - Get specific raw log
- `DELETE /api/v1/logs/{id}` - Delete raw log

#### Events (`/api/v1/events`)
- `GET /api/v1/events` - Search and filter normalized events
- `GET /api/v1/events/{id}` - Get specific event details
- `GET /api/v1/events/stats` - Get event statistics and trends

#### Detection Rules (`/api/v1/rules`)
- `GET /api/v1/rules` - List all detection rules
- `POST /api/v1/rules` - Create new detection rule
- `GET /api/v1/rules/{id}` - Get rule details
- `PUT /api/v1/rules/{id}` - Update detection rule
- `DELETE /api/v1/rules/{id}` - Delete detection rule
- `POST /api/v1/rules/{id}/enable` - Enable rule
- `POST /api/v1/rules/{id}/disable` - Disable rule

#### Detections (`/api/v1/detections`)
- `GET /api/v1/detections` - List all detections
- `GET /api/v1/detections/{id}` - Get specific detection details
- `PUT /api/v1/detections/{id}/status` - Update detection status

#### Incidents (`/api/v1/incidents`)
- `GET /api/v1/incidents` - List incidents with filtering and sorting
- `POST /api/v1/incidents` - Create new incident manually
- `GET /api/v1/incidents/{id}` - Get incident details with timeline
- `PUT /api/v1/incidents/{id}` - Update incident details
- `POST /api/v1/incidents/{id}/acknowledge` - Acknowledge incident
- `POST /api/v1/incidents/{id}/investigate` - Mark as under investigation
- `POST /api/v1/incidents/{id}/resolve` - Resolve incident
- `POST /api/v1/incidents/{id}/false-positive` - Mark as false positive
- `GET /api/v1/incidents/{id}/timeline` - Get incident event timeline
- `GET /api/v1/incidents/{id}/evidence` - Get incident evidence
- `GET /api/v1/incidents/{id}/related-events` - Get related events

#### Audit (`/api/v1/audit`)
- `GET /api/v1/audit/logs` - Get audit trail (read-only for auditors)
- `GET /api/v1/audit/logs/{id}` - Get specific audit entry

#### Blockchain (`/api/v1/blockchain`)
- `POST /api/v1/blockchain/anchor` - Anchor evidence hash to blockchain
- `POST /api/v1/blockchain/verify` - Verify evidence integrity
- `GET /api/v1/blockchain/records/{id}` - Get blockchain record details

#### System
- `GET /health` - System health check
- `GET /api/v1/system/status` - System status and metrics

### TypeScript Interfaces

```typescript
// Authentication
interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

interface User {
  id: string;
  username: string;
  role: 'admin' | 'analyst' | 'auditor';
  created_at: string;
}

// Log Sources
interface LogSource {
  id: string;
  name: string;
  type: 'file' | 'syslog' | 'api';
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error';
  last_collected: string;
}

// Events
interface Event {
  id: string;
  timestamp: string;
  source_id: string;
  event_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  message: string;
  user?: string;
  host?: string;
  ip_address?: string;
  raw_data: Record<string, any>;
}

// Detections
interface Detection {
  id: string;
  rule_id: string;
  rule_name: string;
  event_id: string;
  detected_at: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  details: Record<string, any>;
  status: 'new' | 'acknowledged' | 'false_positive';
}

// Incidents
interface Incident {
  id: string;
  title: string;
  description: string;
  risk_score: number; // 0-100
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'detected' | 'open' | 'investigating' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
  affected_entities: {
    users: string[];
    hosts: string[];
    ips: string[];
    resources: string[];
  };
  detection_count: number;
  evidence_count: number;
}

// Evidence & Blockchain
interface Evidence {
  id: string;
  incident_id: string;
  type: string;
  content: Record<string, any>;
  sha256_hash: string;
  created_at: string;
  blockchain_anchored: boolean;
  blockchain_tx_hash?: string;
}

interface BlockchainRecord {
  id: string;
  evidence_id: string;
  hash: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
}

// Audit
interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  timestamp: string;
}

// API Response Formats
interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, any>;
}
```

### Authentication
- All protected endpoints require JWT token in `Authorization: Bearer <token>` header
- Role-based access control:
  - **Admin**: Full access to all endpoints
  - **Analyst**: Read/write access to incidents, events, detections
  - **Auditor**: Read-only access to audit logs and evidence

## Implementation Phases

### Current Progress: 9 of 10 phases complete (90%)

| Phase | Status | Completion | Notes |
| --- | --- | --- | --- |
| 1. Project Setup & Architecture Foundation | Complete | 100% | Routing, TypeScript types, Tailwind setup, API client, mock API services, and app contexts are in place. |
| 2. Core UI Components | Complete | 100% | Shared layout, navigation, forms, tables, feedback states, upload control, and chart components are available. |
| 3. Dashboard Page | Complete | 100% | Metrics, recent activity, source health, charts, refresh/error states, and working page navigation are implemented. |
| 4. Log Upload & Management | Complete | 100% | Upload validation/progress, log-source configuration, and upload history are implemented with mock API support. |
| 5. Log Analysis & Visualization | Complete | 100% | Search, severity/source/date filtering, pagination, event details, and all four required charts are implemented. |
| 6. Reports & Export | Complete | 100% | Summary reports, CSV/JSON/PDF exports, custom templates, report schedules, and report history are implemented. |
| 7. Settings & Configuration | Complete | 100% | User preferences, custom regex rules, alert thresholds, API configuration, retention, and local-data controls are implemented. |
| 8. Real-time Features | Complete | 100% | Mock live streaming, backend WebSocket support, dashboard auto-updates, live alerts, and a rolling log feed are implemented. |
| 9. Polish & Optimization | Complete | 100% | Responsive layouts, lazy-loaded routes, memoized charts, accessibility improvements, global error boundary, skip links, and reduced-motion support are implemented. |
| 10. Testing & Deployment | Partial | 60% | Basic Vitest unit/integration tests exist for some components and services. Dockerfile, nginx config, and docker-compose deployment are in place. More comprehensive test coverage needed. |

### Additional Features Required

| Feature | Status | Notes |
| --- | --- | --- |
| Incidents Page | Not Started | Currently only has a placeholder component. Full incident management UI needs to be implemented. |
| Authentication UI | Not Started | Auth service exists but no login page or authentication flow UI is implemented. |
| Blockchain Integration UI | Not Started | Blockchain service exists but no UI for evidence anchoring/verification is implemented. |
| Comprehensive Testing | Partial | Some component tests exist (Button, ErrorBoundary, FileUpload, Layout, App). Need tests for all pages and services. |

> **Note:** Completed frontend features currently run with `VITE_USE_MOCK_API=true`. They are structured to use the documented backend API when it becomes available.

### Phase 1: Project Setup & Architecture Foundation — Complete (100%)
- Configure React Router for different pages (Dashboard, Log Upload, Analysis, Reports, Settings)
- Create directory structure (components/, pages/, hooks/, services/, types/, utils/)
- Setup API layer with axios base URL, interceptors for error handling and auth
- Define TypeScript interfaces for log data, analysis results, API responses
- Setup state management (Context API or Zustand recommended)
- Configure Tailwind with custom colors and components for consistent design system

### Phase 2: Core UI Components — Complete (100%)
- Navigation Component: Responsive navbar/sidebar with routing
- Layout Components: Page layouts (header, sidebar, main content area)
- Common UI Components: Button, Input, Card, Modal, Table, Dropdown, Badge
- Loading States: Skeleton loaders, spinners for async operations
- Error Components: Error boundaries, error message displays
- Form Components: File upload zone, date pickers, filter controls

### Phase 3: Dashboard Page — Complete (100%)
- Overview Stats: Display key metrics (total logs, errors, warnings, system health)
- Recent Activity: Show recent log entries with timestamps
- Quick Actions: Buttons for common tasks (upload logs, run analysis)
- System Status: Health indicators for different log sources
- Mini Charts: Sparkline charts using Recharts for trends

### Phase 4: Log Upload & Management — Complete (100%)
- File Upload Interface: Drag-and-drop zone for log files
- Upload Progress: Progress bars and status indicators
- Log Source Configuration: Form to add/configure log sources (file paths, APIs)
- Upload History: Table showing previous uploads with status
- File Validation: Check file formats, size limits before upload

### Phase 5: Log Analysis & Visualization — Complete (100%)
- Log Viewer: Paginated table with filtering and search
- Log Filtering: Filter by log level (ERROR, WARN, INFO, DEBUG), time range, source
- Search Functionality: Full-text search across log entries
- Log Details Panel: Expandable rows showing full log details
- Charts & Graphs:
  - Error rate over time (line chart)
  - Log level distribution (pie chart)
  - Timeline of events (area chart)
  - Source comparison (bar chart)

### Phase 6: Reports & Export — Complete (100%)
- Report Generation: Create summary reports with key findings
- Export Options: Download reports as PDF, CSV, JSON
- Custom Reports: Form to create custom report templates
- Scheduled Reports: Interface to set up automated report generation
- Report History: List of previously generated reports

### Phase 7: Settings & Configuration — Complete (100%)
- User Preferences: Theme toggle, language, notification settings
- Analysis Rules: Configure custom regex patterns and analysis rules
- Alert Thresholds: Set up alerts for specific error patterns
- API Configuration: Backend API endpoints, authentication settings
- Data Management: Options to clear old logs, manage storage

### Phase 8: Real-time Features — Complete (100%)
- WebSocket Integration: Real-time log streaming
- Live Dashboard: Auto-updating stats and charts
- Real-time Alerts: Notification system for critical errors
- Live Log Feed: Scrolling view of incoming log entries

### Phase 9: Polish & Optimization — Complete (100%)
- Responsive Design: Mobile navigation, flexible grids, and adaptive page headers for tablet/mobile
- Performance Optimization: Route-level code splitting, vendor chunk splitting, and memoized chart components
- Accessibility: Skip links, ARIA labels, keyboard-navigable table rows, live regions, and focus management
- Error Handling: Global error boundary with reload fallback and toast notification system
- Loading States: Page loader fallback for lazy routes and consistent loading indicators

### Phase 10: Testing & Deployment — Partial (60%)
- Unit Tests: Component and service tests with Vitest and Testing Library (partially complete)
- Integration Tests: App routing and layout navigation coverage (basic coverage exists)
- E2E Tests: Critical user journeys covered via integration tests (limited coverage)
- Build Optimization: Production chunk splitting and TypeScript-checked Vite configuration (complete)
- Deployment Setup: Dockerfile, nginx SPA config, docker-compose, and environment variable templates (complete)

## Development Approach

### Mock Data Strategy
Since the backend is not yet implemented, the frontend will be developed using mock data:

1. **Mock Service Layer**: Create mock implementations of API services
2. **Mock Data Generation**: Generate realistic sample data for development
3. **API Contract First**: All mock services will follow the exact API contract specified above
4. **Easy Transition**: When backend is ready, simply replace mock implementations with real API calls

### Environment Configuration
```typescript
// .env.development
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=true

// .env.production
VITE_API_URL=https://api.loganalyzer.com
VITE_USE_MOCK_API=false
```

### API Service Layer Structure
```typescript
// services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

export const logAPI = {
  uploadLog: (file: File) => 
    USE_MOCK_API 
      ? mockUploadLog(file) 
      : axios.post(`${API_BASE_URL}/api/v1/logs/upload`, formData),
  getLogs: (params) => 
    USE_MOCK_API 
      ? mockGetLogs(params) 
      : axios.get(`${API_BASE_URL}/api/v1/logs`, { params }),
  // ... other endpoints
};
```

## Setup Instructions

### Prerequisites
- Node.js LTS version
- npm or yarn package manager

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint

# Build and run with Docker
docker compose up --build
```

### Project Structure
```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable UI components
│   │   ├── common/     # Button, Input, Card, etc.
│   │   ├── layout/     # Navigation, Sidebar, Layout
│   │   └── charts/     # Recharts components
│   ├── pages/          # Page components
│   │   ├── Dashboard/
│   │   ├── LogUpload/
│   │   ├── Analysis/
│   │   ├── Incidents/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services and mock data
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .env.development    # Development environment variables
├── .env.production     # Production environment variables
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Development Workflow

1. **Feature Development**: Work through phases sequentially
2. **Mock Data Integration**: Use mock services for all API calls
3. **Component Testing**: Test components with mock data
4. **UI Polish**: Focus on user experience and responsiveness
5. **Backend Integration**: Replace mocks with real API calls when backend is ready
6. **Integration Testing**: Test complete user flows with real backend
7. **Production Build**: Optimize and deploy

## Notes

- The API specification is extracted from the project documentation and should be considered the contract for backend implementation
- Frontend development can proceed independently using mock data
- When backend is ready, the transition from mock to real API should be seamless
- All TypeScript interfaces should match the exact backend response formats
- Authentication flow should be implemented once backend auth endpoints are available
