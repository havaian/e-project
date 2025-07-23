// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

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
  
  // Debug log to see what we're getting
  console.log('Environment variables loaded:', {
    color1, color2, color3, color4, color5, success, warning, error
  })
  
  // Debug title/description vars
  console.log('Title/Description vars:', {
    title: import.meta.env.VITE_APP_PAGE_TITLE,
    description: import.meta.env.VITE_APP_PAGE_DESC,
    projectUrl: import.meta.env.VITE_PROJECT_URL
  })
  
  // Set brand color variables (only if they exist)
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
  if (color1) root.style.setProperty('--color1', color1)
  if (color2) root.style.setProperty('--color2', color2)
  if (color3) root.style.setProperty('--color3', color3)
  if (color4) root.style.setProperty('--color4', color4)
  if (color5) root.style.setProperty('--color5', color5)
  
  // Handle success color properly (comma-separated RGB values)
  if (success) {
    // If it contains commas, it's already in the right format
    if (success.includes(',')) {
      root.style.setProperty('--success', `rgb(${success})`)
    } else {
      // If it's space-separated, convert to comma-separated
      const rgbValues = success.trim().split(/\s+/).join(',')
      root.style.setProperty('--success', `rgb(${rgbValues})`)
    }
  }
  
  // Only create gradients if we have the required colors
  if (color1 && color2 && color3) {
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
  }
  
  // Set dynamic box shadows only if colors exist
  if (color1) {
    root.style.setProperty('--shadow-glow', `0 20px 40px color-mix(in srgb, ${color1} 15%, transparent)`)
  }
  if (color2) {
    root.style.setProperty('--shadow-glow-brand', `0 20px 40px color-mix(in srgb, ${color2} 15%, transparent)`)
  }
  if (success) {
    // Handle success shadow with proper RGB format
    const successRgb = success.includes(',') ? success : success.trim().split(/\s+/).join(',')
    root.style.setProperty('--shadow-glow-success', `0 20px 40px rgba(${successRgb}, 0.15)`)
  }
  
  // Log final CSS variables for debugging
  console.log('CSS variables set:', {
    '--color-brand-1': root.style.getPropertyValue('--color-brand-1'),
    '--color-brand-2': root.style.getPropertyValue('--color-brand-2'),
    '--color-brand-3': root.style.getPropertyValue('--color-brand-3'),
    '--success': root.style.getPropertyValue('--success')
  })
}

// Set CSS variables on app initialization
setCSSVariables()

// Update document title dynamically
const updateDocumentTitle = () => {
  const fullTitle = import.meta.env.VITE_APP_PAGE_TITLE
  
  if (fullTitle) {
    document.title = fullTitle
  }
}

// Update meta tags dynamically
const updateMetaTags = () => {
  const description = import.meta.env.VITE_APP_PAGE_DESC
  const title = import.meta.env.VITE_APP_PAGE_TITLE
  const url = import.meta.env.VITE_PROJECT_URL
  
  // Update or create meta description
  if (description) {
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', description)
  }
  
  // Update Open Graph tags
  const updateOrCreateMeta = (selector, content) => {
    if (!content) return
    
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