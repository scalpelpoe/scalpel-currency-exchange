import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { describe, expect, it } from 'vitest'
import { currencyPrice, formatPriceText, formatRate } from './format'

// The SDK is vitest-aliased to src/test/sdk-mock.tsx, whose formatPrice returns
// "P<n>". So for value>=1 we assert formatRate DELEGATES to formatPrice; the
// sub-1 and null branches are formatRate's own logic.
describe('formatRate', () => {
  it('delegates to formatPrice for values >= 1', () => {
    expect(formatRate(200)).toBe('P200')
    expect(formatRate(1)).toBe('P1')
  })
  it('keeps small sub-1 rates readable instead of rounding to 0', () => {
    expect(formatRate(0.005)).toBe('0.005')
    expect(formatRate(0.5)).toBe('0.5')
  })
  it('renders null as a dash', () => {
    expect(formatRate(null)).toBe('-')
  })
})

describe('formatPriceText', () => {
  it('delegates to formatPrice for values >= 1 (already <=1 dp)', () => {
    expect(formatPriceText(200)).toBe('P200')
    expect(formatPriceText(8.3)).toBe('P8.3')
  })
  it('caps sub-1 values at one decimal', () => {
    expect(formatPriceText(0.333)).toBe('0.3')
    expect(formatPriceText(0.667)).toBe('0.7')
  })
  it('falls back to finer rounding when one decimal would be 0', () => {
    expect(formatPriceText(0.04)).toBe('P0.04')
  })
})

describe('currencyPrice', () => {
  it('uses divine denomination when divineValue > 1', () => {
    const entry: PriceEntry = { name: 'x', category: 'currency', chaosValue: 420, divineValue: 2.1 }
    expect(currencyPrice(entry, 1)).toEqual({ text: 'P2.1', denom: 'divine' })
  })

  it('stays baseline (chaos) when divineValue is exactly 1', () => {
    const entry: PriceEntry = { name: 'x', category: 'currency', chaosValue: 200, divineValue: 1 }
    expect(currencyPrice(entry, 1)).toEqual({ text: 'P200', denom: 'chaos' })
  })

  it('uses chaos baseline in PoE1 when divineValue < 1', () => {
    const entry: PriceEntry = { name: 'x', category: 'currency', chaosValue: 40, divineValue: 0.2 }
    expect(currencyPrice(entry, 1)).toEqual({ text: 'P40', denom: 'chaos' })
  })

  it('uses exalted baseline in PoE2 when divineValue < 1', () => {
    const entry: PriceEntry = { name: 'x', category: 'currency', chaosValue: 40, divineValue: 0.2 }
    expect(currencyPrice(entry, 2)).toEqual({ text: 'P40', denom: 'exalted' })
  })

  it('falls back to baseline when divineValue is absent', () => {
    const entry: PriceEntry = { name: 'x', category: 'currency', chaosValue: 5 }
    expect(currencyPrice(entry, 1)).toEqual({ text: 'P5', denom: 'chaos' })
  })

  it('rounds sub-1 baseline values to one decimal', () => {
    expect(currencyPrice({ name: 'x', category: 'currency', chaosValue: 0.333 }, 1)).toEqual({
      text: '0.3',
      denom: 'chaos',
    })
    expect(currencyPrice({ name: 'x', category: 'currency', chaosValue: 0.667 }, 1)).toEqual({
      text: '0.7',
      denom: 'chaos',
    })
  })

  it('keeps tiny sub-0.05 values visible instead of rounding to 0', () => {
    // One decimal would read as "0.0"; fall back to formatPrice (mock: "P0.04").
    expect(currencyPrice({ name: 'x', category: 'currency', chaosValue: 0.04 }, 1)).toEqual({
      text: 'P0.04',
      denom: 'chaos',
    })
  })

  it('returns null when entry is undefined', () => {
    expect(currencyPrice(undefined, 1)).toBeNull()
  })

  it('returns null when chaosValue is 0', () => {
    const entry = { name: 'x', category: 'currency', chaosValue: 0 } as PriceEntry
    expect(currencyPrice(entry, 1)).toBeNull()
  })
})
