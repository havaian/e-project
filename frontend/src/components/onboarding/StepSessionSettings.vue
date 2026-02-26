<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">{{ $t('onboarding.sessionSettings') }}</h2>
            <p class="mt-2 text-gray-600">{{ $t('onboarding.sessionSettingsDesc') }}</p>
        </div>

        <!-- Session Configuration -->
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Session duration -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                    <label class="block text-sm font-medium text-gray-900 mb-4">
                        {{ $t('onboarding.sessionDuration') }}
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
                                <span class="font-medium">{{ duration.value }} {{ $t('onboarding.minutes') }}</span>
                                <span class="text-gray-500 ml-2">{{ duration.description }}</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Session fee -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                    <label for="sessionFee" class="block text-sm font-medium text-gray-900 mb-4">
                        {{ $t('onboarding.sessionFee') }}
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
                        {{ $t('onboarding.suggestedRange') }}
                    </div>

                    <!-- Fee Breakdown -->
                    <div v-if="modelValue.sessionFee && modelValue.sessionFee > 0"
                        class="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div class="text-xs text-gray-600 space-y-1">
                            <div class="flex justify-between">
                                <span>{{ $t('onboarding.sessionFee') }}:</span>
                                <span class="font-medium">{{ formatCurrency(modelValue.sessionFee) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>{{ $t('onboarding.platformFee') }}</span>
                                <span>{{ formatCurrency(modelValue.sessionFee * 0.1) }}</span>
                            </div>
                            <div class="flex justify-between font-medium border-t pt-1">
                                <span>{{ $t('onboarding.youReceive') }}</span>
                                <span class="text-green-600">{{ formatCurrency(modelValue.sessionFee * 0.9) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Earnings preview -->
            <div v-if="modelValue.sessionFee && modelValue.sessionDuration"
                class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div class="flex items-start space-x-3">
                    <CurrencyDollarIcon class="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <h4 class="font-semibold text-gray-900">{{ $t('onboarding.earningsPreview') }}</h4>
                        <p class="text-gray-700 mt-1">
                            {{ $t('onboarding.earningsPreviewDesc', {
                                duration: modelValue.sessionDuration, fee:
                                    formatCurrency(modelValue.sessionFee), hourly: formatCurrency(potentialHourlyEarnings) }) }}
                        </p>
                        <p class="text-gray-600 text-sm mt-2">
                            {{ $t('onboarding.earningsDaily', {
                                daily: formatCurrency(potentialDailyEarnings), monthly:
                                    formatCurrency(potentialMonthlyEarnings) }) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Pricing strategy tips -->
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div class="flex items-start space-x-3">
                <LightBulbIcon class="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 class="font-semibold text-gray-900 mb-3">{{ $t('onboarding.pricingTips') }}</h4>
                    <div class="space-y-2 text-sm text-gray-700">
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>{{ $t('onboarding.startCompetitive') }}</strong> {{
                                $t('onboarding.startCompetitiveDesc') }}</span>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>{{ $t('onboarding.considerExpertise') }}</strong> {{
                                $t('onboarding.considerExpertiseDesc') }}</span>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>{{ $t('onboarding.factorPrep') }}</strong> {{ $t('onboarding.factorPrepDesc')
                                }}</span>
                        </div>
                        <div class="flex items-start space-x-2">
                            <span class="text-blue-500 mt-0.5">•</span>
                            <span><strong>{{ $t('onboarding.planGrowth') }}</strong> {{ $t('onboarding.planGrowthDesc')
                                }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Important Notes -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div class="flex items-start space-x-3">
                <InformationCircleIcon class="w-6 h-6 text-violet-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-gray-900 mb-2">{{ $t('onboarding.importantInfo') }}</p>
                    <div class="space-y-1 text-gray-600">
                        <p>• {{ $t('onboarding.updateAnytime') }}</p>
                        <p>• {{ $t('onboarding.priceChanges') }}</p>
                        <p>• {{ $t('onboarding.platformFeeInfo') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CurrencyDollarIcon, LightBulbIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const emit = defineEmits(['update:modelValue', 'validate'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// Session duration options (based on backend model)
const durationOptions = computed(() => [
    { value: 30, description: t('onboarding.quickConsultations') },
    { value: 45, description: t('onboarding.standardSessions') },
    { value: 60, description: t('onboarding.inDepthSessions') },
    { value: 90, description: t('onboarding.extendedSessions') },
    { value: 120, description: t('onboarding.comprehensiveSessions') }
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
    const hasSessionDuration = props.modelValue.sessionDuration &&
        [30, 45, 60, 90, 120].includes(props.modelValue.sessionDuration)

    const hasValidSessionFee = props.modelValue.sessionFee &&
        props.modelValue.sessionFee >= 10000 &&
        props.modelValue.sessionFee <= 999999999

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