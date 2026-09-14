import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FONT_OPTIONS, SETTING_LIMITS } from '../state/defaults'
import { markPopoverDismiss } from '../lib/popover'
import { PaletteIcon } from './icons'

const COLOR_PRESETS = [
  '#000000',
  '#111827',
  '#ffffff',
  '#e5e7eb',
  '#fbbf24',
  '#ef4444',
  '#22c55e',
  '#3b82f6',
]

const POPOVER_WIDTH = 260
const EDGE_GAP = 8

interface Props {
  bgColor: string
  textColor: string
  fontFamily: string
  lineHeight: number
  onBgColor: (v: string) => void
  onTextColor: (v: string) => void
  onFontFamily: (v: string) => void
  onLineHeight: (v: number) => void
  /** popover opens downward when the toolbar is docked at the top */
  openDown: boolean
}

function RangeRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-neutral-300">{label}</span>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-300">
        {label}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-14 cursor-pointer rounded border border-neutral-600 bg-transparent"
        />
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            aria-label={preset}
            onClick={() => onChange(preset)}
            className={`h-7 rounded-md border ${
              preset.toLowerCase() === value.toLowerCase()
                ? 'border-blue-500 ring-2 ring-blue-500'
                : 'border-neutral-600'
            }`}
            style={{ background: preset }}
          />
        ))}
      </div>
    </div>
  )
}

export default function AppearanceControl({
  bgColor,
  textColor,
  fontFamily,
  lineHeight,
  onBgColor,
  onTextColor,
  onFontFamily,
  onLineHeight,
  openDown,
}: Props) {
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<{ left: number; top?: number; bottom?: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  // The toolbar row scrolls horizontally, which makes its computed overflow-y
  // `auto` - an absolutely positioned popover inside it gets clipped to the
  // 57px bar. So the panel lives in a portal, anchored to the button by hand.
  const place = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const left = Math.min(
      window.innerWidth - POPOVER_WIDTH - EDGE_GAP,
      Math.max(EDGE_GAP, rect.left + rect.width / 2 - POPOVER_WIDTH / 2),
    )
    setAnchor(
      openDown
        ? { left, top: rect.bottom + EDGE_GAP }
        : { left, bottom: window.innerHeight - rect.top + EDGE_GAP },
    )
  }, [openDown])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return

    const onDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (buttonRef.current?.contains(target) || popRef.current?.contains(target)) return
      markPopoverDismiss(e)
      setOpen(false)
    }

    document.addEventListener('pointerdown', onDown, true)
    window.addEventListener('resize', place)
    window.addEventListener('orientationchange', place)
    return () => {
      document.removeEventListener('pointerdown', onDown, true)
      window.removeEventListener('resize', place)
      window.removeEventListener('orientationchange', place)
    }
  }, [open, place])

  return (
    <div className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Appearance: background, text color, font"
        aria-expanded={open}
        title="Appearance"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-lg px-2 text-neutral-200 active:bg-neutral-700"
      >
        <PaletteIcon />
        <span className="text-[11px] leading-none text-neutral-300">Appearance</span>
      </button>

      {open &&
        anchor &&
        createPortal(
          // data-toolbar keeps the prompter's tap-to-play gesture off this panel
          <div
            ref={popRef}
            data-toolbar
            className="fixed z-50 flex max-h-[70vh] flex-col gap-4 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-3 shadow-xl"
            style={{ left: anchor.left, top: anchor.top, bottom: anchor.bottom, width: POPOVER_WIDTH }}
          >
            <RangeRow
              label={`Line spacing: ${lineHeight.toFixed(1)}`}
              value={lineHeight}
              {...SETTING_LIMITS.lineHeight}
              onChange={onLineHeight}
            />

            <ColorRow label="Background" value={bgColor} onChange={onBgColor} />
            <ColorRow label="Text color" value={textColor} onChange={onTextColor} />

            <div>
              <div className="mb-1.5 text-xs text-neutral-300">Font</div>
              <div className="flex flex-col gap-1">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.label}
                    type="button"
                    onClick={() => onFontFamily(font.value)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left ${
                      font.value === fontFamily
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-200 active:bg-neutral-800'
                    }`}
                    style={{ fontFamily: font.value }}
                  >
                    <span className="text-sm">{font.label}</span>
                    <span className="text-base">Ag</span>
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
