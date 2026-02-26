// backend/src/notification/emailLocale.js
//
// Helper to resolve user's preferred language for emails.
// Full email template i18n will be built on top of this later.

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'ru', 'uz'];

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

module.exports = { getUserLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE };