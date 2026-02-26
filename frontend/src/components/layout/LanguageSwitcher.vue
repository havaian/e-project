<!-- frontend/src/components/layout/LanguageSwitcher.vue -->
<template>
    <div class="relative" ref="dropdownRef">
        <button @click.stop="toggleDropdown"
            class="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            :title="$t('nav.changeLanguage')">
            <span class="text-base leading-none">{{ currentLocaleFlag }}</span>
            <span class="uppercase text-xs font-semibold">{{ currentLocaleCode }}</span>
            <ChevronDownIcon :class="[
                'h-3.5 w-3.5 text-gray-400 transition-transform duration-100',
                isOpen ? 'rotate-180' : ''
            ]" />
        </button>

        <div v-if="isOpen"
            class="absolute right-0 mt-1.5 w-44 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100 py-1 z-50">
            <button v-for="locale in locales" :key="locale.code" @click="switchLocale(locale.code)"
                class="w-full flex items-center space-x-3 px-4 py-2.5 text-sm transition-colors duration-150" :class="locale.code === currentLocaleCode
                    ? 'bg-sky-50 text-sky-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'">
                <span class="text-base leading-none">{{ locale.flag }}</span>
                <span>{{ locale.name }}</span>
                <CheckIcon v-if="locale.code === currentLocaleCode" class="w-4 h-4 ml-auto text-sky-500" />
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'
import { availableLocales, changeLocale } from '@/utils/i18n'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const { locale } = useI18n()
const authStore = useAuthStore()

const isOpen = ref(false)
const dropdownRef = ref(null)

const locales = availableLocales

const currentLocaleCode = computed(() => locale.value)

const currentLocaleFlag = computed(() => {
    const found = locales.find(l => l.code === locale.value)
    return found?.flag || '🌐'
})

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const switchLocale = async (newLocale) => {
    if (newLocale === locale.value) {
        isOpen.value = false
        return
    }

    // Change frontend locale (localStorage + i18n)
    await changeLocale(newLocale)

    // Persist to backend if user is authenticated
    if (authStore.isAuthenticated) {
        try {
            await axios.patch('/users/me/preferences', {
                preferences: { language: newLocale }
            })

            // Update local user object so it stays in sync
            if (authStore.user) {
                if (!authStore.user.preferences) {
                    authStore.user.preferences = {}
                }
                authStore.user.preferences.language = newLocale
                localStorage.setItem('user', JSON.stringify(authStore.user))
            }
        } catch (error) {
            console.error('Error saving language preference:', error)
            // Frontend locale is already changed — backend will catch up next time
        }
    }

    isOpen.value = false
}

const handleClickOutside = (event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>