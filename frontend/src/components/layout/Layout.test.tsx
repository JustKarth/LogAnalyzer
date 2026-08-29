import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Layout from './Layout'

const renderLayoutAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Layout />
    </MemoryRouter>,
  )

describe('Layout navigation', () => {
  it('highlights the active route in mobile navigation', () => {
    renderLayoutAt('/analysis')

    expect(screen.getByRole('link', { name: 'Analysis' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('provides a skip link to main content', () => {
    renderLayoutAt('/dashboard')

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content')
    expect(document.getElementById('main-content')).toBeTruthy()
  })

  it('navigates between primary sections', async () => {
    const user = userEvent.setup()
    renderLayoutAt('/dashboard')

    await user.click(screen.getByRole('link', { name: 'Reports' }))
    expect(screen.getByRole('link', { name: 'Reports' })).toHaveAttribute('aria-current', 'page')
  })
})
