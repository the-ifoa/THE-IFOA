import { renderToString } from 'react-dom/server'
// React Router v7 exports StaticRouter from the root package;
// react-router-dom/server no longer exists.
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'
import { eagerPublicPages } from './pages/eagerPublicPages'

// Consumed by scripts/prerender.mjs. Effects do not run here, so any data a
// route needs must already be on globalThis.__IFOA_PRELOAD__ (see lib/preload.js).
// publicPages must be the eager set here: renderToString() can't await a
// lazy import, so a lazy page would render as its Suspense fallback in the
// prerendered HTML instead of the real page.
export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <AppRoutes publicPages={eagerPublicPages} />
    </StaticRouter>
  )
}
