import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sparkline } from './Sparkline'

const CURSOR = { viewportX: 0, viewportY: 0, scale: 1 }

describe('Sparkline', () => {
  // graph[last] = 0% -> today's rate is the baseline. Peak +50% was 150,
  // valley -20% was 80 (float-exact values: the mocked formatPrice "P150"
  // does not round). formatRate delegates to that mock.
  const graph = [0, 50, -20, 0]

  it('shows peak and valley chips with the reconstructed historical rate', () => {
    render(<Sparkline graph={graph} cursor={CURSOR} rate={100} />)
    expect(screen.getByText('P150')).toBeTruthy()
    expect(screen.getByText('P80')).toBeTruthy()
  })

  it('adds the quote-currency icon to the chips when given one', () => {
    render(<Sparkline graph={graph} cursor={CURSOR} rate={100} quoteIcon="icon://Chaos Orb" />)
    const icons = document.querySelectorAll('img[src="icon://Chaos Orb"]')
    expect(icons.length).toBe(2)
  })

  it('renders no chips without a current rate', () => {
    render(<Sparkline graph={graph} cursor={CURSOR} />)
    expect(screen.queryByText('P150')).toBeNull()
    expect(screen.queryByText('P80')).toBeNull()
  })

  it('renders no valley chip for a flat series (peak only)', () => {
    render(<Sparkline graph={[5, 5, 5]} cursor={CURSOR} rate={105} />)
    // baseline = 105 / 1.05 = 100; the single extremum at +5% is 105.
    expect(screen.getAllByText('P105')).toHaveLength(1)
  })
})
