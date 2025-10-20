<template>
    <div>
        <!-- Loading state while determining user role -->
        <div v-if="loading" class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent">
                </div>
                <p class="mt-4 text-gray-600">Loading appointments...</p>
            </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="min-h-screen bg-gray-50 flex items-center justify-center">
            <div class="text-center">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <h3 class="text-lg font-medium text-red-900 mb-2">Unable to Load Appointments</h3>
                    <p class="text-red-700 mb-4">{{ error }}</p>
                    <button @click="retryLoad"
                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        </div>

        <!-- Role-based appointments components -->
        <component v-else :is="appointmentsComponent" v-bind="componentProps" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ClientAppointments from './ClientAppointments.vue'
import ProviderAppointments from './ProviderAppointments.vue'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const loading = ref(true)
const error = ref(null)
const componentLoaded = ref(false)

// Computed properties
const appointmentsComponent = computed(() => {
    if (!authStore.isAuthenticated || loading.value) return null

    if (authStore.isClient) {
        return ClientAppointments
    } else if (authStore.isProvider) {
        return ProviderAppointments
    }

    return null
})

const componentProps = computed(() => {
    // Pass any shared props to the appointments components if needed
    return {}
})

// Methods
const initializeAppointments = async () => {
    try {
        loading.value = true
        error.value = null

        // Ensure we have user data
        if (!authStore.user) {
            await authStore.refreshUserData()
        }

        // Validate user authentication and role
        if (!authStore.isAuthenticated) {
            router.push('/login')
            return
        }

        // For providers, check if they need to complete onboarding first
        if (authStore.isProvider && authStore.needsOnboarding) {
            router.push('/profile/me/onboarding')
            return
        }

        // Validate that we have a supported role
        if (!authStore.isClient && !authStore.isProvider) {
            error.value = 'Invalid user role. Please contact support.'
            return
        }

        componentLoaded.value = true

    } catch (err) {
        console.error('Error initializing appointments:', err)
        error.value = err.message || 'Failed to load appointments. Please try again.'
    } finally {
        loading.value = false
    }
}

const retryLoad = () => {
    initializeAppointments()
}

// Watch for auth changes
watch(() => authStore.isAuthenticated, (newVal) => {
    if (!newVal) {
        router.push('/login')
    } else if (!componentLoaded.value) {
        initializeAppointments()
    }
}, { immediate: false })

watch(() => authStore.user?.role, (newRole, oldRole) => {
    if (newRole && newRole !== oldRole && componentLoaded.value) {
        // Role changed, reinitialize
        initializeAppointments()
    }
}, { immediate: false })

// Lifecycle
onMounted(() => {
    initializeAppointments()
})
</script>