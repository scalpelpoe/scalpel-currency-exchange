import { ItemChip } from '@scalpelpoe/plugin-sdk'
import { useEffect, useRef, useState } from 'react'

interface Props {
  label: string
  names: string[]
  value: string | null
  onSelect: (name: string) => void
}

/** Type-to-filter currency combobox. The input shows the query (or the selected
 *  value); the dropdown lists matching currencies with their icon. */
export function SearchSelect({ label, names, value, onSelect }: Props): JSX.Element {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent): void {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const text = open ? query : (value ?? '')
  const matches = names.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 50)

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        placeholder={label}
        value={text}
        onFocus={() => {
          setOpen(true)
          setQuery('')
        }}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          // Match the app's standard inputs (settings page): bg-black/30, no border.
          background: 'rgba(0, 0, 0, 0.3)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: 4,
          padding: '6px 8px',
          fontSize: 12,
        }}
      />
      {open && matches.length > 0 && (
        <div
          style={{
            position: 'absolute',
            zIndex: 10,
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            marginTop: 2,
          }}
        >
          {matches.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                onSelect(n)
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                width: '100%',
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <ItemChip name={n} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
