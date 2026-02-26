<template>
    <div class="min-h-screen flex items-center justify-center element-gradient py-12 px-4 sm:px-6 lg:px-8">
        <div
            class="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-sky-500/10">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {{ $t('authPages.resetTitle') }}
                </h2>
                <p class="mt-2 text-center text-sm text-gray-600">
                    {{ $t('authPages.resetDescription') }}
                </p>
            </div>

            <div v-if="success" class="rounded-2xl bg-green-50/80 backdrop-blur-sm p-4 border border-green-200">
                <div class="flex">
                    <div class="flex-shrink-0">
                        <CheckCircleIcon class="h-5 w-5 text-green-400" />
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-green-800">
                            {{ $t('authPages.resetSuccess') }}
                        </p>
                    </div>
                </div>
            </div>

            <form v-if="!success" class="form-container" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label for="password" class="label">{{ $t('authPages.newPassword') }}</label>
                    <div class="input-group">
                        <input id="password" v-model="password" name="password"
                            :type="showPassword ? 'text' : 'password'" required class="input"
                            :placeholder="$t('authPages.newPasswordPlaceholder')" @input="validatePassword" />
                        <button type="button" @click="togglePassword" class="input-icon"
                            :class="showPassword ? 'active' : ''">
                            <!-- Eye with diagonal stroke (password hidden) -->
                            <EyeSlashIcon v-if="!showPassword" class="h-5 w-5" />
                            <!-- Regular eye (password visible) -->
                            <EyeIcon v-else class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- password requirements -->
                    <div class="mt-3 text-sm">
                        <p class="text-gray-600 mb-2">{{ $t('authPages.passwordMustContain') }}</p>
                        <div class="space-y-1">
                            <div class="flex items-center gap-2">
                                <CheckCircleIcon class="h-4 w-4"
                                    :class="passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'" />
                                <span :class="passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'">
                                    {{ $t('authPages.pwdMinLength') }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <CheckCircleIcon class="h-4 w-4"
                                    :class="passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'" />
                                <span :class="passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-500'">
                                    {{ $t('authPages.pwdUppercase') }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <CheckCircleIcon class="h-4 w-4"
                                    :class="passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'" />
                                <span :class="passwordValidation.hasLowercase ? 'text-green-600' : 'text-gray-500'">
                                    {{ $t('authPages.pwdLowercase') }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <CheckCircleIcon class="h-4 w-4"
                                    :class="passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'" />
                                <span :class="passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'">
                                    {{ $t('authPages.pwdNumber') }}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <CheckCircleIcon class="h-4 w-4"
                                    :class="passwordValidation.minLength ? 'text-green-500' : 'text-gray-400'" />
                                <span :class="passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'">
                                    {{ $t('authPages.pwdSpecialChar') }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="confirmPassword" class="label">{{ $t('auth.confirmPassword') }}</label>
                    <div class="input-group">
                        <input id="confirmPassword" v-model="confirmPassword" name="confirmPassword"
                            :type="showConfirmPassword ? 'text' : 'password'" required class="input"
                            :placeholder="$t('authPages.confirmPasswordPlaceholder')" />
                        <button type="button" @click="toggleConfirmPassword" class="input-icon"
                            :class="showConfirmPassword ? 'active' : ''">
                            <!-- Eye with diagonal stroke (password hidden) -->
                            <EyeSlashIcon v-if="!showPassword" class="h-5 w-5" />
                            <!-- Regular eye (password visible) -->
                            <EyeIcon v-else class="h-5 w-5" />
                        </button>
                    </div>

                    <!-- password Match Indicator -->
                    <div v-if="confirmPassword" class="mt-2 text-sm">
                        <div class="flex items-center gap-2">
                            <CheckCircleIcon v-if="passwordsMatch" class="h-4 w-4 text-green-500" />
                            <XCircleIcon v-else class="h-4 w-4 text-red-500" />
                            <span :class="passwordsMatch ? 'text-green-600' : 'text-red-600'">
                                {{ passwordsMatch ? $t('authPages.passwordsMatch') : $t('authPages.passwordsNoMatch') }}
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
                            {{ $t('authPages.resetting') }}
                        </span>
                        <span v-else>{{ $t('auth.resetPassword') }}</span>
                    </button>
                    <p v-if="!isValid && (password || confirmPassword)" class="mt-2 text-sm text-red-600 text-center">
                        {{ $t('authPages.resetRequirementsNotMet') }}
                    </p>
                </div>

                <div v-if="error"
                    class="mt-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm text-center shadow-sm">
                    <div class="flex items-center justify-center">
                        <ExclamationCircleIcon class="h-4 w-4 mr-2 text-red-500" />
                        {{ error }}
                    </div>
                </div>
            </form>

            <div class="text-sm text-center">
                <router-link to="/login"
                    class="font-medium bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent hover:text-indigo-500">
                    {{ $t('authPages.backToLogin') }}
                </router-link>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CheckCircleIcon, EyeIcon, EyeSlashIcon, ExclamationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// password validation state
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

// password validation function
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
            error.value = t('authPages.resetRequirementsNotMet')
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
        error.value = err.response?.data?.message || t('authPages.resetFailed')
        success.value = false
    } finally {
        loading.value = false
    }
}
</script>