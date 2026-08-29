import { describe, expect, it, vi } from 'vitest'
import { logService } from './logService'

describe('logService', () => {
  it('uploads a file and includes it in the history', async () => {
    vi.useFakeTimers()
    const progress = vi.fn()
    const file = new File(['security-event'], 'security.log', { type: 'text/plain' })
    const upload = logService.upload(file, '1', progress)
    await vi.runAllTimersAsync()
    const uploadedLog = await upload
    const historyRequest = logService.list()
    await vi.runAllTimersAsync()
    const history = await historyRequest

    expect(uploadedLog.file_name).toBe('security.log')
    expect(progress).toHaveBeenLastCalledWith(100)
    expect(history.some((item) => item.id === uploadedLog.id)).toBe(true)
    vi.useRealTimers()
  })
})
