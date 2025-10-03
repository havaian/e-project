<template>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">Loading...</p>
        </div>

        <template v-else-if="provider">
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="p-6">
                    <h1 class="text-2xl font-bold text-gray-900">
                        Book Appointment with Dr. {{ provider.firstName }} {{ provider.lastName }}
                    </h1>
                    <div class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <span v-for="spec in provider.specializations" :key="spec"
                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {{ spec }}
                        </span>
                    </div>

                    <form @submit.prevent="handleSubmit" class="mt-6 space-y-6">
                        <!-- Beautiful Calendar using ReusableCalendar -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-3">Select Date</label>

                            <ReusableCalendar v-model="selectedDateObj" :disable-past-dates="true" :max-future-days="30"
                                :show-selected-date-info="true" @date-selected="handleDateSelected" />

                            <p v-if="validationErrors.date" class="mt-2 text-sm text-red-600">
                                {{ validationErrors.date }}
                            </p>
                        </div>

                        <!-- Time Slots -->
                        <div v-if="formData.date">
                            <label class="block text-sm font-medium text-gray-700 mb-3">Available Time Slots</label>
                            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                <button v-for="slot in availableSlots" :key="slot.start" type="button"
                                    class="px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    :class="{
                                        'ring-2 ring-blue-500 bg-blue-50 border-blue-500 text-blue-700': formData.time === slot.start
                                    }" @click="formData.time = slot.start">
                                    {{ formatTimeDisplay(slot.start) }}
                                </button>
                            </div>
                            <p v-if="availableSlots.length === 0"
                                class="mt-3 text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                                No available slots for this date. Please select another date.
                            </p>
                            <p v-if="validationErrors.time" class="mt-2 text-sm text-red-600">
                                {{ validationErrors.time }}
                            </p>
                        </div>

                        <!-- Session Type -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-3">Session Type</label>
                            <div class="grid grid-cols-3 gap-3">
                                <button v-for="type in sessionTypes" :key="type.value" type="button"
                                    class="px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    :class="{
                                        'ring-2 ring-blue-500 bg-blue-50 border-blue-500 text-blue-700': formData.type === type.value,
                                        'border-red-500': validationErrors.type
                                    }" @click="formData.type = type.value">
                                    <div class="flex items-center justify-center space-x-2">
                                        <component :is="type.icon" class="w-4 h-4" />
                                        <span>{{ type.label }}</span>
                                    </div>
                                </button>
                            </div>
                            <p v-if="validationErrors.type" class="mt-2 text-sm text-red-600">
                                {{ validationErrors.type }}
                            </p>
                        </div>

                        <!-- Short description -->
                        <div>
                            <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Short
                                description</label>
                            <textarea id="description" v-model="formData.shortDescription" rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Please describe what you'd like to discuss in this session..."
                                :class="{ 'border-red-500': validationErrors.shortDescription }"></textarea>
                            <p v-if="validationErrors.shortDescription" class="mt-2 text-sm text-red-600">
                                {{ validationErrors.shortDescription }}
                            </p>
                        </div>

                        <!-- Fee Information -->
                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                            <div class="flex items-center space-x-3">
                                <BanknotesIcon class="w-5 h-5 w-6 h-6 text-blue-600" />
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900">Session Fee</h3>
                                    <p class="text-2xl font-bold text-blue-600">
                                        {{ formatFee() }} UZS
                                    </p>
                                    <p class="mt-1 text-sm text-gray-600">
                                        Payment will be processed securely via Stripe after booking.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button type="submit"
                                class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                :disabled="submitting">
                                <div class="flex items-center justify-center space-x-2">
                                    <svg v-if="submitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    <span>{{ submitting ? 'Processing...' : 'Proceed to Payment' }}</span>
                                </div>
                            </button>
                        </div>

                        <div v-if="error" class="text-sm text-center text-red-600 bg-red-50 p-3 rounded-lg">
                            {{ error }}
                        </div>
                    </form>
                </div>
            </div>
        </template>

        <div v-else class="text-center py-8">
            <p class="text-gray-600">Provider not found.</p>
        </div>
    </div>
</template>

<script setup>
import { VideoCameraIcon, MicrophoneIcon, ChatBubbleLeftRightIcon, BanknotesIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { format, parseISO, subMinutes, addMinutes, isWithinInterval } from 'date-fns'
import { usePaymentStore } from '@/stores/payment'
import axios from '@/plugins/axios'
import ReusableCalendar from '@/components/calendar/ReusableCalendar.vue'

const route = useRoute()
const router = useRouter()
const paymentStore = usePaymentStore()

const provider = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const availableSlots = ref([])
const selectedDateObj = ref(null)

const validationErrors = reactive({
    date: '',
    time: '',
    type: '',
    shortDescription: ''
})

// Icons for session types
const sessionTypes = [
    { value: 'video', label: 'Video', icon: VideoCameraIcon },
    { value: 'voice', label: 'Voice', icon: MicrophoneIcon },
    { value: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon }
]

const formData = reactive({
    date: '',
    time: '',
    type: 'video',
    shortDescription: ''
})

// Handle date selection from ReusableCalendar
const handleDateSelected = (date) => {
    selectedDateObj.value = date
    formData.date = format(date, 'yyyy-MM-dd')
    validationErrors.date = ''
    fetchAvailableSlots()
}

// Watch for manual date changes
watch(() => formData.date, (newDate) => {
    if (newDate && selectedDateObj.value && format(selectedDateObj.value, 'yyyy-MM-dd') !== newDate) {
        selectedDateObj.value = new Date(newDate)
    }
})

// Safe formatting function for currency
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
        return '0'
    }
    const numAmount = Number(amount)
    if (isNaN(numAmount)) {
        console.error('Invalid fee amount:', amount)
        return '0'
    }
    return new Intl.NumberFormat('uz-UZ').format(numAmount)
}

const formatFee = () => {
    if (!provider.value) return '0'
    return formatCurrency(provider.value.sessionFee)
}

const formatTimeDisplay = (timeString) => {
    try {
        const timeDate = new Date(timeString)
        const utc5Time = new Date(timeDate.getTime() + 0)

        const hours = utc5Time.getUTCHours()
        const minutes = utc5Time.getUTCMinutes()

        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours % 12 || 12
        const displayMinutes = minutes.toString().padStart(2, '0')

        return `${displayHours}:${displayMinutes} ${period}`
    } catch (error) {
        console.error('Error formatting time:', error)
        return timeString
    }
}

const isWithinJoinWindow = (dateTime) => {
    const appointmentTime = parseISO(dateTime)
    const now = new Date()
    return isWithinInterval(now, {
        start: subMinutes(appointmentTime, 5),
        end: addMinutes(appointmentTime, 30)
    })
}

async function fetchProviderProfile() {
    try {
        loading.value = true
        const response = await axios.get(`/users/providers/${route.params.providerId}`)
        provider.value = response.data.provider
    } catch (error) {
        console.error('Error fetching provider profile:', error)
    } finally {
        loading.value = false
    }
}

async function fetchAvailableSlots() {
    try {
        const response = await axios.get(`/appointments/availability/${route.params.providerId}`, {
            params: { date: formData.date }
        })
        availableSlots.value = response.data.availableSlots.map(slot => ({
            ...slot,
            start: slot.start
        }))

        formData.time = ''
        validationErrors.time = ''
    } catch (error) {
        console.error('Error fetching available slots:', error)
        availableSlots.value = []
    }
}

function validateForm() {
    Object.keys(validationErrors).forEach(key => {
        validationErrors[key] = ''
    })

    let isValid = true

    if (!formData.date) {
        validationErrors.date = 'Please select a date'
        isValid = false
    }

    if (!formData.time) {
        validationErrors.time = 'Please select a time slot'
        isValid = false
    }

    if (!formData.type) {
        validationErrors.type = 'Please select a session type'
        isValid = false
    }

    if (!formData.shortDescription.trim()) {
        validationErrors.shortDescription = 'Please provide a short description'
        isValid = false
    }

    return isValid
}

async function handleSubmit() {
    if (!validateForm()) {
        return
    }

    try {
        submitting.value = true
        error.value = ''

        const selectedDateTime = formData.time

        const appointmentData = {
            providerId: route.params.providerId,
            dateTime: selectedDateTime,
            type: formData.type,
            shortDescription: formData.shortDescription
        }

        const response = await axios.post('/appointments', appointmentData)
        await paymentStore.createCheckoutSession(response.data.appointment._id)

    } catch (err) {
        console.error('Error booking appointment:', err)
        error.value = err.response?.data?.message || 'Failed to book appointment'
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    fetchProviderProfile()
})
</script>