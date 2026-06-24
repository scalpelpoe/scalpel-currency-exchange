import { defaultPoeItem, getItemIcon } from '@scalpelpoe/plugin-sdk'

/** PoE's currency text gold. Not a Scalpel CSS var, so shared here as a constant
 *  for every currency label (cards, dropdown rows). */
export const CURRENCY_GOLD = '#FEEAAF'

export type Denomination = 'chaos' | 'exalted' | 'divine'

/** Display metadata per denomination: the orb whose icon represents it, a
 *  readable word for tooltips/alt text, and the curated short label. */
export const DENOM_META: Record<Denomination, { word: string; short: string; orb: string }> = {
  chaos: { word: 'chaos', short: 'c', orb: 'Chaos Orb' },
  exalted: { word: 'exalted', short: 'ex', orb: 'Exalted Orb' },
  divine: { word: 'divine', short: 'div', orb: 'Divine Orb' },
}

/** Resolve a currency's icon URL by name via Scalpel's icon cache. Returns null
 *  before the renderer has its icon map, or for an unknown name. */
export function currencyIcon(name: string, version: 1 | 2): string | null {
  return getItemIcon(defaultPoeItem({ name, baseType: name, itemClass: 'Currency' }, version))
}
