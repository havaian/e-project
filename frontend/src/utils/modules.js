// frontend/src/utils/modules.js - Simple helper functions

// Check if achievements module is enabled
export const isAchievementsEnabled = () => {
  return import.meta.env.VITE_MODULE_ACHIEVEMENTS_ENABLED === 'true' // Default false
}

// Check if group consultations module is enabled
export const isGroupConsultationsEnabled = () => {
  return import.meta.env.VITE_MODULE_GROUP_CONSULTATIONS_ENABLED === 'true' // Default false
}

// Check if monthly payments module is enabled  
export const isMonthlyPaymentsEnabled = () => {
  return import.meta.env.VITE_MODULE_MONTHLY_PAYMENTS_ENABLED === 'true' // Default false
}

// Get business model (both C2C and B2B always available)
export const getBusinessModel = () => {
  return 'hybrid' // Both C2C and B2B always available
}

// Check if user should see organization features (always true now)
export const shouldShowOrganizationFeatures = () => {
  return true // B2B features always available
}

// Check if consultations module is enabled (defaults to true)
export const isConsultationsEnabled = () => {
  return import.meta.env.VITE_MODULE_CONSULTATIONS_ENABLED !== 'false'
}

// Check if courses module is enabled (defaults to true)
export const isCoursesEnabled = () => {
  return import.meta.env.VITE_MODULE_COURSES_ENABLED !== 'false'
}

// Check if chat is available (at least one core module must be on)
export const isChatEnabled = () => {
  return isConsultationsEnabled() || isCoursesEnabled()
}

export const isReviewsConsultationsEnabled = () => {
    return import.meta.env.VITE_MODULE_REVIEWS_CONSULTATIONS_ENABLED !== 'false'
}
export const isReviewsCoursesEnabled = () => {
    return import.meta.env.VITE_MODULE_REVIEWS_COURSES_ENABLED !== 'false'
}
export const isReviewsBidirectionalEnabled = () => {
    return import.meta.env.VITE_MODULE_REVIEWS_BIDIRECTIONAL_ENABLED === 'true'
}