import { Button } from '@scalpelpoe/plugin-sdk'

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
}

export function Hero({ updatedAt, now, refreshing, onRefresh }: Props): JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div>
        <div className="section-title" style={{ color: 'var(--text)', fontWeight: 600 }}>
          Currency Exchange
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>
          Live cross-rates from poe.ninja. {formatUpdatedAgo(updatedAt, now)}.
        </div>
      </div>
      <Button variant="ghost" onClick={onRefresh} disabled={refreshing}>
        {refreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  )
}
