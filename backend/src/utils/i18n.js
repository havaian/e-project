// backend/src/utils/i18n.js
//
// Loads locale JSON files shared with the frontend via Docker volume mount.
// Mount point: /usr/src/app/locales (mapped from frontend/src/locales/)
//
// Usage:
//   const { t, getUserLocale } = require('./utils/i18n');
//   const locale = getUserLocale(user);
//   const greeting = t(locale, 'common.success');  // → "Success" / "Успешно" / "Muvaffaqiyatli"

const fs = require('fs');
const path = require('path');

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ru', 'uz'];

// Resolve locales directory — Docker mount or local fallback for dev
const LOCALES_DIR = fs.existsSync('/usr/src/app/locales')
    ? '/usr/src/app/locales'
    : path.join(__dirname, '../../frontend/src/locales'); // fallback for local dev without Docker

// Cache loaded locale data
const localeCache = {};

/**
 * Load a locale's messages (cached after first read).
 * @param {string} locale
 * @returns {Object} Parsed JSON messages
 */
function loadLocale(locale) {
    if (localeCache[locale]) return localeCache[locale];

    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        localeCache[locale] = JSON.parse(raw);
        return localeCache[locale];
    } catch (error) {
        console.warn(`[i18n] Failed to load locale "${locale}" from ${filePath}:`, error.message);
        // Fallback to default locale
        if (locale !== DEFAULT_LOCALE) {
            return loadLocale(DEFAULT_LOCALE);
        }
        return {};
    }
}

/**
 * Translate a dot-separated key for a given locale.
 * @param {string} locale - Locale code (en/ru/uz)
 * @param {string} key - Dot-separated key, e.g. 'common.success'
 * @param {Object} [params] - Optional interpolation params { name: 'John' } → replaces {name}
 * @returns {string} Translated string, or the key itself if not found
 */
function t(locale, key, params = {}) {
    const validLocale = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
    const messages = loadLocale(validLocale);

    // Walk the dot path
    const keys = key.split('.');
    let result = messages;
    for (const k of keys) {
        if (result && typeof result === 'object') {
            result = result[k];
        } else {
            return key; // Key not found, return as-is
        }
    }

    if (typeof result !== 'string') return key;

    // Simple interpolation: replace {param} with values
    if (params && Object.keys(params).length > 0) {
        return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }

    return result;
}

/**
 * Get the preferred locale for a user.
 * @param {Object} user - User document (or plain object with preferences)
 * @returns {string} Locale code
 */
function getUserLocale(user) {
    const lang = user?.preferences?.language;
    if (lang && SUPPORTED_LOCALES.includes(lang)) {
        return lang;
    }
    return DEFAULT_LOCALE;
}

/**
 * Clear the locale cache (useful if locale files are updated at runtime).
 */
function clearCache() {
    Object.keys(localeCache).forEach(key => delete localeCache[key]);
}

// Pre-load default locale on startup
loadLocale(DEFAULT_LOCALE);

module.exports = { t, getUserLocale, loadLocale, clearCache, SUPPORTED_LOCALES, DEFAULT_LOCALE };