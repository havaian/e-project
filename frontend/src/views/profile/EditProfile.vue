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
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900">Edit profile</h1>
                            <p class="text-gray-600 mt-4">Update your information and preferences</p>
                        </div>
                        <router-link :to="authStore.isProvider ? '/profile/provider' : '/profile/client'"
                            class="text-gray-500 hover:text-gray-700">
                            <XMarkIcon class="w-6 h-6" />
                        </router-link>
                    </div>

                    <form @submit.prevent="handleSubmit" class="space-y-8">

                        <!-- profile photo section -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                    <PhotoIcon class="w-4 h-4 text-brand-1" />
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Profile photo</h2>
                            </div>

                            <div class="flex items-start space-x-6">
                                <!-- Avatar Display -->
                                <div class="relative">
                                    <img :src="formData.profilePicture ? `/api${formData.profilePicture}` : '/images/user-placeholder.jpg'"
                                        :alt="formData.firstName || 'User'"
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
                                        <!-- Upload and Remove buttons on same line -->
                                        <div class="flex items-center gap-3">
                                            <div>
                                                <input type="file" accept="image/*" @change="handlePhotoUpload"
                                                    class="hidden" ref="photoInput">
                                                <button type="button" @click="$refs.photoInput?.click()"
                                                    :disabled="avatarUploading"
                                                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                    <CameraIcon class="w-4 h-4 mr-2" />
                                                    {{ avatarUploading ? 'Uploading...' : 'Upload' }}
                                                </button>
                                            </div>

                                            <!-- Remove Photo Button -->
                                            <button v-if="formData.profilePicture" type="button"
                                                @click="handleRemovePhoto" :disabled="avatarUploading"
                                                class="inline-flex items-center px-3 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <TrashIcon class="w-4 h-4" />
                                            </button>
                                        </div>

                                        <p class="text-sm text-gray-500">JPG, PNG, WebP up to 2MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Personal information -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                    <UserIcon class="w-4 h-4 text-brand-1" />
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Personal information</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label for="firstName" class="label">First name</label>
                                    <input id="firstName" v-model="formData.firstName" type="text" class="input"
                                        required />
                                </div>
                                <div class="form-group">
                                    <label for="lastName" class="label">Last name</label>
                                    <input id="lastName" v-model="formData.lastName" type="text" class="input"
                                        required />
                                </div>
                                <div class="form-group">
                                    <label for="phone" class="label">Phone number</label>
                                    <input id="phone" v-model="formData.phone" type="tel" class="input" required />
                                </div>
                                <div class="form-group">
                                    <label for="email" class="label">Email address</label>
                                    <input id="email" v-model="formData.email" type="email" class="input" required />
                                </div>
                            </div>
                        </div>

                        <!-- Provider-Specific Fields -->
                        <div v-if="authStore.isProvider" class="space-y-8">

                            <!-- Specializations with Enhanced Validation -->
                            <div v-if="authStore.isProvider" class="bg-gray-50/50 rounded-2xl p-6">
                                <div class="flex items-center mb-6">
                                    <div
                                        class="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center mr-3">
                                        <LightBulbIcon class="w-4 h-4 text-blue-500" />
                                    </div>
                                    <h2 class="text-xl font-semibold text-gray-900">Specializations</h2>
                                    <span class="ml-2 text-red-500 text-sm">*</span>
                                </div>

                                <div class="space-y-4">
                                    <p class="text-sm text-gray-600">Select the areas you specialize in (at least 1
                                        required)</p>

                                    <!-- Validation Error Message -->
                                    <div v-if="validationErrors.specializations"
                                        class="p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div class="flex">
                                            <ExclamationTriangleIcon class="w-5 h-5 text-red-400 mt-0.5 mr-2" />
                                            <p class="text-sm text-red-800 font-medium">{{
                                                validationErrors.specializations }}</p>
                                        </div>
                                    </div>

                                    <!-- Specialization Dropdowns -->
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div v-for="(specialization, index) in formData.specializations" :key="index"
                                            class="flex items-center space-x-3">
                                            <select v-model="formData.specializations[index]" :class="[
                                                'input flex-1',
                                                validationErrors.specializations ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                            ]">
                                                <option value="">Select a specialization</option>
                                                <option v-for="spec in getAvailableSpecializations(index)"
                                                    :key="spec.name" :value="spec.name">
                                                    {{ spec.name }}
                                                </option>
                                            </select>
                                            <!-- Remove Button - Always show if more than 1, but disable if only 1 valid specialization -->
                                            <button
                                                v-if="formData.specializations.length > 1 || (formData.specializations.length === 1 && selectedSpecializations.length > 1)"
                                                @click="removeSpecialization(index)" type="button"
                                                :disabled="selectedSpecializations.length <= 1" :class="[
                                                    'p-2 rounded-lg transition-colors',
                                                    selectedSpecializations.length <= 1
                                                        ? 'text-gray-300 cursor-not-allowed'
                                                        : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                                                ]"
                                                :title="selectedSpecializations.length <= 1 ? 'At least one specialization is required' : 'Remove this specialization'">
                                                <TrashIcon class="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Add specialization Button -->
                                    <button v-if="formData.specializations.length < availableSpecializations.length"
                                        @click="addSpecialization" type="button"
                                        class="mt-4 flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium">
                                        <PlusIcon class="w-5 h-5" />
                                        <span>Add specialization</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="bg-gray-50/50 rounded-2xl p-6">
                                <div class="flex items-center justify-between mb-6">
                                    <div class="flex items-center">
                                        <div
                                            class="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mr-3">
                                            <BookOpenIcon class="w-4 h-4 text-green-500" />
                                        </div>
                                        <h2 class="text-xl font-semibold text-gray-900">Education</h2>
                                    </div>
                                    <button type="button" @click="addEducation"
                                        class="text-green-600 hover:text-green-700 text-sm font-medium">
                                        Add education
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
                                        No education entries. Click "Add education" to get started.
                                    </div>
                                </div>
                            </div>

                            <!-- Experience & session Configuration -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Experience -->
                                <div class="bg-gray-50/50 rounded-2xl p-6">
                                    <div class="flex items-center mb-4">
                                        <div
                                            class="w-8 h-8 bg-orange-500/10 rounded-full flex items-center justify-center mr-3">
                                            <BriefcaseIcon class="w-4 h-4 text-orange-500" />
                                        </div>
                                        <h2 class="text-lg font-semibold text-gray-900">Experience</h2>
                                    </div>
                                    <div class="form-group">
                                        <label for="experience" class="label">Years of experience</label>
                                        <input id="experience" v-model.number="formData.experience" type="number"
                                            min="0" max="50" class="input" placeholder="0" />
                                    </div>
                                </div>

                                <!-- Session Configuration -->
                                <div class="bg-gray-50/50 rounded-2xl p-6">
                                    <div class="flex items-center mb-4">
                                        <div
                                            class="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center mr-3">
                                            <CurrencyDollarIcon class="w-4 h-4 text-green-500" />
                                        </div>
                                        <h2 class="text-lg font-semibold text-gray-900">Session settings</h2>
                                    </div>
                                    <div class="space-y-4">
                                        <div class="form-group">
                                            <label for="sessionFee" class="label">Session fee (UZS)</label>
                                            <input id="sessionFee" v-model.number="formData.sessionFee" type="number"
                                                min="0" step="1000" class="input" placeholder="0" />
                                        </div>
                                        <div class="form-group">
                                            <label for="sessionDuration" class="label">Session duration
                                                (minutes)</label>
                                            <select id="sessionDuration" v-model.number="formData.sessionDuration"
                                                class="input">
                                                <option value="30">30 minutes</option>
                                                <option value="45">45 minutes</option>
                                                <option value="60">60 minutes</option>
                                                <option value="90">90 minutes</option>
                                                <option value="120">120 minutes</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Languages -->
                            <div class="bg-gray-50/50 rounded-2xl p-6">
                                <div class="flex items-center mb-6">
                                    <div
                                        class="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center mr-3">
                                        <LanguageIcon class="w-4 h-4 text-purple-500" />
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
                                                <XMarkIcon class="w-4 h-4" />
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

                        <!-- password Change section -->
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-gray-500/10 rounded-full flex items-center justify-center mr-3">
                                    <LockClosedIcon class="w-4 h-4 text-gray-500" />
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Change password</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label for="currentPassword" class="label">Current password</label>
                                    <input id="currentPassword" v-model="passwordData.current" type="password"
                                        class="input" />
                                </div>
                                <div class="form-group">
                                    <label for="newPassword" class="label">New password</label>
                                    <input id="newPassword" v-model="passwordData.new" type="password" class="input" />
                                </div>
                            </div>
                            <div class="mt-4">
                                <button type="button" @click="changePassword"
                                    :disabled="!passwordData.current || !passwordData.new"
                                    class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Update password
                                </button>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <router-link :to="authStore.isProvider ? '/profile/provider' : '/profile/client'"
                                class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                Cancel
                            </router-link>
                            <button type="submit" :disabled="loading || (authStore.isProvider && !isFormValid)" :class="[
                                'px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500',
                                loading || (authStore.isProvider && !isFormValid)
                                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            ]">
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
import { XMarkIcon, PhotoIcon, CameraIcon, UserIcon, ExclamationTriangleIcon, LightBulbIcon, BookOpenIcon, BriefcaseIcon, CurrencyDollarIcon, LanguageIcon, LockClosedIcon, TrashIcon, PlusIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios, { uploadApi } from '@/plugins/axios'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const pageReady = ref(false)
const loading = ref(false)
const newSpecialization = ref('')
const newLanguage = ref('')
const avatarUploading = ref(false)
const availableSpecializations = ref([])

// Validation errors
const validationErrors = reactive({
    specializations: ''
})

// Form data
const formData = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    profilePicture: '',
    // Provider-specific fields
    specializations: [],
    education: [],
    experience: 0,
    sessionFee: 0,
    sessionDuration: 60, // Default to 60 minutes
    languages: []
})

// password change data
const passwordData = reactive({
    current: '',
    new: ''
})

// Computed properties
const selectedSpecializations = computed(() => {
    return formData.specializations.filter(spec => spec !== '')
})

// Form validation for providers
const isFormValid = computed(() => {
    if (!authStore.isProvider) return true

    // Clear validation errors first
    validationErrors.specializations = ''

    // Check if at least one specialization is selected
    if (selectedSpecializations.value.length === 0) {
        validationErrors.specializations = 'At least one specialization is required'
        return false
    }

    return true
})

// Available languages list
const availableLanguages = [
    "English", "Русский", "O'zbek", "Українська", "Қазақша",
    "Español", "Français", "Deutsch", "العربية", "中文", "日本語", "한국어"
]

// Modified to use auth store data immediately and eliminate duplicate API calls
const fetchUserProfile = async () => {
    try {
        loading.value = true

        // First, use auth store data immediately if available
        if (authStore.user && Object.keys(authStore.user).length > 0) {
            populateFormData(authStore.user)
            pageReady.value = true
            loading.value = false
            return // Exit early - we have the data we need
        }

        // Only fetch from API if auth store doesn't have user data
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

        const response = await axios.get('/users/me', {
            signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (response.data) {
            populateFormData(response.data)
            // Update the auth store with fresh data
            authStore.user = response.data
        }

    } catch (error) {
        console.error('Error fetching user profile:', error)

        // If API fails but we have auth store data, use it
        if (authStore.user && Object.keys(authStore.user).length > 0) {
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
    // Clear validation error when adding
    validationErrors.specializations = ''
}

const removeSpecialization = (index) => {
    // Don't allow removal if it would leave no valid specializations
    if (selectedSpecializations.value.length <= 1) {
        return
    }

    formData.specializations.splice(index, 1)

    // Validate after removal
    if (selectedSpecializations.value.length === 0) {
        validationErrors.specializations = 'At least one specialization is required'
    }
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
        // Fallback specializations
        availableSpecializations.value = []
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

        // Use the clean uploadApi instance instead of the main axios instance
        const response = await uploadApi.post('/users/avatars/upload-photo', formDataUpload)

        if (response.data.success) {
            formData.profilePicture = response.data.profilePicture
            console.log('Photo uploaded successfully:', response.data.profilePicture)
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

// Remove photo handler with backend call
const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your profile photo?')) {
        return
    }

    try {
        avatarUploading.value = true

        // Call backend to remove avatar file and update database
        const response = await axios.delete('/users/avatars/')

        if (response.data.success) {
            // Clear the local form data
            formData.profilePicture = ''
        } else {
            throw new Error(response.data.message || 'Failed to remove avatar')
        }
    } catch (error) {
        console.error('Error removing photo:', error)
        const errorMessage = error.response?.data?.message || 'Error removing photo. Please try again.'
        alert(errorMessage)
    } finally {
        avatarUploading.value = false
    }
}

// Modified to avoid duplicate API calls by directly updating auth store instead of calling refreshUserData
const handleSubmit = async () => {
    // Validate form before submission
    if (authStore.isProvider && !isFormValid.value) {
        alert('Please fix validation errors before submitting.')
        return
    }

    try {
        loading.value = true

        const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            email: formData.email,
        }

        if (authStore.isProvider) {
            updateData.specializations = formData.specializations.filter(Boolean)
            updateData.languages = formData.languages.filter(Boolean)
            updateData.education = formData.education.filter(e => e.degree && e.institution && e.year)
            updateData.experience = formData.experience
            updateData.sessionFee = formData.sessionFee
            updateData.sessionDuration = formData.sessionDuration
        }

        // Update the profile
        const response = await axios.patch('/users/me', updateData)

        // Instead of calling refreshUserData (which makes another API call), 
        // directly update the auth store with the returned data
        if (response.data) {
            authStore.user = { ...authStore.user, ...response.data }
            localStorage.setItem('user', JSON.stringify(authStore.user))
        }

        // Navigate back
        const targetRoute = authStore.isProvider ? '/profile/provider' : '/profile/client'
        await router.push(targetRoute)
    } catch (error) {
        console.error('Error updating profile:', error)
        alert('Error updating profile. Please try again.')
    } finally {
        loading.value = false
    }
}

// Lifecycle
onMounted(async () => {
    await fetchSpecializations()

    // Initialize with at least one specialization slot for providers
    if (authStore.isProvider && formData.specializations.length === 0) {
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