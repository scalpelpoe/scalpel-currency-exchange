import type { ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'

export function App({ ctx }: { ctx: ScalpelPluginContext }): JSX.Element {
  void ctx
  return <div style={{ padding: 12, color: 'var(--text)' }}>Currency Exchange</div>
}
