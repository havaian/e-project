<template>
    <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <!-- Calendar Header -->
        <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <button type="button" @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
            </button>

            <h2 class="text-lg font-semibold text-gray-900">
                {{ currentMonthYear }}
            </h2>

            <button type="button" @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronRightIcon class="w-5 h-5 text-gray-600" />
            </button>
        </div>

        <!-- Days of Week -->
        <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            <div v-for="day in daysOfWeek" :key="day" class="px-2 py-3 text-center text-sm font-medium text-gray-500">
                {{ day }}
            </div>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7">
            <button v-for="day in calendarDays" :key="day.key" type="button" :disabled="shouldDisableDay(day)"
                @click="selectDate(day)"
                class="relative p-2 h-12 text-sm transition-all duration-200 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                :class="getDayClasses(day)">

                <!-- Date number - always visible -->
                <span class="relative z-10 block w-full h-full flex items-center justify-center">
                    {{ day.date }}
                </span>

                <!-- Today indicator -->
                <div v-if="day.isToday && !day.isSelected"
                    class="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full z-20">
                </div>

                <!-- Event indicators -->
                <div v-if="day.hasEvents && showEventIndicators"
                    class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full z-20">
                </div>

                <!-- Appointments count for providers -->
                <div v-if="day.appointmentCount && day.appointmentCount > 0 && showAppointmentCount"
                    class="absolute top-1 right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center z-20">
                    {{ day.appointmentCount > 9 ? '9+' : day.appointmentCount }}
                </div>
            </button>
        </div>

        <!-- Selected Date Info -->
        <div v-if="selectedDate && showSelectedDateInfo" class="px-4 py-3 bg-blue-50 border-t border-blue-200">
            <p class="text-sm text-blue-800">
                Selected: <span class="font-medium">{{ formatSelectedDate }}</span>
            </p>
        </div>

        <!-- Additional slots for custom content -->
        <slot name="footer" :selectedDate="selectedDate" :calendarDays="calendarDays"></slot>
    </div>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { ref, computed, watch, onMounted } from 'vue'
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    isBefore,
    isAfter,
    addDays,
    parseISO
} from 'date-fns'

// Props
const props = defineProps({
    modelValue: {
        type: [Date, String],
        default: null
    },
    // Events/appointments to show on calendar
    events: {
        type: Array,
        default: () => []
    },
    // Disable past dates
    disablePastDates: {
        type: Boolean,
        default: true
    },
    // Disable future dates beyond this many days
    maxFutureDays: {
        type: Number,
        default: 30
    },
    // Show selected date info bar
    showSelectedDateInfo: {
        type: Boolean,
        default: false
    },
    // Show event indicators
    showEventIndicators: {
        type: Boolean,
        default: false
    },
    // Show appointment count
    showAppointmentCount: {
        type: Boolean,
        default: false
    },
    // Custom disabled dates
    disabledDates: {
        type: Array,
        default: () => []
    },
    // Theme colors
    primaryColor: {
        type: String,
        default: 'blue'
    },
    // Initial month to display
    initialMonth: {
        type: Date,
        default: () => new Date()
    }
})

// Emits
const emit = defineEmits(['update:modelValue', 'dateSelected', 'monthChanged'])

// Reactive data
const currentMonth = ref(props.initialMonth)
const selectedDate = ref(props.modelValue ? new Date(props.modelValue) : null)

// Constants
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Computed properties
const currentMonthYear = computed(() => {
    return format(currentMonth.value, 'MMMM yyyy')
})

const formatSelectedDate = computed(() => {
    if (!selectedDate.value) return ''
    return format(selectedDate.value, 'EEEE, MMMM d, yyyy')
})

const calendarDays = computed(() => {
    const start = startOfMonth(currentMonth.value)
    const end = endOfMonth(currentMonth.value)

    // Get first day of the week for the month
    const startDate = new Date(start)
    startDate.setDate(startDate.getDate() - start.getDay())

    // Get last day of the week for the month
    const endDate = new Date(end)
    endDate.setDate(endDate.getDate() + (6 - end.getDay()))

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    const now = new Date()
    const maxDate = addDays(now, props.maxFutureDays)

    return days.map(day => {
        // Find events for this day
        const dayEvents = props.events.filter(event => {
            const eventDate = event.date ? new Date(event.date) : new Date(event.dateTime)
            return isSameDay(day, eventDate)
        })

        return {
            date: day.getDate(),
            fullDate: day,
            key: format(day, 'yyyy-MM-dd'),
            isCurrentMonth: day.getMonth() === currentMonth.value.getMonth(),
            isToday: isToday(day),
            isPast: props.disablePastDates && isBefore(day, new Date(now.getFullYear(), now.getMonth(), now.getDate())),
            isTooFar: isAfter(day, maxDate),
            isSelected: selectedDate.value && isSameDay(day, selectedDate.value),
            hasEvents: dayEvents.length > 0,
            appointmentCount: dayEvents.length,
            events: dayEvents,
            isDisabled: props.disabledDates.some(disabledDate => isSameDay(day, new Date(disabledDate)))
        }
    })
})

// Methods
const previousMonth = () => {
    currentMonth.value = subMonths(currentMonth.value, 1)
    emit('monthChanged', currentMonth.value)
}

const nextMonth = () => {
    currentMonth.value = addMonths(currentMonth.value, 1)
    emit('monthChanged', currentMonth.value)
}

const selectDate = (day) => {
    if (shouldDisableDay(day)) return

    selectedDate.value = day.fullDate
    emit('update:modelValue', day.fullDate)
    emit('dateSelected', day.fullDate, day)
}

const shouldDisableDay = (day) => {
    return !day.isCurrentMonth || day.isPast || day.isTooFar || day.isDisabled
}

const getDayClasses = (day) => {
    const classes = []

    // Base classes for non-current month
    if (!day.isCurrentMonth) {
        if (shouldDisableDay(day)) {
            classes.push('text-gray-300', 'cursor-not-allowed', 'bg-gray-50')
            return classes
        } else {
            classes.push('text-gray-400', 'cursor-not-allowed')
            return classes
        }
    }

    // Disabled states
    if (shouldDisableDay(day)) {
        classes.push('text-gray-300', 'cursor-not-allowed', 'bg-gray-50')
        return classes
    }

    // Interactive state
    classes.push('text-gray-900', 'hover:bg-blue-50')

    // Selected state
    if (day.isSelected) {
        classes.push('bg-blue-600', 'text-white', 'hover:bg-blue-700', 'ring-2', 'ring-blue-500')
    }
    // Today state (if not selected)
    else if (day.isToday) {
        classes.push('bg-blue-100', 'text-blue-800')
    }

    return classes
}

// Watchers
watch(() => props.modelValue, (newValue) => {
    selectedDate.value = newValue ? new Date(newValue) : null
})

// Navigate to month of selected date when it changes
watch(selectedDate, (newDate) => {
    if (newDate && newDate.getMonth() !== currentMonth.value.getMonth()) {
        currentMonth.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
    }
})

// Public methods for parent components
const goToDate = (date) => {
    const targetDate = new Date(date)
    currentMonth.value = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    selectedDate.value = targetDate
    emit('update:modelValue', targetDate)
}

const goToToday = () => {
    const today = new Date()
    currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
}

// Expose methods for parent component
defineExpose({
    goToDate,
    goToToday,
    currentMonth: computed(() => currentMonth.value),
    selectedDate: computed(() => selectedDate.value)
})
</script>

<style scoped>
/* Ensure date numbers are always visible */
button span {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

/* Smooth hover effects */
button:hover:not(:disabled) {
    transform: scale(1.02);
}

button:disabled {
    pointer-events: none;
}

/* Transition effects */
button {
    transition: all 0.2s ease;
}
</style>