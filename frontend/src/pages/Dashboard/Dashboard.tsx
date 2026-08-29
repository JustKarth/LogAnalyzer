import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, ErrorMessage, LineChart, LoadingText, PieChart, SeverityBadge, StatusBadge, Table } from '../../components/common'
import { Header } from '../../components/layout'
import { eventService, incidentService, sourceService } from '../../services'
import { useLiveLogStream } from '../../hooks/useLiveLogStream'
import type { Event, EventStats, Incident, LogSource, TableColumn } from '../../types'

const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))

const Dashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [sources, setSources] = useState<LogSource[]>([])
  const [eventStats, setEventStats] = useState<EventStats | null>(null)
  const [liveAlerts, setLiveAlerts] = useState<Event[]>([])
  const { latestEvent, status: streamStatus, reconnect } = useLiveLogStream()

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const [eventsData, incidentsData, sourcesData, statsData] = await Promise.all([
        eventService.list({ page: 1, page_size: 8 }),
        incidentService.list({ page: 1, page_size: 5 }),
        sourceService.list(),
        eventService.getStats(),
      ])
      setEvents(eventsData.data)
      setIncidents(incidentsData.data)
      setSources(sourcesData)
      setEventStats(statsData)
    } catch (caughtError) {
      console.error('Failed to load dashboard data:', caughtError)
      setError('Dashboard data could not be loaded. Check the API connection and try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => { void loadDashboardData() }, 0)
    return () => window.clearTimeout(timerId)
  }, [loadDashboardData])

  useEffect(() => {
    if (!latestEvent) return
    setEvents((currentEvents) => [latestEvent, ...currentEvents.filter((event) => event.id !== latestEvent.id)].slice(0, 8))
    setEventStats((currentStats) => currentStats ? { ...currentStats, total_events: currentStats.total_events + 1, [latestEvent.severity]: currentStats[latestEvent.severity] + 1 } : currentStats)
    if (latestEvent.severity === 'critical' || latestEvent.severity === 'high') setLiveAlerts((currentAlerts) => [latestEvent, ...currentAlerts].slice(0, 3))
  }, [latestEvent])

  const trendData = useMemo(() => [...events]
    .sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime())
    .map((event) => ({ name: formatTime(event.timestamp), value: 1 })), [events])
  const severityData = useMemo(() => [
    { name: 'Critical', value: eventStats?.critical ?? 0, color: '#dc2626' },
    { name: 'High', value: eventStats?.high ?? 0, color: '#ea580c' },
    { name: 'Medium', value: eventStats?.medium ?? 0, color: '#ca8a04' },
    { name: 'Low', value: eventStats?.low ?? 0, color: '#16a34a' },
    { name: 'Info', value: eventStats?.info ?? 0, color: '#2563eb' },
  ], [eventStats])

  const eventColumns: TableColumn[] = [
    { key: 'timestamp', label: 'Time', sortable: true, render: (value: string) => formatDateTime(value) },
    { key: 'event_type', label: 'Type', sortable: true },
    { key: 'severity', label: 'Severity', sortable: true, render: (value: string) => <SeverityBadge severity={value} /> },
    { key: 'message', label: 'Message' },
    { key: 'source_id', label: 'Source', sortable: true },
  ]
  const incidentColumns: TableColumn[] = [
    { key: 'title', label: 'Incident', sortable: true },
    { key: 'severity', label: 'Severity', sortable: true, render: (value: string) => <SeverityBadge severity={value} /> },
    { key: 'risk_score', label: 'Risk score', sortable: true, render: (value: number) => `${value}/100` },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'created_at', label: 'Created', sortable: true, render: (value: string) => formatDateTime(value) },
  ]

  if (loading) return <div className="p-6"><Header title="Dashboard" subtitle="Security log analysis overview" /><LoadingText text="Loading dashboard data..." /></div>

  return <div className="p-6">
    <Header title="Dashboard" subtitle="Security log analysis overview" actions={<div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 text-xs font-medium ${streamStatus === 'connected' ? 'text-green-700' : streamStatus === 'error' ? 'text-red-700' : 'text-gray-600'}`}><span className={`h-2 w-2 rounded-full ${streamStatus === 'connected' ? 'bg-green-500 animate-pulse' : streamStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`} />Live: {streamStatus}</span><Button onClick={reconnect} variant="ghost" size="sm">Reconnect</Button><Button onClick={() => void loadDashboardData(true)} variant="secondary" size="sm" loading={refreshing}>Refresh data</Button></div>} />
    {error && <ErrorMessage className="mb-6" message={error} onDismiss={() => setError(null)} />}
    {liveAlerts.map((alert) => <ErrorMessage key={alert.id} className="mb-3" type="warning" message={`Live ${alert.severity} alert: ${alert.message}`} onDismiss={() => setLiveAlerts((currentAlerts) => currentAlerts.filter((currentAlert) => currentAlert.id !== alert.id))} />)}

    <section aria-label="Overview statistics" className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total events" value={eventStats?.total_events ?? 0} caption="Recorded across all sources" icon="📊" />
      <StatCard title="Active incidents" value={incidents.filter((incident) => !['closed', 'resolved'].includes(incident.status)).length} caption="Open or under investigation" icon="⚠️" />
      <StatCard title="Critical events" value={eventStats?.critical ?? 0} caption="Require immediate review" icon="🔴" />
      <StatCard title="Active sources" value={sources.filter((source) => source.status === 'active').length} caption={`${sources.length} configured source${sources.length === 1 ? '' : 's'}`} icon="🔌" />
    </section>

    <Card className="mb-6" title="Quick actions" subtitle="Start a common analysis task"><div className="flex flex-wrap gap-3">
      <Button onClick={() => navigate('/upload')}>Upload logs</Button><Button onClick={() => navigate('/analysis')} variant="secondary">Run analysis</Button><Button onClick={() => navigate('/reports')} variant="secondary">Generate report</Button><Button onClick={() => navigate('/incidents')} variant="ghost">View incidents</Button>
    </div></Card>

    <section aria-label="Security trends" className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
      <Card title="Recent event activity" subtitle="Latest events by arrival time">{trendData.length > 0 ? <LineChart data={trendData} color="#2563eb" height={220} /> : <EmptyState message="No recent events are available." />}</Card>
      <Card title="Severity distribution" subtitle="All recorded events">{eventStats ? <PieChart data={severityData} height={220} /> : <EmptyState message="Severity data is unavailable." />}</Card>
    </section>

    <Card className="mb-6" title="System status" subtitle="Health of configured log sources">{sources.length === 0 ? <EmptyState message="No log sources are configured yet." /> : <div className="space-y-3">{sources.map((source) => <div key={source.id} className="flex flex-col gap-2 rounded-md bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><StatusBadge status={source.status} /><div><p className="font-medium text-gray-900">{source.name}</p><p className="text-sm capitalize text-gray-500">{source.type} source</p></div></div><time className="text-sm text-gray-500" dateTime={source.last_collected}>Last collected: {formatDateTime(source.last_collected)}</time></div>)}</div>}</Card>

    <Card className="mb-6" title="Live log feed" subtitle={streamStatus === 'connected' ? 'Streaming incoming events' : 'Waiting for a log-stream connection'}>{events.length === 0 ? <EmptyState message="No incoming events yet." /> : <div className="max-h-72 space-y-2 overflow-y-auto" aria-live="polite">{events.slice(0, 6).map((event) => <div key={event.id} className="flex flex-col gap-2 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><SeverityBadge severity={event.severity} /><div><p className="text-sm font-medium text-gray-900">{event.message}</p><p className="text-xs text-gray-500">{event.event_type} · {formatTime(event.timestamp)}</p></div></div><span className="text-xs text-gray-500">Source {event.source_id}</span></div>)}</div>}</Card>

    <Card className="mb-6" title="Recent activity" subtitle="Latest normalized security events" actions={<Button variant="ghost" size="sm" onClick={() => navigate('/analysis')}>View all</Button>}><Table data={events} columns={eventColumns} sortable onRowClick={() => navigate('/analysis')} emptyMessage="No recent events" /></Card>
    <Card title="Active incidents" subtitle="Incidents that still need attention" actions={<Button variant="ghost" size="sm" onClick={() => navigate('/incidents')}>View all</Button>}><Table data={incidents} columns={incidentColumns} sortable onRowClick={() => navigate('/incidents')} emptyMessage="No active incidents" /></Card>
  </div>
}

const StatCard = ({ title, value, caption, icon }: { title: string; value: number; caption: string; icon: string }) => <Card><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-gray-600">{title}</p><p className="mt-1 text-2xl font-bold text-gray-900">{value.toLocaleString()}</p><p className="mt-1 text-sm text-gray-500">{caption}</p></div><span className="text-3xl" aria-hidden="true">{icon}</span></div></Card>
const EmptyState = ({ message }: { message: string }) => <p className="py-8 text-center text-sm text-gray-500">{message}</p>

export default Dashboard
