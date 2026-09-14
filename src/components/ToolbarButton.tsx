import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  /** Play/pause reads as the primary action, so it gets a larger tap target. */
  big?: boolean
  label: string
  children: ReactNode
}

export default function ToolbarButton({ active = false, big = false, label, children, ...rest }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex items-center justify-center rounded-lg px-2 transition-colors ${
        big ? 'h-16 min-w-16' : 'h-14 min-w-14'
      } ${active ? 'bg-blue-600 text-white' : 'text-neutral-200 active:bg-neutral-700'}`}
      {...rest}
    >
      {children}
    </button>
  )
}
