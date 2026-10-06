const mongoose = require('mongoose')

// One document ("inr") holding the latest rupee rates used by the course price
// converter, so the site asks the rate source once a day, not on every visit.
const exchangeRateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    inrPer: { type: Map, of: Number, default: {} },
    source: { type: String, default: '' },
    fetchedAt: { type: Date, default: null },
    lastAttemptAt: { type: Date, default: null }
  },
  { timestamps: true }
)

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema)
