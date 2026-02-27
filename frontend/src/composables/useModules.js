// frontend/src/composables/useModules.js
//
// Reactive composable for module toggle checks.
// Uses computed refs so templates can use v-if="isCoursesEnabled" etc.
// Values are based on build-time VITE_ env vars and never change at runtime,
// but computed keeps them reactive-friendly for Vue's template compiler.

import { computed } from 'vue'

export function useModules() {
    const isConsultationsEnabled = computed(() => {
        return import.meta.env.VITE_MODULE_CONSULTATIONS_ENABLED !== 'false'
    })

    const isCoursesEnabled = computed(() => {
        return import.meta.env.VITE_MODULE_COURSES_ENABLED !== 'false'
    })

    const isChatEnabled = computed(() => {
        // Chat is available when at least one core module is enabled
        return isConsultationsEnabled.value || isCoursesEnabled.value
    })

    // Inside useModules():
    const isReviewsConsultationsEnabled = computed(() => {
        return import.meta.env.VITE_MODULE_REVIEWS_CONSULTATIONS_ENABLED !== 'false'
    })

    const isReviewsCoursesEnabled = computed(() => {
        return import.meta.env.VITE_MODULE_REVIEWS_COURSES_ENABLED !== 'false'
    })

    const isReviewsBidirectionalEnabled = computed(() => {
        return import.meta.env.VITE_MODULE_REVIEWS_BIDIRECTIONAL_ENABLED === 'true'
    })

    return {
        isConsultationsEnabled,
        isCoursesEnabled,
        isChatEnabled,
        isReviewsConsultationsEnabled,
        isReviewsCoursesEnabled,
        isReviewsBidirectionalEnabled,
    }
}