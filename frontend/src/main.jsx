import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRoutes } from './App.jsx'
import { lazyPublicPages, preloadForPath, prefetchPublicPages } from './pages/lazyPublicPages'

// The lazyPublicPages import (and the BrowserRouter composition) lives here,
// not in App.jsx, so entry-server.jsx's module graph never touches it - see
// pages/eagerPublicPages.js for why that separation is what actually makes
// the browser only download the page a visitor is on.
//
// Render only once the current page's code is loaded: the prerendered HTML
// stays on screen meanwhile, instead of being swapped for a loading spinner.
preloadForPath(window.location.pathname).then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <BrowserRouter>
        <AppRoutes publicPages={lazyPublicPages} />
      </BrowserRouter>
    </StrictMode>,
  )
  prefetchPublicPages()
})
