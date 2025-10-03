<template>
    <div class="availability-calendar bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent">
            </div>
            <span class="ml-3 text-gray-600">Loading {{ mode === 'appointments' ? 'appointments' : 'availability'
            }}...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6 text-center">
            <div class="text-red-600 mb-4">
                <ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-2" />
                <p class="font-medium">Failed to load data</p>
                <p class="text-sm text-gray-600 mt-1">{{ error }}</p>
            </div>
            <button @click="loadData"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Retry
            </button>
        </div>

        <!-- Calendar Content -->
        <div v-else>
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-semibold">{{ getTitle() }}</h2>
                        <p class="text-blue-100 text-sm mt-1">{{ getSubtitle() }}</p>
                    </div>

                    <!-- View Toggle -->
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <button @click="currentView = 'weekly'"
                                :class="currentView === 'weekly' ? 'bg-blue-500 text-white' : 'bg-blue-400 text-blue-100'"
                                class="px-3 py-1 text-sm rounded-lg hover:bg-blue-500 transition-colors">
                                Weekly View
                            </button>
                            <button @click="currentView = 'calendar'"
                                :class="currentView === 'calendar' ? 'bg-blue-500 text-white' : 'bg-blue-400 text-blue-100'"
                                class="px-3 py-1 text-sm rounded-lg hover:bg-blue-500 transition-colors">
                                Calendar View
                            </button>
                        </div>

                        <!-- Mode-specific controls -->
                        <div v-if="mode === 'availability' && userRole === 'provider' && currentView === 'weekly'"
                            class="flex items-center space-x-2">
                            <button @click="setPreset('business')"
                                class="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-400 transition-colors">
                                Business Hours
                            </button>
                            <button @click="setPreset('flexible')"
                                class="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-400 transition-colors">
                                Flexible
                            </button>
                            <button @click="clearAll()"
                                class="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-400 transition-colors">
                                Clear All
                            </button>
                        </div>

                        <!-- Legend for appointments mode -->
                        <div v-if="mode === 'appointments'" class="flex items-center space-x-3 text-sm">
                            <div class="flex items-center space-x-1">
                                <div class="w-3 h-3 bg-green-400 rounded"></div>
                                <span class="text-blue-100">Available</span>
                            </div>
                            <div class="flex items-center space-x-1">
                                <div class="w-3 h-3 bg-blue-400 rounded"></div>
                                <span class="text-blue-100">Scheduled</span>
                            </div>
                            <div class="flex items-center space-x-1">
                                <div class="w-3 h-3 bg-yellow-400 rounded"></div>
                                <span class="text-blue-100">Pending</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar View -->
            <div v-if="currentView === 'calendar'" class="p-4">
                <ReusableCalendar v-model="selectedDate" :events="calendarEvents"
                    :disable-past-dates="mode === 'availability'" :max-future-days="90"
                    :show-appointment-count="mode === 'appointments'" :show-event-indicators="mode === 'availability'"
                    :show-selected-date-info="true" @date-selected="handleDateSelected"
                    @month-changed="handleMonthChanged">
                    <!-- Custom footer for availability editing -->
                    <template #footer="{ selectedDate }">
                        <div v-if="selectedDate && mode === 'availability' && userRole === 'provider'"
                            class="border-t border-gray-200 p-4">
                            <h3 class="text-sm font-medium text-gray-900 mb-3">
                                Availability for {{ formatSelectedDate(selectedDate) }}
                            </h3>
                            <div class="space-y-2">
                                <div v-for="(slot, index) in getSelectedDateAvailability(selectedDate)" :key="index"
                                    class="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
                                    <span>{{ slot.startTime }} - {{ slot.endTime }}</span>
                                    <button @click="removeTimeSlot(selectedDate, index)"
                                        class="px-2 py-1 text-xs text-red-700 bg-red-100 rounded hover:bg-red-200">
                                        Remove
                                    </button>
                                </div>
                                <button @click="addTimeSlotForDate(selectedDate)"
                                    class="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors text-sm">
                                    + Add Time Slot
                                </button>
                            </div>
                        </div>
                        <div v-else-if="selectedDate && mode === 'appointments'" class="border-t border-gray-200 p-4">
                            <h3 class="text-sm font-medium text-gray-900 mb-3">
                                Appointments for {{ formatSelectedDate(selectedDate) }}
                            </h3>
                            <div class="space-y-2">
                                <div v-for="appointment in getSelectedDateAppointments(selectedDate)"
                                    :key="appointment._id"
                                    class="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                    <div>
                                        <span class="font-medium">{{ getAppointmentTitle(appointment) }}</span>
                                        <span class="text-gray-600 ml-2">{{ getAppointmentTime(appointment) }}</span>
                                    </div>
                                    <button @click="$emit('appointmentClick', appointment)"
                                        class="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200">
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                </ReusableCalendar>
            </div>

            <!-- Weekly Grid View -->
            <div v-else-if="currentView === 'weekly'">
                <!-- Week Navigation -->
                <div class="flex items-center justify-center px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div class="flex items-center space-x-4">
                        <button @click="previousWeek" class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
                        </button>

                        <h3 class="text-lg font-semibold text-gray-900">
                            {{ getWeekRangeText() }}
                        </h3>

                        <button @click="nextWeek" class="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                            <ChevronRightIcon class="w-5 h-5 text-gray-600" />
                        </button>

                        <button @click="goToCurrentWeek"
                            class="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                            This Week
                        </button>
                    </div>
                </div>

                <!-- Time Grid -->
                <div class="flex">
                    <!-- Time Column -->
                    <div class="w-20 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                        <!-- Header spacer -->
                        <div class="h-12 border-b border-gray-200"></div>

                        <!-- Hour labels -->
                        <div v-for="hour in hours" :key="hour"
                            class="h-16 border-b border-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium">
                            {{ formatHour(hour) }}
                        </div>
                    </div>

                    <!-- Days Grid -->
                    <div class="flex-1 overflow-x-auto">
                        <div class="min-w-max">
                            <!-- Day Headers -->
                            <div class="flex h-12 border-b border-gray-200 bg-gray-50">
                                <div v-for="(day, dayIndex) in currentWeekDays" :key="dayIndex"
                                    class="flex-1 min-w-32 border-r border-gray-200 flex flex-col items-center justify-center">
                                    <div class="text-xs font-medium text-gray-600">{{ getDayName(day) }}</div>
                                    <div class="text-sm font-semibold"
                                        :class="isToday(day) ? 'text-blue-600' : 'text-gray-900'">
                                        {{ getDayNumber(day) }}
                                    </div>
                                </div>
                            </div>

                            <!-- Time Grid -->
                            <div class="relative">
                                <!-- Hours -->
                                <div v-for="hour in hours" :key="hour" class="flex h-16 border-b border-gray-100">
                                    <!-- Days for this hour -->
                                    <div v-for="(day, dayIndex) in currentWeekDays" :key="dayIndex"
                                        class="flex-1 min-w-32 border-r border-gray-200 relative">

                                        <!-- 30-minute slots -->
                                        <div v-for="slot in 2" :key="slot"
                                            :class="getSlotClasses(dayIndex, hour, slot - 1)"
                                            @mousedown="handleSlotMouseDown(dayIndex, hour, slot - 1)"
                                            @mouseenter="handleSlotMouseEnter(dayIndex, hour, slot - 1)"
                                            @mouseup="handleSlotMouseUp(dayIndex, hour, slot - 1)">

                                            <!-- Availability indicator -->
                                            <div v-if="mode === 'availability' && isSlotAvailable(dayIndex, hour, slot - 1)"
                                                class="absolute inset-0 bg-green-400 opacity-75">
                                            </div>

                                            <!-- Selection overlay -->
                                            <div v-if="isInSelection(dayIndex, hour, slot - 1) && mode === 'availability'"
                                                class="absolute inset-0 bg-blue-400 opacity-50">
                                            </div>

                                            <!-- Appointment overlay -->
                                            <div v-if="mode === 'appointments'" class="absolute inset-0">
                                                <!-- Available time background -->
                                                <div v-if="isSlotAvailable(dayIndex, hour, slot - 1)"
                                                    class="absolute inset-0 bg-green-50 border border-green-100 opacity-60">
                                                </div>

                                                <!-- Appointment blocks -->
                                                <div v-for="appointment in getSlotAppointments(dayIndex, hour, slot - 1)"
                                                    :key="appointment._id" :class="getAppointmentClasses(appointment)"
                                                    @click="$emit('appointmentClick', appointment)"
                                                    class="absolute inset-0 p-1 cursor-pointer rounded-sm text-white text-xs font-medium overflow-hidden">
                                                    <div class="truncate">{{ getAppointmentTitle(appointment) }}</div>
                                                    <div class="text-xs opacity-75">{{ getAppointmentTime(appointment)
                                                        }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Current time indicator -->
                                <div v-if="showCurrentTime && isCurrentWeek"
                                    class="absolute left-0 w-full h-0.5 bg-red-500 z-10 pointer-events-none"
                                    :style="{ top: currentTimePosition + 'px' }">
                                    <div class="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div class="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <!-- Availability mode footer -->
                <div v-if="mode === 'availability'">
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-600">
                            <span class="font-medium">{{ getAvailableDaysCount() }}</span> days •
                            <span class="font-medium">{{ getTotalAvailableHours() }}</span> hours per week
                        </div>

                        <div v-if="userRole === 'provider'" class="flex items-center space-x-3">
                            <button v-if="hasUnsavedChanges" @click="loadAvailability"
                                class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                Cancel Changes
                            </button>
                            <button @click="saveAvailability" :disabled="saving || !hasValidAvailability"
                                class="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {{ saving ? 'Saving...' : 'Save Availability' }}
                            </button>
                        </div>
                    </div>

                    <!-- Validation message -->
                    <div v-if="userRole === 'provider' && !hasValidAvailability" class="mt-2 text-sm text-red-600">
                        Please set at least one available time slot before saving.
                    </div>
                </div>

                <!-- Appointments mode footer -->
                <div v-if="mode === 'appointments'" class="flex items-center justify-between text-sm text-gray-600">
                    <div>
                        <span class="font-medium">{{ appointmentsSummary.total }}</span> appointments this week •
                        <span class="font-medium">{{ appointmentsSummary.scheduled }}</span> scheduled •
                        <span class="font-medium">{{ appointmentsSummary.pending }}</span> pending
                    </div>
                    <div class="flex items-center space-x-3">
                        <button @click="refreshData" class="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium">
                            <ArrowPathIcon class="w-4 h-4 mr-1 inline" />
                            Refresh
                        </button>
                        <button @click="$emit('viewFullCalendar')"
                            class="px-3 py-1 text-blue-600 hover:text-blue-800 font-medium">
                            View Full Calendar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ExclamationTriangleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowPathIcon
} from "@heroicons/vue/24/outline"
import { ref, reactive, computed, onMounted, watch } from 'vue'
import {
    format,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
    eachDayOfInterval,
    parseISO,
    isSameDay,
    isToday as isDateToday,
    isWithinInterval,
    isSameWeek
} from 'date-fns'
import axios from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import ReusableCalendar from './ReusableCalendar.vue'

const authStore = useAuthStore()

// Props (same as before)
const props = defineProps({
    mode: {
        type: String,
        default: 'availability',
        validator: (value) => ['availability', 'appointments'].includes(value)
    },
    userRole: {
        type: String,
        required: true,
        validator: (value) => ['client', 'provider'].includes(value)
    },
    providerId: {
        type: String,
        default: null
    },
    autoSave: {
        type: Boolean,
        default: false
    },
    showCurrentTime: {
        type: Boolean,
        default: true
    }
})

// Emits (same as before)
const emit = defineEmits([
    'saved',
    'error',
    'changed',
    'appointmentClick',
    'viewFullCalendar',
    'weekChanged'
])

// State (same as before plus new view state)
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const currentWeek = ref(new Date())
const currentView = ref('weekly') // 'weekly' or 'calendar'
const selectedDate = ref(null)
const isSelecting = ref(false)
const selectionStart = ref(null)
const selectionEnd = ref(null)
const hasUnsavedChanges = ref(false)

// Data stores (same as before)
const availability = reactive({})
const appointments = ref([])
const originalAvailability = ref([])

// Calendar configuration (same as before)
const hours = Array.from({ length: 24 }, (_, i) => i) // 0-23
const daysOfWeek = [1, 2, 3, 4, 5, 6, 0] // Monday to Sunday

// Computed properties (mostly same as before)
const currentWeekDays = computed(() => {
    const start = startOfWeek(currentWeek.value, { weekStartsOn: 1 }) // Monday
    const end = endOfWeek(currentWeek.value, { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
})

const isCurrentWeek = computed(() => {
    const now = new Date()
    return isSameWeek(currentWeek.value, now, { weekStartsOn: 1 })
})

const currentTimePosition = computed(() => {
    if (!isCurrentWeek.value) return 0

    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Calculate position: (hour * 64px) + (minute/60 * 64px)
    return (currentHour * 64) + ((currentMinute / 60) * 64)
})

const hasValidAvailability = computed(() => {
    return Object.values(availability).some(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    )
})

const appointmentsSummary = computed(() => {
    const total = appointments.value.length
    const scheduled = appointments.value.filter(apt => apt.extendedProps?.status === 'scheduled').length
    const pending = appointments.value.filter(apt => apt.extendedProps?.status === 'pending-provider-confirmation').length
    return { total, scheduled, pending }
})

const calendarEvents = computed(() => {
    if (props.mode === 'availability') {
        // Convert availability to events for calendar display
        const events = []
        Object.values(availability).forEach(day => {
            if (day.isAvailable && day.timeSlots) {
                const dayDate = currentWeekDays.value.find(d => d.getDay() === (day.dayOfWeek === 0 ? 7 : day.dayOfWeek) % 7)
                if (dayDate) {
                    day.timeSlots.forEach(slot => {
                        events.push({
                            id: `availability-${day.dayOfWeek}-${slot.startTime}`,
                            date: dayDate,
                            title: 'Available',
                            type: 'availability',
                            timeSlot: slot
                        })
                    })
                }
            }
        })
        return events
    } else {
        return appointments.value
    }
})

// Methods
const getTitle = () => {
    if (props.mode === 'availability') {
        return props.userRole === 'provider' ? 'Set Your Availability' : 'Provider Availability'
    }
    return 'Appointments & Availability'
}

const getSubtitle = () => {
    if (currentView.value === 'calendar') {
        return props.mode === 'availability'
            ? 'Select dates to view and edit availability'
            : 'View appointments by date'
    }

    const weekStart = format(currentWeekDays.value[0], 'MMM d')
    const weekEnd = format(currentWeekDays.value[6], 'MMM d, yyyy')

    if (props.mode === 'availability') {
        if (props.userRole === 'provider') {
            return 'Click and drag to set your working hours'
        }
        return `${getTotalAvailableHours()} hours available • Week of ${weekStart} - ${weekEnd}`
    }
    return `Week of ${weekStart} - ${weekEnd}`
}

const getWeekRangeText = () => {
    const weekStart = format(currentWeekDays.value[0], 'MMM d')
    const weekEnd = format(currentWeekDays.value[6], 'MMM d, yyyy')
    return `${weekStart} - ${weekEnd}`
}

// Calendar view methods
const handleDateSelected = (date) => {
    selectedDate.value = date
    // Switch to weekly view and navigate to the selected week
    currentView.value = 'weekly'
    currentWeek.value = startOfWeek(date, { weekStartsOn: 1 })
}

const handleMonthChanged = (newMonth) => {
    // Optionally reload data for appointments mode
    if (props.mode === 'appointments') {
        loadAppointments()
    }
}

const formatSelectedDate = (date) => {
    return format(date, 'EEEE, MMMM d, yyyy')
}

const getSelectedDateAvailability = (date) => {
    const dayOfWeek = date.getDay()
    const dayData = availability[dayOfWeek]
    return dayData?.timeSlots || []
}

const getSelectedDateAppointments = (date) => {
    return appointments.value.filter(appointment => {
        const appointmentDate = new Date(appointment.dateTime || appointment.start)
        return isSameDay(appointmentDate, date)
    })
}

const addTimeSlotForDate = (date) => {
    const dayOfWeek = date.getDay()
    if (!availability[dayOfWeek]) {
        availability[dayOfWeek] = {
            dayOfWeek,
            isAvailable: true,
            timeSlots: []
        }
    }
    availability[dayOfWeek].timeSlots.push({ startTime: '09:00', endTime: '17:00' })
    availability[dayOfWeek].isAvailable = true
    checkForChanges()
}

const removeTimeSlot = (date, slotIndex) => {
    const dayOfWeek = date.getDay()
    const dayData = availability[dayOfWeek]
    if (dayData && dayData.timeSlots) {
        dayData.timeSlots.splice(slotIndex, 1)
        if (dayData.timeSlots.length === 0) {
            dayData.isAvailable = false
        }
        checkForChanges()
    }
}

const initializeAvailability = () => {
    daysOfWeek.forEach(dayValue => {
        if (!availability[dayValue]) {
            availability[dayValue] = {
                dayOfWeek: dayValue,
                isAvailable: false,
                timeSlots: []
            }
        }
    })
}

const loadData = async () => {
    if (props.mode === 'availability') {
        await loadAvailability()
    } else {
        await Promise.all([loadAvailability(), loadAppointments()])
    }
}

const loadAvailability = async () => {
    try {
        loading.value = true
        error.value = ''

        let url = '/users/me/availability'
        if (props.userRole === 'client' && props.providerId) {
            url = `/users/providers/${props.providerId}/availability`
        }

        const response = await axios.get(url)

        if (response.data.success && response.data.availability) {
            originalAvailability.value = JSON.parse(JSON.stringify(response.data.availability))

            // Clear current availability
            Object.keys(availability).forEach(key => {
                availability[key] = {
                    dayOfWeek: parseInt(key),
                    isAvailable: false,
                    timeSlots: []
                }
            })

            // Load new availability data
            response.data.availability.forEach(dayData => {
                if (availability[dayData.dayOfWeek]) {
                    availability[dayData.dayOfWeek] = {
                        dayOfWeek: dayData.dayOfWeek,
                        isAvailable: dayData.isAvailable,
                        timeSlots: [...(dayData.timeSlots || [])]
                    }
                }
            })

            hasUnsavedChanges.value = false
        }
    } catch (err) {
        console.error('Error loading availability:', err)
        error.value = err.response?.data?.message || 'Failed to load availability data'
    } finally {
        loading.value = false
    }
}

const loadAppointments = async () => {
    try {
        const startDate = startOfWeek(currentWeek.value, { weekStartsOn: 1 }).toISOString()
        const endDate = endOfWeek(currentWeek.value, { weekStartsOn: 1 }).toISOString()

        const response = await axios.get('/appointments/calendar', {
            params: { startDate, endDate }
        })

        appointments.value = response.data.calendarEvents || []
    } catch (err) {
        console.error('Error loading appointments:', err)
        // Don't set error for appointments as availability might still work
    }
}

const saveAvailability = async () => {
    if (!hasValidAvailability.value) {
        emit('error', 'Please set at least one available time slot before saving.')
        return
    }

    try {
        saving.value = true

        const availabilityData = Object.values(availability).map(day => ({
            dayOfWeek: day.dayOfWeek,
            isAvailable: day.isAvailable,
            timeSlots: day.timeSlots || []
        }))

        const response = await axios.patch('/users/me/availability', {
            availability: availabilityData
        })

        if (response.data.success) {
            hasUnsavedChanges.value = false
            originalAvailability.value = JSON.parse(JSON.stringify(availabilityData))
            emit('saved')
        }
    } catch (err) {
        console.error('Error saving availability:', err)
        emit('error', err.response?.data?.message || 'Failed to save availability')
    } finally {
        saving.value = false
    }
}

// Navigation methods
const previousWeek = () => {
    currentWeek.value = subWeeks(currentWeek.value, 1)
    emit('weekChanged', currentWeek.value)
}

const nextWeek = () => {
    currentWeek.value = addWeeks(currentWeek.value, 1)
    emit('weekChanged', currentWeek.value)
}

const goToCurrentWeek = () => {
    currentWeek.value = new Date()
    emit('weekChanged', currentWeek.value)
}

const refreshData = () => {
    loadData()
}

// Utility functions (same as before)
const formatHour = (hour) => {
    if (hour === 0) return '12a'
    if (hour === 12) return '12p'
    if (hour < 12) return `${hour}a`
    return `${hour - 12}p`
}

const getDayName = (date) => {
    return format(date, 'EEE')
}

const getDayNumber = (date) => {
    return format(date, 'd')
}

const isToday = (date) => {
    return isDateToday(date)
}

const timeToMinutes = (hours, minutes) => {
    return hours * 60 + minutes
}

const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Slot interaction methods (same as before)
const getSlotClasses = (dayIndex, hour, slotIndex) => {
    const baseClasses = [
        'h-8 border-b border-gray-50 relative transition-all duration-150'
    ]

    if (props.mode === 'availability' && props.userRole === 'provider') {
        baseClasses.push('cursor-pointer hover:bg-blue-50')
    }

    return baseClasses.join(' ')
}

const isSlotAvailable = (dayIndex, hour, slotIndex) => {
    const dayValue = daysOfWeek[dayIndex]
    const dayData = availability[dayValue]
    if (!dayData || !dayData.isAvailable || !dayData.timeSlots) return false

    const slotStart = hour * 60 + (slotIndex * 30)
    const slotEnd = slotStart + 30

    return dayData.timeSlots.some(slot => {
        const [startHour, startMin] = slot.startTime.split(':').map(Number)
        const [endHour, endMin] = slot.endTime.split(':').map(Number)
        const timeSlotStart = timeToMinutes(startHour, startMin)
        const timeSlotEnd = timeToMinutes(endHour, endMin)

        return slotStart >= timeSlotStart && slotEnd <= timeSlotEnd
    })
}

const getSlotAppointments = (dayIndex, hour, slotIndex) => {
    if (props.mode !== 'appointments') return []

    const dayDate = currentWeekDays.value[dayIndex]
    const slotStart = hour * 60 + (slotIndex * 30)
    const slotEnd = slotStart + 30

    return appointments.value.filter(appointment => {
        const appointmentDate = parseISO(appointment.start || appointment.dateTime)
        if (!isSameDay(appointmentDate, dayDate)) return false

        const appointmentMinutes = appointmentDate.getHours() * 60 + appointmentDate.getMinutes()
        return appointmentMinutes >= slotStart && appointmentMinutes < slotEnd
    })
}

const getAppointmentClasses = (appointment) => {
    const statusClasses = {
        'scheduled': 'bg-blue-500 hover:bg-blue-600',
        'completed': 'bg-green-500 hover:bg-green-600',
        'canceled': 'bg-red-500 hover:bg-red-600',
        'pending-provider-confirmation': 'bg-yellow-500 hover:bg-yellow-600',
        'pending-payment': 'bg-orange-500 hover:bg-orange-600'
    }

    return statusClasses[appointment.extendedProps?.status || appointment.status] || 'bg-gray-500 hover:bg-gray-600'
}

const getAppointmentTitle = (appointment) => {
    return appointment.title || 'Appointment'
}

const getAppointmentTime = (appointment) => {
    const date = parseISO(appointment.start || appointment.dateTime)
    return format(date, 'h:mm a')
}

const isInSelection = (dayIndex, hour, slotIndex) => {
    if (!isSelecting.value || !selectionStart.value || !selectionEnd.value) return false

    const slotPosition = {
        day: dayIndex,
        hour: hour,
        slot: slotIndex
    }

    const start = selectionStart.value
    const end = selectionEnd.value

    // Ensure start comes before end
    const actualStart = compareSlotPositions(start, end) <= 0 ? start : end
    const actualEnd = compareSlotPositions(start, end) <= 0 ? end : start

    return compareSlotPositions(actualStart, slotPosition) <= 0 &&
        compareSlotPositions(slotPosition, actualEnd) <= 0
}

const compareSlotPositions = (pos1, pos2) => {
    if (pos1.day !== pos2.day) return pos1.day - pos2.day
    if (pos1.hour !== pos2.hour) return pos1.hour - pos2.hour
    return pos1.slot - pos2.slot
}

// Mouse interaction handlers (same as before)
const handleSlotMouseDown = (dayIndex, hour, slotIndex) => {
    if (props.mode !== 'availability' || props.userRole !== 'provider') return

    isSelecting.value = true
    selectionStart.value = { day: dayIndex, hour, slot: slotIndex }
    selectionEnd.value = { day: dayIndex, hour, slot: slotIndex }
}

const handleSlotMouseEnter = (dayIndex, hour, slotIndex) => {
    if (props.mode !== 'availability' || props.userRole !== 'provider') return

    if (isSelecting.value && selectionStart.value) {
        selectionEnd.value = { day: dayIndex, hour, slot: slotIndex }
    }
}

const handleSlotMouseUp = (dayIndex, hour, slotIndex) => {
    if (props.mode !== 'availability' || props.userRole !== 'provider') return

    if (isSelecting.value && selectionStart.value) {
        applySelection()
    }

    isSelecting.value = false
    selectionStart.value = null
    selectionEnd.value = null
}

const applySelection = () => {
    if (!selectionStart.value || !selectionEnd.value) return

    const start = selectionStart.value
    const end = selectionEnd.value

    // Ensure we're working on the same day
    if (start.day !== end.day) return

    const dayValue = daysOfWeek[start.day]
    const dayData = availability[dayValue]

    // Calculate time range
    const startMinutes = start.hour * 60 + (start.slot * 30)
    const endMinutes = end.hour * 60 + (end.slot * 30) + 30

    const startTime = minutesToTime(Math.min(startMinutes, endMinutes))
    const endTime = minutesToTime(Math.max(startMinutes, endMinutes))

    // Check if this time slot already exists
    const existingSlotIndex = dayData.timeSlots.findIndex(slot => {
        const slotStart = timeToMinutes(
            parseInt(slot.startTime.split(':')[0]),
            parseInt(slot.startTime.split(':')[1])
        )
        const slotEnd = timeToMinutes(
            parseInt(slot.endTime.split(':')[0]),
            parseInt(slot.endTime.split(':')[1])
        )
        return slotStart <= Math.min(startMinutes, endMinutes) && slotEnd >= Math.max(startMinutes, endMinutes)
    })

    if (existingSlotIndex >= 0) {
        // Remove existing slot
        dayData.timeSlots.splice(existingSlotIndex, 1)
        if (dayData.timeSlots.length === 0) {
            dayData.isAvailable = false
        }
    } else {
        // Add new slot
        dayData.timeSlots.push({ startTime, endTime })
        dayData.isAvailable = true

        // Sort and merge overlapping slots
        dayData.timeSlots.sort((a, b) =>
            timeToMinutes(parseInt(a.startTime.split(':')[0]), parseInt(a.startTime.split(':')[1])) -
            timeToMinutes(parseInt(b.startTime.split(':')[0]), parseInt(b.startTime.split(':')[1]))
        )

        mergeOverlappingSlots(dayData.timeSlots)
    }

    checkForChanges()

    if (props.autoSave && hasValidAvailability.value) {
        saveAvailability()
    }
}

const mergeOverlappingSlots = (slots) => {
    for (let i = 0; i < slots.length - 1; i++) {
        const current = slots[i]
        const next = slots[i + 1]

        const currentEnd = timeToMinutes(
            parseInt(current.endTime.split(':')[0]),
            parseInt(current.endTime.split(':')[1])
        )
        const nextStart = timeToMinutes(
            parseInt(next.startTime.split(':')[0]),
            parseInt(next.startTime.split(':')[1])
        )

        if (currentEnd >= nextStart) {
            const nextEnd = timeToMinutes(
                parseInt(next.endTime.split(':')[0]),
                parseInt(next.endTime.split(':')[1])
            )
            current.endTime = minutesToTime(Math.max(currentEnd, nextEnd))
            slots.splice(i + 1, 1)
            i--
        }
    }
}

// Preset configurations
const setPreset = (preset) => {
    if (props.mode !== 'availability' || props.userRole !== 'provider') return

    switch (preset) {
        case 'business':
            // Monday to Friday, 9 AM to 5 PM
            daysOfWeek.slice(0, 5).forEach(dayValue => {
                availability[dayValue] = {
                    dayOfWeek: dayValue,
                    isAvailable: true,
                    timeSlots: [{ startTime: '09:00', endTime: '17:00' }]
                }
            })
            // Clear weekend
            daysOfWeek.slice(5).forEach(dayValue => {
                availability[dayValue] = {
                    dayOfWeek: dayValue,
                    isAvailable: false,
                    timeSlots: []
                }
            })
            break

        case 'flexible':
            // All days, 8 AM to 8 PM
            daysOfWeek.forEach(dayValue => {
                availability[dayValue] = {
                    dayOfWeek: dayValue,
                    isAvailable: true,
                    timeSlots: [{ startTime: '08:00', endTime: '20:00' }]
                }
            })
            break
    }

    checkForChanges()
}

const clearAll = () => {
    if (props.mode !== 'availability' || props.userRole !== 'provider') return

    daysOfWeek.forEach(dayValue => {
        availability[dayValue] = {
            dayOfWeek: dayValue,
            isAvailable: false,
            timeSlots: []
        }
    })

    checkForChanges()
}

const checkForChanges = () => {
    const currentData = Object.values(availability)
    const originalData = originalAvailability.value

    hasUnsavedChanges.value = JSON.stringify(currentData) !== JSON.stringify(originalData)

    if (hasUnsavedChanges.value) {
        emit('changed')
    }
}

// Statistics
const getTotalAvailableHours = () => {
    let totalMinutes = 0

    Object.values(availability).forEach(day => {
        if (day.isAvailable && day.timeSlots) {
            day.timeSlots.forEach(slot => {
                const start = timeToMinutes(
                    parseInt(slot.startTime.split(':')[0]),
                    parseInt(slot.startTime.split(':')[1])
                )
                const end = timeToMinutes(
                    parseInt(slot.endTime.split(':')[0]),
                    parseInt(slot.endTime.split(':')[1])
                )
                totalMinutes += (end - start)
            })
        }
    })

    return Math.round(totalMinutes / 60 * 10) / 10
}

const getAvailableDaysCount = () => {
    return Object.values(availability).filter(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    ).length
}

// Watch for week changes
watch(currentWeek, () => {
    if (props.mode === 'appointments') {
        loadAppointments()
    }
})

// Lifecycle
onMounted(() => {
    initializeAvailability()
    loadData()
})

// Disable text selection during drag
document.addEventListener('selectstart', (e) => {
    if (isSelecting.value) {
        e.preventDefault()
    }
})

// Expose methods for parent component
defineExpose({
    loadData,
    saveAvailability,
    hasUnsavedChanges: () => hasUnsavedChanges.value,
    isValid: () => hasValidAvailability.value,
    goToWeek: (date) => {
        currentWeek.value = date
        emit('weekChanged', date)
    }
})
</script>