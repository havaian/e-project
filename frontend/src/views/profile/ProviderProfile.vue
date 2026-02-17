<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
      </div>
      <p class="mt-2 text-gray-600">Loading your profile...</p>
    </div>

    <div v-else class="bg-white shadow rounded-lg overflow-hidden">
      <!-- Profile Header -->
      <div class="p-6 sm:p-8 border-b border-gray-200">
        <div class="flex flex-col sm:flex-row items-center justify-between">
          <div class="flex flex-col sm:flex-row items-center">
            <img :src="user.profilePicture ? `/api${user.profilePicture}` : '/images/user-placeholder.jpg'" :alt="user?.firstName"
              class="h-32 w-32 rounded-full object-cover" />
            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
              <h1 class="text-2xl font-bold text-gray-900">
                {{ user?.firstName }} {{ user?.lastName }}
              </h1>
              <p class="text-gray-600">Provider</p>
              <div class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <span v-if="user?.isVerified"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon class="w-4 h-4 mr-1" />
                  Verified provider
                </span>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <CalendarDaysIcon class="w-4 h-4 mr-1" />
                  {{ appointmentStats.completed }} completed sessions
                </span>
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  <UsersIcon class="w-4 h-4 mr-1" />
                  {{ clients.length }}My clients
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4 sm:mt-0 flex gap-2">
            <router-link to="/profile/me/edit"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <PencilIcon class="w-4 h-4 mr-2" />
              Edit profile
            </router-link>
            <router-link to="/profile/me/dashboard"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <ChartBarIcon class="w-4 h-4 mr-2" />
              Dashboard
            </router-link>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div class="p-6 sm:p-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <!-- Left Column -->
          <div class="lg:col-span-2 space-y-8">

            <!-- Professional information -->
            <div class="bg-gray-50 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <BriefcaseIcon class="w-5 h-5 mr-2 text-indigo-600" />
                Professional information
              </h2>
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt class="text-sm font-medium text-gray-500">Email</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.email }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Phone</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.phone || 'Not provided' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">License number</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.licenseNumber || 'Not provided' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Experience</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.experience || 0 }} years</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Specializations</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.specializations?.join(', ') || 'None listed' }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">Languages</dt>
                  <dd class="mt-1 text-gray-900">{{ user?.languages?.join(', ') || 'Not specified' }}</dd>
                </div>
              </dl>
            </div>

            <!-- Session Information -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon class="w-5 h-5 mr-2 text-green-600" />
                Session details
              </h2>
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-2xl font-bold text-green-600">{{ formatCurrency(user?.sessionFee || 0) }}</div>
                  <div class="text-sm text-green-600">Session fee</div>
                </div>
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="text-2xl font-bold text-blue-600">{{ formatDuration(user?.sessionDuration || 60) }}</div>
                  <div class="text-sm text-blue-600">Duration</div>
                </div>
              </div>
            </div>

            <!-- Client Management -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-medium text-gray-900 flex items-center">
                  <UsersIcon class="w-5 h-5 mr-2 text-blue-600" />
                  My clients
                </h2>
                <button @click="showAddClientModal = true"
                  class="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
                  Add client
                </button>
              </div>

              <div v-if="clients.length > 0" class="space-y-3">
                <div v-for="client in clients" :key="client._id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <img :src="client.profilePicture ? `/api${client.profilePicture}` : '/images/user-placeholder.jpg'" :alt="client.firstName"
                      class="h-10 w-10 rounded-full object-cover">
                    <div>
                      <p class="font-medium text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
                      <p class="text-sm text-gray-600">{{ client.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <router-link :to="`/clients/${client._id}`" class="text-indigo-600 hover:text-indigo-700 text-sm">
                      View profile
                    </router-link>
                    <button @click="removeClient(client._id)" class="text-red-600 hover:text-red-700 text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-6">
                <UserPlusIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">No clients added yet</p>
                <p class="text-gray-400 text-sm mt-1">Add clients to manage their sessions</p>
              </div>
            </div>

            <!-- Recent appointments -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CalendarDaysIcon class="w-5 h-5 mr-2 text-purple-600" />
                Recent appointments
              </h2>

              <!-- Appointment Stats -->
              <div class="grid grid-cols-4 gap-4 mb-6">
                <div class="text-center p-3 bg-blue-50 rounded-lg">
                  <div class="text-xl font-bold text-blue-600">{{ appointmentStats.total }}</div>
                  <div class="text-xs text-blue-600">Total</div>
                </div>
                <div class="text-center p-3 bg-green-50 rounded-lg">
                  <div class="text-xl font-bold text-green-600">{{ appointmentStats.completed }}</div>
                  <div class="text-xs text-green-600">Completed</div>
                </div>
                <div class="text-center p-3 bg-orange-50 rounded-lg">
                  <div class="text-xl font-bold text-orange-600">{{ appointmentStats.upcoming }}</div>
                  <div class="text-xs text-orange-600">Upcoming</div>
                </div>
                <div class="text-center p-3 bg-yellow-50 rounded-lg">
                  <div class="text-xl font-bold text-yellow-600">{{ appointmentStats.pending }}</div>
                  <div class="text-xs text-yellow-600">Pending</div>
                </div>
              </div>

              <!-- Appointments List -->
              <div v-if="recentAppointments.length > 0" class="space-y-3">
                <div v-for="appointment in recentAppointments" :key="appointment._id"
                  class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                      <div :class="getStatusBadgeClass(appointment.status)" class="w-3 h-3 rounded-full"></div>
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ appointment.client?.firstName }} {{ appointment.client?.lastName }}
                      </p>
                      <p class="text-sm text-gray-600">{{ formatDateTime(appointment.dateTime) }}</p>
                      <p class="text-xs text-gray-500 capitalize">{{ appointment.status }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">{{ appointment.type || 'Session' }}</p>
                    <router-link :to="`/appointments/${appointment._id}`"
                      class="text-xs text-indigo-600 hover:text-indigo-700">
                      View details
                    </router-link>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-6">
                <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p class="text-gray-500">No appointments yet</p>
                <p class="text-gray-400 text-sm mt-1">Your appointments will appear here</p>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-8">

            <!-- About -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">About me</h3>
              <p class="text-gray-600 text-sm leading-relaxed">
                {{ 
                  user?.bio || 
                  'No bio provided yet. Add information about your background, approach, and specialties to help clients get to know you better.' 
                }}
              </p>
            </div>

            <!-- Education -->
            <div v-if="user?.education?.length > 0" class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Education</h3>
              <div class="space-y-3">
                <div v-for="edu in user.education" :key="edu._id" class="border-l-4 border-indigo-200 pl-4">
                  <p class="font-medium text-gray-900">{{ edu.degree }}</p>
                  <p class="text-sm text-gray-600">{{ edu.institution }}</p>
                  <p class="text-xs text-gray-500">{{ edu.year }}</p>
                </div>
              </div>
            </div>

            <!-- Certifications -->
            <div v-if="user?.certifications?.length > 0" class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Certifications</h3>
              <div class="space-y-2">
                <div v-for="cert in user.certifications" :key="cert._id" class="flex items-center space-x-2">
                  <CheckCircleIcon class="w-4 h-4 text-green-500" />
                  <span class="text-sm text-gray-900">{{ cert.name }}</span>
                </div>
              </div>
            </div>

            <!-- Achievements -->
            <div v-if="showAchievements" class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <CheckCircleIcon class="w-5 h-5 mr-2 text-yellow-600" />
                Achievements
              </h3>

              <!-- Achievement progress -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{{ earnedAchievements.length }}/{{ totalAchievements }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: achievementProgress + '%' }"></div>
                </div>
              </div>

              <!-- Earned achievements -->
              <div v-if="earnedAchievements.length > 0" class="space-y-3 mb-4">
                <h4 class="text-sm font-medium text-gray-700">Earned achievements</h4>
                <div
                  v-for="achievement in earnedAchievements.slice(0, showAllAchievements ? earnedAchievements.length : 3)"
                  :key="achievement.id"
                  class="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <CheckCircleIcon class="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{{ achievement.name }}</p>
                    <p class="text-xs text-gray-600">{{ achievement.description }}</p>
                    <p class="text-xs text-gray-500">Earned {{ formatDate(achievement.earnedAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- Unearned Achievements -->
              <div v-if="unearnedAchievements.length > 0" class="space-y-3">
                <h4 class="text-sm font-medium text-gray-700">Available achievements</h4>
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
                    {{ showAllAchievements ? 'Show less' : `View ${unearnedAchievements.length - 3} More` }}
                  </button>
                </div>
              </div>

              <div v-if="totalAchievements === 0" class="text-center py-4">
                <p class="text-gray-500 text-sm">No achievements available</p>
              </div>
            </div>

            <!-- Earnings summary -->
            <div class="bg-white border border-gray-200 rounded-xl p-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Earnings summary</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">This month</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(earnings.thisMonth) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-gray-600">Total earned</span>
                  <span class="font-medium text-gray-900">{{ formatCurrency(earnings.total) }}</span>
                </div>
                <router-link to="/profile/me/dashboard"
                  class="block text-center text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-3">
                  View detailed earnings
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add client Modal -->
    <div v-if="showAddClientModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <h3 class="text-lg font-medium text-gray-900">Add client</h3>
          <div class="mt-2 px-7 py-3">
            <input v-model="newClientEmail" type="email" placeholder="Client's email address"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
          </div>
          <div class="flex justify-center space-x-4 px-4 py-3">
            <button @click="addClient"
              class="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700">
              Add client
            </button>
            <button @click="showAddClientModal = false"
              class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon, CalendarDaysIcon, UsersIcon, PencilIcon, ChartBarIcon, BriefcaseIcon, CurrencyDollarIcon, UserPlusIcon, DocumentTextIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'
import { isAchievementsEnabled } from '@/utils/modules'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl, modal } = useGlobals()

// Simple computed property
const showAchievements = computed(() => isAchievementsEnabled())

const authStore = useAuthStore()

// Reactive data
const user = ref(null)
const clients = ref([])
const recentAppointments = ref([])
const appointmentStats = ref({
  total: 0,
  completed: 0,
  upcoming: 0,
  pending: 0
})
const earnings = ref({
  thisMonth: 0,
  total: 0
})
const achievements = ref([])
const loading = ref(true)
const showAddClientModal = ref(false)
const showAllAchievements = ref(false)
const newClientEmail = ref('')

// Computed properties  
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
const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/users/me')
    user.value = response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    // Fallback to auth store user
    user.value = authStore.user
  }
}

const fetchClients = async () => {
  try {
    const response = await axios.get('/users/clients')
    clients.value = response.data.clients || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    clients.value = []
  }
}

const fetchAppointments = async () => {
  try {
    const response = await axios.get(`/appointments/all`)
    const appointments = response.data.appointments || []

    // Calculate stats
    appointmentStats.value = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      upcoming: appointments.filter(a =>
        a.status === 'scheduled' && new Date(a.dateTime) > new Date()
      ).length,
      pending: appointments.filter(a => a.status === 'pending').length
    }

    // Get recent appointments (last 5)
    recentAppointments.value = appointments
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .slice(0, 5)
  } catch (error) {
    console.error('Error fetching appointments:', error)
    appointmentStats.value = { total: 0, completed: 0, upcoming: 0, pending: 0 }
    recentAppointments.value = []
  }
}

const fetchEarnings = async () => {
  try {
    const response = await axios.get('/users/providers/dashboard/earnings', {
      params: { period: 'monthly', limit: 1 }
    })
    const earningsData = response.data.earnings || []

    earnings.value = {
      thisMonth: earningsData[0]?.totalEarnings || 0,
      total: earningsData.reduce((sum, month) => sum + (month.totalEarnings || 0), 0)
    }
  } catch (error) {
    console.error('Error fetching earnings:', error)
    earnings.value = { thisMonth: 0, total: 0 }
  }
}

const fetchAchievements = async () => {
  // Early return if achievements module is disabled
  if (!showAchievements.value) {
    achievements.value = []
    return
  }

  try {
    const response = await axios.get('/users/achievements')
    achievements.value = response.data.achievements?.all || []
  } catch (error) {
    console.error('Error fetching achievements:', error)
    // If API returns 404 (module disabled), just set empty array
    if (error.response?.status === 404) {
      achievements.value = []
    } else {
      achievements.value = []
    }
  }
}

const addClient = async () => {
  if (!newClientEmail.value.trim()) return

  try {
    await axios.post('/users/clients', { email: newClientEmail.value.trim() })
    showAddClientModal.value = false
    newClientEmail.value = ''
    await fetchClients()
  } catch (error) {
    console.error('Error adding client:', error)
    toast.error('Failed to add client. Please try again.')
  }
}

const removeClient = async (clientId) => {
  if (!conmodal.confirmfirm('Are you sure you want to remove this client?')) return

  try {
    await axios.delete(`/users/clients/${clientId}`)
    await fetchClients()
  } catch (error) {
    console.error('Error removing client:', error)
  }
}

// Utility functions
const formatCurrency = (amount) => {
  if (!amount) return '0 UZS'
  return `${amount.toLocaleString()} UZS`
}

const formatDuration = (minutes) => {
  if (!minutes) return '60 min'
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`
  }
  return `${minutes} min`
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
    // Base data that's always needed
    const basePromises = [
      fetchUserProfile(),
      fetchClients(),
      fetchAppointments(),
      fetchEarnings()
    ]

    // Conditionally add achievements fetch
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