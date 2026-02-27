<!-- frontend/src/views/profile/ClientProfile.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Profile Header -->
      <div class="p-6 sm:p-8 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row items-center justify-between">
          <div class="flex flex-col sm:flex-row items-center">
            <img :src="user?.profilePicture ? `/api${user.profilePicture}` : '/images/user-placeholder.jpg'"
              :alt="user?.firstName || 'User'" class="h-32 w-32 rounded-full object-cover" />
            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 class="text-2xl font-bold text-gray-900">
                {{ user?.firstName || '' }} {{ user?.lastName || '' }}
              </h1>
              <p class="text-gray-600">{{ $t('clientProfile.roleClient') }}</p>
              <div class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <UserIcon class="w-4 h-4 mr-1" />
                  {{ $t('clientProfile.completedSessions', { count: completedAppointments }) }}
                </span>
                <span v-if="isVerified"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon class="w-4 h-4 mr-1" />
                  {{ $t('clientProfile.verifiedAccount') }}
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4 sm:mt-0">
            <router-link to="/profile/me/edit"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <PencilIcon class="w-4 h-4 mr-2" />
              {{ $t('clientProfile.editProfile') }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="p-6 sm:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-8">

            <!-- Personal information -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UserIcon class="w-5 h-5 mr-2 text-indigo-600" />
                {{ $t('clientProfile.personalInfo') }}
              </h2>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('clientProfile.email') }}</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.email || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('clientProfile.phone') }}</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.phone || 'N/A' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('clientProfile.memberSince') }}</dt>
                  <dd class="mt-1 text-gray-900">{{ formatDate(user?.createdAt) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">{{ $t('clientProfile.interfaceLanguage') }}</dt>
                  <dd class="mt-1 text-gray-900">{{ getLocaleName(user?.preferences?.language) }}</dd>
                </div>
              </dl>
            </div>

            <!-- Associated providers -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <UsersIcon class="w-5 h-5 mr-2 text-blue-600" />
                {{ $t('clientProfile.associatedProviders') }}
              </h2>
              <div v-if="associatedProviders.length > 0" class="space-y-4">
                <div v-for="provider in associatedProviders" :key="provider._id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <img
                      :src="provider?.profilePicture ? `/api${provider.profilePicture}` : '/images/user-placeholder.jpg'"
                      :alt="provider?.firstName || 'Provider'" class="h-12 w-12 rounded-full object-cover">
                    <div>
                      <p class="font-medium text-gray-900">{{ provider?.firstName || '' }} {{ provider?.lastName || ''
                      }}</p>
                      <p class="text-sm text-gray-600">
                        {{ provider?.specializations?.join(', ') || $t('clientProfile.noSpecializations') }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ $t('clientProfile.sessionCount', { count: provider.appointmentCount }) }}
                      </p>
                    </div>
                  </div>
                  <router-link :to="`/providers/${provider._id}`"
                    class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    {{ $t('clientProfile.viewProfile') }}
                  </router-link>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <UsersIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">{{ $t('clientProfile.noProviders') }}</p>
                <router-link to="/providers"
                  class="inline-flex items-center mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  {{ $t('clientProfile.browseProviders') }}
                  <ChevronRightIcon class="ml-1 w-4 h-4" />
                </router-link>
              </div>
            </div>

            <!-- Appointments & Consultations -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon class="w-5 h-5 mr-2 text-green-600" />
                {{ $t('clientProfile.recentAppointments') }}
              </h2>

              <!-- Appointment Stats -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{{ appointmentStats.total }}</div>
                  <div class="text-sm text-blue-600">{{ $t('clientProfile.total') }}</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">{{ appointmentStats.completed }}</div>
                  <div class="text-sm text-green-600">{{ $t('clientProfile.completedLabel') }}</div>
                </div>
                <div class="text-center p-4 bg-orange-50 rounded-lg">
                  <div class="text-2xl font-bold text-orange-600">{{ appointmentStats.upcoming }}</div>
                  <div class="text-sm text-orange-600">{{ $t('clientProfile.upcomingLabel') }}</div>
                </div>
              </div>

              <!-- Recent appointments List -->
              <div v-if="recentAppointments.length > 0" class="space-y-3">
                <div v-for="appointment in recentAppointments" :key="appointment._id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div :class="getStatusBadgeClass(appointment.status)" class="w-3 h-3 rounded-full"></div>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ appointment.provider?.firstName || '' }} {{ appointment.provider?.lastName || '' }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ formatDateTime(appointment.dateTime) }}
                      </p>
                      <p class="text-xs text-gray-500 capitalize">{{ appointment.status }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ appointment.type || $t('clientProfile.consultation')
                    }}</p>
                    <router-link :to="`/appointments/${appointment._id}`"
                      class="text-xs text-indigo-600 hover:text-indigo-700">
                      {{ $t('clientProfile.viewDetails') }}
                    </router-link>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">{{ $t('clientProfile.noAppointments') }}</p>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-8">

            <!-- Achievements -->
            <div v-if="showAchievements" class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon class="w-5 h-5 mr-2 text-yellow-600" />
                {{ $t('clientProfile.achievements') }}
              </h2>

              <!-- Achievement progress -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>{{ $t('clientProfile.progress') }}</span>
                  <span>{{ earnedAchievements.length }}/{{ totalAchievements }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: achievementProgress + '%' }"></div>
                </div>
              </div>

              <!-- Earned achievements -->
              <div v-if="earnedAchievements.length > 0" class="space-y-3 mb-4">
                <h3 class="text-sm font-medium text-gray-700">{{ $t('clientProfile.earnedAchievements') }}</h3>
                <div v-for="achievement in earnedAchievements" :key="achievement.id"
                  class="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <CheckCircleIcon class="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ achievement.name }}</p>
                    <p class="text-xs text-gray-600">{{ achievement.description }}</p>
                    <p class="text-xs text-gray-500">{{ $t('clientProfile.earned') }} {{
                      formatDate(achievement.earnedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Unearned Achievements -->
              <div v-if="unearnedAchievements.length > 0" class="space-y-3">
                <h3 class="text-sm font-medium text-gray-700">{{ $t('clientProfile.availableAchievements') }}</h3>
                <div v-for="achievement in unearnedAchievements.slice(0, 3)" :key="achievement.id"
                  class="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <LockClosedIcon class="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-700">{{ achievement.name }}</p>
                    <p class="text-xs text-gray-500">{{ achievement.requirements }}</p>
                  </div>
                </div>
                <div v-if="unearnedAchievements.length > 3" class="text-center">
                  <button @click="showAllAchievements = !showAllAchievements"
                    class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    {{ showAllAchievements ? $t('clientProfile.showLess') : $t('clientProfile.viewMore', {
                      count:
                        unearnedAchievements.length - 3
                    }) }}
                  </button>
                </div>
              </div>

              <div v-if="totalAchievements === 0" class="text-center py-4">
                <p class="text-gray-500 text-sm">{{ $t('clientProfile.noAchievements') }}</p>
              </div>
            </div>

            <!-- My Reputation (provider → client tags) -->
            <div v-if="isReviewsBidirectionalEnabled" class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <StarIcon class="w-5 h-5 mr-2 text-sky-600" />
                {{ $t('reviews.clientReputation') }}
              </h2>
              <ReviewStats mode="tags" :total-reviews="reputationData.totalReviews"
                :tags-summary="reputationData.tags" />
            </div>

            <!-- Reviews I've Written -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <StarIcon class="w-5 h-5 mr-2 text-purple-600" />
                {{ $t('clientProfile.reviewsGiven') }}
              </h2>

              <div v-if="myReviews.length > 0" class="space-y-4">
                <div v-for="review in myReviews.slice(0, showAllReviews ? myReviews.length : 3)" :key="review._id"
                  class="border-l-4 border-purple-200 pl-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                      <div class="flex">
                        <StarIcon v-for="i in 5" :key="i"
                          :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" class="w-4 h-4" />
                      </div>
                      <span class="text-sm text-gray-600">{{ formatDate(review.createdAt) }}</span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-900 mb-2">{{ review.comment }}</p>
                  <p class="text-xs text-gray-500">
                    {{ $t('clientProfile.forProvider', {
                      name: `${review.reviewee?.firstName || ''}
                    ${review.reviewee?.lastName || ''}`
                    }) }}
                  </p>
                </div>

                <div v-if="myReviews.length > 3" class="text-center">
                  <button @click="showAllReviews = !showAllReviews"
                    class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    {{ showAllReviews ? $t('clientProfile.showLess') : $t('clientProfile.viewMoreReviews', {
                      count:
                        myReviews.length - 3
                    }) }}
                  </button>
                </div>
              </div>

              <div v-else class="text-center py-4">
                <StarIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p class="text-gray-500 text-sm">{{ $t('clientProfile.noReviews') }}</p>
                <p class="text-gray-400 text-xs mt-1">{{ $t('clientProfile.noReviewsHint') }}</p>
              </div>
            </div>

            <!-- Payment History -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">{{ $t('clientProfile.paymentHistory') }}</h2>
              <router-link to="/profile/me/payments"
                class="block text-center text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                {{ $t('clientProfile.viewPaymentHistory') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon, CheckCircleIcon, PencilIcon, UsersIcon, ChevronRightIcon, CalendarDaysIcon, StarIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'
import { isAchievementsEnabled } from '@/utils/modules'
import { useModules } from '@/composables/useModules'
import { availableLocales } from '@/utils/i18n'
import ReviewStats from '@/components/reviews/ReviewStats.vue'

const { isReviewsBidirectionalEnabled } = useModules()

// Simple computed property
const showAchievements = computed(() => isAchievementsEnabled())

const authStore = useAuthStore()

// Reactive data
const user = ref(null)
const associatedProviders = ref([])
const recentAppointments = ref([])
const appointmentStats = ref({
  total: 0,
  completed: 0,
  upcoming: 0
})
const achievements = ref([])
const myReviews = ref([])
const reputationData = ref({ tags: [], totalReviews: 0 })
const loading = ref(true)
const showAllAchievements = ref(false)
const showAllReviews = ref(false)

// Computed properties
const isVerified = computed(() => user.value?.isVerified)
const completedAppointments = computed(() => appointmentStats.value.completed)

const earnedAchievements = computed(() =>
  achievements.value.filter(a => a.isEarned)
)

const unearnedAchievements = computed(() =>
  achievements.value.filter(a => !a.isEarned)
)

const totalAchievements = computed(() => achievements.value.length)

const achievementProgress = computed(() => {
  if (totalAchievements.value === 0) return 0
  return Math.round((earnedAchievements.value.length / totalAchievements.value) * 100)
})

// Methods
const getLocaleName = (code) => {
  if (!code) return 'English'
  const found = availableLocales.find(l => l.code === code)
  return found ? `${found.flag} ${found.name}` : code
}

const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/users/me')
    user.value = response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

// Combined function to fetch appointments data and extract providers
// This eliminates the duplicate API call
const fetchAppointmentsAndProviders = async () => {
  try {
    const response = await axios.get(`/appointments/all`)
    const appointments = response.data.appointments || []

    // Calculate appointment stats
    appointmentStats.value = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      upcoming: appointments.filter(a =>
        a.status === 'scheduled' && new Date(a.dateTime) > new Date()
      ).length
    }

    // Get recent appointments (last 5)
    recentAppointments.value = appointments
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .slice(0, 5)

    // Extract associated providers from completed appointments
    const providerMap = new Map()
    appointments.forEach(appointment => {
      if (appointment.provider && appointment.status === 'completed') {
        const providerId = appointment.provider._id
        if (providerMap.has(providerId)) {
          providerMap.get(providerId).appointmentCount++
        } else {
          providerMap.set(providerId, {
            ...appointment.provider,
            appointmentCount: 1
          })
        }
      }
    })

    associatedProviders.value = Array.from(providerMap.values())
  } catch (error) {
    console.error('Error fetching appointments and providers:', error)
    appointmentStats.value = { total: 0, completed: 0, upcoming: 0 }
    recentAppointments.value = []
    associatedProviders.value = []
  }
}

const fetchAchievements = async () => {
  if (!showAchievements.value) {
    achievements.value = []
    return
  }

  try {
    const response = await axios.get('/users/achievements')
    achievements.value = response.data.achievements?.all || []
  } catch (error) {
    console.error('Error fetching achievements:', error)
    achievements.value = []
  }
}

/**
 * Fetch reviews the client has WRITTEN (client_to_provider and client_to_course).
 * Uses /reviews/my-reviews which returns reviews by the current user.
 */
const fetchMyReviews = async () => {
  try {
    const response = await axios.get('/reviews/my-reviews')
    myReviews.value = response.data.reviews || []
  } catch (error) {
    console.error('Error fetching my reviews:', error)
    myReviews.value = []
  }
}

/**
 * Fetch client reputation data — provider→client reviews (tags summary).
 * Uses /reviews/client/:clientId which returns reviews ABOUT the client.
 */
const fetchReputation = async () => {
  if (!isReviewsBidirectionalEnabled.value) {
    reputationData.value = { tags: [], totalReviews: 0 }
    return
  }

  try {
    const response = await axios.get(`/reviews/client/${authStore.user._id}`)
    reputationData.value = {
      tags: response.data.tagsSummary?.tags || [],
      totalReviews: response.data.tagsSummary?.totalReviews || 0
    }
  } catch (error) {
    console.error('Error fetching reputation:', error)
    reputationData.value = { tags: [], totalReviews: 0 }
  }
}

// Utility functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'completed': 'bg-green-500',
    'scheduled': 'bg-blue-500',
    'canceled': 'bg-red-500',
    'pending': 'bg-yellow-500'
  }
  return statusClasses[status] || 'bg-gray-500'
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    const basePromises = [
      fetchUserProfile(),
      fetchAppointmentsAndProviders(),
      fetchMyReviews(),
      fetchReputation()
    ]

    if (showAchievements.value) {
      basePromises.push(fetchAchievements())
    }

    await Promise.all(basePromises)
  } catch (error) {
    console.error('Error loading profile data:', error)
  } finally {
    loading.value = false
  }
})
</script>