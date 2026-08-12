import { useMemo, useState } from 'react'
import { Box, Flex, Text } from '@radix-ui/themes'

function niceMax(max) {
  if (!max || max <= 0) return 4
  const exp = 10 ** Math.floor(Math.log10(max))
  const n = max / exp
  let step = 1
  if (n <= 1) step = 1
  else if (n <= 2) step = 2
  else if (n <= 5) step = 5
  else step = 10
  return step * exp
}

function Tooltip({ x, y, label, value, align = 'left' }) {
  const style = {
    position: 'absolute',
    left: align === 'right' ? x - 150 : x + 8,
    top: Math.max(8, y - 46),
    pointerEvents: 'none',
    background: 'var(--gray-12)',
    color: 'var(--gray-1)',
    borderRadius: 6,
    padding: '4px 8px',
    fontSize: 11,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    zIndex: 5,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
  }
  return (
    <div style={style}>
      <div style={{ fontWeight: 600 }}>{value}</div>
      <div style={{ opacity: 0.75 }}>{label}</div>
    </div>
  )
}

function xTickLabel(date, i, n) {
  if (n <= 8 || i === 0 || i === n - 1) return date.slice(5)
  if (n <= 31 && i % 5 === 0) return date.slice(5)
  return ''
}

export function AreaTrend({
  data = [],
  height = 190,
  color = 'var(--blue-9)',
  softColor = 'var(--blue-9)',
  format = (v) => String(v),
}) {
  const [hover, setHover] = useState(-1)
  const W = 640
  const H = height
  const padL = 6
  const padR = 6
  const padT = 14
  const padB = 22

  const { pts, max, areaPath, linePath } = useMemo(() => {
    const max = niceMax(Math.max(...data.map((d) => Number(d.total_tokens) || 0), 0))
    const pts = data.map((d, i) => {
      const x = padL + (i / Math.max(1, data.length - 1)) * (W - padL - padR)
      const y = padT + (1 - (Number(d.total_tokens) || 0) / max) * (H - padT - padB)
      return { x, y, d }
    })
    const line = pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ')
    const last = pts[pts.length - 1]
    const first = pts[0]
    const areaPath = `${line} L${last.x.toFixed(1)},${H - padB} L${first.x.toFixed(1)},${H - padB} Z`
    return { pts, max, areaPath, linePath: line }
  }, [data, W, H, padL, padR, padT, padB])

  if (!data.length) return null

  const n = data.length
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: padT + f * (H - padT - padB),
    label: Math.round(max * (1 - f)).toLocaleString(),
  }))
  const hoverPt = hover >= 0 ? pts[hover] : null

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        onMouseLeave={() => setHover(-1)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          setHover(Math.round(ratio * (n - 1)))
        }}
      >
        <defs>
          <linearGradient id="area-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={softColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={softColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={g.y}
              y2={g.y}
              stroke="var(--gray-5)"
              strokeWidth="1"
              strokeDasharray={i === 0 ? '' : '3 4'}
            />
            <text x={padL + 2} y={g.y - 3} fontSize="9" fill="var(--gray-9)">
              {g.label}
            </text>
          </g>
        ))}
        <path d={areaPath} fill="url(#area-trend-fill)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {hover >= 0 && (
          <line
            x1={hoverPt.x}
            x2={hoverPt.x}
            y1={padT - 4}
            y2={H - padB}
            stroke="var(--gray-8)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 4 : 2.6} fill={hover === i ? color : 'var(--gray-1)'} stroke={color} strokeWidth="1.6" />
        ))}
        {pts.map((p, i) =>
          xTickLabel(p.d.date, i, n) ? (
            <text key={`t${i}`} x={p.x} y={H - 6} fontSize="9" fill="var(--gray-9)" textAnchor="middle">
              {xTickLabel(p.d.date, i, n)}
            </text>
          ) : null
        )}
      </svg>
      {hoverPt && (
        <Tooltip x={hoverPt.x} y={hoverPt.y} label={hoverPt.d.date} value={format(hoverPt.d.total_tokens)} />
      )}
    </Box>
  )
}

export function BarSeries({
  data = [],
  height = 190,
  color = 'var(--green-9)',
  format = (v) => String(v),
}) {
  const [hover, setHover] = useState(-1)
  const W = 640
  const H = height
  const padL = 6
  const padR = 6
  const padT = 14
  const padB = 22

  const { bars, max, innerW } = useMemo(() => {
    const max = niceMax(Math.max(...data.map((d) => Number(d.ai_calls) || 0), 0))
    const innerW = W - padL - padR
    const slot = innerW / Math.max(1, data.length)
    const bw = Math.max(3, Math.min(26, slot * 0.62))
    const bars = data.map((d, i) => {
      const v = Number(d.ai_calls) || 0
      const x = padL + i * slot + (slot - bw) / 2
      const h = (v / max) * (H - padT - padB)
      const y = H - padB - h
      return { x, y, w: bw, h, d, v }
    })
    return { bars, max, innerW }
  }, [data, W, H, padL, padR, padT, padB])

  if (!data.length) return null

  const n = data.length
  const gridLines = [0, 0.5, 1].map((f) => ({
    y: padT + f * (H - padT - padB),
    label: Math.round(max * (1 - f)).toLocaleString(),
  }))
  const hoverBar = hover >= 0 ? bars[hover] : null

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block', width: '100%', height: 'auto' }}
        onMouseLeave={() => setHover(-1)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          setHover(Math.round(ratio * (n - 1)))
        }}
      >
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={g.y}
              y2={g.y}
              stroke="var(--gray-5)"
              strokeWidth="1"
              strokeDasharray={i === 0 ? '' : '3 4'}
            />
            <text x={padL + 2} y={g.y - 3} fontSize="9" fill="var(--gray-9)">
              {g.label}
            </text>
          </g>
        ))}
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={Math.max(b.v > 0 ? 2 : 0, b.h)}
            rx="2"
            fill={hover === i ? color : color}
            opacity={hover === -1 || hover === i ? 1 : 0.45}
          />
        ))}
        {bars.map((b, i) =>
          xTickLabel(b.d.date, i, n) ? (
            <text key={`t${i}`} x={b.x + b.w / 2} y={H - 6} fontSize="9" fill="var(--gray-9)" textAnchor="middle">
              {xTickLabel(b.d.date, i, n)}
            </text>
          ) : null
        )}
      </svg>
      {hoverBar && (
        <Tooltip x={hoverBar.x + hoverBar.w / 2} y={hoverBar.y} label={hoverBar.d.date} value={format(hoverBar.v)} />
      )}
    </Box>
  )
}

export function Donut({ segments = [], size = 132, thickness = 15, centerLabel, centerSub, color }) {
  const total = segments.reduce((s, x) => s + (Number(x.value) || 0), 0)
  const R = (size - thickness) / 2
  const C = 2 * Math.PI * R
  let offset = 0
  const arcs = segments
    .filter((s) => Number(s.value) > 0)
    .map((s) => {
      const frac = Number(s.value) / (total || 1)
      const arc = { ...s, dash: frac * C, offset }
      offset += frac * C
      return arc
    })

  return (
    <Flex align="center" gap="4">
      <Box style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="var(--gray-4)" strokeWidth={thickness} />
          {arcs.map((a, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={R}
              fill="none"
              stroke={a.color || 'var(--gray-7)'}
              strokeWidth={thickness}
              strokeLinecap={a.dash > C * 0.97 ? 'butt' : 'butt'}
              strokeDasharray={`${Math.max(0, a.dash - 2)} ${C}`}
              strokeDashoffset={-a.offset}
            />
          ))}
        </svg>
        <Flex
          direction="column"
          align="center"
          justify="center"
          style={{ position: 'absolute', inset: 0 }}
        >
          <Text size="5" weight="bold" as="div" style={{ color: 'var(--gray-12)' }}>
            {centerLabel ?? total}
          </Text>
          {centerSub && (
            <Text size="1" style={{ color: 'var(--gray-9)' }}>
              {centerSub}
            </Text>
          )}
        </Flex>
      </Box>
      <Flex direction="column" gap="2">
        {(segments.length ? segments : []).map((s, i) => (
          <Flex key={i} align="center" gap="2">
            <Box style={{ width: 9, height: 9, borderRadius: 3, background: s.color || 'var(--gray-7)', flexShrink: 0 }} />
            <Text size="1" style={{ color: 'var(--gray-11)' }}>
              {s.label}
            </Text>
            <Text size="1" weight="bold" style={{ color: 'var(--gray-12)', marginLeft: 'auto' }}>
              {Number(s.value) || 0}
            </Text>
          </Flex>
        ))}
        {!segments.length && (
          <Text size="1" style={{ color: 'var(--gray-9)' }}>
            No data
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
