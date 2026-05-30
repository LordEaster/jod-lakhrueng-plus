import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ScrollToTop from './ScrollToTop'

function TestRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Link to="/settings">Settings</Link>} />
        <Route path="/settings" element={<h1>Settings page</h1>} />
      </Routes>
    </>
  )
}

describe('ScrollToTop', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls to the top when the route path changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <TestRoutes />
      </MemoryRouter>,
    )

    scrollTo.mockClear()
    await user.click(screen.getByRole('link', { name: 'Settings' }))

    expect(screen.getByRole('heading', { name: 'Settings page' })).toBeInTheDocument()
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
