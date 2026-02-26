<template>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">{{ $t('clientProfile.loading') }}</p>
        </div>

        <template v-else-if="student">
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <!-- Profile Header -->
                <div class="p-6 sm:p-8 border-b border-gray-200">
                    <div class="flex flex-col sm:flex-row items-center justify-between">
                        <div class="flex flex-col sm:flex-row items-center">
                            <img :src="student.profilePicture ? `/api${student.profilePicture}` : '/images/user-placeholder.jpg'"
                                :alt="student.firstName" class="h-24 w-24 rounded-full object-cover" />
                            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                                <h1 class="text-2xl font-bold text-gray-900">
                                    {{ student.firstName }} {{ student.lastName }}
                                </h1>
                                <p class="text-lg text-gray-600">{{ $t('clientProfile.student') }}</p>

                                <!-- Student status Indicators -->
                                <div class="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <span v-if="student.isVerified"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <CheckCircleIcon class="w-4 h-4 mr-1" />
                                        {{ $t('clientProfile.verifiedStudent') }}
                                    </span>
                                    <span
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        <CalendarDaysIcon class="w-4 h-4 mr-1" />
                                        {{ $t('clientProfile.sessionsCompleted', { count: completedSessions }) }}
                                    </span>
                                    <span v-if="relationshipType"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                        <UsersIcon class="w-4 h-4 mr-1" />
                                        {{ relationshipType }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-3">
                            <button v-if="canContact" @click="initiateChat"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <ChatBubbleLeftRightIcon class="w-4 h-4 mr-2" />
                                {{ $t('clientProfile.sendMessage') }}
                            </button>

                            <button v-if="canAddAsStudent" @click="addAsStudent"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <UserPlusIcon class="w-4 h-4 mr-2" />
                                {{ $t('clientProfile.addAsStudent') }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Profile Content -->
                <div class="p-6 sm:p-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <!-- Left Column - Main Info -->
                        <div class="lg:col-span-2 space-y-8">

                            <!-- Student Overview -->
                            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <UserIcon class="w-5 h-5 mr-2 text-blue-600" />
                                    {{ $t('clientProfile.studentInfo') }}
                                </h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt class="text-sm font-medium text-blue-700">{{ $t('clientProfile.memberSince')
                                            }}</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{ formatDate(student.createdAt) }}
                                        </dd>
                                    </div>
                                    <div v-if="student.lastLoginAt">
                                        <dt class="text-sm font-medium text-blue-700">{{ $t('clientProfile.lastActive')
                                            }}</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{
                                            formatRelativeTime(student.lastLoginAt) }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-blue-700">{{
                                            $t('clientProfile.learningStatus') }}</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{ $t('clientProfile.activeStudent')
                                            }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-blue-700">{{
                                            $t('clientProfile.sessionsCompletedLabel') }}</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{ completedSessions }}</dd>
                                    </div>
                                </div>

                                <!-- Relationship Context (if viewing as provider) -->
                                <div v-if="showRelationshipContext"
                                    class="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                                    <h3 class="text-sm font-medium text-blue-900 mb-2">{{
                                        $t('clientProfile.yourRelationship') }}</h3>
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-blue-700">{{ $t('clientProfile.sessionsTogether')
                                                }}:</span>
                                            <span class="font-medium text-blue-900 ml-1">{{
                                                sessionsWithViewer }}</span>
                                        </div>
                                        <div>
                                            <span class="text-blue-700">{{ $t('clientProfile.lastSession') }}:</span>
                                            <span class="font-medium text-blue-900 ml-1">{{
                                                formatDate(lastSessionDate) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Achievements -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <CheckCircleIcon class="w-5 h-5 mr-2 text-yellow-600" />
                                    {{ $t('clientProfile.achievements') }}
                                </h2>

                                <!-- Achievement progress -->
                                <div class="mb-6">
                                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>{{ $t('clientProfile.progress') }}</span>
                                        <span>{{ earnedAchievements.length }}/{{ totalAchievements }}</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                                            :style="{ width: achievementProgress + '%' }"></div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">{{ $t('clientProfile.percentComplete', {
                                        percent: achievementProgress }) }}</p>
                                </div>

                                <!-- Earned achievements -->
                                <div v-if="earnedAchievements.length > 0" class="space-y-4 mb-6">
                                    <h3 class="text-sm font-medium text-gray-700">{{
                                        $t('clientProfile.earnedAchievements') }}</h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="achievement in earnedAchievements" :key="achievement.id"
                                            class="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div class="flex-shrink-0">
                                                <div
                                                    class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                                    <CheckCircleIcon class="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <p class="font-medium text-gray-900">{{ achievement.name }}</p>
                                                <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                                                <p class="text-xs text-gray-500 mt-1">{{ $t('clientProfile.earned') }}
                                                    {{
                                                        formatDate(achievement.earnedAt) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Unearned Achievements preview -->
                                <div v-if="unearnedAchievements.length > 0" class="space-y-4">
                                    <h3 class="text-sm font-medium text-gray-700">{{ $t('clientProfile.nextGoals') }}
                                    </h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="achievement in unearnedAchievements.slice(0, 4)"
                                            :key="achievement.id"
                                            class="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div class="flex-shrink-0">
                                                <div
                                                    class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <LockClosedIcon class="w-5 h-5 text-gray-500" />
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <p class="font-medium text-gray-700">{{ achievement.name }}</p>
                                                <p class="text-sm text-gray-500">{{ achievement.requirements }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="unearnedAchievements.length > 4" class="text-center">
                                        <button @click="showAllAchievements = !showAllAchievements"
                                            class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                            {{ showAllAchievements ? $t('clientProfile.showLess') :
                                                $t('clientProfile.viewMoreGoals', {
                                                    count: unearnedAchievements.length - 4
                                            })
                                            }}
                                        </button>
                                    </div>
                                </div>

                                <div v-if="totalAchievements === 0" class="text-center py-8">
                                    <CheckCircleIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p class="text-gray-500">{{ $t('clientProfile.noAchievements') }}</p>
                                </div>
                            </div>

                            <!-- Reviews given -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <StarIcon class="w-5 h-5 mr-2 text-purple-600" />
                                    {{ $t('clientProfile.reviewsGiven') }}
                                </h2>

                                <div v-if="reviews.length > 0" class="space-y-6">
                                    <div v-for="review in reviews.slice(0, showAllReviews ? reviews.length : 3)"
                                        :key="review._id" class="border-l-4 border-purple-200 pl-4 py-2">
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="flex items-center space-x-2">
                                                <div class="flex">
                                                    <StarIcon v-for="i in 5" :key="i"
                                                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                                                        class="w-4 h-4" />
                                                </div>
                                                <span class="text-sm text-gray-600">{{ formatDate(review.createdAt)
                                                }}</span>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-900 mb-2 leading-relaxed">{{ review.comment }}</p>
                                        <p class="text-xs text-gray-500">
                                            {{ $t('clientProfile.forProvider', {
                                                name: `${review.provider?.firstName ||
                                                    ''} ${review.provider?.lastName || ''}` }) }}
                                        </p>
                                    </div>

                                    <div v-if="reviews.length > 3" class="text-center">
                                        <button @click="showAllReviews = !showAllReviews"
                                            class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                            {{ showAllReviews ? $t('clientProfile.showLess') :
                                                $t('clientProfile.viewMoreReviews', { count: reviews.length - 3 })
                                            }}
                                        </button>
                                    </div>
                                </div>

                                <div v-else class="text-center py-8">
                                    <StarIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p class="text-gray-500">{{ $t('clientProfile.noReviews') }}</p>
                                    <p class="text-gray-400 text-sm mt-1">{{ $t('clientProfile.noReviewsDesc') }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Sidebar Info -->
                        <div class="space-y-6">

                            <!-- Learning Stats -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <ChartBarIcon class="w-5 h-5 mr-2 text-indigo-600" />
                                    {{ $t('clientProfile.learningProgress') }}
                                </h3>

                                <div class="space-y-4">
                                    <div class="bg-indigo-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-indigo-600">{{ completedSessions }}</div>
                                        <div class="text-sm text-indigo-600">{{
                                            $t('clientProfile.sessionsCompletedLabel') }}</div>
                                    </div>
                                    <div class="bg-green-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-green-600">{{ earnedAchievements.length }}
                                        </div>
                                        <div class="text-sm text-green-600">{{ $t('clientProfile.achievementsEarned') }}
                                        </div>
                                    </div>
                                    <div class="bg-purple-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-purple-600">{{ reviews.length }}</div>
                                        <div class="text-sm text-purple-600">{{ $t('clientProfile.reviewsGiven') }}
                                        </div>
                                    </div>
                                    <div class="bg-yellow-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-yellow-600">{{ providersWorkedWith }}</div>
                                        <div class="text-sm text-yellow-600">{{ $t('clientProfile.providersWorkedWith')
                                            }}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent activity -->
                            <div class="bg-gray-50 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('clientProfile.recentActivity')
                                    }}</h3>
                                <div class="space-y-3">
                                    <div v-if="recentActivity.length > 0">
                                        <div v-for="activity in recentActivity" :key="activity.id"
                                            class="flex items-start space-x-3 text-sm">
                                            <div class="flex-shrink-0">
                                                <div :class="getActivityIconClass(activity.type)"
                                                    class="w-6 h-6 rounded-full flex items-center justify-center">
                                                    <CheckCircleIcon v-if="activity.type === 'achievement'"
                                                        class="w-3 h-3 text-white" />
                                                    <StarIcon v-else-if="activity.type === 'review'"
                                                        class="w-3 h-3 text-white" />
                                                    <CalendarDaysIcon v-else class="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-gray-900">{{ activity.description }}</p>
                                                <p class="text-gray-500 text-xs">{{
                                                    formatRelativeTime(activity.timestamp) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="text-center py-4">
                                        <p class="text-gray-500 text-sm">{{ $t('clientProfile.noActivity') }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Learning Journey -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <ArrowTrendingUpIcon class="w-5 h-5 mr-2 text-blue-600" />
                                    {{ $t('clientProfile.learningJourney') }}
                                </h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">{{ $t('clientProfile.startedLearning')
                                            }}</span>
                                        <span class="font-medium text-gray-900">{{ formatDateShort(student.createdAt)
                                        }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">{{ $t('clientProfile.activeDays') }}</span>
                                        <span class="font-medium text-gray-900">{{ activeDays }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">{{ $t('clientProfile.learningStreak')
                                            }}</span>
                                        <span class="font-medium text-gray-900">{{ $t('clientProfile.days', {
                                            count:
                                            learningStreak }) }}</span>
                                    </div>
                                    <div v-if="authStore.isProvider" class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">{{ $t('clientProfile.sessionsWithYou')
                                            }}</span>
                                        <span class="font-medium text-gray-900">{{ sessionsWithViewer }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="text-center py-8">
            <p class="text-gray-500">{{ $t('clientProfile.notFound') }}</p>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon, CalendarDaysIcon, UsersIcon, ChatBubbleLeftRightIcon, UserIcon, LockClosedIcon, StarIcon, ChartBarIcon, DevicePhoneMobileIcon, ArrowTrendingUpIcon, UserPlusIcon } from "@heroicons/vue/24/outline";
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import { useGlobals } from '@/plugins/globals'

const { t } = useI18n()
const { toast, uploadsUrl, modal } = useGlobals()

const route = useRoute()
const authStore = useAuthStore()

// Reactive data
const student = ref(null)
const achievements = ref([])
const reviews = ref([])
const recentActivity = ref([])
const loading = ref(true)
const showAllAchievements = ref(false)
const showAllReviews = ref(false)
const showEmergencyContact = ref(false)
const showRelationshipContext = ref(false)
const completedSessions = ref(0)
const activeDays = ref(0)
const learningStreak = ref(0)
const providersWorkedWith = ref(0)
const sessionsWithViewer = ref(0)
const lastSessionDate = ref(null)

// Computed properties
const canContact = computed(() => {
    return authStore.isAuthenticated && authStore.user?.id !== student.value?._id
})

const canAddAsStudent = computed(() => {
    return authStore.isProvider && authStore.user?.id !== student.value?._id
})

const relationshipType = computed(() => {
    if (!authStore.isAuthenticated || authStore.user?.id === student.value?._id) return null

    if (authStore.isProvider) {
        return sessionsWithViewer.value > 0 ? t('clientProfile.yourStudent') : t('clientProfile.potentialStudent')
    } else if (authStore.isClient) {
        return t('clientProfile.fellowStudent')
    }
    return null
})

const earnedAchievements = computed(() =>
    achievements.value.filter(a => a.isEarned)
)

const unearnedAchievements = computed(() =>
    achievements.value.filter(a => !a.isEarned)
)

const totalAchievements = computed(() => achievements.value.length)

const achievementProgress = computed(() => {
    if (totalAchievements.value === 0) return 0
    return Math.round((earnedAchievements.value.length / totalAchievements.value) * 100)
})

// Methods
const fetchStudentProfile = async () => {
    try {
        const response = await axios.get(`/users/${route.params.id}`)
        student.value = response.data

        // If viewer is a provider, check relationship context
        if (authStore.isProvider) {
            await checkProviderRelationship()
        }
    } catch (error) {
        console.error('Error fetching student profile:', error)
    }
}

const fetchStudentAchievements = async () => {
    try {
        const response = await axios.get(`/users/${route.params.id}/achievements`)
        achievements.value = response.data.achievements?.all || []
    } catch (error) {
        console.error('Error fetching achievements:', error)
    }
}

const fetchStudentReviews = async () => {
    try {
        const response = await axios.get(`/reviews/client/${route.params.id}`)
        reviews.value = response.data.reviews || []
    } catch (error) {
        console.error('Error fetching reviews:', error)
    }
}

const fetchStudentStats = async () => {
    try {
        const response = await axios.get(`/appointments/provider/${route.params.id}/stats`)
        completedSessions.value = response.data.completedAppointments || 0

        // Get detailed appointment data
        const appointmentsResponse = await axios.get(`/appointments/provider/${route.params.id}`)
        const appointments = appointmentsResponse.data.appointments || []

        // Calculate unique days with appointments
        const uniqueDays = new Set(
            appointments
                .filter(a => a.status === 'completed')
                .map(a => new Date(a.dateTime).toDateString())
        )
        activeDays.value = uniqueDays.size

        // Calculate unique providers worked with
        const uniqueProviders = new Set(
            appointments
                .filter(a => a.status === 'completed')
                .map(a => a.provider._id)
        )
        providersWorkedWith.value = uniqueProviders.size

        // Calculate learning streak (simplified)
        learningStreak.value = calculateLearningStreak(appointments)
    } catch (error) {
        console.error('Error fetching student stats:', error)
    }
}

const checkProviderRelationship = async () => {
    try {
        const response = await axios.get(`/appointments/all`)
        const appointments = response.data.appointments || []

        // Filter appointments with this specific student
        const studentAppointments = appointments.filter(a =>
            a.client._id === route.params.id && a.status === 'completed'
        )

        if (studentAppointments.length > 0) {
            showRelationshipContext.value = true
            sessionsWithViewer.value = studentAppointments.length
            lastSessionDate.value = studentAppointments
                .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0]?.dateTime
        }
    } catch (error) {
        console.error('Error checking provider relationship:', error)
    }
}
const fetchRecentActivity = async () => {
    try {
        const res = await axios.get(`/appointments/user/${route.params.id}`)
        const appointments = res.data.appointments || []

        recentActivity.value = appointments
            .filter(a => a.status === 'completed')
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
            .slice(0, 5)
            .map((a, i) => ({
                id: i,
                type: 'appointment',
                description: `Completed session with ${a.provider?.firstName || 'a provider'}`,
                timestamp: a.dateTime
            }))
    } catch {
        recentActivity.value = []
    }
}

const calculateLearningStreak = (appointments) => {
    const completedAppointments = appointments
        .filter(a => a.status === 'completed')
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))

    if (completedAppointments.length === 0) return 0

    let streak = 1
    const today = new Date()
    let currentDate = new Date(completedAppointments[0].dateTime)

    for (let i = 1; i < completedAppointments.length; i++) {
        const appointmentDate = new Date(completedAppointments[i].dateTime)
        const daysDiff = Math.floor((currentDate - appointmentDate) / (1000 * 60 * 60 * 24))

        if (daysDiff <= 7) {
            streak++
            currentDate = appointmentDate
        } else {
            break
        }
    }

    return streak
}

const initiateChat = async () => {
    try {
        const response = await axios.post('/chat/conversations', {
            participantId: student.value._id
        })
    } catch (error) {
        console.error('Error initiating chat:', error)
    }
}

const addAsStudent = async () => {
    try {
        await axios.post('/users/students', {
            studentId: student.value._id
        })
        toast.error(t('clientProfile.studentAdded'))
    } catch (error) {
        console.error('Error adding student:', error)
        toast.error(t('clientProfile.addStudentError'))
    }
}

// Utility functions
const formatDate = (date) => {
    if (!date) return t('earnings.notAvailable')
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

const formatDateShort = (date) => {
    if (!date) return t('earnings.notAvailable')
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    })
}

const formatRelativeTime = (date) => {
    if (!date) return t('earnings.notAvailable')
    const now = new Date()
    const past = new Date(date)
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60))

    if (diffInHours < 1) return t('clientProfile.justNow')
    if (diffInHours < 24) return t('clientProfile.hoursAgo', { hours: diffInHours })
    if (diffInHours < 168) return t('clientProfile.daysAgo', { days: Math.floor(diffInHours / 24) })
    return formatDateShort(date)
}

const getActivityIconClass = (type) => {
    const classes = {
        'achievement': 'bg-yellow-500',
        'review': 'bg-purple-500',
        'session': 'bg-blue-500'
    }
    return classes[type] || 'bg-gray-500'
}

// Lifecycle
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            fetchStudentProfile(),
            fetchStudentAchievements(),
            fetchStudentReviews(),
            fetchStudentStats(),
            fetchRecentActivity()
        ])
    } catch (error) {
        console.error('Error loading student data:', error)
    } finally {
        loading.value = false
    }
})
</script>