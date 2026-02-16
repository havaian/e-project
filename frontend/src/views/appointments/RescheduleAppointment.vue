<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center space-x-4">
                    <button @click="goBack" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                        <ArrowLeftIcon class="w-5 h-5" />
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Reschedule Appointment</h1>
                        <p class="text-gray-600">Change your appointment date and time</p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-1 mx-auto"></div>
                    <p class="mt-4 text-gray-600">Loading appointment details...</p>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
                <div class="flex items-center space-x-3">
                    <ExclamationTriangleIcon class="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                        <h3 class="text-lg font-medium text-red-900">Unable to Load Appointment</h3>
                        <p class="text-red-700 mt-1">{{ error }}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <button @click="goBack" class="btn-primary">
                        Back to appointments
                    </button>
                </div>
            </div>

            <!-- Reschedule Restrictions Notice -->
            <div v-else-if="!canReschedule" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div class="flex items-start space-x-3">
                    <ExclamationTriangleIcon class="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 class="text-lg font-medium text-yellow-900">Cannot Reschedule</h3>
                        <div class="text-yellow-700 mt-2 space-y-2">
                            <p v-if="appointment?.rescheduleCount >= 1">
                                This appointment has already been rescheduled once. Only one reschedule is allowed per
                                appointment.
                            </p>
                            <p v-else-if="isWithin12Hours">
                                Cannot reschedule appointments less than 12 hours before the scheduled time.
                            </p>
                            <p v-else-if="appointment?.status !== 'scheduled'">
                                Only scheduled appointments can be rescheduled. Current status: {{
                                formatStatus(appointment?.status) }}
                            </p>
                            <p v-else>
                                This appointment cannot be rescheduled at this time.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <button @click="goBack" class="btn-primary">
                        Back to appointments
                    </button>
                </div>
            </div>

            <!-- Reschedule Form -->
            <div v-else class="space-y-6">
                <!-- Current Appointment Info -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 class="text-lg font-medium text-blue-900 mb-4">Current Appointment</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-blue-700 font-medium">Current Date & time:</span>
                            <p class="text-blue-900">{{ formatDateTime(appointment.dateTime) }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">Type:</span>
                            <p class="text-blue-900 capitalize">{{ appointment.type || 'Video session' }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">Provider:</span>
                            <p class="text-blue-900">{{ getProviderName(appointment.provider) }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">Status:</span>
                            <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                                :class="getStatusClass(appointment.status)">
                                {{ formatStatus(appointment.status) }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Reschedule Notice -->
                <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div class="flex items-start space-x-3">
                        <InformationCircleIcon class="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div class="text-amber-800">
                            <h4 class="font-medium">Important Reschedule Information</h4>
                            <ul class="mt-2 text-sm space-y-1">
                                <li>• You can only reschedule once per appointment</li>
                                <li>• Reschedule requests require provider approval</li>
                                <li>• Must be done at least 12 hours before appointment time</li>
                                <li>• Provider will be notified of your request</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Reschedule Form -->
                <form @submit.prevent="rescheduleAppointment"
                    class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-6">Select New Date & Time</h2>

                    <!-- Date Selection using ReusableCalendar -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            New Date <span class="text-red-500">*</span>
                        </label>
                        <ReusableCalendar v-model="selectedDateObj" :disable-past-dates="true" :max-future-days="90"
                            :show-selected-date-info="true" @date-selected="handleDateSelected" />
                        <div v-if="formData.date && !loadingTimeSlots && availableTimeSlots.length === 0"
                            class="mt-2 text-sm text-amber-600">
                            No available time slots for selected date. Please choose a different date.
                        </div>
                    </div>

                    <!-- Time Selection -->
                    <div class="mb-6">
                        <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                            New Time <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <select id="time" v-model="formData.time" required
                                :disabled="!formData.date || loadingTimeSlots"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1 disabled:bg-gray-100 disabled:cursor-not-allowed">
                                <option value="">
                                    {{ loadingTimeSlots ? 'Loading...' : 'Select time' }}
                                </option>
                                <option v-for="slot in availableTimeSlots" :key="slot.value" :value="slot.value">
                                    {{ slot.label }}
                                </option>
                            </select>
                            <div v-if="loadingTimeSlots" class="absolute right-3 top-3">
                                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-1"></div>
                            </div>
                        </div>

                        <!-- Time slots status -->
                        <div v-if="formData.date && !loadingTimeSlots" class="mt-2">
                            <p v-if="availableTimeSlots.length === 0" class="text-sm text-amber-600">
                                No available time slots for selected date. Please choose a different date.
                            </p>
                            <p v-else-if="availableTimeSlots.length > 0" class="text-sm text-green-600">
                                {{ availableTimeSlots.length }} time slot{{ availableTimeSlots.length > 1 ? 's' : '' }}
                                available
                            </p>
                        </div>

                        <!-- Error handling -->
                        <div v-if="timeSlotsError" class="mt-2">
                            <p class="text-sm text-red-600">{{ timeSlotsError }}</p>
                            <button @click="retryLoadTimeSlots" type="button"
                                class="text-sm text-brand-1 hover:text-brand-2 underline mt-1">
                                Try again
                            </button>
                        </div>
                    </div>

                    <!-- Reason for Reschedule -->
                    <div class="mb-6">
                        <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Reschedule (Optional)
                        </label>
                        <textarea id="reason" v-model="formData.reason" rows="3"
                            placeholder="Please explain why you need to reschedule this appointment..."
                            class="input resize-none"></textarea>
                    </div>

                    <!-- New Appointment Summary -->
                    <div v-if="formData.date && formData.time" class="mb-6 bg-gray-50 rounded-lg p-4">
                        <h4 class="font-medium text-gray-900 mb-3">New Appointment Summary</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Provider:</span>
                                <span class="font-medium">{{ getProviderName(appointment.provider) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">New Date & time:</span>
                                <span class="font-medium">{{ formatSelectedDateTime() }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Session type:</span>
                                <span class="font-medium capitalize">{{ appointment.type || 'video' }} session</span>
                            </div>
                        </div>
                    </div>

                    <!-- Error Display -->
                    <div v-if="submitError" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <ExclamationTriangleIcon class="w-5 h-5 text-red-500 mr-2" />
                            <p class="text-red-800">{{ submitError }}</p>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                        <button type="button" @click="goBack"
                            class="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>

                        <button type="submit" :disabled="saving || !formData.date || !formData.time"
                            class="px-6 py-2 text-sm text-white bg-brand-1 rounded-lg hover:bg-brand-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                            <span v-if="saving">Sending Request...</span>
                            <span v-else>Send Reschedule Request</span>
                            <ArrowRightIcon v-if="!saving" class="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO, addDays, isWithinInterval, subHours } from 'date-fns'
import axios from '@/plugins/axios'
import ReusableCalendar from '@/components/calendar/ReusableCalendar.vue'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const saving = ref(false)
const error = ref(null)
const submitError = ref(null)
const appointment = ref(null)
const availableTimeSlots = ref([])
const loadingTimeSlots = ref(false)
const timeSlotsError = ref(null)
const selectedDateObj = ref(null)

const formData = ref({
    date: '',
    time: '',
    reason: ''
})

// Computed properties
const canReschedule = computed(() => {
    if (!appointment.value) return false

    // Check if already rescheduled
    if (appointment.value.rescheduleCount >= 1) return false

    // Check if within 12 hours
    if (isWithin12Hours.value) return false

    // Check if scheduled
    if (appointment.value.status !== 'scheduled') return false

    return true
})

const isWithin12Hours = computed(() => {
    if (!appointment.value?.dateTime) return false

    const appointmentTime = parseISO(appointment.value.dateTime)
    const twelveHoursBeforeAppointment = subHours(appointmentTime, 12)
    const now = new Date()

    return now >= twelveHoursBeforeAppointment
})

// Methods
const loadAppointment = async () => {
    try {
        loading.value = true
        const response = await axios.get(`/appointments/${route.params.id}`)
        appointment.value = response.data.appointment
    } catch (err) {
        console.error('Error loading appointment:', err)
        error.value = err.response?.data?.message || 'Failed to load appointment'
    } finally {
        loading.value = false
    }
}

const handleDateSelected = (date) => {
    selectedDateObj.value = date
    formData.value.date = format(date, 'yyyy-MM-dd')
    formData.value.time = '' // Reset time when date changes
    loadAvailableTimeSlots()
}

const loadAvailableTimeSlots = async () => {
    if (!formData.value.date || !appointment.value?.provider) return

    try {
        loadingTimeSlots.value = true
        timeSlotsError.value = null

        const response = await axios.get(`/appointments/availability/${appointment.value.provider._id}`, {
            params: { date: formData.value.date }
        })

        if (response.data.availableSlots && Array.isArray(response.data.availableSlots)) {
            availableTimeSlots.value = response.data.availableSlots.map(slot => {
                let timeValue, timeLabel

                if (slot.start) {
                    const startTime = new Date(slot.start)
                    timeValue = format(startTime, 'HH:mm')
                    timeLabel = format(startTime, 'h:mm a')
                } else if (slot.time) {
                    timeValue = slot.time
                    timeLabel = format(parseISO(`${formData.value.date}T${slot.time}`), 'h:mm a')
                } else {
                    timeValue = slot
                    timeLabel = format(parseISO(`${formData.value.date}T${slot}`), 'h:mm a')
                }

                return { value: timeValue, label: timeLabel }
            })
        } else {
            availableTimeSlots.value = []
        }
    } catch (err) {
        console.error('Error loading time slots:', err)
        timeSlotsError.value = 'Failed to load available times. Please try again.'
        availableTimeSlots.value = []
    } finally {
        loadingTimeSlots.value = false
    }
}

const retryLoadTimeSlots = () => {
    timeSlotsError.value = null
    loadAvailableTimeSlots()
}

const rescheduleAppointment = async () => {
    try {
        saving.value = true
        submitError.value = null

        const newDateTime = new Date(`${formData.value.date}T${formData.value.time}`)

        const rescheduleData = {
            newDateTime: newDateTime.toISOString(),
            reason: formData.value.reason || 'Client requested reschedule'
        }

        await axios.post(`/appointments/${route.params.id}/reschedule`, rescheduleData)

        // Show success and redirect
        router.push({
            path: '/appointments/me',
            query: { message: 'Reschedule request sent successfully. Waiting for provider confirmation.' }
        })
    } catch (err) {
        console.error('Error rescheduling appointment:', err)
        submitError.value = err.response?.data?.message || 'Failed to reschedule appointment'
    } finally {
        saving.value = false
    }
}

const goBack = () => {
    router.push('/appointments/me')
}

// Helper functions
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const formatSelectedDateTime = () => {
    if (!formData.value.date || !formData.value.time) return ''
    const dateTime = new Date(`${formData.value.date}T${formData.value.time}`)
    return format(dateTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a')
}

const getProviderName = (provider) => {
    if (!provider) return 'Unknown Provider'
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'
}

const formatStatus = (status) => {
    if (status === 'pending-payment') return 'Pending payment'
    return status?.charAt(0).toUpperCase() + status?.slice(1) || ''
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

// Lifecycle
onMounted(() => {
    loadAppointment()
})
</script>

<style scoped>
.btn-primary {
    @apply bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-all duration-200 shadow-lg px-6 py-2;
}

.brand-1 {
    color: #0ea5e9;
}

.brand-2 {
    color: #0284c7;
}
</style>