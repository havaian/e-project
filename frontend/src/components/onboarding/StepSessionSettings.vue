<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Session Settings & Availability</h2>
            <p class="mt-2 text-gray-600">Configure your session pricing, duration, and when you're available to meet clients</p>
        </div>

        <!-- Session Configuration -->
        <div class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Session Configuration</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Session Duration -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                    <label class="block text-sm font-medium text-gray-900 mb-4">
                        Session Duration
                    </label>
                    <div class="space-y-3">
                        <div v-for="duration in durationOptions" :key="duration.value"
                            class="flex items-center space-x-3">
                            <input :id="`duration-${duration.value}`" 
                                v-model="modelValue.sessionDuration" 
                                :value="duration.value"
                                type="radio"
                                class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                                @change="validateForm" />
                            <label :for="`duration-${duration.value}`" 
                                class="text-sm text-gray-900 cursor-pointer flex-1">
                                <span class="font-medium">{{ duration.label }}</span>
                                <span class="text-gray-500 ml-2">{{ duration.description }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Session Fee -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                    <label for="sessionFee" class="block text-sm font-medium text-gray-900 mb-4">
                        Session Fee (UZS)
                    </label>
                    <div class="relative">
                        <input id="sessionFee" 
                            v-model.number="modelValue.sessionFee" 
                            type="number"
                            min="50000"
                            max="2000000"
                            step="10000"
                            placeholder="150000"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-lg"
                            @input="validateForm" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span class="text-gray-500 text-sm">UZS</span>
                        </div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">
                        Suggested range: 100,000 - 500,000 UZS per session
                    </div>
                    
                    <!-- Fee Breakdown -->
                    <div v-if="modelValue.sessionFee && modelValue.sessionFee > 0" class="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div class="text-xs text-gray-600 space-y-1">
                            <div class="flex justify-between">
                                <span>Session Fee:</span>
                                <span class="font-medium">{{ formatCurrency(modelValue.sessionFee) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Platform Fee (10%):</span>
                                <span>{{ formatCurrency(modelValue.sessionFee * 0.1) }}</span>
                            </div>
                            <div class="flex justify-between font-medium border-t pt-1">
                                <span>You receive:</span>
                                <span class="text-green-600">{{ formatCurrency(modelValue.sessionFee * 0.9) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Earnings Preview -->
            <div v-if="modelValue.sessionFee && modelValue.sessionDuration" class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                        <h4 class="font-semibold text-green-900">Earnings Preview</h4>
                        <p class="text-green-700 mt-1">
                            With {{ modelValue.sessionDuration }}-minute sessions at {{ formatCurrency(modelValue.sessionFee) }}, 
                            you could earn up to {{ formatCurrency(potentialHourlyEarnings) }} per hour.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Weekly Schedule -->
        <div class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900">Weekly Schedule</h3>

            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div v-for="(day, index) in modelValue.availability" :key="day.dayOfWeek"
                    class="border-b border-gray-100 last:border-b-0">
                    <div class="p-4 flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <!-- Day Toggle -->
                            <div class="flex items-center space-x-3">
                                <input :id="`day-${day.dayOfWeek}`" v-model="day.isAvailable" type="checkbox"
                                    class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                                    @change="validateForm" />
                                <label :for="`day-${day.dayOfWeek}`" class="text-sm font-medium text-gray-900 w-20">
                                    {{ getDayName(day.dayOfWeek) }}
                                </label>
                            </div>
                        </div>

                        <!-- Time Selection -->
                        <div v-if="day.isAvailable" class="flex items-center space-x-4">
                            <div class="flex items-center space-x-2">
                                <label class="text-sm text-gray-600">From:</label>
                                <select v-model="day.startTime"
                                    class="text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    @change="validateForm">
                                    <option v-for="time in timeOptions" :key="time" :value="time">
                                        {{ formatTime(time) }}
                                    </option>
                                </select>
                            </div>

                            <div class="flex items-center space-x-2">
                                <label class="text-sm text-gray-600">To:</label>
                                <select v-model="day.endTime"
                                    class="text-sm border-gray-300 rounded-md focus:ring-sky-500 focus:border-sky-500"
                                    @change="validateForm">
                                    <option v-for="time in getEndTimeOptions(day.startTime)" :key="time" :value="time">
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
            <h3 class="text-lg font-semibold text-gray-900">Quick Setup</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button @click="setPreset('business')"
                    class="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors text-left">
                    <div class="font-medium text-gray-900">Business Hours</div>
                    <div class="text-sm text-gray-600 mt-1">Mon-Fri, 9:00 AM - 5:00 PM</div>
                </button>

                <button @click="setPreset('flexible')"
                    class="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors text-left">
                    <div class="font-medium text-gray-900">Flexible Hours</div>
                    <div class="text-sm text-gray-600 mt-1">Mon-Sat, 8:00 AM - 8:00 PM</div>
                </button>

                <button @click="setPreset('weekend')"
                    class="p-4 border border-gray-200 rounded-xl hover:border-sky-300 hover:bg-sky-50 transition-colors text-left">
                    <div class="font-medium text-gray-900">Weekends Only</div>
                    <div class="text-sm text-gray-600 mt-1">Sat-Sun, 10:00 AM - 6:00 PM</div>
                </button>
            </div>
        </div>

        <!-- Time Zone Info -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                    <p class="font-medium text-gray-900">Time Zone</p>
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
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                    <p class="font-medium text-green-900">Availability Summary</p>
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
                <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                    <p class="font-medium text-blue-900">Flexibility is key</p>
                    <p class="text-blue-700 mt-1">
                        You can always update your availability and pricing later. Consider starting with more hours
                        and adjusting based on demand. Clients can book appointments during your available hours.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue', 'validate'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// Session duration options (based on backend model)
const durationOptions = ref([
    { value: 30, label: '30 minutes', description: 'Quick consultations' },
    { value: 45, label: '45 minutes', description: 'Standard sessions' },
    { value: 60, label: '60 minutes', description: 'In-depth sessions' },
    { value: 90, label: '90 minutes', description: 'Extended sessions' },
    { value: 120, label: '120 minutes', description: 'Comprehensive sessions' }
])

// Time options (24-hour format)
const timeOptions = ref([
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
])

// Current timezone
const currentTimeZone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)

// Computed properties
const availableDaysCount = computed(() => {
    return props.modelValue.availability.filter(day => day.isAvailable).length
})

const totalHoursPerWeek = computed(() => {
    return props.modelValue.availability
        .filter(day => day.isAvailable)
        .reduce((total, day) => {
            const start = timeToMinutes(day.startTime)
            const end = timeToMinutes(day.endTime)
            return total + ((end - start) / 60)
        }, 0)
})

const potentialHourlyEarnings = computed(() => {
    if (!props.modelValue.sessionFee || !props.modelValue.sessionDuration) return 0
    
    const netFeePerSession = props.modelValue.sessionFee * 0.9 // After 10% platform fee
    const sessionsPerHour = 60 / props.modelValue.sessionDuration
    return Math.round(netFeePerSession * sessionsPerHour)
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

const formatCurrency = (amount) => {
    if (!amount) return '0 UZS'
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS'
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
            props.modelValue.availability.forEach((day, index) => {
                if (day.dayOfWeek >= 1 && day.dayOfWeek <= 5) { // Mon-Fri
                    day.isAvailable = true
                    day.startTime = '09:00'
                    day.endTime = '17:00'
                } else {
                    day.isAvailable = false
                }
            })
            break

        case 'flexible':
            props.modelValue.availability.forEach((day, index) => {
                if (day.dayOfWeek >= 1 && day.dayOfWeek <= 6) { // Mon-Sat
                    day.isAvailable = true
                    day.startTime = '08:00'
                    day.endTime = '20:00'
                } else {
                    day.isAvailable = false
                }
            })
            break

        case 'weekend':
            props.modelValue.availability.forEach((day, index) => {
                if (day.dayOfWeek === 6 || day.dayOfWeek === 7) { // Sat-Sun
                    day.isAvailable = true
                    day.startTime = '10:00'
                    day.endTime = '18:00'
                } else {
                    day.isAvailable = false
                }
            })
            break
    }
    validateForm()
}

const validateForm = () => {
    // At least one day must be available
    const hasAvailableDays = props.modelValue.availability.some(day => day.isAvailable)

    // All available days must have valid time ranges
    const hasValidTimes = props.modelValue.availability
        .filter(day => day.isAvailable)
        .every(day => {
            const startMinutes = timeToMinutes(day.startTime)
            const endMinutes = timeToMinutes(day.endTime)
            return endMinutes > startMinutes + 30 // At least 30 minutes
        })

    // Session duration must be selected
    const hasSessionDuration = props.modelValue.sessionDuration && 
        [30, 45, 60, 90, 120].includes(props.modelValue.sessionDuration)

    // Session fee must be valid
    const hasValidSessionFee = props.modelValue.sessionFee && 
        props.modelValue.sessionFee >= 50000 && 
        props.modelValue.sessionFee <= 2000000

    const isValid = hasAvailableDays && hasValidTimes && hasSessionDuration && hasValidSessionFee
    emit('validate', isValid)
}

// Set defaults if not already set
onMounted(() => {
    if (!props.modelValue.sessionDuration) {
        props.modelValue.sessionDuration = 60 // Default to 60 minutes
    }
    if (!props.modelValue.sessionFee) {
        props.modelValue.sessionFee = 150000 // Default fee
    }
    validateForm()
})

// Watch for changes
watch(() => props.modelValue, validateForm, { deep: true })
</script>