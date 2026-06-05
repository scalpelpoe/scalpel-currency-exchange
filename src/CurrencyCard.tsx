import { defaultPoeItem, getItemIcon } from '@scalpelpoe/plugin-sdk'

// PoE's currency text gold. Not a Scalpel CSS var, so kept here as a constant.
const CURRENCY_GOLD = '#FEEAAF'

interface Props {
  name: string
  version: 1 | 2
}

/** A fixed-height currency cell: icon on the left, name in the PoE font (gold),
 *  left-justified and wrapping to two lines for long names. Fills its share of
 *  the row width. Replaces the old ItemChip so we control the layout. */
export function CurrencyCard({ name, version }: Props): JSX.Element {
  const icon = getItemIcon(defaultPoeItem({ name, baseType: name, itemClass: 'Currency' }, version))
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 40,
        padding: '4px 8px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 6,
      }}
    >
      {icon && (
        <img src={icon} alt="" width={28} height={28} style={{ flex: '0 0 auto', objectFit: 'contain' }} />
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
        {name}
      </span>
    </div>
  )
}
