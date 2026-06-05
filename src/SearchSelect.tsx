import { useEffect, useRef, useState } from 'react'
import { CurrencyCard } from './CurrencyCard'
import { CURRENCY_GOLD, currencyIcon } from './currency-visuals'

/** Picker field height; the empty input and the selected faux-input match it so
 *  the field never changes height when a currency is chosen. */
const INPUT_HEIGHT = 30

interface Props {
  label: string
  names: string[]
  value: string | null
  version: 1 | 2
  /** Called with a name on pick, or null when the chosen currency is cleared. */
  onSelect: (name: string | null) => void
}

/** Currency picker. Empty: a text input that filters a dropdown of icon + name
 *  rows (thin inset dividers between them). Selected: the chosen currency shown
 *  as its CurrencyCard (matching the watchlist below) with an X to clear it. */
export function SearchSelect({ label, names, value, version, onSelect }: Props): JSX.Element {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<number | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent): void {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  if (value !== null) {
    return (
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: INPUT_HEIGHT,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'stretch',
          // Faux input: same bg/height as the real input so its edges still show
          // around the card and the field never shifts height.
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: 4,
          padding: 3,
          overflow: 'hidden',
        }}
      >
        <CurrencyCard
          name={value}
          version={version}
          compact
          onRemove={() => onSelect(null)}
          removeLabel={`Remove ${label}`}
        />
      </div>
    )
  }

  const matches = names.filter((n) => n.toLowerCase().includes(query.toLowerCase())).slice(0, 50)

  return (
    <div ref={boxRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      <input
        placeholder={label}
        value={open ? query : ''}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        style={{
          width: '100%',
          height: INPUT_HEIGHT,
          boxSizing: 'border-box',
          // Match the app's standard inputs (settings page): bg-black/30, no border.
          background: 'rgba(0, 0, 0, 0.3)',
          color: 'var(--text)',
          border: 'none',
          borderRadius: 4,
          padding: '0 8px',
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
            // ~4 rows (30px each + dividers); the rest scrolls.
            maxHeight: 124,
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 0,
            marginTop: 2,
          }}
        >
          {matches.map((n, i) => {
            const icon = currencyIcon(n, version)
            return (
              <div key={n}>
                <button
                  type="button"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                  onClick={() => {
                    onSelect(n)
                    setQuery('')
                    setOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    minHeight: 30,
                    padding: '4px 8px',
                    background: hovered === i ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    border: 'none',
                    // Override Scalpel's global button radius so the hover fill is square.
                    borderRadius: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {icon && (
                    <img
                      src={icon}
                      alt=""
                      draggable={false}
                      width={20}
                      height={20}
                      style={{ flex: '0 0 auto', objectFit: 'contain' }}
                    />
                  )}
                  <span
                    style={{
                      fontFamily: 'var(--font-poe)',
                      color: CURRENCY_GOLD,
                      fontSize: 13,
                      lineHeight: 1.15,
                      textAlign: 'left',
                      wordBreak: 'break-word',
                    }}
                  >
                    {n}
                  </span>
                </button>
                {i < matches.length - 1 && <div style={{ height: 1, background: 'var(--border)', margin: '0 8px' }} />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
