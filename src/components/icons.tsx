const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function PlayIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M7 4.5v15l13-7.5z" />
    </svg>
  )
}

export function PauseIcon({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...stroke}>
      <path d="M8 5v14M16 5v14" />
    </svg>
  )
}

export function RewindIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
      <path d="M19 5v14L8 12zM5 5v14" />
    </svg>
  )
}

export function AlignIcon({ align }: { align: 'left' | 'center' | 'right' }) {
  const rows =
    align === 'left'
      ? ['M4 6h16', 'M4 10h10', 'M4 14h16', 'M4 18h10']
      : align === 'right'
        ? ['M4 6h16', 'M10 10h10', 'M4 14h16', 'M10 18h10']
        : ['M4 6h16', 'M7 10h10', 'M4 14h16', 'M7 18h10']
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
      {rows.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  )
}

export function FlipXIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
      <path d="M12 3v18" strokeDasharray="3 3" />
      <path d="M9 6H4v12h5z" />
      <path d="M15 6h5v12h-5z" />
    </svg>
  )
}

export function FlipYIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
      <path d="M3 12h18" strokeDasharray="3 3" />
      <path d="M6 9V4h12v5z" />
      <path d="M6 15v5h12v-5z" />
    </svg>
  )
}

export function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...stroke}>
      <path d="M4 20h4L20 8l-4-4L4 16z" />
    </svg>
  )
}

export function PaletteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke}>
      <path d="M12 3a9 8 0 1 0 0 16c1.1 0 1.7-.8 1.2-1.7-.4-.7.1-1.5 1-1.5H16a5 4.3 0 0 0 5-4.3C21 6.6 17 3 12 3z" />
      <circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="8.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
      {[8, 12, 16].map((y) =>
        [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />),
      )}
    </svg>
  )
}
