import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { PRICES } from './__fixtures__/prices'

function makeCtx(storedPairs: unknown, version: 1 | 2 = 1) {
  const store = new Map<string, unknown>()
  if (storedPairs !== undefined) store.set('pairs', storedPairs)
  return {
    getPoeVersion: () => version,
    storage: {
      get: vi.fn(async (k: string) => (store.has(k) ? store.get(k) : null)),
      set: vi.fn(async (k: string, v: unknown) => {
        store.set(k, v)
      }),
      delete: vi.fn(async () => {}),
      keys: vi.fn(async () => [...store.keys()]),
    },
    prices: {
      getPrices: vi.fn(async () => ({ prices: PRICES, updatedAt: 123 })),
      refresh: vi.fn(async () => {}),
      onChange: vi.fn(() => () => {}),
    },
    _store: store,
  } as any
}

describe('App', () => {
  it('seeds the default pair on first run and persists it', async () => {
    const ctx = makeCtx(undefined, 1)
    render(<App ctx={ctx} />)
    await waitFor(() => expect(screen.getByText(/1\s*:\s*P200/)).toBeTruthy())
    expect(ctx.storage.set).toHaveBeenCalledWith('pairs', [
      { from: 'Divine Orb', to: 'Chaos Orb' },
      { from: 'Mirror of Kalandra', to: 'Divine Orb' },
    ])
  })

  it('renders stored pairs', async () => {
    const ctx = makeCtx([{ from: 'Divine Orb', to: 'Exalted Orb' }], 1)
    render(<App ctx={ctx} />)
    await waitFor(() => expect(screen.getByText(/1\s*:\s*P25/)).toBeTruthy())
  })

  it('shows an error banner when prices fail to load', async () => {
    const ctx = makeCtx([], 1)
    ctx.prices.getPrices = vi.fn(async () => {
      throw new Error('offline')
    })
    render(<App ctx={ctx} />)
    await waitFor(() => expect(screen.getByText(/offline/i)).toBeTruthy())
  })
})
