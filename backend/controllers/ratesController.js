// Rupee rates for the course price converter. The rate comes from Gemini (with
// Google Search grounding), asked once a day and stored in MongoDB; every visit
// reads the stored value. The answer is sanity-checked against a free reference
// feed, which is also the fallback if Gemini is unavailable and nothing is stored.
const ExchangeRate = require('../models/ExchangeRate')

const GEMINI_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_RATES_MODEL || process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const KEY = 'inr'
const CURRENCIES = ['USD', 'EUR']
const DAY_MS = 24 * 60 * 60 * 1000
const RETRY_MS = 60 * 60 * 1000 // after a failed refresh, wait an hour before asking again
const MAX_DEVIATION = 0.05 // Gemini must agree with the reference feed within 5%

async function referenceRates() {
  const inrPer = {}
  await Promise.all(
    CURRENCIES.map(async (code) => {
      const res = await fetch(`https://www.floatrates.com/daily/${code.toLowerCase()}.json`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) throw new Error(`reference feed ${code} returned ${res.status}`)
      const rate = Number((await res.json()).inr?.rate)
      if (!(rate > 0)) throw new Error(`reference feed ${code} missing INR`)
      inrPer[code] = rate
    })
  )
  return inrPer
}

async function geminiRates() {
  if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY is not set')
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      tools: [{ google_search: {} }],
      generationConfig: { temperature: 0 },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                'Look up the current mid-market exchange rates to Indian rupees. ' +
                'How many INR is 1 USD, and how many INR is 1 EUR? ' +
                'Reply with ONLY a JSON object like {"USD": 00.00, "EUR": 00.00}, numbers only, no text.'
            }
          ]
        }
      ]
    })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`gemini ${res.status}: ${data?.error?.message || ''}`)
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('')
  const match = text.match(/\{[^{}]*\}/)
  if (!match) throw new Error('gemini reply had no JSON')
  const parsed = JSON.parse(match[0])
  const inrPer = {}
  for (const code of CURRENCIES) {
    const v = Number(parsed[code])
    if (!(v > 0)) throw new Error(`gemini reply missing ${code}`)
    inrPer[code] = v
  }
  return inrPer
}

// Gemini's figures are only accepted when close to the reference feed.
async function fetchFresh() {
  const reference = await referenceRates().catch(() => null)
  try {
    const inrPer = await geminiRates()
    if (reference) {
      for (const code of CURRENCIES) {
        if (Math.abs(inrPer[code] - reference[code]) / reference[code] > MAX_DEVIATION) {
          throw new Error(`gemini ${code} rate ${inrPer[code]} is too far from reference ${reference[code]}`)
        }
      }
    }
    return { inrPer, source: 'gemini' }
  } catch (err) {
    console.warn('[rates] gemini failed:', err.message)
    if (reference) return { inrPer: reference, source: 'reference' }
    throw err
  }
}

let refreshing = null

async function refreshIfDue(doc) {
  const now = Date.now()
  const fresh = doc?.fetchedAt && now - doc.fetchedAt.getTime() < DAY_MS
  const recentlyTried = doc?.lastAttemptAt && now - doc.lastAttemptAt.getTime() < RETRY_MS
  if (fresh || recentlyTried) return doc

  if (!refreshing) {
    refreshing = (async () => {
      await ExchangeRate.updateOne({ key: KEY }, { $set: { lastAttemptAt: new Date() } }, { upsert: true })
      try {
        const { inrPer, source } = await fetchFresh()
        return await ExchangeRate.findOneAndUpdate(
          { key: KEY },
          { $set: { inrPer, source, fetchedAt: new Date() } },
          { upsert: true, returnDocument: 'after' }
        )
      } catch (err) {
        console.warn('[rates] refresh failed:', err.message)
        return doc
      } finally {
        refreshing = null
      }
    })()
  }
  return refreshing
}

exports.getRates = async (req, res) => {
  try {
    let doc = await ExchangeRate.findOne({ key: KEY })
    doc = await refreshIfDue(doc)
    if (!doc?.fetchedAt) return res.status(503).json({ message: 'Exchange rates are unavailable right now.' })
    res.set('Cache-Control', 'no-cache')
    res.json({ base: 'INR', inrPer: Object.fromEntries(doc.inrPer), updatedAt: doc.fetchedAt.toUTCString(), source: doc.source })
  } catch (err) {
    console.warn('[rates] unavailable:', err.message)
    res.status(503).json({ message: 'Exchange rates are unavailable right now.' })
  }
}
