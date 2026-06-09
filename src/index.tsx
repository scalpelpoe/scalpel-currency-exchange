import { Exchange } from '@icon-park/react'
import type { ScalpelPluginContext } from '@scalpelpoe/plugin-sdk'
import { createRoot } from 'react-dom/client'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from './App'

// Rendered from iconpark (two-tone) so the tab icon matches the size and weight
// of Scalpel's built-in tabs. The host clamps it to 16x16.
const TAB_ICON = renderToStaticMarkup(<Exchange theme="two-tone" fill={['currentColor', 'rgba(255, 255, 255, 0.2)']} />)

export default function activate(ctx: ScalpelPluginContext): void {
  ctx.registerTab({
    label: 'Currency Exchange Rates',
    icon: TAB_ICON,
    render: (container) => {
      const root = createRoot(container)
      root.render(<App ctx={ctx} />)
      return () => root.unmount()
    },
  })

  // Expose a hotkey slot in Scalpel's app-macro settings. The user binds the
  // key themselves; pressing it switches the overlay to our tab.
  ctx.registerHotkey({ label: 'Open Currency Exchange Rates' }, () => {
    ctx.openTab()
  })
}
