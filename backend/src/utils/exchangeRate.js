// backend/src/utils/exchangeRate.js
//
// Fetches the UZS → USD exchange rate from the Central Bank of Uzbekistan
// public API and caches it in Redis for 24 hours.
//
// CBU endpoint returns the rate as UZS per 1 USD, e.g. 12878.15
// To convert: usdAmount = uzsSAmount / rate
//
// Usage:
//   const { uzsToUsdCents } = require('../utils/exchangeRate')
//   const cents = await uzsToUsdCents(1000000)  // → e.g. 7764 (≈ $77.64)

const https = require('https')
const { redisClient } = require('./redisClient')

const CACHE_KEY = 'exchange:uzs_per_usd'
const CACHE_TTL = 86400 // 24 hours in seconds
const CBU_URL = 'https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/'

// Fallback rate used ONLY if CBU is unreachable and nothing is in cache.
// Update this manually if needed, but it should never be hit in practice.
const FALLBACK_RATE = 12800

/**
 * Fetch the current UZS/USD rate from CBU.
 * Returns a number like 12878.15 (UZS per 1 USD).
 */
function fetchRateFromCBU() {
    return new Promise((resolve, reject) => {
        https.get(CBU_URL, res => {
            let raw = ''
            res.on('data', chunk => { raw += chunk })
            res.on('end', () => {
                try {
                    const data = JSON.parse(raw)
                    const rate = parseFloat(data[0]?.Rate)
                    if (!rate || isNaN(rate)) throw new Error('Invalid rate in CBU response')
                    resolve(rate)
                } catch (e) {
                    reject(e)
                }
            })
        }).on('error', reject)
    })
}

/**
 * Returns the cached UZS/USD rate, refreshing from CBU if the cache has expired.
 * Never throws — falls back to the hardcoded FALLBACK_RATE if everything fails.
 */
async function getRate() {
    // Try cache first
    try {
        const cached = await redisClient.get(CACHE_KEY)
        if (cached) {
            return parseFloat(cached)
        }
    } catch (e) {
        console.error('[exchangeRate] Redis get error:', e.message)
    }

    // Cache miss — fetch from CBU
    try {
        const rate = await fetchRateFromCBU()
        console.log(`[exchangeRate] Fetched fresh rate from CBU: 1 USD = ${rate} UZS`)

        // Store for 24 hours
        try {
            await redisClient.set(CACHE_KEY, rate.toString(), { EX: CACHE_TTL })
        } catch (e) {
            console.error('[exchangeRate] Redis set error (non-fatal):', e.message)
        }

        return rate
    } catch (e) {
        console.error('[exchangeRate] CBU fetch failed, using fallback rate:', e.message)
        return FALLBACK_RATE
    }
}

/**
 * Convert a UZS amount to USD cents for Stripe.
 *
 * @param {number} uzs  - Amount in Uzbekistani Som
 * @returns {Promise<number>} - Amount in USD cents (integer), minimum 50 ($0.50 — Stripe minimum)
 *
 * @example
 * await uzsToUsdCents(1_000_000)  // → ~7764  ($77.64 at ~12878 UZS/USD)
 */
async function uzsToUsdCents(uzs) {
    const rate = await getRate()
    const usd = uzs / rate
    const cents = Math.round(usd * 100)
    // Stripe minimum charge is $0.50 = 50 cents
    return Math.max(cents, 50)
}

module.exports = { getRate, uzsToUsdCents }