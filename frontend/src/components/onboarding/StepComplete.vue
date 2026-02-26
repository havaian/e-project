<template>
    <div class="text-center space-y-8">
        <!-- Success Animation -->
        <div class="flex justify-center">
            <div class="relative">
                <!-- Animated checkmark circle -->
                <div
                    class="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <CheckCircleIcon class="w-12 h-12 text-white" />
                </div>

                <!-- Confetti animation elements -->
                <div class="absolute -top-2 -left-2 w-3 h-3 bg-sky-400 rounded-full animate-bounce"
                    style="animation-delay: 0.1s;"></div>
                <div class="absolute -top-4 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
                    style="animation-delay: 0.3s;"></div>
                <div class="absolute top-2 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-bounce"
                    style="animation-delay: 0.5s;"></div>
                <div class="absolute bottom-0 -left-4 w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                    style="animation-delay: 0.7s;"></div>
                <div class="absolute -bottom-2 right-4 w-3 h-3 bg-green-400 rounded-full animate-bounce"
                    style="animation-delay: 0.9s;"></div>
            </div>
        </div>

        <!-- Congratulations Header -->
        <div>
            <h2 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('onboarding.congratulations') }}</h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                {{ $t('onboarding.profileCompleteDesc') }}
            </p>
        </div>

        <!-- Achievement Stats -->
        <div class="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-2xl p-8 border border-sky-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">{{ $t('onboarding.whatAccomplished') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpenIcon class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="font-semibold text-gray-900">{{ $t('onboarding.profileCreated') }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ $t('onboarding.profileCreatedDesc') }}</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <ClockIcon class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="font-semibold text-gray-900">{{ $t('onboarding.scheduleSet') }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ $t('onboarding.scheduleSetDesc') }}</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CurrencyDollarIcon class="w-8 h-8 text-white" />
                    </div>
                    <h4 class="font-semibold text-gray-900">{{ $t('onboarding.pricingSet') }}</h4>
                    <p class="text-sm text-gray-600 mt-1">{{ $t('onboarding.pricingSetDesc') }}</p>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('onboarding.profileSummary') }}</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <div class="text-2xl font-bold text-sky-600">{{ specializations.length }}</div>
                    <div class="text-sm text-gray-600">{{ specializations.length === 1 ? $t('onboarding.specialization')
                        : $t('onboarding.specializations') }}</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-emerald-600">{{ availableDays }}</div>
                    <div class="text-sm text-gray-600">{{ availableDays === 1 ? $t('onboarding.dayAvailable') :
                        $t('onboarding.daysAvailable') }}</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-purple-600">{{ sessionDuration }}{{ $t('onboarding.minutes') }}
                    </div>
                    <div class="text-sm text-gray-600">{{ $t('onboarding.sessionLength') }}</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-orange-600">{{ languages.length }}</div>
                    <div class="text-sm text-gray-600">{{ languages.length === 1 ? $t('onboarding.language') :
                        $t('onboarding.languages') }}</div>
                </div>
            </div>
        </div>

        <!-- Next Steps -->
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 class="text-lg font-semibold text-blue-900 mb-4">{{ $t('onboarding.whatHappensNext') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">1</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">{{ $t('onboarding.profileReview') }}</h4>
                        <p class="text-sm text-blue-700 mt-1">{{ $t('onboarding.profileReviewDesc') }}</p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">2</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">{{ $t('onboarding.goLive') }}</h4>
                        <p class="text-sm text-blue-700 mt-1">{{ $t('onboarding.goLiveDesc') }}</p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">3</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">{{ $t('onboarding.startEarning') }}</h4>
                        <p class="text-sm text-blue-700 mt-1">{{ $t('onboarding.startEarningDesc') }}</p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">4</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">{{ $t('onboarding.ongoingSupport') }}</h4>
                        <p class="text-sm text-blue-700 mt-1">{{ $t('onboarding.ongoingSupportDesc') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Support Information -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('onboarding.needHelp') }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a :href="`mailto:${supportEmail}`"
                    class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <EnvelopeIcon class="w-6 h-6 text-sky-500" />
                    <div class="text-left">
                        <div class="font-medium text-gray-900">{{ $t('onboarding.emailSupport') }}</div>
                        <div class="text-sm text-gray-600">{{ $t('onboarding.getHelpViaEmail') }}</div>
                    </div>
                </a>

                <a :href="`tel:${supportPhone}`"
                    class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <PhoneIcon class="w-6 h-6 text-sky-500" />
                    <div class="text-left">
                        <div class="font-medium text-gray-900">{{ $t('onboarding.phoneSupport') }}</div>
                        <div class="text-sm text-gray-600">{{ supportPhone }}</div>
                    </div>
                </a>

                <a href="/help"
                    class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <QuestionMarkCircleIcon class="w-6 h-6 text-sky-500" />
                    <div class="text-left">
                        <div class="font-medium text-gray-900">{{ $t('onboarding.helpCenter') }}</div>
                        <div class="text-sm text-gray-600">{{ $t('onboarding.browseFaqs') }}</div>
                    </div>
                </a>
            </div>
        </div>

        <!-- Action Button -->
        <div class="pt-4">
            <button @click="$emit('finish')" class="btn-element-primary text-lg px-12 py-4">
                <ArrowTrendingUpIcon class="w-5 h-5 mr-2" />
                {{ $t('onboarding.goToDashboard') }}
            </button>
            <p class="text-sm text-gray-500 mt-3">
                {{ $t('onboarding.updateLater') }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon, BookOpenIcon, ClockIcon, CurrencyDollarIcon, EnvelopeIcon, PhoneIcon, QuestionMarkCircleIcon, ArrowTrendingUpIcon } from "@heroicons/vue/24/outline";
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['finish'])

const authStore = useAuthStore()

const supportPhone = import.meta.env.VITE_SUPPORT_PHONE
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL

// Get user data for display
const user = computed(() => authStore.user)

const specializations = computed(() => {
    return user.value?.specializations?.filter(spec => spec !== '') || []
})

const languages = computed(() => {
    return user.value?.languages?.filter(lang => lang !== '') || []
})

const availableDays = computed(() => {
    return user.value?.availability?.filter(day => day.isAvailable).length || 0
})

const sessionDuration = computed(() => {
    return user.value?.sessionDuration || 60
})
</script>

<style scoped>
@keyframes bounce {

    0%,
    20%,
    53%,
    80%,
    100% {
        transform: translate3d(0, 0, 0);
    }

    40%,
    43% {
        transform: translate3d(0, -10px, 0);
    }

    70% {
        transform: translate3d(0, -5px, 0);
    }

    90% {
        transform: translate3d(0, -2px, 0);
    }
}
</style>