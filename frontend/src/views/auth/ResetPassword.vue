<template>
    <div class="min-h-screen flex items-center justify-center element-gradient py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-sky-500/10">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    Please enter your new password.
                </p>
            </div>

            <div v-if="success" class="rounded-2xl bg-green-50/80 backdrop-blur-sm p-4 border border-green-200">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-green-800">
                            Password reset successful! You can now login with your new password.
                        </p>
                    </div>
                </div>
            </div>

            <form v-if="!success" class="form-container" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="password" class="label">New password</label>
                    <div class="input-group">
                        <input id="password" v-model="password" name="password"
                            :type="showPassword ? 'text' : 'password'" required class="input"
                            placeholder="Enter new password" @input="validatePassword" />
                        <button type="button" @click="togglePassword" class="input-icon"
                            :class="showPassword ? 'active' : ''">
                            <!-- Eye with diagonal stroke (password hidden) -->
                            <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4l16 16" />
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
                                <span :class="passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'">
                                    One special character (!@#$%^&*)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword" class="label">Confirm password</label>
                    <div class="input-group">
                        <input id="confirmPassword" v-model="confirmPassword" name="confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'" required class="input"
                            placeholder="Confirm new password" />
                        <button type="button" @click="toggleConfirmPassword" class="input-icon"
                            :class="showConfirmPassword ? 'active' : ''">
                            <!-- Eye with diagonal stroke (password hidden) -->
                            <svg v-if="!showConfirmPassword" class="h-5 w-5" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4l16 16" />
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

                    <!-- Password Match Indicator -->
                    <div v-if="confirmPassword" class="mt-2 text-sm">
                        <div class="flex items-center gap-2">
                            <svg v-if="passwordsMatch" class="h-4 w-4 text-green-500" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            <svg v-else class="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            <span :class="passwordsMatch ? 'text-green-600' : 'text-red-600'">
                                {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-primary w-full" :disabled="loading || !isValid">
                        <span v-if="loading" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Resetting...
                        </span>
                        <span v-else>Reset Password</span>
                    </button>
                    <p v-if="!isValid && (password || confirmPassword)" class="mt-2 text-sm text-red-600 text-center">
                        Please ensure your password meets all requirements and passwords match
                    </p>
                </div>

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
            </form>

            <div class="text-sm text-center">
                <router-link to="/login"
                    class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:text-indigo-500">
                    Back to login
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/plugins/axios'

const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Password validation state
const passwordValidation = reactive({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
})

// Check if passwords match
const passwordsMatch = computed(() => {
    return password.value === confirmPassword.value
})

// Check if password meets all requirements
const isPasswordValid = computed(() => {
    return Object.values(passwordValidation).every(Boolean)
})

// Overall form validation
const isValid = computed(() => {
    return isPasswordValid.value && passwordsMatch.value
})

// Password validation function
const validatePassword = () => {
    const pwd = password.value

    passwordValidation.minLength = pwd.length >= 8
    passwordValidation.hasUppercase = /[A-Z]/.test(pwd)
    passwordValidation.hasLowercase = /[a-z]/.test(pwd)
    passwordValidation.hasNumber = /\d/.test(pwd)
    passwordValidation.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
}

// Toggle password visibility
const togglePassword = () => {
    showPassword.value = !showPassword.value
}

// Toggle confirm password visibility
const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value
}

async function handleSubmit() {
    try {
        if (!isValid.value) {
            error.value = 'Please ensure your password meets all requirements and passwords match'
            return
        }

        loading.value = true
        error.value = ''

        await axios.post(`/users/reset-password/${route.params.token}`, {
            password: password.value
        })

        success.value = true

        // Redirect to login after 3 seconds
        setTimeout(() => {
            router.push('/login')
        }, 3000)
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to reset password'
        success.value = false
    } finally {
        loading.value = false
    }
}
</script>