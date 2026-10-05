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

// GST note shown under every course fee, in any currency.
export const hasGst = (price) => price?.amount != null
export const GST_NOTE = '+ GST as applicable'

export default PriceTag
