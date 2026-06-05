import type { ReactNode } from 'react'

// Test-only mock of @scalpelpoe/plugin-sdk RUNTIME exports. The real npm package
// is a types-only stub that throws at runtime, so vitest aliases this file in.
// tsc does not use the alias, so production types still come from the real pkg.
export const TREND_THRESHOLD_PCT = 15
export const TREND_UP_COLOR = '#4a9eff'
export const TREND_DOWN_COLOR = '#ef5350'
// Recognizable marker so formatRate tests assert delegation, not real formatting.
export const formatPrice = (v: number): string => `P${v}`

export function Button({ children, onClick, disabled }: { children?: ReactNode; onClick?: () => void; disabled?: boolean; variant?: string; size?: string }) {
  return <button onClick={onClick} disabled={disabled}>{children}</button>
}
export function TextInput(props: Record<string, unknown>) {
  return <input {...props} />
}
export function Label({ children }: { children?: ReactNode }) {
  return <label>{children}</label>
}
export function ItemChip({ name }: { name: string; itemClass?: string; onClick?: () => void; title?: string }) {
  return <span>{name}</span>
}
export function RemoveButton({ onClick }: { onClick?: () => void }) {
  return <button aria-label="remove" onClick={onClick}>x</button>
}
export function Notice({ title, body }: { icon?: ReactNode; title?: ReactNode; body?: ReactNode }) {
  return <div>{title} {body}</div>
}
export function ErrorBanner({ message }: { message: string; tone?: string }) {
  return <div>{message}</div>
}
export function getItemIcon(item: { name?: string } | null): string | null {
  return item?.name ? `icon://${item.name}` : null
}
export function defaultPoeItem(overrides: Record<string, unknown>, _version?: 1 | 2): Record<string, unknown> {
  return { itemClass: 'Currency', rarity: 'Currency', name: '', baseType: '', ...overrides }
}
