import { formatPrice } from '@scalpelpoe/plugin-sdk'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import type { Denomination } from './currency-visuals'

/** Format a cross-rate for display. Reuses Scalpel's formatPrice for >=1 values,
 *  but for sub-1 rates formatPrice rounds toward 0, which hides a real rate
 *  (e.g. 1 chaos = 0.005 divine). For those we show up to 3 significant figures
 *  instead. Null renders as a dash. */
export function formatRate(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-'
  if (value >= 1) return formatPrice(value)
  return trimZeros(value.toPrecision(3))
}

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}

/** Picker price text: Scalpel's formatPrice (k-suffix past 1000, integer from 10
 *  up) but capped at one decimal place. Values >=1 already format to <=1 dp via
 *  formatPrice; sub-1 values round to one decimal, keeping formatPrice's finer
 *  rounding only when one decimal would collapse a real price to 0 (so sub-0.05
 *  currencies stay visible rather than reading as free). */
export function formatPriceText(value: number): string {
  if (value >= 1) return formatPrice(value)
  const oneDp = value.toFixed(1)
  return Number.parseFloat(oneDp) > 0 ? oneDp : formatPrice(value)
}

export interface CurrencyPrice {
  /** Formatted number, capped at one decimal (e.g. "200", "2.1", "0.3"). */
  text: string
  denom: Denomination
}

/** The currency's current price as a single auto-picked denomination, poe.ninja
 *  style: divine when it's worth MORE than one divine, otherwise the game's
 *  baseline (exalted in PoE2, chaos in PoE1). Null when the entry is missing or
 *  has no positive value. */
export function currencyPrice(entry: PriceEntry | undefined, version: 1 | 2): CurrencyPrice | null {
  if (!entry || !(entry.chaosValue > 0)) return null
  const div = entry.divineValue
  if (div != null && Number.isFinite(div) && div > 1) {
    return { text: formatPriceText(div), denom: 'divine' }
  }
  return { text: formatPriceText(entry.chaosValue), denom: version === 2 ? 'exalted' : 'chaos' }
}
