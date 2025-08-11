<template>
    <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-3">
                        <img src="/images/logo.svg" alt="Logo" width="40" height="40" class="w-10 h-10" />
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">Provider Setup</h1>
                            <p class="text-sm text-gray-500">Complete your profile to start accepting appointments</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-sm font-medium text-gray-900">Step {{ currentStep }} of {{ totalSteps }}</div>
                        <div class="text-xs text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}% Complete
                        </div>
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

        <!-- Step Indicators -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="flex justify-between items-center relative">
                <!-- Connecting Lines -->
                <div class="absolute top-5 left-0 right-0 flex justify-between px-5">
                    <div v-for="index in steps.length - 1" :key="`line-${index}`" 
                         class="flex-1 h-0.5 mx-2 transition-colors duration-500"
                         :class="index < currentStep 
                             ? 'bg-gradient-to-r from-sky-500 to-emerald-500' 
                             : 'bg-gray-200'">
                    </div>
                </div>
                
                <!-- Step Circles -->
                <div v-for="(step, index) in steps" :key="index" class="flex flex-col items-center relative z-10">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200 bg-white border-2"
                        :class="index + 1 <= currentStep
                            ? 'bg-white text-sky-500 border-sky-500'
                            : 'bg-white text-gray-500 border-gray-300'">
                        <svg v-if="index + 1 < currentStep" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
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
                        @validate="validateStep" />

                    <StepComplete v-if="currentStep === 6" @finish="completeOnboarding" />
                </div>

                <!-- Navigation -->
                <div v-if="currentStep < 6" class="bg-gray-50 px-8 py-4 flex justify-between items-center">
                    <button v-if="currentStep > 1" @click="prevStep" 
                            class="btn-element-secondary" 
                            :class="{ 'cursor-not-allowed': loading }"
                            :disabled="loading">
                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>
                    <div v-else></div>

                    <div class="flex items-center space-x-3">
                        <button v-if="currentStep < 5" @click="saveDraft"
                                class="mr-4 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors" 
                                :class="{ 'cursor-not-allowed opacity-50': loading }"
                                :disabled="loading">
                            Save Draft
                        </button>

                        <button @click="nextStep" 
                                class="btn-element-primary transition-all duration-200" 
                                :class="{ 
                                    'cursor-not-allowed opacity-50': !isStepValid || loading,
                                    'hover:shadow-lg': isStepValid && !loading 
                                }"
                                :disabled="!isStepValid || loading">
                            <span v-if="loading" class="flex items-center">
                                <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Saving...
                            </span>
                            <span class="flex items-center" v-else>
                                {{ currentStep === 5 ? 'Complete Setup' : 'Next' }}
                                <svg v-if="currentStep < 5" class="w-4 h-4 ml-2" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Help Section -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 class="text-sm font-medium text-blue-900">Need Help?</h3>
                        <p class="text-sm text-blue-700 mt-1">
                            Contact our support team at <a :href="`mailto:${supportEmail}`"
                                class="underline">{{ supportEmail }}</a>
                            or call us at {{ supportPhone }} if you need assistance completing your profile.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

// Import step components
import StepEducation from '@/components/onboarding/StepEducation.vue'
import StepAvailability from '@/components/onboarding/StepAvailability.vue'
import StepSessionSettings from '@/components/onboarding/StepSessionSettings.vue'
import StepProfile from '@/components/onboarding/StepProfile.vue'
import StepReview from '@/components/onboarding/StepReview.vue'
import StepComplete from '@/components/onboarding/StepComplete.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const currentStep = ref(1)
const totalSteps = 6
const loading = ref(false)
const isStepValid = ref(false)

const supportPhone = import.meta.env.VITE_SUPPORT_PHONE
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL

// Steps configuration
const steps = [
    { name: 'Education', component: 'StepEducation' },
    { name: 'Availability', component: 'StepAvailability' },
    { name: 'Sessions', component: 'StepSessionSettings' },
    { name: 'Profile', component: 'StepProfile' },
    { name: 'Review', component: 'StepReview' },
    { name: 'Complete', component: 'StepComplete' }
]

// Form data - centralized state for all steps
const formData = reactive({
    // Step 1: Education
    education: [],
    certifications: [],
    languages: [],

    // Step 2: Availability  
    availability: [
        { dayOfWeek: 1, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 6, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 7, isAvailable: false, startTime: '09:00', endTime: '17:00' }
    ],

    // Step 3: Session Settings
    sessionDuration: 60,
    sessionFee: 0,

    // Step 4: Profile Info
    specializations: [],
    bio: '',
    experience: 0,

    // Additional fields that might be needed
    licenseNumber: ''
})

// Navigation methods
const nextStep = async () => {
    if (currentStep.value < totalSteps) {
        await saveStepData()
        currentStep.value++
        await updateOnboardingStep()
    }
}

const prevStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

const validateStep = (isValid) => {
    isStepValid.value = isValid
}

// Save current step data to backend
const saveStepData = async () => {
    try {
        loading.value = true

        // Prepare update data based on current step
        let updateData = {}

        switch (currentStep.value) {
            case 1: // Education
                updateData = {
                    education: formData.education.filter(edu => edu.degree && edu.institution && edu.year),
                    certifications: formData.certifications.filter(cert => cert.name && cert.issuer && cert.year),
                    languages: formData.languages.filter(lang => lang !== '')
                }
                break

            case 2: // Availability
                updateData = {
                    availability: formData.availability
                }
                break

            case 3: // Session Settings
                updateData = {
                    sessionDuration: formData.sessionDuration,
                    sessionFee: formData.sessionFee
                }
                break

            case 4: // Profile
                updateData = {
                    specializations: formData.specializations.filter(spec => spec !== ''),
                    bio: formData.bio,
                    experience: formData.experience,
                    licenseNumber: formData.licenseNumber
                }
                break
        }

        // Save to backend
        await axios.patch('/users/me', updateData)

    } catch (error) {
        console.error('Error saving step data:', error)
        // Show error notification but don't prevent progression
    } finally {
        loading.value = false
    }
}

// Save draft
const saveDraft = async () => {
    await saveStepData()
    // Show success notification
}

// Update onboarding step in auth store
const updateOnboardingStep = async () => {
    try {
        await authStore.updateOnboardingStep(currentStep.value)
    } catch (error) {
        console.error('Error updating onboarding step:', error)
    }
}

// Complete onboarding
const completeOnboarding = async () => {
    try {
        loading.value = true

        // Mark onboarding as complete
        await authStore.updateOnboardingStep(6)

        // Redirect to provider dashboard
        router.push('/profile/provider?refreshProfile=true')

    } catch (error) {
        console.error('Error completing onboarding:', error)
    } finally {
        loading.value = false
    }
}

// Load existing data on mount
onMounted(async () => {
    try {
        // Get current user data
        const response = await axios.get('/users/me')
        const user = response.data

        // Populate form with existing data
        if (user.education) formData.education = [...user.education]
        if (user.certifications) formData.certifications = [...user.certifications]
        if (user.languages) formData.languages = [...user.languages]
        if (user.availability) formData.availability = [...user.availability]
        if (user.sessionDuration) formData.sessionDuration = user.sessionDuration
        if (user.sessionFee) formData.sessionFee = user.sessionFee
        if (user.specializations) formData.specializations = [...user.specializations]
        if (user.bio) formData.bio = user.bio
        if (user.experience) formData.experience = user.experience
        if (user.licenseNumber) formData.licenseNumber = user.licenseNumber

        // Set current step from auth store or user profile
        currentStep.value = authStore.currentOnboardingStep || user.profileSetupStep || 1

    } catch (error) {
        console.error('Error loading user data:', error)
    }
})
</script>