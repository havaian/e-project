<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Set your availability</h2>
            <p class="mt-2 text-gray-600">Choose when you're available to meet with clients</p>
        </div>

        <!-- Weekly Schedule -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Weekly schedule</h3>

            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div v-for="(day, index) in modelValue.availability" :key="day.dayOfWeek"
                    class="border-b border-gray-100 last:border-b-0">
                    <div class="p-4 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <!-- Day Toggle -->
                            <div class="flex items-center space-x-3">
                                <input :id="`day-${day.dayOfWeek}`" v-model="day.isAvailable" type="checkbox"
                                    class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                    @change="handleDayToggle(day)" />
                                <label :for="`day-${day.dayOfWeek}`" class="text-sm font-medium text-gray-900 w-20">
                                    {{ getDayName(day.dayOfWeek) }}
                                </label>
                            </div>
                        </div>

                        <!-- Time Selection -->
                        <div v-if="day.isAvailable" class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <label class="text-sm text-gray-600">From:</label>
                                <select :value="getFirstTimeSlot(day)?.startTime || '09:00'"
                                    @change="updateTimeSlot(day, 'start', $event.target.value)"
                                    class="text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                    <option v-for="time in timeOptions" :key="time" :value="time">
                                        {{ formatTime(time) }}
                                    </option>
                                </select>
                            </div>

                            <div class="flex items-center space-x-2">
                                <label class="text-sm text-gray-600">To:</label>
                                <select :value="getFirstTimeSlot(day)?.endTime || '17:00'"
                                    @change="updateTimeSlot(day, 'end', $event.target.value)"
                                    class="text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500">
                                    <option
                                        v-for="time in getEndTimeOptions(getFirstTimeSlot(day)?.startTime || '09:00')"
                                        :key="time" :value="time">
                                        {{ formatTime(time) }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div v-else class="text-sm text-gray-400">
                            Not available
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Setup Options -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Quick setup</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button @click="setPreset('business')"
                    class="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors text-left">
                    <div class="font-medium text-gray-900">Business Hours</div>
                    <div class="text-sm text-gray-600 mt-1">Mon-Fri, 9:00 AM - 5:00 PM</div>
                </button>

                <button @click="setPreset('flexible')"
                    class="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors text-left">
                    <div class="font-medium text-gray-900">Flexible hours</div>
                    <div class="text-sm text-gray-600 mt-1">Mon-Sat, 8:00 AM - 8:00 PM</div>
                </button>

                <button @click="setPreset('weekend')"
                    class="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors text-left">
                    <div class="font-medium text-gray-900">Weekends only</div>
                    <div class="text-sm text-gray-600 mt-1">Sat-Sun, 10:00 AM - 6:00 PM</div>
                </button>
            </div>
        </div>

        <!-- Time Zone Info -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div class="flex items-start space-x-3">
                <ClockIcon class="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-gray-900">Time zone</p>
                    <p class="text-gray-600 mt-1">
                        All times are in your local time zone ({{ currentTimeZone }}).
                        Clients will see appointment times converted to their local time zone.
                    </p>
                </div>
            </div>
        </div>

        <!-- Summary -->
        <div v-if="availableDaysCount > 0" class="bg-green-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-start space-x-3">
                <CheckCircleIcon class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-green-900">Availability summary</p>
                    <p class="text-green-700 mt-1">
                        You're available {{ availableDaysCount }} {{ availableDaysCount === 1 ? 'day' : 'days' }} per
                        week,
                        totaling {{ totalHoursPerWeek }} hours of potential appointment time.
                    </p>
                </div>
            </div>
        </div>

        <!-- Help Text -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div class="flex items-start space-x-3">
                <InformationCircleIcon class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-blue-900">Flexibility is key</p>
                    <p class="text-blue-700 mt-1">
                        You can always update your availability later. Consider starting with more hours
                        and adjusting based on demand. Clients can book appointments during your available hours.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ClockIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue', 'validate'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// Time options (24-hour format)
const timeOptions = ref([
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
])

// Current timezone
const currentTimeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

// Helper to get first time slot or undefined
const getFirstTimeSlot = (day) => {
    if (!day.timeSlots || day.timeSlots.length === 0) {
        return null
    }
    return day.timeSlots[0]
}

// Ensure day has timeSlots array initialized
const ensureTimeSlotsArray = (day) => {
    if (!Array.isArray(day.timeSlots)) {
        day.timeSlots = []
    }
}

// Handle day toggle
const handleDayToggle = (day) => {
    ensureTimeSlotsArray(day)

    if (day.isAvailable) {
        // When enabling, add default time slot if none exists
        if (day.timeSlots.length === 0) {
            day.timeSlots.push({ startTime: '09:00', endTime: '17:00' })
        }
    } else {
        // When disabling, clear time slots
        day.timeSlots = []
    }

    validateForm()
}

// Update time slot
const updateTimeSlot = (day, type, value) => {
    ensureTimeSlotsArray(day)

    // Get or create first time slot
    if (day.timeSlots.length === 0) {
        day.timeSlots.push({ startTime: '09:00', endTime: '17:00' })
    }

    const slot = day.timeSlots[0]

    if (type === 'start') {
        slot.startTime = value
        // Ensure end time is after start time
        const startMinutes = timeToMinutes(value)
        const endMinutes = timeToMinutes(slot.endTime)
        if (endMinutes <= startMinutes + 30) {
            // Find next valid end time
            const validEndTimes = getEndTimeOptions(value)
            slot.endTime = validEndTimes[0] || value
        }
    } else {
        slot.endTime = value
    }

    validateForm()
}

// Computed properties
const availableDaysCount = computed(() => {
    return props.modelValue.availability.filter(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    ).length
})

const totalHoursPerWeek = computed(() => {
    return props.modelValue.availability
        .filter(day => day.isAvailable && day.timeSlots && day.timeSlots.length > 0)
        .reduce((total, day) => {
            const dayTotal = day.timeSlots.reduce((daySum, slot) => {
                const start = timeToMinutes(slot.startTime)
                const end = timeToMinutes(slot.endTime)
                return daySum + ((end - start) / 60)
            }, 0)
            return total + dayTotal
        }, 0)
})

// Methods
const getDayName = (dayOfWeek) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[dayOfWeek - 1]
}

const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
}

const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const getEndTimeOptions = (startTime) => {
    const startMinutes = timeToMinutes(startTime)
    return timeOptions.value.filter(time => {
        const endMinutes = timeToMinutes(time)
        return endMinutes > startMinutes + 30 // Minimum 30 minutes gap
    })
}

const setPreset = (preset) => {
    switch (preset) {
        case 'business':
            props.modelValue.availability.forEach((day) => {
                ensureTimeSlotsArray(day)
                if (day.dayOfWeek >= 1 && day.dayOfWeek <= 5) { // Mon-Fri
                    day.isAvailable = true
                    day.timeSlots = [{ startTime: '09:00', endTime: '17:00' }]
                } else {
                    day.isAvailable = false
                    day.timeSlots = []
                }
            })
            break

        case 'flexible':
            props.modelValue.availability.forEach((day) => {
                ensureTimeSlotsArray(day)
                if (day.dayOfWeek >= 1 && day.dayOfWeek <= 6) { // Mon-Sat
                    day.isAvailable = true
                    day.timeSlots = [{ startTime: '08:00', endTime: '20:00' }]
                } else {
                    day.isAvailable = false
                    day.timeSlots = []
                }
            })
            break

        case 'weekend':
            props.modelValue.availability.forEach((day) => {
                ensureTimeSlotsArray(day)
                if (day.dayOfWeek === 6 || day.dayOfWeek === 7) { // Sat-Sun
                    day.isAvailable = true
                    day.timeSlots = [{ startTime: '10:00', endTime: '18:00' }]
                } else {
                    day.isAvailable = false
                    day.timeSlots = []
                }
            })
            break
    }
    validateForm()
}

const validateForm = () => {
    // At least one day must be available
    const hasAvailableDays = props.modelValue.availability.some(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    )

    // All available days must have valid time ranges
    const hasValidTimes = props.modelValue.availability
        .filter(day => day.isAvailable && day.timeSlots && day.timeSlots.length > 0)
        .every(day => {
            return day.timeSlots.every(slot => {
                const startMinutes = timeToMinutes(slot.startTime)
                const endMinutes = timeToMinutes(slot.endTime)
                return endMinutes > startMinutes + 30 // At least 30 minutes
            })
        })

    const isValid = hasAvailableDays && hasValidTimes
    emit('validate', isValid)
}

// Initialize timeSlots arrays on mount
onMounted(() => {
    props.modelValue.availability.forEach(day => {
        ensureTimeSlotsArray(day)
        // If day is available but has no timeSlots, add default
        if (day.isAvailable && day.timeSlots.length === 0) {
            day.timeSlots.push({ startTime: '09:00', endTime: '17:00' })
        }
    })
    validateForm()
})

// Watch for changes
watch(() => props.modelValue.availability, validateForm, { deep: true })
</script>