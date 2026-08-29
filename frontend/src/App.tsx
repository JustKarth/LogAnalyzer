import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PageLoader } from './components/common'
import Layout from './components/layout/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const LogUpload = lazy(() => import('./pages/LogUpload/LogUpload'))
const Analysis = lazy(() => import('./pages/Analysis/Analysis'))
const Incidents = lazy(() => import('./pages/Incidents/Incidents'))
const Reports = lazy(() => import('./pages/Reports/Reports'))
const Settings = lazy(() => import('./pages/Settings/Settings'))

const PageFallback = () => <PageLoader message="Loading page…" />

function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="upload" element={<LogUpload />} />
        <Route path="analysis" element={<Analysis />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

export default App
