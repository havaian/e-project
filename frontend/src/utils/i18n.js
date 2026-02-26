import { createI18n } from 'vue-i18n'

// Available locales configuration
export const availableLocales = [
    {
        code: 'en',
        name: 'English',
        flag: '🇬🇧'
    },
    {
        code: 'ru',
        name: 'Русский',
        flag: '🇷🇺'
    },
    {
        code: 'uz',
        name: 'O\'zbekcha',
        flag: '🇺🇿'
    }
]

// Default locale
const DEFAULT_LOCALE = 'en'

// Get stored locale from localStorage
export function getStoredLocale() {
    try {
        return localStorage.getItem('locale') || DEFAULT_LOCALE
    } catch (error) {
        console.warn('Could not access localStorage for locale:', error)
        return DEFAULT_LOCALE
    }
}

// Set locale and store in localStorage
export function setLocale(locale) {
    const validLocale = availableLocales.find(l => l.code === locale)?.code || DEFAULT_LOCALE

    try {
        localStorage.setItem('locale', validLocale)
    } catch (error) {
        console.warn('Could not save locale to localStorage:', error)
    }

    if (i18n.global.locale) {
        i18n.global.locale.value = validLocale
    }
    return validLocale
}

// Async function to load locale messages
async function loadLocaleMessages(locale) {
    try {
        const messages = await import(`../locales/${locale}.json`)
        return messages.default
    } catch (error) {
        console.warn(`Failed to load locale ${locale}, falling back to ${DEFAULT_LOCALE}`)
        if (locale !== DEFAULT_LOCALE) {
            return await loadLocaleMessages(DEFAULT_LOCALE)
        }
        // Return basic fallback messages if even default locale fails
        return {
            nav: {
                home: 'Home',
                findProviders: 'Find providers',
                courses: 'Courses',
                messages: 'Messages'
            }
        }
    }
}

// Create i18n instance with initial setup
const i18n = createI18n({
    legacy: false,
    locale: getStoredLocale(),
    fallbackLocale: DEFAULT_LOCALE,
    messages: {}, // Will be loaded dynamically
    globalInjection: true,
    silentTranslationWarn: true,
    silentFallbackWarn: true
})

// Export tObj as a standalone function for accessing nested objects
// (useful when you need the raw object, not a translated string)
export function tObj(key) {
    try {
        const locale = i18n.global.locale.value
        const keys = key.split('.')
        let result = i18n.global.messages.value[locale]

        for (const k of keys) {
            if (result && typeof result === 'object') {
                result = result[k]
            } else {
                return key // Return key if path doesn't exist
            }
        }

        return result !== undefined ? result : key
    } catch (error) {
        console.warn(`tObj failed for key: ${key}`, error)
        return key
    }
}

// Track initialization state
let isInitialized = false
let initializationPromise = null

// Initialize i18n messages
async function initializeI18n() {
    if (isInitialized) {
        return i18n
    }

    if (initializationPromise) {
        return initializationPromise
    }

    initializationPromise = (async () => {
        try {
            const locale = getStoredLocale()
            const messages = await loadLocaleMessages(locale)
            i18n.global.setLocaleMessage(locale, messages)

            // Also load fallback locale if different
            if (locale !== DEFAULT_LOCALE) {
                const fallbackMessages = await loadLocaleMessages(DEFAULT_LOCALE)
                i18n.global.setLocaleMessage(DEFAULT_LOCALE, fallbackMessages)
            }

            isInitialized = true
            return i18n
        } catch (error) {
            console.error('Failed to initialize i18n:', error)
            isInitialized = false
            throw error
        }
    })()

    return initializationPromise
}

// Function to change locale dynamically
export async function changeLocale(newLocale) {
    const validLocale = availableLocales.find(l => l.code === newLocale)?.code
    if (!validLocale) {
        console.warn(`Invalid locale: ${newLocale}`)
        return
    }

    try {
        // Load messages if not already loaded
        if (!i18n.global.availableLocales.includes(validLocale)) {
            const messages = await loadLocaleMessages(validLocale)
            i18n.global.setLocaleMessage(validLocale, messages)
        }

        // Set locale
        setLocale(validLocale)
    } catch (error) {
        console.error(`Failed to change locale to ${newLocale}:`, error)
    }
}

// Export function to check if i18n is ready
export function isI18nReady() {
    return isInitialized
}

// Export function to wait for i18n to be ready
export function waitForI18n() {
    if (isInitialized) {
        return Promise.resolve(i18n)
    }
    return initializationPromise || initializeI18n()
}

// Add a method to the global instance for the router to use
i18n.global.$waitForI18n = waitForI18n

// Initialize immediately
initializeI18n().catch(error => {
    console.error('Initial i18n setup failed:', error)
})

export default i18n