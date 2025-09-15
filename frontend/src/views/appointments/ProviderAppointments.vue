<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">My Appointments</h1>
                            <p class="mt-1 text-sm text-gray-600">
                                Manage your client appointments and sessions
                            </p>
                        </div>

                        <!-- View Toggle & Actions -->
                        <div class="flex items-center space-x-4">
                            <!-- Calendar Controls -->
                            <CalendarControls :current-view="currentView" user-role="provider"
                                :calendar-view-mode="calendarViewMode" :sort-by="sortBy" :sort-direction="sortDirection"
                                @view-change="handleViewChange" @navigate="handleCalendarNavigate"
                                @calendar-view-change="handleCalendarViewChange" @sort-change="handleSortChange"
                                @sort-direction-change="handleSortDirectionChange" @export="handleExport"
                                @print="handlePrint" @refresh="handleRefresh" @bulk-action="handleBulkAction" />

                            <router-link to="/profile/provider" class="btn-secondary px-4 py-2">
                                <UserIcon class="w-4 h-4 mr-2" />
                                Availability
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Pending Confirmations Alert -->
            <div v-if="pendingCount > 0" class="mb-6">
                <div class="bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div class="flex items-center">
                        <ExclamationCircleIcon class="w-5 h-5 text-orange-600 mr-3" />
                        <div class="flex-1">
                            <p class="text-sm font-medium text-orange-800">
                                You have {{ pendingCount }} appointment{{ pendingCount > 1 ? 's' : '' }} pending
                                confirmation
                            </p>
                        </div>
                        <button @click="activeTab = 'pending'"
                            class="text-sm text-orange-600 hover:text-orange-800 font-medium">
                            Review Now
                        </button>
                    </div>
                </div>
            </div>

            <!-- Calendar View -->
            <div v-if="currentView === 'calendar'" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <AppointmentCalendar ref="appointmentCalendar" user-role="provider" title="My Appointments"
                    :calendar-view-mode="calendarViewMode" @appointment-updated="handleAppointmentUpdate" />
            </div>

            <!-- List View -->
            <div v-else>
                <!-- Tabs -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <div class="border-b border-gray-200">
                        <nav class="flex space-x-8 px-6" aria-label="Tabs">
                            <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="[
                                'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                                activeTab === tab.key
                                    ? 'border-brand-1 text-brand-1'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            ]">
                                {{ tab.label }}
                                <span v-if="tab.key === 'pending' && pendingCount > 0"
                                    class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {{ pendingCount }}
                                </span>
                            </button>
                        </nav>
                    </div>

                    <!-- Filters -->
                    <div class="p-6 border-b border-gray-200">
                        <div class="flex flex-col sm:flex-row gap-4">
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input v-model="filters.date" @change="fetchAppointments" type="date"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1">
                            </div>

                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select v-model="filters.status" @change="fetchAppointments"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1">
                                    <option value="">All Statuses</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="completed">Completed</option>
                                    <option value="canceled">Cancelled</option>
                                </select>
                            </div>

                            <div class="flex items-end">
                                <button @click="resetFilters"
                                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pending Confirmations -->
                <div v-if="activeTab === 'pending'" class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                    <PendingConfirmations @refresh="fetchAppointments" />
                </div>

                <!-- Appointments List -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200">
                    <!-- Loading State -->
                    <div v-if="loading" class="p-6">
                        <div class="space-y-4">
                            <div v-for="i in 5" :key="i" class="animate-pulse">
                                <div class="flex items-center space-x-4">
                                    <div class="w-16 h-16 bg-gray-200 rounded-lg"></div>
                                    <div class="flex-1 space-y-2">
                                        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                    <div class="w-20 h-8 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Appointments -->
                    <div v-else-if="sortedAppointments.length > 0" class="divide-y divide-gray-200">
                        <div v-for="appointment in sortedAppointments" :key="appointment._id"
                            class="p-6 hover:bg-gray-50 transition-colors">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <!-- Client Avatar -->
                                    <div class="relative">
                                        <img :src="appointment.client?.profilePicture || '/images/default-avatar.png'"
                                            :alt="getClientName(appointment.client)"
                                            class="w-16 h-16 rounded-xl object-cover">
                                        <div
                                            class="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
                                        </div>
                                    </div>

                                    <div class="flex-1">
                                        <div class="flex items-center space-x-3">
                                            <h3 class="text-lg font-semibold text-gray-900">
                                                {{ getClientName(appointment.client) }}
                                            </h3>
                                            <span :class="getStatusClass(appointment.status)"
                                                class="px-2 py-1 text-xs font-medium rounded-full capitalize">
                                                {{ appointment.status.replace('-', ' ') }}
                                            </span>
                                        </div>

                                        <div class="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                                            <div class="flex items-center space-x-1">
                                                <CalendarDaysIcon class="w-4 h-4" />
                                                <span>{{ formatDateTime(appointment.dateTime) }}</span>
                                            </div>
                                            <div class="flex items-center space-x-1">
                                                <VideoCameraIcon class="w-4 h-4" />
                                                <span class="capitalize">{{ appointment.type || 'Video Session'
                                                    }}</span>
                                            </div>
                                            <div v-if="appointment.client?.dateOfBirth"
                                                class="flex items-center space-x-1">
                                                <UserIcon class="w-4 h-4" />
                                                <span>Age {{ calculateAge(appointment.client.dateOfBirth) }}</span>
                                            </div>
                                        </div>

                                        <p v-if="appointment.shortDescription"
                                            class="mt-1 text-sm text-gray-500 line-clamp-1">
                                            {{ appointment.shortDescription }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Action Buttons -->
                                <div class="flex items-center space-x-3">
                                    <!-- Join Session (if within window) -->
                                    <button
                                        v-if="isWithinJoinWindow(appointment.dateTime) && appointment.status === 'scheduled'"
                                        @click="joinSession(appointment._id)" class="btn-primary px-4 py-2 text-sm">
                                        <VideoCameraIcon class="w-4 h-4 mr-2" />
                                        Start Session
                                    </button>

                                    <!-- Future appointment actions -->
                                    <template
                                        v-else-if="isAppointmentInFuture(appointment.dateTime) && appointment.status === 'scheduled'">
                                        <button @click="rescheduleAppointment(appointment._id)"
                                            class="px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                            Reschedule
                                        </button>
                                        <button @click="cancelAppointment(appointment._id)"
                                            class="px-3 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                                            Cancel
                                        </button>
                                    </template>

                                    <!-- Completed appointment actions -->
                                    <template v-else-if="appointment.status === 'completed'">
                                        <button @click="addSessionResults(appointment._id)"
                                            class="px-3 py-2 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                            <DocumentTextIcon class="w-4 h-4 mr-2" />
                                            Results
                                        </button>
                                    </template>

                                    <!-- View Details -->
                                    <router-link :to="`/appointments/${appointment._id}`"
                                        class="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                                        <EyeIcon class="w-4 h-4 mr-2" />
                                        Details
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="p-12 text-center">
                        <CalendarDaysIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                        <p class="text-gray-600 mb-6">
                            {{ filters.status || filters.date ? 'Try adjusting your filters' : 'Clients will book appointments with you based on your availability' }}
                        </p>
                        <router-link to="/profile/provider" class="btn-primary px-6 py-3">
                            Update Availability
                        </router-link>
                    </div>

                    <!-- Pagination -->
                    <div v-if="sortedAppointments.length > 0 && totalPages > 1"
                        class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-700">
                                Showing {{ (currentPage - 1) * 10 + 1 }} to {{ Math.min(currentPage * 10,
                                totalAppointments) }}
                                of {{ totalAppointments }} appointments
                            </div>

                            <div class="flex items-center space-x-2">
                                <button v-if="currentPage > 1" @click="handlePageChange(currentPage - 1)"
                                    class="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <ChevronLeftIcon class="w-4 h-4" />
                                </button>

                                <div class="flex space-x-1">
                                    <button v-for="page in visiblePages" :key="page" :class="[
                                        'px-3 py-2 text-sm rounded-lg transition-colors',
                                        page === currentPage
                                            ? 'bg-brand-1 text-white'
                                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                    ]" @click="handlePageChange(page)">
                                        {{ page }}
                                    </button>
                                </div>

                                <button v-if="currentPage < totalPages" @click="handlePageChange(currentPage + 1)"
                                    class="px-3 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <ChevronRightIcon class="w-4 h-4" />
                                </button>
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
    UserIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    EyeIcon,
    ExclamationCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from "@heroicons/vue/24/outline"
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, differenceInYears, isWithinInterval, subMinutes, addMinutes, isFuture } from 'date-fns'
import axios from '@/plugins/axios'
import PendingConfirmations from '@/components/appointments/PendingConfirmations.vue'
import AppointmentCalendar from '@/components/calendar/AppointmentCalendar.vue'
import CalendarControls from '@/components/calendar/CalendarControls.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const currentView = ref('calendar') // 'list' or 'calendar'
const activeTab = ref('scheduled') // 'scheduled', 'completed', 'pending'
const appointments = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalAppointments = ref(0)
const pendingCount = ref(0)
const appointmentCalendar = ref(null)

// Calendar controls state
const calendarViewMode = ref('dayGridMonth')
const sortBy = ref('dateTime')
const sortDirection = ref('desc')

const filters = reactive({
    date: format(new Date(), 'yyyy-MM-dd'),
    status: ''
})

// Tab configuration
const tabs = [
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'completed', label: 'Completed' },
    { key: 'pending', label: 'Pending Confirmation' }
]

// Computed
const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

const sortedAppointments = computed(() => {
    if (!appointments.value.length) return []

    const sorted = [...appointments.value].sort((a, b) => {
        let aValue, bValue

        switch (sortBy.value) {
            case 'dateTime':
                aValue = new Date(a.dateTime)
                bValue = new Date(b.dateTime)
                break
            case 'status':
                aValue = a.status
                bValue = b.status
                break
            case 'client':
                aValue = getClientName(a.client)
                bValue = getClientName(b.client)
                break
            case 'type':
                aValue = a.type || 'video'
                bValue = b.type || 'video'
                break
            default:
                return 0
        }

        if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
        if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
        return 0
    })

    return sorted
})

// Methods
const fetchAppointments = async () => {
    try {
        loading.value = true
        const params = {
            limit: 10,
            skip: (currentPage.value - 1) * 10,
            ...filters
        }

        // Set status based on active tab
        if (activeTab.value === 'scheduled') {
            params.status = 'scheduled'
        } else if (activeTab.value === 'completed') {
            params.status = 'completed'
        } else if (activeTab.value === 'pending') {
            params.status = 'pending-provider-confirmation'
        }

        const response = await axios.get(`/appointments/provider/${authStore.user.id}`, { params })
        appointments.value = response.data.appointments || []
        totalAppointments.value = response.data.pagination?.total || 0
        totalPages.value = Math.ceil(totalAppointments.value / 10)
    } catch (error) {
        console.error('Error fetching appointments:', error)
    } finally {
        loading.value = false
    }
}

const fetchPendingCount = async () => {
    try {
        const response = await axios.get(`/appointments/pending-confirmation/provider/${authStore.user.id}`)
        pendingCount.value = response.data.appointments?.length || 0
    } catch (error) {
        console.error('Error fetching pending count:', error)
    }
}

const resetFilters = () => {
    filters.status = ''
    filters.date = format(new Date(), 'yyyy-MM-dd')
    currentPage.value = 1
    fetchAppointments()
}

// Utility functions
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const calculateAge = (dateOfBirth) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth))
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

const isAppointmentInFuture = (dateTime) => {
    return isFuture(parseISO(dateTime))
}

const getStatusClass = (status) => {
    const classes = {
        'scheduled': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'canceled': 'bg-red-100 text-red-800',
        'cancelled': 'bg-red-100 text-red-800',
        'no-show': 'bg-gray-100 text-gray-800',
        'pending-provider-confirmation': 'bg-purple-100 text-purple-800',
        'pending-payment': 'bg-yellow-100 text-yellow-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

// Actions
const joinSession = async (appointmentId) => {
    try {
        router.push(`/session/${appointmentId}`)
    } catch (error) {
        console.error('Error joining session:', error)
    }
}

const rescheduleAppointment = (appointmentId) => {
    router.push(`/appointments/${appointmentId}/edit`)
}

const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
        await axios.patch(`/appointments/${appointmentId}`, {
            status: 'canceled'
        })
        fetchAppointments()
        fetchPendingCount()
        // Refresh calendar if in calendar view
        if (currentView.value === 'calendar' && appointmentCalendar.value) {
            appointmentCalendar.value.refreshCalendar()
        }
        // TODO: Show success notification
    } catch (error) {
        console.error('Error canceling appointment:', error)
        // TODO: Show error notification
    }
}

const addSessionResults = (appointmentId) => {
    router.push(`/appointments/${appointmentId}#session-results`)
}

const handlePageChange = (page) => {
    currentPage.value = page
    fetchAppointments()
}

// Calendar Controls handlers
const handleViewChange = (view) => {
    currentView.value = view
}

const handleCalendarNavigate = (direction) => {
    if (appointmentCalendar.value) {
        appointmentCalendar.value.navigate(direction)
    }
}

const handleCalendarViewChange = (viewMode) => {
    calendarViewMode.value = viewMode
}

const handleSortChange = (newSortBy) => {
    sortBy.value = newSortBy
}

const handleSortDirectionChange = () => {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const handleExport = (format) => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`)
}

const handlePrint = () => {
    // TODO: Implement print functionality
    window.print()
}

const handleRefresh = () => {
    fetchAppointments()
    fetchPendingCount()
}

const handleBulkAction = (action) => {
    // TODO: Implement bulk actions
    console.log(`Bulk action: ${action}`)
}

// Calendar event handlers
const handleAppointmentUpdate = (updateInfo) => {
    // Refresh list view data when calendar is updated
    if (currentView.value === 'list') {
        fetchAppointments()
    }
    fetchPendingCount()
    // TODO: Show update notification
}

// Watch for tab changes
watch(activeTab, () => {
    currentPage.value = 1
    fetchAppointments()
})

// Lifecycle
onMounted(() => {
    if (currentView.value === 'list') {
        fetchAppointments()
    }
    fetchPendingCount()
})
</script>

<style scoped>
.btn-primary {
    @apply bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-all duration-200 shadow-lg;
}

.btn-secondary {
    @apply bg-white text-gray-700 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 transition-all duration-200;
}

.brand-1 {
    background-color: #0ea5e9;
    color: #0ea5e9;
}

.line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
}
</style>