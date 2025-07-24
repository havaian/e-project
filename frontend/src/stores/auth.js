import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'

export const useAuthStore = defineStore('auth', () => {
  // Initialize state from localStorage
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token'))

  // NEW: Provider onboarding state
  const needsOnboarding = ref(JSON.parse(localStorage.getItem('needsOnboarding')) || false)
  const profileCompletion = ref(JSON.parse(localStorage.getItem('profileCompletion')) || {
    percentage: 0,
    isComplete: false,
    currentStep: 0
  })

  const isAuthenticated = computed(() => !!token.value)
  const isProvider = computed(() => user.value?.role === 'provider')
  const isClient = computed(() => user.value?.role === 'client')

  // NEW: Computed properties for provider onboarding
  const isProviderOnboardingComplete = computed(() => {
    return !isProvider.value || !needsOnboarding.value || profileCompletion.value.isComplete
  })

  const currentOnboardingStep = computed(() => {
    return profileCompletion.value.currentStep || 0
  })

  async function login(email, password) {
    try {
      const response = await axios.post('/users/login', { email, password })
      token.value = response.data.token
      user.value = response.data.user

      console.log(response.data);

      // Persist to localStorage
      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      // NEW: Handle provider onboarding data
      if (response.data.needsOnboarding !== undefined) {
        needsOnboarding.value = response.data.needsOnboarding
        localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))
      }

      if (response.data.profileCompletion) {
        profileCompletion.value = response.data.profileCompletion
        localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  async function register(userData) {
    try {
      const response = await axios.post('/users/register', userData)

      // NEW: Handle provider onboarding data from registration
      if (response.data.user?.needsOnboarding !== undefined) {
        needsOnboarding.value = response.data.user.needsOnboarding
        localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))
      }

      if (response.data.user?.profileCompletion) {
        profileCompletion.value = response.data.user.profileCompletion
        localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // NEW: Update profile completion status
  async function updateProfileCompletion() {
    try {
      if (!isProvider.value) return

      const response = await axios.get('/users/providers/profile/completion-status')

      if (response.data.completionStatus) {
        profileCompletion.value = {
          percentage: response.data.completionStatus.percentage,
          isComplete: response.data.completionStatus.isComplete,
          currentStep: response.data.completionStatus.currentStep
        }
        needsOnboarding.value = response.data.completionStatus.needsOnboarding

        localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
        localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))
      }
    } catch (error) {
      console.error('Error updating profile completion:', error)
    }
  }

  // NEW: Update onboarding step
  async function updateOnboardingStep(step) {
    try {
      const response = await axios.patch('/users/providers/profile/setup-step', { step })

      profileCompletion.value.currentStep = step

      if (response.data.onboardingCompleted) {
        needsOnboarding.value = false
        profileCompletion.value.isComplete = true
      }

      localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
      localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))

      return response.data
    } catch (error) {
      console.error('Error updating onboarding step:', error)
      throw error
    }
  }

  // NEW: Get redirect path after login
  function getPostLoginRedirect() {
    if (!isProvider.value) {
      return '/' // Clients go to home
    }

    if (needsOnboarding.value) {
      return '/profile/provider/onboarding' // Incomplete providers go to onboarding
    }

    return '/profile/provider' // Complete providers go to dashboard
  }

  function logout() {
    user.value = null
    token.value = null
    needsOnboarding.value = false
    profileCompletion.value = {
      percentage: 0,
      isComplete: false,
      currentStep: 0
    }

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('needsOnboarding')
    localStorage.removeItem('profileCompletion')
  }

  // NEW: Check if current user data is stale and refresh if needed
  async function refreshUserData() {
    try {
      if (!isAuthenticated.value) return

      const response = await axios.get('/users/me')

      if (response.data) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(user.value))

        if (response.data.needsOnboarding !== undefined) {
          needsOnboarding.value = response.data.needsOnboarding
          localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))
        }

        if (response.data.profileCompletion) {
          profileCompletion.value = response.data.profileCompletion
          localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout()
      }
    }
  }

  return {
    user,
    token,
    needsOnboarding,
    profileCompletion,
    isAuthenticated,
    isProvider,
    isClient,
    isProviderOnboardingComplete,
    currentOnboardingStep,
    login,
    register,
    logout,
    updateProfileCompletion,
    updateOnboardingStep,
    getPostLoginRedirect,
    refreshUserData
  }
})