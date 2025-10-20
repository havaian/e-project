<template>
    <div class="min-h-screen bg-gray-50 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h1>
                <p class="text-gray-600">Schedule a consultation with one of our verified providers</p>
            </div>

            <!-- Provider Selection -->
            <div v-if="!selectedProvider" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h2 class="text-xl font-semibold text-gray-900 mb-4">Select a Provider</h2>

                <!-- Provider Search/Filter -->
                <div class="mb-6">
                    <input v-model="searchQuery" type="text" placeholder="Search providers by name or specialization..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1" />
                </div>

                <!-- Providers List -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="provider in filteredProviders" :key="provider._id" @click="selectProvider(provider)"
                        class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-brand-1 hover:bg-brand-1/5 transition-colors">
                        <div class="flex items-center space-x-4">
                            <img :src="provider.profilePicture || '/images/default-avatar.png'"
                                :alt="getProviderName(provider)" class="w-12 h-12 rounded-full object-cover">
                            <div class="flex-1">
                                <h3 class="font-medium text-gray-900">{{ getProviderName(provider) }}</h3>
                                <p class="text-sm text-gray-600">{{ provider.specializations?.[0] || 'Consultant' }}</p>
                                <p class="text-sm font-medium text-brand-1">{{ formatCurrency(provider.sessionFee) }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="loadingProvider" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div class="flex items-center justify-center py-8">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
                    <p class="ml-3 text-gray-600">Loading provider...</p>
                </div>
            </div>

            <!-- Booking Form -->
            <div v-else class="space-y-6">
                <!-- Selected Provider Info -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-xl font-semibold text-gray-900">Selected Provider</h2>
                        <button @click="selectedProvider = null" class="text-sm text-gray-500 hover:text-gray-700">
                            Change Provider
                        </button>
                    </div>

                    <div class="flex items-center space-x-4">
                        <img :src="selectedProvider.profilePicture || '/images/default-avatar.png'"
                            :alt="getProviderName(selectedProvider)" class="w-16 h-16 rounded-full object-cover">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900">{{ getProviderName(selectedProvider) }}</h3>
                            <p class="text-gray-600">{{ selectedProvider.specializations?.[0] || 'Consultant' }}</p>
                            <p class="text-lg font-medium text-brand-1">{{ formatCurrency(selectedProvider.sessionFee)
                                }}</p>
                        </div>
                    </div>
                </div>

                <!-- Booking Form -->
                <form @submit.prevent="bookAppointment"
                    class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-6">Appointment details</h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Date Selection using ReusableCalendar -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Select Date <span class="text-red-500">*</span>
                            </label>
                            <ReusableCalendar v-model="selectedDateObj" :disable-past-dates="true" :max-future-days="90"
                                :show-selected-date-info="true" @date-selected="handleDateSelected" />
                            <div v-if="formData.date && !loadingTimeSlots && availableTimeSlots.length === 0"
                                class="mt-2 text-sm text-amber-600">
                                No available time slots for selected date. Please choose a different date.
                            </div>
                        </div>

                        <!-- Time Selection -->
                        <div>
                            <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                                Time <span class="text-red-500">*</span>
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

                            <!-- Time Slots status Messages -->
                            <div v-if="formData.date && !loadingTimeSlots" class="mt-2">
                                <p v-if="availableTimeSlots.length === 0" class="text-sm text-amber-600">
                                    No available time slots for selected date. Please choose a different date.
                                </p>
                                <p v-else-if="availableTimeSlots.length > 0" class="text-sm text-green-600">
                                    {{ availableTimeSlots.length }} time slot{{ availableTimeSlots.length > 1 ? 's' : ''
                                    }} available
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
                    </div>

                    <!-- Session type -->
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Session type <span class="text-red-500">*</span>
                        </label>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <label v-for="type in sessionTypes" :key="type.value"
                                class="relative flex items-center space-x-3 border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-brand-1 transition-colors"
                                :class="{ 'border-brand-1 bg-brand-1/5': formData.type === type.value }">
                                <input v-model="formData.type" :value="type.value" type="radio" required
                                    class="h-4 w-4 text-brand-1 border-gray-300 focus:ring-brand-1" />
                                <div>
                                    <div class="text-sm font-medium text-gray-900">{{ type.label }}</div>
                                    <div class="text-xs text-gray-500">{{ type.description }}</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mt-6">
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                            Brief Description (Optional)
                        </label>
                        <textarea id="description" v-model="formData.shortDescription" rows="3"
                            placeholder="Briefly describe what you'd like to discuss in this consultation..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1"></textarea>
                    </div>

                    <!-- Appointment Summary -->
                    <div v-if="formData.date && formData.time" class="mt-8 bg-gray-50 rounded-lg p-4">
                        <h4 class="font-medium text-gray-900 mb-3">Appointment Summary</h4>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">Provider:</span>
                                <span class="font-medium">{{ getProviderName(selectedProvider) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Date & time:</span>
                                <span class="font-medium">{{ formatSelectedDateTime() }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">Session type:</span>
                                <span class="font-medium capitalize">{{ formData.type }} session</span>
                            </div>
                            <div class="flex justify-between pt-2 border-t border-gray-200">
                                <span class="text-gray-600">Session fee:</span>
                                <span class="font-bold text-brand-1">{{ formatCurrency(selectedProvider.sessionFee)
                                    }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Error Display -->
                    <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-center">
                            <ExclamationTriangleIcon class="w-5 h-5 text-red-500 mr-2" />
                            <p class="text-red-800">{{ error }}</p>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="mt-8 flex items-center justify-between">
                        <button type="button" @click="selectedProvider = null"
                            class="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Back to Providers
                        </button>

                        <button type="submit" :disabled="booking || !formData.date || !formData.time || !formData.type"
                            class="px-8 py-3 text-white bg-brand-1 rounded-lg hover:bg-brand-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                            <span v-if="booking">Creating Appointment...</span>
                            <span v-else>Book appointment</span>
                            <ArrowRightIcon v-if="!booking" class="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format, addDays, parseISO } from 'date-fns'
import axios from '@/plugins/axios'
import { usePaymentStore } from '@/stores/payment'
import ReusableCalendar from '@/components/calendar/ReusableCalendar.vue'
import {
    ArrowRightIcon,
    ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const paymentStore = usePaymentStore()

// State
const providers = ref([])
const selectedProvider = ref(null)
const searchQuery = ref('')
const availableTimeSlots = ref([])
const loadingTimeSlots = ref(false)
const timeSlotsError = ref(null)
const booking = ref(false)
const error = ref(null)
const selectedDateObj = ref(null)
const loadingProvider = ref(false)

const formData = ref({
    date: '',
    time: '',
    type: 'video',
    shortDescription: ''
})

const sessionTypes = [
    {
        value: 'video',
        label: 'Video Call',
        description: 'Online video consultation'
    },
    {
        value: 'phone',
        label: 'Phone Call',
        description: 'Voice-only consultation'
    },
    {
        value: 'in-person',
        label: 'In-Person',
        description: 'Face-to-face meeting'
    }
]

// Handle date selection from ReusableCalendar
const handleDateSelected = (date) => {
    selectedDateObj.value = date
    formData.value.date = format(date, 'yyyy-MM-dd')
    formData.value.time = '' // Reset time when date changes
    loadAvailableTimeSlots()
}

// Watch for manual date changes (keeping compatibility)
watch(() => formData.value.date, (newDate) => {
    if (newDate && selectedDateObj.value && format(selectedDateObj.value, 'yyyy-MM-dd') !== newDate) {
        selectedDateObj.value = new Date(newDate)
    }
})

// Computed
const filteredProviders = computed(() => {
    if (!searchQuery.value) return providers.value

    const query = searchQuery.value.toLowerCase()
    return providers.value.filter(provider => {
        const name = `${provider.firstName} ${provider.lastName}`.toLowerCase()
        const specializations = (provider.specializations || []).join(' ').toLowerCase()
        return name.includes(query) || specializations.includes(query)
    })
})

const minDate = computed(() => {
    const tomorrow = addDays(new Date(), 1)
    return format(tomorrow, 'yyyy-MM-dd')
})

const maxDate = computed(() => {
    const maxDate = addDays(new Date(), 90)
    return format(maxDate, 'yyyy-MM-dd')
})

// Methods
const loadProviders = async () => {
    try {
        const response = await axios.get('/users/providers')
        providers.value = response.data.providers || []
        
        // After loading providers, check if we need to pre-select one from the URL
        await handleProviderFromRoute()
    } catch (err) {
        console.error('Error loading providers:', err)
        error.value = 'Failed to load providers. Please refresh the page.'
    }
}

const handleProviderFromRoute = async () => {
    const providerId = route.params.providerId
    
    if (providerId) {
        // First check if the provider is in our loaded providers list
        const provider = providers.value.find(p => p._id === providerId)
        
        if (provider) {
            selectedProvider.value = provider
            console.log('Pre-selected provider from route:', provider)
        } else {
            // If not found in the list, try to fetch it directly
            await loadSpecificProvider(providerId)
        }
    }
}

const loadSpecificProvider = async (providerId) => {
    try {
        loadingProvider.value = true
        console.log('Loading specific provider:', providerId)
        
        const response = await axios.get(`/users/providers/${providerId}`)
        const provider = response.data.provider || response.data
        
        if (provider) {
            selectedProvider.value = provider
            console.log('Loaded specific provider:', provider)
        } else {
            error.value = 'Provider not found or is not available for booking.'
            // Redirect back to provider list if provider not found
            router.push('/providers')
        }
    } catch (err) {
        console.error('Error loading specific provider:', err)
        error.value = 'Failed to load provider. Please try again.'
        // Redirect back to provider list on error
        router.push('/providers')
    } finally {
        loadingProvider.value = false
    }
}

const selectProvider = (provider) => {
    selectedProvider.value = provider
    // Reset form when changing provider
    formData.value = {
        date: '',
        time: '',
        type: 'video',
        shortDescription: ''
    }
    selectedDateObj.value = null
    availableTimeSlots.value = []
}

const loadAvailableTimeSlots = async () => {
    if (!formData.value.date || !selectedProvider.value) {
        availableTimeSlots.value = []
        return
    }

    try {
        loadingTimeSlots.value = true
        timeSlotsError.value = null

        console.log('Loading time slots for:', {
            providerId: selectedProvider.value._id,
            date: formData.value.date
        })

        const response = await axios.get(`/appointments/availability/${selectedProvider.value._id}`, {
            params: { date: formData.value.date }
        })

        console.log('Time slots response:', response.data)

        if (response.data.availableSlots && Array.isArray(response.data.availableSlots)) {
            // Transform the slots to the expected format
            availableTimeSlots.value = response.data.availableSlots.map(slot => {
                // Extract time from slot data
                let timeValue, timeLabel

                if (slot.start) {
                    // If slot has start property, extract time from it
                    const startTime = new Date(slot.start)
                    timeValue = format(startTime, 'HH:mm')
                    timeLabel = format(startTime, 'h:mm a')
                } else if (slot.time) {
                    // If slot has time property directly
                    timeValue = slot.time
                    timeLabel = format(parseISO(`${formData.value.date}T${slot.time}`), 'h:mm a')
                } else {
                    // Fallback - try to parse slot as time string
                    timeValue = slot
                    timeLabel = format(parseISO(`${formData.value.date}T${slot}`), 'h:mm a')
                }

                return {
                    value: timeValue,
                    label: timeLabel
                }
            })

            console.log('Processed time slots:', availableTimeSlots.value)
        } else {
            console.log('No available slots in response or invalid format')
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

const bookAppointment = async () => {
    try {
        booking.value = true
        error.value = null

        const appointmentData = {
            providerId: selectedProvider.value._id,
            dateTime: new Date(`${formData.value.date}T${formData.value.time}`).toISOString(),
            type: formData.value.type,
            shortDescription: formData.value.shortDescription || ''
        }

        console.log('Booking appointment with data:', appointmentData)

        const response = await axios.post('/appointments', appointmentData)
        const appointment = response.data.appointment

        console.log('Appointment created:', appointment)

        // Redirect to payment
        if (appointment.payment.required) {
            await paymentStore.createCheckoutSession(appointment.id)
        } else {
            // If no payment required, redirect to appointment details
            router.push(`/appointments/${appointment.id}`)
        }

    } catch (err) {
        console.error('Error booking appointment:', err)

        // Handle specific error types
        if (err.response?.data?.fallbackSuggestion) {
            error.value = `${err.response.data.message} ${err.response.data.fallbackSuggestion}`
        } else {
            error.value = err.response?.data?.message || 'Failed to book appointment. Please try again.'
        }

        // If time slot became unavailable, refresh time slots
        if (err.response?.data?.message?.includes('time slot')) {
            loadAvailableTimeSlots()
        }
    } finally {
        booking.value = false
    }
}

// Helper functions
const getProviderName = (provider) => {
    if (!provider) return 'Unknown Provider'
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'UZS',
        minimumFractionDigits: 0
    }).format(amount || 0)
}

const formatSelectedDateTime = () => {
    if (!formData.value.date || !formData.value.time) return ''

    const dateTime = new Date(`${formData.value.date}T${formData.value.time}`)
    return format(dateTime, 'EEEE, MMMM d, yyyy \'at\' h:mm a')
}

// Lifecycle
onMounted(() => {
    loadProviders()
})
</script>