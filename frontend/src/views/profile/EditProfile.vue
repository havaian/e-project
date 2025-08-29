<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div v-if="!pageReady" class="text-center py-16">
            <div
                class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent">
            </div>
            <p class="mt-4 text-gray-600">Loading your profile...</p>
        </div>

        <div v-else>
            <div class="card-element overflow-hidden">
                <div class="p-8">
                    <!-- Header -->
                    <div class="flex items-center justify-between mb-8">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
                            <p class="text-gray-600 mt-1">Update your information and preferences</p>
                        </div>
                        <router-link :to="authStore.isProvider ? '/profile/provider' : '/profile/client'"
                            class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </router-link>
                    </div>

                    <form @submit.prevent="handleSubmit" class="space-y-8">

                        <!-- Profile Photo Section -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Profile Photo</h2>
                            </div>

                            <div class="flex items-start space-x-6">
                                <!-- Avatar Display -->
                                <div class="relative">
                                    <img :src="formData.profilePicture || '/images/user-placeholder.jpg'"
                                        :alt="formData.firstName"
                                        class="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md">
                                    <!-- Loading Overlay -->
                                    <div v-if="avatarUploading"
                                        class="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                        <div
                                            class="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent">
                                        </div>
                                    </div>
                                </div>

                                <!-- Avatar Actions -->
                                <div class="flex-1">
                                    <div class="space-y-3">
                                        <!-- Provider: Upload Photo -->
                                        <div v-if="authStore.isProvider">
                                            <input type="file" accept="image/*" @change="handlePhotoUpload"
                                                class="hidden" ref="photoInput">
                                            <button type="button" @click="$refs.photoInput?.click()"
                                                :disabled="avatarUploading"
                                                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {{ avatarUploading ? 'Uploading...' : 'Upload Photo' }}
                                            </button>
                                            <p class="text-sm text-gray-500 mt-1">JPG, PNG, WebP up to 2MB. Professional
                                                photo recommended.</p>
                                        </div>

                                        <!-- Client: Generate Avatar -->
                                        <div v-else-if="authStore.isClient">
                                            <button type="button" @click="handleAvatarGeneration"
                                                :disabled="avatarUploading"
                                                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                                </svg>
                                                {{ avatarUploading ? 'Generating...' : 'Generate Avatar' }}
                                            </button>

                                            <!-- Optional: Also allow manual upload for clients -->
                                            <div class="mt-2">
                                                <input type="file" accept="image/*" @change="handlePhotoUpload"
                                                    class="hidden" ref="clientPhotoInput">
                                                <button type="button" @click="$refs.clientPhotoInput?.click()"
                                                    :disabled="avatarUploading"
                                                    class="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    Or upload your own photo
                                                </button>
                                            </div>

                                            <p class="text-sm text-gray-500 mt-1">
                                                Generate an avatar from your initials or upload a custom photo.
                                            </p>
                                        </div>

                                        <!-- Remove Photo Option -->
                                        <div
                                            v-if="formData.profilePicture && !formData.profilePicture.includes('ui-avatars.com')">
                                            <button type="button" @click="handleRemovePhoto" :disabled="avatarUploading"
                                                class="text-sm text-red-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                Remove Photo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Personal Information -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Personal Information</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label for="firstName" class="label">First Name</label>
                                    <input id="firstName" v-model="formData.firstName" type="text" class="input"
                                        required />
                                </div>
                                <div class="form-group">
                                    <label for="lastName" class="label">Last Name</label>
                                    <input id="lastName" v-model="formData.lastName" type="text" class="input"
                                        required />
                                </div>
                                <div class="form-group">
                                    <label for="phone" class="label">Phone Number</label>
                                    <input id="phone" v-model="formData.phone" type="tel" class="input" required />
                                </div>
                                <div class="form-group">
                                    <label for="email" class="label">Email Address</label>
                                    <input id="email" v-model="formData.email" type="email" class="input" required />
                                </div>
                            </div>
                        </div>

                        <!-- Emergency Contact -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Emergency Contact</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="form-group">
                                    <label for="emergencyName" class="label">Contact Name</label>
                                    <input id="emergencyName" v-model="formData.emergencyContact.name" type="text"
                                        class="input" />
                                </div>
                                <div class="form-group">
                                    <label for="emergencyRelationship" class="label">Relationship</label>
                                    <select id="emergencyRelationship" v-model="formData.emergencyContact.relationship"
                                        class="input">
                                        <option value="">Select relationship</option>
                                        <option value="parent">Parent</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="sibling">Sibling</option>
                                        <option value="child">Child</option>
                                        <option value="friend">Friend</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="emergencyPhone" class="label">Phone Number</label>
                                    <input id="emergencyPhone" v-model="formData.emergencyContact.phone" type="tel"
                                        class="input" />
                                </div>
                            </div>
                            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div class="flex">
                                    <svg class="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <div class="text-sm">
                                        <p class="text-yellow-800 font-medium">Privacy Notice</p>
                                        <p class="text-yellow-700 mt-1">
                                            Emergency contact information is only visible to providers/clients you have
                                            appointments with.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Provider-Specific Fields -->
                        <div v-if="authStore.isProvider" class="space-y-8">

                            <!-- Specializations -->
                            <div v-if="authStore.isProvider" class="bg-gray-50/50 rounded-2xl p-6">
                                <div class="flex items-center mb-6">
                                    <div
                                        class="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mr-3">
                                        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <h2 class="text-xl font-semibold text-gray-900">Specializations</h2>
                                </div>

                                <div class="space-y-4">
                                    <p class="text-sm text-gray-600">Select the areas you specialize in</p>

                                    <!-- Specialization Dropdowns (following StepProfile.vue pattern) -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="(specialization, index) in formData.specializations" :key="index"
                                            class="flex items-center space-x-3">
                                            <select v-model="formData.specializations[index]" class="input flex-1">
                                                <option value="">Select a specialization</option>
                                                <option v-for="spec in getAvailableSpecializations(index)"
                                                    :key="spec.name" :value="spec.name">
                                                    {{ spec.name }}
                                                </option>
                                            </select>
                                            <button v-if="formData.specializations.length > 1"
                                                @click="removeSpecialization(index)" type="button"
                                                class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Add Specialization Button -->
                                    <button v-if="formData.specializations.length < availableSpecializations.length"
                                        @click="addSpecialization" type="button"
                                        class="mt-4 flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        <span>Add Specialization</span>
                                    </button>

                                    <!-- Selected Specializations Display -->
                                    <div v-if="selectedSpecializations.length > 0" class="mt-4">
                                        <p class="text-sm text-gray-600 mb-2">Selected specializations:</p>
                                        <div class="flex flex-wrap gap-2">
                                            <span v-for="spec in selectedSpecializations" :key="spec"
                                                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {{ spec }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="bg-gray-50/50 rounded-2xl p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <div class="flex items-center">
                                        <div
                                            class="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mr-3">
                                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                        <h2 class="text-xl font-semibold text-gray-900">Education</h2>
                                    </div>
                                    <button type="button" @click="addEducation"
                                        class="text-green-600 hover:text-green-700 text-sm font-medium">
                                        Add Education
                                    </button>
                                </div>
                                <div class="space-y-4">
                                    <div v-for="(edu, index) in formData.education" :key="index"
                                        class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
                                        <div class="form-group">
                                            <label class="label">Degree</label>
                                            <input v-model="edu.degree" type="text" class="input"
                                                placeholder="Bachelor's, Master's, etc." />
                                        </div>
                                        <div class="form-group">
                                            <label class="label">Institution</label>
                                            <input v-model="edu.institution" type="text" class="input"
                                                placeholder="University name" />
                                        </div>
                                        <div class="form-group">
                                            <label class="label">Year</label>
                                            <input v-model.number="edu.year" type="number" class="input" min="1950"
                                                :max="new Date().getFullYear()" />
                                        </div>
                                        <div class="flex items-end">
                                            <button type="button" @click="removeEducation(index)"
                                                class="w-full px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500">
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                    <div v-if="formData.education.length === 0" class="text-center py-4 text-gray-500">
                                        No education entries. Click "Add Education" to get started.
                                    </div>
                                </div>
                            </div>

                            <!-- Experience & Consultation Fee -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Experience -->
                                <div class="bg-gray-50/50 rounded-2xl p-6">
                                    <div class="flex items-center mb-4">
                                        <div
                                            class="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center mr-3">
                                            <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V9a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                                            </svg>
                                        </div>
                                        <h2 class="text-lg font-semibold text-gray-900">Experience</h2>
                                    </div>
                                    <div class="form-group">
                                        <label for="experience" class="label">Years of Experience</label>
                                        <input id="experience" v-model.number="formData.experience" type="number"
                                            min="0" max="50" class="input" placeholder="0" />
                                    </div>
                                </div>

                                <!-- Consultation Fee -->
                                <div class="bg-gray-50/50 rounded-2xl p-6">
                                    <div class="flex items-center mb-4">
                                        <div
                                            class="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mr-3">
                                            <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        </div>
                                        <h2 class="text-lg font-semibold text-gray-900">Consultation Fee</h2>
                                    </div>
                                    <div class="form-group">
                                        <label for="sessionFee" class="label">Session Fee (UZS)</label>
                                        <input id="sessionFee" v-model.number="formData.sessionFee" type="number"
                                            min="0" class="input" placeholder="0" />
                                    </div>
                                </div>
                            </div>

                            <!-- Languages -->
                            <div class="bg-gray-50/50 rounded-2xl p-6">
                                <div class="flex items-center mb-6">
                                    <div
                                        class="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center mr-3">
                                        <svg class="w-4 h-4 text-purple-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                        </svg>
                                    </div>
                                    <h2 class="text-xl font-semibold text-gray-900">Languages</h2>
                                </div>
                                <div class="space-y-4">
                                    <div class="flex flex-wrap gap-2 mb-4">
                                        <span v-for="(lang, index) in formData.languages" :key="index"
                                            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                            {{ lang }}
                                            <button type="button" @click="removeLanguage(index)"
                                                class="ml-2 text-purple-600 hover:text-purple-800">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    </div>
                                    <div class="flex gap-2">
                                        <select v-model="newLanguage" class="flex-1 input">
                                            <option value="">Select a language</option>
                                            <option v-for="lang in availableLanguages" :key="lang" :value="lang">{{ lang
                                            }}
                                            </option>
                                        </select>
                                        <button type="button" @click="addLanguage"
                                            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Password Change Section -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-gray-500/10 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Change Password</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label for="currentPassword" class="label">Current Password</label>
                                    <input id="currentPassword" v-model="passwordData.current" type="password"
                                        class="input" />
                                </div>
                                <div class="form-group">
                                    <label for="newPassword" class="label">New Password</label>
                                    <input id="newPassword" v-model="passwordData.new" type="password" class="input" />
                                </div>
                            </div>
                            <div class="mt-4">
                                <button type="button" @click="changePassword"
                                    :disabled="!passwordData.current || !passwordData.new"
                                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Update Password
                                </button>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <router-link :to="authStore.isProvider ? '/profile/provider' : '/profile/client'"
                                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                Cancel
                            </router-link>
                            <button type="submit" :disabled="loading"
                                class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">
                                {{ loading ? 'Saving...' : 'Save Changes' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const pageReady = ref(false)
const loading = ref(false)
const newSpecialization = ref('')
const newLanguage = ref('')
const avatarUploading = ref(false)
const availableSpecializations = ref([])

// Form data
const formData = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    profilePicture: '',
    emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
    },
    // Provider-specific fields
    specializations: [],
    education: [],
    experience: 0,
    sessionFee: 0,
    languages: []
})

// Password change data
const passwordData = reactive({
    current: '',
    new: ''
})

const selectedSpecializations = computed(() => {
  return formData.specializations.filter(spec => spec !== '')
})

// Available languages list
const availableLanguages = [
    'English', 'Русский', 'O\'zbek', 'Українська', 'Қазақша',
    'Español', 'Français', 'Deutsch', 'العربية', '中文', '日本語', '한국어'
]

// Methods
const fetchUserProfile = async () => {
    try {
        loading.value = true

        // Use auth store data immediately if available
        if (authStore.user && Object.keys(authStore.user).length > 0) {
            // console.log('Using auth store data for immediate display')
            populateFormData(authStore.user)
            pageReady.value = true
        }

        // Fetch fresh data with timeout
        // console.log('Fetching fresh user profile data...')
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await axios.get('/users/me', {
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.data) {
            // console.log('Fresh data loaded, updating form')
            populateFormData(response.data)
        }

    } catch (error) {
        console.error('Error fetching user profile:', error)

        // If API fails but we have auth store data, use it
        if (authStore.user && Object.keys(authStore.user).length > 0) {
            // console.log('API failed, falling back to auth store data')
            populateFormData(authStore.user)
        } else {
            console.error('No fallback data available')
            alert('Failed to load profile data. Please refresh the page.')
        }
    } finally {
        loading.value = false
        pageReady.value = true // Always set this to true so page shows
    }
}

const populateFormData = (userData) => {
    if (!userData) return

    // Basic fields
    formData.firstName = userData.firstName || ''
    formData.lastName = userData.lastName || ''
    formData.phone = userData.phone || ''
    formData.email = userData.email || ''
    formData.profilePicture = userData.profilePicture || ''
    formData.emergencyContact = userData.emergencyContact || {
        name: '', relationship: '', phone: ''
    }

    // Provider-specific fields
    if (authStore.isProvider && userData) {
        formData.specializations = Array.isArray(userData.specializations) ?
            [...userData.specializations] : []
        formData.languages = Array.isArray(userData.languages) ?
            [...userData.languages] : []
        formData.education = Array.isArray(userData.education) ?
            [...userData.education] : []
        formData.experience = userData.experience || 0
        formData.sessionFee = userData.sessionFee || 0
        formData.sessionDuration = userData.sessionDuration || 60
    }
}

const addSpecialization = () => {
  formData.specializations.push('')
}

const removeSpecialization = (index) => {
  formData.specializations.splice(index, 1)
}

const getAvailableSpecializations = (currentIndex) => {
  const selectedSpecs = formData.specializations
    .filter((spec, index) => index !== currentIndex && spec !== '')

  return availableSpecializations.value.filter(spec =>
    !selectedSpecs.includes(spec.name)
  )
}

const fetchSpecializations = async () => {
  try {
    loading.value = true
    const response = await axios.get('/specializations')
    availableSpecializations.value = response.data.specializations || []
  } catch (error) {
    console.error('Error fetching specializations:', error)
    // Fallback specializations - EXACT same as StepProfile.vue
    availableSpecializations.value = [
      { name: 'Clinical Psychology' },
      { name: 'Counseling Psychology' },
      { name: 'Educational Psychology' },
      { name: 'Social Work' },
      { name: 'Marriage and Family Therapy' },
      { name: 'Addiction Counseling' },
      { name: 'Child Psychology' },
      { name: 'Behavioral Therapy' },
      { name: 'Cognitive Behavioral Therapy' },
      { name: 'Psychotherapy' }
    ]
  } finally {
    loading.value = false
  }
}

const addEducation = () => {
    formData.education.push({
        degree: '',
        institution: '',
        year: new Date().getFullYear()
    })
}

const removeEducation = (index) => {
    formData.education.splice(index, 1)
}

const addLanguage = () => {
    if (newLanguage.value && !formData.languages.includes(newLanguage.value)) {
        formData.languages.push(newLanguage.value)
        newLanguage.value = ''
    }
}

const removeLanguage = (index) => {
    formData.languages.splice(index, 1)
}

const changePassword = async () => {
    if (!passwordData.current || !passwordData.new) return

    try {
        await axios.post('/users/change-password', {
            currentPassword: passwordData.current,
            newPassword: passwordData.new
        })

        alert('Password updated successfully!')
        passwordData.current = ''
        passwordData.new = ''
    } catch (error) {
        console.error('Error changing password:', error)
        alert('Error changing password. Please check your current password and try again.')
    }
}

// Enhanced photo upload handler
const handlePhotoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
        alert('File size must be less than 2MB')
        return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
    }

    const formDataUpload = new FormData()
    formDataUpload.append('photo', file)

    try {
        avatarUploading.value = true
        const response = await axios.post('/users/upload-photo', formDataUpload, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        if (response.data.success) {
            formData.profilePicture = response.data.profilePicture
            // Show success message
            console.log('Photo uploaded successfully')
        } else {
            throw new Error(response.data.message || 'Upload failed')
        }
    } catch (error) {
        console.error('Error uploading photo:', error)
        const errorMessage = error.response?.data?.message || 'Error uploading photo. Please try again.'
        alert(errorMessage)
    } finally {
        avatarUploading.value = false
        // Clear file input
        if (event.target) {
            event.target.value = ''
        }
    }
}

// Avatar generation handler for clients
const handleAvatarGeneration = async () => {
    if (!formData.firstName || !formData.lastName) {
        alert('Please enter your first and last name before generating an avatar')
        return
    }

    try {
        avatarUploading.value = true
        const response = await axios.post('/users/generate-avatar')

        if (response.data.success) {
            formData.profilePicture = response.data.profilePicture
            console.log('Avatar generated successfully')
        } else {
            throw new Error(response.data.message || 'Avatar generation failed')
        }
    } catch (error) {
        console.error('Error generating avatar:', error)
        const errorMessage = error.response?.data?.message || 'Error generating avatar. Please try again.'
        alert(errorMessage)
    } finally {
        avatarUploading.value = false
    }
}

// Remove photo handler
const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
        return
    }

    try {
        avatarUploading.value = true
        // Update the user profile to remove the photo
        formData.profilePicture = ''

        // If it's a client, we could regenerate a default avatar
        if (authStore.isClient) {
            await handleAvatarGeneration()
        }
    } catch (error) {
        console.error('Error removing photo:', error)
        alert('Error removing photo. Please try again.')
    } finally {
        avatarUploading.value = false
    }
}

const handleSubmit = async () => {
    try {
        loading.value = true

        const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
            emergencyContact: formData.emergencyContact
        }

        if (authStore.isProvider) {
            updateData.specializations = formData.specializations.filter(Boolean)
            updateData.languages = formData.languages.filter(Boolean)
            updateData.education = formData.education.filter(e => e.degree && e.institution && e.year)
            updateData.experience = formData.experience
            updateData.sessionFee = formData.sessionFee
            updateData.sessionDuration = formData.sessionDuration
        }

        await axios.patch('/users/me', updateData)

        // Force refresh user data in auth store after successful update
        await authStore.refreshUserData(true)

        // Navigate back with force refresh
        const targetRoute = authStore.isProvider ? '/profile/provider' : '/profile/client'
        await router.push(targetRoute)

        // Force component refresh by adding a query parameter
        await nextTick()
        await router.replace({ path: targetRoute, query: { updated: Date.now() } })

    } catch (error) {
        console.error('Error updating profile:', error)
        alert('Error updating profile. Please try again.')
    } finally {
        loading.value = false
    }
}

// Lifecycle
onMounted(async () => {
    // console.log('EditProfile component mounted')
    // console.log('Auth store user:', authStore.user)
    // console.log('Is authenticated:', authStore.isAuthenticated)

    await fetchSpecializations()

    // Initialize with at least one specialization slot
    if (formData.specializations.length === 0) {
        addSpecialization()
    }

    // Quick validation
    if (!authStore.isAuthenticated) {
        console.error('User not authenticated, redirecting to login')
        router.push('/login')
        return
    }

    // Fetch profile data
    await fetchUserProfile()
})
</script>

<style scoped>
.card-element {
    @apply bg-white rounded-xl shadow-sm border border-gray-200;
}

.form-group {
    @apply space-y-2;
}

.label {
    @apply block text-sm font-medium text-gray-700;
}

.input {
    @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500;
}

.brand-1 {
    color: #3b82f6;
}
</style>