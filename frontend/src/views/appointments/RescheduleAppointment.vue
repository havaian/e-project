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
                        <h1 class="text-2xl font-bold text-gray-900">{{ $t('reschedule.title') }}</h1>
                        <p class="text-gray-600">{{ $t('reschedule.subtitle') }}</p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-1 mx-auto"></div>
                    <p class="mt-4 text-gray-600">{{ $t('appointmentDetail.loading') }}</p>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
                <div class="flex items-center space-x-3">
                    <ExclamationTriangleIcon class="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                        <h3 class="text-lg font-medium text-red-900">{{ $t('reschedule.unableToLoad') }}</h3>
                        <p class="text-red-700 mt-1">{{ error }}</p>
                    </div>
                </div>
                <div class="mt-4">
                    <button @click="goBack" class="btn-primary">
                        {{ $t('reschedule.backToAppointments') }}
                    </button>
                </div>
            </div>

            <!-- Reschedule Restrictions Notice -->
            <div v-else-if="!canReschedule" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div class="flex items-start space-x-3">
                    <ExclamationTriangleIcon class="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 class="text-lg font-medium text-yellow-900">{{ $t('reschedule.cannotReschedule') }}</h3>
                        <div class="text-yellow-700 mt-2 space-y-2">
                            <p v-if="appointment?.rescheduleCount >= 1">
                                {{ $t('reschedule.alreadyRescheduled') }}
                            </p>
                            <p v-else-if="isWithin12Hours">
                                {{ $t('reschedule.within12Hours') }}
                            </p>
                            <p v-else-if="appointment?.status !== 'scheduled'">
                                {{ $t('reschedule.onlyScheduled', { status: formatStatus(appointment?.status) }) }}
                            </p>
                            <p v-else>
                                {{ $t('reschedule.cannotRescheduleGeneric') }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <button @click="goBack" class="btn-primary">
                        {{ $t('reschedule.backToAppointments') }}
                    </button>
                </div>
            </div>

            <!-- Reschedule Form -->
            <div v-else class="space-y-6">
                <!-- Current Appointment Info -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 class="text-lg font-medium text-blue-900 mb-4">{{ $t('reschedule.currentAppointment') }}</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-blue-700 font-medium">{{ $t('reschedule.currentDateTime') }}:</span>
                            <p class="text-blue-900">{{ formatDateTime(appointment.dateTime) }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">{{ $t('reschedule.type') }}:</span>
                            <p class="text-blue-900 capitalize">{{ appointment.type ||
                                $t('clientAppointments.videoSession') }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">{{ $t('appointmentDetail.provider') }}:</span>
                            <p class="text-blue-900">{{ getProviderName(appointment.provider) }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">{{ $t('reschedule.status') }}:</span>
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
                            <h4 class="font-medium">{{ $t('reschedule.noticeTitle') }}</h4>
                            <ul class="mt-2 text-sm space-y-1">
                                <li>• {{ $t('reschedule.notice1') }}</li>
                                <li>• {{ $t('reschedule.notice2') }}</li>
                                <li>• {{ $t('reschedule.notice3') }}</li>
                                <li>• {{ $t('reschedule.notice4') }}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Reschedule Form -->
                <form @submit.prevent="rescheduleAppointment"
                    class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-6">{{ $t('reschedule.selectNewDateTime') }}</h2>

                    <!-- Date Selection using ReusableCalendar -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('reschedule.newDate') }} <span class="text-red-500">*</span>
                        </label>
                        <ReusableCalendar v-model="selectedDateObj" :disable-past-dates="true" :max-future-days="90"
                            :show-selected-date-info="true" @date-selected="handleDateSelected" />
                        <div v-if="formData.date && !loadingTimeSlots && availableTimeSlots.length === 0"
                            class="mt-2 text-sm text-amber-600">
                            {{ $t('booking.noTimeSlotsForDate') }}
                        </div>
                    </div>

                    <!-- Time Selection -->
                    <div class="mb-6">
                        <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('reschedule.newTime') }} <span class="text-red-500">*</span>
                        </label>
                        <div class="relative">
                            <select id="time" v-model="formData.time" required
                                :disabled="!formData.date || loadingTimeSlots"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1 disabled:bg-gray-100 disabled:cursor-not-allowed">
                                <option value="">
                                    {{ loadingTimeSlots ? $t('common.loading') : $t('booking.selectTime') }}
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
                                {{ $t('booking.noTimeSlotsForDate') }}
                            </p>
                            <p v-else-if="availableTimeSlots.length > 0" class="text-sm text-green-600">
                                {{ $t('booking.timeSlotsAvailable', { count: availableTimeSlots.length }) }}
                            </p>
                        </div>

                        <!-- Error handling -->
                        <div v-if="timeSlotsError" class="mt-2">
                            <p class="text-sm text-red-600">{{ timeSlotsError }}</p>
                            <button @click="retryLoadTimeSlots" type="button"
                                class="text-sm text-brand-1 hover:text-brand-2 underline mt-1">
                                {{ $t('booking.tryAgain') }}
                            </button>
                        </div>
                    </div>

                    <!-- Reason for Reschedule -->
                    <div class="mb-6">
                        <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                            {{ $t('reschedule.reason') }}
                        </label>
                        <textarea id="reason" v-model="formData.reason" rows="3"
                            :placeholder="$t('reschedule.reasonPlaceholder')" class="input resize-none"></textarea>
                    </div>

                    <!-- New Appointment Summary -->
                    <div v-if="formData.date && formData.time" class="mb-6 bg-gray-50 rounded-lg p-4">
                        <h4 class="font-medium text-gray-900 mb-3">{{ $t('reschedule.newSummary') }}</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">{{ $t('appointmentDetail.provider') }}:</span>
                                <span class="font-medium">{{ getProviderName(appointment.provider) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">{{ $t('reschedule.newDateTime') }}:</span>
                                <span class="font-medium">{{ formatSelectedDateTime() }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">{{ $t('appointmentDetail.sessionType') }}:</span>
                                <span class="font-medium capitalize">{{ appointment.type || 'video' }} {{
                                    $t('booking.session') }}</span>
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
                            {{ $t('common.cancel') }}
                        </button>

                        <button type="submit" :disabled="saving || !formData.date || !formData.time"
                            class="px-6 py-2 text-sm text-white bg-brand-1 rounded-lg hover:bg-brand-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                            <span v-if="saving">{{ $t('reschedule.sendingRequest') }}</span>
                            <span v-else>{{ $t('reschedule.sendRequest') }}</span>
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
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import ReusableCalendar from '@/components/calendar/ReusableCalendar.vue'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
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
        error.value = err.response?.data?.message || t('reschedule.loadFailed')
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
        timeSlotsError.value = t('booking.timeSlotsError')
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
            query: { message: t('reschedule.success') }
        })
    } catch (err) {
        console.error('Error rescheduling appointment:', err)
        submitError.value = err.response?.data?.message || t('reschedule.failed')
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
    if (!provider) return t('booking.unknownProvider')
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || t('appointmentDetail.provider')
}

const formatStatus = (status) => {
    const statusMap = {
        'pending-provider-confirmation': t('appointments.statusPendingConfirmation'),
        'pending-payment': t('appointments.statusPendingPayment'),
        'scheduled': t('appointments.statusScheduled'),
        'completed': t('appointments.statusCompleted'),
        'canceled': t('appointments.statusCanceled'),
        'cancelled': t('appointments.statusCanceled'),
        'no-show': t('appointments.statusNoShow')
    }
    return statusMap[status] || status
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