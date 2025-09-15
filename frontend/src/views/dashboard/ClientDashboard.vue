<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">
                                Welcome back, {{ authStore.user?.firstName }}!
                            </h1>
                            <p class="mt-1 text-sm text-gray-600">
                                {{ currentDate }}
                            </p>
                        </div>
                        <router-link to="/providers" class="btn-primary px-6 py-3">
                            <PlusIcon class="w-5 h-5 mr-2" />
                            Book New Appointment
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-lg">
                            <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.upcoming }}</p>
                            <p class="text-sm text-gray-600">Upcoming</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-100 rounded-lg">
                            <CheckCircleIcon class="w-6 h-6 text-green-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.completed }}</p>
                            <p class="text-sm text-gray-600">Completed</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-100 rounded-lg">
                            <UsersIcon class="w-6 h-6 text-purple-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.providers }}</p>
                            <p class="text-sm text-gray-600">Providers</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-100 rounded-lg">
                            <ClockIcon class="w-6 h-6 text-yellow-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.totalHours }}</p>
                            <p class="text-sm text-gray-600">Total Hours</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Upcoming Appointments -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h2 class="text-lg font-semibold text-gray-900">
                                    Upcoming Appointments
                                </h2>
                                <router-link to="/appointments/client"
                                    class="text-sm text-brand-1 hover:text-brand-1/80 font-medium">
                                    View All
                                </router-link>
                            </div>
                        </div>

                        <div class="p-6">
                            <!-- Loading State -->
                            <div v-if="loadingAppointments" class="space-y-4">
                                <div v-for="i in 3" :key="i" class="animate-pulse">
                                    <div class="flex items-center space-x-4">
                                        <div class="w-12 h-12 bg-gray-200 rounded-lg"></div>
                                        <div class="flex-1 space-y-2">
                                            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Appointments List -->
                            <div v-else-if="upcomingAppointments.length > 0" class="space-y-4">
                                <div v-for="appointment in upcomingAppointments" :key="appointment._id"
                                    class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center space-x-4">
                                        <!-- Provider Avatar -->
                                        <div class="relative">
                                            <img :src="appointment.provider?.profilePicture || '/images/default-avatar.png'"
                                                :alt="getProviderName(appointment.provider)"
                                                class="w-12 h-12 rounded-full object-cover">
                                            <div
                                                class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                                            </div>
                                        </div>

                                        <div>
                                            <h3 class="font-medium text-gray-900">
                                                {{ getProviderName(appointment.provider) }}
                                            </h3>
                                            <p class="text-sm text-gray-600">
                                                {{ formatDateTime(appointment.dateTime) }}
                                            </p>
                                            <p class="text-xs text-gray-500 capitalize">
                                                {{ appointment.type || 'Video Session' }} • {{ appointment.status }}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex items-center space-x-2">
                                        <!-- Join button if within window -->
                                        <button v-if="isWithinJoinWindow(appointment.dateTime)"
                                            @click="joinSession(appointment._id)" class="btn-primary px-3 py-1 text-xs">
                                            <VideoCameraIcon class="w-4 h-4 mr-1" />
                                            Join
                                        </button>

                                        <!-- Time until appointment -->
                                        <div v-else class="text-right">
                                            <p class="text-xs text-gray-500">
                                                {{ getTimeUntilAppointment(appointment.dateTime) }}
                                            </p>
                                        </div>

                                        <router-link :to="`/appointments/${appointment._id}`"
                                            class="text-gray-400 hover:text-gray-600">
                                            <ChevronRightIcon class="w-5 h-5" />
                                        </router-link>
                                    </div>
                                </div>
                            </div>

                            <!-- Empty State -->
                            <div v-else class="text-center py-8">
                                <CalendarDaysIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 class="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
                                <p class="text-gray-600 mb-4">Book your first appointment to get started</p>
                                <router-link to="/providers" class="btn-primary px-4 py-2">
                                    Browse Providers
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Activity -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>

                        <div class="p-6">
                            <div v-if="recentActivity.length > 0" class="space-y-4">
                                <div v-for="activity in recentActivity" :key="activity.id"
                                    class="flex items-start space-x-3">
                                    <div :class="getActivityIconClass(activity.type)"
                                        class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center">
                                        <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm text-gray-900">
                                            {{ activity.message }}
                                        </p>
                                        <p class="text-xs text-gray-500">
                                            {{ formatRelativeTime(activity.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="text-center py-6">
                                <ClockIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p class="text-gray-500 text-sm">No recent activity</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-3">
                            <router-link to="/appointments/client"
                                class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <CalendarDaysIcon class="w-4 h-4 mr-2" />
                                View Calendar
                            </router-link>

                            <router-link to="/chat"
                                class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <ChatBubbleLeftIcon class="w-4 h-4 mr-2" />
                                Messages
                            </router-link>

                            <router-link to="/profile/client"
                                class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                                <UserIcon class="w-4 h-4 mr-2" />
                                Edit Profile
                            </router-link>
                        </div>
                    </div>

                    <!-- Your Providers -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Providers</h3>

                        <div v-if="favoriteProviders.length > 0" class="space-y-3">
                            <div v-for="provider in favoriteProviders" :key="provider._id"
                                class="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <img :src="provider.profilePicture || '/images/default-avatar.png'"
                                    :alt="getProviderName(provider)" class="w-10 h-10 rounded-full object-cover">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">
                                        {{ getProviderName(provider) }}
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ provider.specializations?.[0] || 'Consultant' }}
                                    </p>
                                </div>
                                <router-link :to="`/providers/${provider._id}`"
                                    class="text-brand-1 hover:text-brand-1/80">
                                    <ChevronRightIcon class="w-4 h-4" />
                                </router-link>
                            </div>
                        </div>

                        <div v-else class="text-center py-4">
                            <UsersIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p class="text-sm text-gray-500">No providers yet</p>
                            <router-link to="/providers" class="text-xs text-brand-1 hover:text-brand-1/80 font-medium">
                                Browse Providers
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, differenceInMinutes, isWithinInterval, subMinutes, addMinutes, formatDistanceToNow } from 'date-fns'
import axios from '@/plugins/axios'
import {
    CalendarDaysIcon,
    CheckCircleIcon,
    UsersIcon,
    ClockIcon,
    PlusIcon,
    VideoCameraIcon,
    ChevronRightIcon,
    ChatBubbleLeftIcon,
    UserIcon,
    DocumentTextIcon,
    ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const loadingAppointments = ref(true)
const upcomingAppointments = ref([])
const recentActivity = ref([])
const favoriteProviders = ref([])
const stats = ref({
    upcoming: 0,
    completed: 0,
    providers: 0,
    totalHours: 0
})

// Computed
const currentDate = computed(() => {
    return format(new Date(), 'EEEE, MMMM d, yyyy')
})

// Methods
const loadDashboardData = async () => {
    try {
        loadingAppointments.value = true

        // Load appointments
        const appointmentsResponse = await axios.get(`/appointments/client/${authStore.user.id}`, {
            params: {
                limit: 5,
                status: 'scheduled'
            }
        })
        upcomingAppointments.value = appointmentsResponse.data.appointments || []

        // Load stats
        const statsResponse = await axios.get(`/appointments/client/${authStore.user.id}`, {
            params: { limit: 1000 } // Get all to calculate stats
        })
        calculateStats(statsResponse.data.appointments || [])

        // Load recent activity (mock for now - you might want to create an endpoint)
        loadRecentActivity()

        // Load favorite providers (those the client has had appointments with)
        loadFavoriteProviders()

    } catch (error) {
        console.error('Error loading dashboard data:', error)
    } finally {
        loadingAppointments.value = false
    }
}

const calculateStats = (appointments) => {
    const now = new Date()
    const upcoming = appointments.filter(apt =>
        apt.status === 'scheduled' && new Date(apt.dateTime) > now
    )
    const completed = appointments.filter(apt => apt.status === 'completed')
    const providerIds = new Set(appointments.map(apt => apt.provider?._id).filter(Boolean))
    const totalMinutes = completed.reduce((total, apt) => {
        // Assume 60 minutes default if no duration specified
        return total + (apt.duration || 60)
    }, 0)

    stats.value = {
        upcoming: upcoming.length,
        completed: completed.length,
        providers: providerIds.size,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10
    }
}

const loadRecentActivity = () => {
    // Mock recent activity - replace with actual API call
    recentActivity.value = [
        {
            id: 1,
            type: 'appointment_completed',
            message: 'Completed session with Dr. Smith',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
            id: 2,
            type: 'appointment_booked',
            message: 'Booked appointment with Dr. Johnson',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
            id: 3,
            type: 'message_received',
            message: 'New message from Dr. Smith',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
        }
    ]
}

const loadFavoriteProviders = async () => {
    try {
        // Get unique providers from appointments
        const uniqueProviders = []
        const providerIds = new Set()

        upcomingAppointments.value.forEach(apt => {
            if (apt.provider && !providerIds.has(apt.provider._id)) {
                providerIds.add(apt.provider._id)
                uniqueProviders.push(apt.provider)
            }
        })

        favoriteProviders.value = uniqueProviders.slice(0, 3) // Show top 3
    } catch (error) {
        console.error('Error loading favorite providers:', error)
    }
}

// Utility methods
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, h:mm a')
}

const formatRelativeTime = (dateTime) => {
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true })
}

const getProviderName = (provider) => {
    if (!provider) return 'Unknown Provider'
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'
}

const isWithinJoinWindow = (dateTime) => {
    const appointmentTime = parseISO(dateTime)
    const now = new Date()
    return isWithinInterval(now, {
        start: subMinutes(appointmentTime, 5),
        end: addMinutes(appointmentTime, 30)
    })
}

const getTimeUntilAppointment = (dateTime) => {
    const appointmentTime = parseISO(dateTime)
    const now = new Date()
    const minutesUntil = differenceInMinutes(appointmentTime, now)

    if (minutesUntil < 60) {
        return `in ${minutesUntil} min`
    } else if (minutesUntil < 1440) { // 24 hours
        const hours = Math.floor(minutesUntil / 60)
        return `in ${hours}h`
    } else {
        const days = Math.floor(minutesUntil / 1440)
        return `in ${days}d`
    }
}

const getActivityIcon = (type) => {
    const icons = {
        appointment_completed: CheckCircleIcon,
        appointment_booked: CalendarDaysIcon,
        appointment_cancelled: ExclamationCircleIcon,
        message_received: ChatBubbleLeftIcon,
        document_uploaded: DocumentTextIcon
    }
    return icons[type] || ClockIcon
}

const getActivityIconClass = (type) => {
    const classes = {
        appointment_completed: 'bg-green-100 text-green-600',
        appointment_booked: 'bg-blue-100 text-blue-600',
        appointment_cancelled: 'bg-red-100 text-red-600',
        message_received: 'bg-purple-100 text-purple-600',
        document_uploaded: 'bg-yellow-100 text-yellow-600'
    }
    return classes[type] || 'bg-gray-100 text-gray-600'
}

// Actions
const joinSession = (appointmentId) => {
    router.push(`/session/${appointmentId}`)
}

// Lifecycle
onMounted(() => {
    loadDashboardData()
})
</script>

<style scoped>
.btn-primary {
    @apply bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-all duration-200 shadow-lg;
}
</style>