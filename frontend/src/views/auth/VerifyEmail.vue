<template>
    <div class="min-h-screen flex items-center justify-center element-gradient py-12 px-4 sm:px-6 lg:px-8">
        <div
            class="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-sky-500/10 text-center">
            <div v-if="loading" class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <p class="mt-4 text-gray-600">{{ $t('authPages.verifyingEmail') }}</p>
            </div>

            <template v-else>
                <div v-if="success" class="space-y-6">
                    <div class="rounded-full bg-green-100 h-24 w-24 flex items-center justify-center mx-auto">
                        <CheckIcon class="h-12 w-12 text-green-600" />
                    </div>

                    <h2 class="text-3xl font-extrabold text-gray-900">
                        {{ $t('authPages.emailVerified') }}
                    </h2>
                    <p class="mt-2 text-sm text-gray-600">
                        {{ $t('authPages.emailVerifiedDesc') }}
                    </p>

                    <div class="mt-8">
                        <router-link to="/login" class="btn-primary w-full justify-center">
                            {{ $t('authPages.goToLogin') }}
                        </router-link>
                    </div>
                </div>

                <div v-else class="space-y-6">
                    <div class="rounded-full bg-red-100 h-24 w-24 flex items-center justify-center mx-auto">
                        <XMarkIcon class="h-12 w-12 text-red-600" />
                    </div>

                    <h2 class="text-3xl font-extrabold text-gray-900">
                        {{ $t('authPages.verificationFailed') }}
                    </h2>
                    <p class="mt-2 text-sm text-gray-600">
                        {{ error || $t('authPages.verificationFailedDesc') }}
                    </p>

                    <div class="mt-8">
                        <router-link to="/login" class="btn-primary w-full justify-center">
                            {{ $t('authPages.returnToLogin') }}
                        </router-link>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { CheckIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
    try {
        const token = route.params.token
        await axios.get(`/users/verify/${token}`)
        success.value = true
    } catch (err) {
        error.value = err.response?.data?.message || t('authPages.verifyFailed')
        success.value = false
    } finally {
        loading.value = false
    }
})
</script>