import { Refresh } from '@icon-park/react'
import { Button } from '@scalpelpoe/plugin-sdk'
import type { ReactNode } from 'react'

/** "Updated 12m ago" / "Updated just now" / "Not yet loaded". `now` is injected
 *  for deterministic tests; callers pass Date.now(). */
export function formatUpdatedAgo(updatedAt: number | null, now: number): string {
  if (updatedAt === null) return 'Not yet loaded'
  const mins = Math.floor((now - updatedAt) / 60_000)
  return mins < 1 ? 'Updated just now' : `Updated ${mins}m ago`
}

interface Props {
  updatedAt: number | null
  now: number
  refreshing: boolean
  onRefresh: () => void
  /** Add-pair controls, rendered inside the hero beneath the title row. */
  children?: ReactNode
}

/** Page hero, matching the app's other panels: a bg-card band that bleeds to the
 *  panel edges, with the title + subtitle + Refresh on top and the add-pair
 *  controls below. (Negative margins cancel App's 12px padding so it runs
 *  edge-to-edge.) */
export function Hero({ updatedAt, now, refreshing, onRefresh, children }: Props): JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '10px 12px',
        margin: '-12px -12px 10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div>
          <div className="section-title" style={{ color: 'var(--text)', fontWeight: 600 }}>
            Currency Exchange Rates
          </div>
        </div>
        <Button variant="ghost" onClick={onRefresh} disabled={refreshing}>
          {refreshing ? (
            'Refreshing...'
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
              <Refresh theme="outline" size={14} fill="currentColor" />
              {formatUpdatedAgo(updatedAt, now)}
            </span>
          )}
        </Button>
      </div>
      {children}
    </div>
  )
}
