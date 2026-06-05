import type { PriceEntry, ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildRateIndex, currencyNames } from './rates'

export interface CurrencyData {
  index: Map<string, PriceEntry>
  names: string[]
  updatedAt: number | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/** Loads currency prices from ctx.prices, reloads on host onChange, and exposes
 *  a refresh() that forces a host refetch. All ninja access is the host's; this
 *  hook never fetches. */
export function useCurrencyData(ctx: ScalpelPluginContext): CurrencyData {
  const [entries, setEntries] = useState<PriceEntry[]>([])
  const [updatedAt, setUpdatedAt] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Drop stale loads when several overlap (mount + onChange + manual refresh).
  const gen = useRef(0)
  const index = useMemo(() => buildRateIndex(entries), [entries])

  const load = useCallback(async () => {
    const my = ++gen.current
    try {
      const { prices, updatedAt: ts } = await ctx.prices.getPrices({ category: 'currency' })
      if (my !== gen.current) return
      setEntries(prices)
      setUpdatedAt(ts)
      setError(null)
    } catch (e) {
      if (my === gen.current) setError(e instanceof Error ? e.message : String(e))
    } finally {
      if (my === gen.current) setLoading(false)
    }
  }, [ctx])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      await ctx.prices.refresh()
    } catch {
      // refresh failures fall through to load(), which surfaces any error
    }
    await load()
  }, [ctx, load])

  useEffect(() => {
    void load()
    const off = ctx.prices.onChange(() => {
      void load()
    })
    return off
  }, [ctx, load])

  return { index, names: currencyNames(entries), updatedAt, loading, error, refresh }
}
