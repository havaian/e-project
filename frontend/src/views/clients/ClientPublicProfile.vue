<template>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-2 text-gray-600">Loading student profile...</p>
        </div>

        <template v-else-if="student">
            <div class="bg-white shadow rounded-lg overflow-hidden">
                <template>
                    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div v-if="loading" class="text-center py-8">
                            <div
                                class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
                            </div>
                            <p class="mt-2 text-gray-600">Loading client profile...</p>
                        </div>

                        <template v-else-if="client">
                            <div class="bg-white shadow rounded-lg overflow-hidden">
                                <!-- Profile Header -->
                                <div class="p-6 sm:p-8 border-b border-gray-200">
                                    <div class="flex flex-col sm:flex-row items-center justify-between">
                                        <div class="flex flex-col sm:flex-row items-center">
                                            <img :src="`/api${client.profilePicture}`"
                                                :alt="client.firstName" class="h-24 w-24 rounded-full object-cover" />
                                            <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                                                <h1 class="text-2xl font-bold text-gray-900">
                                                    {{ client.firstName }} {{ client.lastName }}
                                                </h1>
                                                <p class="text-lg text-gray-600">Client</p>

                                                <!-- Client Status Indicators -->
                                                <div class="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                                                    <span v-if="client.isVerified"
                                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Verified Client
                                                    </span>
                                                    <span
                                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {{ completedSessions }} Sessions Completed
                                                    </span>
                                                    <span v-if="relationshipType"
                                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                                stroke-width="2"
                                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        {{ relationshipType }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Action Buttons -->
                                        <div class="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-3">
                                            <button v-if="canContact" @click="initiateChat"
                                                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                Send Message
                                            </button>

                                            <button v-if="canBookAppointment" @click="bookAppointment"
                                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                Book Appointment
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Profile Content -->
                                <div class="p-6 sm:p-8">
                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                        <!-- Left Column - Main Info -->
                                        <div class="lg:col-span-2 space-y-8">

                                            <!-- Client Overview -->
                                            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Client Information
                                                </h2>
                                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <dt class="text-sm font-medium text-blue-700">Member Since</dt>
                                                        <dd class="mt-1 text-blue-900 font-medium">{{
                                                            formatDate(client.createdAt) }}</dd>
                                                    </div>
                                                    <div v-if="client.lastLoginAt">
                                                        <dt class="text-sm font-medium text-blue-700">Last Active</dt>
                                                        <dd class="mt-1 text-blue-900 font-medium">{{
                                                            formatRelativeTime(client.lastLoginAt) }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-sm font-medium text-blue-700">Client Status</dt>
                                                        <dd class="mt-1 text-blue-900 font-medium">{{ client.isActive ?
                                                            'Active' : 'Inactive' }}</dd>
                                                    </div>
                                                    <div>
                                                        <dt class="text-sm font-medium text-blue-700">Sessions Completed
                                                        </dt>
                                                        <dd class="mt-1 text-blue-900 font-medium">{{ completedSessions
                                                            }}</dd>
                                                    </div>
                                                </div>

                                                <!-- Relationship Context (if viewing as provider) -->
                                                <div v-if="showRelationshipContext"
                                                    class="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                                                    <h3 class="text-sm font-medium text-blue-900 mb-2">Your Professional
                                                        Relationship</h3>
                                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span class="text-blue-700">Sessions Together:</span>
                                                            <span class="font-medium text-blue-900 ml-1">{{
                                                                sessionsWithViewer }}</span>
                                                        </div>
                                                        <div>
                                                            <span class="text-blue-700">Last Session:</span>
                                                            <span class="font-medium text-blue-900 ml-1">{{
                                                                formatDate(lastSessionDate) }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Achievements -->
                                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                    <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Achievements
                                                </h2>

                                                <!-- Achievement Progress -->
                                                <div class="mb-6">
                                                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                                                        <span>Progress</span>
                                                        <span>{{ earnedAchievements.length }}/{{ totalAchievements
                                                            }}</span>
                                                    </div>
                                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                                        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                                                            :style="{ width: achievementProgress + '%' }"></div>
                                                    </div>
                                                    <p class="text-xs text-gray-500 mt-1">{{ achievementProgress }}%
                                                        Complete</p>
                                                </div>

                                                <!-- Earned Achievements -->
                                                <div v-if="earnedAchievements.length > 0" class="space-y-4 mb-6">
                                                    <h3 class="text-sm font-medium text-gray-700">Earned Achievements
                                                    </h3>
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div v-for="achievement in earnedAchievements"
                                                            :key="achievement.id"
                                                            class="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                            <div class="flex-shrink-0">
                                                                <div
                                                                    class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                                                    <svg class="w-5 h-5 text-white" fill="none"
                                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round"
                                                                            stroke-linejoin="round" stroke-width="2"
                                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div class="flex-1">
                                                                <p class="font-medium text-gray-900">{{ achievement.name
                                                                    }}</p>
                                                                <p class="text-sm text-gray-600">{{
                                                                    achievement.description }}</p>
                                                                <p class="text-xs text-gray-500 mt-1">Earned {{
                                                                    formatDate(achievement.earnedAt) }}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Unearned Achievements Preview -->
                                                <div v-if="unearnedAchievements.length > 0" class="space-y-4">
                                                    <h3 class="text-sm font-medium text-gray-700">Available Achievements
                                                    </h3>
                                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div v-for="achievement in unearnedAchievements.slice(0, 4)"
                                                            :key="achievement.id"
                                                            class="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                                            <div class="flex-shrink-0">
                                                                <div
                                                                    class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                                    <svg class="w-5 h-5 text-gray-500" fill="none"
                                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round"
                                                                            stroke-linejoin="round" stroke-width="2"
                                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div class="flex-1">
                                                                <p class="font-medium text-gray-700">{{ achievement.name
                                                                    }}</p>
                                                                <p class="text-sm text-gray-500">{{
                                                                    achievement.requirements }}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div v-if="unearnedAchievements.length > 4" class="text-center">
                                                        <button @click="showAllAchievements = !showAllAchievements"
                                                            class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                                            {{ showAllAchievements ? 'Show Less' : `View
                                                            ${unearnedAchievements.length - 4} More Goals` }}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div v-if="totalAchievements === 0" class="text-center py-8">
                                                    <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p class="text-gray-500">No achievements available</p>
                                                </div>
                                            </div>

                                            <!-- Reviews Given -->
                                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                    <svg class="w-5 h-5 mr-2 text-purple-600" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    Reviews Given
                                                </h2>

                                                <div v-if="reviews.length > 0" class="space-y-6">
                                                    <div v-for="review in reviews.slice(0, showAllReviews ? reviews.length : 3)"
                                                        :key="review._id"
                                                        class="border-l-4 border-purple-200 pl-4 py-2">
                                                        <div class="flex items-center justify-between mb-2">
                                                            <div class="flex items-center space-x-2">
                                                                <div class="flex">
                                                                    <svg v-for="i in 5" :key="i"
                                                                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                                                                        class="w-4 h-4" fill="currentColor"
                                                                        viewBox="0 0 20 20">
                                                                        <path
                                                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                    </svg>
                                                                </div>
                                                                <span class="text-sm text-gray-600">{{
                                                                    formatDate(review.createdAt) }}</span>
                                                            </div>
                                                        </div>
                                                        <p class="text-sm text-gray-900 mb-2 leading-relaxed">{{
                                                            review.comment }}</p>
                                                        <p class="text-xs text-gray-500">
                                                            For {{ review.provider?.firstName }} {{
                                                            review.provider?.lastName }}
                                                        </p>
                                                    </div>

                                                    <div v-if="reviews.length > 3" class="text-center">
                                                        <button @click="showAllReviews = !showAllReviews"
                                                            class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                                            {{ showAllReviews ? 'Show Less' : `View ${reviews.length -
                                                            3} More Reviews` }}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div v-else class="text-center py-8">
                                                    <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                    <p class="text-gray-500">No reviews given yet</p>
                                                    <p class="text-gray-400 text-sm mt-1">Reviews will appear here after
                                                        completing sessions</p>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Right Column - Sidebar Info -->
                                        <div class="space-y-6">

                                            <!-- Client Stats -->
                                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                    <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                                                    </svg>
                                                    Client Statistics
                                                </h3>

                                                <div class="space-y-4">
                                                    <div class="bg-indigo-50 p-4 rounded-lg">
                                                        <div class="text-2xl font-bold text-indigo-600">{{
                                                            completedSessions }}</div>
                                                        <div class="text-sm text-indigo-600">Sessions Completed</div>
                                                    </div>
                                                    <div class="bg-green-50 p-4 rounded-lg">
                                                        <div class="text-2xl font-bold text-green-600">{{
                                                            earnedAchievements.length }}</div>
                                                        <div class="text-sm text-green-600">Achievements Earned</div>
                                                    </div>
                                                    <div class="bg-purple-50 p-4 rounded-lg">
                                                        <div class="text-2xl font-bold text-purple-600">{{
                                                            reviews.length }}</div>
                                                        <div class="text-sm text-purple-600">Reviews Given</div>
                                                    </div>
                                                    <div class="bg-yellow-50 p-4 rounded-lg">
                                                        <div class="text-2xl font-bold text-yellow-600">{{
                                                            providersWorkedWith }}</div>
                                                        <div class="text-sm text-yellow-600">Providers Worked With</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Contact Info (Emergency Contact if applicable) -->
                                            <div v-if="showEmergencyContact && client.emergencyContact?.name"
                                                class="bg-white border border-gray-200 rounded-xl p-6">
                                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                    <svg class="w-5 h-5 mr-2 text-red-600" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    Emergency Contact
                                                </h3>
                                                <div class="space-y-2 text-sm">
                                                    <p class="font-medium text-gray-900">{{ client.emergencyContact.name
                                                        }}</p>
                                                    <p class="text-gray-600">{{ client.emergencyContact.relationship }}
                                                    </p>
                                                    <p class="text-gray-600">{{ client.emergencyContact.phone }}</p>
                                                </div>
                                                <div class="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                                                    Only visible because you have appointments together
                                                </div>
                                            </div>

                                            <!-- Recent Activity -->
                                            <div class="bg-gray-50 rounded-xl p-6">
                                                <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                                <div class="space-y-3">
                                                    <div v-if="recentActivity.length > 0">
                                                        <div v-for="activity in recentActivity" :key="activity.id"
                                                            class="flex items-start space-x-3 text-sm">
                                                            <div class="flex-shrink-0">
                                                                <div :class="getActivityIconClass(activity.type)"
                                                                    class="w-6 h-6 rounded-full flex items-center justify-center">
                                                                    <svg class="w-3 h-3 text-white" fill="none"
                                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path stroke-linecap="round"
                                                                            stroke-linejoin="round" stroke-width="2"
                                                                            :d="getActivityIconPath(activity.type)" />
                                                                    </svg>
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
                                                        <p class="text-gray-500 text-sm">No recent activity</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Client Journey -->
                                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none"
                                                        stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                    </svg>
                                                    Client Journey
                                                </h3>
                                                <div class="space-y-3">
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-sm text-gray-600">Joined Platform</span>
                                                        <span class="font-medium text-gray-900">{{
                                                            formatDateShort(client.createdAt) }}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-sm text-gray-600">Active Days</span>
                                                        <span class="font-medium text-gray-900">{{ activeDays }}</span>
                                                    </div>
                                                    <div class="flex justify-between items-center">
                                                        <span class="text-sm text-gray-600">Engagement Level</span>
                                                        <span class="font-medium text-gray-900">{{ engagementLevel
                                                            }}</span>
                                                    </div>
                                                    <div v-if="authStore.isProvider"
                                                        class="flex justify-between items-center">
                                                        <span class="text-sm text-gray-600">Sessions with You</span>
                                                        <span class="font-medium text-gray-900">{{ sessionsWithViewer
                                                            }}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <div v-else class="text-center py-8">
                            <p class="text-gray-500">Client profile not found</p>
                        </div>
                    </div>
                </template>

                <script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const client = ref(null)
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
const providersWorkedWith = ref(0)
const sessionsWithViewer = ref(0)
const lastSessionDate = ref(null)

// Computed properties
const canContact = computed(() => {
  return authStore.isAuthenticated && authStore.user?.id !== client.value?._id
})

const canBookAppointment = computed(() => {
  // Only providers can book appointments with clients, or other clients can refer
  return authStore.isProvider && authStore.user?.id !== client.value?._id
})

const relationshipType = computed(() => {
  if (!authStore.isAuthenticated || authStore.user?.id === client.value?._id) return null
  
  if (authStore.isProvider) {
    return sessionsWithViewer.value > 0 ? 'Your Client' : 'Potential Client'
  } else if (authStore.isClient) {
    return 'Fellow Client'
  }
  return null
})

const engagementLevel = computed(() => {
  if (completedSessions.value >= 10) return 'High'
  if (completedSessions.value >= 5) return 'Medium'
  if (completedSessions.value >= 1) return 'Active'
  return 'New'
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
const fetchClientProfile = async () => {
  try {
    const response = await axios.get(`/users/${route.params.id}`)
    client.value = response.data
    
    // Check if emergency contact should be shown
    if (authStore.isAuthenticated) {
      await checkEmergencyContactVisibility()
    }
    
    // If viewer is a provider, check relationship context
    if (authStore.isProvider) {
      await checkProviderRelationship()
    }
  } catch (error) {
    console.error('Error fetching client profile:', error)
  }
}

const fetchClientAchievements = async () => {
  try {
    const response = await axios.get(`/users/${route.params.id}/achievements`)
    achievements.value = response.data.achievements?.all || []
  } catch (error) {
    console.error('Error fetching achievements:', error)
  }
}

const fetchClientReviews = async () => {
  try {
    const response = await axios.get(`/reviews/client/${route.params.id}`)
    reviews.value = response.data.reviews || []
  } catch (error) {
    console.error('Error fetching reviews:', error)
  }
}

const fetchClientStats = async () => {
  try {
    const response = await axios.get(`/appointments/client/${route.params.id}/stats`)
    completedSessions.value = response.data.completedAppointments || 0
    
    // Get detailed appointment data
    const appointmentsResponse = await axios.get(`/appointments/client/${route.params.id}`)
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
    
  } catch (error) {
    console.error('Error fetching client stats:', error)
  }
}

const checkProviderRelationship = async () => {
  try {
    const response = await axios.get(`/appointments/provider/${authStore.user._id}`)
    const appointments = response.data.appointments || []
    
    // Filter appointments with this specific client
    const clientAppointments = appointments.filter(a => 
      a.client._id === route.params.id && a.status === 'completed'
    )
    
    if (clientAppointments.length > 0) {
      showRelationshipContext.value = true
      sessionsWithViewer.value = clientAppointments.length
      lastSessionDate.value = clientAppointments
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))[0]?.dateTime
    }
  } catch (error) {
    console.error('Error checking provider relationship:', error)
  }
}

const fetchRecentActivity = async () => {
  try {
    // This would come from a dedicated activity endpoint
    recentActivity.value = [
      {
        id: 1,
        type: 'achievement',
        description: 'Earned "First Session" achievement',
        timestamp: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 2,
        type: 'review',
        description: 'Left a review for Dr. Smith',
        timestamp: new Date(Date.now() - 172800000) // 2 days ago
      },
      {
        id: 3,
        type: 'session',
        description: 'Completed session with Dr. Johnson',
        timestamp: new Date(Date.now() - 259200000) // 3 days ago
      }
    ]
  } catch (error) {
    console.error('Error fetching recent activity:', error)
  }
}

const checkEmergencyContactVisibility = async () => {
  try {
    const response = await axios.get(`/users/${route.params.id}/emergency-contact-visibility`)
    showEmergencyContact.value = response.data.visible || false
  } catch (error) {
    showEmergencyContact.value = false
  }
}

const initiateChat = async () => {
  try {
    const response = await axios.post('/chat/conversations', {
      participantId: client.value._id
    })
    // console.log('Chat initiated:', response.data)
    // Navigate to chat interface
    // router.push(`/chat/${response.data.conversationId}`)
  } catch (error) {
    console.error('Error initiating chat:', error)
  }
}

const bookAppointment = () => {
  if (authStore.isProvider) {
    // Navigate to provider's booking interface for this client
    router.push(`/appointments/book-for-client/${route.params.id}`)
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

const getActivityIconClass = (type) => {
  const classes = {
    'achievement': 'bg-yellow-500',
    'review': 'bg-purple-500',
    'session': 'bg-blue-500'
  }
  return classes[type] || 'bg-gray-500'
}

const getActivityIconPath = (type) => {
  const paths = {
    'achievement': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'review': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
    'session': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  }
  return paths[type] || 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchClientProfile(),
      fetchClientAchievements(),
      fetchClientReviews(),
      fetchClientStats(),
      fetchRecentActivity()
    ])
  } catch (error) {
    console.error('Error loading client data:', error)
  } finally {
    loading.value = false
  }
})
</script>

                <!-- Profile Content -->
                <div class="p-6 sm:p-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <!-- Left Column - Main Info -->
                        <div class="lg:col-span-2 space-y-8">

                            <!-- Student Overview -->
                            <div class="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Student Information
                                </h2>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <dt class="text-sm font-medium text-blue-700">Member Since</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{ formatDate(student.createdAt) }}
                                        </dd>
                                    </div>
                                    <div v-if="student.lastLoginAt">
                                        <dt class="text-sm font-medium text-blue-700">Last Active</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{
                                            formatRelativeTime(student.lastLoginAt) }}</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-blue-700">Learning Status</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">Active Student</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-blue-700">Sessions Completed</dt>
                                        <dd class="mt-1 text-blue-900 font-medium">{{ completedSessions }}</dd>
                                    </div>
                                </div>
                            </div>

                            <!-- Achievements -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Achievements
                                </h2>

                                <!-- Achievement Progress -->
                                <div class="mb-6">
                                    <div class="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{{ earnedAchievements.length }}/{{ totalAchievements }}</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-300"
                                            :style="{ width: achievementProgress + '%' }"></div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-1">{{ achievementProgress }}% Complete</p>
                                </div>

                                <!-- Earned Achievements -->
                                <div v-if="earnedAchievements.length > 0" class="space-y-4 mb-6">
                                    <h3 class="text-sm font-medium text-gray-700">Earned Achievements</h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="achievement in earnedAchievements" :key="achievement.id"
                                            class="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div class="flex-shrink-0">
                                                <div
                                                    class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="flex-1">
                                                <p class="font-medium text-gray-900">{{ achievement.name }}</p>
                                                <p class="text-sm text-gray-600">{{ achievement.description }}</p>
                                                <p class="text-xs text-gray-500 mt-1">Earned {{
                                                    formatDate(achievement.earnedAt) }}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Unearned Achievements Preview -->
                                <div v-if="unearnedAchievements.length > 0" class="space-y-4">
                                    <h3 class="text-sm font-medium text-gray-700">Next Goals</h3>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="achievement in unearnedAchievements.slice(0, 4)"
                                            :key="achievement.id"
                                            class="flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                            <div class="flex-shrink-0">
                                                <div
                                                    class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                                    <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
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
                                            {{ showAllAchievements ? 'Show Less' : `View ${unearnedAchievements.length -
                                            4} More Goals`
                                            }}
                                        </button>
                                    </div>
                                </div>

                                <div v-if="totalAchievements === 0" class="text-center py-8">
                                    <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p class="text-gray-500">No achievements available</p>
                                </div>
                            </div>

                            <!-- Reviews Given -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Reviews Given
                                </h2>

                                <div v-if="reviews.length > 0" class="space-y-6">
                                    <div v-for="review in reviews.slice(0, showAllReviews ? reviews.length : 3)"
                                        :key="review._id" class="border-l-4 border-purple-200 pl-4 py-2">
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="flex items-center space-x-2">
                                                <div class="flex">
                                                    <svg v-for="i in 5" :key="i"
                                                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                                                        class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </div>
                                                <span class="text-sm text-gray-600">{{ formatDate(review.createdAt)
                                                    }}</span>
                                            </div>
                                        </div>
                                        <p class="text-sm text-gray-900 mb-2 leading-relaxed">{{ review.comment }}</p>
                                        <p class="text-xs text-gray-500">
                                            For {{ review.provider?.firstName }} {{ review.provider?.lastName }}
                                        </p>
                                    </div>

                                    <div v-if="reviews.length > 3" class="text-center">
                                        <button @click="showAllReviews = !showAllReviews"
                                            class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                                            {{ showAllReviews ? 'Show Less' : `View ${reviews.length - 3} More Reviews`
                                            }}
                                        </button>
                                    </div>
                                </div>

                                <div v-else class="text-center py-8">
                                    <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <p class="text-gray-500">No reviews given yet</p>
                                    <p class="text-gray-400 text-sm mt-1">Reviews will appear here after completing
                                        sessions</p>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column - Sidebar Info -->
                        <div class="space-y-6">

                            <!-- Learning Stats -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                                    </svg>
                                    Learning Progress
                                </h3>

                                <div class="space-y-4">
                                    <div class="bg-indigo-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-indigo-600">{{ completedSessions }}</div>
                                        <div class="text-sm text-indigo-600">Sessions Completed</div>
                                    </div>
                                    <div class="bg-green-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-green-600">{{ earnedAchievements.length }}
                                        </div>
                                        <div class="text-sm text-green-600">Achievements Earned</div>
                                    </div>
                                    <div class="bg-purple-50 p-4 rounded-lg">
                                        <div class="text-2xl font-bold text-purple-600">{{ reviews.length }}</div>
                                        <div class="text-sm text-purple-600">Reviews Given</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Contact Info (Emergency Contact if applicable) -->
                            <div v-if="showEmergencyContact && student.emergencyContact?.name"
                                class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    Emergency Contact
                                </h3>
                                <div class="space-y-2 text-sm">
                                    <p class="font-medium text-gray-900">{{ student.emergencyContact.name }}</p>
                                    <p class="text-gray-600">{{ student.emergencyContact.relationship }}</p>
                                    <p class="text-gray-600">{{ student.emergencyContact.phone }}</p>
                                </div>
                                <div class="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                                    Only visible because you have appointments together
                                </div>
                            </div>

                            <!-- Recent Activity -->
                            <div class="bg-gray-50 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                <div class="space-y-3">
                                    <div v-if="recentActivity.length > 0">
                                        <div v-for="activity in recentActivity" :key="activity.id"
                                            class="flex items-start space-x-3 text-sm">
                                            <div class="flex-shrink-0">
                                                <div :class="getActivityIconClass(activity.type)"
                                                    class="w-6 h-6 rounded-full flex items-center justify-center">
                                                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2" :d="getActivityIconPath(activity.type)" />
                                                    </svg>
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
                                        <p class="text-gray-500 text-sm">No recent activity</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Learning Journey -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Learning Journey
                                </h3>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Started Learning</span>
                                        <span class="font-medium text-gray-900">{{ formatDateShort(student.createdAt)
                                            }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Active Days</span>
                                        <span class="font-medium text-gray-900">{{ activeDays }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600">Learning Streak</span>
                                        <span class="font-medium text-gray-900">{{ learningStreak }} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <div v-else class="text-center py-8">
            <p class="text-gray-500">Student not found</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

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
const completedSessions = ref(0)
const activeDays = ref(0)
const learningStreak = ref(0)

// Computed properties
const canContact = computed(() => {
    return authStore.isAuthenticated && authStore.user?.id !== student.value?._id
})

const canAddAsStudent = computed(() => {
    return authStore.isProvider && authStore.user?.id !== student.value?._id
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

        // Check if emergency contact should be shown
        if (authStore.isAuthenticated) {
            checkEmergencyContactVisibility()
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
        const response = await axios.get(`/appointments/client/${route.params.id}/stats`)
        completedSessions.value = response.data.completedAppointments || 0

        // Calculate active days and learning streak
        const appointmentsResponse = await axios.get(`/appointments/client/${route.params.id}`)
        const appointments = appointmentsResponse.data.appointments || []

        // Calculate unique days with appointments
        const uniqueDays = new Set(
            appointments
                .filter(a => a.status === 'completed')
                .map(a => new Date(a.dateTime).toDateString())
        )
        activeDays.value = uniqueDays.size

        // Calculate learning streak (simplified)
        learningStreak.value = calculateLearningStreak(appointments)
    } catch (error) {
        console.error('Error fetching student stats:', error)
    }
}

const fetchRecentActivity = async () => {
    try {
        // This would come from a dedicated activity endpoint
        recentActivity.value = [
            {
                id: 1,
                type: 'achievement',
                description: 'Earned "First Session" achievement',
                timestamp: new Date(Date.now() - 86400000) // 1 day ago
            },
            {
                id: 2,
                type: 'review',
                description: 'Left a review for Dr. Smith',
                timestamp: new Date(Date.now() - 172800000) // 2 days ago
            },
            {
                id: 3,
                type: 'session',
                description: 'Completed session with Dr. Johnson',
                timestamp: new Date(Date.now() - 259200000) // 3 days ago
            }
        ]
    } catch (error) {
        console.error('Error fetching recent activity:', error)
    }
}

const checkEmergencyContactVisibility = async () => {
    try {
        const response = await axios.get(`/users/${route.params.id}/emergency-contact-visibility`)
        showEmergencyContact.value = response.data.visible || false
    } catch (error) {
        showEmergencyContact.value = false
    }
}

const calculateLearningStreak = (appointments) => {
    // Simplified calculation - in reality this would be more sophisticated
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

        if (daysDiff <= 7) { // Within a week
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
        // console.log('Chat initiated:', response.data)
    } catch (error) {
        console.error('Error initiating chat:', error)
    }
}

const addAsStudent = async () => {
    try {
        await axios.post('/users/students', {
            studentId: student.value._id
        })
        alert('Student added successfully!')
    } catch (error) {
        console.error('Error adding student:', error)
        alert('Error adding student. Please try again.')
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

const getActivityIconClass = (type) => {
    const classes = {
        'achievement': 'bg-yellow-500',
        'review': 'bg-purple-500',
        'session': 'bg-blue-500'
    }
    return classes[type] || 'bg-gray-500'
}

const getActivityIconPath = (type) => {
    const paths = {
        'achievement': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        'review': 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
        'session': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
    return paths[type] || 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
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