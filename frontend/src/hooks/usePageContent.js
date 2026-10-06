import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

function isPlainObject(v) {
  return v && typeof v === 'object' && !Array.isArray(v)
}

// Deep-merge server content on top of the page's shipped fallback. Arrays are
// replaced wholesale (the admin owns list contents once saved).
export function mergeContent(base, override) {
  if (!isPlainObject(override)) return override === undefined ? base : override
  const out = isPlainObject(base) ? { ...base } : {}
  for (const key of Object.keys(override)) {
    const b = out[key]
    const o = override[key]
    out[key] = isPlainObject(b) && isPlainObject(o) ? mergeContent(b, o) : o
  }
  return out
}

/**
 * Fetches editable content for a marketing page.
 * `fallback` is the content the page ships with - rendered immediately and
 * kept if the request fails, so the page is never blank.
 *
 * Returns { c, loaded } where `c` is the merged content object.
 */
function isPreviewMode() {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('__preview') === '1'
}

export function usePageContent(page, fallback) {
  const [c, setC] = useState(fallback)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isPreviewMode()) {
      // Inside the admin's live-preview iframe: skip the network entirely and
      // just wait for postMessage'd in-progress edits from the parent tab.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- loading/reset state at the start of an effect that syncs with an external source
      setLoaded(true)

      const onMessage = (event) => {
        if (event.origin !== window.location.origin) return
        const msg = event.data
        if (!msg || msg.type !== 'ifoa-preview-content' || msg.page !== page) return
        setC(mergeContent(fallback, msg.data))
      }
      window.addEventListener('message', onMessage)

      // Tell the parent we're ready so it can (re)send the current edit
      // state right away, in case we missed an earlier postMessage.
      window.parent.postMessage({ type: 'ifoa-preview-ready', page }, window.location.origin)

      return () => window.removeEventListener('message', onMessage)
    }

    let alive = true
    api
      .getPage(page)
      .then((res) => {
        if (alive && res?.data) setC(mergeContent(fallback, res.data))
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoaded(true)
      })
    return () => {
      alive = false
    }
    // fallback is a module-level constant per page; page arg is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return { c, loaded }
}

export default usePageContent
