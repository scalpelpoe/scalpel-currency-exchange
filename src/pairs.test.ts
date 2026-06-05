import { describe, expect, it } from 'vitest'
import { addPair, type Pair, removePair, sanitizePairs, seedDefault, swapPair } from './pairs'

describe('seedDefault', () => {
  it('seeds Divine->Chaos and Mirror->Divine for PoE1', () => {
    expect(seedDefault(1)).toEqual([
      { from: 'Divine Orb', to: 'Chaos Orb' },
      { from: 'Mirror of Kalandra', to: 'Divine Orb' },
    ])
  })
  it('seeds Divine->Exalt, Divine->Chaos, Mirror->Divine for PoE2', () => {
    expect(seedDefault(2)).toEqual([
      { from: 'Divine Orb', to: 'Exalted Orb' },
      { from: 'Divine Orb', to: 'Chaos Orb' },
      { from: 'Mirror of Kalandra', to: 'Divine Orb' },
    ])
  })
})

describe('addPair', () => {
  it('appends a new pair', () => {
    const out = addPair([{ from: 'Chaos Orb', to: 'Divine Orb' }], { from: 'Exalted Orb', to: 'Divine Orb' })
    expect(out).toHaveLength(2)
  })
  it('is a no-op for an exact duplicate (same direction)', () => {
    const base: Pair[] = [{ from: 'Chaos Orb', to: 'Divine Orb' }]
    expect(addPair(base, { from: 'Chaos Orb', to: 'Divine Orb' })).toBe(base)
  })
  it('treats the reverse direction as a distinct pair', () => {
    const base: Pair[] = [{ from: 'Chaos Orb', to: 'Divine Orb' }]
    expect(addPair(base, { from: 'Divine Orb', to: 'Chaos Orb' })).toHaveLength(2)
  })
  it('rejects a pair of a currency with itself', () => {
    const base: Pair[] = [{ from: 'Chaos Orb', to: 'Divine Orb' }]
    expect(addPair(base, { from: 'Chaos Orb', to: 'Chaos Orb' })).toBe(base)
  })
})

describe('removePair', () => {
  it('removes by index', () => {
    const base: Pair[] = [
      { from: 'Chaos Orb', to: 'Divine Orb' },
      { from: 'Exalted Orb', to: 'Divine Orb' },
    ]
    expect(removePair(base, 0)).toEqual([{ from: 'Exalted Orb', to: 'Divine Orb' }])
  })
})

describe('swapPair', () => {
  it('reverses the pair at the given index, leaving others intact', () => {
    const base = [
      { from: 'Chaos Orb', to: 'Divine Orb' },
      { from: 'Exalted Orb', to: 'Divine Orb' },
    ]
    expect(swapPair(base, 0)).toEqual([
      { from: 'Divine Orb', to: 'Chaos Orb' },
      { from: 'Exalted Orb', to: 'Divine Orb' },
    ])
  })
})

describe('sanitizePairs', () => {
  it('drops malformed entries from untrusted storage', () => {
    const raw = [
      { from: 'Chaos Orb', to: 'Divine Orb' },
      { from: 'Chaos Orb' },
      null,
      { from: 1, to: 2 },
      'nope',
    ]
    expect(sanitizePairs(raw)).toEqual([{ from: 'Chaos Orb', to: 'Divine Orb' }])
  })
})
