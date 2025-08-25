// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)
  const needsOnboarding = ref(JSON.parse(localStorage.getItem('needsOnboarding')) || false)
  const profileCompletion = ref(JSON.parse(localStorage.getItem('profileCompletion')) || {
    percentage: 0,
    isComplete: false,
    currentStep: 0
  })

  // NEW: Add timestamp tracking to prevent excessive API calls
  const lastProfileCompletionCheck = ref(0)
  const lastUserDataRefresh = ref(0)
  const PROFILE_COMPLETION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const USER_DATA_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
  
  // NEW: Track pending requests to prevent duplicates
  const pendingProfileCompletionRequest = ref(false)
  const pendingUserDataRequest = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isProvider = computed(() => user.value?.role === 'provider')
  const isClient = computed(() => user.value?.role === 'client')
  const isProviderOnboardingComplete = computed(() => !needsOnboarding.value)
  const currentOnboardingStep = computed(() => profileCompletion.value?.currentStep || 0)

  // Set axios default auth header
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  async function login(email, password) {
    try {
      const credentials = { email, password }
      const response = await axios.post('/users/login', credentials)

      user.value = response.data.user
      token.value = response.data.token

      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      if (response.data.user.needsOnboarding !== undefined) {
        needsOnboarding.value = response.data.user.needsOnboarding
        localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))
      }

      if (response.data.user.profileCompletion) {
        profileCompletion.value = response.data.user.profileCompletion
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

      user.value = response.data.user
      token.value = response.data.token

      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      if (response.data.user.profileCompletion) {
        profileCompletion.value = response.data.user.profileCompletion
        localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
      }

      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }

  // FIXED: Add caching and duplicate request prevention
  async function updateProfileCompletion(forceRefresh = false) {
    try {
      if (!isProvider.value) return

      const now = Date.now()
      
      // Skip if recently checked and not forcing refresh
      if (!forceRefresh && (now - lastProfileCompletionCheck.value) < PROFILE_COMPLETION_CACHE_DURATION) {
        return
      }

      // Skip if request already pending
      if (pendingProfileCompletionRequest.value) {
        return
      }

      pendingProfileCompletionRequest.value = true
      lastProfileCompletionCheck.value = now

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
    } finally {
      pendingProfileCompletionRequest.value = false
    }
  }

  async function updateOnboardingStep(step) {
    try {
      const response = await axios.patch('/users/providers/profile/setup-step', { step })

      profileCompletion.value.currentStep = step

      if (response.data.onboardingCompleted) {
        needsOnboarding.value = false
        profileCompletion.value.isComplete = true
        // Force refresh next time since completion status changed significantly
        lastProfileCompletionCheck.value = 0
      }

      localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
      localStorage.setItem('needsOnboarding', JSON.stringify(needsOnboarding.value))

      return response.data
    } catch (error) {
      console.error('Error updating onboarding step:', error)
      throw error
    }
  }

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

    // Reset cache timestamps
    lastProfileCompletionCheck.value = 0
    lastUserDataRefresh.value = 0

    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('needsOnboarding')
    localStorage.removeItem('profileCompletion')
    
    delete axios.defaults.headers.common['Authorization']
  }

  // FIXED: Add caching and duplicate request prevention
  async function refreshUserData(forceRefresh = false) {
    try {
      if (!isAuthenticated.value) return

      const now = Date.now()

      // Skip if recently refreshed and not forcing
      if (!forceRefresh && (now - lastUserDataRefresh.value) < USER_DATA_CACHE_DURATION) {
        return
      }

      // Skip if request already pending
      if (pendingUserDataRequest.value) {
        return
      }

      pendingUserDataRequest.value = true
      lastUserDataRefresh.value = now

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
          // Update the profile completion cache timestamp since we got fresh data
          lastProfileCompletionCheck.value = now
        }
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      // If token is invalid, logout
      if (error.response?.status === 401) {
        logout()
      }
    } finally {
      pendingUserDataRequest.value = false
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