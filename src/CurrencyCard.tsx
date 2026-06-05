import { CURRENCY_GOLD, currencyIcon } from './currency-visuals'

interface Props {
  name: string
  version: 1 | 2
  /** Shorter, single-line variant for the picker input (vs the taller, wrapping
   *  watchlist card). */
  compact?: boolean
  /** When set, an X inside the card clears the selection. */
  onRemove?: () => void
  /** Accessible label for the X (e.g. "Remove From"). */
  removeLabel?: string
}

/** A currency cell: icon on the left, name in the PoE font (gold), left-justified.
 *  No border - instead a mild blurred, saturated copy of the currency icon glows
 *  behind the content (the same icon-glow trick the app uses elsewhere). The
 *  watchlist uses the default (taller, wrapping) form; the picker input uses the
 *  compact single-line form with an X. */
export function CurrencyCard({ name, version, compact, onRemove, removeLabel = 'Remove' }: Props): JSX.Element {
  const icon = currencyIcon(name, version)
  const iconSize = compact ? 20 : 26
  const glowSize = compact ? 52 : 64
  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minHeight: compact ? 0 : 34,
        padding: compact ? '0 6px' : '4px 8px',
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
            width: glowSize,
            height: glowSize,
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
          draggable={false}
          width={iconSize}
          height={iconSize}
          style={{ position: 'relative', flex: '0 0 auto', objectFit: 'contain' }}
        />
      )}
      <span
        style={{
          position: 'relative',
          flex: onRemove ? 1 : undefined,
          minWidth: 0,
          fontFamily: 'var(--font-poe)',
          color: CURRENCY_GOLD,
          fontSize: compact ? 12 : 13,
          lineHeight: 1.15,
          textAlign: 'left',
          ...(compact
            ? { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
            : { wordBreak: 'break-word' }),
        }}
      >
        {name}
      </span>
      {onRemove && (
        <button
          type="button"
          aria-label={removeLabel}
          title="Remove"
          onClick={onRemove}
          style={{
            position: 'relative',
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 18,
            height: 18,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer',
            fontSize: 13,
            lineHeight: 1,
            padding: 0,
          }}
        >
          &#x2715;
        </button>
      )}
    </div>
  )
}
