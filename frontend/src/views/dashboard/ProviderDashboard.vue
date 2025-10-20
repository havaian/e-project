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
                                {{ currentDate }} • {{ dashboardSummary?.upcomingAppointments?.length || 0 }}
                                appointments today
                            </p>
                        </div>

                        <div class="flex items-center space-x-4">
                            <router-link to="/profile/me" class="btn-secondary">
                                <UserIcon class="w-5 h-5 mr-2" />
                                View profile
                            </router-link>
                            <router-link to="/appointments/me" class="btn-primary">
                                <CalendarDaysIcon class="w-5 h-5 mr-2" />
                                View all appointments
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Quick Stats -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Today's appointments -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-lg">
                            <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.todayAppointments }}</p>
                            <p class="text-sm text-gray-600">Today's sessions</p>
                        </div>
                    </div>
                </div>

                <!-- This month's earnings -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-100 rounded-lg">
                            <BanknotesIcon class="w-6 h-6 text-green-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(stats.monthlyEarnings) }}</p>
                            <p class="text-sm text-gray-600">This month</p>
                        </div>
                    </div>
                </div>

                <!-- Total clients -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-100 rounded-lg">
                            <UsersIcon class="w-6 h-6 text-purple-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.totalClients }}</p>
                            <p class="text-sm text-gray-600">Total clients</p>
                        </div>
                    </div>
                </div>

                <!-- Pending confirmations -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-orange-100 rounded-lg">
                            <ClockIcon class="w-6 h-6 text-orange-600" />
                        </div>
                        <div class="ml-4">
                            <p class="text-2xl font-bold text-gray-900">{{ stats.pendingConfirmations }}</p>
                            <p class="text-sm text-gray-600">Pending</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Main Content -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Pending confirmations Alert -->
                    <div v-if="dashboardSummary?.pendingConfirmations?.length > 0"
                        class="bg-orange-50 border border-orange-200 rounded-xl p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <ExclamationCircleIcon class="w-6 h-6 text-orange-600 mr-3" />
                                <div>
                                    <h3 class="text-lg font-medium text-orange-900">Urgent: confirmations required</h3>
                                    <p class="text-sm text-orange-700 mt-1">
                                        You have {{ dashboardSummary.pendingConfirmations.length }} appointment{{
                                            dashboardSummary.pendingConfirmations.length > 1 ? 's' : '' }} waiting for your
                                        confirmation.
                                    </p>
                                </div>
                            </div>
                            <router-link to="/appointments/me"
                                class="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors">
                                Review now
                            </router-link>
                        </div>
                    </div>

                    <!-- Today's schedule -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h2 class="text-lg font-semibold text-gray-900">Today's schedule</h2>
                                <span class="text-sm text-gray-500">{{ currentDate }}</span>
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

                            <!-- Today's appointments -->
                            <div v-else-if="todayAppointments.length > 0" class="space-y-4">
                                <div v-for="appointment in todayAppointments" :key="appointment._id"
                                    class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div class="flex items-center space-x-4">
                                        <!-- Client Avatar -->
                                        <div class="relative">
                                            <img :src="appointment.client?.profilePicture || '/images/default-avatar.png'"
                                                :alt="getClientName(appointment.client)"
                                                class="w-12 h-12 rounded-full object-cover">
                                            <div v-if="appointment.status === 'scheduled'"
                                                class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white">
                                            </div>
                                        </div>

                                        <div>
                                            <h3 class="font-medium text-gray-900">
                                                {{ getClientName(appointment.client) }}
                                            </h3>
                                            <p class="text-sm text-gray-600">
                                                {{ formatTime(appointment.dateTime) }}
                                                <span class="mx-2">•</span>
                                                {{ appointment.type || 'Video session' }}
                                            </p>
                                            <p v-if="appointment.shortDescription" class="text-xs text-gray-500 mt-1">
                                                {{ appointment.shortDescription }}
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex items-center space-x-2">
                                        <!-- Join session (if within window) -->
                                        <button v-if="isWithinJoinWindow(appointment.dateTime)"
                                            @click="joinSession(appointment._id)" class="btn-primary px-3 py-1 text-xs">
                                            <VideoCameraIcon class="w-4 h-4 mr-1" />
                                            Start
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
                                <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
                                <p class="text-gray-600 mb-4">Enjoy your free time or update your availability</p>
                                <router-link to="/profile/me" class="btn-secondary px-4 py-2">
                                    Update availability
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <!-- Recent activity -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-200">
                            <h2 class="text-lg font-semibold text-gray-900">Recent activity</h2>
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

                    <!-- Weekly calendar overview -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div class="p-6 border-b border-gray-200">
                            <div class="flex items-center justify-between">
                                <h2 class="text-lg font-semibold text-gray-900">This week's overview</h2>
                                <router-link to="/appointments/me"
                                    class="text-sm text-brand-1 hover:text-brand-1/80 font-medium">
                                    View calendar
                                </router-link>
                            </div>
                        </div>

                        <div class="p-6">
                            <AvailabilityCalendar mode="appointments" user-role="provider" :show-current-time="true"
                                @appointment-click="viewAppointment" @view-full-calendar="goToAppointments" />
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Earnings summary -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Earnings overview</h3>

                        <div class="space-y-4">
                            <div class="p-4 bg-green-50 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-medium text-green-800">This month</span>
                                    <span class="text-lg font-bold text-green-900">{{ formatCurrency(earnings.thisMonth)
                                        }}</span>
                                </div>
                                <div class="mt-1 text-xs text-green-600">
                                    {{ earnings.thisMonthGrowth > 0 ? '+' : '' }}{{ earnings.thisMonthGrowth }}% from
                                    last month
                                </div>
                            </div>

                            <div class="space-y-2">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Last month</span>
                                    <span class="font-medium text-gray-900">{{ formatCurrency(earnings.lastMonth)
                                        }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Total earned</span>
                                    <span class="font-medium text-gray-900">{{ formatCurrency(earnings.total) }}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="text-sm text-gray-600">Average per session</span>
                                    <span class="font-medium text-gray-900">{{
                                        formatCurrency(earnings.averagePerSession) }}</span>
                                </div>
                            </div>
                        </div>

                        <router-link to="/profile/me/dashboard"
                            class="block text-center text-brand-1 hover:text-brand-1/80 text-sm font-medium mt-4">
                            View detailed analytics
                        </router-link>
                    </div>

                    <!-- Performance Metrics -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance</h3>

                        <div class="space-y-4">
                            <!-- Rating -->
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">Average rating</span>
                                <div class="flex items-center space-x-1">
                                    <div class="flex items-center">
                                        <StarIcon v-for="i in 5" :key="i"
                                            :class="i <= Math.floor(performance.rating) ? 'text-yellow-400' : 'text-gray-300'"
                                            class="w-4 h-4" />
                                    </div>
                                    <span class="text-sm font-medium text-gray-900">{{ performance.rating.toFixed(1)
                                        }}</span>
                                </div>
                            </div>

                            <!-- Response time -->
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">Avg response time</span>
                                <span class="text-sm font-medium text-gray-900">{{ performance.responseTime }}</span>
                            </div>

                            <!-- Completion rate -->
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">Completion rate</span>
                                <span class="text-sm font-medium text-gray-900">{{ performance.completionRate }}%</span>
                            </div>

                            <!-- Profile views -->
                            <div class="flex items-center justify-between">
                                <span class="text-sm text-gray-600">Profile views</span>
                                <span class="text-sm font-medium text-gray-900">{{ performance.profileViews }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    CalendarDaysIcon,
    BanknotesIcon,
    UsersIcon,
    ClockIcon,
    ExclamationCircleIcon,
    VideoCameraIcon,
    ChevronRightIcon,
    UserIcon,
    ChatBubbleLeftIcon,
    DocumentArrowDownIcon,
    StarIcon,
    CheckCircleIcon,
    XCircleIcon,
    DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, differenceInMinutes, isWithinInterval, subMinutes, addMinutes, formatDistanceToNow, isToday } from 'date-fns'
import axios from '@/plugins/axios'
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const loadingAppointments = ref(true)
const dashboardSummary = ref(null)
const todayAppointments = ref([])
const recentActivity = ref([])
const stats = ref({
    todayAppointments: 0,
    monthlyEarnings: 0,
    totalClients: 0,
    pendingConfirmations: 0
})
const earnings = ref({
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
    averagePerSession: 0,
    thisMonthGrowth: 0
})
const performance = ref({
    rating: 0.0,
    responseTime: '-',
    completionRate: 0,
    profileViews: 0
})

// Computed
const currentDate = computed(() => {
    return format(new Date(), 'EEEE, MMMM d, yyyy')
})

// Methods
const loadDashboardData = async () => {
    try {
        loadingAppointments.value = true

        // Load dashboard summary
        const summaryResponse = await axios.get(`/users/providers/dashboard/summary`)
        dashboardSummary.value = summaryResponse.data

        // Load today's appointments
        const today = format(new Date(), 'yyyy-MM-dd')
        const appointmentsResponse = await axios.get(`/appointments/all`, {
            params: {
                date: today,
                status: 'scheduled'
            }
        })
        todayAppointments.value = appointmentsResponse.data.appointments || []

        // Load earnings data
        const earningsResponse = await axios.get(`/users/providers/dashboard/earnings`)
        earnings.value = {
            thisMonth: earningsResponse.data.currentMonth?.total || 0,
            lastMonth: earningsResponse.data.previousMonth?.total || 0,
            total: earningsResponse.data.totalEarnings || 0,
            averagePerSession: earningsResponse.data.averagePerSession || 0,
            thisMonthGrowth: earningsResponse.data.monthlyGrowthPercentage || 0
        }

        // Calculate stats
        calculateStats()

        // Load recent activity (mock for now)
        loadRecentActivity()

    } catch (error) {
        console.error('Error loading dashboard data:', error)
    } finally {
        loadingAppointments.value = false
    }
}

const calculateStats = () => {
    stats.value = {
        todayAppointments: todayAppointments.value.length,
        monthlyEarnings: earnings.value.thisMonth,
        totalClients: dashboardSummary.value?.totalClients || 0,
        pendingConfirmations: dashboardSummary.value?.pendingConfirmations?.length || 0
    }
}

const loadRecentActivity = () => {
    // Mock recent activity - replace with actual API call
    recentActivity.value = [
        {
            id: 1,
            type: 'appointment_completed',
            message: 'Completed session with John Smith',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        },
        {
            id: 2,
            type: 'appointment_booked',
            message: 'New appointment booked by Sarah Johnson',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
        },
        {
            id: 3,
            type: 'message_received',
            message: 'New message from Michael Brown',
            createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
            id: 4,
            type: 'payment_received',
            message: 'Payment received for session with Emma Davis',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        }
    ]
}

// Utility methods
const formatTime = (dateTime) => {
    return format(parseISO(dateTime), 'h:mm a')
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0)
}

const formatRelativeTime = (dateTime) => {
    return formatDistanceToNow(new Date(dateTime), { addSuffix: true })
}

const getClientName = (client) => {
    if (!client) return 'Unknown Client'
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'
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
        appointment_cancelled: XCircleIcon,
        message_received: ChatBubbleLeftIcon,
        payment_received: BanknotesIcon,
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
        payment_received: 'bg-green-100 text-green-600',
        document_uploaded: 'bg-yellow-100 text-yellow-600'
    }
    return classes[type] || 'bg-gray-100 text-gray-600'
}

// Actions
const joinSession = (appointmentId) => {
    router.push(`/session/${appointmentId}`)
}

const viewAppointment = (appointment) => {
    if (appointment.extendedProps?.appointmentId) {
        router.push(`/appointments/${appointment.extendedProps.appointmentId}`)
    }
}

const goToAppointments = () => {
    router.push('/appointments/me')
}

const downloadReport = async () => {
    try {
        // TODO: Implement report download
        console.log('Downloading report...')
    } catch (error) {
        console.error('Error downloading report:', error)
    }
}

// Lifecycle
onMounted(() => {
    loadDashboardData()
})
</script>

<style scoped>
.btn-primary {
    @apply bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-all duration-200 shadow-lg px-4 py-2;
}

.btn-secondary {
    @apply bg-white text-gray-700 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200 px-4 py-2;
}

.brand-1 {
    color: #0ea5e9;
}
</style>