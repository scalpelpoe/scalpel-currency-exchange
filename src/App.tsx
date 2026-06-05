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
  // Latest pairs, so the dragend handler can persist the final order (which the
  // live reorders have written to state during the drag).
  const pairsRef = useRef<Pair[] | null>(pairs)
  pairsRef.current = pairs
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
        <AddPairControl
          names={data.names}
          version={ctx.getPoeVersion()}
          onAdd={(p) => persist(addPair(pairs ?? [], p))}
        />
      </Hero>

      {data.error && <ErrorBanner message={`Could not load prices: ${data.error}`} tone="error" />}

      {pairs && pairs.length === 0 && (
        <Notice
          icon={null}
          title="No pairs yet"
          body="Pick two currencies above and press Add to start your watchlist."
        />
      )}

      <div
        onDragOver={(e) => {
          // Keep the gaps between rows droppable so the cursor stays a move
          // arrow instead of flickering to the red no-drop cross-out.
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        }}
      >
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
            onDragEnterRow={(to) => {
              if (dragIndex !== null && dragIndex !== to) {
                setPairs((prev) => (prev ? movePair(prev, dragIndex, to) : prev))
                setDragIndex(to)
              }
            }}
            onDragEndRow={() => {
              setDragIndex(null)
              if (pairsRef.current) void ctx.storage.set('pairs', pairsRef.current)
            }}
          />
        ))}
      </div>
    </div>
  )
}
