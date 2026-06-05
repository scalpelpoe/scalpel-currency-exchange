import { describe, expect, it } from 'vitest'
import { addPair, type Pair, removePair, sanitizePairs, seedDefault } from './pairs'

describe('seedDefault', () => {
  it('seeds Chaos<->Divine for PoE1 and Exalt<->Divine for PoE2', () => {
    expect(seedDefault(1)).toEqual([{ from: 'Chaos Orb', to: 'Divine Orb' }])
    expect(seedDefault(2)).toEqual([{ from: 'Exalted Orb', to: 'Divine Orb' }])
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
