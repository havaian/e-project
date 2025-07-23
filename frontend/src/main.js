import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Get environment variables from runtime config OR build-time (fallback)
function getEnvVar(key) {
  // First try runtime config
  if (window.__APP_CONFIG__ && window.__APP_CONFIG__[key]) {
    return window.__APP_CONFIG__[key];
  }
  // Fallback to build-time env vars
  return import.meta.env[key];
}

// Set CSS custom properties from environment variables
function setCSSVariables() {
  const root = document.documentElement

  // Get colors using the new runtime-aware function
  const color1 = getEnvVar('VITE_COLOR_1')
  const color2 = getEnvVar('VITE_COLOR_2')
  const color3 = getEnvVar('VITE_COLOR_3')
  const color4 = getEnvVar('VITE_COLOR_4')
  const color5 = getEnvVar('VITE_COLOR_5')
  const success = getEnvVar('VITE_COLOR_SUCCESS')
  const warning = getEnvVar('VITE_COLOR_WARNING')
  const error = getEnvVar('VITE_COLOR_ERROR')

  console.log('Loading colors:', { color1, color2, color3, color4, color5 }) // Debug

  // Only set if values exist
  if (color1) root.style.setProperty('--color-brand-1', color1)
  if (color2) root.style.setProperty('--color-brand-2', color2)
  if (color3) root.style.setProperty('--color-brand-3', color3)
  if (color4) root.style.setProperty('--color-brand-4', color4)
  if (color5) root.style.setProperty('--color-brand-5', color5)
  if (success) root.style.setProperty('--color-success', success)
  if (warning) root.style.setProperty('--color-warning', warning)
  if (error) root.style.setProperty('--color-error', error)

  // Set legacy variables for backwards compatibility
  if (color1) root.style.setProperty('--primary', color1)
  if (color2) root.style.setProperty('--secondary', color2)
  if (color3) root.style.setProperty('--accent', color3)
  // ... rest of your gradient and shadow logic
}

// Set CSS variables on app initialization
setCSSVariables()

// Update document title dynamically
const updateDocumentTitle = () => {
  const fullTitle = import.meta.env.VITE_APP_PAGE_TITLE

  document.title = fullTitle
}

// Update meta tags dynamically
const updateMetaTags = () => {
  const description = import.meta.env.VITE_APP_PAGE_DESC
  const title = import.meta.env.VITE_APP_PAGE_TITLE
  const url = import.meta.env.VITE_PROJECT_URL

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]')
  if (!metaDescription) {
    metaDescription = document.createElement('meta')
    metaDescription.setAttribute('name', 'description')
    document.head.appendChild(metaDescription)
  }
  metaDescription.setAttribute('content', description)

  // Update Open Graph tags
  const updateOrCreateMeta = (selector, content) => {
    let meta = document.querySelector(selector)
    if (!meta) {
      meta = document.createElement('meta')
      const property = selector.includes('property') ? 'property' : 'name'
      const value = selector.match(/\[(.+?)="(.+?)"\]/)?.[2]
      if (value) {
        meta.setAttribute(property, value)
        document.head.appendChild(meta)
      }
    }
    if (meta) meta.setAttribute('content', content)
  }

  updateOrCreateMeta('meta[property="og:title"]', title)
  updateOrCreateMeta('meta[property="og:description"]', description)
  updateOrCreateMeta('meta[property="og:url"]', url)
  updateOrCreateMeta('meta[property="twitter:title"]', title)
  updateOrCreateMeta('meta[property="twitter:description"]', description)
  updateOrCreateMeta('meta[property="twitter:url"]', url)
}

// Initialize everything
updateDocumentTitle()
updateMetaTags()

// Hot reload support for development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    setCSSVariables()
    updateDocumentTitle()
    updateMetaTags()
  })
}

app.mount('#app')