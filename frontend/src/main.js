// frontend/src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Helper function to convert hex to RGB
function hexToRgb(hex) {
  if (!hex) return null
  // Remove # if present
  hex = hex.replace('#', '')
  // Parse hex values
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  return `${r} ${g} ${b}`
}

// Helper function to convert comma-separated RGB to space-separated
function commaToSpaceRgb(rgb) {
  if (!rgb) return null
  return rgb.replace(/,/g, ' ').trim()
}

// Set CSS custom properties from environment variables
function setCSSVariables() {
  const root = document.documentElement
  
  // Get all color environment variables
  const color1 = import.meta.env.VITE_COLOR_1
  const color2 = import.meta.env.VITE_COLOR_2
  const color3 = import.meta.env.VITE_COLOR_3
  const color4 = import.meta.env.VITE_COLOR_4
  const color5 = import.meta.env.VITE_COLOR_5
  const color6 = import.meta.env.VITE_COLOR_6
  const success = import.meta.env.VITE_COLOR_SUCCESS
  const warning = import.meta.env.VITE_COLOR_WARNING
  const error = import.meta.env.VITE_COLOR_ERROR
  
  // Get gradient background colors from environment (use main colors as defaults)
  const gradientBg1 = import.meta.env.VITE_GRADIENT_BG_1 || color4
  const gradientBg2 = import.meta.env.VITE_GRADIENT_BG_2 || color5
  const gradientBg3 = import.meta.env.VITE_GRADIENT_BG_3 || color4
  const gradientBg4 = import.meta.env.VITE_GRADIENT_BG_4 || color4
  const gradientBg5 = import.meta.env.VITE_GRADIENT_BG_5 || color5
  const gradientBg6 = import.meta.env.VITE_GRADIENT_BG_6 || color6
  
  // Get gradient percentages from environment
  const gradientPercent1 = import.meta.env.VITE_GRADIENT_PERCENT_1 || '20%'
  const gradientPercent2 = import.meta.env.VITE_GRADIENT_PERCENT_2 || '10%'
  const gradientPercent3 = import.meta.env.VITE_GRADIENT_PERCENT_3 || '15%'
  const gradientPercent4 = import.meta.env.VITE_GRADIENT_PERCENT_4 || '25%'
  
  // Get shadow opacity from environment
  const shadowOpacity = import.meta.env.VITE_SHADOW_OPACITY || '15%'
  const shadowBlur = import.meta.env.VITE_SHADOW_BLUR || '20px'
  const shadowSpread = import.meta.env.VITE_SHADOW_SPREAD || '40px'
  
  // Convert hex colors to RGB format for Tailwind
  const color1Rgb = hexToRgb(color1)
  const color2Rgb = hexToRgb(color2)
  const color3Rgb = hexToRgb(color3)
  const color4Rgb = hexToRgb(color4)
  const color5Rgb = hexToRgb(color5)
  const color6Rgb = hexToRgb(color6)
  
  // Convert comma-separated RGB to space-separated for CSS
  const successRgb = commaToSpaceRgb(success)
  const warningRgb = commaToSpaceRgb(warning)
  const errorRgb = commaToSpaceRgb(error)
  
  // Debug logging
  console.log('Environment variables loaded:', {
    color1, color2, color3, color4, color5, success, warning, error
  })
  
  console.log('RGB converted colors:', {
    color1Rgb, color2Rgb, color3Rgb, color4Rgb, color5Rgb,
    successRgb, warningRgb, errorRgb
  })
  
  // Set brand color variables (hex format for direct CSS use)
  if (color1) root.style.setProperty('--color-brand-1', color1)
  if (color2) root.style.setProperty('--color-brand-2', color2)
  if (color3) root.style.setProperty('--color-brand-3', color3)
  if (color4) root.style.setProperty('--color-brand-4', color4)
  if (color5) root.style.setProperty('--color-brand-5', color5)
  if (color6) root.style.setProperty('--color-brand-5', color6)
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
  if (color6) root.style.setProperty('--color5', color6)
  
  // Set RGB versions for Tailwind classes (space-separated)
  if (color1Rgb) root.style.setProperty('--color1-rgb', color1Rgb)
  if (color2Rgb) root.style.setProperty('--color2-rgb', color2Rgb)
  if (color3Rgb) root.style.setProperty('--color3-rgb', color3Rgb)
  if (color4Rgb) root.style.setProperty('--color4-rgb', color4Rgb)
  if (color5Rgb) root.style.setProperty('--color5-rgb', color5Rgb)
  if (color6Rgb) root.style.setProperty('--color6-rgb', color6Rgb)
  
  // Set RGB variables for brand colors (same as color1-5 but with brand naming)
  if (color1Rgb) root.style.setProperty('--color-brand-1-rgb', color1Rgb)
  if (color2Rgb) root.style.setProperty('--color-brand-2-rgb', color2Rgb)
  if (color3Rgb) root.style.setProperty('--color-brand-3-rgb', color3Rgb)
  if (color4Rgb) root.style.setProperty('--color-brand-4-rgb', color4Rgb)
  if (color5Rgb) root.style.setProperty('--color-brand-5-rgb', color5Rgb)
  if (color6Rgb) root.style.setProperty('--color-brand-6-rgb', color6Rgb)
  
  // Set semantic color RGB variables
  if (successRgb) root.style.setProperty('--color-success-rgb', successRgb)
  if (warningRgb) root.style.setProperty('--color-warning-rgb', warningRgb)
  if (errorRgb) root.style.setProperty('--color-error-rgb', errorRgb)
  
  // Handle success color properly (comma-separated RGB values for legacy support)
  if (success) {
    if (success.includes(',')) {
      root.style.setProperty('--success', `rgb(${success})`)
    } else {
      const rgbValues = success.trim().split(/\s+/).join(',')
      root.style.setProperty('--success', `rgb(${rgbValues})`)
    }
  }
  
  // Create dynamic element gradient based on environment variables
  if (color1 && color2 && color3) {
    const elementGradient = `linear-gradient(135deg, 
      color-mix(in srgb, ${color1} ${gradientPercent1}, ${gradientBg1} ${100 - parseInt(gradientPercent1)}%) 0%, 
      color-mix(in srgb, ${color2} ${gradientPercent2}, ${gradientBg2} ${100 - parseInt(gradientPercent2)}%) 25%, 
      color-mix(in srgb, ${color3} ${gradientPercent3}, ${gradientBg3} ${100 - parseInt(gradientPercent3)}%) 50%, 
      color-mix(in srgb, ${color1} ${gradientPercent4}, ${gradientBg4} ${100 - parseInt(gradientPercent4)}%) 75%, 
      ${gradientBg5} 100%)`
    
    root.style.setProperty('--gradient-element', elementGradient)
    
    // Set additional dynamic gradients
    root.style.setProperty('--gradient-brand', `linear-gradient(135deg, ${color1}, ${color2})`)
    root.style.setProperty('--gradient-brand-reverse', `linear-gradient(135deg, ${color2}, ${color1})`)
    root.style.setProperty('--gradient-brand-multi', `linear-gradient(135deg, ${color1}, ${color2}, ${color3})`)
  }
  
  // Set dynamic box shadows using environment variables
  if (color1) {
    root.style.setProperty('--shadow-glow', `0 ${shadowBlur} ${shadowSpread} color-mix(in srgb, ${color1} ${shadowOpacity}, transparent)`)
  }
  if (color2) {
    root.style.setProperty('--shadow-glow-brand', `0 ${shadowBlur} ${shadowSpread} color-mix(in srgb, ${color2} ${shadowOpacity}, transparent)`)
  }
  if (success) {
    const successRgbComma = success.includes(',') ? success : success.trim().split(/\s+/).join(',')
    root.style.setProperty('--shadow-glow-success', `0 ${shadowBlur} ${shadowSpread} rgba(${successRgbComma}, ${parseFloat(shadowOpacity) / 100})`)
  }
  
  // Log final CSS variables for debugging
  console.log('CSS variables set:', {
    '--color-brand-1': root.style.getPropertyValue('--color-brand-1'),
    '--color-brand-2': root.style.getPropertyValue('--color-brand-2'),
    '--color-brand-3': root.style.getPropertyValue('--color-brand-3'),
    '--color1-rgb': root.style.getPropertyValue('--color1-rgb'),
    '--color2-rgb': root.style.getPropertyValue('--color2-rgb'),
    '--color3-rgb': root.style.getPropertyValue('--color3-rgb'),
    '--color-success-rgb': root.style.getPropertyValue('--color-success-rgb'),
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