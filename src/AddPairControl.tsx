import { ArrowRight } from '@icon-park/react'
import { Button } from '@scalpelpoe/plugin-sdk'
import { useState } from 'react'
import type { Pair } from './pairs'
import { SearchSelect } from './SearchSelect'

interface Props {
  names: string[]
  onAdd: (pair: Pair) => void
}

/** A boxed add-pair control: a caption above a framed row holding the From / To
 *  pickers (separated by an iconpark arrow) and the Add button. Add is disabled
 *  until both sides are chosen and distinct; the selection clears after adding. */
export function AddPairControl({ names, onAdd }: Props): JSX.Element {
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)
  const ready = from !== null && to !== null && from !== to

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 8,
        borderRadius: 6,
        border: '1px solid var(--border)',
        background: 'rgba(0, 0, 0, 0.15)',
      }}
    >
      <span style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.2, textAlign: 'left' }}>
        Add 2 Currencies to Monitor Exchange Rate
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <SearchSelect label="From" names={names} value={from} onSelect={setFrom} />
        <span style={{ flex: '0 0 auto', display: 'inline-flex', color: 'var(--text-dim)' }}>
          <ArrowRight theme="outline" size={16} fill="currentColor" />
        </span>
        <SearchSelect label="To" names={names} value={to} onSelect={setTo} />
        <Button
          variant="primary"
          onClick={() => {
            if (!ready) return
            onAdd({ from, to })
            setFrom(null)
            setTo(null)
          }}
          disabled={!ready}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
