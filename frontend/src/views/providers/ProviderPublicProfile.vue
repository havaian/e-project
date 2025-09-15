<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">Loading provider profile...</p>
        </div>

        <template v-else-if="provider">
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <!-- Profile Header -->
                <div class="p-6 sm:p-8 border-b border-gray-200">
                    <div class="flex flex-col sm:flex-row items-center justify-between">
                        <div class="flex flex-col sm:flex-row items-center">
                            <img :src="provider.profilePicture ? `/api${provider.profilePicture}` : '/images/user-placeholder.jpg'"
                                :alt="provider.firstName" class="h-32 w-32 rounded-full object-cover" />
                            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                                <h1 class="text-3xl font-bold text-gray-900">
                                    {{ provider.firstName }} {{ provider.lastName }}
                                </h1>
                                <p class="text-lg text-gray-600">Professional Provider</p>

                                <!-- Status & Rating -->
                                <div class="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <span v-if="provider.isVerified"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <CheckCircleIcon class="w-4 h-4 mr-1" />
                                        Verified Provider
                                    </span>
                                    <div v-if="reviewStats.average > 0"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                        <div class="flex items-center">
                                            <StarIcon class="w-4 h-4 text-yellow-500 mr-1" />
                                            {{ reviewStats.average.toFixed(1) }} ({{ reviewStats.total }})
                                        </div>
                                    </div>
                                    <span
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        {{ provider.experience || 0 }} years experience
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-3">
                            <button v-if="canContact" @click="initiateChat"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <ChatBubbleLeftRightIcon class="w-4 h-4 mr-2" />
                                Send Message
                            </button>

                            <router-link v-if="authStore.isClient"
                                :to="{ name: 'book-appointment', params: { providerId: provider._id } }"
                                class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <CalendarDaysIcon class="w-4 h-4 mr-2" />
                                Book Appointment
                            </router-link>
                        </div>
                    </div>
                </div>

                <!-- Profile Content -->
                <div class="p-6 sm:p-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <!-- Left Column - Main Info -->
                        <div class="lg:col-span-2 space-y-8">

                            <!-- Specializations -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <LightBulbIcon class="w-5 h-5 mr-2 text-blue-600" />
                                    Specializations
                                </h2>
                                <div v-if="provider.specializations?.length > 0" class="flex flex-wrap gap-3">
                                    <span v-for="spec in provider.specializations" :key="spec"
                                        class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        {{ spec }}
                                    </span>
                                </div>
                                <div v-else class="text-gray-500">No specializations listed</div>
                            </div>

                            <!-- About (Bio) -->
                            <div v-if="provider.bio" class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <UserIcon class="w-5 h-5 mr-2 text-purple-600" />
                                    About
                                </h2>
                                <div class="prose max-w-none">
                                    <p class="text-gray-700 leading-relaxed">{{ decodedBio }}</p>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <BookOpenIcon class="w-5 h-5 mr-2 text-green-600" />
                                    Education
                                </h2>
                                <div v-if="provider.education?.length > 0" class="space-y-4">
                                    <div v-for="edu in provider.education" :key="`${edu.degree}-${edu.institution}`"
                                        class="border-l-4 border-green-200 pl-4 py-2">
                                        <h3 class="font-medium text-gray-900">{{ edu.degree }}</h3>
                                        <p class="text-gray-600">{{ edu.institution }}</p>
                                        <p class="text-sm text-gray-500">{{ edu.year }}</p>
                                    </div>
                                </div>
                                <div v-else class="text-gray-500">No education information provided</div>
                            </div>

                            <!-- Experience & Languages -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Experience -->
                                <div class="bg-white border border-gray-200 rounded-xl p-6">
                                    <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <BriefcaseIcon class="w-5 h-5 mr-2 text-orange-600" />
                                        Experience
                                    </h2>
                                    <div class="text-center p-4">
                                        <div class="text-3xl font-bold text-orange-600">{{ provider.experience || 0 }}
                                        </div>
                                        <div class="text-sm text-gray-600">Years of Experience</div>
                                    </div>
                                </div>

                                <!-- Languages -->
                                <div class="bg-white border border-gray-200 rounded-xl p-6">
                                    <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <LanguageIcon class="w-5 h-5 mr-2 text-purple-600" />
                                        Languages
                                    </h2>
                                    <div v-if="provider.languages?.length > 0" class="flex flex-wrap gap-2">
                                        <span v-for="language in provider.languages" :key="language"
                                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                            {{ language }}
                                        </span>
                                    </div>
                                    <div v-else class="text-gray-500 text-sm">No languages specified</div>
                                </div>
                            </div>

                            <!-- Reviews -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <StarIcon class="w-5 h-5 mr-2 text-yellow-600" />
                                    Client Reviews
                                </h2>

                                <!-- Rating Summary -->
                                <div v-if="reviewStats.average > 0"
                                    class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <div class="flex">
                                                <StarIcon :class="i <= Math.round(reviewStats.average) ? 'text-yellow-400' : 'text-gray-300'" class="w-6 h-6" />
                                            </div>
                                            <div class="ml-3">
                                                <p class="text-lg font-medium text-gray-900">{{
                                                    reviewStats.average.toFixed(1) }} out of 5</p>
                                                <p class="text-sm text-gray-600">Based on {{ reviewStats.total }}
                                                    reviews</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Individual Reviews -->
                                <div v-if="reviews.length > 0" class="space-y-6">
                                    <div v-for="review in reviews.slice(0, showAllReviews ? reviews.length : 3)"
                                        :key="review._id" class="border-b border-gray-100 pb-6 last:border-b-0">
                                        <div class="flex items-start space-x-4">
                                            <img :src="review.client.profilePicture ? `/api${review.client.profilePicture}` : '/images/user-placeholder.jpg'"
                                                :alt="review.client?.firstName"
                                                class="h-10 w-10 rounded-full object-cover">
                                            <div class="flex-1">
                                                <div class="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p class="font-medium text-gray-900">
                                                            {{ review.client?.firstName }} {{ review.client?.lastName }}
                                                        </p>
                                                        <div class="flex items-center mt-1">
                                                            <div class="flex">
                                                                <StarIcon :class="i <= Math.round(reviewStats.average) ? 'text-yellow-400' : 'text-gray-300'" class="w-4 h-4" />
                                                            </div>
                                                            <span class="ml-2 text-sm text-gray-600">{{
                                                                formatDate(review.createdAt) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p class="text-gray-700 leading-relaxed">{{ review.comment }}</p>

                                                <!-- Provider Response -->
                                                <div v-if="review.providerResponse?.text"
                                                    class="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                                                    <p class="text-sm font-medium text-blue-900 mb-1">Response from {{
                                                        provider.firstName }}</p>
                                                    <p class="text-sm text-blue-800">{{ review.providerResponse.text }}
                                                    </p>
                                                    <p class="text-xs text-blue-600 mt-1">{{
                                                        formatDate(review.providerResponse.respondedAt) }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="reviews.length > 3" class="text-center">
                                        <button @click="showAllReviews = !showAllReviews"
                                            class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                            {{ showAllReviews ? 'Show Less' : `View ${reviews.length - 3} More Reviews`
                                            }}
                                        </button>
                                    </div>
                                </div>

                                <div v-else class="text-center py-8">
                                    <StarIcon class="w-12 h-12 text-gray-300" />
                                    <p class="text-gray-500">No reviews yet</p>
                                    <p class="text-gray-400 text-sm mt-1">Be the first to leave a review!</p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Sidebar Info -->
                        <div class="space-y-6">

                            <!-- Consultation Fee -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6 text-center">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center justify-center">
                                    <CurrencyDollarIcon class="w-5 h-5 mr-2 text-green-600" />
                                    Consultation Fee
                                </h3>
                                <div class="text-3xl font-bold text-green-600 mb-2">{{ formatSessionFee }}</div>
                                <div class="text-sm text-gray-600">per {{ provider.sessionDuration || 60 }} minutes
                                </div>

                                <div class="mt-4 pt-4 border-t border-gray-200">
                                    <router-link v-if="authStore.isClient"
                                        :to="{ name: 'book-appointment', params: { providerId: provider._id } }"
                                        class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        Book Now
                                    </router-link>
                                    <div v-else class="text-sm text-gray-500">
                                        Sign in as a client to book appointments
                                    </div>
                                </div>
                            </div>

                            <!-- Achievements -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <CheckCircleIcon class="w-5 h-5 mr-2 text-yellow-600" />
                                    Achievements
                                </h3>

                                <!-- Achievement Progress -->
                                <div class="mb-4">
                                    <div class="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Earned</span>
                                        <span>{{ earnedAchievements.length }}/{{ totalAchievements }}</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2">
                                        <div class="bg-yellow-500 h-2 rounded-full"
                                            :style="{ width: achievementProgress + '%' }"></div>
                                    </div>
                                </div>

                                <!-- Earned Achievements -->
                                <div v-if="earnedAchievements.length > 0" class="space-y-3">
                                    <div v-for="achievement in earnedAchievements.slice(0, showAllAchievements ? earnedAchievements.length : 4)"
                                        :key="achievement.id"
                                        class="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <div class="flex-shrink-0">
                                            <div
                                                class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                                <CheckCircleIcon class="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                        <div class="flex-1">
                                            <p class="font-medium text-gray-900 text-sm">{{ achievement.name }}</p>
                                            <p class="text-xs text-gray-600">{{ achievement.description }}</p>
                                        </div>
                                    </div>

                                    <div v-if="earnedAchievements.length > 4" class="text-center">
                                        <button @click="showAllAchievements = !showAllAchievements"
                                            class="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
                                            {{ showAllAchievements ? 'Show Less' : `View ${earnedAchievements.length -
                                            4} More` }}
                                        </button>
                                    </div>
                                </div>

                                <div v-else class="text-center py-4">
                                    <p class="text-gray-500 text-sm">No achievements earned yet</p>
                                </div>
                            </div>

                            <!-- Provider Stats -->
                            <div class="bg-gray-50 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Provider Stats</h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Completed Sessions</span>
                                        <span class="font-medium text-gray-900">{{ completedAppointments }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Response Rate</span>
                                        <span class="font-medium text-gray-900">{{ responseRate }}%</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Member Since</span>
                                        <span class="font-medium text-gray-900">{{ formatDateShort(provider.createdAt)
                                            }}</span>
                                    </div>
                                    <div v-if="provider.lastLoginAt" class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Last Active</span>
                                        <span class="font-medium text-gray-900">{{
                                            formatRelativeTime(provider.lastLoginAt) }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Similar Providers -->
                            <div v-if="similarProviders.length > 0"
                                class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Similar Providers</h3>
                                <div class="space-y-3">
                                    <div v-for="similar in similarProviders.slice(0, 3)" :key="similar._id"
                                        class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <img :src="similar.profilePicture ? `/api${similar.profilePicture}` : '/images/user-placeholder.jpg'"
                                            :alt="similar.firstName" class="h-10 w-10 rounded-full object-cover">
                                        <div class="flex-1">
                                            <p class="font-medium text-gray-900 text-sm">{{ similar.firstName }} {{
                                                similar.lastName }}</p>
                                            <p class="text-xs text-gray-600">{{ similar.specializations?.[0] }}</p>
                                        </div>
                                        <router-link :to="`/providers/${similar._id}`"
                                            class="text-indigo-600 hover:text-indigo-700 text-xs font-medium">
                                            View
                                        </router-link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="text-center py-8">
            <p class="text-gray-500">Provider not found</p>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon, StarIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon, LightBulbIcon, UserIcon, BookOpenIcon, BriefcaseIcon, LanguageIcon, CurrencyDollarIcon, DevicePhoneMobileIcon } from "@heroicons/vue/24/outline";
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const route = useRoute()
const authStore = useAuthStore()

// Reactive data
const provider = ref(null)
const reviews = ref([])
const reviewStats = ref({ average: 0, total: 0 })
const achievements = ref([])
const similarProviders = ref([])
const loading = ref(true)
const showAllReviews = ref(false)
const showAllAchievements = ref(false)
const showEmergencyContact = ref(false)
const completedAppointments = ref(0)
const responseRate = ref(0) // This would come from backend analytics

// Computed properties
const canContact = computed(() => {
    return authStore.isAuthenticated && authStore.user?.id !== provider.value?._id
})

const earnedAchievements = computed(() =>
    achievements.value.filter(a => a.isEarned)
)

const totalAchievements = computed(() => achievements.value.length)

const achievementProgress = computed(() => {
    if (totalAchievements.value === 0) return 0
    return Math.round((earnedAchievements.value.length / totalAchievements.value) * 100)
})

const formatSessionFee = computed(() => {
    if (!provider.value?.sessionFee) return 'Contact for Pricing'
    return `${provider.value.sessionFee.toLocaleString()} UZS`
})

const decodedBio = computed(() => {
    if (!provider.value?.bio) return ''
    try {
        return decodeURIComponent(provider.value.bio)
    } catch {
        return provider.value.bio
    }
})

// Methods
const fetchProviderProfile = async () => {
    try {
        const response = await axios.get(`/users/${route.params.id}`)
        provider.value = response.data
    } catch (error) {
        console.error('Error fetching provider profile:', error)
    }
}

const fetchProviderReviews = async () => {
    try {
        const response = await axios.get(`/reviews/provider/${route.params.id}`)
        reviews.value = response.data.reviews || []
        reviewStats.value = response.data.statistics || { average: 0, total: 0 }
    } catch (error) {
        console.error('Error fetching reviews:', error)
    }
}

const fetchProviderAchievements = async () => {
    try {
        const response = await axios.get(`/users/${route.params.id}/achievements`)
        achievements.value = response.data.achievements?.all || []
    } catch (error) {
        console.error('Error fetching achievements:', error)
    }
}

const fetchSimilarProviders = async () => {
    try {
        if (!provider.value?.specializations?.length) return

        const response = await axios.get('/users/providers', {
            params: {
                specialization: provider.value.specializations[0],
                limit: 6
            }
        })

        // Filter out current provider
        similarProviders.value = (response.data.providers || [])
            .filter(p => p._id !== provider.value._id)
            .slice(0, 3)
    } catch (error) {
        console.error('Error fetching similar providers:', error)
    }
}

const fetchCompletedAppointments = async () => {
    try {
        const response = await axios.get(`/appointments/provider/${route.params.id}/stats`)
        completedAppointments.value = response.data.completedAppointments || 0
    } catch (error) {
        console.error('Error fetching appointment stats:', error)
    }
}

const initiateChat = async () => {
    try {
        // Create or get existing conversation
        const response = await axios.post('/chat/conversations', {
            participantId: provider.value._id
        })

        // Navigate to chat (assuming you have a chat route)
        // router.push(`/chat/${response.data.conversationId}`)
        // console.log('Chat initiated:', response.data)
    } catch (error) {
        console.error('Error initiating chat:', error)
    }
}

// Utility functions
const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const formatDateShort = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    })
}

const formatRelativeTime = (date) => {
    if (!date) return 'N/A'
    const now = new Date()
    const past = new Date(date)
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDateShort(date)
}

// Lifecycle
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            fetchProviderProfile(),
            fetchProviderReviews(),
            fetchProviderAchievements(),
            fetchCompletedAppointments()
        ])

        // Fetch similar providers after we have the main provider data
        if (provider.value) {
            await fetchSimilarProviders()
        }
    } catch (error) {
        console.error('Error loading provider data:', error)
    } finally {
        loading.value = false
    }
})
</script>