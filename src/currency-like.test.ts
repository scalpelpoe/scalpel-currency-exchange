import { describe, expect, it } from 'vitest'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { currencyLikeEntries, isCurrencyLike } from './currency-like'

describe('isCurrencyLike', () => {
  it('keeps currency and the misc currency-ish categories', () => {
    for (const c of [
      'currency',
      'fragment',
      'scarab',
      'essence',
      'fossil',
      'resonator',
      'oil',
      'breach-catalyst',
      'delirium-orb',
      'vial',
      'omen',
      'tattoo',
    ]) {
      expect(isCurrencyLike(c)).toBe(true)
    }
  })

  it('drops uniques, gems, divination cards, base types, maps, and enchants', () => {
    for (const c of [
      'unique-weapon',
      'unique-armour',
      'unique-accessory',
      'unique-flask',
      'unique-jewel',
      'unique-map',
      'skill-gem',
      'cluster-jewel',
      'divination-card',
      'base-type',
      'map',
      'blighted-map',
      'helmet-enchant',
      'beast',
    ]) {
      expect(isCurrencyLike(c)).toBe(false)
    }
  })

  it('normalizes slug format so PascalCase and kebab-case match the same rule', () => {
    expect(isCurrencyLike('DivinationCard')).toBe(false)
    expect(isCurrencyLike('UniqueWeapon')).toBe(false)
    expect(isCurrencyLike('DeliriumOrb')).toBe(true)
  })
})

describe('currencyLikeEntries', () => {
  it('filters a mixed snapshot down to the currency-like rows', () => {
    const entries = [
      { name: 'Divine Orb', category: 'currency', chaosValue: 200 },
      { name: 'Sacred Orb', category: 'fragment', chaosValue: 5 },
      { name: 'Ambush Scarab', category: 'scarab', chaosValue: 3 },
      { name: 'Mageblood', category: 'unique-accessory', chaosValue: 100000 },
      { name: 'The Doctor', category: 'divination-card', chaosValue: 50000 },
      { name: 'Awakened Multistrike', category: 'skill-gem', chaosValue: 800 },
    ] as PriceEntry[]
    expect(currencyLikeEntries(entries).map((e) => e.name)).toEqual([
      'Divine Orb',
      'Sacred Orb',
      'Ambush Scarab',
    ])
  })
})
