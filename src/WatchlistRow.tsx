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

/** One watchlist row, styled as a settings-style block card (.setting-box): a
 *  CurrencyCard on each side with the conversion details centered between them -
 *  a "1 : X" rate box with a swap button to its right, and the 7-day % change
 *  beneath. A muted "no price data" note replaces the rate when either currency
 *  is absent from the snapshot. */
export function WatchlistRow({ index, pair, version, onSwap, onRemove }: Props): JSX.Element {
  const r = rate(index, pair.from, pair.to)
  const trend = r === null ? null : pairTrend(index, pair.from, pair.to)
  const trendColor = trend?.dir === 'up' ? TREND_UP_COLOR : trend?.dir === 'down' ? TREND_DOWN_COLOR : 'var(--text-dim)'
  const arrow = trend?.dir === 'up' ? '▲' : trend?.dir === 'down' ? '▼' : '-'

  return (
    <div className="setting-box" style={{ gap: 8, cursor: 'default', marginBottom: 6 }}>
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
