import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Button from './Button'

describe('Button', () => {
  it('renders children and handles clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Upload logs</Button>)

    await user.click(screen.getByRole('button', { name: 'Upload logs' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('disables interaction while loading', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()

    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })
})
