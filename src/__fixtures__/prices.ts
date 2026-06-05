import type { PriceEntry } from '@scalpelpoe/plugin-sdk'

// Small currency-only snapshot. chaosValue is baseline-equivalent (chaos in PoE1).
export const PRICES: PriceEntry[] = [
  { name: 'Chaos Orb', category: 'currency', chaosValue: 1, divineValue: 1 / 200, graph: [0, 0, 0, 0, 0, 0, 0] },
  { name: 'Divine Orb', category: 'currency', chaosValue: 200, divineValue: 1, graph: [0, 1, 2, 3, 4, 5, 10] },
  { name: 'Exalted Orb', category: 'currency', chaosValue: 8, divineValue: 8 / 200, graph: [0, -1, -2, -3, -4, -5, -10] },
  { name: 'Orb of Annulment', category: 'currency', chaosValue: 40, divineValue: 0.2 },
]
