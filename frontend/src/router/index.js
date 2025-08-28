import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    // Auth routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/verify-email/:token',
      name: 'verify-email',
      component: () => import('@/views/auth/VerifyEmail.vue'),
      meta: {
        requiresGuest: true
      }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/auth/ForgotPassword.vue')
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: () => import('@/views/auth/ResetPassword.vue')
    },

    // Profile routes
    {
      path: '/profile/client',
      name: 'client-profile',
      component: () => import('@/views/profile/ClientProfile.vue'),
      meta: {
        requiresAuth: true,
        requiresClient: true
      }
    },
    {
      path: '/profile/provider',
      name: 'provider-profile',
      component: () => import('@/views/profile/ProviderProfile.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresCompleteProfile: true
      }
    },

    // Provider onboarding routes
    {
      path: '/profile/provider/onboarding',
      name: 'provider-onboarding',
      component: () => import('@/views/profile/ProviderOnboarding.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresIncompleteProfile: true,
        hideNavBar: true,
        hideFooter: true
      }
    },

    // Provider dashboard with earnings
    {
      path: '/profile/provider/dashboard',
      name: 'provider-dashboard',
      component: () => import('@/views/profile/ProviderDashboard.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresCompleteProfile: true
      }
    },

    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: () => import('@/views/profile/EditProfile.vue'),
      meta: {
        requiresAuth: true
      },
      beforeEnter: async (to, from, next) => {
        const authStore = useAuthStore()

        if (!authStore.isAuthenticated) {
          next('/login')
          return
        }

        // Force refresh user data when entering edit profile from any route
        if (from.path !== '/login' && from.path !== '/register') {
          try {
            await authStore.refreshUserData(true)
          } catch (error) {
            console.error('Error refreshing user data before edit:', error)
          }
        }

        next()
      }
    },

    // Provider routes
    {
      path: '/providers',
      name: 'provider-list',
      component: () => import('@/views/providers/ProviderList.vue')
    },
    {
      path: '/providers/:id',
      name: 'provider-profile-view',
      component: () => import('@/views/providers/ProviderPublicProfile.vue')
    },

    // Client routes
    {
      path: '/clientss/:id',
      name: 'client-profile-view',
      component: () => import('@/views/clients/ClientPublicProfile.vue')
    },

    // Appointment routes
    {
      path: '/appointments/book/:providerId',
      name: 'book-appointment',
      component: () => import('@/views/appointments/BookAppointment.vue'),
      meta: {
        requiresAuth: true,
        requiresClient: true
      }
    },
    {
      path: '/appointments/client',
      name: 'client-appointments',
      component: () => import('@/views/appointments/ClientAppointments.vue'),
      meta: {
        requiresAuth: true,
        requiresClient: true
      }
    },
    {
      path: '/appointments/provider',
      name: 'provider-appointments',
      component: () => import('@/views/appointments/ProviderAppointments.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        requiresCompleteProfile: true
      }
    },
    {
      path: '/appointments/:id',
      name: 'appointment-details',
      component: () => import('@/views/appointments/AppointmentDetails.vue'),
      meta: {
        requiresAuth: true
      }
    },

    // Payment routes
    {
      path: '/payment/success',
      name: 'payment-success',
      component: () => import('@/views/payments/PaymentSuccess.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/payment/cancel',
      name: 'payment-cancel',
      component: () => import('@/views/payments/PaymentCancel.vue'),
      meta: {
        requiresAuth: true
      }
    },

    // Chat routes
    {
      path: '/chat',
      name: 'chat-inbox',
      component: () => import('@/views/chat/ChatInbox.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/:id',
      name: 'chat-conversation',
      component: () => import('@/views/chat/ChatConversation.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/chat/new/:userId',
      name: 'chat-new',
      component: () => import('@/views/chat/ChatConversation.vue'),
      meta: {
        requiresAuth: true
      }
    },

    // Session routes
    {
      path: '/session/:appointmentId',
      name: 'session-room',
      component: () => import('@/views/sessions/SessionRoom.vue'),
      meta: {
        requiresAuth: true,
        hideNavBar: true,
        hideFooter: true
      }
    },

    // Legal and Compliance Routes
    {
      path: '/privacy',
      name: 'privacy-policy',
      component: () => import('@/views/legal/PrivacyPolicy.vue')
    },
    {
      path: '/public-offer',
      name: 'public-offer',
      component: () => import('@/views/legal/PublicOffer.vue')
    },

    // Support Routes
    {
      path: '/accessibility',
      name: 'accessibility',
      component: () => import('@/views/support/Accessibility.vue')
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/support/Contact.vue')
    },
    {
      path: '/help',
      name: 'help-center',
      component: () => import('@/views/support/HelpCenter.vue')
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('@/views/support/FAQ.vue')
    },

    // Company Routes
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/company/About.vue')
    },

    // Error routes
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Enhanced navigation guards with reduced API calls
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Basic authentication check
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
    return
  }

  // Role-based access control
  if (to.meta.requiresClient && !authStore.isClient) {
    next('/')
    return
  }

  if (to.meta.requiresProvider && !authStore.isProvider) {
    next('/')
    return
  }

  // Only check profile completion for specific routes that actually need it
  if (authStore.isProvider && authStore.isAuthenticated) {
    // Only check profile completion when navigating to routes that require it
    const needsProfileCheck =
      to.meta.requiresCompleteProfile ||
      to.meta.requiresIncompleteProfile ||
      to.path.includes('/profile/provider')

    if (needsProfileCheck) {
      // Don't force refresh on every navigation, use cache
      await authStore.updateProfileCompletion(false)

      // Check if provider needs onboarding and is trying to access complete-profile routes
      if (to.meta.requiresCompleteProfile && authStore.needsOnboarding) {
        next('/profile/provider/onboarding')
        return
      }

      // Check if provider is complete and trying to access onboarding
      if (to.meta.requiresIncompleteProfile && !authStore.needsOnboarding) {
        next('/profile/provider')
        return
      }
    }
  }

  next()
})

// Much more selective user data refresh
router.afterEach((to, from) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    const criticalPages = [
      '/profile/edit',
      '/profile/provider/onboarding'
    ]
    
    // Force refresh when navigating TO edit profile from provider profile
    const shouldForceRefresh = 
      to.path === '/profile/provider' && from.path === '/profile/provider/onboarding' ||
      to.path === '/profile/edit' && from.path.includes('/profile/provider') ||
      to.path.includes('/profile/provider') && from.path === '/profile/edit'

    if (criticalPages.some(page => to.path.includes(page)) || shouldForceRefresh) {
      authStore.refreshUserData(shouldForceRefresh)
    }
  }
})

export default router