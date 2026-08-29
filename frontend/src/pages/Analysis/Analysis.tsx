import { useCallback, useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Card, ErrorMessage, Input, LoadingText, Modal, PieChart, SeverityBadge, Table } from '../../components/common'
import { Header } from '../../components/layout'
import { eventService, sourceService } from '../../services'
import type { Event, LogSource, TableColumn } from '../../types'

const PAGE_SIZE = 10
const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'] as const
const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(value))
const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(value))

const Analysis = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [sources, setSources] = useState<LogSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ search: '', severity: '', sourceId: '', startDate: '', endDate: '' })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [eventResponse, sourceResponse] = await Promise.all([eventService.list({ page: 1, page_size: 100 }), sourceService.list()])
      setEvents(eventResponse.data)
      setSources(sourceResponse)
    } catch (caughtError) {
      console.error('Failed to load analysis data:', caughtError)
      setError('Log events could not be loaded. Check the API connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => { void loadData() }, 0)
    return () => window.clearTimeout(timerId)
  }, [loadData])

  const sourceNames = useMemo(() => new Map(sources.map((source) => [source.id, source.name])), [sources])
  const filteredEvents = useMemo(() => events.filter((event) => {
    const query = filters.search.trim().toLowerCase()
    const matchesSearch = !query || [event.message, event.event_type, event.user, event.host, event.ip_address].filter(Boolean).some((value) => value?.toLowerCase().includes(query))
    const matchesSeverity = !filters.severity || event.severity === filters.severity
    const matchesSource = !filters.sourceId || event.source_id === filters.sourceId
    const eventDate = event.timestamp.slice(0, 10)
    const matchesStart = !filters.startDate || eventDate >= filters.startDate
    const matchesEnd = !filters.endDate || eventDate <= filters.endDate
    return matchesSearch && matchesSeverity && matchesSource && matchesStart && matchesEnd
  }), [events, filters])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedEvents = useMemo(() => filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [currentPage, filteredEvents])

  const severityData = useMemo(() => SEVERITIES.map((severity) => ({
    name: severity[0].toUpperCase() + severity.slice(1),
    value: filteredEvents.filter((event) => event.severity === severity).length,
    color: { critical: '#dc2626', high: '#ea580c', medium: '#ca8a04', low: '#16a34a', info: '#2563eb' }[severity],
  })), [filteredEvents])
  const timelineData = useMemo(() => [...filteredEvents].sort((first, second) => new Date(first.timestamp).getTime() - new Date(second.timestamp).getTime()).map((event) => ({ name: formatTime(event.timestamp), events: 1 })), [filteredEvents])
  const sourceData = useMemo(() => sources.map((source) => ({ name: source.name, events: filteredEvents.filter((event) => event.source_id === source.id).length })), [filteredEvents, sources])
  const errorRateData = useMemo(() => timelineData.map((point, index) => ({ name: point.name, errors: filteredEvents.slice(0, index + 1).filter((event) => ['critical', 'high'].includes(event.severity)).length })), [filteredEvents, timelineData])

  const setFilter = (key: keyof typeof filters, value: string) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1) }
  const resetFilters = () => { setFilters({ search: '', severity: '', sourceId: '', startDate: '', endDate: '' }); setPage(1) }
  const activeFilters = Object.values(filters).filter(Boolean).length

  const eventColumns: TableColumn[] = [
    { key: 'timestamp', label: 'Timestamp', sortable: true, render: (value: string) => formatDateTime(value) },
    { key: 'event_type', label: 'Event type', sortable: true },
    { key: 'severity', label: 'Level', sortable: true, render: (value: string) => <SeverityBadge severity={value} /> },
    { key: 'message', label: 'Message' },
    { key: 'source_id', label: 'Source', sortable: true, render: (value: string) => sourceNames.get(value) ?? value },
  ]

  if (loading) return <div className="p-6"><Header title="Log analysis" subtitle="Search, inspect, and visualize normalized security events" /><LoadingText text="Loading log events..." /></div>

  return <div className="p-6">
    <Header title="Log analysis" subtitle="Search, inspect, and visualize normalized security events" actions={<Button variant="secondary" size="sm" onClick={() => void loadData()}>Refresh</Button>} />
    {error && <ErrorMessage className="mb-6" message={error} onDismiss={() => setError(null)} />}

    <Card className="mb-6" title="Event filters" subtitle={activeFilters ? `${activeFilters} active filter${activeFilters === 1 ? '' : 's'}` : 'Narrow the log viewer by level, time, or source'} actions={activeFilters ? <Button variant="ghost" size="sm" onClick={resetFilters}>Clear filters</Button> : undefined}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Input label="Search" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Message, user, host, IP…" />
        <FilterSelect id="severity" label="Log level" value={filters.severity} onChange={(value) => setFilter('severity', value)} options={SEVERITIES.map((severity) => ({ value: severity, label: severity.toUpperCase() }))} />
        <FilterSelect id="source" label="Source" value={filters.sourceId} onChange={(value) => setFilter('sourceId', value)} options={sources.map((source) => ({ value: source.id, label: source.name }))} />
        <DateInput id="start-date" label="From" value={filters.startDate} onChange={(value) => setFilter('startDate', value)} />
        <DateInput id="end-date" label="To" value={filters.endDate} onChange={(value) => setFilter('endDate', value)} />
      </div>
    </Card>

    <section className="grid grid-cols-1 gap-6 mb-6 xl:grid-cols-2" aria-label="Event visualizations">
      <Card title="Error rate over time" subtitle="Critical and high-severity events"><ChartFrame hasData={errorRateData.length > 0}><ResponsiveContainer width="100%" height={220}><LineChart data={errorRateData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="errors" stroke="#dc2626" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></ChartFrame></Card>
      <Card title="Log-level distribution" subtitle="Events matching current filters"><ChartFrame hasData={filteredEvents.length > 0}><PieChart data={severityData} height={220} /></ChartFrame></Card>
      <Card title="Event timeline" subtitle="Events received over time"><ChartFrame hasData={timelineData.length > 0}><ResponsiveContainer width="100%" height={220}><AreaChart data={timelineData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Area type="monotone" dataKey="events" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} /></AreaChart></ResponsiveContainer></ChartFrame></Card>
      <Card title="Source comparison" subtitle="Events per configured source"><ChartFrame hasData={sourceData.length > 0}><ResponsiveContainer width="100%" height={220}><BarChart data={sourceData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={false} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="events" fill="#2563eb" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></ChartFrame></Card>
    </section>

    <Card title="Log viewer" subtitle={`${filteredEvents.length} event${filteredEvents.length === 1 ? '' : 's'} found`}><Table data={paginatedEvents} columns={eventColumns} sortable onRowClick={setSelectedEvent} emptyMessage="No events match the selected filters." />
      {filteredEvents.length > PAGE_SIZE && <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4"><p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</Button><Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)}>Next</Button></div></div>}
    </Card>

    <Modal isOpen={selectedEvent !== null} onClose={() => setSelectedEvent(null)} title="Log event details" size="lg">{selectedEvent && <div className="space-y-5"><div className="flex flex-wrap items-center gap-3"><SeverityBadge severity={selectedEvent.severity} /><span className="text-sm text-gray-500">{formatDateTime(selectedEvent.timestamp)}</span></div><Detail label="Event type" value={selectedEvent.event_type} /><Detail label="Message" value={selectedEvent.message} /><Detail label="Source" value={sourceNames.get(selectedEvent.source_id) ?? selectedEvent.source_id} /><Detail label="User" value={selectedEvent.user} /><Detail label="Host" value={selectedEvent.host} /><Detail label="IP address" value={selectedEvent.ip_address} /><div><p className="text-sm font-medium text-gray-700">Raw event data</p><pre className="mt-1 overflow-x-auto rounded-md bg-gray-900 p-3 text-xs text-gray-100">{JSON.stringify(selectedEvent.raw_data, null, 2)}</pre></div></div>}</Modal>
  </div>
}

const FilterSelect = ({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) => <div><label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={id}>{label}</label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="">All {label.toLowerCase()}s</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
const DateInput = ({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) => <div><label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={id}>{label}</label><input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
const ChartFrame = ({ hasData, children }: { hasData: boolean; children: React.ReactNode }) => hasData ? children : <p className="py-20 text-center text-sm text-gray-500">No chart data for the current filters.</p>
const Detail = ({ label, value }: { label: string; value?: string }) => value ? <div><p className="text-sm font-medium text-gray-700">{label}</p><p className="mt-1 text-sm text-gray-900">{value}</p></div> : null

export default Analysis
