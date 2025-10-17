import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'

// Safe JSON parse helper function
function safeJsonParse(jsonString, fallback = null) {
  try {
    if (!jsonString || jsonString === 'undefined' || jsonString === 'null') {
      return fallback
    }
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Error parsing JSON:', error, 'String was:', jsonString)
    return fallback
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Safe initialization from localStorage
  const user = ref(safeJsonParse(localStorage.getItem('user'), null))
  const token = ref(localStorage.getItem('token') || null)
  const needsOnboarding = ref(safeJsonParse(localStorage.getItem('needsOnboarding'), false))
  const profileCompletion = ref(safeJsonParse(localStorage.getItem('profileCompletion'), {
    percentage: 0,
    isComplete: false,
    currentStep: 0
  }))

  // Set axios header if token exists during initialization
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Add timestamp tracking to prevent excessive API calls
  const lastProfileCompletionCheck = ref(0)
  const lastUserDataRefresh = ref(0)
  const PROFILE_COMPLETION_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const USER_DATA_CACHE_DURATION = 2 * 60 * 1000 // 2 minutes

  // Track pending requests to prevent duplicates
  const pendingProfileCompletionRequest = ref(false)
  const pendingUserDataRequest = ref(false)

  // Computed properties
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })

  const isProvider = computed(() => {
    return user.value?.role === 'provider'
  })

  const isClient = computed(() => {
    return user.value?.role === 'client'
  })

  const isProviderOnboardingComplete = computed(() => !needsOnboarding.value)
  const currentOnboardingStep = computed(() => profileCompletion.value?.currentStep || 0)

  async function login(email, password) {
    try {
      const credentials = { email, password }
      const response = await axios.post('/users/login', credentials)

      user.value = response.data.user
      token.value = response.data.token

      localStorage.setItem('user', JSON.stringify(user.value))
      localStorage.setItem('token', token.value)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

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

      // For registration, we only get a success message, not user data or token
      // The user needs to verify their email first before they can log in

      return {
        success: response.data.success || true,
        message: response.data.message || 'Registration successful',
        needsOnboarding: response.data.needsOnboarding || false
      }
    } catch (error) {
      console.error('Registration error:', error)

      // Extract error message from different possible error structures
      let errorMessage = 'Failed to create account'

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data) {
        // Handle case where response.data is a string
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else {
          errorMessage = error.response.data.message || 'Registration failed'
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      throw new Error(errorMessage)
    }
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

    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('needsOnboarding')
    localStorage.removeItem('profileCompletion')

    delete axios.defaults.headers.common['Authorization']
  }

  function getPostLoginRedirect() {
    if (isProvider.value && needsOnboarding.value) {
      return '/provider/onboarding'
    } else if (isProvider.value) {
      return '/provider/dashboard'
    } else {
      return '/client/dashboard'
    }
  }

  // Add caching and duplicate request prevention
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

  function updateOnboardingStep(step) {
    if (profileCompletion.value) {
      profileCompletion.value.currentStep = step
      localStorage.setItem('profileCompletion', JSON.stringify(profileCompletion.value))
    }
  }

  // Add caching and duplicate request prevention
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