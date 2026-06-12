import { Drag } from '@icon-park/react'
import { RemoveButton, TREND_DOWN_COLOR, TREND_UP_COLOR } from '@scalpelpoe/plugin-sdk'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { type MouseEvent, useState } from 'react'
import { CurrencyCard } from './CurrencyCard'
import { currencyIcon } from './currency-visuals'
import { formatRate } from './format'
import type { Pair } from './pairs'
import { pairTrend, rate, rateSeries } from './rates'
import { Sparkline } from './Sparkline'

interface Props {
  index: Map<string, PriceEntry>
  pair: Pair
  version: 1 | 2
  onSwap: () => void
  onRemove: () => void
  /** This row's position in the list. The drag-reorder callbacks report against
   *  it. Optional so the row renders standalone (e.g. in tests) without the
   *  list's drag wiring. */
  rowIndex?: number
  onDragStartRow?: (rowIndex: number) => void
  onDragEnterRow?: (rowIndex: number) => void
  onDragEndRow?: () => void
}

/** One watchlist row, styled as a settings-style block card (.setting-box): a
 *  drag handle, a CurrencyCard on each side, and the conversion details centered
 *  between them - a "1 : X" rate box with a swap button to its right, and the
 *  7-day % change beneath. A muted "no price data" note replaces the rate when
 *  either currency is absent. Drag-reorder is gated on the handle: mousedown on
 *  the grip arms the row as draggable; mousedown anywhere else leaves it inert. */
export function WatchlistRow({
  index,
  pair,
  version,
  onSwap,
  onRemove,
  rowIndex,
  onDragStartRow,
  onDragEnterRow,
  onDragEndRow,
}: Props): JSX.Element {
  const r = rate(index, pair.from, pair.to)
  const trend = r === null ? null : pairTrend(index, pair.from, pair.to)
  const trendColor = trend?.dir === 'up' ? TREND_UP_COLOR : trend?.dir === 'down' ? TREND_DOWN_COLOR : 'var(--text-dim)'
  const arrow = trend?.dir === 'up' ? '▲' : trend?.dir === 'down' ? '▼' : '-'
  const [armed, setArmed] = useState(false)
  const draggable = armed && rowIndex !== undefined
  // Hover the details to show the rate's 7-day sparkline, portaled at the cursor.
  const [hovered, setHovered] = useState(false)
  const [cursor, setCursor] = useState({ viewportX: 0, viewportY: 0, scale: 1 })
  const series = hovered ? rateSeries(index, pair.from, pair.to) : []
  const showChart = series.filter((v) => v != null).length >= 2
  function trackCursor(e: MouseEvent<HTMLDivElement>): void {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const scale = el.offsetWidth > 0 ? rect.width / el.offsetWidth : 1
    setCursor({ viewportX: e.clientX, viewportY: e.clientY, scale })
  }

  return (
    <div
      className="setting-box"
      style={{ gap: 8, cursor: 'default', marginBottom: 6, opacity: armed ? 0.6 : 1 }}
      draggable={draggable}
      onDragStart={(e) => {
        // Declare a move op (not copy) so the cursor is a move arrow, not the
        // red no-drop cross-out. setData keeps the drag valid across engines.
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', '')
        if (rowIndex !== undefined) onDragStartRow?.(rowIndex)
      }}
      onDragEnter={(e) => {
        // Handle the FIRST frame the cursor enters this row (or a child) so the
        // no-drop cross-out never shows, and live-reorder to this position.
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (rowIndex !== undefined) onDragEnterRow?.(rowIndex)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={(e) => {
        e.preventDefault()
      }}
      onDragEnd={() => {
        setArmed(false)
        onDragEndRow?.()
      }}
    >
      <span
        aria-label="drag to reorder"
        title="Drag to reorder"
        onMouseDown={() => setArmed(true)}
        onMouseUp={() => setArmed(false)}
        style={{
          flex: '0 0 auto',
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--text-dim)',
          cursor: 'grab',
        }}
      >
        <Drag theme="outline" size={14} fill="currentColor" />
      </span>

      <CurrencyCard name={pair.from} version={version} />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={trackCursor}
        style={{
          position: 'relative',
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minWidth: 92,
          cursor: showChart ? 'help' : undefined,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              padding: '2px 10px',
              borderRadius: 999,
              background: 'rgba(0, 0, 0, 0.35)',
              fontSize: 13,
              color: 'var(--text)',
              whiteSpace: 'nowrap',
            }}
          >
            {r === null ? 'no price data' : `1 : ${formatRate(r)}`}
          </div>
          <button
            type="button"
            onClick={onSwap}
            aria-label="swap"
            title="Swap conversion direction"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: 14,
              lineHeight: 1,
              padding: 2,
            }}
          >
            <span aria-hidden>&#x21C4;</span>
          </button>
        </div>
        {trend && (
          <span style={{ color: trendColor, fontSize: 11, whiteSpace: 'nowrap' }}>
            {arrow} {Math.abs(trend.pct).toFixed(1)}%
          </span>
        )}
        {showChart && <Sparkline graph={series} cursor={cursor} rate={r} quoteIcon={currencyIcon(pair.to, version)} />}
      </div>

      <CurrencyCard name={pair.to} version={version} />

      <div style={{ flex: '0 0 auto', alignSelf: 'center' }}>
        <RemoveButton onClick={onRemove} />
      </div>
    </div>
  )
}
