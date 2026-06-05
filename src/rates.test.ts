import { describe, expect, it } from 'vitest'
import { PRICES } from './__fixtures__/prices'
import { buildRateIndex, currencyNames, pairTrend, rate, rateSeries } from './rates'

describe('currencyNames', () => {
  it('returns the entry names sorted alphabetically', () => {
    expect(currencyNames(PRICES)).toEqual(['Chaos Orb', 'Divine Orb', 'Exalted Orb', 'Orb of Annulment'])
  })
})

describe('buildRateIndex', () => {
  it('keys entries by name for O(1) lookup', () => {
    const idx = buildRateIndex(PRICES)
    expect(idx.get('Divine Orb')?.chaosValue).toBe(200)
    expect(idx.get('Nonexistent Orb')).toBeUndefined()
  })
})

describe('rate', () => {
  it('computes from->to as chaosValue ratio', () => {
    const idx = buildRateIndex(PRICES)
    expect(rate(idx, 'Divine Orb', 'Chaos Orb')).toBe(200)
    expect(rate(idx, 'Chaos Orb', 'Divine Orb')).toBe(1 / 200)
  })
  it('returns null when either side is missing or non-positive', () => {
    const idx = buildRateIndex(PRICES)
    expect(rate(idx, 'Divine Orb', 'Nonexistent Orb')).toBeNull()
    expect(rate(idx, 'Nonexistent Orb', 'Chaos Orb')).toBeNull()
  })
})

describe('pairTrend', () => {
  it('is up when from outgained to over the window', () => {
    const idx = buildRateIndex(PRICES)
    const t = pairTrend(idx, 'Divine Orb', 'Exalted Orb')
    expect(t.dir).toBe('up')
    expect(t.pct).toBeGreaterThan(0)
  })
  it('is flat when a graph is missing', () => {
    const idx = buildRateIndex(PRICES)
    expect(pairTrend(idx, 'Orb of Annulment', 'Chaos Orb').dir).toBe('flat')
  })
  it('is flat (not Infinity) when the to-currency window change is -100%', () => {
    const idx = buildRateIndex([
      { name: 'A', category: 'currency', chaosValue: 10, graph: [0, 0, 0, 0, 0, 0, 5] },
      { name: 'B', category: 'currency', chaosValue: 10, graph: [0, 0, 0, 0, 0, 0, -100] },
    ] as never)
    const t = pairTrend(idx, 'A', 'B')
    expect(t.dir).toBe('flat')
    expect(Number.isFinite(t.pct)).toBe(true)
  })
})

describe('rateSeries', () => {
  it('combines both currency graphs point by point; last point matches pairTrend', () => {
    const idx = buildRateIndex(PRICES)
    const s = rateSeries(idx, 'Divine Orb', 'Exalted Orb')
    expect(s).toHaveLength(7)
    expect(s[6]).toBeCloseTo(((1 + 10 / 100) / (1 + -10 / 100) - 1) * 100, 5)
  })
  it('is empty when a currency lacks a graph', () => {
    const idx = buildRateIndex(PRICES)
    expect(rateSeries(idx, 'Orb of Annulment', 'Chaos Orb')).toEqual([])
  })
})
