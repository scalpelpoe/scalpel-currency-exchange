export interface Pair {
  from: string
  to: string
}

/** Sensible starter pairs per game so the watchlist is never empty on first run. */
export function seedDefault(version: 1 | 2): Pair[] {
  return version === 2
    ? [
        { from: 'Divine Orb', to: 'Exalted Orb' },
        { from: 'Divine Orb', to: 'Chaos Orb' },
        { from: 'Mirror of Kalandra', to: 'Divine Orb' },
      ]
    : [
        { from: 'Divine Orb', to: 'Chaos Orb' },
        { from: 'Mirror of Kalandra', to: 'Divine Orb' },
      ]
}

function samePair(a: Pair, b: Pair): boolean {
  return a.from === b.from && a.to === b.to
}

/** Append a pair. No-op for an exact duplicate or a self-pair. Reverse direction
 *  is intentionally allowed (the user may want both A->B and B->A rows). Returns
 *  the SAME array reference when nothing changes (lets React skip a re-render). */
export function addPair(pairs: Pair[], next: Pair): Pair[] {
  if (next.from === next.to) return pairs
  if (pairs.some((p) => samePair(p, next))) return pairs
  return [...pairs, next]
}

export function removePair(pairs: Pair[], index: number): Pair[] {
  return pairs.filter((_, i) => i !== index)
}

/** Reverse the from/to of the pair at `index` (flip conversion direction). */
export function swapPair(pairs: Pair[], index: number): Pair[] {
  return pairs.map((p, i) => (i === index ? { from: p.to, to: p.from } : p))
}

/** Move the pair at `from` to position `to`, shifting the rest. Returns the same
 *  array for a no-op or out-of-range move. */
export function movePair(pairs: Pair[], from: number, to: number): Pair[] {
  if (from === to || from < 0 || to < 0 || from >= pairs.length || to >= pairs.length) return pairs
  const next = [...pairs]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** Coerce untrusted storage data into a clean Pair[]; drop anything malformed. */
export function sanitizePairs(raw: unknown): Pair[] {
  if (!Array.isArray(raw)) return []
  const out: Pair[] = []
  for (const item of raw) {
    if (
      item &&
      typeof item === 'object' &&
      typeof (item as Pair).from === 'string' &&
      typeof (item as Pair).to === 'string'
    ) {
      out.push({ from: (item as Pair).from, to: (item as Pair).to })
    }
  }
  return out
}
