<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Enhanced Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <!-- Platform Logo/Brand -->
                        <div class="flex items-center space-x-3">
                            <div
                                class="w-8 h-8 bg-gradient-to-r from-brand-1 to-brand-2 rounded-full flex items-center justify-center">
                                <VideoCameraIcon class="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-gray-900">
                                    Healthcare session
                                </h1>
                                <p class="text-sm text-gray-600">
                                    with {{ getParticipantName() }}
                                </p>
                            </div>
                        </div>

                        <!-- Connection status -->
                        <div class="flex items-center space-x-2">
                            <div class="flex items-center space-x-2">
                                <div :class="[
                                    'w-2 h-2 rounded-full transition-colors',
                                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                                ]"></div>
                                <span class="text-sm font-medium" :class="[
                                    isConnected ? 'text-green-700' : 'text-red-700'
                                ]">
                                    {{ getConnectionStatus() }}
                                </span>
                            </div>

                            <!-- Session Timer -->
                            <div v-if="isConnected" class="flex items-center space-x-2 text-sm text-gray-600">
                                <ClockIcon class="w-4 h-4" />
                                <span class="font-mono">{{ sessionDuration }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Session Controls -->
                    <div class="flex items-center space-x-3">
                        <!-- Session Info Button -->
                        <button @click="showSessionInfo = !showSessionInfo" class="btn-secondary px-3 py-2">
                            <InformationCircleIcon class="w-4 h-4" />
                        </button>

                        <!-- End session Button -->
                        <button class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
                            @click="showEndSessionConfirm">
                            <FolderIcon class="w-4 h-4 mr-2" />
                            End session
                        </button>
                    </div>
                </div>

                <!-- Session Info Panel -->
                <div v-if="showSessionInfo" class="mt-4 bg-gray-50 rounded-xl p-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span class="font-medium text-gray-700">Session ID:</span>
                            <span class="ml-2 text-gray-600 font-mono">{{ session?.id || 'Loading...' }}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-700">Started:</span>
                            <span class="ml-2 text-gray-600">{{ formatSessionStartTime() }}</span>
                        </div>
                        <div>
                            <span class="font-medium text-gray-700">Type:</span>
                            <span class="ml-2 text-gray-600">{{ session?.type || 'Video Call' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <!-- Video Conference Area -->
            <div class="card-element overflow-hidden">
                <!-- Loading State -->
                <div v-if="!isConnected" class="flex items-center justify-center h-[600px] bg-gray-100">
                    <div class="text-center">
                        <div
                            class="animate-spin rounded-full h-12 w-12 border-4 border-brand-1 border-t-transparent mx-auto mb-4">
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">Connecting to session...</h3>
                        <p class="text-gray-600">Please wait while we set up your secure video call</p>
                    </div>
                </div>

                <!-- Jitsi Meet Embedded Container -->
                <div id="jitsi-container" class="w-full h-[600px]"
                    :class="{ 'opacity-0': !isConnected, 'opacity-100': isConnected }"></div>
            </div>

            <!-- Platform-Integrated chat (Optional) -->
            <div v-if="showPlatformChat" class="mt-6 card-element p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Session notes</h3>
                    <button @click="showPlatformChat = false" class="text-gray-400 hover:text-gray-600">
                        <XMarkIcon class="w-5 h-5" />
                    </button>
                </div>
                <div class="space-y-3">
                    <div v-for="(note, index) in sessionNotes" :key="index" class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <p class="text-sm text-gray-800">{{ note.text }}</p>
                                <p class="text-xs text-gray-500 mt-1">{{ note.time }}</p>
                            </div>
                            <span class="text-xs bg-brand-1/10 text-brand-1 px-2 py-1 rounded-full">{{ note.author
                                }}</span>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <div class="flex space-x-2">
                        <input v-model="newNote" type="text" class="input flex-1" placeholder="Add a session note..."
                            @keydown.enter="addSessionNote" />
                        <button @click="addSessionNote" class="btn-primary px-4">
                            Add note
                        </button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Enhanced End session Confirmation Modal -->
        <div v-if="showEndConfirmation"
            class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="card-element max-w-md w-full mx-4 p-6">
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                        <ExclamationTriangleIcon class="w-5 h-5 text-red-600" />
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900">End healthcare session</h3>
                </div>
                <p class="text-gray-600 mb-6">
                    Are you sure you want to end this session?
                    {{
                        isProvider ?
                        "You\'ll be asked to provide a summary and recommendations for the client." : 
                        "The session recording and notes will be saved to your appointment history."
                    }}
                </p>
                <div class="flex justify-end space-x-3">
                    <button @click="showEndConfirmation = false" class="btn-secondary">
                        Continue session
                    </button>
                    <button @click="confirmEndSession" class="btn-primary bg-red-600 hover:bg-red-700">
                        <CheckIcon class="w-4 h-4 mr-2" />
                        End session
                    </button>
                </div>
            </div>
        </div>

        <!-- Enhanced Post-Session Form for Providers -->
        <div v-if="showPostSessionForm && isProvider"
            class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div class="card-element max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center">
                        <div class="w-10 h-10 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                            <DocumentTextIcon class="w-5 h-5 text-brand-1" />
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-900">Complete session Documentation</h3>
                            <p class="text-sm text-gray-600">Provide session summary and recommendations for the client
                            </p>
                        </div>
                    </div>
                </div>

                <div class="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    <form @submit.prevent="submitPostSessionForm" class="space-y-6">
                        <!-- Session summary -->
                        <div class="form-group">
                            <label for="sessionSummary" class="label">Session summary</label>
                            <textarea id="sessionSummary" v-model="postSessionData.sessionSummary" rows="4"
                                class="input"
                                placeholder="Provide a comprehensive summary of the session, including key discussion points, observations, and outcomes..."
                                required></textarea>
                            <p class="text-sm text-gray-500 mt-1">This summary will be included in the client's record.</p>
                        </div>

                        <!-- Recommendations -->
                        <div class="form-group">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h4 class="text-lg font-semibold text-gray-900">Recommendations</h4>
                                    <p class="text-sm text-gray-600">Add recommendations</p>
                                </div>
                                <button type="button" @click="addRecommendation"
                                    class="btn-secondary text-brand-1 hover:bg-brand-1/10">
                                    <PlusIcon class="w-4 h-4 mr-2" />
                                    Add recommendation
                                </button>
                            </div>

                            <div v-if="postSessionData.recommendations.length > 0" class="space-y-4">
                                <div v-for="(recommendation, index) in postSessionData.recommendations" :key="index"
                                    class="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div class="form-group">
                                            <label :for="`title-${index}`" class="label">Title</label>
                                            <input :id="`title-${index}`" v-model="recommendation.title" type="text"
                                                class="input" required />
                                        </div>
                                        <div class="form-group">
                                            <label :for="`description-${index}`" class="label">Details</label>
                                            <input :id="`description-${index}`" v-model="recommendation.description"
                                                type="text" class="input" required />
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div class="form-group">
                                            <label :for="`frequency-${index}`" class="label">Frequency</label>
                                            <input :id="`frequency-${index}`" v-model="recommendation.frequency"
                                                type="text" class="input" placeholder="e.g., Twice daily, As needed"
                                                required />
                                        </div>
                                        <div class="form-group">
                                            <label :for="`duration-${index}`" class="label">Duration</label>
                                            <input :id="`duration-${index}`" v-model="recommendation.duration"
                                                type="text" class="input" placeholder="e.g., 7 days, 2 weeks"
                                                required />
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label :for="`instructions-${index}`" class="label">Special Instructions</label>
                                        <textarea :id="`instructions-${index}`" v-model="recommendation.instructions"
                                            rows="2" class="input"
                                            placeholder="Additional instructions, warnings, or notes for the client..."></textarea>
                                    </div>
                                    <button type="button" @click="removeRecommendation(index)"
                                        class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 text-sm">
                                        <TrashIcon class="w-4 h-4 mr-1" />
                                        Remove
                                    </button>
                                </div>
                            </div>

                            <div v-else
                                class="bg-gray-50/50 p-8 rounded-xl text-center border-2 border-dashed border-gray-300">
                                <BeakerIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p class="text-gray-500">No recommendations added yet</p>
                                <p class="text-sm text-gray-400 mt-1">Click "Add recommendation" to include treatment
                                    recommendations</p>
                            </div>
                        </div>

                        <!-- Follow-up recommendation -->
                        <div class="form-group">
                            <div class="bg-blue-50/50 rounded-xl p-4 border border-blue-200">
                                <div class="flex items-start">
                                    <input id="followUpRecommended" v-model="postSessionData.followUp.recommended"
                                        type="checkbox"
                                        class="mt-1 h-4 w-4 text-brand-1 border-gray-300 rounded focus:ring-brand-1" />
                                    <div class="ml-3">
                                        <label for="followUpRecommended" class="font-medium text-gray-900">
                                            Recommend follow-up Appointment
                                        </label>
                                        <p class="text-sm text-gray-600 mt-1">
                                            Schedule a follow-up appointment to monitor progress or continue treatment
                                        </p>
                                    </div>
                                </div>

                                <div v-if="postSessionData.followUp.recommended" class="mt-4 ml-7 space-y-4">
                                    <div class="form-group">
                                        <label for="followUpDate" class="label">Recommended follow-up Date</label>
                                        <input id="followUpDate" v-model="postSessionData.followUp.date" type="date"
                                            class="input" :min="minFollowUpDate" required />
                                    </div>

                                    <div class="form-group">
                                        <label for="followUpNotes" class="label">Follow-up Notes</label>
                                        <textarea id="followUpNotes" v-model="postSessionData.followUp.notes" rows="2"
                                            class="input"
                                            placeholder="Reason for follow-up, specific items to address, or monitoring requirements..."></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Session chat Log -->
                        <div v-if="chatLog.length > 0" class="form-group">
                            <h4 class="text-lg font-semibold text-gray-900 mb-3">Session chat Log</h4>
                            <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-200 max-h-40 overflow-y-auto">
                                <div v-for="(message, index) in chatLog" :key="index" class="mb-2 last:mb-0">
                                    <div class="flex items-start space-x-2">
                                        <span class="font-medium text-sm text-gray-700">{{ message.sender }}:</span>
                                        <span class="text-sm text-gray-800">{{ message.text }}</span>
                                        <span class="text-xs text-gray-500 ml-auto">{{ message.time }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div
                            class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                            <button type="button" @click="skipPostSession" class="btn-secondary">
                                <ArrowRightIcon class="w-4 h-4 mr-2" />
                                Skip Documentation
                            </button>
                            <button type="submit" class="btn-primary" :disabled="submitting">
                                <span v-if="submitting" class="flex items-center">
                                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                        fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    Saving session Data...
                                </span>
                                <span v-else class="flex items-center">
                                    <CheckIcon class="w-4 h-4 mr-2" />
                                    Complete session
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Enhanced follow-up Created Notification -->
        <div v-if="showFollowUpNotification"
            class="fixed inset-0 bg-gray-500/75 backdrop-blur-sm flex items-center justify-center z-50">
            <div class="card-element max-w-md w-full mx-4 p-6 text-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon class="h-8 w-8 text-green-600" />
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Session completed successfully</h3>
                <p class="text-gray-600 mb-6">
                    Follow-up appointment has been created and is pending payment confirmation from the client.
                </p>
                <button @click="returnToAppointments" class="btn-primary w-full">
                    <CalendarIcon class="w-4 h-4 mr-2" />
                    Return to appointments
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { VideoCameraIcon, ClockIcon, InformationCircleIcon, FolderIcon, XMarkIcon, ExclamationTriangleIcon, DocumentTextIcon, PlusIcon, TrashIcon, ArrowRightIcon, CheckIcon, CalendarIcon, BeakerIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, addDays } from 'date-fns'
import axios from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Connection and session state
const isConnected = ref(false)
const session = ref(null)
const api = ref(null)
const chatLog = ref([])
const submitting = ref(false)
const sessionStartTime = ref(null)
const sessionDuration = ref('00:00')

// UI state
const showSessionInfo = ref(false)
const showPlatformChat = ref(false)
const sessionNotes = ref([])
const newNote = ref('')

// Modal states
const showEndConfirmation = ref(false)
const showPostSessionForm = ref(false)
const showFollowUpNotification = ref(false)

// Post-session form data
const postSessionData = reactive({
    sessionSummary: '',
    recommendations: [],
    followUp: {
        recommended: false,
        date: '',
        notes: ''
    }
})

const isProvider = computed(() => authStore.isProvider)

const minFollowUpDate = computed(() => {
    const tomorrow = addDays(new Date(), 1)
    return format(tomorrow, 'yyyy-MM-dd')
})

// Helper functions
function getParticipantName() {
    if (!session.value) return 'Loading...'

    if (isProvider.value) {
        return session.value.client?.name || `${session.value.client?.firstName} ${session.value.client?.lastName}` || 'client'
    } else {
        return session.value.provider?.name || `Dr. ${session.value.provider?.firstName} ${session.value.provider?.lastName}` || 'Healthcare Provider'
    }
}

function getConnectionStatus() {
    return isConnected.value ? 'Connected' : 'Connecting...'
}

function formatSessionStartTime() {
    return sessionStartTime.value ? format(sessionStartTime.value, 'h:mm a') : 'Just started'
}

function updateSessionDuration() {
    if (sessionStartTime.value && isConnected.value) {
        const now = new Date()
        const diff = now - sessionStartTime.value
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        sessionDuration.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
}

function addSessionNote() {
    if (newNote.value.trim()) {
        sessionNotes.value.push({
            text: newNote.value.trim(),
            time: format(new Date(), 'h:mm a'),
            author: isProvider.value ? 'Provider' : 'client'
        })
        newNote.value = ''
    }
}

function loadJitsiScript() {
    return new Promise((resolve, reject) => {
        if (document.getElementById('jitsi-api-script')) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.id = 'jitsi-api-script'
        script.src = 'https://meet.jit.si/external_api.js'
        script.async = true
        script.onload = resolve
        script.onerror = reject
        document.body.appendChild(script)
    })
}

async function initializeJitsi() {
    try {
        if (!session.value?.jitsi) {
            throw new Error('Jitsi configuration not available')
        }

        await loadJitsiScript()

        if (!window.JitsiMeetExternalAPI) {
            throw new Error('Jitsi Meet External API not loaded')
        }

        const { domain, roomName, token } = session.value.jitsi

        // Enhanced Jitsi configuration for better embedding
        const options = {
            roomName,
            jwt: token,
            width: '100%',
            height: '100%',
            parentNode: document.getElementById('jitsi-container'),
            configOverwrite: {
                prejoinPageEnabled: false,
                disableDeepLinking: true,
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                enableWelcomePage: false,
                enableClosePage: false,
                disable1On1Mode: false,
                disableProfile: true,
                disableThirdPartyRequests: true,
                defaultLanguage: 'en',
                disableShortcuts: false,
                disableInviteFunctions: true,
                doNotStoreRoom: true,
                disableRemoteMute: false,
                enableEmailInStats: false,
                enableDisplayNameInStats: false,
                enableNoAudioDetection: true,
                enableNoisyMicDetection: true,
                channelLastN: 2,
                startAudioOnly: false,
                startScreenSharing: false,
                p2p: {
                    enabled: true,
                    stunServers: [
                        { urls: 'stun:meet-jit-si-turnrelay.jitsi.net:443' }
                    ]
                }
            },
            interfaceConfigOverwrite: {
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                SHOW_BRAND_WATERMARK: false,
                BRAND_WATERMARK_LINK: '',
                SHOW_POWERED_BY: false,
                DEFAULT_BACKGROUND: '#f9fafb',
                OPTIMAL_BROWSERS: ['chrome', 'firefox', 'safari'],
                UNSUPPORTED_BROWSERS: [],
                DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                DISABLE_PRESENCE_STATUS: false,
                DISPLAY_WELCOME_PAGE_CONTENT: false,
                DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
                HIDE_INVITE_MORE_HEADER: true,
                INITIAL_TOOLBAR_TIMEOUT: 20000,
                TOOLBAR_TIMEOUT: 4000,
                TOOLBAR_ALWAYS_VISIBLE: false,
                DEFAULT_LOGO_URL: '',
                DEFAULT_WELCOME_PAGE_LOGO_URL: '',
                JITSI_WATERMARK_LINK: '',
                LANG_DETECTION: false,
                LIVE_STREAMING_HELP_LINK: '',
                MOBILE_APP_PROMO: false,
                NATIVE_APP_NAME: 'Healthcare Platform',
                PROVIDER_NAME: 'Healthcare Platform',
                RECENT_LIST_ENABLED: false,
                SETTINGS_SECTIONS: ['devices', 'language'],
                SHOW_CHROME_EXTENSION_BANNER: false,
                TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                    'settings', 'raisehand', 'videoquality', 'filmstrip', 'feedback',
                    'stats', 'shortcuts', 'tileview', 'select-background', 'help'
                ]
            },
            userInfo: {
                displayName: isProvider.value ?
                    `Dr. ${authStore.user.firstName} ${authStore.user.lastName}` :
                    `${authStore.user.firstName} ${authStore.user.lastName}`
            }
        }

        // Create Jitsi Meet external API instance
        api.value = new window.JitsiMeetExternalAPI(domain, options)

        // Set event listeners
        api.value.on('videoConferenceJoined', () => {
            isConnected.value = true
            sessionStartTime.value = new Date()

            // Start session duration timer
            const timer = setInterval(updateSessionDuration, 1000)

            // Store timer reference for cleanup
            api.value._durationTimer = timer
        })

        api.value.on('videoConferenceLeft', () => {
            // Clear duration timer
            if (api.value._durationTimer) {
                clearInterval(api.value._durationTimer)
            }

            if (isProvider.value && !showPostSessionForm.value) {
                showPostSessionForm.value = true
            } else if (!isProvider.value) {
                router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
            }
        })

        // Capture chat messages for session log
        api.value.on('incomingMessage', (message) => {
            chatLog.value.push({
                sender: message.from || 'Participant',
                text: message.message,
                time: format(new Date(), 'HH:mm')
            })
        })

        api.value.on('outgoingMessage', (message) => {
            chatLog.value.push({
                sender: 'You',
                text: message.message,
                time: format(new Date(), 'HH:mm')
            })
        })

        // Handle connection errors
        api.value.on('connectionFailed', () => {
            console.error('Jitsi connection failed')
            isConnected.value = false
        })

    } catch (error) {
        console.error('Error initializing Jitsi:', error)
        isConnected.value = false
    }
}

function showEndSessionConfirm() {
    showEndConfirmation.value = true
}

function confirmEndSession() {
    showEndConfirmation.value = false

    // Dispose Jitsi API 
    if (api.value) {
        // Clear timer
        if (api.value._durationTimer) {
            clearInterval(api.value._durationTimer)
        }

        api.value.dispose()
    }

    if (isProvider.value) {
        showPostSessionForm.value = true
    } else {
        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    }
}

function addRecommendation() {
    postSessionData.recommendations.push({
        title: '',
        description: '',
        frequency: '',
        duration: '',
        instructions: ''
    })
}

function removeRecommendation(index) {
    postSessionData.recommendations.splice(index, 1)
}

async function submitPostSessionForm() {
    try {
        submitting.value = true

        // 1. Update appointment status to completed and add session summary
        await axios.patch(`/appointments/${route.params.appointmentId}/status`, {
            status: 'completed',
            sessionSummary: postSessionData.sessionSummary,
            sessionNotes: sessionNotes.value,
            chatLog: chatLog.value
        })

        // 2. Add recommendations if any
        if (postSessionData.recommendations.length > 0) {
            await axios.patch(`/appointments/${route.params.appointmentId}/recommendations`, {
                recommendations: postSessionData.recommendations
            })
        }

        // 3. Schedule follow-up if recommended
        if (postSessionData.followUp.recommended) {
            await axios.post(`/appointments/${route.params.appointmentId}/follow-up`, {
                followUpDate: postSessionData.followUp.date,
                notes: postSessionData.followUp.notes
            })

            showPostSessionForm.value = false
            showFollowUpNotification.value = true
        } else {
            returnToAppointments()
        }
    } catch (error) {
        console.error('Error submitting post-session data:', error)
        alert('An error occurred while saving the session data. Please try again.')
    } finally {
        submitting.value = false
    }
}

function skipPostSession() {
    router.push({ name: 'provider-appointments' })
}

function returnToAppointments() {
    router.push(isProvider.value ?
        { name: 'provider-appointments' } :
        { name: 'client-appointments' }
    )
}

onMounted(async () => {
    try {
        const response = await axios.get(`/sessions/${route.params.appointmentId}/join`)
        session.value = response.data.session

        await initializeJitsi()
    } catch (error) {
        console.error('Error joining session:', error)
        router.push({ name: 'appointment-details', params: { id: route.params.appointmentId } })
    }
})

onUnmounted(() => {
    if (api.value) {
        if (api.value._durationTimer) {
            clearInterval(api.value._durationTimer)
        }
        api.value.dispose()
    }
})
</script>