import { useState } from 'react'
import { api } from '@/lib/api'

// A course price as shown in sidebars: "$4,500 USD" (code in small type for
// dollars, so it is never mistaken for another dollar), "€3,500", "€1,000".
const SYMBOL = { USD: '$', EUR: '€', INR: '₹' }

export function PriceTag({ price, codeClassName = 'ml-1.5 text-[0.45em] font-bold tracking-wider text-slate-400 align-middle' }) {
  if (!price || price.amount == null) return null
  const symbol = SYMBOL[price.currency]
  const amount = Number(price.amount).toLocaleString(price.currency === 'INR' ? 'en-IN' : 'en-US')
  if (!symbol) return `${price.currency} ${amount}`
  return (
    <>
      {symbol}
      {amount}
      {price.currency === 'USD' && <span className={codeClassName}>USD</span>}
    </>
  )
}

// A course price as plain text, e.g. "$4,500 USD", "€3,500", "€1,000 + GST".
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function priceText(price, india = false) {
  if (!price || price.amount == null) return null
  const symbol = SYMBOL[price.currency]
  const amount = Number(price.amount).toLocaleString(price.currency === 'INR' ? 'en-IN' : 'en-US')
  const base = symbol ? `${symbol}${amount}${price.currency === 'USD' ? ' USD' : ''}` : `${price.currency} ${amount}`
  return india ? `${base} + GST` : base
}

// Tax note under a course fee: GST for courses taught in India, VAT elsewhere.
// eslint-disable-next-line react-refresh/only-export-components -- helper co-located with its component on purpose; only affects dev hot reload
export function taxNote(price, india = false) {
  if (price?.amount == null) return null
  return india ? '+ GST as applicable' : '+ VAT where applicable'
}

// Indicative rupee equivalent of a USD or EUR price. Rates load on first use and
// are shared across the page; if they can't be fetched the control stays hidden.
let ratesPromise = null
function loadRates() {
  if (!ratesPromise) ratesPromise = api.getRates().catch((err) => { ratesPromise = null; throw err })
  return ratesPromise
}

export function InrConverter({ price }) {
  const [state, setState] = useState({ open: false, rates: null, failed: false })
  if (!price || price.amount == null || !['USD', 'EUR'].includes(price.currency) || state.failed) return null

  const toggle = async () => {
    if (state.open) return setState((s) => ({ ...s, open: false }))
    setState((s) => ({ ...s, open: true }))
    if (!state.rates) {
      try {
        const rates = await loadRates()
        setState((s) => ({ ...s, rates }))
      } catch {
        setState({ open: false, rates: null, failed: true })
      }
    }
  }

  const rate = state.rates?.inrPer?.[price.currency]
  const inr = rate ? Math.round((Number(price.amount) * rate) / 10) * 10 : null
  const updated = state.rates?.updatedAt ? new Date(state.rates.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={state.open}
        className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 px-3.5 py-1.5 text-[13px] font-semibold text-slate-900 shadow-sm transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[11px] font-bold text-white">₹</span>
        {state.open ? 'Hide price in rupees' : 'See price in rupees (INR)'}
      </button>
      {state.open && (
        <div className="mt-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          {inr ? (
            <>
              <p className="text-2xl font-extrabold tracking-tight text-slate-950">≈ ₹{inr.toLocaleString('en-IN')}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                Approximate, at the {updated ? `${updated} ` : ''}market rate. Rates move through the day, and the invoiced amount follows your bank&apos;s rate.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">Loading rate…</p>
          )}
        </div>
      )}
    </div>
  )
}

export default PriceTag
