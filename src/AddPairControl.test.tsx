import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddPairControl } from './AddPairControl'

describe('AddPairControl', () => {
  const names = ['Chaos Orb', 'Divine Orb', 'Exalted Orb']

  it('calls onAdd with the chosen from/to and is disabled until both are set', () => {
    const onAdd = vi.fn()
    render(<AddPairControl names={names} version={1} onAdd={onAdd} />)
    const addBtn = screen.getByRole('button', { name: /add/i })
    expect((addBtn as HTMLButtonElement).disabled).toBe(true)

    fireEvent.focus(screen.getByPlaceholderText('From'))
    fireEvent.change(screen.getByPlaceholderText('From'), { target: { value: 'chaos' } })
    fireEvent.click(screen.getByText('Chaos Orb'))

    fireEvent.focus(screen.getByPlaceholderText('To'))
    fireEvent.change(screen.getByPlaceholderText('To'), { target: { value: 'div' } })
    fireEvent.click(screen.getByText('Divine Orb'))

    expect((addBtn as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(addBtn)
    expect(onAdd).toHaveBeenCalledWith({ from: 'Chaos Orb', to: 'Divine Orb' })
  })
})
