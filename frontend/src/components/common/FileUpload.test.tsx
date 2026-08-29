import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FileUpload from './FileUpload'

describe('FileUpload', () => {
  it('rejects files that exceed the configured size limit', async () => {
    const user = userEvent.setup()
    const onFileSelect = vi.fn()
    const file = new File(['x'.repeat(20)], 'large.log', { type: 'text/plain' })

    render(<FileUpload onFileSelect={onFileSelect} maxSize={10} />)

    const input = screen.getByLabelText('Select log file')
    await user.upload(input, file)

    expect(onFileSelect).not.toHaveBeenCalled()
    expect(screen.getByText(/File size exceeds maximum limit/i)).toBeInTheDocument()
  })

  it('accepts valid files', async () => {
    const user = userEvent.setup()
    const onFileSelect = vi.fn()
    const file = new File(['event=login'], 'auth.log', { type: 'text/plain' })

    render(<FileUpload onFileSelect={onFileSelect} accept=".log,.txt" maxSize={1024} />)

    const input = screen.getByLabelText('Select log file')
    await user.upload(input, file)

    expect(onFileSelect).toHaveBeenCalledWith(file)
  })
})
