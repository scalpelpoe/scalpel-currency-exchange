import { Button } from '@scalpelpoe/plugin-sdk'
import { useState } from 'react'
import type { Pair } from './pairs'
import { SearchSelect } from './SearchSelect'

interface Props {
  names: string[]
  onAdd: (pair: Pair) => void
}

/** Two currency pickers (From / To) plus an Add button. The button is disabled
 *  until both sides are chosen and distinct. Clears the selection after adding. */
export function AddPairControl({ names, onAdd }: Props): JSX.Element {
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)
  const ready = from !== null && to !== null && from !== to

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <SearchSelect label="From" names={names} value={from} onSelect={setFrom} />
      <span style={{ color: 'var(--text-dim)' }}>-&gt;</span>
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
  )
}
