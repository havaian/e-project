// frontend/src/utils/modules.js - Simple helper functions

// Check if achievements module is enabled
export const isAchievementsEnabled = () => {
  console.log(import.meta.env.VITE_MODULE_ACHIEVEMENTS_ENABLED)
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