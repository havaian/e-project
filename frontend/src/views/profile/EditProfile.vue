<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card-element overflow-hidden">
            <div class="p-8">
                <!-- Header -->
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
                        <p class="text-gray-600 mt-1">Update your information and preferences</p>
                    </div>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-8">
                    <!-- Personal Information -->
                    <div class="bg-gray-50/50 rounded-2xl p-6">
                        <div class="flex items-center mb-6">
                            <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900">Personal Information</h2>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="form-group">
                                <label for="firstName" class="label">First Name</label>
                                <input id="firstName" v-model="formData.firstName" type="text" class="input" required />
                            </div>
                            <div class="form-group">
                                <label for="lastName" class="label">Last Name</label>
                                <input id="lastName" v-model="formData.lastName" type="text" class="input" required />
                            </div>
                            <div class="form-group">
                                <label for="phone" class="label">Phone Number</label>
                                <input id="phone" v-model="formData.phone" type="tel" class="input" required />
                            </div>
                        </div>
                    </div>

                    <!-- Location -->
                    <div class="bg-gray-50/50 rounded-2xl p-6">
                        <div class="flex items-center mb-6">
                            <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 class="text-xl font-semibold text-gray-900">Location</h2>
                        </div>
                    </div>

                    <!-- Provider-specific fields -->
                    <template v-if="authStore.isProvider">
                        <div class="bg-gradient-to-br from-brand-1/5 to-brand-2/5 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-brand-1/20 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Professional Information</h2>
                            </div>

                            <!-- Specializations -->
                            <div class="form-group">
                                <label class="label">Specializations</label>
                                <div class="space-y-3">
                                    <div v-for="(spec, index) in formData.specializations" :key="index"
                                        class="flex gap-3">
                                        <select v-model="formData.specializations[index]" class="input flex-1">
                                            <option value="">Select Specialization</option>
                                            <option v-for="spec in getAvailableSpecializations(index)" :key="spec"
                                                :value="spec">
                                                {{ spec }}
                                            </option>
                                        </select>
                                        <button type="button" @click="removeSpecialization(index)"
                                            class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 px-3">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button type="button" @click="addSpecialization"
                                        class="btn-secondary text-brand-1 hover:bg-brand-1/10"
                                        :disabled="availableSpecializations.length <= formData.specializations.filter(s => s !== '').length">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Specialization
                                    </button>
                                </div>
                            </div>

                            <!-- Languages -->
                            <div class="form-group">
                                <label class="label">Languages</label>
                                <div class="space-y-3">
                                    <div v-for="(lang, index) in formData.languages" :key="index" class="flex gap-3">
                                        <select v-model="formData.languages[index]" class="input flex-1">
                                            <option value="">Select Language</option>
                                            <option v-for="language in getAvailableLanguages(index)" :key="language"
                                                :value="language">
                                                {{ language }}
                                            </option>
                                        </select>
                                        <button type="button" @click="removeLanguage(index)"
                                            class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 px-3">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <button type="button" @click="addLanguage"
                                        class="btn-secondary text-brand-1 hover:bg-brand-1/10"
                                        :disabled="availableLanguages.length <= formData.languages.filter(l => l !== '').length">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Language
                                    </button>
                                </div>
                            </div>

                            <!-- Education -->
                            <div class="form-group">
                                <label class="label">Education</label>
                                <div class="space-y-3">
                                    <div v-for="(edu, index) in formData.education" :key="index"
                                        class="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input v-model="edu.degree" type="text" class="input" placeholder="Degree" />
                                        <input v-model="edu.institution" type="text" class="input"
                                            placeholder="Institution" />
                                        <input v-model.number="edu.year" type="number" class="input"
                                            placeholder="Year" />
                                        <button type="button" @click="removeEducation(index)"
                                            class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Remove
                                        </button>
                                    </div>
                                    <button type="button" @click="addEducation"
                                        class="btn-secondary text-brand-1 hover:bg-brand-1/10">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Education
                                    </button>
                                </div>
                            </div>

                            <!-- Certifications -->
                            <div class="form-group">
                                <label class="label">Certifications</label>
                                <div class="space-y-3">
                                    <div v-for="(cert, index) in formData.certifications" :key="index"
                                        class="grid grid-cols-1 md:grid-cols-4 gap-3">
                                        <input v-model="cert.name" type="text" class="input"
                                            placeholder="Certificate Name" />
                                        <input v-model="cert.issuer" type="text" class="input"
                                            placeholder="Issuing Organization" />
                                        <input v-model.number="cert.year" type="number" class="input"
                                            placeholder="Year" />
                                        <button type="button" @click="removeCertification(index)"
                                            class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50">
                                            Remove
                                        </button>
                                    </div>
                                    <button type="button" @click="addCertification"
                                        class="btn-secondary text-brand-1 hover:bg-brand-1/10">
                                        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Certification
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label for="sessionFee" class="label">Session Fee (UZS)</label>
                                    <input id="sessionFee" v-model.number="formData.sessionFee" type="number" min="0"
                                        class="input" required placeholder="0" />
                                </div>
                                <div class="form-group">
                                    <label for="experience" class="label">Years of Experience</label>
                                    <input id="experience" v-model.number="formData.experience" type="number" min="0"
                                        class="input" required placeholder="0" />
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="bio" class="label">Professional Bio</label>
                                <textarea id="bio" v-model="formData.bio" rows="4" class="input"
                                    placeholder="Tell patients about your background, approach, and experience..."></textarea>
                            </div>

                            <!-- Availability -->
                            <div class="form-group">
                                <label class="label">Weekly Availability</label>
                                <div class="bg-white rounded-xl p-4 space-y-3">
                                    <div v-for="day in formData.availability" :key="day.dayOfWeek"
                                        class="grid grid-cols-4 gap-4 items-center py-2">
                                        <div class="flex items-center">
                                            <input type="checkbox" v-model="day.isAvailable"
                                                class="mr-3 w-4 h-4 text-brand-1 border-gray-300 rounded focus:ring-brand-1" />
                                            <span class="font-medium">{{ formatDay(day.dayOfWeek) }}</span>
                                        </div>
                                        <input type="time" v-model="day.startTime" class="input-compact"
                                            :disabled="!day.isAvailable" />
                                        <input type="time" v-model="day.endTime" class="input-compact"
                                            :disabled="!day.isAvailable" />
                                        <span class="text-sm text-gray-500" v-if="day.isAvailable">Available</span>
                                        <span class="text-sm text-gray-400" v-else>Unavailable</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Client-specific fields -->
                    <template v-else>
                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-brand-1" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Educational Information</h2>
                            </div>
                            <div class="form-group">
                                <label for="backgroundInfo" class="label">Educational Background</label>
                                <input id="backgroundInfo" v-model="backgroundInfoInput" type="text" class="input"
                                    placeholder="e.g. High School, Bachelor's in Computer Science (separate multiple with commas)" />
                                <p class="text-sm text-gray-500 mt-1">Separate multiple entries with commas</p>
                            </div>
                        </div>

                        <div class="bg-gray-50/50 rounded-2xl p-6">
                            <div class="flex items-center mb-6">
                                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                                    <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h2 class="text-xl font-semibold text-gray-900">Emergency Contact</h2>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="form-group">
                                    <label for="emergencyName" class="label">Contact Name</label>
                                    <input id="emergencyName" v-model="formData.emergencyContact.name" type="text"
                                        class="input" placeholder="Full name" />
                                </div>
                                <div class="form-group">
                                    <label for="emergencyPhone" class="label">Phone Number</label>
                                    <input id="emergencyPhone" v-model="formData.emergencyContact.phone" type="tel"
                                        class="input" placeholder="+998901234567" />
                                </div>
                                <div class="form-group md:col-span-2">
                                    <label for="emergencyRelationship" class="label">Relationship</label>
                                    <input id="emergencyRelationship" v-model="formData.emergencyContact.relationship"
                                        type="text" class="input" placeholder="e.g. Parent, Spouse, Sibling" />
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Action Buttons -->
                    <div
                        class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                        <router-link :to="{ name: authStore.isProvider ? 'provider-profile' : 'client-profile' }"
                            class="btn-secondary text-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel Changes
                        </router-link>
                        <button type="submit" class="btn-primary" :disabled="loading">
                            <span v-if="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Saving Changes...
                            </span>
                            <span v-else class="flex items-center justify-center">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

// Replace the hardcoded specializations with a ref to be filled from API
const availableSpecializations = ref([])
const availableLanguages = ref(['English', 'Russian', 'Uzbek'])

const formData = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    specializations: [],
    languages: [],
    education: [],
    certifications: [],
    sessionFee: 0,
    experience: 0,
    bio: '',
    availability: [
        { dayOfWeek: 1, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 6, isAvailable: false, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 7, isAvailable: false, startTime: '09:00', endTime: '17:00' }
    ],
    backgroundInfo: '',
    emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
    }
})

const backgroundInfoInput = ref('')

// Get available specializations for a specific dropdown, excluding already selected ones
const getAvailableSpecializations = (currentIndex) => {
    const selectedSpecializations = formData.specializations
        .filter((spec, index) => index !== currentIndex && spec !== '')

    return availableSpecializations.value.filter(spec =>
        !selectedSpecializations.includes(spec)
    )
}

// Get available languages for a specific dropdown, excluding already selected ones
const getAvailableLanguages = (currentIndex) => {
    const selectedLanguages = formData.languages
        .filter((lang, index) => index !== currentIndex && lang !== '')

    return availableLanguages.value.filter(lang =>
        !selectedLanguages.includes(lang)
    )
}

// Helper functions for arrays
const addSpecialization = () => {
    formData.specializations.push('')
}

const removeSpecialization = (index) => {
    formData.specializations.splice(index, 1)
}

// Helper functions for languages
const addLanguage = () => {
    formData.languages.push('')
}

const removeLanguage = (index) => {
    formData.languages.splice(index, 1)
}

const addEducation = () => {
    formData.education.push({ degree: '', institution: '', year: null })
}

const removeEducation = (index) => {
    formData.education.splice(index, 1)
}

const addCertification = () => {
    formData.certifications.push({ name: '', issuer: '', year: null })
}

const removeCertification = (index) => {
    formData.certifications.splice(index, 1)
}

const formatDay = (dayOfWeek) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[dayOfWeek - 1]
}

// Added function to fetch specializations from the API
async function fetchSpecializations() {
    try {
        const response = await axios.get('/specializations')
        availableSpecializations.value = response.data.specializations.map(s => s.name)
    } catch (error) {
        console.error('Error fetching specializations:', error)
        // Set some defaults in case API call fails
        availableSpecializations.value = [
            'Specialization 1',
            'Specialization 2',
            'Specialization 3',
            'Specialization 4',
            'Specialization 5',
            'Specialization 6',
            'Specialization 7',
            'Specialization 8',
            'Specialization 9',
            'Specialization 10'
        ]
    }
}

async function fetchUserProfile() {
    try {
        const response = await axios.get('/users/me')
        const user = response.data

        // Update form data
        formData.firstName = user.firstName
        formData.lastName = user.lastName
        formData.phone = user.phone

        if (authStore.isProvider) {
            // Handle specializations properly as an array
            formData.specializations = Array.isArray(user.specializations) ?
                user.specializations :
                (user.specialization ? [user.specialization] : [])

            // Handle languages properly as an array
            formData.languages = Array.isArray(user.languages) ?
                user.languages : []

            formData.education = user.education || []
            formData.certifications = user.certifications || []
            formData.sessionFee = user.sessionFee || 0
            formData.experience = user.experience || 0
            formData.bio = user.bio || ''
            formData.availability = user.availability || formData.availability
        } else {
            formData.backgroundInfo = user.backgroundInfo || ''
            formData.emergencyContact = user.emergencyContact || { name: '', phone: '', relationship: '' }

            // Update input fields
            backgroundInfoInput.value = user.backgroundInfo || ''
        }
    } catch (error) {
        console.error('Error fetching user profile:', error)
    }
}

async function handleSubmit() {
    try {
        loading.value = true

        // Prepare update data
        const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
        }

        if (authStore.isProvider) {
            // Ensure specializations is an array of non-empty strings
            updateData.specializations = formData.specializations.filter(Boolean)
            // Ensure languages is an array of non-empty strings  
            updateData.languages = formData.languages.filter(Boolean)
            updateData.education = formData.education.filter(e => e.degree && e.institution && e.year)
            updateData.certifications = formData.certifications.filter(c => c.name && c.issuer && c.year)
            updateData.sessionFee = formData.sessionFee
            updateData.experience = formData.experience
            updateData.bio = formData.bio
            updateData.availability = formData.availability
        } else {
            updateData.backgroundInfo = backgroundInfoInput.value
            updateData.emergencyContact = formData.emergencyContact
        }

        await axios.patch('/users/me', updateData)
        router.push({ name: authStore.isProvider ? 'provider-profile' : 'client-profile' })
    } catch (error) {
        console.error('Error updating profile:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchUserProfile()
    // Fetch specializations if user is a provider
    if (authStore.isProvider) {
        fetchSpecializations()
    }
})
</script>