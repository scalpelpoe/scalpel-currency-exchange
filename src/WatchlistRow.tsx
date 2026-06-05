import { RemoveButton, TREND_DOWN_COLOR, TREND_UP_COLOR } from '@scalpelpoe/plugin-sdk'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
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
}

/** One watchlist row: a CurrencyCard on each side with the conversion details
 *  centered between them (a "1 : X" rate box, a swap button that flips the
 *  direction in place, and the 7-day % change). A muted "no price data" note
 *  replaces the rate when either currency is absent from the snapshot. */
export function WatchlistRow({ index, pair, version, onSwap, onRemove }: Props): JSX.Element {
  const r = rate(index, pair.from, pair.to)
  const trend = r === null ? null : pairTrend(index, pair.from, pair.to)
  const trendColor = trend?.dir === 'up' ? TREND_UP_COLOR : trend?.dir === 'down' ? TREND_DOWN_COLOR : 'var(--text-dim)'
  const arrow = trend?.dir === 'up' ? '▲' : trend?.dir === 'down' ? '▼' : '-'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 8,
        padding: '6px 4px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <CurrencyCard name={pair.from} version={version} />

      <div
        style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          minWidth: 88,
        }}
      >
        <div
          style={{
            padding: '2px 10px',
            borderRadius: 999,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
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
            gap: 4,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: 11,
            padding: 0,
          }}
        >
          <span aria-hidden>&#x21C4;</span> swap
        </button>
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
