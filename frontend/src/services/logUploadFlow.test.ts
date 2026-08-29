import { describe, expect, it } from 'vitest'
import { logService } from './logService'
import { sourceService } from './sourceService'

describe('mock log-upload flow', () => {
  it('loads a source, uploads its log file, and exposes it in upload history', async () => {
    const sources = await sourceService.list()
    const file = new File(['event=login_failed'], 'authentication.log', { type: 'text/plain' })
    const uploadedLog = await logService.upload(file, sources[0].id)
    const history = await logService.list()

    expect(sources[0].status).toBe('active')
    expect(uploadedLog.source_id).toBe(sources[0].id)
    expect(history).toContainEqual(uploadedLog)
  })
})
