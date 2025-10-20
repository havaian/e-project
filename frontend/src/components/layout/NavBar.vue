<template>
    <nav class="bg-white/95 backdrop-blur-md shadow-lg border-b border-sky-500/10 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <!-- Logo and main navigation -->
                <div class="flex items-center">
                    <!-- Logo -->
                    <router-link to="/" class="flex items-center space-x-3">
                        <div class="rounded-xl shadow-lg">
                            <img src="/images/logo.svg" :alt="`${appTitle} Logo`" width="40" height="40" class="w-15 h-15" />
                        </div>
                        <span class="text-xl font-bold">
                            {{ appTitle1 }}<span
                                class="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">{{ appTitle2 }}</span><span
                                class="text-success">{{ appTitle3 }}</span>
                        </span>
                    </router-link>

                    <!-- Desktop Navigation -->
                    <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
                        <router-link to="/"
                            class="text-gray-700 hover:text-sky-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            :class="{ 'text-sky-500 border-b-2 border-sky-500': $route.path === '/' }">
                            Home
                        </router-link>
                        <router-link to="/providers"
                            class="text-gray-700 hover:text-sky-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            :class="{ 'text-sky-500 border-b-2 border-sky-500': $route.path === '/providers' }">
                            Find providers
                        </router-link>
                        <template v-if="authStore.isAuthenticated">
                            <router-link v-if="authStore.isClient" to="/appointments/me"
                                class="text-gray-700 hover:text-sky-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
                                :class="{ 'text-sky-500 border-b-2 border-sky-500': $route.path.includes('/appointments/me') }">
                                My appointments
                            </router-link>
                            <router-link v-if="authStore.isProvider" to="/appointments/me"
                                class="text-gray-700 hover:text-sky-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
                                :class="{ 'text-sky-500 border-b-2 border-sky-500': $route.path.includes('/appointments/me') }">
                                My Schedule
                            </router-link>
                        </template>
                        <router-link to="/chat"
                            class="text-gray-700 hover:text-sky-500 px-3 py-2 text-sm font-medium transition-colors duration-200"
                            :class="{ 'text-sky-500 border-b-2 border-sky-500': $route.path === '/chat' }">
                            Messages
                        </router-link>
                    </div>
                </div>

                <!-- Mobile menu button -->
                <div class="sm:hidden flex items-center">
                    <button @click="toggleMobileMenu" type="button"
                        class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-sky-500 hover:bg-sky-500/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500 transition-colors duration-200">
                        <span class="sr-only">Open main menu</span>
                        <!-- Icon when menu is closed -->
                        <Bars3Icon v-if="!showMobileMenu" class="block h-6 w-6" aria-hidden="true" />
                        <!-- Icon when menu is open -->
                        <XMarkIcon v-else class="block h-6 w-6" aria-hidden="true" />
                    </button>
                </div>

                <!-- Desktop profile menu -->
                <div class="hidden sm:flex sm:items-center sm:space-x-4">
                    <template v-if="authStore.isAuthenticated">
                        <div class="relative" ref="profileMenuRef">
                            <button @click="toggleProfileMenu"
                                class="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500/10 to-emerald-500/10 hover:from-sky-500/20 hover:to-emerald-500/20 transition-buttery duration-200 border border-sky-500/20">
                                <div
                                    class="w-8 h-8 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <span class="text-white font-semibold text-sm">{{ authStore.user?.firstName?.[0]
                                    }}</span>
                                </div>
                                <span class="text-sm font-medium text-gray-700">{{ authStore.user?.firstName }}</span>
                                <ChevronDownIcon :class="[
                                    'h-4 w-4 text-gray-500 transition-transform duration-100',
                                    showProfileMenu ? 'rotate-180' : ''
                                ]" />
                            </button>
                            <div v-if="showProfileMenu"
                                class="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white backdrop-blur-md ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 border border-sky-500/10">
                                <div class="py-1">
                                    <router-link :to="authStore.isProvider ? '/profile/me' : '/profile/me'"
                                        class="block px-4 py-3 text-sm text-gray-700 hover:bg-sky-500/5 hover:text-sky-500 transition-colors duration-200">
                                        <div class="flex items-center space-x-3">
                                            <UserIcon class="h-4 w-4" />
                                            <span>My profile</span>
                                        </div>
                                    </router-link>
                                </div>
                                <div class="py-1">
                                    <button @click="logout"
                                        class="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200">
                                        <div class="flex items-center space-x-3">
                                            <ArrowRightOnRectangleIcon class="h-4 w-4" />
                                            <span>Sign Out</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <router-link to="/login"
                            class="text-sky-500 hover:text-emerald-500 font-medium px-4 py-2 rounded-xl transition-colors duration-200">
                            Sign In
                        </router-link>
                        <router-link to="/register" class="btn-element-primary text-sm">
                            Get Started
                        </router-link>
                    </template>
                </div>
            </div>
        </div>

        <!-- Mobile menu -->
        <div v-if="showMobileMenu" class="sm:hidden bg-white/95 backdrop-blur-md border-t border-sky-500/10" ref="mobileMenuRef">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <router-link to="/"
                    class="text-gray-700 hover:text-sky-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    :class="{ 'text-sky-500 bg-sky-500/5': $route.path === '/' }"
                    @click="closeMobileMenu">
                    Home
                </router-link>
                <router-link to="/providers"
                    class="text-gray-700 hover:text-sky-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    :class="{ 'text-sky-500 bg-sky-500/5': $route.path === '/providers' }"
                    @click="closeMobileMenu">
                    Find providers
                </router-link>
                <template v-if="authStore.isAuthenticated">
                    <router-link v-if="authStore.isClient" to="/appointments/me"
                        class="text-gray-700 hover:text-sky-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        :class="{ 'text-sky-500 bg-sky-500/5': $route.path.includes('/appointments/me') }"
                        @click="closeMobileMenu">
                        My appointments
                    </router-link>
                    <router-link v-if="authStore.isProvider" to="/appointments/me"
                        class="text-gray-700 hover:text-sky-500 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                        :class="{ 'text-sky-500 bg-sky-500/5': $route.path.includes('/appointments/me') }"
                        @click="closeMobileMenu">
                        My schedule
                    </router-link>
                    <div class="border-t border-gray-200 pt-4 pb-3">
                        <div class="flex items-center px-3 mb-3">
                            <div
                                class="w-10 h-10 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <span class="text-white font-semibold">{{ authStore.user?.firstName?.[0] }}</span>
                            </div>
                            <div class="ml-3">
                                <div class="text-base font-medium text-gray-800">{{ authStore.user?.firstName }} {{
                                    authStore.user?.lastName }}</div>
                                <div class="text-sm font-medium text-gray-500">{{ authStore.user?.email }}</div>
                            </div>
                        </div>
                        <router-link :to="authStore.isProvider ? '/profile/me' : '/profile/me'"
                            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-sky-500 hover:bg-sky-500/5 transition-colors duration-200"
                            @click="closeMobileMenu">
                            My profile
                        </router-link>
                        <router-link to="/profile/me/edit"
                            class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-sky-500 hover:bg-sky-500/5 transition-colors duration-200"
                            @click="closeMobileMenu">
                            Edit profile
                        </router-link>
                        <button @click="logout"
                            class="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors duration-200">
                            Sign out
                        </button>
                    </div>
                </template>
                <template v-else>
                    <div class="border-t border-gray-200 pt-4 pb-3 space-y-2">
                        <router-link to="/login"
                            class="block px-3 py-2 text-base font-medium text-sky-500 hover:text-emerald-500 transition-colors duration-200"
                            @click="closeMobileMenu">
                            Sign in
                        </router-link>
                        <router-link to="/register" class="block mx-3 btn-element-primary text-center text-sm"
                            @click="closeMobileMenu">
                            Get started
                        </router-link>
                    </div>
                </template>
            </div>
        </div>
    </nav>
</template>

<script setup>
import { Bars3Icon, XMarkIcon, ChevronDownIcon, UserIcon, ArrowRightOnRectangleIcon } from "@heroicons/vue/24/outline";
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showMobileMenu = ref(false)
const showProfileMenu = ref(false)
const profileMenuRef = ref(null)
const mobileMenuRef = ref(null)

const appTitle = import.meta.env.VITE_APP_TITLE
const appTitle1 = import.meta.env.VITE_APP_TITLE_1  
const appTitle2 = import.meta.env.VITE_APP_TITLE_2
const appTitle3 = import.meta.env.VITE_APP_TITLE_3

const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
    showProfileMenu.value = false
}

const closeMobileMenu = () => {
    showMobileMenu.value = false
}

const toggleProfileMenu = () => {
    showProfileMenu.value = !showProfileMenu.value
    showMobileMenu.value = false
}

const logout = async () => {
    await authStore.logout()
    showProfileMenu.value = false
    showMobileMenu.value = false
    router.push('/')
}

// Click outside handler
const handleClickOutside = (event) => {
    // Close profile menu if clicking outside of it
    if (profileMenuRef.value && !profileMenuRef.value.contains(event.target)) {
        showProfileMenu.value = false
    }
    
    // Close mobile menu if clicking outside of it
    if (mobileMenuRef.value && !mobileMenuRef.value.contains(event.target)) {
        showMobileMenu.value = false
    }
}

// Setup click outside listener
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

// Cleanup listener
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>