import { ItemChip, RemoveButton, TREND_DOWN_COLOR, TREND_UP_COLOR } from '@scalpelpoe/plugin-sdk'
import type { PriceEntry } from '@scalpelpoe/plugin-sdk'
import { formatRate } from './format'
import type { Pair } from './pairs'
import { pairTrend, rate } from './rates'

interface Props {
  index: Map<string, PriceEntry>
  pair: Pair
  onRemove: () => void
}

/** One watchlist row: From/To icons, both directions of the unit rate, a 7-day
 *  trend chip, and a remove button. Renders a muted note if either currency is
 *  absent from the current snapshot (e.g. unpriced this league). */
export function WatchlistRow({ index, pair, onRemove }: Props): JSX.Element {
  const fwd = rate(index, pair.from, pair.to)
  const rev = rate(index, pair.to, pair.from)
  const missing = fwd === null || rev === null
  const trend = missing ? null : pairTrend(index, pair.from, pair.to)
  const trendColor = trend?.dir === 'up' ? TREND_UP_COLOR : trend?.dir === 'down' ? TREND_DOWN_COLOR : 'var(--text-dim)'
  const arrow = trend?.dir === 'up' ? '▲' : trend?.dir === 'down' ? '▼' : '–'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 4px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <ItemChip name={pair.from} />
        <span style={{ color: 'var(--text-dim)' }}>-&gt;</span>
        <ItemChip name={pair.to} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {missing ? (
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>no price data</span>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 12, color: 'var(--text)' }}>
            <span>{`1 ${pair.from} = ${formatRate(fwd)} ${pair.to}`}</span>
            <span style={{ color: 'var(--text-dim)' }}>{`1 ${pair.to} = ${formatRate(rev)} ${pair.from}`}</span>
          </div>
        )}
      </div>

      {!missing && trend && (
        <span style={{ color: trendColor, fontSize: 12, whiteSpace: 'nowrap' }}>
          {arrow} {Math.abs(trend.pct).toFixed(1)}%
        </span>
      )}

      <RemoveButton onClick={onRemove} />
    </div>
  )
}
