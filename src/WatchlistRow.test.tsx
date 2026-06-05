import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PRICES } from './__fixtures__/prices'
import { buildRateIndex } from './rates'
import { WatchlistRow } from './WatchlistRow'

describe('WatchlistRow', () => {
  const idx = buildRateIndex(PRICES)

  it('shows both directions of the rate', () => {
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Chaos Orb' }} onRemove={() => {}} />)
    expect(screen.getByText(/1 Divine Orb = P200 Chaos Orb/)).toBeTruthy()
    expect(screen.getByText(/1 Chaos Orb = 0\.005 Divine Orb/)).toBeTruthy()
  })

  it('shows a no-data note when a currency is missing from the snapshot', () => {
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Mystery Orb' }} onRemove={() => {}} />)
    expect(screen.getByText(/no price data/i)).toBeTruthy()
  })

  it('calls onRemove when the remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Chaos Orb' }} onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onRemove).toHaveBeenCalled()
  })
})
