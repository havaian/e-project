<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Session Settings</h2>
            <p class="mt-2 text-gray-600">Configure your session pricing and duration</p>
        </div>

        <!-- Session Configuration -->
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Session Duration -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                    <label class="block text-sm font-medium text-gray-900 mb-4">
                        Session Duration
                    </label>
                    <div class="space-y-3">
                        <div v-for="duration in durationOptions" :key="duration.value"
                            class="flex items-center space-x-3">
                            <input :id="`duration-${duration.value}`" v-model="modelValue.sessionDuration"
                                :value="duration.value" type="radio"
                                class="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                                @change="validateForm" />
                            <label :for="`duration-${duration.value}`"
                                class="text-sm text-gray-900 cursor-pointer flex-1">
                                <span class="font-medium">{{ duration.label }}</span>
                                <span class="text-gray-500 ml-2">{{ duration.description }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Session Fee -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                    <label for="sessionFee" class="block text-sm font-medium text-gray-900 mb-4">
                        Session Fee (UZS)
                    </label>
                    <div class="relative">
                        <input id="sessionFee" v-model.number="modelValue.sessionFee" type="number" min="50000"
                            max="2000000" step="10000" placeholder="150000"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-sky-500 focus:border-sky-500 text-lg"
                            @input="validateForm" />
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span class="text-gray-500 text-sm">UZS</span>
                        </div>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">
                        Suggested range: 100,000 - 500,000 UZS per session
                    </div>

                    <!-- Fee Breakdown -->
                    <div v-if="modelValue.sessionFee && modelValue.sessionFee > 0"
                        class="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div class="text-xs text-gray-600 space-y-1">
                            <div class="flex justify-between">
                                <span>Session Fee:</span>
                                <span class="font-medium">{{ formatCurrency(modelValue.sessionFee) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Platform Fee (10%):</span>
                                <span>{{ formatCurrency(modelValue.sessionFee * 0.1) }}</span>
                            </div>
                            <div class="flex justify-between font-medium border-t pt-1">
                                <span>You receive:</span>
                                <span class="text-green-600">{{ formatCurrency(modelValue.sessionFee * 0.9) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Earnings Preview -->
            <div v-if="modelValue.sessionFee && modelValue.sessionDuration"
                class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div class="flex items-start space-x-3">
                    <svg class="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                        <h4 class="font-semibold text-green-900">Earnings Preview</h4>
                        <p class="text-green-700 mt-1">
                            With {{ modelValue.sessionDuration }}-minute sessions at {{
                                formatCurrency(modelValue.sessionFee) }},
                            you could earn up to <span class="font-semibold">{{ formatCurrency(potentialHourlyEarnings)
                                }} per hour</span>.
                        </p>
                        <p class="text-green-600 text-sm mt-2">
                            That's {{ formatCurrency(potentialDailyEarnings) }} per 8-hour day or {{
                                formatCurrency(potentialMonthlyEarnings) }} per month (assuming 20 working days).
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pricing Strategy Tips -->
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                    <h4 class="font-semibold text-blue-900 mb-3">Pricing Strategy Tips</h4>
                    <div class="space-y-2 text-sm text-blue-700">
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>Start competitive:</strong> Research similar providers and price slightly
                                below average to build your reputation</span>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>Consider your expertise:</strong> Higher qualifications and experience justify
                                higher rates</span>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>Factor in session prep:</strong> Include time for preparation and follow-up
                                notes in your pricing</span>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>Plan for growth:</strong> You can increase rates as you gain positive reviews
                                and experience</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Session Duration Guide -->
        <div class="bg-amber-50 rounded-xl p-6 border border-amber-200">
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 class="font-semibold text-amber-900 mb-3">Choosing Session Duration</h4>
                    <div class="space-y-2 text-sm text-amber-700">
                        <div><strong>30-45 minutes:</strong> Perfect for quick consultations, follow-ups, or targeted
                            advice sessions</div>
                        <div><strong>60 minutes:</strong> Standard duration for most therapy and counseling sessions
                        </div>
                        <div><strong>90-120 minutes:</strong> Ideal for comprehensive assessments, intensive therapy, or
                            complex cases</div>
                    </div>
                    <p class="text-amber-600 text-sm mt-3 font-medium">
                        💡 Most new providers start with 60-minute sessions as they're familiar to clients
                    </p>
                </div>
            </div>
        </div>

        <!-- Important Notes -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                    <p class="font-medium text-gray-900 mb-2">Important Information</p>
                    <div class="space-y-1 text-gray-600">
                        <p>• You can update your session duration and fees anytime from your dashboard</p>
                        <p>• Price changes only apply to new bookings, not existing appointments</p>
                        <p>• Platform fee helps maintain the service, secure payments, and customer support</p>
                        <p>• All payments are processed securely and you'll receive earnings weekly</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue', 'validate'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// Session duration options (based on backend model)
const durationOptions = ref([
    { value: 30, label: '30 minutes', description: 'Quick consultations' },
    { value: 45, label: '45 minutes', description: 'Standard sessions' },
    { value: 60, label: '60 minutes', description: 'In-depth sessions' },
    { value: 90, label: '90 minutes', description: 'Extended sessions' },
    { value: 120, label: '120 minutes', description: 'Comprehensive sessions' }
])

// Computed properties
const potentialHourlyEarnings = computed(() => {
    if (!props.modelValue.sessionFee || !props.modelValue.sessionDuration) return 0

    const netFeePerSession = props.modelValue.sessionFee * 0.9 // After 10% platform fee
    const sessionsPerHour = 60 / props.modelValue.sessionDuration
    return Math.round(netFeePerSession * sessionsPerHour)
})

const potentialDailyEarnings = computed(() => {
    return Math.round(potentialHourlyEarnings.value * 8) // 8-hour workday
})

const potentialMonthlyEarnings = computed(() => {
    return Math.round(potentialDailyEarnings.value * 20) // 20 working days per month
})

// Methods
const formatCurrency = (amount) => {
    if (!amount) return '0 UZS'
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS'
}

const validateForm = () => {
    // Session duration must be selected
    const hasSessionDuration = props.modelValue.sessionDuration &&
        [30, 45, 60, 90, 120].includes(props.modelValue.sessionDuration)

    // Session fee must be valid
    const hasValidSessionFee = props.modelValue.sessionFee &&
        props.modelValue.sessionFee >= 50000 &&
        props.modelValue.sessionFee <= 2000000

    const isValid = hasSessionDuration && hasValidSessionFee
    emit('validate', isValid)
}

// Set defaults if not already set
onMounted(() => {
    if (!props.modelValue.sessionDuration) {
        props.modelValue.sessionDuration = 60 // Default to 60 minutes
    }
    if (!props.modelValue.sessionFee) {
        props.modelValue.sessionFee = 150000 // Default fee
    }
    validateForm()
})

// Watch for changes
watch(() => [props.modelValue.sessionDuration, props.modelValue.sessionFee], validateForm, { deep: true })
</script>