import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Hero, formatUpdatedAgo } from './Hero'

describe('formatUpdatedAgo', () => {
  it('formats minutes since the timestamp', () => {
    const now = 1_000_000_000_000
    expect(formatUpdatedAgo(now - 12 * 60_000, now)).toBe('Updated 12m ago')
    expect(formatUpdatedAgo(now - 30_000, now)).toBe('Updated just now')
    expect(formatUpdatedAgo(null, now)).toBe('Not yet loaded')
  })
})

describe('Hero', () => {
  it('fires onRefresh when the refresh button is clicked', () => {
    const onRefresh = vi.fn()
    render(<Hero updatedAt={null} now={0} refreshing={false} onRefresh={onRefresh} />)
    // The refresh control is now an icon button (no "Refresh" text); Hero has
    // exactly one button, so match it by role.
    fireEvent.click(screen.getByRole('button'))
    expect(onRefresh).toHaveBeenCalled()
  })
})
