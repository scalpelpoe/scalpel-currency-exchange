import { ErrorBanner, Notice } from '@scalpelpoe/plugin-sdk'
import type { ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { useEffect, useRef, useState } from 'react'
import { AddPairControl } from './AddPairControl'
import { Hero } from './Hero'
import { addPair, movePair, type Pair, removePair, sanitizePairs, seedDefault, swapPair } from './pairs'
import { useCurrencyData } from './useCurrencyData'
import { WatchlistRow } from './WatchlistRow'

export function App({ ctx }: { ctx: ScalpelPluginContext }): JSX.Element {
  const data = useCurrencyData(ctx)
  const [pairs, setPairs] = useState<Pair[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const loadedRef = useRef(false)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

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
      <Hero updatedAt={data.updatedAt} now={now} refreshing={refreshing} onRefresh={() => void onRefresh()}>
        <AddPairControl names={data.names} onAdd={(p) => persist(addPair(pairs ?? [], p))} />
      </Hero>

      {data.error && <ErrorBanner message={`Could not load prices: ${data.error}`} tone="error" />}

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
            version={ctx.getPoeVersion()}
            onSwap={() => persist(swapPair(pairs ?? [], i))}
            onRemove={() => persist(removePair(pairs ?? [], i))}
            rowIndex={i}
            onDragStartRow={(from) => setDragIndex(from)}
            onDropRow={(to) => {
              if (dragIndex !== null && dragIndex !== to) persist(movePair(pairs ?? [], dragIndex, to))
              setDragIndex(null)
            }}
            onDragEndRow={() => setDragIndex(null)}
          />
        ))}
      </div>
    </div>
  )
}
