<template>
    <div class="appointment-calendar">
        <!-- Calendar Controls -->
        <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center space-x-4">
                <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
                <div class="flex items-center space-x-2">
                    <button @click="goToPreviousPeriod"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
                    </button>
                    <button @click="goToToday"
                        class="px-3 py-1 text-sm bg-brand-1 text-white rounded-lg hover:bg-brand-1/90 transition-colors">
                        Today
                    </button>
                    <button @click="goToNextPeriod"
                        class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRightIcon class="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <!-- View Switcher -->
            <div class="flex items-center space-x-2">
                <div class="bg-gray-100 rounded-lg p-1 flex">
                    <button v-for="view in viewOptions" :key="view.key"
                        @click="changeView(view.key)"
                        :class="[
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

        <!-- FullCalendar Component -->
        <div v-else class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <FullCalendar ref="calendar" :options="calendarOptions" />
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

        <!-- Appointment Details Modal -->
        <div v-if="selectedEvent" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Appointment Details</h3>
                        <button @click="selectedEvent = null" class="text-gray-400 hover:text-gray-600">
                            <XMarkIcon class="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="text-sm font-medium text-gray-700">
                                {{ userRole === 'provider' ? 'Client' : 'Provider' }}
                            </label>
                            <p class="text-gray-900">{{ selectedEvent.title }}</p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Date & Time</label>
                            <p class="text-gray-900">{{ formatEventDateTime(selectedEvent) }}</p>
                        </div>
                        
                        <div>
                            <label class="text-sm font-medium text-gray-700">Status</label>
                            <span :class="getStatusClass(selectedEvent.extendedProps.status)"
                                class="inline-block px-2 py-1 text-xs font-medium rounded-full capitalize">
                                {{ selectedEvent.extendedProps.status }}
                            </span>
                        </div>
                        
                        <div v-if="selectedEvent.extendedProps.shortDescription">
                            <label class="text-sm font-medium text-gray-700">Description</label>
                            <p class="text-gray-900">{{ selectedEvent.extendedProps.shortDescription }}</p>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="mt-6 flex justify-end space-x-3">
                        <button @click="selectedEvent = null"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Close
                        </button>
                        
                        <!-- Future appointment actions -->
                        <template v-if="isEventInFuture(selectedEvent)">
                            <button @click="editAppointment(selectedEvent.extendedProps.appointmentId)"
                                class="px-4 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200">
                                Edit
                            </button>
                            <button @click="cancelAppointment(selectedEvent.extendedProps.appointmentId)"
                                class="px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
                                Cancel
                            </button>
                        </template>
                        
                        <!-- View details button -->
                        <button @click="viewAppointmentDetails(selectedEvent.extendedProps.appointmentId)"
                            class="px-4 py-2 text-sm text-brand-1 bg-brand-1/10 rounded-lg hover:bg-brand-1/20">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, isFuture } from 'date-fns'
import axios from '@/plugins/axios'
import { 
    ChevronLeftIcon, 
    ChevronRightIcon, 
    PlusIcon, 
    XMarkIcon 
} from '@heroicons/vue/24/outline'

// FullCalendar imports (these need to be installed)
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

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
const authStore = useAuthStore()

// Component state
const calendar = ref(null)
const loading = ref(false)
const currentView = ref('dayGridMonth')
const selectedEvent = ref(null)
const events = ref([])

// View options
const viewOptions = [
    { key: 'dayGridMonth', label: 'Month' },
    { key: 'timeGridWeek', label: 'Week' },
    { key: 'timeGridDay', label: 'Day' }
]

// FullCalendar configuration
const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: currentView.value,
    headerToolbar: false, // We're using custom header
    height: 'auto',
    events: events.value,
    editable: true,
    droppable: true,
    eventResizableFromStart: true,
    eventDurationEditable: true,
    eventStartEditable: true,
    selectable: props.userRole === 'client',
    selectMirror: true,
    weekends: true,
    dayMaxEvents: true,
    eventClick: handleEventClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
    select: handleDateSelect,
    eventDidMount: handleEventMount,
    eventMouseEnter: handleEventMouseEnter,
    eventMouseLeave: handleEventMouseLeave
}))

// Methods
const loadAppointments = async () => {
    loading.value = true
    try {
        const calendarApi = calendar.value?.getApi()
        const view = calendarApi?.view
        
        let startDate, endDate
        if (view) {
            startDate = view.activeStart.toISOString()
            endDate = view.activeEnd.toISOString()
        } else {
            // Fallback dates
            const now = new Date()
            startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        }

        const response = await axios.get('/appointments/calendar', {
            params: { startDate, endDate }
        })
        
        events.value = response.data.calendarEvents || []
    } catch (error) {
        console.error('Error loading appointments:', error)
        // TODO: Show error notification
    } finally {
        loading.value = false
    }
}

const handleEventClick = (clickInfo) => {
    selectedEvent.value = clickInfo.event
}

const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo
    const appointmentId = event.extendedProps.appointmentId
    
    try {
        await axios.patch(`/appointments/${appointmentId}`, {
            dateTime: event.start.toISOString(),
            endTime: event.end?.toISOString()
        })
        
        emit('appointmentUpdated', { id: appointmentId, type: 'moved' })
        // TODO: Show success notification
    } catch (error) {
        console.error('Error updating appointment:', error)
        dropInfo.revert() // Revert the change
        // TODO: Show error notification
    }
}

const handleEventResize = async (resizeInfo) => {
    const { event } = resizeInfo
    const appointmentId = event.extendedProps.appointmentId
    
    try {
        await axios.patch(`/appointments/${appointmentId}`, {
            dateTime: event.start.toISOString(),
            endTime: event.end?.toISOString()
        })
        
        emit('appointmentUpdated', { id: appointmentId, type: 'resized' })
        // TODO: Show success notification
    } catch (error) {
        console.error('Error updating appointment:', error)
        resizeInfo.revert() // Revert the change
        // TODO: Show error notification
    }
}

const handleDateSelect = (selectInfo) => {
    if (props.userRole === 'client') {
        // Open booking modal with selected date
        emit('openBooking', {
            date: selectInfo.start,
            endDate: selectInfo.end
        })
    }
}

const handleEventMount = (info) => {
    // Add custom styling based on appointment status
    const status = info.event.extendedProps.status
    const element = info.el
    
    // Add status-specific classes
    element.classList.add(`appointment-${status}`)
    
    // Add tooltips or other enhancements
    element.title = `${info.event.title} - ${status}`
}

const handleEventMouseEnter = (mouseEnterInfo) => {
    // Add hover effects if needed
}

const handleEventMouseLeave = (mouseLeaveInfo) => {
    // Remove hover effects if needed
}

// Navigation methods
const goToPreviousPeriod = () => {
    calendar.value?.getApi().prev()
}

const goToNextPeriod = () => {
    calendar.value?.getApi().next()
}

const goToToday = () => {
    calendar.value?.getApi().today()
}

const changeView = (viewName) => {
    currentView.value = viewName
    calendar.value?.getApi().changeView(viewName)
}

// Utility methods
const formatEventDateTime = (event) => {
    if (!event.start) return ''
    const start = format(new Date(event.start), 'MMM d, yyyy h:mm a')
    if (event.end) {
        const end = format(new Date(event.end), 'h:mm a')
        return `${start} - ${end}`
    }
    return start
}

const isEventInFuture = (event) => {
    return event.start && isFuture(new Date(event.start))
}

const getStatusClass = (status) => {
    const classes = {
        'scheduled': 'bg-blue-100 text-blue-800',
        'completed': 'bg-green-100 text-green-800',
        'canceled': 'bg-red-100 text-red-800',
        'no-show': 'bg-gray-100 text-gray-800',
        'pending-provider-confirmation': 'bg-purple-100 text-purple-800',
        'pending-payment': 'bg-yellow-100 text-yellow-800'
    }
    return classes[status] || 'bg-gray-100 text-gray-800'
}

// Action methods
const editAppointment = (appointmentId) => {
    selectedEvent.value = null
    router.push(`/appointments/${appointmentId}/edit`)
}

const cancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    try {
        await axios.patch(`/appointments/${appointmentId}`, { status: 'canceled' })
        emit('appointmentUpdated', { id: appointmentId, type: 'cancelled' })
        selectedEvent.value = null
        await loadAppointments() // Refresh calendar
        // TODO: Show success notification
    } catch (error) {
        console.error('Error cancelling appointment:', error)
        // TODO: Show error notification
    }
}

const viewAppointmentDetails = (appointmentId) => {
    selectedEvent.value = null
    router.push(`/appointments/${appointmentId}`)
}

// Lifecycle
onMounted(async () => {
    await nextTick()
    await loadAppointments()
})

// Watch for view changes to reload data
watch(currentView, () => {
    nextTick(() => {
        loadAppointments()
    })
})

// Expose methods for parent component
defineExpose({
    refreshCalendar: loadAppointments,
    goToDate: (date) => calendar.value?.getApi().gotoDate(date)
})
</script>

<style scoped>
/* FullCalendar custom styles */
:deep(.fc) {
    font-family: inherit;
}

:deep(.fc-theme-standard td, .fc-theme-standard th) {
    border-color: #e5e7eb;
}

:deep(.fc-theme-standard .fc-scrollgrid) {
    border-color: #e5e7eb;
}

:deep(.fc-col-header-cell-cushion) {
    color: #6b7280;
    font-weight: 600;
    text-decoration: none;
}

:deep(.fc-daygrid-day-number) {
    color: #374151;
    font-weight: 500;
    text-decoration: none;
}

/* Status-based event styling */
:deep(.appointment-scheduled) {
    background-color: #3b82f6 !important;
    border-color: #2563eb !important;
}

:deep(.appointment-completed) {
    background-color: #10b981 !important;
    border-color: #059669 !important;
}

:deep(.appointment-canceled) {
    background-color: #ef4444 !important;
    border-color: #dc2626 !important;
}

:deep(.appointment-pending-provider-confirmation) {
    background-color: #8b5cf6 !important;
    border-color: #7c3aed !important;
}

:deep(.appointment-pending-payment) {
    background-color: #f59e0b !important;
    border-color: #d97706 !important;
}

:deep(.appointment-no-show) {
    background-color: #6b7280 !important;
    border-color: #4b5563 !important;
}

/* Event text styling */
:deep(.fc-event-title) {
    font-weight: 500;
    font-size: 0.875rem;
}

/* Hover effects */
:deep(.fc-event:hover) {
    opacity: 0.9;
    transform: translateY(-1px);
    transition: all 0.2s ease;
}

/* Today highlight */
:deep(.fc-day-today) {
    background-color: #fef3c7 !important;
}

/* Selection styling */
:deep(.fc-highlight) {
    background-color: #dbeafe !important;
}
</style>