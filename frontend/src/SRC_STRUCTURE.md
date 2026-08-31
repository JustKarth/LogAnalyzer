# Frontend Source Folder Structure

This document explains the purpose and functionality of each folder within the `src/` directory of the IT System Log Analyzer frontend application.

## 📁 Directory Overview

```
src/
├── assets/           # Static media files
├── components/       # Reusable UI components
├── contexts/         # React Context providers
├── hooks/            # Custom React hooks
├── pages/            # Application pages/screens
├── services/         # API service layer
├── styles/           # Global styles and CSS
├── test/             # Test configuration
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── App.tsx           # Main routing configuration
├── App.css           # Legacy CSS
├── main.tsx          # Application entry point
└── index.css         # Legacy CSS
```

---

## 📁 assets/

**Purpose**: Static files and media assets

### Contents
- `hero.png` - Main hero image for landing/dashboard
- `react.svg` - React logo
- `vite.svg` - Vite logo

### Usage
- Referenced in components for visual elements
- Used for branding and user interface graphics
- Automatically optimized by Vite during build

### Example
```tsx
import heroImage from '../assets/hero.png'
<img src={heroImage} alt="Hero" />
```

---

## 📁 components/

**Purpose**: Reusable UI components organized by category

### Subdirectories

#### common/
Basic UI elements used throughout the application:
- `Button.tsx` - Reusable button component with variants
- `Input.tsx` - Form input component with validation
- `Card.tsx` - Container component for content grouping
- `Modal.tsx` - Dialog/overlay component
- `Table.tsx` - Data table with sorting and pagination
- `Badge.tsx` - Status and severity indicators
- `FileUpload.tsx` - Drag-and-drop file upload interface
- `Spinner.tsx` - Loading indicators
- `Skeleton.tsx` - Loading placeholder components
- `ErrorBoundary.tsx` - Error handling wrapper
- `ErrorMessage.tsx` - Alert/toast messages
- `LineChart.tsx` - Line chart using Recharts
- `PieChart.tsx` - Pie chart using Recharts
- `DatePicker.tsx` - Date selection component
- `Dropdown.tsx` - Select dropdown component
- `Filter.tsx` - Advanced filtering interface

#### layout/
Layout and navigation components:
- `Layout.tsx` - Main layout wrapper
- `Header.tsx` - Page header with title and actions
- `Sidebar.tsx` - Navigation sidebar
- `Navbar.tsx` - Top navigation bar
- `MainContent.tsx` - Main content area wrapper

### Usage Pattern
```tsx
import { Button, Card, Input } from '../components/common'

function MyComponent() {
  return (
    <Card>
      <Input label="Name" />
      <Button>Submit</Button>
    </Card>
  )
}
```

---

## 📁 contexts/

**Purpose**: React Context providers for global state management

### Files

#### AuthContext.tsx
Manages user authentication state:
- `user` - Current authenticated user
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state during auth checks
- `login()` - User login function
- `logout()` - User logout function
- `checkAuth()` - Verify authentication status

#### NotificationContext.tsx
Manages application notifications:
- Toast notifications for success/error messages
- Alert system for important updates
- Notification queue management

### Usage Pattern
```tsx
import { useAuth } from '../contexts'

function MyComponent() {
  const { user, login, logout } = useAuth()
  
  if (!user) {
    return <button onClick={() => login(credentials)}>Login</button>
  }
  return <button onClick={logout}>Logout</button>
}
```

---

## 📁 hooks/

**Purpose**: Custom React hooks for reusable logic

### Files

#### useLiveLogStream.ts
Manages real-time log streaming:
- WebSocket connection management
- Live event updates
- Connection status monitoring
- Mock data generation for development

### Features
- Automatic reconnection on disconnect
- Mock event generation when using mock API
- Status tracking (connected, connecting, disconnected, error)

### Usage Pattern
```tsx
import { useLiveLogStream } from '../hooks/useLiveLogStream'

function Dashboard() {
  const { latestEvent, status, reconnect } = useLiveLogStream()
  
  return (
    <div>
      <p>Status: {status}</p>
      <button onClick={reconnect}>Reconnect</button>
      {latestEvent && <LogEvent event={latestEvent} />}
    </div>
  )
}
```

---

## 📁 pages/

**Purpose**: Main application pages/screens

### Files

#### Dashboard/Dashboard.tsx
Main overview page:
- System metrics and statistics
- Recent activity feed
- Source health monitoring
- Quick action buttons
- Live log streaming integration

#### LogUpload/LogUpload.tsx
File upload interface:
- Drag-and-drop upload zone
- File validation and progress tracking
- Log source configuration
- Upload history table
- Source management modal

#### Analysis/Analysis.tsx
Log analysis and visualization:
- Advanced filtering (severity, source, date range)
- Full-text search across events
- Paginated event table
- Four visualization charts:
  - Error rate over time (line chart)
  - Log level distribution (pie chart)
  - Event timeline (area chart)
  - Source comparison (bar chart)
- Event detail modal

#### Incidents/Incidents.tsx
Security incident management:
- **Currently placeholder** - "Coming soon"
- Will include incident listing, details, timeline, and evidence management

#### Reports/Reports.tsx
Report generation and export:
- Report generation form
- Custom report templates
- Scheduled reports management
- Export options (CSV, JSON, PDF)
- Report history

#### Settings/Settings.tsx
Application configuration:
- User preferences (theme, language, notifications)
- Custom analysis rules (regex patterns)
- Alert thresholds configuration
- API endpoint configuration
- Data retention settings
- Local data management

### Usage Pattern
```tsx
// Routes are defined in App.tsx
<Route path="analysis" element={<Analysis />} />
<Route path="upload" element={<LogUpload />} />
```

---

## 📁 services/

**Purpose**: API service layer for backend communication

### Files

#### api.ts
Axios HTTP client configuration:
- Base URL configuration
- Request/response interceptors
- JWT token management
- Error handling
- Mock/real API switching

#### authService.ts
Authentication API calls:
- `login()` - User authentication
- `logout()` - User logout
- `getCurrentUser()` - Get current user data
- `refreshToken()` - Token refresh

#### eventService.ts
Event/log data API calls:
- `list()` - Get events with filtering
- `getById()` - Get specific event
- `getStats()` - Get event statistics

#### incidentService.ts
Incident management API calls:
- `list()` - Get incidents with filtering
- `getById()` - Get specific incident
- `create()` - Create new incident
- `update()` - Update incident
- `acknowledge()` - Acknowledge incident
- `investigate()` - Mark as investigating
- `resolve()` - Resolve incident
- `markFalsePositive()` - Mark as false positive
- `getTimeline()` - Get incident timeline
- `getEvidence()` - Get incident evidence
- `getRelatedEvents()` - Get related events

#### logService.ts
Log upload/management API calls:
- `upload()` - Upload log file
- `list()` - Get uploaded logs
- `delete()` - Delete log file

#### sourceService.ts
Log source configuration API calls:
- `list()` - Get all sources
- `create()` - Create new source
- `update()` - Update source
- `delete()` - Delete source
- `test()` - Test source connection

#### blockchainService.ts
Blockchain evidence verification API calls:
- `anchorEvidence()` - Anchor evidence to blockchain
- `verifyEvidence()` - Verify evidence integrity
- `getRecord()` - Get blockchain record

#### mockApi.ts
Mock implementations for development:
- Simulates API responses with realistic data
- Used when `VITE_USE_MOCK_API=true`
- Enables frontend development without backend
- Follows exact API contract for seamless transition

### Usage Pattern
```tsx
import { eventService } from '../services'

function MyComponent() {
  const [events, setEvents] = useState([])
  
  useEffect(() => {
    eventService.list({ page: 1, page_size: 10 })
      .then(response => setEvents(response.data))
  }, [])
  
  return <EventList events={events} />
}
```

---

## 📁 styles/

**Purpose**: Global styles and CSS configurations

### Files

#### globals.css
Global styles and Tailwind configuration:
- Font imports (Inter, JetBrains Mono)
- Tailwind CSS directives
- Custom component styles
- Utility classes
- Accessibility features
- Responsive design utilities

### Key Features
- Custom button variants (primary, secondary, danger)
- Card and input styling
- Badge severity colors
- Custom scrollbar styling
- Skip links for accessibility
- Reduced motion support for accessibility

### Usage Pattern
```css
/* Custom component styles in Tailwind */
.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700;
}

/* Utility classes */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:left-4;
}
```

---

## 📁 test/

**Purpose**: Test configuration and setup

### Files

#### setup.ts
Vitest testing configuration:
- Test environment setup
- Global test utilities
- Mock configurations
- Testing library setup

### Usage
Used by Vitest for running unit and integration tests across the application.

---

## 📁 types/

**Purpose**: TypeScript type definitions

### Files

#### index.ts
All TypeScript interfaces organized by category:

**Authentication Types:**
- `LoginRequest` - Login credentials
- `AuthResponse` - Authentication response
- `User` - User information

**Log Source Types:**
- `LogSource` - Log source configuration
- `LogSourceConfig` - Source configuration details

**Event Types:**
- `Event` - Normalized log event
- `EventStats` - Event statistics
- `EventFilter` - Event filtering options

**Detection Types:**
- `Detection` - Security detection
- `DetectionRule` - Detection rule configuration

**Incident Types:**
- `Incident` - Security incident
- `AffectedEntities` - Entities affected by incident
- `IncidentFilter` - Incident filtering options
- `IncidentUpdate` - Incident update data

**Evidence & Blockchain Types:**
- `Evidence` - Evidence record
- `BlockchainRecord` - Blockchain transaction record
- `BlockchainVerification` - Verification result

**Audit Types:**
- `AuditLog` - Audit trail entry

**API Response Types:**
- `APIResponse<T>` - Standard API response
- `PaginatedResponse<T>` - Paginated response
- `ErrorResponse` - Error response

**UI Component Types:**
- `TableColumn` - Table column configuration
- `FilterOption` - Filter dropdown option
- `Notification` - Notification data

**State Types:**
- `LoadingState` - Loading state
- `Pagination` - Pagination data
- `Sort` - Sorting configuration

### Usage Pattern
```tsx
import type { Event, EventFilter } from '../types'

function MyComponent() {
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState<EventFilter>({})
  
  // Type-safe event handling
  const handleEvent = (event: Event) => {
    console.log(event.severity) // TypeScript knows this is valid
  }
}
```

---

## 📁 utils/

**Purpose**: Utility functions and helpers

### Current Status
Empty directory - utilities can be added as needed for:
- Date formatting
- Data transformation
- Validation functions
- String manipulation
- Number formatting

### Potential Usage
```tsx
// Example future utility
export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('en-US').format(new Date(date))
}

export const formatFileSize = (bytes: number): string => {
  return `${(bytes / 1024).toFixed(2)} KB`
}
```

---

## 📄 Root Files

### main.tsx
**Application entry point**
- Sets up React root
- Configures React Router
- Wraps app with providers (Auth, Notification, ErrorBoundary)
- Imports global styles
- Mounts the App component

### App.tsx
**Main routing configuration**
- Defines all application routes
- Implements lazy loading for pages
- Sets up route structure with Layout wrapper
- Configures page fallback loading state

### App.css & index.css
**Legacy CSS files**
- Mostly replaced by Tailwind CSS
- Maintained for backward compatibility
- Can be removed if fully migrated to Tailwind

---

## 🔄 Data Flow Architecture

```
User Action → Page Component → Hook/Context → Service → API/Mock → Backend
                  ↓               ↓            ↓           ↓
              UI Update    State Update  Data Fetch  Response
```

### Example Flow: Loading Dashboard Events

1. **User Action**: User navigates to Dashboard
2. **Page Component**: `Dashboard.tsx` calls `eventService.list()`
3. **Service Layer**: `eventService` checks if using mock API
4. **API Call**: Either calls mock API or real backend
5. **Response**: Returns event data
6. **State Update**: Component updates state with events
7. **UI Update**: Dashboard re-renders with event data

---

## 🎯 Key Design Patterns

### 1. Separation of Concerns
Each folder has a specific, well-defined responsibility:
- Components for UI
- Services for data
- Contexts for state
- Types for type safety

### 2. Component Reusability
Common components used across multiple pages:
- Button, Input, Card used in forms
- Table used for data display
- Modal used for dialogs

### 3. Service Layer Abstraction
API calls abstracted from UI components:
- Components don't know about HTTP details
- Easy to switch between mock and real API
- Centralized error handling

### 4. Type Safety
TypeScript interfaces ensure data consistency:
- API responses match expected types
- Component props are type-checked
- Prevents runtime errors

### 5. Mock-First Development
Frontend works independently:
- No backend dependency during development
- Realistic mock data for testing
- Seamless transition to real backend

### 6. Lazy Loading
Pages loaded on demand for performance:
- Reduced initial bundle size
- Faster page load times
- Better user experience

### 7. Context Providers
Global state without prop drilling:
- Auth context accessible everywhere
- Notification system app-wide
- Clean component hierarchy

---

## 🚀 Development Workflow

### Adding a New Component
1. Create component in `components/common/` or `components/layout/`
2. Add to `index.ts` for easy imports
3. Write tests in `*.test.tsx`
4. Use in pages as needed

### Adding a New Page
1. Create folder in `pages/`
2. Create page component
3. Add route in `App.tsx`
4. Add navigation link in `Sidebar.tsx`

### Adding a New API Service
1. Create service in `services/`
2. Add TypeScript types in `types/index.ts`
3. Add mock implementation in `mockApi.ts`
4. Export from `services/index.ts`

### Adding a New Hook
1. Create hook in `hooks/`
2. Follow naming convention `use*`
3. Add TypeScript types
4. Document usage

---

## 📝 Best Practices

1. **Import Organization**: Use barrel exports (`index.ts`) for clean imports
2. **Type Safety**: Always use TypeScript interfaces from `types/`
3. **Component Reusability**: Extract common UI to `components/common/`
4. **Service Layer**: Never make API calls directly from components
5. **State Management**: Use Context for global state, useState for local state
6. **Error Handling**: Use ErrorBoundary for component errors
7. **Testing**: Write tests for components and services
8. **Accessibility**: Use ARIA labels and semantic HTML
9. **Performance**: Use lazy loading for pages and code splitting
10. **Documentation**: Comment complex logic and utility functions

---

## 🔧 Configuration Files

### Environment Variables
- `.env.development` - Development environment variables
- `.env.production` - Production environment variables
- `.env.example` - Example environment variables

### Key Variables
- `VITE_API_URL` - Backend API base URL
- `VITE_USE_MOCK_API` - Enable/disable mock API
- `VITE_WS_URL` - WebSocket URL for real-time features

---

## 📦 Build Process

### Development
```bash
npm run dev
```
- Runs Vite dev server
- Hot module replacement
- Fast refresh

### Production
```bash
npm run build
```
- Creates optimized production build
- Code splitting and minification
- Output in `dist/` folder

### Docker
```bash
docker compose up --build
```
- Builds production image
- Serves with nginx
- Optimized for production

---

This architecture enables independent frontend development while being ready for seamless backend integration when available.
