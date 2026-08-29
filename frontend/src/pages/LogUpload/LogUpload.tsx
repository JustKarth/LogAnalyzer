import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, ErrorMessage, FileUpload, Input, Modal, StatusBadge, Table } from '../../components/common'
import { Header } from '../../components/layout'
import { logService, sourceService } from '../../services'
import type { UploadedLog } from '../../services/logService'
import type { LogSource, TableColumn } from '../../types'

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ACCEPTED_LOG_FORMATS = '.log,.txt,.json,.csv'

const formatFileSize = (size: number) => `${(size / 1024).toLocaleString(undefined, { maximumFractionDigits: 1 })} KB`
const formatDateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const LogUpload = () => {
  const [sources, setSources] = useState<LogSource[]>([])
  const [uploads, setUploads] = useState<UploadedLog[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedSourceId, setSelectedSourceId] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSourceModalOpen, setSourceModalOpen] = useState(false)
  const [isCreatingSource, setCreatingSource] = useState(false)
  const [sourceForm, setSourceForm] = useState({ name: '', type: 'file' as LogSource['type'], location: '' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sourceData, uploadData] = await Promise.all([sourceService.list(), logService.list()])
      setSources(sourceData)
      setUploads(uploadData)
    } catch (caughtError) {
      console.error('Failed to load upload management data:', caughtError)
      setError('Upload management data could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => { void loadData() }, 0)
    return () => window.clearTimeout(timerId)
  }, [loadData])

  const sourceNames = useMemo(() => new Map(sources.map((source) => [source.id, source.name])), [sources])
  const isUploading = uploadProgress !== null

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Choose a log file before starting the upload.')
      return
    }
    setError(null)
    setSuccess(null)
    setUploadProgress(0)
    try {
      const uploadedLog = await logService.upload(selectedFile, selectedSourceId || undefined, setUploadProgress)
      setUploads((currentUploads) => [uploadedLog, ...currentUploads])
      setSuccess(`${selectedFile.name} was uploaded successfully.`)
      setSelectedFile(null)
      setSelectedSourceId('')
    } catch (caughtError) {
      console.error('Failed to upload log:', caughtError)
      setError('The log file could not be uploaded. Please try again.')
    } finally {
      setUploadProgress(null)
    }
  }

  const handleCreateSource = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sourceForm.name.trim() || !sourceForm.location.trim()) {
      setError('Enter both a source name and its location or endpoint.')
      return
    }
    setCreatingSource(true)
    setError(null)
    try {
      const config = sourceForm.type === 'file' ? { path: sourceForm.location } : { host: sourceForm.location }
      const source = await sourceService.create({ name: sourceForm.name.trim(), type: sourceForm.type, config })
      setSources((currentSources) => [...currentSources, source])
      setSelectedSourceId(source.id)
      setSourceForm({ name: '', type: 'file', location: '' })
      setSourceModalOpen(false)
      setSuccess(`${source.name} was added as a log source.`)
    } catch (caughtError) {
      console.error('Failed to create source:', caughtError)
      setError('The log source could not be saved. Please try again.')
    } finally {
      setCreatingSource(false)
    }
  }

  const uploadColumns: TableColumn[] = [
    { key: 'file_name', label: 'File', sortable: true },
    { key: 'source_id', label: 'Source', sortable: true, render: (value: string | undefined) => value ? sourceNames.get(value) ?? 'Unknown source' : 'Not assigned' },
    { key: 'size', label: 'Size', sortable: true, render: (value: number) => formatFileSize(value) },
    { key: 'uploaded_at', label: 'Uploaded', sortable: true, render: (value: string) => formatDateTime(value) },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
  ]

  return <div className="p-6">
    <Header title="Log upload & management" subtitle="Import, validate, and track raw security log files" actions={<Button variant="secondary" size="sm" onClick={() => void loadData()} loading={loading}>Refresh</Button>} />
    {error && <ErrorMessage className="mb-6" message={error} onDismiss={() => setError(null)} />}
    {success && <ErrorMessage className="mb-6" type="info" message={success} onDismiss={() => setSuccess(null)} />}

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <Card className="xl:col-span-2" title="Upload log file" subtitle="Supported formats: LOG, TXT, JSON, CSV (maximum 25 MB)">
        <FileUpload onFileSelect={(file) => { setSelectedFile(file); setError(null); setSuccess(null) }} accept={ACCEPTED_LOG_FORMATS} maxSize={MAX_FILE_SIZE} />
        {selectedFile && <div className="mt-4 flex flex-col gap-3 rounded-md bg-primary-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium text-gray-900">{selectedFile.name}</p><p className="text-sm text-gray-600">{formatFileSize(selectedFile.size)} · Ready to upload</p></div><Button variant="ghost" size="sm" disabled={isUploading} onClick={() => setSelectedFile(null)}>Remove</Button></div>}
        <div className="mt-5"><label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="upload-source">Assign to source <span className="font-normal text-gray-500">(optional)</span></label><select id="upload-source" value={selectedSourceId} disabled={isUploading} onChange={(event) => setSelectedSourceId(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="">No source assigned</option>{sources.map((source) => <option key={source.id} value={source.id}>{source.name}</option>)}</select></div>
        {isUploading && <div className="mt-5" aria-live="polite"><div className="mb-2 flex justify-between text-sm text-gray-600"><span>Uploading and validating…</span><span>{uploadProgress}%</span></div><div className="h-2 overflow-hidden rounded bg-gray-200"><div className="h-full bg-primary-600 transition-all" style={{ width: `${uploadProgress}%` }} /></div></div>}
        <div className="mt-5 flex justify-end"><Button onClick={() => void handleUpload()} disabled={!selectedFile} loading={isUploading}>Upload log</Button></div>
      </Card>

      <Card title="Log sources" subtitle="Choose where uploaded logs belong" actions={<Button variant="ghost" size="sm" onClick={() => setSourceModalOpen(true)}>Add source</Button>}>
        {sources.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No log sources configured.</p> : <div className="space-y-3">{sources.map((source) => <div key={source.id} className="rounded-md border border-gray-200 p-3"><div className="flex items-center justify-between gap-2"><p className="font-medium text-gray-900">{source.name}</p><StatusBadge status={source.status} /></div><p className="mt-1 text-sm capitalize text-gray-500">{source.type} source</p></div>)}</div>}
      </Card>
    </div>

    <Card className="mt-6" title="Upload history" subtitle="Previously imported raw log files"><Table data={uploads} columns={uploadColumns} sortable loading={loading} emptyMessage="No log files have been uploaded yet." /></Card>

    <Modal isOpen={isSourceModalOpen} onClose={() => setSourceModalOpen(false)} title="Add log source">
      <form onSubmit={(event) => void handleCreateSource(event)}>
        <Input label="Source name" value={sourceForm.name} onChange={(event) => setSourceForm({ ...sourceForm, name: event.target.value })} placeholder="e.g. Production firewall" />
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="source-type">Source type</label><select id="source-type" value={sourceForm.type} onChange={(event) => setSourceForm({ ...sourceForm, type: event.target.value as LogSource['type'] })} className="mb-4 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"><option value="file">File</option><option value="syslog">Syslog</option><option value="api">API</option></select>
        <Input label={sourceForm.type === 'file' ? 'File path' : 'Host or endpoint'} value={sourceForm.location} onChange={(event) => setSourceForm({ ...sourceForm, location: event.target.value })} placeholder={sourceForm.type === 'file' ? '/var/log/application.log' : 'logs.example.internal'} />
        <div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setSourceModalOpen(false)}>Cancel</Button><Button type="submit" loading={isCreatingSource}>Save source</Button></div>
      </form>
    </Modal>
  </div>
}

export default LogUpload
