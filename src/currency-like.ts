import type { PriceEntry } from '@scalpelpoe/plugin-sdk'

/** Ninja-derived category slugs that are NOT currency-like: uniques (any
 *  `unique*` slug), gems, divination cards, base types, maps, and enchants.
 *  Everything else the host prices — fragments, scarabs, essences, fossils,
 *  resonators, oils, catalysts, delirium orbs, vials, omens, tattoos, … — is
 *  treated as currency-like and offered in the pickers. Slugs are normalized
 *  (lowercased, non-alphanumerics stripped) so this matches whether the host
 *  emits kebab-case ('divination-card') or PascalCase ('DivinationCard'). */
const EXCLUDED = new Set([
  'skillgem',
  'clusterjewel',
  'divinationcard',
  'basetype',
  'map',
  'blightedmap',
  'blightravagedmap',
  'helmetenchant',
  'beast',
])

function normalize(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/** Whether a price entry's category slug counts as a currency-like item the
 *  pickers should list. Exclusion-based so new currency-ish categories are
 *  included by default; only the known non-currency families are dropped. */
export function isCurrencyLike(category: string): boolean {
  const c = normalize(category)
  if (c.startsWith('unique')) return false
  return !EXCLUDED.has(c)
}

/** Narrow a full price snapshot to the currency-like rows. */
export function currencyLikeEntries(entries: PriceEntry[]): PriceEntry[] {
  return entries.filter((e) => isCurrencyLike(e.category))
}
