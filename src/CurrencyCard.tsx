import { defaultPoeItem, getItemIcon } from '@scalpelpoe/plugin-sdk'

// PoE's currency text gold. Not a Scalpel CSS var, so kept here as a constant.
const CURRENCY_GOLD = '#FEEAAF'

interface Props {
  name: string
  version: 1 | 2
}

/** A currency cell: icon on the left, name in the PoE font (gold), left-justified
 *  and wrapping for long names. No border - instead a mild blurred, saturated
 *  copy of the currency icon glows behind the content (the same icon-glow trick
 *  the app uses elsewhere), giving each card a soft currency-colored wash. */
export function CurrencyCard({ name, version }: Props): JSX.Element {
  const icon = getItemIcon(defaultPoeItem({ name, baseType: name, itemClass: 'Currency' }, version))
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 34,
        padding: '4px 8px',
        borderRadius: 6,
        overflow: 'hidden',
        background: 'rgba(255, 255, 255, 0.04)',
      }}
    >
      {icon && (
        <img
          src={icon}
          alt=""
          aria-hidden
          draggable={false}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 64,
            height: 64,
            transform: 'translate(-50%, -50%)',
            objectFit: 'contain',
            filter: 'blur(16px) saturate(1.8)',
            opacity: 0.18,
            pointerEvents: 'none',
          }}
        />
      )}
      {icon && (
        <img
          src={icon}
          alt=""
          width={26}
          height={26}
          style={{ position: 'relative', flex: '0 0 auto', objectFit: 'contain' }}
        />
      )}
      <span
        style={{
          position: 'relative',
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
