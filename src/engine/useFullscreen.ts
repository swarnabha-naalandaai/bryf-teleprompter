import { useCallback, useEffect, useState } from 'react'

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

function fullscreenElement() {
  const documentWithWebkit = document as FullscreenDocument
  return document.fullscreenElement ?? documentWithWebkit.webkitFullscreenElement ?? null
}

function isSupported() {
  const root = document.documentElement as FullscreenElement
  return Boolean(root.requestFullscreen ?? root.webkitRequestFullscreen)
}

/** Controls browser fullscreen, including the WebKit API used by iPad Safari. */
export function useFullscreen() {
  const [supported] = useState(isSupported)
  const [active, setActive] = useState(() => Boolean(fullscreenElement()))

  useEffect(() => {
    const sync = () => setActive(Boolean(fullscreenElement()))
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const toggle = useCallback(async () => {
    const documentWithWebkit = document as FullscreenDocument

    try {
      if (fullscreenElement()) {
        const exit = document.exitFullscreen ?? documentWithWebkit.webkitExitFullscreen
        await exit?.call(document)
        return true
      }

      const root = document.documentElement as FullscreenElement
      const request = root.requestFullscreen ?? root.webkitRequestFullscreen
      if (!request) return false
      await request.call(root)
      return true
    } catch {
      return false
    }
  }, [])

  return { active, supported, toggle }
}
