<template>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">{{ $t('appointmentDetail.loading') }}</p>
        </div>

        <template v-else-if="appointment">
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <!-- Header -->
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h1 class="text-2xl font-bold text-gray-900">
                            {{ $t('appointmentDetail.title') }}
                        </h1>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" :class="{
                            'bg-green-100 text-green-800': appointment.status === 'completed',
                            'bg-yellow-100 text-yellow-800': appointment.status === 'scheduled',
                            'bg-purple-100 text-purple-800': appointment.status === 'pending-payment',
                            'bg-red-100 text-red-800': appointment.status === 'canceled' || appointment.status === 'no-show'
                        }">
                            {{ formatStatus(appointment.status) }}
                        </span>
                    </div>
                </div>

                <!-- Appointment Info -->
                <div class="p-6 space-y-6">
                    <!-- Participants -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.provider') }}
                            </h3>
                            <div class="flex items-center space-x-4">
                                <img :src="appointment.provider.profilePicture ? `/api${appointment.provider.profilePicture}` : '/images/user-placeholder.jpg'"
                                    :alt="appointment.provider.firstName" class="h-12 w-12 rounded-full object-cover" />
                                <div>
                                    <p class="font-medium text-gray-900">
                                        {{ appointment.provider.firstName }} {{ appointment.provider.lastName }}
                                    </p>
                                    <div class="mt-2 flex flex-wrap gap-2">
                                        <span v-for="spec in appointment.provider.specializations" :key="spec"
                                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {{ spec }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.client') }}</h3>
                            <div class="flex items-center space-x-4">
                                <img :src="appointment.client.profilePicture ? `/api${appointment.client.profilePicture}` : '/images/user-placeholder.jpg'"
                                    :alt="appointment.client.firstName" class="h-12 w-12 rounded-full object-cover" />
                                <div>
                                    <p class="font-medium text-gray-900">
                                        {{ appointment.client.firstName }} {{ appointment.client.lastName }}
                                    </p>
                                    <p class="text-sm text-gray-500">
                                        {{ $t('appointmentDetail.age') }}: {{
                                            calculateAge(appointment.client.dateOfBirth) }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Appointment details -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.dateTime') }}
                            </h3>
                            <p class="text-gray-900">{{ formatDateTime(appointment.dateTime) }}</p>
                        </div>

                        <div>
                            <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.sessionType') }}
                            </h3>
                            <p class="text-gray-900">
                                {{ appointment.type.charAt(0).toUpperCase() + appointment.type.slice(1) }}
                            </p>
                        </div>
                    </div>

                    <!-- Short description -->
                    <div>
                        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.shortDescription')
                        }}</h3>
                        <p class="text-gray-900">{{ appointment.shortDescription }}</p>
                    </div>

                    <!-- Session summary (only for completed appointments) -->
                    <div v-if="appointment.status === 'completed' && appointment.sessionSummary">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.sessionSummary') }}
                        </h3>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-900 whitespace-pre-line">{{ appointment.sessionSummary }}</p>
                        </div>
                    </div>

                    <!-- Recommendations (only for completed appointments) -->
                    <div
                        v-if="appointment.status === 'completed' && appointment.recommendations && appointment.recommendations.length > 0">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.recommendations') }}
                        </h3>
                        <div class="space-y-4">
                            <div v-for="(recommendation, index) in appointment.recommendations" :key="index"
                                class="bg-gray-50 p-4 rounded-lg">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p class="text-sm font-medium text-gray-500">{{ $t('appointmentDetail.recTitle')
                                        }}</p>
                                        <p class="text-gray-900">{{ recommendation.title }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-500">{{
                                            $t('appointmentDetail.recDescription') }}</p>
                                        <p class="text-gray-900">{{ recommendation.description }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-500">{{
                                            $t('appointmentDetail.recFrequency') }}</p>
                                        <p class="text-gray-900">{{ recommendation.frequency }}</p>
                                    </div>
                                    <div>
                                        <p class="text-sm font-medium text-gray-500">{{
                                            $t('appointmentDetail.recDuration') }}</p>
                                        <p class="text-gray-900">{{ recommendation.duration }}</p>
                                    </div>
                                </div>
                                <div v-if="recommendation.instructions" class="mt-2">
                                    <p class="text-sm font-medium text-gray-500">{{
                                        $t('appointmentDetail.recInstructions') }}</p>
                                    <p class="text-gray-900">{{ recommendation.instructions }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Follow-up Information (only for completed appointments with follow-up) -->
                    <div
                        v-if="appointment.status === 'completed' && appointment.followUp && appointment.followUp.recommended">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">{{
                            $t('appointmentDetail.followUpRecommendation') }}</h3>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm font-medium text-gray-500">{{
                                        $t('appointmentDetail.recommendedDate') }}</p>
                                    <p class="text-gray-900">{{ formatDate(appointment.followUp.date) }}</p>
                                </div>
                                <div v-if="appointment.followUp.notes">
                                    <p class="text-sm font-medium text-gray-500">{{ $t('appointmentDetail.notes') }}</p>
                                    <p class="text-gray-900">{{ appointment.followUp.notes }}</p>
                                </div>
                            </div>

                            <div v-if="followUpAppointment" class="mt-4 p-3 bg-indigo-50 rounded-lg">
                                <p class="text-sm font-medium text-indigo-800">
                                    {{ $t('appointmentDetail.followUpScheduledFor', {
                                        dateTime:
                                            formatDateTime(followUpAppointment.dateTime)
                                    }) }}
                                </p>
                                <div v-if="followUpAppointment.status === 'pending-payment'" class="mt-2">
                                    <button @click="proceedToPayment(followUpAppointment._id)"
                                        class="btn-primary text-sm">
                                        {{ $t('appointmentDetail.proceedToPayment') }}
                                    </button>
                                </div>
                            </div>
                            <div v-else-if="authStore.isClient && appointment.followUp.recommended" class="mt-4">
                                <button @click="findFollowUpAppointment" class="btn-primary text-sm">
                                    {{ $t('appointmentDetail.viewFollowUpDetails') }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ── Review: Client → Provider ──────────────────────────── -->
                    <div v-if="appointment.status === 'completed' && authStore.isClient && canReviewAppointment"
                        class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-3">{{ $t('reviews.reviewProvider') }}</h3>
                        <ReviewForm ref="clientReviewFormRef" direction="client_to_provider"
                            :appointment-id="appointment._id" :loading="submittingReview" @submit="submitReview" />
                    </div>

                    <!-- ── Review: Provider → Client (bidirectional) ──────────── -->
                    <div v-if="appointment.status === 'completed' && authStore.isProvider && isReviewsBidirectionalEnabled && canReviewClient"
                        class="bg-gray-50 border border-gray-200 rounded-xl p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-3">{{ $t('reviews.reviewClient') }}</h3>
                        <ReviewForm ref="providerReviewFormRef" direction="provider_to_client"
                            :appointment-id="appointment._id" :loading="submittingReview" @submit="submitReview" />
                    </div>

                    <!-- Chat Log (if available) -->
                    <div v-if="appointment.chatLog && appointment.chatLog.length > 0">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-medium text-gray-900">{{ $t('appointmentDetail.chatHistory') }}</h3>
                            <button @click="showChatLog = !showChatLog"
                                class="text-sm bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent  hover:text-indigo-900">
                                {{ showChatLog ? $t('appointmentDetail.hideChat') : $t('appointmentDetail.showChat') }}
                            </button>
                        </div>
                        <div v-if="showChatLog" class="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                            <div v-for="(message, index) in appointment.chatLog" :key="index" class="mb-2">
                                <div class="flex">
                                    <span class="font-semibold">{{ message.sender }}:</span>
                                    <span class="ml-2">{{ message.text }}</span>
                                </div>
                                <div class="text-xs text-gray-500">
                                    {{ formatChatTime(message.timestamp) }}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Payment Information for Pending-Payment appointments -->
                    <div v-if="appointment.status === 'pending-payment'">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.paymentInfo') }}
                        </h3>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-700">
                                {{ $t('appointmentDetail.paymentRequiredDesc') }}
                            </p>
                            <div class="mt-4">
                                <p class="text-sm font-medium text-gray-500">{{ $t('appointmentDetail.amount') }}</p>
                                <p class="text-gray-900">{{ formatCurrency(appointment.payment.amount) }} UZS</p>
                            </div>
                            <div class="mt-4">
                                <button @click="proceedToPayment(appointment._id)" class="btn-primary">
                                    {{ $t('appointmentDetail.proceedToPayment') }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Provider-client chat -->
                    <div class="mt-8" v-if="canStartChat">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('appointmentDetail.communication') }}
                        </h3>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <p class="text-gray-600 mb-4">
                                {{ getChatButtonText }}
                            </p>
                            <button @click="startChat" class="btn-primary flex items-center">
                                <ChatBubbleLeftRightIcon class="h-5 w-5 mr-2" />
                                {{ $t('appointmentDetail.startChat') }}
                            </button>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex justify-end space-x-4">
                        <button v-if="appointment.status === 'scheduled' && authStore.isClient"
                            class="btn-secondary text-red-600 hover:text-red-700" @click="cancelAppointment">
                            {{ $t('appointmentDetail.cancelAppointment') }}
                        </button>
                        <button v-if="appointment.status === 'scheduled' && isWithinJoinWindow" class="btn-primary"
                            @click="joinSession">
                            {{ authStore.isProvider ? $t('appointmentDetail.startSession') :
                                $t('appointmentDetail.joinSession') }}
                        </button>
                        <div v-if="showFollowUpModal"
                            class="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
                            <div
                                class="bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl max-w-md w-full mx-4 border border-gray-200">
                                <div class="p-6">
                                    <div class="flex items-center justify-between mb-6">
                                        <h3 class="text-xl font-semibold text-gray-900">{{
                                            $t('appointmentDetail.scheduleFollowUp') }}</h3>
                                        <button type="button" @click="showFollowUpModal = false"
                                            class="text-gray-400 hover:text-gray-600 transition-colors">
                                            <XMarkIcon class="h-6 w-6" />
                                        </button>
                                    </div>

                                    <form @submit.prevent="createFollowUp" class="form-container">
                                        <div class="form-group">
                                            <label for="followUpDate" class="label">{{
                                                $t('appointmentDetail.followUpDate') }}</label>
                                            <input id="followUpDate" v-model="followUpDate" type="date" class="input"
                                                :min="minFollowUpDate" required />
                                        </div>

                                        <div class="form-group">
                                            <label for="followUpNotes" class="label">{{ $t('appointmentDetail.notes')
                                            }}</label>
                                            <textarea id="followUpNotes" v-model="followUpNotes" rows="3" class="input"
                                                :placeholder="$t('appointmentDetail.followUpNotesPlaceholder')"></textarea>
                                        </div>

                                        <div class="flex justify-end space-x-3 pt-4">
                                            <button type="button" class="btn-secondary"
                                                @click="showFollowUpModal = false">
                                                {{ $t('common.cancel') }}
                                            </button>
                                            <button type="submit" class="btn-primary" :disabled="submitting">
                                                <span v-if="submitting" class="flex items-center">
                                                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4"
                                                        xmlns="http://www.w3.org/2000/svg" fill="none"
                                                        viewBox="0 0 24 24">
                                                        <circle class="opacity-25" cx="12" cy="12" r="10"
                                                            stroke="currentColor" stroke-width="4"></circle>
                                                        <path class="opacity-75" fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                                        </path>
                                                    </svg>
                                                    {{ $t('appointmentDetail.scheduling') }}
                                                </span>
                                                <span v-else>{{ $t('appointmentDetail.scheduleFollowUp') }}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="text-center py-8">
            <p class="text-gray-600">{{ $t('appointmentDetail.notFound') }}</p>
        </div>
    </div>
</template>

<script setup>
import { ChatBubbleLeftRightIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { format, parseISO, differenceInYears, isWithinInterval, subMinutes, addMinutes, addDays } from 'date-fns'
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePaymentStore } from '@/stores/payment'
import { useI18n } from 'vue-i18n'
import { useModules } from '@/composables/useModules'
import axios from '@/plugins/axios'
import { useGlobals } from '@/plugins/globals'
import ReviewForm from '@/components/reviews/ReviewForm.vue'

const { t } = useI18n()
const { toast, uploadsUrl, modal } = useGlobals()
const { isReviewsBidirectionalEnabled } = useModules()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const paymentStore = usePaymentStore()

const appointment = ref(null)
const followUpAppointment = ref(null)
const loading = ref(true)
const showChatLog = ref(false)
const showFollowUpModal = ref(false)
const followUpDate = ref('')
const followUpNotes = ref('')
const submitting = ref(false)

// ── Review state ─────────────────────────────────────────────────────────
const canReviewAppointment = ref(false)
const canReviewClient = ref(false)
const submittingReview = ref(false)
const clientReviewFormRef = ref(null)
const providerReviewFormRef = ref(null)

const minFollowUpDate = computed(() => {
    const tomorrow = addDays(new Date(), 1)
    return format(tomorrow, 'yyyy-MM-dd')
})

const formatDateTime = (dateTime) => {
    const date = new Date(dateTime)

    // Use UTC methods to avoid any timezone conversion
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    const year = date.getUTCFullYear()
    let hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()

    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // 0 should be 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes

    return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`
}

const formatDate = (date) => {
    if (!date) return t('appointmentDetail.notSpecified')
    const dateObj = new Date(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const month = months[dateObj.getUTCMonth()]
    const day = dateObj.getUTCDate()
    const year = dateObj.getUTCFullYear()

    return `${month} ${day}, ${year}`
}

const formatChatTime = (timestamp) => {
    const date = new Date(timestamp)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    const month = months[date.getUTCMonth()]
    const day = date.getUTCDate()
    let hours = date.getUTCHours()
    const minutes = date.getUTCMinutes()

    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12
    const minutesStr = minutes < 10 ? '0' + minutes : minutes

    return `${month} ${day}, ${hours}:${minutesStr} ${ampm}`
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount)
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

const calculateAge = (dateOfBirth) => {
    return differenceInYears(new Date(), parseISO(dateOfBirth))
}

const isWithinJoinWindow = computed(() => {
    if (!appointment.value?.dateTime) return false

    const appointmentTime = parseISO(appointment.value.dateTime)
    const now = new Date()

    return isWithinInterval(now, {
        start: subMinutes(appointmentTime, 5),
        end: addMinutes(appointmentTime, 30)
    })
})

const canStartChat = computed(() => {
    if (!appointment.value) return false

    const isParticipant = authStore.isProvider ?
        appointment.value.provider._id === authStore.user._id :
        appointment.value.client._id === authStore.user._id

    const validStatus = ['scheduled', 'completed']
    return isParticipant && validStatus.includes(appointment.value.status)
})

const getChatButtonText = computed(() => {
    if (!appointment.value) return ''

    const otherParty = authStore.isProvider ?
        `${appointment.value.client.firstName} ${appointment.value.client.lastName}` :
        `${appointment.value.provider.firstName} ${appointment.value.provider.lastName}`

    return t('appointmentDetail.chatWith', { name: otherParty })
})

async function fetchAppointment() {
    try {
        loading.value = true
        const response = await axios.get(`/appointments/${route.params.id}`)
        appointment.value = response.data.appointment

        // If this appointment has a follow-up recommendation, try to find the follow-up appointment
        if (appointment.value.status === 'completed' &&
            appointment.value.followUp &&
            appointment.value.followUp.recommended) {
            findFollowUpAppointment()
        }

        // Check review eligibility after appointment is loaded
        if (appointment.value.status === 'completed') {
            checkCanReview()
        }
    } catch (error) {
        console.error('Error fetching appointment:', error)
    } finally {
        loading.value = false
    }
}

/**
 * Check if the current user can review for this appointment.
 * The backend can-review endpoint returns { canReview, reason } and
 * auto-detects the direction based on the user's role.
 */
async function checkCanReview() {
    try {
        const res = await axios.get('/reviews/can-review', {
            params: { appointmentId: appointment.value._id }
        })

        if (authStore.isClient) {
            canReviewAppointment.value = res.data.canReview
        } else if (authStore.isProvider) {
            canReviewClient.value = res.data.canReview
        }
    } catch (error) {
        console.error('Error checking review eligibility:', error)
    }
}

/**
 * Submit a review (works for both client→provider and provider→client).
 * The payload shape is determined by the ReviewForm component.
 */
async function submitReview(payload) {
    try {
        submittingReview.value = true
        await axios.post('/reviews', payload)
        toast.success(t('reviews.reviewSubmitted'))

        // Reset form and hide it
        if (authStore.isClient) {
            clientReviewFormRef.value?.resetForm()
            canReviewAppointment.value = false
        } else {
            providerReviewFormRef.value?.resetForm()
            canReviewClient.value = false
        }
    } catch (error) {
        toast.error(error.response?.data?.message || t('reviews.submitError'))
    } finally {
        submittingReview.value = false
    }
}

async function findFollowUpAppointment() {
    try {
        // Get client's pending-payment appointments
        const response = await axios.get(`/appointments/client/${authStore.user._id}/pending-followups`)

        // Find follow-up for this appointment
        const followUps = response.data.appointments || []
        const followUp = followUps.find(app =>
            app.shortDescription.includes(`Follow-up to appointment on`) &&
            app.provider._id === appointment.value.provider._id)

        if (followUp) {
            followUpAppointment.value = followUp
        }
    } catch (error) {
        console.error('Error finding follow-up appointment:', error)
    }
}

async function cancelAppointment() {
    if (!(await modal.confirm(t('appointmentDetail.confirmCancel')))) return

    try {
        await axios.patch(`/appointments/${appointment.value._id}/status`, {
            status: 'canceled'
        })
        await fetchAppointment()
    } catch (error) {
        console.error('Error canceling appointment:', error)
    }
}

async function joinSession() {
    try {
        const response = await axios.get(`/sessions/${appointment.value._id}/join`)
        if (response.data.session) {
            router.push({
                name: 'session-room',
                params: { appointmentId: appointment.value._id }
            })
        }
    } catch (error) {
        console.error('Error joining session:', error)
        // If session is not ready yet, show the time remaining
        if (error.response && error.response.data && error.response.data.startsInMinutes) {
            toast.error(t('appointmentDetail.sessionAvailableIn', { minutes: error.response.data.startsInMinutes }))
        } else {
            toast.error(t('appointmentDetail.unableToJoin'))
        }
    }
}

async function proceedToPayment(appointmentId) {
    try {
        await paymentStore.createCheckoutSession(appointmentId)
        // Redirect handled by payment store
    } catch (error) {
        console.error('Error creating payment session:', error)
        toast.error(t('appointmentDetail.paymentError'))
    }
}

async function startChat() {
    try {
        const participantId = authStore.isProvider ?
            appointment.value.client._id :
            appointment.value.provider._id

        // Create or get existing conversation
        const response = await axios.post('/chat/conversations', {
            participantId,
            appointmentId: appointment.value._id
        })

        // Navigate to chat
        router.push({
            name: 'chat-conversation',
            params: { id: response.data.conversation._id }
        })
    } catch (error) {
        console.error('Error starting chat:', error)
    }
}

async function createFollowUp() {
    if (!followUpDate.value) return

    try {
        submitting.value = true
        await axios.post(`/appointments/${route.params.id}/follow-up`, {
            followUpDate: followUpDate.value,
            notes: followUpNotes.value
        })

        // Close modal and reset form
        showFollowUpModal.value = false
        followUpDate.value = ''
        followUpNotes.value = ''

        // Refresh appointment data
        await fetchAppointment()
    } catch (error) {
        console.error('Error creating follow-up:', error)
        toast.error(t('appointmentDetail.followUpError'))
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    fetchAppointment()
})
</script>