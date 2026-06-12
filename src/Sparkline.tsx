import { getTrendDirection, TREND_DOWN_COLOR, TREND_UP_COLOR } from '@scalpelpoe/plugin-sdk'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatRate } from './format'
import { historicalRate } from './rates'

// Vendored + trimmed from Scalpel's SparklineOverlay: the 7-day % header, the
// line, the area fill, the peak/valley dots, and the peak/valley rate chips
// (mirroring MiniPriceChip, with the rate reconstructed from the % series via
// historicalRate), drawn into a small card portaled at the cursor. Trend
// direction + colors come from the SDK.

interface Props {
  /** 7-day percent-change series of the pair's rate (see rateSeries). */
  graph: (number | null)[]
  cursor: { viewportX: number; viewportY: number; scale: number }
  /** Current from->to rate. When provided, peak and valley render small chips
   *  with the reconstructed historical rate on that day. */
  rate?: number | null
  /** Icon URL of the quote (to) currency, shown inside the rate chips. */
  quoteIcon?: string | null
}

const CLAMP = 200
const VIEW_W = 120
const VIEW_H = 40
const LEFT_INSET = 0
const RIGHT_INSET = 2
const TOP_INSET = 7
const BOTTOM_INSET = 4
// Approximate chip half-width used to clamp horizontal position so a chip at
// the edge of the data range stays inside the VIEW_W-wide card. 22px covers a
// 4-character rate + the 8px currency icon + the chip's padding.
const CHIP_HALF_W = 22

interface YAxis {
  yMin: number
  yMax: number
  yRange: number
  step: number
}

function computeYAxis(graph: (number | null)[]): YAxis | null {
  const nonNull = graph.filter((v): v is number => v != null)
  if (nonNull.length === 0) return null
  const yMin = Math.max(Math.min(...nonNull), -CLAMP)
  const yMax = Math.min(Math.max(...nonNull), CLAMP)
  const yRange = yMax - yMin || 1
  const step = (VIEW_W - LEFT_INSET - RIGHT_INSET) / Math.max(graph.length - 1, 1)
  return { yMin, yMax, yRange, step }
}

function projectY(value: number, axis: YAxis): number {
  const clamped = Math.max(-CLAMP, Math.min(CLAMP, value))
  return VIEW_H - BOTTOM_INSET - ((clamped - axis.yMin) / axis.yRange) * (VIEW_H - TOP_INSET - BOTTOM_INSET)
}

function toSegments(graph: (number | null)[], axis: YAxis): Array<Array<{ x: number; y: number }>> {
  const segments: Array<Array<{ x: number; y: number }>> = []
  let current: Array<{ x: number; y: number }> = []
  for (let i = 0; i < graph.length; i++) {
    const v = graph[i]
    if (v == null) {
      if (current.length > 0) {
        segments.push(current)
        current = []
      }
      continue
    }
    current.push({ x: LEFT_INSET + i * axis.step, y: projectY(v, axis) })
  }
  if (current.length > 0) segments.push(current)
  return segments
}

interface ExtremaPoint {
  x: number
  y: number
  value: number
}

function findExtrema(graph: (number | null)[], axis: YAxis): { peak: ExtremaPoint | null; valley: ExtremaPoint | null } {
  let peakIdx = -1
  let valleyIdx = -1
  let peakVal = -Infinity
  let valleyVal = Infinity
  for (let i = 0; i < graph.length; i++) {
    const v = graph[i]
    if (v == null) continue
    if (v > peakVal) {
      peakVal = v
      peakIdx = i
    }
    if (v < valleyVal) {
      valleyVal = v
      valleyIdx = i
    }
  }
  if (peakIdx < 0) return { peak: null, valley: null }
  const peak = { x: LEFT_INSET + peakIdx * axis.step, y: projectY(peakVal, axis), value: peakVal }
  if (peakVal === valleyVal) return { peak, valley: null }
  return { peak, valley: { x: LEFT_INSET + valleyIdx * axis.step, y: projectY(valleyVal, axis), value: valleyVal } }
}

function formatPct(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

/** Mini chip used at the peak / valley markers when the current rate is known.
 *  Mirrors Scalpel's MiniPriceChip: 9px bold text in a 75%-opaque pill, with
 *  the quote currency's 8px icon when available. */
function MiniRateChip({ value, quoteIcon }: { value: number; quoteIcon?: string | null }): JSX.Element {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: '1px 4px',
        borderRadius: 999,
        background: 'rgba(0, 0, 0, 0.75)',
        fontSize: 9,
        fontWeight: 700,
        color: '#fff',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      <span>{formatRate(value)}</span>
      {quoteIcon && <img src={quoteIcon} alt="" aria-hidden draggable={false} style={{ width: 8, height: 8, objectFit: 'contain' }} />}
    </div>
  )
}

/** Sparkline card portaled to document.body at the cursor (escapes any clipping
 *  ancestor), matching the parent UI scale. Mount it only while hovering. */
export function Sparkline({ graph, cursor, rate, quoteIcon }: Props): JSX.Element {
  const direction = getTrendDirection(graph)
  const strokeColor = direction === 'up' ? TREND_UP_COLOR : direction === 'down' ? TREND_DOWN_COLOR : '#888'
  const totalChange = graph[graph.length - 1]
  const totalLabel = totalChange == null ? '0.0%' : formatPct(totalChange)

  const axis = computeYAxis(graph)
  const segments = axis ? toSegments(graph, axis) : []
  const { peak, valley } = axis ? findExtrema(graph, axis) : { peak: null, valley: null }

  // Reconstruct the historical rate at each extremum by anchoring the % series
  // to today's known rate (graph[last] is today vs the window baseline).
  const todayPct = totalChange ?? null
  const peakRate = rate != null && peak ? historicalRate(rate, todayPct, peak.value) : null
  const valleyRate = rate != null && valley ? historicalRate(rate, todayPct, valley.value) : null

  const [animating, setAnimating] = useState(false)
  useEffect(() => {
    setAnimating(true)
  }, [])

  const gradientId = `cx-spark-${useId().replace(/:/g, '')}`

  const fadeStyle = animating
    ? { opacity: 1, animation: 'cx-spark-label 200ms ease-out 700ms backwards' as const }
    : { opacity: 0 }
  const clampChipLeft = (x: number): number => Math.max(CHIP_HALF_W, Math.min(x, VIEW_W - CHIP_HALF_W))

  const overlay = (
    <div
      style={{
        position: 'fixed',
        top: cursor.viewportY,
        left: cursor.viewportX,
        transform: `translate(-50%, 0) scale(${cursor.scale})`,
        transformOrigin: 'top center',
        marginTop: 12,
        pointerEvents: 'none',
        zIndex: 100,
        width: VIEW_W,
        background: 'var(--bg-card, #1a1a1a)',
        border: '1px solid var(--border, #333)',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.8), inset 0 18px 18px -16px rgba(0, 0, 0, 0.6)',
        padding: '2px 0 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 8px', fontSize: 10 }}>
        <span style={{ color: 'var(--text-dim, #888)', fontWeight: 600 }}>7-day trend</span>
        <span style={{ fontWeight: 700, color: strokeColor }}>{totalLabel}</span>
      </div>
      <div style={{ position: 'relative', width: VIEW_W, paddingTop: 14, paddingBottom: 14 }}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width={VIEW_W} height={VIEW_H} style={{ overflow: 'visible', display: 'block' }}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          {segments.map((seg, si) => {
            if (seg.length < 2) return null
            const points = [`${seg[0].x},${VIEW_H}`, ...seg.map((p) => `${p.x},${p.y}`), `${seg[seg.length - 1].x},${VIEW_H}`].join(' ')
            return (
              <polygon
                key={`fill-${si}`}
                points={points}
                fill={`url(#${gradientId})`}
                style={animating ? { opacity: 1, animation: 'cx-spark-fill 600ms ease-out forwards' } : { opacity: 0 }}
              />
            )
          })}
          {segments.map((seg, si) => (
            <polyline
              key={si}
              points={seg.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={strokeColor}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
              style={animating ? { animation: 'cx-spark-draw 600ms ease-out forwards' } : undefined}
            />
          ))}
          {peak && (
            <circle cx={peak.x} cy={peak.y} r={animating ? 4 : 0} fill={TREND_UP_COLOR} stroke="#fff" strokeWidth={2}
              style={animating ? { animation: 'cx-spark-dot 150ms ease-out 600ms backwards' } : undefined} />
          )}
          {valley && (
            <circle cx={valley.x} cy={valley.y} r={animating ? 4 : 0} fill={TREND_DOWN_COLOR} stroke="#fff" strokeWidth={2}
              style={animating ? { animation: 'cx-spark-dot 150ms ease-out 600ms backwards' } : undefined} />
          )}
        </svg>
        {peak && peakRate != null && (
          <div
            // Chip's bottom edge sits ~4px above the peak dot: the chart
            // container's paddingTop (14) puts SVG y=0 at container y=14, minus
            // dot radius (4) and the gap (4); translateY(-100%) anchors the
            // chip's bottom edge there. lineHeight: 0 collapses the wrapper's
            // line box so the inherited font-size adds no stray space.
            style={{
              position: 'absolute',
              left: clampChipLeft(peak.x),
              top: 6 + peak.y,
              transform: 'translate(-50%, -100%)',
              lineHeight: 0,
              ...fadeStyle,
            }}
          >
            <MiniRateChip value={peakRate} quoteIcon={quoteIcon} />
          </div>
        )}
        {valley && valleyRate != null && (
          <div
            // Top edge sits ~4px below the valley dot: paddingTop (14) +
            // dot radius (4) + gap (4) = 22, plus the SVG's local y.
            style={{
              position: 'absolute',
              left: clampChipLeft(valley.x),
              top: 22 + valley.y,
              transform: 'translateX(-50%)',
              lineHeight: 0,
              ...fadeStyle,
            }}
          >
            <MiniRateChip value={valleyRate} quoteIcon={quoteIcon} />
          </div>
        )}
      </div>
      <style>{`
        @keyframes cx-spark-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes cx-spark-dot { from { r: 0; } to { r: 4; } }
        @keyframes cx-spark-fill { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cx-spark-label { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )

  return createPortal(overlay, document.body)
}
