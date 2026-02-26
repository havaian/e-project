<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">{{ $t('onboarding.reviewProfile') }}</h2>
            <p class="mt-2 text-gray-600">{{ $t('onboarding.reviewDesc') }}</p>
        </div>

        <!-- Profile Summary Cards -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- Education & Certifications -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ $t('onboarding.educationCerts') }}</h3>
                    <button @click="$emit('editStep', 1)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        {{ $t('onboarding.edit') }}
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('onboarding.education') }}</h4>
                        <div v-if="validEducation.length > 0" class="space-y-2">
                            <div v-for="edu in validEducation" :key="`${edu.degree}-${edu.institution}`"
                                class="text-sm text-gray-600">
                                {{ edu.degree }} - {{ edu.institution }} ({{ edu.year }})
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-500">{{ $t('onboarding.noEducation') }}</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('onboarding.certifications') }}</h4>
                        <div v-if="validCertifications.length > 0" class="space-y-2">
                            <div v-for="cert in validCertifications" :key="`${cert.name}-${cert.issuer}`"
                                class="text-sm text-gray-600">
                                {{ cert.name }} - {{ cert.issuer }} ({{ cert.year }})
                            </div>
                        </div>
                        <p v-else class="text-sm text-gray-500">{{ $t('onboarding.noCertifications') }}</p>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('onboarding.languages') }}</h4>
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
                    <h3 class="text-lg font-semibold text-gray-900">{{ $t('calendar.providerAvailability') }}</h3>
                    <button @click="$emit('editStep', 2)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        {{ $t('onboarding.edit') }}
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
                        {{ $t('onboarding.noAvailability') }}
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-600">{{ $t('onboarding.totalWeeklyHours') }}</span>
                        <span class="font-medium text-gray-900">{{ totalWeeklyHours.toFixed(1) }} {{
                            $t('onboarding.hours') }}</span>
                    </div>
                </div>
            </div>

            <!-- Session settings -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ $t('onboarding.sessionSettings') }}</h3>
                    <button @click="$emit('editStep', 3)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        {{ $t('onboarding.edit') }}
                    </button>
                </div>

                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">{{ $t('onboarding.sessionDuration') }}</span>
                        <span class="font-medium text-gray-900">{{ modelValue.sessionDuration }} {{
                            $t('onboarding.minutes') }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">{{ $t('onboarding.sessionFee') }}</span>
                        <span class="font-medium text-gray-900">{{ formatCurrency(modelValue.sessionFee) }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">{{ $t('onboarding.youReceiveAfterFee') }}</span>
                        <span class="font-medium text-green-600">{{ formatCurrency(netEarnings) }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">{{ $t('onboarding.potentialHourly') }}</span>
                        <span class="font-medium text-blue-600">{{ formatCurrency(hourlyEarnings) }}/{{
                            $t('onboarding.hours') }}</span>
                    </div>
                </div>
            </div>

            <!-- Profile Information -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">{{ $t('onboarding.profileInfo') }}</h3>
                    <button @click="$emit('editStep', 4)" class="text-sky-600 hover:text-sky-700 text-sm font-medium">
                        {{ $t('onboarding.edit') }}
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('onboarding.specializations') }}</h4>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="spec in validSpecializations" :key="spec"
                                class="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full">
                                {{ spec }}
                            </span>
                        </div>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">{{ $t('onboarding.experience') }}</span>
                        <span class="font-medium text-gray-900">{{ $t('onboarding.yearsExperience', {
                            count:
                            modelValue.experience }) }}</span>
                    </div>

                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">{{ $t('onboarding.licenseNumber') }}</span>
                        <span class="font-medium text-gray-900">{{ modelValue.licenseNumber }}</span>
                    </div>

                    <div>
                        <h4 class="text-sm font-medium text-gray-900 mb-2">{{ $t('onboarding.bio') }}</h4>
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
                    <h3 class="text-lg font-semibold text-green-900">{{ $t('onboarding.profileCompletion', {
                        percent:
                        completionPercentage }) }}</h3>
                    <p class="text-green-700">{{ $t('onboarding.profileReadyToGoLive') }}</p>
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
                    {{ $t('onboarding.termsConfirmation') }}
                    <a href="/terms" target="_blank" class="text-sky-600 hover:text-sky-700 underline">{{
                        $t('onboarding.publicOffer') }}</a>
                    and
                    <a href="/privacy" target="_blank" class="text-sky-600 hover:text-sky-700 underline">{{
                        $t('onboarding.privacyPolicy') }}</a>.
                    {{ $t('onboarding.falseInfoWarning') }}
                </label>
            </div>
        </div>

        <!-- Final Validation -->
        <div v-if="validationErrors.length > 0" class="bg-red-50 rounded-xl p-4 border border-red-200">
            <div class="flex items-start space-x-3">
                <ExclamationCircleIcon class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-red-900">{{ $t('onboarding.addressIssues') }}</p>
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
                    <p class="font-medium text-green-900">{{ $t('onboarding.readyToComplete') }}</p>
                    <p class="text-green-700 mt-1">
                        {{ $t('onboarding.readyToCompleteDesc') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

    if (validEducation.value.length === 0) errors.push(t('onboarding.validationEducation'))
    if (validCertifications.value.length === 0) errors.push(t('onboarding.validationCertification'))
    if (validLanguages.value.length === 0) errors.push(t('onboarding.validationLanguage'))
    if (availableDays.value.length === 0) errors.push(t('onboarding.validationAvailability'))
    if (!props.modelValue.sessionDuration || !props.modelValue.sessionFee) errors.push(t('onboarding.validationSession'))
    if (validSpecializations.value.length === 0) errors.push(t('onboarding.validationSpecialization'))
    if (!props.modelValue.licenseNumber) errors.push(t('onboarding.validationLicense'))
    if (!props.modelValue.bio || props.modelValue.bio.length < 50) errors.push(t('onboarding.validationBio'))
    if (!termsAccepted.value) errors.push(t('onboarding.validationTerms'))

    return errors
})

const isValid = computed(() => {
    return validationErrors.value.length === 0
})

// Methods
const getDayName = (dayOfWeek) => {
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    return t(`onboarding.${dayKeys[dayOfWeek - 1]}`)
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