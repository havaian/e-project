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

    // Unified Dashboard route (role-based component loading)
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/shared/UnifiedDashboard.vue'),
      meta: {
        requiresAuth: true
      }
    },

    // Unified Profile routes (role-based component loading)
    {
      path: '/profile/me',
      name: 'my-profile',
      component: () => import('@/views/shared/UnifiedProfile.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/profile/me/onboarding',
      name: 'my-profile-onboarding',
      component: () => import('@/views/profile/ProviderOnboarding.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true,
        hideNavBar: true,
        hideFooter: true
      }
    },
    {
      path: '/profile/me/dashboard',
      name: 'my-profile-dashboard',
      component: () => import('@/views/dashboard/ProviderDashboard.vue'),
      meta: {
        requiresAuth: true,
        requiresProvider: true
      }
    },
    {
      path: '/profile/me/edit',
      name: 'my-profile-edit',
      component: () => import('@/views/profile/EditProfile.vue'),
      meta: {
        requiresAuth: true
      }
    },

    // Unified Appointments route (role-based component loading)
    {
      path: '/appointments/me',
      name: 'my-appointments',
      component: () => import('@/views/shared/UnifiedAppointments.vue'),
      meta: {
        requiresAuth: true
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
      path: '/clients/:id',
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
      path: '/appointments/:id',
      name: 'appointment-details',
      component: () => import('@/views/appointments/AppointmentDetails.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/appointments/:id/edit',
      name: 'appointment-edit',
      component: () => import('@/views/appointments/EditAppointment.vue'),
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/appointments/:id/reschedule',
      name: 'appointment-reschedule',
      component: () => import('@/views/appointments/RescheduleAppointment.vue'),
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

    // ── Course routes
    {
      path: '/courses',
      name: 'course-catalog',
      component: () => import('@/views/courses/client/CourseCatalog.vue')
      // public — no auth required
    },
    {
      path: '/courses/dashboard',
      name: 'course-dashboard',
      component: () => import('@/views/courses/provider/CourseDashboard.vue'),
      meta: { requiresAuth: true, requiresProvider: true }
    },
    {
      path: '/courses/my',
      name: 'course-portfolio',
      component: () => import('@/views/courses/provider/CoursePortfolio.vue'),
      meta: { requiresAuth: true, requiresProvider: true }
    },
    {
      path: '/courses/homework',
      name: 'grading-center',
      component: () => import('@/views/courses/provider/GradingCenter.vue'),
      meta: { requiresAuth: true, requiresProvider: true }
    },
    {
      path: '/courses/my-learning',
      name: 'my-learning',
      component: () => import('@/views/courses/client/MyLearning.vue'),
      meta: { requiresAuth: true, requiresClient: true }
    },
    {
      path: '/courses/payment/success',
      name: 'course-payment-success',
      component: () => import('@/views/courses/CoursePaymentSuccess.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/:id/builder',
      name: 'course-builder',
      component: () => import('@/views/courses/provider/CourseBuilder.vue'),
      meta: { requiresAuth: true, requiresProvider: true }
    },
    {
      path: '/courses/:id/learn',
      name: 'course-learn',
      component: () => import('@/views/courses/client/CourseLearn.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/:id/lesson/:lessonId',
      name: 'lesson-viewer',
      component: () => import('@/views/courses/client/LessonViewer.vue'),
      meta: { requiresAuth: true, hideNavBar: true, hideFooter: true }
    },
    {
      path: '/courses/:id',
      name: 'course-detail',
      component: () => import('@/views/courses/client/CourseDetail.vue')
      // public — handles auth check internally for enroll button
    },

    // Error routes
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Enhanced navigation guards with role-based routing logic
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Basic authentication check
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    // Redirect authenticated users to their appropriate dashboard
    if (authStore.isClient) {
      next('/dashboard')
    } else if (authStore.isProvider) {
      if (authStore.needsOnboarding) {
        next('/profile/me/onboarding')
      } else {
        next('/profile/me/dashboard')
      }
    } else {
      next('/')
    }
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
      to.path.includes('/profile/me')

    if (needsProfileCheck) {
      // Don't force refresh on every navigation, use cache
      await authStore.updateProfileCompletion(false)

      // Check if provider needs onboarding and is trying to access complete-profile routes
      if (to.meta.requiresCompleteProfile && authStore.needsOnboarding) {
        next('/profile/me/onboarding')
        return
      }

      // Check if provider is complete and trying to access onboarding
      if (to.meta.requiresIncompleteProfile && !authStore.needsOnboarding) {
        next('/profile/me')
        return
      }
    }
  }
  next()
})

// Much more selective user data refresh
router.afterEach((to, from) => {
  const authStore = useAuthStore()

  // Only refresh user data when navigating to critical pages and it's actually needed
  if (authStore.isAuthenticated) {
    // Only refresh on specific high-priority pages, not every navigation
    const criticalPages = [
      '/profile/me/edit',
      '/profile/me/onboarding'
    ]

    // Force refresh only when completing onboarding or editing profile
    const shouldForceRefresh =
      to.path === '/profile/me' && from.path === '/profile/me/onboarding'

    if (criticalPages.some(page => to.path.includes(page)) || shouldForceRefresh) {
      authStore.refreshUserData(shouldForceRefresh)
    }
  }
})

export default router