<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">My Schedule</h1>

        <!-- Enhanced Tab Navigation -->
        <div class="border-b border-gray-200 mb-8">
            <nav class="-mb-px flex space-x-8">
                <button @click="activeTab = 'pending'" :class="[
                    'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
                    activeTab === 'pending'
                        ? 'border-brand-1 text-brand-1'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]">
                    <div class="flex items-center">
                        <span>Pending Confirmations</span>
                        <span v-if="pendingCount > 0"
                            class="ml-2 bg-red-100 text-red-600 py-1 px-2 rounded-full text-xs font-medium">
                            {{ pendingCount }}
                        </span>
                    </div>
                </button>
                <button @click="activeTab = 'scheduled'" :class="[
                    'py-3 px-1 border-b-2 font-semibold text-sm transition-colors',
                    activeTab === 'scheduled'
                        ? 'border-brand-1 text-brand-1'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]">
                    Scheduled Appointments
                </button>
            </nav>
        </div>

        <!-- Pending Confirmations Tab -->
        <div v-if="activeTab === 'pending'">
            <PendingConfirmations @appointment-confirmed="refreshPendingCount" />
        </div>

        <!-- Scheduled Appointments Tab -->
        <div v-if="activeTab === 'scheduled'">
            <!-- Enhanced Filters -->
            <div class="card-element p-6 mb-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="form-group">
                        <label for="date" class="label">Filter by Date</label>
                        <input id="date" v-model="filters.date" type="date" class="input" @change="fetchAppointments" />
                    </div>
                    <div class="form-group">
                        <label for="status" class="label">Filter by Status</label>
                        <select id="status" v-model="filters.status" class="input" @change="fetchAppointments">
                            <option value="">All Status</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                            <option value="no-show">No Show</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Appointments List -->
            <div class="space-y-6">
                <div v-if="loading" class="text-center py-12">
                    <div
                        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-1 border-t-transparent">
                    </div>
                    <p class="mt-4 text-gray-600">Loading your schedule...</p>
                </div>

                <template v-else>
                    <div v-if="appointments.length === 0" class="text-center py-12">
                        <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m2 0h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h2m6 4v2m0 4v2">
                                </path>
                            </svg>
                        </div>
                        <p class="text-gray-600 text-lg">No appointments found</p>
                        <p class="text-gray-500 text-sm mt-1">Your schedule is clear for the selected filters</p>
                    </div>

                    <div v-else class="space-y-4">
                        <div v-for="appointment in appointments" :key="appointment._id"
                            class="card-element overflow-hidden transition-all duration-300 hover:shadow-lg">
                            <div class="p-6">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center space-x-4">
                                        <div class="flex-shrink-0">
                                            <div v-if="appointment.client.profilePicture" class="relative">
                                                <img :src="appointment.client.profilePicture"
                                                    :alt="`${appointment.client.firstName} ${appointment.client.lastName}`"
                                                    class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100" />
                                            </div>
                                            <div v-else
                                                class="h-14 w-14 rounded-full bg-gradient-to-r from-brand-1 to-brand-2 flex items-center justify-center ring-2 ring-gray-100">
                                                <span class="text-lg font-semibold text-white">
                                                    {{ appointment.client.firstName.charAt(0) }}{{
                                                        appointment.client.lastName.charAt(0) }}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 class="text-lg font-semibold text-gray-900">
                                                {{ appointment.client.firstName }} {{ appointment.client.lastName }}
                                            </h3>
                                            <p class="text-sm text-gray-500 flex items-center">
                                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                                    </path>
                                                </svg>
                                                Age: {{ calculateAge(appointment.client.dateOfBirth) }} years
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <span
                                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                            :class="getStatusClass(appointment.status)">
                                            {{ appointment.status.charAt(0).toUpperCase() +
                                                appointment.status.slice(1).replace('-', ' ') }}
                                        </span>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div class="flex items-center space-x-3">
                                        <div
                                            class="flex-shrink-0 w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center">
                                            <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m2 0h2a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h2m6 4v2m0 4v2">
                                                </path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm text-gray-500">Date & Time</p>
                                            <p class="font-semibold text-gray-900">{{
                                                formatDateTime(appointment.dateTime) }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center space-x-3">
                                        <div
                                            class="flex-shrink-0 w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center">
                                            <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                                                </path>
                                            </svg>
                                        </div>
                                        <div>
                                            <p class="text-sm text-gray-500">Session Type</p>
                                            <p class="font-medium text-gray-900">{{
                                                appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="flex items-start space-x-3">
                                        <div
                                            class="flex-shrink-0 w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center">
                                            <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                                </path>
                                            </svg>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm text-gray-500">Description</p>
                                            <p class="font-medium text-gray-900 text-sm">{{ appointment.shortDescription
                                                }}</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-end space-x-3">
                                    <router-link :to="{ name: 'appointment-details', params: { id: appointment._id } }"
                                        class="btn-secondary">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                            </path>
                                        </svg>
                                        View Details
                                    </router-link>
                                    <button v-if="appointment.status === 'scheduled'"
                                        class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
                                        @click="markAsNoShow(appointment._id)">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        Mark as No-Show
                                    </button>
                                    <button
                                        v-if="appointment.status === 'scheduled' && isWithinJoinWindow(appointment.dateTime)"
                                        class="btn-primary" @click="joinSession(appointment._id)">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10V7a2 2 0 012-2h2a2 2 0 012 2v3">
                                            </path>
                                        </svg>
                                        Start Session
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Enhanced Pagination -->
                    <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
                        <button v-if="currentPage > 1" @click="handlePageChange(currentPage - 1)"
                            class="btn-secondary px-3 py-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 19l-7-7 7-7"></path>
                            </svg>
                        </button>

                        <div class="flex space-x-1">
                            <button v-for="page in totalPages" :key="page"
                                class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                                :class="currentPage === page ? 'bg-brand-1 text-white' : 'text-gray-700 hover:bg-gray-100'"
                                @click="handlePageChange(page)">
                                {{ page }}
                            </button>
                        </div>

                        <button v-if="currentPage < totalPages" @click="handlePageChange(currentPage + 1)"
                            class="btn-secondary px-3 py-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7">
                                </path>
                            </svg>
                        </button>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, differenceInYears, isWithinInterval, subMinutes, addMinutes } from 'date-fns'
import axios from '@/plugins/axios'
import PendingConfirmations from '@/components/appointments/PendingConfirmations.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const activeTab = ref('pending') // Start with pending tab to highlight urgent items
const appointments = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const pendingCount = ref(0)
const filters = reactive({
    date: format(new Date(), 'yyyy-MM-dd'),
    status: ''
})

// Utility functions
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const calculateAge = (dateOfBirth) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth))
}

const isWithinJoinWindow = (dateTime) => {
    const appointmentTime = parseISO(dateTime)
    const now = new Date()
    return isWithinInterval(now, {
        start: subMinutes(appointmentTime, 5),
        end: addMinutes(appointmentTime, 30)
    })
}

const getStatusClass = (status) => {
    const classes = {
        'scheduled': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'canceled': 'bg-red-100 text-red-800',
        'no-show': 'bg-gray-100 text-gray-800',
        'pending-provider-confirmation': 'bg-yellow-100 text-yellow-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

// API functions
async function fetchAppointments() {
    try {
        loading.value = true
        const params = {
            page: currentPage.value,
            limit: 10,
            ...filters
        }

        const response = await axios.get(`/appointments/provider/${authStore.user._id}`, { params })
        appointments.value = response.data.appointments
        totalPages.value = Math.ceil(response.data.pagination.total / response.data.pagination.limit)
    } catch (error) {
        console.error('Error fetching appointments:', error)
    } finally {
        loading.value = false
    }
}

async function fetchPendingCount() {
    try {
        const response = await axios.get(`/appointments/pending-confirmation/provider/${authStore.user._id}`, {
            params: { limit: 1 } // Just get count, not all data
        })
        pendingCount.value = response.data.pagination.total
    } catch (error) {
        console.error('Error fetching pending count:', error)
        pendingCount.value = 0
    }
}

async function markAsNoShow(appointmentId) {
    if (!confirm('Are you sure you want to mark this appointment as no-show?')) return

    try {
        await axios.patch(`/appointments/${appointmentId}/status`, {
            status: 'no-show'
        })
        await fetchAppointments()
    } catch (error) {
        console.error('Error updating appointment status:', error)
    }
}

async function joinSession(appointmentId) {
    try {
        const response = await axios.get(`/sessions/${appointmentId}/join`)
        if (response.data.session) {
            router.push({
                name: 'session-room',
                params: { appointmentId }
            })
        }
    } catch (error) {
        console.error('Error joining session:', error)
    }
}

function handlePageChange(page) {
    currentPage.value = page
    fetchAppointments()
}

function refreshPendingCount() {
    fetchPendingCount()
    // If we're on the pending tab and an appointment was confirmed, 
    // we might want to refresh that view too
}

// Lifecycle
onMounted(() => {
    fetchPendingCount()
    if (activeTab.value === 'scheduled') {
        fetchAppointments()
    }

    // Set up interval to refresh pending count
    const refreshInterval = setInterval(() => {
        fetchPendingCount()
    }, 60000) // Refresh every minute

    // Clean up interval
    onBeforeUnmount(() => {
        clearInterval(refreshInterval)
    })
})

// Watch for tab changes
watch(activeTab, (newTab) => {
    if (newTab === 'scheduled') {
        fetchAppointments()
    }
})
</script>