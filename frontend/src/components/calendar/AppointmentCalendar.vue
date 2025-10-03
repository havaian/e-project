<template>
    <div class="appointment-calendar">
        <!-- Calendar Controls -->
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center space-x-4">
                <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
                <div class="flex items-center space-x-2">
                    <button @click="goToPreviousPeriod" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
                    </button>
                    <button @click="goToToday"
                        class="px-3 py-1 text-sm bg-brand-1 text-white rounded-lg hover:bg-brand-1/90 transition-colors">
                        Today
                    </button>
                    <button @click="goToNextPeriod" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRightIcon class="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <!-- View Switcher -->
            <div class="flex items-center space-x-2">
                <div class="bg-gray-100 rounded-lg p-1 flex">
                    <button v-for="view in viewOptions" :key="view.key" @click="changeView(view.key)" :class="[
                        'px-3 py-1 text-sm rounded-md transition-all duration-200',
                        currentView === view.key
                            ? 'bg-white text-brand-1 shadow-sm font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                    ]">
                        {{ view.label }}
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
            <ReusableCalendar v-model="selectedDate" :events="calendarEvents" :disable-past-dates="true"
                :max-future-days="60" :show-appointment-count="true" :show-selected-date-info="false"
                @date-selected="handleDateSelected" @month-changed="handleMonthChanged">
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO, isFuture, isSameDay } from 'date-fns'
import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
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

// View options
const viewOptions = [
    { key: 'calendar', label: 'Calendar' },
    { key: 'list', label: 'List' }
]

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
const loadAppointments = async () => {
    loading.value = true
    try {
        // Calculate date range for current month if no specific range is set
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

        const response = await axios.get('/appointments/calendar', {
            params: { startDate, endDate }
        })
        appointments.value = response.data.calendarEvents || []
    } catch (error) {
        console.error('Error loading appointments:', error)
        appointments.value = []
    } finally {
        loading.value = false
    }
}

const handleDateSelected = (date, dayInfo) => {
    selectedDate.value = date

    // Update viewing month if different
    const dateMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    if (dateMonth.getTime() !== currentViewingMonth.value.getTime()) {
        currentViewingMonth.value = dateMonth
    }

    // If client and date has no appointments, allow booking
    if (props.userRole === 'client' && dayInfo.events.length === 0) {
        emit('openBooking', { date })
    }
}

const handleMonthChanged = (newMonth) => {
    // Update current viewing month and reload appointments
    currentViewingMonth.value = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1)
    loadAppointmentsForMonth(newMonth)
}

const loadAppointmentsForMonth = async (month = new Date()) => {
    loading.value = true
    try {
        // Calculate start and end of the month
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString()
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString()

        const response = await axios.get('/appointments/calendar', {
            params: { startDate, endDate }
        })
        appointments.value = response.data.calendarEvents || []
    } catch (error) {
        console.error('Error loading appointments for month:', error)
        appointments.value = []
    } finally {
        loading.value = false
    }
}

const goToPreviousPeriod = () => {
    // Navigate to previous month
    const calendar = document.querySelector('.reusable-calendar')
    if (calendar) {
        calendar.previousMonth()
    }
}

const goToNextPeriod = () => {
    // Navigate to next month
    const calendar = document.querySelector('.reusable-calendar')
    if (calendar) {
        calendar.nextMonth()
    }
}

const goToToday = () => {
    selectedDate.value = new Date()
}

const changeView = (viewName) => {
    currentView.value = viewName
}

const refreshCalendar = () => {
    loadAppointments()
}

// Add a method to track current viewing month for proper date range requests
const currentViewingMonth = ref(new Date())

// Watch for viewing month changes to update appointment data
watch(currentViewingMonth, (newMonth) => {
    loadAppointmentsForMonth(newMonth)
})

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
onMounted(() => {
    loadAppointments()
})

// Expose methods for parent component
defineExpose({
    refreshCalendar: loadAppointments,
    goToDate: (date) => {
        selectedDate.value = date
    }
})
</script>

<style scoped>
.brand-1 {
    color: #0ea5e9;
}
</style>