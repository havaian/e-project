<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
                        <p class="text-gray-600">Welcome back, Dr. {{ user?.firstName }}!</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <router-link to="/profile/edit" class="btn-element-secondary text-sm">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </router-link>
                        <router-link to="/appointments/provider" class="btn-element-primary text-sm">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View Schedule
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Quick Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">This Month Earnings</p>
                            <p class="text-2xl font-bold text-gray-900">{{
                                formatCurrency(dashboardSummary?.currentMonth?.earnings || 0) }}</p>
                            <div class="flex items-center mt-2">
                                <svg v-if="(dashboardSummary?.currentMonth?.growth || 0) >= 0"
                                    class="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <svg v-else class="w-4 h-4 text-red-500 mr-1" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                                </svg>
                                <span class="text-sm font-medium"
                                    :class="(dashboardSummary?.currentMonth?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                                    {{ Math.abs(dashboardSummary?.currentMonth?.growth || 0).toFixed(1) }}%
                                </span>
                            </div>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Appointments This Month</p>
                            <p class="text-2xl font-bold text-gray-900">{{ dashboardSummary?.currentMonth?.appointments
                                || 0 }}</p>
                            <p class="text-sm text-gray-500 mt-2">{{ dashboardSummary?.quickStats?.completedAppointments
                                || 0 }} completed</p>
                        </div>
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Upcoming Appointments</p>
                            <p class="text-2xl font-bold text-gray-900">{{ dashboardSummary?.quickStats?.upcomingCount
                                || 0 }}</p>
                            <p class="text-sm text-gray-500 mt-2">Next 7 days</p>
                        </div>
                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">Pending Confirmations</p>
                            <p class="text-2xl font-bold text-gray-900">{{ dashboardSummary?.quickStats?.pendingCount ||
                                0 }}</p>
                            <p class="text-sm text-gray-500 mt-2">Need your response</p>
                        </div>
                        <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Left Column - Charts and Analytics -->
                <div class="lg:col-span-2 space-y-8">
                    <!-- Earnings Chart -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-semibold text-gray-900">Earnings Overview</h3>
                            <div class="flex items-center space-x-2">
                                <select v-model="selectedPeriod" @change="fetchEarningsData"
                                    class="text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                    <option value="monthly">Monthly</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="daily">Daily</option>
                                </select>
                                <button @click="exportEarnings"
                                    class="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50">
                                    Export
                                </button>
                            </div>
                        </div>

                        <EarningsChart :data="earningsData" :period="selectedPeriod" :loading="earningsLoading" />
                    </div>

                    <!-- Earnings Table -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-6">Detailed Earnings</h3>
                        <EarningsTable :data="earningsData" :period="selectedPeriod" :loading="earningsLoading" />
                    </div>
                </div>

                <!-- Right Column - Quick Actions and Info -->
                <div class="space-y-6">
                    <!-- Upcoming Appointments -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
                            <router-link to="/appointments/provider"
                                class="text-sm text-sky-600 hover:text-sky-700 font-medium">
                                View All
                            </router-link>
                        </div>

                        <div v-if="dashboardSummary?.upcomingAppointments?.length > 0" class="space-y-3">
                            <div v-for="appointment in dashboardSummary.upcomingAppointments.slice(0, 5)"
                                :key="appointment._id"
                                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p class="font-medium text-gray-900">{{ appointment.client?.firstName }} {{
                                        appointment.client?.lastName }}</p>
                                    <p class="text-sm text-gray-600">{{ formatDate(appointment.dateTime) }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-medium text-gray-900">{{ formatTime(appointment.dateTime) }}
                                    </p>
                                    <p class="text-xs text-gray-500">{{ user?.sessionDuration }}min</p>
                                </div>
                            </div>
                        </div>

                        <div v-else class="text-center py-6">
                            <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-gray-500">No upcoming appointments</p>
                        </div>
                    </div>

                    <!-- Pending Confirmations -->
                    <div v-if="dashboardSummary?.pendingConfirmations?.length > 0"
                        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold text-gray-900">Pending Confirmations</h3>
                            <span class="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                                {{ dashboardSummary.pendingConfirmations.length }} pending
                            </span>
                        </div>

                        <div class="space-y-3">
                            <div v-for="appointment in dashboardSummary.pendingConfirmations.slice(0, 3)"
                                :key="appointment._id"
                                class="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                                <div>
                                    <p class="font-medium text-gray-900">{{ appointment.client?.firstName }} {{
                                        appointment.client?.lastName }}</p>
                                    <p class="text-sm text-gray-600">{{ formatDate(appointment.dateTime) }} at {{
                                        formatTime(appointment.dateTime) }}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button @click="confirmAppointment(appointment._id)"
                                        class="text-xs bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700">
                                        Confirm
                                    </button>
                                    <button @click="rejectAppointment(appointment._id)"
                                        class="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700">
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Profile Completion -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Profile Status</h3>

                        <div class="space-y-4">
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-sm font-medium text-gray-700">Profile Completion</span>
                                    <span class="text-sm font-medium text-gray-900">{{ profileCompletion?.percentage ||
                                        0 }}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                        :style="{ width: `${profileCompletion?.percentage || 0}%` }"></div>
                                </div>
                            </div>

                            <div v-if="profileCompletion?.isComplete"
                                class="flex items-center space-x-2 text-green-600">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-sm font-medium">Profile Complete</span>
                            </div>

                            <div v-else class="space-y-2">
                                <div class="flex items-center space-x-2 text-orange-600">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span class="text-sm font-medium">Profile Incomplete</span>
                                </div>
                                <router-link to="/profile/edit"
                                    class="block text-sm text-sky-600 hover:text-sky-700 font-medium">
                                    Complete your profile →
                                </router-link>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div class="space-y-3">
                            <router-link to="/appointments/provider"
                                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors">
                                <div class="flex items-center space-x-3">
                                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span class="font-medium text-gray-900">Manage Schedule</span>
                                </div>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </router-link>

                            <router-link to="/profile/edit"
                                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors">
                                <div class="flex items-center space-x-3">
                                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span class="font-medium text-gray-900">Update Profile</span>
                                </div>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </router-link>

                            <router-link to="/chat"
                                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-sky-300 hover:bg-sky-50 transition-colors">
                                <div class="flex items-center space-x-3">
                                    <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span class="font-medium text-gray-900">Messages</span>
                                </div>
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
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
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'
import EarningsChart from '@/components/provider/EarningsChart.vue'
import EarningsTable from '@/components/provider/EarningsTable.vue'

const authStore = useAuthStore()

// State
const dashboardSummary = ref(null)
const earningsData = ref([])
const selectedPeriod = ref('monthly')
const earningsLoading = ref(false)
const loading = ref(false)

// Computed
const user = computed(() => authStore.user)
const profileCompletion = computed(() => authStore.profileCompletion)

// Methods
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS'
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    })
}

const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

const fetchDashboardSummary = async () => {
    try {
        loading.value = true
        const response = await axios.get('/users/providers/dashboard/summary')
        dashboardSummary.value = response.data.summary
    } catch (error) {
        console.error('Error fetching dashboard summary:', error)
    } finally {
        loading.value = false
    }
}

const fetchEarningsData = async () => {
    try {
        earningsLoading.value = true
        const response = await axios.get('/users/providers/dashboard/earnings', {
            params: {
                period: selectedPeriod.value,
                limit: 12
            }
        })
        earningsData.value = response.data.earnings || []
    } catch (error) {
        console.error('Error fetching earnings data:', error)
        earningsData.value = []
    } finally {
        earningsLoading.value = false
    }
}

const confirmAppointment = async (appointmentId) => {
    try {
        await axios.patch(`/appointments/${appointmentId}/confirm`)
        // Refresh dashboard data
        await fetchDashboardSummary()
    } catch (error) {
        console.error('Error confirming appointment:', error)
    }
}

const rejectAppointment = async (appointmentId) => {
    try {
        await axios.patch(`/appointments/${appointmentId}/reject`)
        // Refresh dashboard data
        await fetchDashboardSummary()
    } catch (error) {
        console.error('Error rejecting appointment:', error)
    }
}

const exportEarnings = async () => {
    try {
        const response = await axios.get('/users/providers/earnings/export', {
            params: {
                format: 'csv',
                period: selectedPeriod.value
            },
            responseType: 'blob'
        })

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `earnings-${selectedPeriod.value}-${Date.now()}.csv`)
        document.body.appendChild(link)
        link.click()
        link.remove()
    } catch (error) {
        console.error('Error exporting earnings:', error)
    }
}

// Lifecycle
onMounted(async () => {
    await Promise.all([
        fetchDashboardSummary(),
        fetchEarningsData()
    ])
    
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('refreshProfile') === 'true') {
        await authStore.updateProfileCompletion(true) // force refresh
    }
})
</script>