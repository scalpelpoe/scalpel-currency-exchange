import { defaultPoeItem, getItemIcon } from '@scalpelpoe/plugin-sdk'

/** PoE's currency text gold. Not a Scalpel CSS var, so shared here as a constant
 *  for every currency label (cards, dropdown rows). */
export const CURRENCY_GOLD = '#FEEAAF'

/** Resolve a currency's icon URL by name via Scalpel's icon cache. Returns null
 *  before the renderer has its icon map, or for an unknown name. */
export function currencyIcon(name: string, version: 1 | 2): string | null {
  return getItemIcon(defaultPoeItem({ name, baseType: name, itemClass: 'Currency' }, version))
}
