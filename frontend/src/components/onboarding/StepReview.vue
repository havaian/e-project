<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Review Your profile</h2>
            <p class="mt-2 text-gray-600">Please review all information before completing your setup</p>
        </div>

        <!-- Profile Summary Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- Education & Certifications -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Education & Certifications</h3>
                    <button @click="$emit('editStep', 1)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Edit
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Education</h4>
                        <div v-if="validEducation.length > 0" class="space-y-2">
                            <div v-for="edu in validEducation" :key="`${edu.degree}-${edu.institution}`"
                                class="text-sm text-gray-600">
                                {{ edu.degree }} - {{ edu.institution }} ({{ edu.year }})
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-500">No education information</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
                        <div v-if="validCertifications.length > 0" class="space-y-2">
                            <div v-for="cert in validCertifications" :key="`${cert.name}-${cert.issuer}`"
                                class="text-sm text-gray-600">
                                {{ cert.name }} - {{ cert.issuer }} ({{ cert.year }})
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-500">No certifications</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Languages</h4>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="lang in validLanguages" :key="lang"
                                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                {{ lang }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Availability -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Availability</h3>
                    <button @click="$emit('editStep', 2)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Edit
                    </button>
                </div>

                <div class="space-y-3">
                    <div v-for="day in availableDays" :key="day.dayOfWeek">
                        <div class="flex justify-between items-start">
                            <span class="text-sm font-medium text-gray-900">{{ getDayName(day.dayOfWeek) }}</span>
                            <div class="text-right">
                                <div v-for="(slot, index) in day.timeSlots" :key="index" class="text-sm text-gray-600">
                                    {{ formatTime(slot.startTime) }} - {{ formatTime(slot.endTime) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="availableDays.length === 0" class="text-sm text-gray-500">
                        No availability set
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">Total weekly hours:</span>
                        <span class="font-medium text-gray-900">{{ totalWeeklyHours.toFixed(1) }} hours</span>
                    </div>
                </div>
            </div>

            <!-- Session settings -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Session settings</h3>
                    <button @click="$emit('editStep', 3)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Edit
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Session duration</span>
                        <span class="font-medium text-gray-900">{{ modelValue.sessionDuration }} minutes</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Session fee</span>
                        <span class="font-medium text-gray-900">{{ formatCurrency(modelValue.sessionFee) }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">You receive (after 10% platform fee)</span>
                        <span class="font-medium text-green-600">{{ formatCurrency(netEarnings) }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Potential hourly earnings</span>
                        <span class="font-medium text-blue-600">{{ formatCurrency(hourlyEarnings) }}/hour</span>
                    </div>
                </div>
            </div>

            <!-- Profile Information -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Profile Information</h3>
                    <button @click="$emit('editStep', 4)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        Edit
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Specializations</h4>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="spec in validSpecializations" :key="spec"
                                class="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
                                {{ spec }}
                            </span>
                        </div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">Years of experience</span>
                        <span class="font-medium text-gray-900">{{ modelValue.experience }} {{ modelValue.experience ===
                            1 ? 'year' : 'years' }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">License number</span>
                        <span class="font-medium text-gray-900">{{ modelValue.licenseNumber }}</span>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">Professional Bio</h4>
                        <p class="text-sm text-gray-600 leading-relaxed">{{ modelValue.bio }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Completion status -->
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircleIcon class="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-green-900">Profile {{ completionPercentage }}% Complete</h3>
                    <p class="text-green-700">All required information has been provided. Your profile is ready to go
                        live!</p>
                </div>
            </div>
        </div>

        <!-- Terms and Conditions -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex items-start space-x-3">
                <input id="terms-agreement" v-model="termsAccepted" type="checkbox"
                    class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded mt-1"
                    @change="validateForm" />
                <label for="terms-agreement" class="text-sm text-gray-700">
                    I confirm that all information provided is accurate and I have accepted
                    <a href="/terms" target="_blank" class="text-sky-600 hover:text-sky-700 underline">Public Offer</a>
                    and
                    <a href="/privacy" target="_blank" class="text-sky-600 hover:text-sky-700 underline">Privacy
                        Policy</a>.
                    I understand that providing false information may result in account suspension.
                </label>
            </div>
        </div>

        <!-- Final Validation -->
        <div v-if="validationErrors.length > 0" class="bg-red-50 rounded-xl p-4 border border-red-200">
            <div class="flex items-start space-x-3">
                <ExclamationCircleIcon class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-red-900">Please address the following issues:</p>
                    <ul class="text-red-700 mt-1 list-disc list-inside">
                        <li v-for="error in validationErrors" :key="error">{{ error }}</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Success State -->
        <div v-if="isValid" class="bg-green-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-start space-x-3">
                <CheckCircleIcon class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-green-900">Ready to complete setup!</p>
                    <p class="text-green-700 mt-1">
                        Your profile is complete and ready to be published. Click "Complete setup" to finish the
                        onboarding process.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue', 'validate', 'editStep'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// State
const termsAccepted = ref(false)

// Computed properties
const validEducation = computed(() => {
    return props.modelValue.education?.filter(edu =>
        edu.degree && edu.institution && edu.year
    ) || []
})

const validCertifications = computed(() => {
    return props.modelValue.certifications?.filter(cert =>
        cert.name && cert.issuer && cert.year
    ) || []
})

const validLanguages = computed(() => {
    return props.modelValue.languages?.filter(lang => lang !== '') || []
})

const validSpecializations = computed(() => {
    return props.modelValue.specializations?.filter(spec => spec !== '') || []
})

const availableDays = computed(() => {
    return props.modelValue.availability?.filter(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    ) || []
})

const totalWeeklyHours = computed(() => {
    return availableDays.value.reduce((total, day) => {
        const dayTotal = (day.timeSlots || []).reduce((daySum, slot) => {
            const start = timeToMinutes(slot.startTime)
            const end = timeToMinutes(slot.endTime)
            return daySum + ((end - start) / 60)
        }, 0)
        return total + dayTotal
    }, 0)
})

const netEarnings = computed(() => {
    return Math.round(props.modelValue.sessionFee * 0.9)
})

const hourlyEarnings = computed(() => {
    if (!props.modelValue.sessionDuration || !props.modelValue.sessionFee) return 0
    const sessionsPerHour = 60 / props.modelValue.sessionDuration
    return Math.round(netEarnings.value * sessionsPerHour)
})

const completionPercentage = computed(() => {
    let completed = 0
    const total = 10

    // Check completeness of each section
    if (validEducation.value.length > 0) completed++
    if (validCertifications.value.length > 0) completed++
    if (validLanguages.value.length > 0) completed++
    if (availableDays.value.length > 0) completed++
    if (props.modelValue.sessionDuration && props.modelValue.sessionFee > 0) completed += 2
    if (validSpecializations.value.length > 0) completed++
    if (props.modelValue.experience >= 0) completed++
    if (props.modelValue.licenseNumber) completed++
    if (props.modelValue.bio && props.modelValue.bio.length >= 50) completed++

    return Math.round((completed / total) * 100)
})

const validationErrors = computed(() => {
    const errors = []

    if (validEducation.value.length === 0) {
        errors.push('At least one education entry is required')
    }

    if (validCertifications.value.length === 0) {
        errors.push('At least one certification is required')
    }

    if (validLanguages.value.length === 0) {
        errors.push('At least one language must be selected')
    }

    if (availableDays.value.length === 0) {
        errors.push('At least one day of availability must be set')
    }

    if (!props.modelValue.sessionDuration || !props.modelValue.sessionFee) {
        errors.push('Session duration and fee must be set')
    }

    if (validSpecializations.value.length === 0) {
        errors.push('At least one specialization must be selected')
    }

    if (!props.modelValue.licenseNumber) {
        errors.push('Professional license number is required')
    }

    if (!props.modelValue.bio || props.modelValue.bio.length < 50) {
        errors.push('Professional bio must be at least 50 characters')
    }

    if (!termsAccepted.value) {
        errors.push('You must accept the terms and conditions')
    }

    return errors
})

const isValid = computed(() => {
    return validationErrors.value.length === 0
})

// Methods
const getDayName = (dayOfWeek) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[dayOfWeek - 1]
}

const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
}

const timeToMinutes = (time) => {
    if (!time) return 0
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS'
}

const validateForm = () => {
    emit('validate', isValid.value)
}

// Watch for changes
watch(() => [props.modelValue, termsAccepted.value], validateForm, { deep: true })

onMounted(() => {
    validateForm()
})
</script>