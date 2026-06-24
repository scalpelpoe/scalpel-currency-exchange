import { fireEvent, render, screen } from '@testing-library/react'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { describe, expect, it, vi } from 'vitest'
import { SearchSelect } from './SearchSelect'

describe('SearchSelect', () => {
  const names = ['Chaos Orb', 'Divine Orb', 'Exalted Orb']

  it('filters options by the typed query and selects on click', () => {
    const onSelect = vi.fn()
    render(<SearchSelect label="From" names={names} value={null} version={1} onSelect={onSelect} />)
    fireEvent.focus(screen.getByPlaceholderText('From'))
    fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: 'div' } })
    fireEvent.click(screen.getByText('Divine Orb'))
    expect(onSelect).toHaveBeenCalledWith('Divine Orb')
  })

  it('shows the selected currency as a card and clears it via the X', () => {
    const onSelect = vi.fn()
    render(<SearchSelect label="To" names={names} value="Chaos Orb" version={1} onSelect={onSelect} />)
    expect(screen.getByText('Chaos Orb')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /remove to/i }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('shows prices with denomination orb in dropdown rows when index is provided', () => {
    const index = new Map<string, PriceEntry>([
      ['Exalted Orb', { name: 'Exalted Orb', category: 'currency', chaosValue: 40, divineValue: 0.2 }],
      ['Mirror of Kalandra', { name: 'Mirror of Kalandra', category: 'currency', chaosValue: 420000, divineValue: 2.1 }],
    ])
    render(
      <SearchSelect
        label="From"
        names={['Exalted Orb', 'Mirror of Kalandra']}
        index={index}
        value={null}
        version={1}
        onSelect={vi.fn()}
      />,
    )
    fireEvent.focus(screen.getByPlaceholderText('From'))
    // baseline chaos in PoE1, and a divine-denominated row:
    expect(screen.getByTitle('P40 chaos')).toBeTruthy()
    expect(screen.getByTitle('P2.1 divine')).toBeTruthy()
    // orb icon present with readable alt
    expect(screen.getByAltText('divine')).toBeTruthy()
  })
})
