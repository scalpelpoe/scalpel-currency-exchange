import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { TREND_THRESHOLD_PCT } from '@scalpelpoe/plugin-sdk'

/** Alphabetically-sorted display names of every priced currency. */
export function currencyNames(entries: PriceEntry[]): string[] {
  return entries.map((e) => e.name).sort((a, b) => a.localeCompare(b))
}

/** Index entries by display name for O(1) rate lookups. */
export function buildRateIndex(entries: PriceEntry[]): Map<string, PriceEntry> {
  const idx = new Map<string, PriceEntry>()
  for (const e of entries) idx.set(e.name, e)
  return idx
}

/** Units of `to` you get for 1 `from`. Null if either currency is missing or
 *  non-positive. rate = from.chaosValue / to.chaosValue. */
export function rate(idx: Map<string, PriceEntry>, from: string, to: string): number | null {
  const a = idx.get(from)
  const b = idx.get(to)
  if (!a || !b || a.chaosValue <= 0 || b.chaosValue <= 0) return null
  return a.chaosValue / b.chaosValue
}

export interface PairTrend {
  dir: 'up' | 'down' | 'flat'
  /** Net percent change of the from->to rate over the 7-day window. */
  pct: number
}

/** Trend of the from->to rate, derived from each currency's 7-day cumulative
 *  percent-change sparkline. graph[last] is today vs the window baseline, so the
 *  rate's net change is ((1 + aLast/100) / (1 + bLast/100) - 1) * 100. Flat when
 *  either graph is absent/empty. Direction uses the SDK's shared threshold. */
export function pairTrend(idx: Map<string, PriceEntry>, from: string, to: string): PairTrend {
  const a = idx.get(from)?.graph
  const b = idx.get(to)?.graph
  const aLast = lastNumber(a)
  const bLast = lastNumber(b)
  if (aLast === null || bLast === null) return { dir: 'flat', pct: 0 }
  const pct = ((1 + aLast / 100) / (1 + bLast / 100) - 1) * 100
  if (!Number.isFinite(pct)) return { dir: 'flat', pct: 0 }
  const dir = pct > TREND_THRESHOLD_PCT ? 'up' : pct < -TREND_THRESHOLD_PCT ? 'down' : 'flat'
  return { dir, pct }
}

function lastNumber(graph: (number | null)[] | undefined): number | null {
  if (!graph || graph.length === 0) return null
  for (let i = graph.length - 1; i >= 0; i--) {
    const v = graph[i]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}
