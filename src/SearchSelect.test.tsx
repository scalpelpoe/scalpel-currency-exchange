import { fireEvent, render, screen } from '@testing-library/react'
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
})
