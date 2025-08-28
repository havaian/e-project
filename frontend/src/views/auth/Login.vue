<template>
    <div class="min-h-screen flex items-center justify-center element-gradient py-12 px-4 sm:px-6 lg:px-8">
        <div
            class="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-sky-500/10">
            <div>
                <div class="flex justify-center mb-6">
                    <div class="rounded-xl shadow-lg">
                        <img src="/images/logo.svg" alt="Logo" width="60" height="60" class="w-15 h-15" />
                    </div>
                </div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
                <div class="space-y-4">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                        </label>
                        <input id="email" v-model="email" name="email" type="email" autocomplete="email" required
                            class="input" placeholder="Enter your email"
                            :class="{ 'border-red-300': email && !isValidEmail }" />
                        <p v-if="email && !isValidEmail" class="mt-1 text-sm text-red-600">
                            Please enter a valid email address
                        </p>
                    </div>

                    <div class="form-group">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div class="input-group">
                            <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                                name="password" autocomplete="current-password" required class="input pr-12"
                                placeholder="Enter your password" />
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
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-sm">
                        <a href="#" @click.prevent="goToForgotPassword"
                            class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:from-emerald-500 hover:to-sky-500 transition-colors duration-200">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                <div>
                    <button type="submit" class="btn-element-primary py-2 w-full" :disabled="loading">
                        <span v-if="loading" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Signing in...
                        </span>
                        <span v-else>Sign in</span>
                    </button>
                </div>
            </form>

            <p class="mt-2 text-center text-sm text-gray-600">
                Don't have an account?
                <a href="#" @click.prevent="goToRegister"
                    class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:text-indigo-500">
                    Sign up
                </a>
            </p>

            <!-- Provider onboarding notification -->
            <div v-if="showOnboardingNotification"
                class="mt-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200 text-blue-800 px-4 py-3 rounded-2xl text-sm text-center shadow-sm">
                <div class="flex items-center justify-center">
                    <svg class="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Welcome! We'll help you complete your profile setup.
                </div>
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
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)
const showOnboardingNotification = ref(false)

// Email validation computed property
const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.value)
})

const togglePassword = () => {
    showPassword.value = !showPassword.value
}

const goToRegister = () => {
    router.push('/register')
}

const goToForgotPassword = () => {
    router.push('/forgot-password')
}

async function handleSubmit() {
    try {
        loading.value = true
        error.value = ''
        showOnboardingNotification.value = false

        // Validate inputs
        if (!isValidEmail.value) {
            error.value = 'Please enter a valid email address'
            return
        }

        if (password.value.length < 8) {
            error.value = 'Password must be at least 8 characters long'
            return
        }

        // Attempt login
        const response = await authStore.login(email.value, password.value)

        // Handle provider onboarding notification
        if (response.needsOnboarding) {
            showOnboardingNotification.value = true
            // Show notification briefly before redirect
            setTimeout(() => {
                router.push(authStore.getPostLoginRedirect())
            }, 2000)
        } else {
            // Immediate redirect for complete profiles or clients
            router.push(authStore.getPostLoginRedirect())
        }

    } catch (err) {
        error.value = err.message || 'Failed to sign in. Please check your credentials.'
        console.error('Login error:', err)
    } finally {
        loading.value = false
    }
}
</script>