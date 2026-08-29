import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

vi.mock('../pages/Dashboard/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }))
vi.mock('../pages/LogUpload/LogUpload', () => ({ default: () => <div>Upload Page</div> }))
vi.mock('../pages/Analysis/Analysis', () => ({ default: () => <div>Analysis Page</div> }))
vi.mock('../pages/Incidents/Incidents', () => ({ default: () => <div>Incidents Page</div> }))
vi.mock('../pages/Reports/Reports', () => ({ default: () => <div>Reports Page</div> }))
vi.mock('../pages/Settings/Settings', () => ({ default: () => <div>Settings Page</div> }))

const renderAppAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )

describe('App routing', () => {
  it('renders the dashboard route by default', async () => {
    renderAppAt('/')

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })
  })

  it('loads lazily imported pages when navigating', async () => {
    const user = userEvent.setup()
    renderAppAt('/dashboard')

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument()
    })

    await user.click(screen.getAllByRole('link', { name: 'Upload' })[0])
    expect(await screen.findByText('Upload Page')).toBeInTheDocument()
  })
})
