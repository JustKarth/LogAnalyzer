import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ErrorBoundary from './ErrorBoundary'

const ThrowingComponent = () => {
  throw new Error('Test render failure')
}

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <p>Healthy content</p>
      </ErrorBoundary>,
    )

    expect(screen.getByText('Healthy content')).toBeInTheDocument()
  })

  it('shows fallback UI when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test render failure')).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
