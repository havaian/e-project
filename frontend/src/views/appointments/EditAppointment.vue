<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <div class="flex items-center space-x-4">
                    <router-link to="/appointments/me" class="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <ArrowLeftIcon class="w-5 h-5" />
                    </router-link>
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Reschedule Appointment</h1>
                        <p class="text-gray-600">Change your appointment date and time</p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-1"></div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
                <div class="flex items-center space-x-3">
                    <ExclamationTriangleIcon class="w-6 h-6 text-red-500" />
                    <div>
                        <h3 class="text-lg font-medium text-red-900">Unable to Load Appointment</h3>
                        <p class="text-red-700 mt-1">{{ error }}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <router-link to="/appointments/me" class="btn-primary">
                        Back to appointments
                    </router-link>
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
                                Only scheduled appointments can be rescheduled. Current status: {{ appointment?.status
                                }}
                            </p>
                            <p v-else>
                                This appointment cannot be rescheduled at this time.
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <router-link to="/appointments/me" class="btn-primary">
                        Back to appointments
                    </router-link>
                </div>
            </div>

            <!-- Reschedule Form -->
            <form v-else @submit.prevent="rescheduleAppointment" class="space-y-6">
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
                                {{ appointment.status }}
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

                <!-- New Date and Time Selection -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-6">Select New Date & time</h2>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Date -->
                        <div>
                            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
                                New Date <span class="text-red-500">*</span>
                            </label>
                            <input id="date" v-model="formData.date" type="date" :min="minDate" :max="maxDate" required
                                @change="loadAvailableTimeSlots"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1" />
                        </div>

                        <!-- Time -->
                        <div>
                            <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                                New Time <span class="text-red-500">*</span>
                            </label>
                            <select id="time" v-model="formData.time" required
                                :disabled="!formData.date || availableTimeSlots.length === 0"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1 disabled:bg-gray-100">
                                <option value="">Select time</option>
                                <option v-for="slot in availableTimeSlots" :key="slot.value" :value="slot.value">
                                    {{ slot.label }}
                                </option>
                            </select>
                            <p v-if="formData.date && availableTimeSlots.length === 0"
                                class="text-sm text-amber-600 mt-2">
                                No available time slots for selected date
                            </p>
                        </div>
                    </div>

                    <!-- Reason for Reschedule -->
                    <div class="mt-6">
                        <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Reschedule (Optional)
                        </label>
                        <textarea id="reason" v-model="formData.reason" rows="3"
                            placeholder="Please explain why you need to reschedule this appointment..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1"></textarea>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                    <router-link to="/appointments/me"
                        class="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Cancel
                    </router-link>

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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO, addDays, isFuture, isWithinInterval, subHours } from 'date-fns'
import axios from '@/plugins/axios'
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
const appointment = ref(null)
const availableTimeSlots = ref([])

const formData = ref({
    date: '',
    time: '',
    reason: ''
})

// Computed properties
const minDate = computed(() => {
    const tomorrow = addDays(new Date(), 1)
    return format(tomorrow, 'yyyy-MM-dd')
})

const maxDate = computed(() => {
    const maxDate = addDays(new Date(), 90)
    return format(maxDate, 'yyyy-MM-dd')
})

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

const loadAvailableTimeSlots = async () => {
    if (!formData.value.date || !appointment.value?.provider) return

    try {
        const response = await axios.get(`/appointments/availability/${appointment.value.provider._id}`, {
            params: { date: formData.value.date }
        })

        const slots = response.data.availableSlots || []
        availableTimeSlots.value = slots.map(slot => ({
            value: slot.time,
            label: format(parseISO(`${formData.value.date}T${slot.time}`), 'h:mm a')
        }))
    } catch (err) {
        console.error('Error loading time slots:', err)
        availableTimeSlots.value = []
    }
}

const rescheduleAppointment = async () => {
    try {
        saving.value = true

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
        error.value = err.response?.data?.message || 'Failed to reschedule appointment'
    } finally {
        saving.value = false
    }
}

// Helper functions
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const getProviderName = (provider) => {
    if (!provider) return 'Unknown Provider'
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'
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
</style>