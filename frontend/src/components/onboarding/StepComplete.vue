<template>
    <div class="text-center space-y-8">
        <!-- Success Animation -->
        <div class="flex justify-center">
            <div class="relative">
                <!-- Animated checkmark circle -->
                <div
                    class="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                    <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
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
            <h2 class="text-4xl font-bold text-gray-900 mb-4">Congratulations! 🎉</h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Your provider profile is now complete and ready to accept appointments from clients.
            </p>
        </div>

        <!-- Achievement Stats -->
        <div class="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-2xl p-8 border border-sky-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">What You've Accomplished</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="w-16 h-16 bg-sky-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h4 class="font-semibold text-gray-900">Profile Created</h4>
                    <p class="text-sm text-gray-600 mt-1">Complete professional profile with credentials</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h4 class="font-semibold text-gray-900">Schedule Set</h4>
                    <p class="text-sm text-gray-600 mt-1">Availability configured for client bookings</p>
                </div>

                <div class="text-center">
                    <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <h4 class="font-semibold text-gray-900">Pricing Set</h4>
                    <p class="text-sm text-gray-600 mt-1">Session fees configured and ready</p>
                </div>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Profile Summary</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <div class="text-2xl font-bold text-sky-600">{{ specializations.length }}</div>
                    <div class="text-sm text-gray-600">{{ specializations.length === 1 ? 'Specialization' :
                        'Specializations' }}</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-emerald-600">{{ availableDays }}</div>
                    <div class="text-sm text-gray-600">{{ availableDays === 1 ? 'Day' : 'Days' }} Available</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-purple-600">{{ sessionDuration }}min</div>
                    <div class="text-sm text-gray-600">Session Length</div>
                </div>
                <div>
                    <div class="text-2xl font-bold text-orange-600">{{ languages.length }}</div>
                    <div class="text-sm text-gray-600">{{ languages.length === 1 ? 'Language' : 'Languages' }}</div>
                </div>
            </div>
        </div>

        <!-- Next Steps -->
        <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 class="text-lg font-semibold text-blue-900 mb-4">What Happens Next?</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">1</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">Profile Review</h4>
                        <p class="text-sm text-blue-700 mt-1">
                            Your profile will be reviewed by our team within 24 hours to ensure quality standards.
                        </p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">2</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">Go Live</h4>
                        <p class="text-sm text-blue-700 mt-1">
                            Once approved, your profile will be visible to clients and you can start receiving bookings.
                        </p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">3</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">Start Earning</h4>
                        <p class="text-sm text-blue-700 mt-1">
                            Begin accepting appointments and building your client base on our platform.
                        </p>
                    </div>
                </div>

                <div class="flex items-start space-x-3">
                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-semibold text-sm">4</span>
                    </div>
                    <div>
                        <h4 class="font-medium text-blue-900">Ongoing Support</h4>
                        <p class="text-sm text-blue-700 mt-1">
                            Our team is here to help you succeed with training resources and support.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Support Information -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Need Help Getting Started?</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a :href="'mailto:{{ supportEmail }}'"
                    class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <svg class="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div class="text-left">
                        <div class="font-medium text-gray-900">Email Support</div>
                        <div class="text-sm text-gray-600">Get help via email</div>
                    </div>
                </a>

                <a :href="'tel:{{ supportPhone }}'"
                    class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <svg class="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div class="text-left">
                        <div class="font-medium text-gray-900">Phone Support</div>
                        <div class="text-sm text-gray-600">{{ supportPhone }}</div>
                    </div>
                </a>

                <a href="/help"
                    class="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-sky-300 hover:bg-sky-50 transition-colors">
                    <svg class="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div class="text-left">
                        <div class="font-medium text-gray-900">Help Center</div>
                        <div class="text-sm text-gray-600">Browse FAQs & guides</div>
                    </div>
                </a>
            </div>
        </div>

        <!-- Action Button -->
        <div class="pt-4">
            <button @click="$emit('finish')" class="btn-element-primary text-lg px-12 py-4">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Go to My Dashboard
            </button>
            <p class="text-sm text-gray-500 mt-3">
                You can always update your profile settings later from your dashboard
            </p>
        </div>
    </div>
</template>

<script setup>
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