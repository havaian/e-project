<template>
    <div class="appointment-calendar">
        <!-- Calendar Controls -->
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex w-full items-center justify-between space-x-4">
                <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
                <div class="flex items-center space-x-2">
                    <button @click="goToToday"
                        class="px-3 py-1 text-sm bg-brand-1 text-white rounded-lg hover:bg-brand-1/90 transition-colors">
                        Today
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center h-96 bg-gray-50 rounded-lg">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-1"></div>
        </div>

        <!-- Calendar View -->
        <div v-else-if="currentView === 'calendar'">
            <ReusableCalendar ref="calendarRef" v-model="selectedDate" :events="calendarEvents"
                :disable-past-dates="true" :max-future-days="60" :show-appointment-count="true"
                :show-selected-date-info="false" @date-selected="handleDateSelected"
                @month-changed="handleMonthChanged">
                <!-- Custom footer with selected date appointments -->
                <template #footer="{ selectedDate }">
                    <div v-if="selectedDate && selectedDateAppointments.length > 0"
                        class="border-t border-gray-200 p-4">
                        <h3 class="text-sm font-medium text-gray-900 mb-3">
                            Appointments for {{ formatSelectedDate(selectedDate) }}
                        </h3>
                        <div class="space-y-2">
                            <div v-for="appointment in selectedDateAppointments" :key="appointment.id"
                                class="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                <div class="flex items-center space-x-2">
                                    <div class="w-2 h-2 rounded-full" :class="getStatusColor(appointment.status)"></div>
                                    <span class="font-medium">
                                        {{ userRole === 'provider' ? getClientName(appointment) :
                                            getProviderName(appointment) }}
                                    </span>
                                    <span class="text-gray-600">{{ formatAppointmentTime(appointment.dateTime) }}</span>
                                </div>
                                <div class="flex space-x-1">
                                    <button @click="viewAppointment(appointment.id)"
                                        class="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                                        View
                                    </button>
                                    <button v-if="canEditAppointment(appointment)"
                                        @click="editAppointment(appointment.id)"
                                        class="px-2 py-1 text-xs text-green-700 bg-green-100 rounded hover:bg-green-200">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </ReusableCalendar>
        </div>

        <!-- List View -->
        <div v-else-if="currentView === 'list'" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="divide-y divide-gray-200">
                <div v-if="appointments.length === 0" class="p-8 text-center">
                    <CalendarDaysIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p class="text-gray-500">No appointments found</p>
                </div>
                <div v-for="appointment in appointments" :key="appointment.id"
                    class="p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-4 h-4 rounded-full" :class="getStatusColor(appointment.status)"></div>
                            <div>
                                <p class="font-medium text-gray-900">
                                    {{ userRole === 'provider' ? getClientName(appointment) :
                                        getProviderName(appointment) }}
                                </p>
                                <p class="text-sm text-gray-600">{{ formatDateTime(appointment.dateTime) }}</p>
                                <p class="text-xs text-gray-500">{{ appointment.type }} • {{ appointment.status }}</p>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="viewAppointment(appointment.id)"
                                class="px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                                View
                            </button>
                            <button v-if="canEditAppointment(appointment)" @click="editAppointment(appointment.id)"
                                class="px-3 py-2 text-sm text-green-700 bg-green-100 rounded hover:bg-green-200">
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex flex-wrap gap-4 text-sm">
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-500 rounded"></div>
                <span class="text-gray-600">Scheduled</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded"></div>
                <span class="text-gray-600">Completed</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-red-500 rounded"></div>
                <span class="text-gray-600">Cancelled</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-yellow-500 rounded"></div>
                <span class="text-gray-600">Pending</span>
            </div>
            <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-purple-500 rounded"></div>
                <span class="text-gray-600">Needs Confirmation</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO, isFuture, isSameDay } from 'date-fns'
import { CalendarDaysIcon } from '@heroicons/vue/24/outline'
import axios from '@/plugins/axios'
import ReusableCalendar from './ReusableCalendar.vue'

const props = defineProps({
    userRole: {
        type: String,
        required: true,
        validator: value => ['client', 'provider'].includes(value)
    },
    title: {
        type: String,
        default: 'Appointments'
    }
})

const emit = defineEmits(['openBooking', 'appointmentUpdated'])

const router = useRouter()

// Component state
const loading = ref(false)
const currentView = ref('calendar')
const selectedDate = ref(null)
const appointments = ref([])
const calendarRef = ref(null)

// ADDED: Debouncing and request management
const loadingRequest = ref(null)
const monthChangedTimeout = ref(null)

// Computed properties
const calendarEvents = computed(() => {
    return appointments.value.map(appointment => ({
        id: appointment._id,
        date: appointment.dateTime,
        dateTime: appointment.dateTime,
        title: props.userRole === 'provider'
            ? getClientName(appointment)
            : getProviderName(appointment),
        status: appointment.status,
        type: appointment.type
    }))
})

const selectedDateAppointments = computed(() => {
    if (!selectedDate.value) return []

    return appointments.value.filter(appointment => {
        const appointmentDate = new Date(appointment.dateTime)
        return isSameDay(selectedDate.value, appointmentDate)
    })
})

// Methods
const loadAppointmentsForMonth = async (month) => {
    // ADDED: Cancel previous request if still pending
    if (loadingRequest.value) {
        loadingRequest.value.cancel?.()
    }

    loading.value = true
    try {
        // Calculate start and end of the month
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString()
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString()

        console.log('Loading appointments for month:', format(month, 'MMMM yyyy'), { startDate, endDate })

        // ADDED: Create cancellable request
        const controller = new AbortController()
        loadingRequest.value = controller

        const response = await axios.get('/appointments/calendar', {
            params: { startDate, endDate },
            signal: controller.signal
        })

        // ADDED: Only update if this is still the current request
        if (loadingRequest.value === controller) {
            appointments.value = response.data.calendarEvents || []
            console.log('Loaded appointments:', appointments.value.length)
            loadingRequest.value = null
        }
    } catch (error) {
        // ADDED: Don't log cancelled requests as errors
        if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
            console.error('Error loading appointments for month:', error)
            if (loadingRequest.value) {
                appointments.value = []
                loadingRequest.value = null
            }
        }
    } finally {
        loading.value = false
    }
}

const handleDateSelected = (date, dayInfo) => {
    selectedDate.value = date

    // If client and date has no appointments, allow booking
    if (props.userRole === 'client' && dayInfo.events.length === 0) {
        emit('openBooking', { date })
    }
}

// FIXED: Added debouncing to prevent multiple rapid calls
const handleMonthChanged = (newMonth) => {
    console.log('Month changed to:', format(newMonth, 'MMMM yyyy'))

    // Clear any existing timeout
    if (monthChangedTimeout.value) {
        clearTimeout(monthChangedTimeout.value)
    }

    // Debounce the API call by 300ms
    monthChangedTimeout.value = setTimeout(() => {
        loadAppointmentsForMonth(newMonth)
    }, 300)
}

const goToToday = () => {
    const today = new Date()
    selectedDate.value = today

    // Use the calendar ref to navigate to today
    if (calendarRef.value) {
        calendarRef.value.goToToday()
    }

    // Load appointments for current month
    loadAppointmentsForMonth(today)
}

const changeView = (viewName) => {
    currentView.value = viewName
}

const refreshCalendar = () => {
    // Get current month from calendar or use current date
    const currentMonth = calendarRef.value?.currentMonth || new Date()
    loadAppointmentsForMonth(currentMonth)
}

const getStatusColor = (status) => {
    const colors = {
        'scheduled': 'bg-blue-500',
        'completed': 'bg-green-500',
        'canceled': 'bg-red-500',
        'no-show': 'bg-gray-500',
        'pending-provider-confirmation': 'bg-purple-500',
        'pending-payment': 'bg-yellow-500'
    }
    return colors[status] || 'bg-gray-500'
}

const getClientName = (appointment) => {
    const client = appointment.client
    if (!client) return 'Unknown Client'
    return `${client.firstName || ''} ${client.lastName || ''}`.trim() || 'Client'
}

const getProviderName = (appointment) => {
    const provider = appointment.provider
    if (!provider) return 'Unknown Provider'
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'
}

const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const formatSelectedDate = (date) => {
    return format(date, 'EEEE, MMMM d, yyyy')
}

const formatAppointmentTime = (dateTime) => {
    return format(parseISO(dateTime), 'h:mm a')
}

const canEditAppointment = (appointment) => {
    // Can edit if appointment is in the future and not completed/canceled
    const appointmentDate = new Date(appointment.dateTime)
    return isFuture(appointmentDate) &&
        !['completed', 'canceled', 'no-show'].includes(appointment.status)
}

const viewAppointment = (appointmentId) => {
    router.push(`/appointments/${appointmentId}`)
}

const editAppointment = (appointmentId) => {
    router.push(`/appointments/${appointmentId}/edit`)
}

// Lifecycle
onMounted(async () => {
    await nextTick()
    // Load appointments for current month on mount
    const currentMonth = new Date()
    loadAppointmentsForMonth(currentMonth)
})

// ADDED: Cleanup on unmount
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
    // Cancel any pending request
    if (loadingRequest.value) {
        loadingRequest.value.cancel?.()
    }
    // Clear any pending timeout
    if (monthChangedTimeout.value) {
        clearTimeout(monthChangedTimeout.value)
    }
})

// Expose methods for parent component
defineExpose({
    refreshCalendar,
    goToDate: (date) => {
        selectedDate.value = date
        if (calendarRef.value) {
            calendarRef.value.goToDate(date)
        }
        loadAppointmentsForMonth(date)
    }
})
</script>

<style scoped>
.brand-1 {
    color: #0ea5e9;
}
</style>