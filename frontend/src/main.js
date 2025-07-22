// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Set CSS custom properties from environment variables
function setCSSVariables() {
  const root = document.documentElement
  
  // Get colors from environment variables with fallbacks
  const color1 = import.meta.env.VITE_COLOR_1
  const color2 = import.meta.env.VITE_COLOR_2
  const color3 = import.meta.env.VITE_COLOR_3
  const color4 = import.meta.env.VITE_COLOR_4
  const color5 = import.meta.env.VITE_COLOR_5
  const success = import.meta.env.VITE_COLOR_SUCCESS
  const warning = import.meta.env.VITE_COLOR_WARNING
  const error = import.meta.env.VITE_COLOR_ERROR
  
  // Set brand color variables
  root.style.setProperty('--color-brand-1', color1)
  root.style.setProperty('--color-brand-2', color2)
  root.style.setProperty('--color-brand-3', color3)
  root.style.setProperty('--color-brand-4', color4)
  root.style.setProperty('--color-brand-5', color5)
  root.style.setProperty('--color-success', success)
  root.style.setProperty('--color-warning', warning)
  root.style.setProperty('--color-error', error)
  
  // Set legacy variables for backwards compatibility
  root.style.setProperty('--primary', color1)
  root.style.setProperty('--secondary', color2)
  root.style.setProperty('--accent', color3)
  root.style.setProperty('--color1', color1)
  root.style.setProperty('--success', `rgb(${success})`)
  root.style.setProperty('--color2', color2)
  root.style.setProperty('--color3', color3)
  root.style.setProperty('--color4', color4)
  root.style.setProperty('--color5', color5)
  
  // Create dynamic element gradient based on brand colors
  const elementGradient = `linear-gradient(135deg, 
    color-mix(in srgb, ${color1} 20%, #f0f9ff 80%) 0%, 
    color-mix(in srgb, ${color2} 10%, #ecfdf5 90%) 25%, 
    color-mix(in srgb, ${color3} 15%, #f0f9ff 85%) 50%, 
    color-mix(in srgb, ${color1} 25%, #e0f2fe 75%) 75%, 
    #f0f9ff 100%)`
  
  root.style.setProperty('--gradient-element', elementGradient)
  
  // Set additional dynamic gradients
  root.style.setProperty('--gradient-brand', `linear-gradient(135deg, ${color1}, ${color2})`)
  root.style.setProperty('--gradient-brand-reverse', `linear-gradient(135deg, ${color2}, ${color1})`)
  root.style.setProperty('--gradient-brand-multi', `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`)
  
  // Set dynamic box shadows
  root.style.setProperty('--shadow-glow', `0 20px 40px color-mix(in srgb, ${color1} 15%, transparent)`)
  root.style.setProperty('--shadow-glow-brand', `0 20px 40px color-mix(in srgb, ${color2} 15%, transparent)`)
  root.style.setProperty('--shadow-glow-success', `0 20px 40px rgba(${success}, 0.15)`)
  
  console.log('🎨 CSS Variables set from environment:', {
    'Brand Colors': {
      brand1: color1,
      brand2: color2,
      brand3: color3,
      brand4: color4,
      brand5: color5,
    },
    'Semantic Colors': {
      success: success,
      warning: warning,
      error: error,
    },
    'Environment': {
      title: import.meta.env.VITE_APP_TITLE,
      desc: import.meta.env.VITE_APP_DESC,
      url: import.meta.env.VITE_PROJECT_URL,
    }
  })
}

// Set CSS variables on app initialization
setCSSVariables()

// Update document title dynamically
const updateDocumentTitle = () => {
  const appTitle1 = import.meta.env.VITE_APP_TITLE_1
  const appTitle2 = import.meta.env.VITE_APP_TITLE_2
  const appTitle3 = import.meta.env.VITE_APP_TITLE_3
  const fullTitle = import.meta.env.VITE_APP_TITLE
  
  document.title = fullTitle
}

// Update meta tags dynamically
const updateMetaTags = () => {
  const description = import.meta.env.VITE_APP_DESC
  const title = import.meta.env.VITE_APP_TITLE
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