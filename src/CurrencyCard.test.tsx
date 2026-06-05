import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CurrencyCard } from './CurrencyCard'

describe('CurrencyCard', () => {
  it('renders the currency name and an icon sourced from the name', () => {
    const { container } = render(<CurrencyCard name="Divine Orb" version={1} />)
    expect(screen.getByText('Divine Orb')).toBeTruthy()
    expect(container.querySelector('img')?.getAttribute('src')).toContain('Divine Orb')
  })
})
