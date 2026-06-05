import type { ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { createRoot } from 'react-dom/client'
import { App } from './App'

const TAB_ICON =
  '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="10" stroke="currentColor" stroke-width="4"/><path d="M30 8l6 4-6 4" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 40l-6-4 6-4" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'

export default function activate(ctx: ScalpelPluginContext): void {
  ctx.registerTab({
    label: 'Currency Exchange',
    icon: TAB_ICON,
    render: (container) => {
      const root = createRoot(container)
      root.render(<App ctx={ctx} />)
      return () => root.unmount()
    },
  })
}
