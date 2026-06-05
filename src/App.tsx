import { ErrorBanner, Notice } from '@scalpelpoe/plugin-sdk'
import type { ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { AddPairControl } from './AddPairControl'
import { Hero } from './Hero'
import { addPair, type Pair, removePair, sanitizePairs, seedDefault } from './pairs'
import { useCurrencyData } from './useCurrencyData'
import { WatchlistRow } from './WatchlistRow'

export function App({ ctx }: { ctx: ScalpelPluginContext }): JSX.Element {
  const data = useCurrencyData(ctx)
  const [pairs, setPairs] = useState<Pair[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const loadedRef = useRef(false)

  // Load the watchlist once: stored pairs, or a seeded default on first run.
  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    void (async () => {
      const raw = await ctx.storage.get('pairs')
      const stored = sanitizePairs(raw)
      if (stored.length > 0 || Array.isArray(raw)) {
        setPairs(stored)
      } else {
        const seeded = seedDefault(ctx.getPoeVersion())
        setPairs(seeded)
        await ctx.storage.set('pairs', seeded)
      }
    })()
  }, [ctx])

  function persist(next: Pair[]): void {
    setPairs(next)
    void ctx.storage.set('pairs', next)
  }

  async function onRefresh(): Promise<void> {
    setRefreshing(true)
    try {
      await data.refresh()
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div style={{ padding: 12, color: 'var(--text)' }}>
      <Hero updatedAt={data.updatedAt} now={Date.now()} refreshing={refreshing} onRefresh={() => void onRefresh()} />

      {data.error && <ErrorBanner message={`Could not load prices: ${data.error}`} tone="error" />}

      <div style={{ margin: '10px 0' }}>
        <AddPairControl names={data.names} onAdd={(p) => persist(addPair(pairs ?? [], p))} />
      </div>

      {pairs && pairs.length === 0 && (
        <Notice
          icon={null}
          title="No pairs yet"
          body="Pick two currencies above and press Add to start your watchlist."
        />
      )}

      <div>
        {(pairs ?? []).map((pair, i) => (
          <WatchlistRow
            key={`${pair.from}->${pair.to}`}
            index={data.index}
            pair={pair}
            onRemove={() => persist(removePair(pairs ?? [], i))}
          />
        ))}
      </div>
    </div>
  )
}
