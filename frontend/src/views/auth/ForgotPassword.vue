<template>
    <div class="min-h-screen flex items-center justify-center element-gradient py-12 px-4 sm:px-6 lg:px-8">
        <div
            class="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-sky-500/10">
            <div v-if="!success">
                <div class="text-center mb-8">
                    <div class="mx-auto h-16 w-16 bg-brand-1/10 rounded-full flex items-center justify-center mb-4">
                        <KeyIcon class="h-8 w-8 text-brand-1" />
                    </div>
                    <h2 class="text-3xl font-extrabold text-gray-900">
                        {{ $t('authPages.forgotTitle') }}
                    </h2>
                    <p class="mt-3 text-gray-600">
                        {{ $t('authPages.forgotDescription') }}
                    </p>
                </div>

                <form class="form-container" @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label for="email" class="label">{{ $t('auth.email') }}</label>
                        <div class="input-group">
                            <input id="email" v-model="email" name="email" type="email" required class="input"
                                :class="email && !isValidEmail ? 'error' : email && isValidEmail ? 'success' : ''"
                                :placeholder="$t('authPages.emailPlaceholder')" />
                            <div class="input-icon" v-if="email">
                                <CheckIcon v-if="isValidEmail" class="h-5 w-5 text-green-500" />
                                <XMarkIcon v-else class="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                        <div v-if="email && !isValidEmail" class="error-message">
                            <ExclamationCircleIcon />
                            {{ $t('authPages.invalidEmail') }}
                        </div>
                    </div>

                    <div>
                        <button type="submit" class="btn-primary w-full" :disabled="loading || !isValidEmail">
                            <span v-if="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                {{ $t('authPages.sendingResetLink') }}
                            </span>
                            <span v-else class="flex items-center justify-center">
                                <EnvelopeIcon class="h-5 w-5 mr-2" />
                                {{ $t('authPages.sendResetLink') }}
                            </span>
                        </button>
                    </div>

                    <div v-if="error"
                        class="mt-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center shadow-sm">
                        <div class="flex items-center justify-center">
                            <ExclamationCircleIcon class="h-4 w-4 mr-2 text-red-500" />
                            {{ error }}
                        </div>
                    </div>
                </form>

                <div class="text-center mt-6">
                    <router-link to="/login"
                        class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:from-brand-1 hover:to-brand-2 transition-buttery">
                        ← {{ $t('authPages.backToLogin') }}
                    </router-link>
                </div>
            </div>

            <div v-else class="text-center">
                <div
                    class="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <CheckIcon class="h-12 w-12 text-green-600" />
                </div>

                <h2 class="text-3xl font-extrabold text-gray-900 mb-3">
                    {{ $t('authPages.checkEmail') }}
                </h2>
                <p class="text-gray-600 mb-6">
                    {{ $t('authPages.resetInstructionsSent', { email: email }) }}
                </p>

                <div class="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 mb-6">
                    <div class="flex items-start">
                        <InformationCircleIcon class="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div class="text-sm text-blue-700">
                            <p class="font-medium">{{ $t('authPages.didntReceive') }}</p>
                            <p class="mt-1">{{ $t('authPages.checkSpam') }}</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-3">
                    <router-link to="/login" class="btn-primary w-full inline-block text-center">
                        {{ $t('authPages.returnToLogin') }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { KeyIcon, CheckIcon, XMarkIcon, ExclamationCircleIcon, EnvelopeIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'

const { t } = useI18n()

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
        error.value = err.response?.data?.message || t('authPages.requestFailed')
    } finally {
        loading.value = false
    }
}
</script>