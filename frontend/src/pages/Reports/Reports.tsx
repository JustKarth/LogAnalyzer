import { useMemo, useState } from 'react'
import { Button, Card, ErrorMessage, Input, Modal, StatusBadge, Table } from '../../components/common'
import { Header } from '../../components/layout'
import type { TableColumn } from '../../types'

type ReportStatus = 'ready' | 'scheduled'
type Report = { id: string; title: string; type: string; period: string; createdAt: string; status: ReportStatus; findings: string[] }
type Template = { id: string; name: string; description: string; sections: string[] }
type Schedule = { id: string; reportName: string; frequency: 'daily' | 'weekly' | 'monthly'; nextRun: string; enabled: boolean }

const initialReports: Report[] = [
  { id: 'report-1', title: 'Daily security summary', type: 'Executive summary', period: 'Last 24 hours', createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(), status: 'ready', findings: ['23 critical events require immediate review.', 'Two log sources are actively reporting.', 'One open incident remains under investigation.'] },
]
const initialTemplates: Template[] = [
  { id: 'template-executive', name: 'Executive security summary', description: 'A concise view of key risks, incidents, and trends.', sections: ['Risk overview', 'Critical findings', 'Recommendations'] },
  { id: 'template-technical', name: 'Technical event analysis', description: 'Detailed event and source-oriented analysis for analysts.', sections: ['Event trends', 'Source activity', 'Investigation notes'] },
]

const dateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const escapePdf = (value: string) => value.replace(/([()\\])/g, '\\$1').replace(/[^ -~]/g, '?')
const download = (fileName: string, content: BlobPart, type: string) => { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = fileName; link.click(); URL.revokeObjectURL(url) }
const downloadPdf = (report: Report) => {
  const lines = [report.title, `Period: ${report.period}`, `Created: ${dateTime(report.createdAt)}`, '', 'Key findings:', ...report.findings.map((finding) => `- ${finding}`)]
  const stream = `BT\n/F1 16 Tf\n50 760 Td\n(${escapePdf(lines[0])}) Tj\n/F1 11 Tf\n${lines.slice(1).map((line) => `0 -22 Td\n(${escapePdf(line)}) Tj`).join('\n')}\nET`
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]
  let pdf = '%PDF-1.4\n'; const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${offset.toString().padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  download(`${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`, pdf, 'application/pdf')
}

const Reports = () => {
  const [reports, setReports] = useState(initialReports)
  const [templates, setTemplates] = useState(initialTemplates)
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false)
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [form, setForm] = useState({ title: 'Security analysis report', templateId: initialTemplates[0].id, period: 'Last 24 hours' })
  const [templateForm, setTemplateForm] = useState({ name: '', description: '' })
  const [scheduleForm, setScheduleForm] = useState({ reportName: 'Daily security summary', frequency: 'daily' as Schedule['frequency'] })

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === form.templateId) ?? templates[0], [form.templateId, templates])
  const generateReport = () => {
    const report: Report = { id: crypto.randomUUID(), title: form.title.trim() || 'Security analysis report', type: selectedTemplate.name, period: form.period, createdAt: new Date().toISOString(), status: 'ready', findings: ['Review all critical and high-severity activity in the selected period.', 'Confirm source connectivity and investigate unassigned log files.', 'Prioritize open incidents by their current risk score.'] }
    setReports((currentReports) => [report, ...currentReports])
    setSelectedReport(report)
    setMessage('Report generated and added to report history.')
  }
  const exportReport = (report: Report, format: 'csv' | 'json' | 'pdf') => {
    if (format === 'pdf') downloadPdf(report)
    if (format === 'json') download(`${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`, JSON.stringify(report, null, 2), 'application/json')
    if (format === 'csv') download(`${report.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`, `report_title,period,finding\n${report.findings.map((finding) => `"${report.title.replace(/"/g, '""')}","${report.period}","${finding.replace(/"/g, '""')}"`).join('\n')}`, 'text/csv;charset=utf-8')
    setMessage(`${format.toUpperCase()} export downloaded.`)
  }
  const createTemplate = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!templateForm.name.trim()) return; const template: Template = { id: crypto.randomUUID(), name: templateForm.name.trim(), description: templateForm.description.trim() || 'Custom report template', sections: ['Summary', 'Findings', 'Recommendations'] }; setTemplates((current) => [...current, template]); setForm((current) => ({ ...current, templateId: template.id })); setTemplateForm({ name: '', description: '' }); setTemplateModalOpen(false); setMessage('Custom report template saved.') }
  const createSchedule = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const schedule: Schedule = { id: crypto.randomUUID(), reportName: scheduleForm.reportName.trim() || 'Scheduled security report', frequency: scheduleForm.frequency, nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), enabled: true }; setSchedules((current) => [...current, schedule]); setScheduleModalOpen(false); setMessage('Scheduled report added.') }
  const columns: TableColumn[] = [{ key: 'title', label: 'Report', sortable: true }, { key: 'type', label: 'Template', sortable: true }, { key: 'period', label: 'Period', sortable: true }, { key: 'createdAt', label: 'Generated', sortable: true, render: (value: string) => dateTime(value) }, { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> }]

  return <div className="p-6"><Header title="Reports & export" subtitle="Generate, schedule, and download security-analysis reports" />
    {message && <ErrorMessage type="info" className="mb-6" message={message} onDismiss={() => setMessage(null)} />}
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3"><Card className="xl:col-span-2" title="Generate report" subtitle="Create a summary from the current security-analysis data"><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><Input label="Report title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /><Select id="template" label="Report template" value={form.templateId} onChange={(value) => setForm({ ...form, templateId: value })} options={templates.map((template) => ({ value: template.id, label: template.name }))} /><Select id="period" label="Reporting period" value={form.period} onChange={(value) => setForm({ ...form, period: value })} options={['Last 24 hours', 'Last 7 days', 'Last 30 days', 'Custom range'].map((value) => ({ value, label: value }))} /></div><div className="mt-2 rounded-md bg-gray-50 p-4"><p className="text-sm font-medium text-gray-700">Included sections</p><p className="mt-1 text-sm text-gray-600">{selectedTemplate.sections.join(' · ')}</p></div><div className="mt-5 flex flex-wrap justify-end gap-3"><Button variant="secondary" onClick={() => setTemplateModalOpen(true)}>Create template</Button><Button onClick={generateReport}>Generate report</Button></div></Card>
      <Card title="Scheduled reports" subtitle="Set up recurring report generation" actions={<Button variant="ghost" size="sm" onClick={() => setScheduleModalOpen(true)}>Add schedule</Button>}>{schedules.length === 0 ? <p className="py-6 text-center text-sm text-gray-500">No reports are scheduled.</p> : <div className="space-y-3">{schedules.map((schedule) => <div key={schedule.id} className="rounded-md border border-gray-200 p-3"><div className="flex justify-between gap-2"><p className="font-medium text-gray-900">{schedule.reportName}</p><StatusBadge status={schedule.enabled ? 'active' : 'inactive'} /></div><p className="mt-1 text-sm capitalize text-gray-500">{schedule.frequency} · Next: {dateTime(schedule.nextRun)}</p></div>)}</div>}</Card></div>
    <Card className="mt-6" title="Report history" subtitle="Select a report to review its findings or export it"><Table data={reports} columns={columns} sortable onRowClick={setSelectedReport} emptyMessage="No reports generated yet." /></Card>
    <Modal isOpen={selectedReport !== null} onClose={() => setSelectedReport(null)} title="Report details" size="lg">{selectedReport && <div className="space-y-5"><div><p className="text-sm text-gray-500">{selectedReport.type} · {selectedReport.period}</p><h4 className="mt-1 text-xl font-semibold text-gray-900">{selectedReport.title}</h4><p className="mt-1 text-sm text-gray-500">Generated {dateTime(selectedReport.createdAt)}</p></div><div><p className="text-sm font-medium text-gray-700">Key findings</p><ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-gray-800">{selectedReport.findings.map((finding) => <li key={finding}>{finding}</li>)}</ul></div><div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 pt-4"><Button size="sm" variant="secondary" onClick={() => exportReport(selectedReport, 'csv')}>Download CSV</Button><Button size="sm" variant="secondary" onClick={() => exportReport(selectedReport, 'json')}>Download JSON</Button><Button size="sm" onClick={() => exportReport(selectedReport, 'pdf')}>Download PDF</Button></div></div>}</Modal>
    <Modal isOpen={isTemplateModalOpen} onClose={() => setTemplateModalOpen(false)} title="Create custom template"><form onSubmit={createTemplate}><Input label="Template name" value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} /><Input label="Description" value={templateForm.description} onChange={(event) => setTemplateForm({ ...templateForm, description: event.target.value })} /><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setTemplateModalOpen(false)}>Cancel</Button><Button type="submit">Save template</Button></div></form></Modal>
    <Modal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Schedule report"><form onSubmit={createSchedule}><Input label="Report name" value={scheduleForm.reportName} onChange={(event) => setScheduleForm({ ...scheduleForm, reportName: event.target.value })} /><Select id="frequency" label="Frequency" value={scheduleForm.frequency} onChange={(value) => setScheduleForm({ ...scheduleForm, frequency: value as Schedule['frequency'] })} options={['daily', 'weekly', 'monthly'].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} /><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setScheduleModalOpen(false)}>Cancel</Button><Button type="submit">Save schedule</Button></div></form></Modal>
  </div>
}

const Select = ({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) => <div><label className="mb-1 block text-sm font-medium text-gray-700" htmlFor={id}>{label}</label><select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>

export default Reports
