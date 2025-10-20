<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6 flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">My appointments</h1>
                        <p class="text-gray-600">Manage your upcoming and past consultations</p>
                    </div>
                    <router-link to="/book-appointment" class="btn-primary">
                        <PlusIcon class="w-5 h-5 mr-2" />
                        Book new appointment
                    </router-link>
                </div>
            </div>
        </div>

        <!-- Success Message -->
        <div v-if="$route.query.message" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                    <CheckCircleIcon class="w-5 h-5 text-green-500 mr-2" />
                    <p class="text-green-800">{{ $route.query.message }}</p>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-1"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="appointments.length === 0" class="text-center py-12">
                <CalendarDaysIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                <p class="text-gray-600 mb-6">Book your first consultation to get started</p>
                <router-link to="/book-appointment" class="btn-primary">
                    Book Your First Appointment
                </router-link>
            </div>

            <!-- Appointments List -->
            <div v-else class="space-y-6">
                <div v-for="appointment in appointments" :key="appointment._id"
                    class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="p-6">
                        <!-- Appointment Header -->
                        <div class="flex items-start justify-between mb-4">
                            <div class="flex items-center space-x-4">
                                <img :src="appointment.provider?.profilePicture || '/images/default-avatar.png'"
                                    :alt="getProviderName(appointment.provider)"
                                    class="w-12 h-12 rounded-full object-cover">
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">
                                        {{ getProviderName(appointment.provider) }}
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        {{ appointment.provider?.specializations?.[0] || 'Consultant' }}
                                    </p>
                                </div>
                            </div>
                            <span class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
                                :class="getStatusClass(appointment.status)">
                                {{ formatStatus(appointment.status) }}
                            </span>
                        </div>

                        <!-- Appointment details -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div class="flex items-center text-sm text-gray-600">
                                <CalendarIcon class="w-5 h-5 mr-2" />
                                {{ formatDateTime(appointment.dateTime) }}
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <ClockIcon class="w-5 h-5 mr-2" />
                                {{ appointment.type || 'Video session' }}
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <CurrencyDollarIcon class="w-5 h-5 mr-2" />
                                {{ formatCurrency(appointment.payment?.amount || 0) }}
                            </div>
                        </div>

                        <!-- Payment status for Pending Payments -->
                        <div v-if="appointment.payment?.status === 'failed' || appointment.payment?.status === 'pending'"
                            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center">
                                    <ExclamationTriangleIcon class="w-5 h-5 text-yellow-500 mr-2" />
                                    <div>
                                        <p class="text-sm font-medium text-yellow-800">Payment Required</p>
                                        <p class="text-xs text-yellow-700">Complete payment to confirm your appointment
                                        </p>
                                    </div>
                                </div>
                                <button @click="retryPayment(appointment._id)"
                                    class="px-3 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded hover:bg-yellow-200">
                                    Pay Now
                                </button>
                            </div>
                        </div>

                        <!-- Reschedule Request status -->
                        <div v-if="appointment.status === 'pending-provider-confirmation' && appointment.rescheduleHistory?.length > 0"
                            class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                            <div class="flex items-center">
                                <ClockIcon class="w-5 h-5 text-purple-500 mr-2" />
                                <div>
                                    <p class="text-sm font-medium text-purple-800">Reschedule Request Pending</p>
                                    <p class="text-xs text-purple-700">Waiting for provider to confirm your reschedule
                                        request</p>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div v-if="appointment.shortDescription" class="mb-4">
                            <p class="text-sm text-gray-600">{{ appointment.shortDescription }}</p>
                        </div>

                        <!-- Actions -->
                        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div class="flex items-center space-x-2">
                                <!-- View details -->
                                <router-link :to="`/appointments/${appointment._id}`"
                                    class="px-3 py-2 text-sm text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                                    View details
                                </router-link>

                                <!-- Reschedule (only for scheduled appointments, not already rescheduled, and more than 12 hours away) -->
                                <router-link v-if="canReschedule(appointment)"
                                    :to="`/appointments/${appointment._id}/edit`"
                                    class="px-3 py-2 text-sm text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                                    <ArrowPathIcon class="w-4 h-4 mr-1 inline" />
                                    Reschedule
                                </router-link>

                                <!-- Join session (for scheduled appointments within join window) -->
                                <button v-if="canJoinSession(appointment)" @click="joinSession(appointment._id)"
                                    class="px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                                    <VideoCameraIcon class="w-4 h-4 mr-1 inline" />
                                    Join session
                                </button>
                            </div>

                            <!-- Reschedule Count Info -->
                            <div v-if="appointment.rescheduleCount > 0" class="text-xs text-gray-500">
                                Rescheduled {{ appointment.rescheduleCount }} time{{ appointment.rescheduleCount > 1 ?
                                's' : '' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format, parseISO, isFuture, isWithinInterval, subMinutes, addMinutes, subHours } from 'date-fns'
import axios from '@/plugins/axios'
import { usePaymentStore } from '@/stores/payment'
import {
    PlusIcon,
    CalendarIcon,
    ClockIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    VideoCameraIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const paymentStore = usePaymentStore()

// State
const loading = ref(true)
const appointments = ref([])

// Methods
const loadAppointments = async () => {
    try {
        loading.value = true
        const response = await axios.get('/appointments/me')
        appointments.value = response.data.appointments || []
    } catch (err) {
        console.error('Error loading appointments:', err)
        appointments.value = []
    } finally {
        loading.value = false
    }
}

const retryPayment = async (appointmentId) => {
    try {
        await paymentStore.createCheckoutSession(appointmentId)
    } catch (error) {
        console.error('Error retrying payment:', error)
        // Show error message to user
    }
}

const joinSession = async (appointmentId) => {
    try {
        router.push(`/session/${appointmentId}`)
    } catch (error) {
        console.error('Error joining session:', error)
    }
}

// Helper functions
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UZS',
        minimumFractionDigits: 0
    }).format(amount || 0)
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

const formatStatus = (status) => {
    const statusMap = {
        'pending-provider-confirmation': 'Pending Confirmation',
        'pending-payment': 'Payment Required',
        'scheduled': 'Scheduled',
        'completed': 'Completed',
        'canceled': 'Canceled',
        'cancelled': 'Canceled',
        'no-show': 'No Show'
    }
    return statusMap[status] || status
}

const canReschedule = (appointment) => {
    // Only allow reschedule for scheduled appointments
    if (appointment.status !== 'scheduled') return false

    // Check if already rescheduled once
    if (appointment.rescheduleCount >= 1) return false

    // Check if appointment is more than 12 hours away
    const appointmentTime = parseISO(appointment.dateTime)
    const twelveHoursBeforeAppointment = subHours(appointmentTime, 12)
    const now = new Date()

    return now < twelveHoursBeforeAppointment
}

const canJoinSession = (appointment) => {
    // Only for scheduled appointments
    if (appointment.status !== 'scheduled') return false

    // Check if within join window (5 minutes before to 30 minutes after)
    const appointmentTime = parseISO(appointment.dateTime)
    const now = new Date()

    return isWithinInterval(now, {
        start: subMinutes(appointmentTime, 5),
        end: addMinutes(appointmentTime, 30)
    })
}

// Lifecycle
onMounted(() => {
    loadAppointments()
})
</script>