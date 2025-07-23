<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
            </div>

            <div v-if="registrationSuccess"
                class="rounded-2xl bg-green-50/80 backdrop-blur-sm p-4 border border-green-200">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <h3 class="text-sm font-medium text-green-800">Registration successful!</h3>
                        <div class="mt-2 text-sm text-green-700">
                            <p>Please check your email to verify your account before logging in.</p>
                        </div>
                        <div class="mt-4">
                            <router-link to="/login" class="text-sm font-medium text-green-600 hover:text-green-500">
                                Go to login page →
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>

            <form v-else class="form-container" @submit.prevent="handleSubmit">
                <div class="space-y-4">
                    <div class="form-group">
                        <label for="role" class="label">I am a</label>
                        <select id="role" v-model="formData.role" class="input" required @change="watchRole">
                            <option value="client">Client</option>
                            <option value="provider">Provider</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label for="firstName" class="label">First Name</label>
                            <input id="firstName" v-model="formData.firstName" type="text" required class="input"
                                placeholder="Enter first name" />
                        </div>
                        <div class="form-group">
                            <label for="lastName" class="label">Last Name</label>
                            <input id="lastName" v-model="formData.lastName" type="text" required class="input"
                                placeholder="Enter last name" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email" class="label">Email address</label>
                        <input id="email" v-model="formData.email" type="email" required class="input"
                            placeholder="Enter your email" />
                    </div>

                    <div class="form-group">
                        <label for="phone" class="label">Phone number</label>
                        <input id="phone" v-model="formData.phone" type="tel" required class="input"
                            placeholder="+998901234567" />
                    </div>

                    <div class="form-group">
                        <label for="password" class="label">Password</label>
                        <div class="input-group">
                            <input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'"
                                required class="input" placeholder="Enter your password" @input="validatePassword" />
                            <button type="button" @click="togglePassword" class="input-icon"
                                :class="showPassword ? 'active' : ''">
                                <!-- Eye with diagonal stroke (password hidden) -->
                                <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 4l16 16" />
                                </svg>
                                <!-- Regular eye (password visible) -->
                                <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>

                        <!-- Password Requirements -->
                        <div class="mt-3 text-sm">
                            <p class="text-gray-600 mb-2">Password must contain:</p>
                            <div class="space-y-1">
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4"
                                        :class="passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'"
                                        fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    <span :class="passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'">
                                        At least 8 characters
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4"
                                        :class="passwordValidation.hasUppercase ? 'text-green-500' : 'text-gray-400'"
                                        fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    <span :class="passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'">
                                        One uppercase letter
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4"
                                        :class="passwordValidation.hasLowercase ? 'text-green-500' : 'text-gray-400'"
                                        fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    <span :class="passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'">
                                        One lowercase letter
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4"
                                        :class="passwordValidation.hasNumber ? 'text-green-500' : 'text-gray-400'"
                                        fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    <span :class="passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'">
                                        One number
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <svg class="h-4 w-4"
                                        :class="passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-gray-400'"
                                        fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"></path>
                                    </svg>
                                    <span
                                        :class="passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'">
                                        One special character (!@#$%^&*)
                                    </span>
                                </div>
                            </div>

                            <!-- Password Strength Indicator -->
                            <div class="mt-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-sm text-gray-600">Strength:</span>
                                    <div class="flex-1 bg-gray-200 rounded-full h-2">
                                        <div class="h-2 rounded-full transition-all duration-300"
                                            :class="passwordStrengthColor" :style="{ width: passwordStrengthWidth }">
                                        </div>
                                    </div>
                                    <span class="text-sm font-medium" :class="passwordStrengthTextColor">
                                        {{ passwordStrengthText }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <template v-if="formData.role === 'provider'">
                        <div class="form-group">
                            <label for="specializations" class="label">Specializations</label>
                            <div class="space-y-2">
                                <div v-for="(spec, index) in formData.specializations" :key="index" class="flex gap-2">
                                    <select v-model="formData.specializations[index]" class="input flex-1">
                                        <option value="">Select Specialization</option>
                                        <option v-for="spec in getAvailableSpecializations(index)" :key="spec"
                                            :value="spec">
                                            {{ spec }}
                                        </option>
                                    </select>
                                    <button type="button" @click="removeSpecialization(index)"
                                        class="px-3 py-2 text-red-600 hover:text-red-800 transition-colors">
                                        Remove
                                    </button>
                                </div>
                                <button type="button" @click="addSpecialization"
                                    class="text-sm bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:from-brand-1 hover:to-brand-2"
                                    :disabled="availableSpecializations.length <= formData.specializations.filter(s => s !== '').length">
                                    + Add Specialization
                                </button>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="licenseNumber" class="label">License Number</label>
                            <input id="licenseNumber" v-model="formData.licenseNumber" type="text" required
                                class="input" placeholder="Enter license number" />
                        </div>

                        <div class="form-group">
                            <label for="experience" class="label">Years of Experience</label>
                            <input id="experience" v-model.number="formData.experience" type="number" min="0" required
                                class="input" placeholder="0" />
                        </div>

                        <div class="form-group">
                            <label for="sessionFee" class="label">Session Fee (UZS)</label>
                            <input id="sessionFee" v-model.number="formData.sessionFee" type="number" min="0" required
                                class="input" placeholder="0" />
                        </div>

                        <div class="form-group">
                            <label for="languages" class="label">Languages</label>
                            <div class="space-y-2">
                                <div v-for="(lang, index) in formData.languages" :key="index" class="flex gap-2">
                                    <select v-model="formData.languages[index]" class="input flex-1">
                                        <option value="">Select Language</option>
                                        <option v-for="language in getAvailableLanguages(index)" :key="language"
                                            :value="language">
                                            {{ language }}
                                        </option>
                                    </select>
                                    <button type="button" @click="removeLanguage(index)"
                                        class="px-3 py-2 text-red-600 hover:text-red-800 transition-colors">
                                        Remove
                                    </button>
                                </div>
                                <button type="button" @click="addLanguage"
                                    class="text-sm bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:from-brand-1 hover:to-brand-2"
                                    :disabled="availableLanguages.length <= formData.languages.filter(l => l !== '').length">
                                    + Add Language
                                </button>
                            </div>
                        </div>
                    </template>

                    <!-- Date of Birth - Only for clients -->
                    <div v-if="formData.role === 'client'" class="form-group">
                        <label for="dateOfBirth" class="label">Date of Birth</label>
                        <input id="dateOfBirth" v-model="formData.dateOfBirth" type="date" required class="input"
                            :max="maxDate" />
                    </div>

                    <!-- Gender - Only for clients -->
                    <div v-if="formData.role === 'client'" class="form-group">
                        <label for="gender" class="label">Gender</label>
                        <select id="gender" v-model="formData.gender" class="input" required>
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer not to say">Prefer not to say</option>
                        </select>
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-primary w-full" :disabled="loading || !isPasswordValid">
                        <span v-if="loading" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Creating account...
                        </span>
                        <span v-else>Create account</span>
                    </button>
                    <p v-if="!isPasswordValid && formData.password" class="mt-2 text-sm text-red-600 text-center">
                        Please ensure your password meets all requirements
                    </p>
                </div>
            </form>

            <p class="mt-2 text-center text-sm text-gray-600">
                Already have an account?
                <router-link to="/login"
                    class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:text-indigo-500">
                    Sign in
                </router-link>
            </p>

            <div v-if="error"
                class="mt-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center shadow-sm">
                <div class="flex items-center justify-center">
                    <svg class="h-4 w-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ error }}
                </div>
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

const availableSpecializations = ref([])
const availableLanguages = ref(['English', 'Russian', 'Uzbek'])
const showPassword = ref(false)

const formData = reactive({
    role: 'client',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    dateOfBirth: '',
    gender: '',
    specializations: [],
    languages: [],
    licenseNumber: '',
    experience: 0,
    sessionFee: 0
})

const registrationSuccess = ref(false)
const loading = ref(false)
const error = ref('')

// Password validation state
const passwordValidation = reactive({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
})

// Calculate max date (18 years ago from today)
const maxDate = computed(() => {
    const date = new Date()
    date.setFullYear(date.getFullYear() - 18)
    return date.toISOString().split('T')[0]
})

// Password strength calculations
const passwordStrengthScore = computed(() => {
    const validations = Object.values(passwordValidation)
    return validations.filter(Boolean).length
})

const passwordStrengthWidth = computed(() => {
    return `${(passwordStrengthScore.value / 5) * 100}%`
})

const passwordStrengthColor = computed(() => {
    const score = passwordStrengthScore.value
    if (score <= 1) return 'bg-red-500'
    if (score <= 2) return 'bg-orange-500'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-blue-500'
    return 'bg-green-500'
})

const passwordStrengthText = computed(() => {
    const score = passwordStrengthScore.value
    if (score <= 1) return 'Very Weak'
    if (score <= 2) return 'Weak'
    if (score <= 3) return 'Fair'
    if (score <= 4) return 'Good'
    return 'Strong'
})

const passwordStrengthTextColor = computed(() => {
    const score = passwordStrengthScore.value
    if (score <= 1) return 'text-red-600'
    if (score <= 2) return 'text-orange-600'
    if (score <= 3) return 'text-yellow-600'
    if (score <= 4) return 'text-blue-600'
    return 'text-green-600'
})

// Check if password meets all requirements
const isPasswordValid = computed(() => {
    return Object.values(passwordValidation).every(Boolean)
})

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

// Password validation function
const validatePassword = () => {
    const password = formData.password

    passwordValidation.minLength = password.length >= 8
    passwordValidation.hasUppercase = /[A-Z]/.test(password)
    passwordValidation.hasLowercase = /[a-z]/.test(password)
    passwordValidation.hasNumber = /\d/.test(password)
    passwordValidation.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
}

// Toggle password visibility
const togglePassword = () => {
    showPassword.value = !showPassword.value
}

// Helper functions for specializations
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

// Add default empty specialization when switching to provider role
const watchRole = () => {
    if (formData.role === 'provider' && formData.specializations.length === 0) {
        formData.specializations.push('')
        formData.languages.push('')
    }
}

async function handleSubmit() {
    try {
        loading.value = true;
        error.value = '';

        // Create a copy of the formData to modify before sending
        const registrationData = { ...formData };

        if (registrationData.role === 'provider') {
            // Make sure specializations is processed properly
            registrationData.specializations = formData.specializations.filter(s => s !== "");

            // Process languages for provider registration
            registrationData.languages = formData.languages.filter(l => l !== "");

            // Remove client-only fields for provider registration
            delete registrationData.dateOfBirth;
            delete registrationData.gender;
        } else {
            // For client registration, remove all provider-specific fields
            delete registrationData.specializations;
            delete registrationData.languages;
            delete registrationData.licenseNumber;
            delete registrationData.experience;
            delete registrationData.sessionFee;
        }

        await authStore.register(registrationData);
        registrationSuccess.value = true;
    } catch (err) {
        error.value = err.message || 'Failed to create account';
    } finally {
        loading.value = false;
    }
}

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

onMounted(() => {
    fetchSpecializations()
})
</script>