import { DEFAULT_SETTINGS, SAMPLE_SCRIPT } from './defaults'
import type { PrompterState, ScriptDoc, Settings } from './types'

const KEY = 'bryf-teleprompter/v2'
const LEGACY_KEY = 'bryf-teleprompter/v1'

interface Persisted {
  settings: Partial<Settings>
  script: ScriptDoc
}

export function loadState(): PrompterState {
  const base: PrompterState = {
    settings: DEFAULT_SETTINGS,
    script: SAMPLE_SCRIPT,
    playing: false,
    editorOpen: false,
    toast: null,
  }

  try {
    const raw = localStorage.getItem(KEY)
    const legacyRaw = raw ? null : localStorage.getItem(LEGACY_KEY)
    if (!raw && !legacyRaw) return base
    const parsed = JSON.parse(raw ?? legacyRaw!) as Partial<Persisted>
    const settings = { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) }
    // Convert the former 1–100 control onto the precise 1–50 scale. Its
    // practical 1–30 range now fills the entire slider.
    settings.speed = legacyRaw
      ? Math.min(50, Math.max(1, Math.round((settings.speed * 50) / 30)))
      : Math.min(50, Math.max(1, settings.speed))

    return {
      ...base,
      // merge over defaults so settings added later don't break stored blobs
      settings,
      script: parsed.script?.html ? parsed.script : base.script,
    }
  } catch {
    return base
  }
}

let timer: number | undefined

export function saveState(state: PrompterState): void {
  if (timer !== undefined) clearTimeout(timer)
  timer = window.setTimeout(() => {
    const payload: Persisted = { settings: state.settings, script: state.script }
    try {
      localStorage.setItem(KEY, JSON.stringify(payload))
    } catch {
      // quota exceeded / private mode - not worth interrupting the operator
    }
  }, 300)
}
