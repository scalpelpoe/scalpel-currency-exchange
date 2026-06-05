import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SearchSelect } from './SearchSelect'

describe('SearchSelect', () => {
  const names = ['Chaos Orb', 'Divine Orb', 'Exalted Orb']

  it('filters options by the typed query and selects on click', () => {
    const onSelect = vi.fn()
    render(<SearchSelect label="From" names={names} value={null} onSelect={onSelect} />)
    fireEvent.focus(screen.getByPlaceholderText('From'))
    fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: 'div' } })
    const option = screen.getByText('Divine Orb')
    fireEvent.click(option)
    expect(onSelect).toHaveBeenCalledWith('Divine Orb')
  })

  it('shows the current value as the input text', () => {
    render(<SearchSelect label="To" names={names} value="Chaos Orb" onSelect={() => {}} />)
    expect(screen.getByDisplayValue('Chaos Orb')).toBeTruthy()
  })
})
