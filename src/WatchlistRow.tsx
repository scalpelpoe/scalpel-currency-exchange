import { Drag } from '@icon-park/react'
import { RemoveButton, TREND_DOWN_COLOR, TREND_UP_COLOR } from '@scalpelpoe/plugin-sdk'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { useState } from 'react'
import { CurrencyCard } from './CurrencyCard'
import { formatRate } from './format'
import type { Pair } from './pairs'
import { pairTrend, rate } from './rates'

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
  onDropRow?: (rowIndex: number) => void
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
  onDropRow,
  onDragEndRow,
}: Props): JSX.Element {
  const r = rate(index, pair.from, pair.to)
  const trend = r === null ? null : pairTrend(index, pair.from, pair.to)
  const trendColor = trend?.dir === 'up' ? TREND_UP_COLOR : trend?.dir === 'down' ? TREND_DOWN_COLOR : 'var(--text-dim)'
  const arrow = trend?.dir === 'up' ? '▲' : trend?.dir === 'down' ? '▼' : '-'
  const [armed, setArmed] = useState(false)
  const draggable = armed && rowIndex !== undefined

  return (
    <div
      className="setting-box"
      style={{ gap: 8, cursor: 'default', marginBottom: 6, opacity: armed ? 0.6 : 1 }}
      draggable={draggable}
      onDragStart={() => {
        if (rowIndex !== undefined) onDragStartRow?.(rowIndex)
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        if (rowIndex !== undefined) onDropRow?.(rowIndex)
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
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minWidth: 92,
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
      </div>

      <CurrencyCard name={pair.to} version={version} />

      <div style={{ flex: '0 0 auto', alignSelf: 'center' }}>
        <RemoveButton onClick={onRemove} />
      </div>
    </div>
  )
}
