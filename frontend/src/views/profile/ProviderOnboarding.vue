<!-- frontend/src/views/profile/ProviderOnboarding.vue -->
<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="/images/logo.svg" alt="Logo" width="40" height="40" class="w-10 h-10" />
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">{{ $t('providerOnboarding.title') }}</h1>
                            <p class="text-sm text-gray-500">{{ $t('providerOnboarding.subtitle') }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">{{ $t('providerOnboarding.stepOf', {
                            current:
                            currentStep, total: totalSteps }) }}</div>
                        <div class="text-xs text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}% {{
                            $t('providerOnboarding.complete') }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Bar -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${(currentStep / totalSteps) * 100}%` }"></div>
            </div>
        </div>

        <!-- Auto-save status Indicator -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div v-if="autoSaveStatus" class="flex items-center justify-center mb-4">
                <div class="flex items-center space-x-2 px-3 py-1 rounded-full text-xs transition-all duration-300"
                    :class="autoSaveStatusClass">
                    <svg v-if="autoSaveStatus === 'saving'" class="w-3 h-3 animate-spin" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <CheckIcon v-if="autoSaveStatus === 'saved'" class="w-3 h-3" />
                    <XMarkIcon v-if="autoSaveStatus === 'error'" class="w-3 h-3" />
                    <span>{{ autoSaveStatusText }}</span>
                </div>
            </div>
        </div>

        <!-- Step Indicators -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex justify-between items-center relative">
                <!-- Connecting Lines -->
                <div class="absolute top-5 left-0 right-0 flex justify-between px-5">
                    <div v-for="index in steps.length - 1" :key="`line-${index}`"
                        class="flex-1 h-0.5 mx-2 transition-colors duration-500" :class="index < currentStep
                            ? 'bg-gradient-to-r from-sky-500 to-emerald-500'
                            : 'bg-gray-200'">
                    </div>
                </div>

                <!-- Step Circles -->
                <div v-for="(step, index) in steps" :key="index" class="flex flex-col items-center relative z-10">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 bg-white border-2"
                        :class="[
                            index + 1 <= currentStep
                                ? 'bg-white text-sky-500 border-sky-500'
                                : 'bg-white text-gray-500 border-gray-300',
                            index + 1 < currentStep
                                ? 'cursor-pointer hover:border-sky-700 hover:text-sky-700'
                                : 'cursor-default'
                        ]" @click="index + 1 < currentStep ? goToStep(index + 1) : null">
                        <CheckIcon v-if="index + 1 < currentStep" class="w-5 h-5" />
                        <span v-else>{{ index + 1 }}</span>
                    </div>
                    <div class="mt-2 text-xs text-center text-gray-600 max-w-20">
                        {{ step.name }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <!-- Step Content -->
                <div class="p-8">
                    <StepEducation v-if="currentStep === 1" v-model="formData" @next="nextStep"
                        @validate="validateStep" />

                    <StepAvailability v-if="currentStep === 2" v-model="formData" @next="nextStep" @prev="prevStep"
                        @validate="validateStep" />

                    <StepSessionSettings v-if="currentStep === 3" v-model="formData" @next="nextStep" @prev="prevStep"
                        @validate="validateStep" />

                    <StepProfile v-if="currentStep === 4" v-model="formData" @next="nextStep" @prev="prevStep"
                        @validate="validateStep" />

                    <StepReview v-if="currentStep === 5" v-model="formData" @next="nextStep" @prev="prevStep"
                        @validate="validateStep" @editStep="goToStep" />

                    <StepComplete v-if="currentStep === 6" @finish="completeOnboarding" />
                </div>

                <!-- Navigation -->
                <div v-if="currentStep < 6" class="bg-gray-50 px-8 py-4 flex justify-between items-center">
                    <button v-if="currentStep > 1" @click="prevStep" class="btn-element-secondary"
                        :class="{ 'cursor-not-allowed': loading || autoSaving }" :disabled="loading || autoSaving">
                        <ChevronLeftIcon class="w-4 h-4 mr-2" />
                        {{ $t('providerOnboarding.previous') }}
                    </button>
                    <div v-else></div>

                    <div class="flex items-center space-x-3">
                        <button v-if="currentStep < 5" @click="saveCurrentStep"
                            class="mr-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                            :class="{ 'cursor-not-allowed opacity-50': loading || autoSaving }"
                            :disabled="loading || autoSaving">
                            <span v-if="autoSaving" class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-2 h-3 w-3" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                {{ $t('providerOnboarding.savingDraft') }}
                            </span>
                            <span v-else>{{ $t('providerOnboarding.saveDraft') }}</span>
                        </button>

                        <button @click="nextStep" class="btn-element-primary transition-all duration-200" :class="{
                            'cursor-not-allowed opacity-50': !isStepValid || loading || autoSaving,
                            'hover:shadow-lg': isStepValid && !loading && !autoSaving
                        }" :disabled="!isStepValid || loading || autoSaving">
                            <span v-if="loading" class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                {{ $t('providerOnboarding.savingDraft') }}
                            </span>
                            <span class="flex items-center" v-else>
                                {{ currentStep === 5 ? $t('providerOnboarding.completeSetup') :
                                    $t('providerOnboarding.next') }}
                                <ChevronRightIcon v-if="currentStep < 5" class="w-4 h-4 ml-2" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Help section -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div class="flex items-start space-x-3">
                    <InformationCircleIcon class="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                        <h3 class="text-sm font-medium text-blue-900">{{ $t('providerOnboarding.needHelp') }}</h3>
                        <p class="text-sm text-blue-700 mt-1">
                            {{ $t('providerOnboarding.helpText') }}
                            <a :href="`mailto:${supportEmail}`" class="underline">{{ supportEmail }}</a>
                            {{ $t('providerOnboarding.orCall') }}
                            <a :href="`tel:${supportPhone}`" class="underline">{{ supportPhone }}</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CheckIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

// Import step components
import StepEducation from '@/components/onboarding/StepEducation.vue'
import StepAvailability from '@/components/onboarding/StepAvailability.vue'
import StepSessionSettings from '@/components/onboarding/StepSessionSettings.vue'
import StepProfile from '@/components/onboarding/StepProfile.vue'
import StepReview from '@/components/onboarding/StepReview.vue'
import StepComplete from '@/components/onboarding/StepComplete.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// State
const currentStep = ref(1)
const totalSteps = 6
const loading = ref(false)
const isStepValid = ref(false)

// Auto-save state
const autoSaving = ref(false)
const autoSaveStatus = ref('')
const lastSavedStep = ref(0)

const supportPhone = import.meta.env.VITE_SUPPORT_PHONE
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL

// Steps configuration
const steps = computed(() => [
    { name: t('providerOnboarding.stepEducation'), component: 'StepEducation' },
    { name: t('providerOnboarding.stepAvailability'), component: 'StepAvailability' },
    { name: t('providerOnboarding.stepSessions'), component: 'StepSessionSettings' },
    { name: t('providerOnboarding.stepProfile'), component: 'StepProfile' },
    { name: t('providerOnboarding.stepReview'), component: 'StepReview' },
    { name: t('providerOnboarding.stepComplete'), component: 'StepComplete' }
])

// Form data
const formData = reactive({
    education: [],
    certifications: [],
    languages: [],
    availability: [
        { dayOfWeek: 1, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 2, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 3, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 4, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 5, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 6, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 7, isAvailable: false, timeSlots: [] }
    ],
    sessionDuration: 60,
    sessionFee: 0,
    specializations: [],
    bio: '',
    experience: 0,
    licenseNumber: ''
})

console.log('[ProviderOnboarding] formData initialized with availability:', formData.availability.length, 'days')

// Auto-save computed properties
const autoSaveStatusClass = computed(() => {
    switch (autoSaveStatus.value) {
        case 'saving': return 'bg-blue-100 text-blue-800'
        case 'saved': return 'bg-green-100 text-green-800'
        case 'error': return 'bg-red-100 text-red-800'
        default: return 'bg-gray-100 text-gray-800'
    }
})

const autoSaveStatusText = computed(() => {
    switch (autoSaveStatus.value) {
        case 'saving': return t('providerOnboarding.autoSaving')
        case 'saved': return t('providerOnboarding.changesSaved')
        case 'error': return t('providerOnboarding.saveFailed')
        default: return ''
    }
})

const autoSaveCurrentStep = async (stepNumber = currentStep.value, showStatus = true) => {
    try {
        if (autoSaving.value) return
        autoSaving.value = true
        if (showStatus) autoSaveStatus.value = 'saving'

        let updateData = {}
        switch (stepNumber) {
            case 1:
                updateData = {
                    education: formData.education.filter(edu => edu.degree && edu.institution && edu.year),
                    certifications: formData.certifications.filter(cert => cert.name && cert.issuer && cert.year),
                    languages: formData.languages.filter(lang => lang !== '')
                }
                break
            case 2:
                updateData = { availability: formData.availability }
                break
            case 3:
                updateData = { sessionDuration: formData.sessionDuration, sessionFee: formData.sessionFee }
                break
            case 4:
                updateData = {
                    specializations: formData.specializations.filter(spec => spec !== ''),
                    bio: formData.bio,
                    experience: formData.experience,
                    licenseNumber: formData.licenseNumber
                }
                break
            default:
                updateData = {
                    education: formData.education.filter(edu => edu.degree && edu.institution && edu.year),
                    certifications: formData.certifications.filter(cert => cert.name && cert.issuer && cert.year),
                    languages: formData.languages.filter(lang => lang !== ''),
                    availability: formData.availability,
                    sessionDuration: formData.sessionDuration,
                    sessionFee: formData.sessionFee,
                    specializations: formData.specializations.filter(spec => spec !== ''),
                    bio: formData.bio,
                    experience: formData.experience,
                    licenseNumber: formData.licenseNumber
                }
        }

        if (Object.keys(updateData).length > 0) {
            await axios.patch('/users/me', updateData)
            lastSavedStep.value = stepNumber
        }

        if (showStatus) {
            autoSaveStatus.value = 'saved'
            setTimeout(() => { autoSaveStatus.value = '' }, 2000)
        }
    } catch (error) {
        console.error('Error auto-saving step data:', error)
        if (showStatus) {
            autoSaveStatus.value = 'error'
            setTimeout(() => { autoSaveStatus.value = '' }, 3000)
        }
    } finally {
        autoSaving.value = false
    }
}

const nextStep = async () => {
    if (currentStep.value < totalSteps) {
        await autoSaveCurrentStep(currentStep.value, true)
        currentStep.value++
        await updateOnboardingStep()
    }
}

const prevStep = async () => {
    if (currentStep.value > 1) {
        await autoSaveCurrentStep(currentStep.value, true)
        currentStep.value--
    }
}

const goToStep = async (stepNumber) => {
    if (stepNumber >= 1 && stepNumber <= 5 && stepNumber !== currentStep.value && stepNumber < currentStep.value) {
        await autoSaveCurrentStep(currentStep.value, true)
        currentStep.value = stepNumber
        isStepValid.value = false
    }
}

const saveCurrentStep = async () => {
    await autoSaveCurrentStep(currentStep.value, true)
}

const validateStep = (isValid) => {
    isStepValid.value = isValid
}

const saveStepData = async () => {
    loading.value = true
    try {
        await autoSaveCurrentStep(currentStep.value, false)
    } finally {
        loading.value = false
    }
}

const updateOnboardingStep = async () => {
    try {
        await authStore.updateOnboardingStep(currentStep.value)
    } catch (error) {
        console.error('Error updating onboarding step:', error)
    }
}

const completeOnboarding = async () => {
    try {
        loading.value = true
        await autoSaveCurrentStep(5, true)
        await authStore.updateOnboardingStep(6)
        router.push('/profile/me?refreshProfile=true')
    } catch (error) {
        console.error('Error completing onboarding:', error)
    } finally {
        loading.value = false
    }
}

let autoSaveTimeout = null
const debouncedAutoSave = () => {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
    autoSaveTimeout = setTimeout(() => {
        if (currentStep.value <= 4 && !autoSaving.value) {
            autoSaveCurrentStep(currentStep.value, false)
        }
    }, 2000)
}

watch(formData, debouncedAutoSave, { deep: true })

const handleBeforeUnload = (event) => {
    if (autoSaving.value) {
        event.preventDefault()
        event.returnValue = 'Your changes are being saved. Please wait...'
        return event.returnValue
    }
}

const normalizeAvailability = (serverAvailability) => {
    console.log('[ProviderOnboarding] Normalizing availability:', serverAvailability)

    const defaultAvailability = [
        { dayOfWeek: 1, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 2, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 3, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 4, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 5, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 6, isAvailable: false, timeSlots: [] },
        { dayOfWeek: 7, isAvailable: false, timeSlots: [] }
    ]

    if (!Array.isArray(serverAvailability) || serverAvailability.length === 0) {
        console.log('[ProviderOnboarding] No server data, using defaults')
        return defaultAvailability
    }

    return defaultAvailability.map(defaultDay => {
        const serverDay = serverAvailability.find(d => d.dayOfWeek === defaultDay.dayOfWeek)
        if (!serverDay) return defaultDay

        if (serverDay.startTime && serverDay.endTime && !serverDay.timeSlots) {
            return {
                dayOfWeek: defaultDay.dayOfWeek,
                isAvailable: serverDay.isAvailable || false,
                timeSlots: serverDay.isAvailable ? [{ startTime: serverDay.startTime, endTime: serverDay.endTime }] : []
            }
        }

        return {
            dayOfWeek: defaultDay.dayOfWeek,
            isAvailable: serverDay.isAvailable || false,
            timeSlots: Array.isArray(serverDay.timeSlots) ? serverDay.timeSlots : []
        }
    })
}

onMounted(async () => {
    try {
        window.addEventListener('beforeunload', handleBeforeUnload)

        console.log('[ProviderOnboarding] Loading user data...')

        const response = await axios.get('/users/me')
        const user = response.data

        console.log('[ProviderOnboarding] User data received:', user)
        console.log('[ProviderOnboarding] User availability:', user.availability)

        if (user.education) formData.education = [...user.education]
        if (user.certifications) formData.certifications = [...user.certifications]
        if (user.languages) formData.languages = [...user.languages]

        const normalizedAvailability = normalizeAvailability(user.availability)
        console.log('[ProviderOnboarding] Normalized availability:', normalizedAvailability)
        formData.availability = normalizedAvailability

        if (user.sessionDuration) formData.sessionDuration = user.sessionDuration
        if (user.sessionFee) formData.sessionFee = user.sessionFee
        if (user.specializations) formData.specializations = [...user.specializations]
        if (user.bio) formData.bio = user.bio
        if (user.experience) formData.experience = user.experience
        if (user.licenseNumber) formData.licenseNumber = user.licenseNumber

        currentStep.value = authStore.currentOnboardingStep || user.profileSetupStep || 1
        lastSavedStep.value = currentStep.value

        console.log('[ProviderOnboarding] Form data initialized:', {
            availabilityLength: formData.availability.length,
            currentStep: currentStep.value
        })

    } catch (error) {
        console.error('Error loading user data:', error)
    }
})

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
})
</script>