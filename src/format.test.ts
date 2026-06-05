import { describe, expect, it } from 'vitest'
import { formatRate } from './format'

// The SDK is vitest-aliased to src/test/sdk-mock.tsx, whose formatPrice returns
// "P<n>". So for value>=1 we assert formatRate DELEGATES to formatPrice; the
// sub-1 and null branches are formatRate's own logic.
describe('formatRate', () => {
  it('delegates to formatPrice for values >= 1', () => {
    expect(formatRate(200)).toBe('P200')
    expect(formatRate(1)).toBe('P1')
  })
  it('keeps small sub-1 rates readable instead of rounding to 0', () => {
    expect(formatRate(0.005)).toBe('0.005')
    expect(formatRate(0.5)).toBe('0.5')
  })
  it('renders null as a dash', () => {
    expect(formatRate(null)).toBe('-')
  })
})
