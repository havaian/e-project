<template>
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div v-if="!success">
                <div class="text-center mb-8">
                    <div class="mx-auto h-16 w-16 bg-brand-1/10 rounded-full flex items-center justify-center mb-4">
                        <svg class="h-8 w-8 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h2 class="text-3xl font-extrabold text-gray-900">
                        Forgot your password?
                    </h2>
                    <p class="mt-3 text-gray-600">
                        No worries! Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form class="form-container" @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="email" class="label">Email address</label>
                        <div class="input-group">
                            <input 
                                id="email" 
                                v-model="email" 
                                name="email" 
                                type="email" 
                                required 
                                class="input"
                                :class="email && !isValidEmail ? 'error' : email && isValidEmail ? 'success' : ''"
                                placeholder="Enter your email address" 
                            />
                            <div class="input-icon" v-if="email">
                                <svg v-if="isValidEmail" class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <svg v-else class="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <div v-if="email && !isValidEmail" class="error-message">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Please enter a valid email address
                        </div>
                    </div>

                    <div>
                        <button type="submit" class="btn-primary w-full" :disabled="loading || !isValidEmail">
                            <span v-if="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending reset link...
                            </span>
                            <span v-else class="flex items-center justify-center">
                                <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Reset Link
                            </span>
                        </button>
                    </div>

                    <div v-if="error" class="mt-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center shadow-sm">
                        <div class="flex items-center justify-center">
                            <svg class="h-4 w-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {{ error }}
                        </div>
                    </div>
                </form>

                <div class="text-center mt-6">
                    <router-link to="/login" class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:from-brand-1 hover:to-brand-2 transition-buttery">
                        ← Back to login
                    </router-link>
                </div>
            </div>

            <div v-else class="text-center">
                <div class="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg class="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h2 class="text-3xl font-extrabold text-gray-900 mb-3">
                    Check your email
                </h2>
                <p class="text-gray-600 mb-6">
                    We've sent password reset instructions to <strong>{{ email }}</strong>
                </p>
                
                <div class="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 mb-6">
                    <div class="flex items-start">
                        <svg class="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div class="text-sm text-blue-700">
                            <p class="font-medium">Didn't receive the email?</p>
                            <p class="mt-1">Check your spam folder or try sending another reset link.</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <router-link to="/login" class="btn-primary w-full inline-block text-center">
                        Return to Login
                    </router-link>
                    <button @click="handleSubmit" class="btn-secondary w-full" :disabled="loading">
                        Resend Reset Link
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'

const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Email validation
const isValidEmail = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.value)
})

async function handleSubmit() {
    try {
        loading.value = true
        error.value = ''

        await axios.post('/users/forgot-password', { email: email.value })
        success.value = true
    } catch (err) {
        error.value = err.response?.data?.message || 'Failed to process request'
    } finally {
        loading.value = false
    }
}
</script>