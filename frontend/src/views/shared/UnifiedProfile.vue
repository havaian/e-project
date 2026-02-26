<!-- frontend/src/views/shared/UnifiedProfile.vue -->
<template>
    <div>
        <!-- Loading state while determining user role -->
        <div v-if="loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent">
                </div>
                <p class="mt-4 text-gray-600">{{ $t('unified.loadingProfile') }}</p>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h3 class="text-lg font-medium text-red-900 mb-2">{{ $t('unified.unableToLoadProfile') }}</h3>
                    <p class="text-red-700 mb-4">{{ error }}</p>
                    <button @click="retryLoad"
                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        {{ $t('unified.tryAgain') }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Role-based profile components -->
        <component v-else :is="profileComponent" v-bind="componentProps" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ClientProfile from '@/views/profile/ClientProfile.vue'
import ProviderProfile from '@/views/profile/ProviderProfile.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const loading = ref(true)
const error = ref(null)
const componentLoaded = ref(false)

// Computed properties
const profileComponent = computed(() => {
    if (!authStore.isAuthenticated || loading.value) return null

    if (authStore.isClient) {
        return ClientProfile
    } else if (authStore.isProvider) {
        return ProviderProfile
    }

    return null
})

const componentProps = computed(() => {
    return {}
})

// Methods
const initializeProfile = async () => {
    try {
        loading.value = true
        error.value = null

        if (!authStore.user) {
            await authStore.refreshUserData()
        }

        if (!authStore.isAuthenticated) {
            router.push('/login')
            return
        }

        if (authStore.isProvider && authStore.needsOnboarding) {
            router.push('/profile/me/onboarding')
            return
        }

        if (!authStore.isClient && !authStore.isProvider) {
            error.value = 'Invalid user role. Please contact support.'
            return
        }

        componentLoaded.value = true

    } catch (err) {
        console.error('Error initializing profile:', err)
        error.value = err.message || 'Failed to load profile. Please try again.'
    } finally {
        loading.value = false
    }
}

const retryLoad = () => {
    initializeProfile()
}

watch(() => authStore.isAuthenticated, (newVal) => {
    if (!newVal) {
        router.push('/login')
    } else if (!componentLoaded.value) {
        initializeProfile()
    }
}, { immediate: false })

watch(() => authStore.user?.role, (newRole, oldRole) => {
    if (newRole && newRole !== oldRole && componentLoaded.value) {
        initializeProfile()
    }
}, { immediate: false })

onMounted(() => {
    initializeProfile()
})
</script>