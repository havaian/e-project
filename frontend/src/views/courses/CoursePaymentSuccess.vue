<!-- frontend/src/views/courses/CoursePaymentSuccess.vue -->
<template>
    <div class="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div class="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-sm w-full p-8 text-center">

            <!-- Loading -->
            <div v-if="loading">
                <div
                    class="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4">
                </div>
                <p class="text-gray-500 text-sm">Confirming your enrollment…</p>
            </div>

            <!-- Success -->
            <template v-else-if="enrollment">
                <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircleIcon class="w-8 h-8 text-emerald-500" />
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">You're Enrolled!</h1>
                <p class="text-gray-500 text-sm mb-1">
                    Successfully enrolled in
                </p>
                <p class="font-semibold text-gray-800 mb-6">{{ enrollment.course?.title }}</p>

                <button @click="$router.push(`/courses/${enrollment.course?._id}/learn`)"
                    class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors text-sm mb-3">
                    Start Learning →
                </button>
                <button @click="$router.push('/courses/my-learning')"
                    class="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors text-sm">
                    My Learning
                </button>
            </template>

            <!-- Failed / not confirmed -->
            <template v-else>
                <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <ExclamationTriangleIcon class="w-8 h-8 text-amber-500" />
                </div>
                <h1 class="text-xl font-bold text-gray-900 mb-2">Payment Not Confirmed</h1>
                <p class="text-gray-500 text-sm mb-6">
                    We couldn't confirm your payment. If you were charged, please contact support.
                </p>
                <button @click="$router.push('/courses')"
                    class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                    Back to Courses
                </button>
            </template>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const enrollment = ref(null)

onMounted(async () => {
    const sessionId = route.query.session_id
    if (!sessionId) {
        loading.value = false
        return
    }
    try {
        const result = await courseStore.confirmEnrollment(sessionId)
        if (result.paid) {
            enrollment.value = result.data
        }
    } catch (e) {
        console.error('confirmEnrollment error:', e)
    } finally {
        loading.value = false
    }
})
</script>