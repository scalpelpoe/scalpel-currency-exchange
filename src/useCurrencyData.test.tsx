import { act, render, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PRICES } from './__fixtures__/prices'
import { useCurrencyData } from './useCurrencyData'

function makeCtx(overrides: Record<string, unknown> = {}) {
  return {
    getPoeVersion: () => 1 as const,
    prices: {
      getPrices: vi.fn(async () => ({ prices: PRICES, updatedAt: 123 })),
      refresh: vi.fn(async () => {}),
      onChange: vi.fn(() => () => {}),
    },
    ...overrides,
  } as unknown as import('@scalpelpoe/plugin-sdk').ScalpelPluginContext
}

function Probe({ ctx, sink }: { ctx: any; sink: (v: ReturnType<typeof useCurrencyData>) => void }) {
  sink(useCurrencyData(ctx))
  return null
}

describe('useCurrencyData', () => {
  it('loads currency prices on mount and exposes names + updatedAt', async () => {
    const ctx = makeCtx()
    let latest: ReturnType<typeof useCurrencyData> | undefined
    render(<Probe ctx={ctx} sink={(v) => (latest = v)} />)
    await waitFor(() => expect(latest?.loading).toBe(false))
    expect(ctx.prices.getPrices).toHaveBeenCalledWith()
    expect(latest?.names).toContain('Divine Orb')
    expect(latest?.updatedAt).toBe(123)
    expect(latest?.index.get('Divine Orb')?.chaosValue).toBe(200)
  })

  it('narrows the full snapshot to currency-like items', async () => {
    const ctx = makeCtx({
      prices: {
        getPrices: vi.fn(async () => ({
          prices: [
            { name: 'Divine Orb', category: 'currency', chaosValue: 200 },
            { name: 'Ambush Scarab', category: 'scarab', chaosValue: 3 },
            { name: 'Mageblood', category: 'unique-accessory', chaosValue: 100000 },
          ],
          updatedAt: 1,
        })),
        refresh: vi.fn(async () => {}),
        onChange: vi.fn(() => () => {}),
      },
    })
    let latest: ReturnType<typeof useCurrencyData> | undefined
    render(<Probe ctx={ctx} sink={(v) => (latest = v)} />)
    await waitFor(() => expect(latest?.loading).toBe(false))
    expect(latest?.names).toEqual(['Ambush Scarab', 'Divine Orb'])
    expect(latest?.index.get('Mageblood')).toBeUndefined()
  })

  it('refresh() calls ctx.prices.refresh then reloads', async () => {
    const ctx = makeCtx()
    let latest: ReturnType<typeof useCurrencyData> | undefined
    render(<Probe ctx={ctx} sink={(v) => (latest = v)} />)
    await waitFor(() => expect(latest?.loading).toBe(false))
    await act(async () => {
      await latest?.refresh()
    })
    expect(ctx.prices.refresh).toHaveBeenCalled()
    expect((ctx.prices.getPrices as any).mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('surfaces an error when getPrices rejects', async () => {
    const ctx = makeCtx({
      prices: {
        getPrices: vi.fn(async () => {
          throw new Error('boom')
        }),
        refresh: vi.fn(async () => {}),
        onChange: vi.fn(() => () => {}),
      },
    })
    let latest: ReturnType<typeof useCurrencyData> | undefined
    render(<Probe ctx={ctx} sink={(v) => (latest = v)} />)
    await waitFor(() => expect(latest?.error).toBe('boom'))
  })
})
