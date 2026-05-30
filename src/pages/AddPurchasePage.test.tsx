import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AddPurchasePage from './AddPurchasePage'

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(() => []),
}))

vi.mock('../hooks/useSettings', () => ({
  useSchemeSetting: vi.fn(() => ({
    dailyCap: 120,
    monthlyCap: 1200,
    totalCap: 1200,
    subsidyRate: 0.6,
    startDate: undefined,
    updatedAt: '',
  })),
}))

vi.mock('../hooks/useDailySummary', () => ({
  useDailySummary: vi.fn(() => ({
    totalAmount: 0,
    totalSubsidy: 0,
    totalUserPaid: 0,
    toFillDaily: 200,
    remainingDaily: 120,
    entries: [],
  })),
}))

describe('AddPurchasePage keyboard navigation', () => {
  it('moves to the next field when pressing Enter', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <AddPurchasePage />
      </MemoryRouter>,
    )

    const amountInput = screen.getByLabelText(/ยอดซื้อ/)
    const titleInput = screen.getByLabelText(/ชื่อรายการ/)
    const categorySelect = screen.getByLabelText(/หมวดหมู่/)

    amountInput.focus()
    await user.keyboard('{Enter}')
    expect(titleInput).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(categorySelect).toHaveFocus()
  })
})
