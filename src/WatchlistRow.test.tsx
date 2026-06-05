import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PRICES } from './__fixtures__/prices'
import { buildRateIndex } from './rates'
import { WatchlistRow } from './WatchlistRow'

describe('WatchlistRow', () => {
  const idx = buildRateIndex(PRICES)

  it('shows the 1:X rate and both currency names', () => {
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Chaos Orb' }} version={1} onSwap={() => {}} onRemove={() => {}} />)
    expect(screen.getByText(/1\s*:\s*P200/)).toBeTruthy()
    expect(screen.getByText('Divine Orb')).toBeTruthy()
    expect(screen.getByText('Chaos Orb')).toBeTruthy()
  })

  it('shows a no-data note when a currency is missing', () => {
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Mystery Orb' }} version={1} onSwap={() => {}} onRemove={() => {}} />)
    expect(screen.getByText(/no price data/i)).toBeTruthy()
  })

  it('calls onSwap when the swap button is clicked', () => {
    const onSwap = vi.fn()
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Chaos Orb' }} version={1} onSwap={onSwap} onRemove={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /swap/i }))
    expect(onSwap).toHaveBeenCalled()
  })

  it('calls onRemove when the remove button is clicked', () => {
    const onRemove = vi.fn()
    render(<WatchlistRow index={idx} pair={{ from: 'Divine Orb', to: 'Chaos Orb' }} version={1} onSwap={() => {}} onRemove={onRemove} />)
    fireEvent.click(screen.getByRole('button', { name: /remove/i }))
    expect(onRemove).toHaveBeenCalled()
  })
})
