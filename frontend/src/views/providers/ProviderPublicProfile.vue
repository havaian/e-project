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
                            <img :src="provider.profilePicture || '/images/user-placeholder.jpg'"
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
                                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Verified Provider
                                    </span>
                                    <div v-if="reviewStats.average > 0"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                        <div class="flex items-center">
                                            <svg class="w-4 h-4 text-yellow-500 mr-1" fill="currentColor"
                                                viewBox="0 0 20 20">
                                                <path
                                                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
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
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Send Message
                            </button>

                            <router-link v-if="authStore.isClient"
                                :to="{ name: 'book-appointment', params: { providerId: provider._id } }"
                                class="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
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
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
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
                                    <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    About
                                </h2>
                                <div class="prose max-w-none">
                                    <p class="text-gray-700 leading-relaxed">{{ decodedBio }}</p>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="bg-white border border-gray-200 rounded-xl p-6">
                                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
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
                                        <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V9a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                                        </svg>
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
                                        <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
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
                                    <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    Client Reviews
                                </h2>

                                <!-- Rating Summary -->
                                <div v-if="reviewStats.average > 0"
                                    class="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center">
                                            <div class="flex">
                                                <svg v-for="i in 5" :key="i"
                                                    :class="i <= Math.round(reviewStats.average) ? 'text-yellow-400' : 'text-gray-300'"
                                                    class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                    <path
                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
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
                                            <img :src="review.client?.profilePicture || '/images/user-placeholder.jpg'"
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
                                                                <svg v-for="i in 5" :key="i"
                                                                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                                                                    class="w-4 h-4" fill="currentColor"
                                                                    viewBox="0 0 20 20">
                                                                    <path
                                                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                </svg>
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
                                    <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
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
                                    <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
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
                                    <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
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
                                                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
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

                            <!-- Contact Info (Emergency Contact if applicable) -->
                            <div v-if="showEmergencyContact && provider.emergencyContact?.name"
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
                                    <p class="font-medium text-gray-900">{{ provider.emergencyContact.name }}</p>
                                    <p class="text-gray-600">{{ provider.emergencyContact.relationship }}</p>
                                    <p class="text-gray-600">{{ provider.emergencyContact.phone }}</p>
                                </div>
                                <div class="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                                    Only visible because you have appointments together
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
                                        <img :src="similar.profilePicture || '/images/user-placeholder.jpg'"
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
const responseRate = ref(95) // This would come from backend analytics

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

        // Check if emergency contact should be shown (if user has appointments with this provider)
        if (authStore.isAuthenticated) {
            checkEmergencyContactVisibility()
        }
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

const checkEmergencyContactVisibility = async () => {
    try {
        // This would be determined by the backend based on appointment history
        const response = await axios.get(`/users/${route.params.id}/emergency-contact-visibility`)
        showEmergencyContact.value = response.data.visible || false
    } catch (error) {
        // If endpoint doesn't exist or fails, default to false
        showEmergencyContact.value = false
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