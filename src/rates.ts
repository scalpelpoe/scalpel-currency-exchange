import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { TREND_THRESHOLD_PCT } from '@scalpelpoe/plugin-sdk'

/** Alphabetically-sorted, de-duplicated display names of every priced currency.
 *  The host can return variant rows that share a name; we collapse them to one
 *  entry (as buildRateIndex does) so the picker lists each currency once and its
 *  React keys stay unique. */
export function currencyNames(entries: PriceEntry[]): string[] {
  return [...new Set(entries.map((e) => e.name))].sort((a, b) => a.localeCompare(b))
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

/** Per-day percent-change series of the from->to rate, for a sparkline. Combines
 *  each currency's 7-day cumulative percent-change graph point by point:
 *  r[i] = ((1 + aGraph[i]/100) / (1 + bGraph[i]/100) - 1) * 100. Entries are null
 *  where either point is null or the math is non-finite. Empty when either
 *  currency lacks a graph. The last point matches pairTrend().pct. */
export function rateSeries(idx: Map<string, PriceEntry>, from: string, to: string): (number | null)[] {
  const a = idx.get(from)?.graph
  const b = idx.get(to)?.graph
  if (!a || !b) return []
  const len = Math.min(a.length, b.length)
  const out: (number | null)[] = []
  for (let i = 0; i < len; i++) {
    const av = a[i]
    const bv = b[i]
    if (av == null || bv == null) {
      out.push(null)
      continue
    }
    const pct = ((1 + av / 100) / (1 + bv / 100) - 1) * 100
    out.push(Number.isFinite(pct) ? pct : null)
  }
  return out
}

/** Project a percent-change series entry back to an absolute rate. The series
 *  holds percent change vs the window baseline; we anchor the math to today's
 *  known rate by computing baseline = rate / (1 + todayPct/100), then scaling
 *  by (1 + pointPct/100). Mirrors historicalChaos in Scalpel's SparklineOverlay;
 *  the -99 clamp keeps the divisor away from zero in pathological data. */
export function historicalRate(currentRate: number, todayPct: number | null | undefined, pointPct: number): number {
  const safeToday = Math.max(-99, todayPct ?? 0)
  const baseline = currentRate / (1 + safeToday / 100)
  return baseline * (1 + pointPct / 100)
}

function lastNumber(graph: (number | null)[] | undefined): number | null {
  if (!graph || graph.length === 0) return null
  for (let i = graph.length - 1; i >= 0; i--) {
    const v = graph[i]
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}
