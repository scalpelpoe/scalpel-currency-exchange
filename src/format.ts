import { formatPrice } from '@scalpelpoe/plugin-sdk'

/** Format a cross-rate for display. Reuses Scalpel's formatPrice for >=1 values,
 *  but for sub-1 rates formatPrice rounds toward 0, which hides a real rate
 *  (e.g. 1 chaos = 0.005 divine). For those we show up to 3 significant decimals
 *  instead. Null renders as a dash. */
export function formatRate(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '-'
  if (value >= 1) return formatPrice(value)
  return trimZeros(value.toPrecision(3))
}

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s
}
