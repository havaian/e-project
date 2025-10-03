<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <nav class="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                <router-link to="/appointments/client" class="hover:text-gray-700">
                                    Appointments
                                </router-link>
                                <ChevronRightIcon class="w-4 h-4" />
                                <span class="text-gray-900">Edit Appointment</span>
                            </nav>
                            <h1 class="text-2xl font-bold text-gray-900">Edit Appointment</h1>
                            <p class="mt-1 text-sm text-gray-600">
                                Update your appointment details
                            </p>
                        </div>

                        <router-link to="/appointments/client"
                            class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            <XMarkIcon class="w-4 h-4 mr-2 inline" />
                            Cancel
                        </router-link>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Loading State -->
            <div v-if="loading" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div class="animate-pulse space-y-6">
                    <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div class="h-10 bg-gray-200 rounded"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div class="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <ExclamationCircleIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">Error Loading Appointment</h3>
                <p class="text-gray-600 mb-4">{{ error }}</p>
                <router-link to="/appointments/client" class="btn-primary">
                    Back to Appointments
                </router-link>
            </div>

            <!-- Edit Form -->
            <form v-else @submit.prevent="updateAppointment" class="space-y-6">
                <!-- Appointment Details Card -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 class="text-lg font-semibold text-gray-900 mb-6">Appointment Details</h2>

                    <!-- Current Provider Info (Read-only) -->
                    <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                        <div class="flex items-center space-x-3">
                            <img :src="appointment.provider?.profilePicture || '/images/default-avatar.png'"
                                :alt="getProviderName(appointment.provider)"
                                class="w-12 h-12 rounded-full object-cover">
                            <div>
                                <p class="font-medium text-gray-900">{{ getProviderName(appointment.provider) }}</p>
                                <p class="text-sm text-gray-600">{{ appointment.provider?.specializations?.[0] ||
                                    'Consultant' }}</p>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">
                            To change providers, please cancel this appointment and book a new one.
                        </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Date -->
                        <div>
                            <label for="date" class="block text-sm font-medium text-gray-700 mb-2">
                                Date <span class="text-red-500">*</span>
                            </label>
                            <input id="date" v-model="formData.date" type="date" :min="minDate" :max="maxDate" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1" />
                        </div>

                        <!-- Time -->
                        <div>
                            <label for="time" class="block text-sm font-medium text-gray-700 mb-2">
                                Time <span class="text-red-500">*</span>
                            </label>
                            <select id="time" v-model="formData.time" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1">
                                <option value="">Select time</option>
                                <option v-for="slot in availableTimeSlots" :key="slot.value" :value="slot.value">
                                    {{ slot.label }}
                                </option>
                            </select>
                            <p v-if="availableTimeSlots.length === 0" class="text-xs text-red-600 mt-1">
                                No available time slots for selected date
                            </p>
                        </div>
                    </div>

                    <!-- Session Type -->
                    <div class="mt-6">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Session Type <span class="text-red-500">*</span>
                        </label>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label v-for="type in sessionTypes" :key="type.value"
                                class="relative flex items-center space-x-3 border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-brand-1 transition-colors"
                                :class="{ 'border-brand-1 bg-brand-1/5': formData.type === type.value }">
                                <input v-model="formData.type" type="radio" :value="type.value" class="sr-only" />
                                <component :is="type.icon" class="w-6 h-6 text-gray-600" />
                                <div>
                                    <p class="font-medium text-gray-900">{{ type.label }}</p>
                                    <p class="text-sm text-gray-600">{{ type.description }}</p>
                                </div>
                                <CheckCircleIcon v-if="formData.type === type.value"
                                    class="absolute top-2 right-2 w-5 h-5 text-brand-1" />
                            </label>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="mt-6">
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                            Session Description
                        </label>
                        <textarea id="description" v-model="formData.shortDescription" rows="4"
                            placeholder="Briefly describe what you'd like to discuss in this session..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1"></textarea>
                        <p class="text-xs text-gray-500 mt-1">
                            This helps your provider prepare for the session.
                        </p>
                    </div>
                </div>

                <!-- Current Appointment Info -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h3 class="text-lg font-medium text-blue-900 mb-4">Current Appointment</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-blue-700 font-medium">Current Date & Time:</span>
                            <p class="text-blue-900">{{ formatDateTime(appointment.dateTime) }}</p>
                        </div>
                        <div>
                            <span class="text-blue-700 font-medium">Current Type:</span>
                            <p class="text-blue-900 capitalize">{{ appointment.type || 'Video Session' }}</p>
                        </div>
                        <div class="md:col-span-2">
                            <span class="text-blue-700 font-medium">Current Description:</span>
                            <p class="text-blue-900">{{ appointment.shortDescription || 'No description provided' }}</p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between pt-6 border-t border-gray-200">
                    <div class="flex items-center space-x-4">
                        <router-link to="/appointments/client"
                            class="px-6 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel Changes
                        </router-link>

                        <button type="button" @click="confirmDelete"
                            class="px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                            <TrashIcon class="w-4 h-4 mr-2 inline" />
                            Delete Appointment
                        </button>
                    </div>

                    <div class="flex items-center space-x-3">
                        <button type="button" @click="previewChanges"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                            Preview Changes
                        </button>

                        <button type="submit" :disabled="saving || !isFormValid" class="btn-primary"
                            :class="{ 'opacity-50 cursor-not-allowed': saving || !isFormValid }">
                            <span v-if="saving">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none"
                                    viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Updating...
                            </span>
                            <span v-else>Update Appointment</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Preview Modal -->
        <div v-if="showPreview" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-900">Preview Changes</h3>
                        <button @click="showPreview = false" class="text-gray-400 hover:text-gray-600">
                            <XMarkIcon class="w-6 h-6" />
                        </button>
                    </div>

                    <div class="space-y-3 text-sm">
                        <div v-if="hasChanges.date">
                            <span class="font-medium text-gray-700">Date:</span>
                            <p class="text-red-600">{{ formatDate(appointment.dateTime) }}</p>
                            <p class="text-green-600">{{ formatDate(getNewDateTime()) }}</p>
                        </div>

                        <div v-if="hasChanges.time">
                            <span class="font-medium text-gray-700">Time:</span>
                            <p class="text-red-600">{{ formatTime(appointment.dateTime) }}</p>
                            <p class="text-green-600">{{ formData.time }}</p>
                        </div>

                        <div v-if="hasChanges.type">
                            <span class="font-medium text-gray-700">Type:</span>
                            <p class="text-red-600 capitalize">{{ appointment.type || 'video' }}</p>
                            <p class="text-green-600 capitalize">{{ formData.type }}</p>
                        </div>

                        <div v-if="hasChanges.description">
                            <span class="font-medium text-gray-700">Description:</span>
                            <p class="text-red-600">{{ appointment.shortDescription || 'None' }}</p>
                            <p class="text-green-600">{{ formData.shortDescription || 'None' }}</p>
                        </div>

                        <div v-if="!Object.values(hasChanges).some(Boolean)" class="text-gray-600">
                            No changes made.
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 mt-6">
                        <button @click="showPreview = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteConfirmation"
            class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-red-900">Delete Appointment</h3>
                        <button @click="showDeleteConfirmation = false" class="text-gray-400 hover:text-gray-600">
                            <XMarkIcon class="w-6 h-6" />
                        </button>
                    </div>

                    <p class="text-gray-600 mb-6">
                        Are you sure you want to delete this appointment? This action cannot be undone.
                    </p>

                    <div class="flex justify-end space-x-3">
                        <button @click="showDeleteConfirmation = false"
                            class="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                        <button @click="deleteAppointment" :disabled="deleting"
                            class="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
                            {{ deleting ? 'Deleting...' : 'Delete' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ChevronRightIcon,
    XMarkIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    TrashIcon,
    VideoCameraIcon,
    PhoneIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, addDays, isSameDay } from 'date-fns'
import axios from '@/plugins/axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')
const showPreview = ref(false)
const showDeleteConfirmation = ref(false)
const appointment = ref({})
const availableTimeSlots = ref([])

// Form data
const formData = reactive({
    date: '',
    time: '',
    type: 'video',
    shortDescription: ''
})

// Session types
const sessionTypes = [
    {
        value: 'video',
        label: 'Video Call',
        description: 'Face-to-face session',
        icon: VideoCameraIcon
    },
    {
        value: 'voice',
        label: 'Voice Call',
        description: 'Audio-only session',
        icon: PhoneIcon
    },
    {
        value: 'chat',
        label: 'Text Chat',
        description: 'Written conversation',
        icon: ChatBubbleLeftRightIcon
    }
]

// Computed
const minDate = computed(() => {
    return format(new Date(), 'yyyy-MM-dd')
})

const maxDate = computed(() => {
    return format(addDays(new Date(), 30), 'yyyy-MM-dd')
})

const isFormValid = computed(() => {
    return formData.date && formData.time && formData.type
})

const hasChanges = computed(() => {
    if (!appointment.value.dateTime) return {}

    const currentDate = format(parseISO(appointment.value.dateTime), 'yyyy-MM-dd')
    const currentTime = format(parseISO(appointment.value.dateTime), 'HH:mm')

    return {
        date: formData.date !== currentDate,
        time: formData.time !== currentTime,
        type: formData.type !== (appointment.value.type || 'video'),
        description: formData.shortDescription !== (appointment.value.shortDescription || '')
    }
})

// Methods
const loadAppointment = async () => {
    try {
        loading.value = true
        const response = await axios.get(`/appointments/${route.params.id}`)
        appointment.value = response.data.appointment

        // Check if user can edit this appointment
        if (appointment.value.client._id !== authStore.user._id) {
            throw new Error('You are not authorized to edit this appointment')
        }

        // Check if appointment is in the future
        if (new Date(appointment.value.dateTime) <= new Date()) {
            throw new Error('Cannot edit past appointments')
        }

        // Populate form with current data
        const appointmentDate = parseISO(appointment.value.dateTime)
        formData.date = format(appointmentDate, 'yyyy-MM-dd')
        formData.time = format(appointmentDate, 'HH:mm')
        formData.type = appointment.value.type || 'video'
        formData.shortDescription = appointment.value.shortDescription || ''

        // Load initial time slots
        await loadAvailableTimeSlots()
    } catch (err) {
        console.error('Error loading appointment:', err)
        error.value = err.response?.data?.message || err.message || 'Failed to load appointment'
    } finally {
        loading.value = false
    }
}

const loadAvailableTimeSlots = async () => {
    if (!formData.date || !appointment.value.provider) return

    try {
        const response = await axios.get(`/appointments/availability/${appointment.value.provider._id}`, {
            params: { date: formData.date }
        })

        const slots = response.data.availableSlots || []
        availableTimeSlots.value = slots.map(slot => ({
            value: slot.time,
            label: format(parseISO(`${formData.date}T${slot.time}`), 'h:mm a')
        }))

        // Add current appointment time if not in available slots
        const currentTime = format(parseISO(appointment.value.dateTime), 'HH:mm')
        if (!availableTimeSlots.value.some(slot => slot.value === currentTime)) {
            availableTimeSlots.value.push({
                value: currentTime,
                label: format(parseISO(appointment.value.dateTime), 'h:mm a') + ' (current)'
            })
            availableTimeSlots.value.sort((a, b) => a.value.localeCompare(b.value))
        }
    } catch (err) {
        console.error('Error loading time slots:', err)
        availableTimeSlots.value = []
    }
}

const updateAppointment = async () => {
    try {
        saving.value = true

        const newDateTime = new Date(`${formData.date}T${formData.time}`)
        const updateData = {
            dateTime: newDateTime.toISOString(),
            type: formData.type,
            shortDescription: formData.shortDescription
        }

        await axios.patch(`/appointments/${route.params.id}`, updateData)

        // TODO: Show success notification
        router.push('/appointments/client')
    } catch (err) {
        console.error('Error updating appointment:', err)
        // TODO: Show error notification
    } finally {
        saving.value = false
    }
}

const confirmDelete = () => {
    showDeleteConfirmation.value = true
}

const deleteAppointment = async () => {
    try {
        deleting.value = true
        await axios.patch(`/appointments/${route.params.id}`, { status: 'canceled' })

        // TODO: Show success notification
        router.push('/appointments/client')
    } catch (err) {
        console.error('Error deleting appointment:', err)
        // TODO: Show error notification
    } finally {
        deleting.value = false
        showDeleteConfirmation.value = false
    }
}

const previewChanges = () => {
    showPreview.value = true
}

// Utility functions
const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const formatDate = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy')
}

const formatTime = (dateTime) => {
    return format(parseISO(dateTime), 'h:mm a')
}

const getProviderName = (provider) => {
    if (!provider) return 'Unknown Provider'
    return `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || 'Provider'
}

const getNewDateTime = () => {
    return new Date(`${formData.date}T${formData.time}`).toISOString()
}

// Watchers
watch(() => formData.date, loadAvailableTimeSlots)

// Lifecycle
onMounted(loadAppointment)
</script>

<style scoped>
.btn-primary {
    @apply bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-all duration-200 shadow-lg px-6 py-2;
}

.brand-1 {
    color: #0ea5e9;
}
</style>