<!-- frontend/src/views/courses/client/CourseLearn.vue -->
<!-- This is the enrolled course outline page: /courses/:id/learn -->
<template>
    <div class="min-h-screen bg-slate-50">

        <div v-if="loading" class="flex items-center justify-center py-32">
            <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="course">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <!-- Course header -->
                <div class="flex items-center gap-5 mb-8">
                    <div class="w-16 h-16 rounded-2xl bg-gray-200 overflow-hidden shrink-0">
                        <img v-if="course.thumbnail" :src="$uploadsUrl(course.thumbnail)"
                            class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <BookOpenIcon class="w-7 h-7 text-gray-400" />
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-2xl font-bold text-gray-900 truncate">{{ course.title }}</h1>
                        <p class="text-sm text-gray-500 mt-0.5">{{ [course.category,
                        course.subcategory].filter(Boolean).join(' • ') }}</p>
                    </div>
                </div>

                <!-- Progress bar (clients only) -->
                <div v-if="!isProviderPreview" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-700">Your Progress</span>
                        <span class="text-sm font-bold text-sky-500">{{ progress?.percentComplete || 0 }}%</span>
                    </div>
                    <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-sky-500 rounded-full transition-all duration-500"
                            :style="{ width: (progress?.percentComplete || 0) + '%' }"></div>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                        {{ progress?.completedLessons?.length || 0 }} of {{ totalLessons }} lessons completed
                    </p>
                </div>

                <!-- Provider preview banner -->
                <div v-if="isProviderPreview"
                    class="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm text-amber-700">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <strong>Preview Mode</strong> — you're viewing this as a student would see it.
                    </div>
                    <button @click="$router.push(`/courses/${courseId}/builder`)"
                        class="text-xs font-semibold text-amber-600 hover:text-amber-800 underline underline-offset-2">
                        Back to Builder
                    </button>
                </div>

                <!-- Curriculum -->
                <div class="space-y-3">
                    <div v-for="(block, bi) in course.blocks" :key="block._id"
                        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <!-- Block header -->
                        <button
                            class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                            @click="toggleBlock(block._id)">
                            <div>
                                <span class="font-semibold text-gray-900">Block {{ bi + 1 }}: {{ block.title }}</span>
                                <span class="ml-2 text-xs text-gray-400">
                                    {{ blockLessonCount(block) }} lessons
                                    <template v-if="block.quiz?.questions?.length"> · block quiz</template>
                                </span>
                            </div>
                            <ChevronDownIcon class="w-4 h-4 text-gray-400 transition-transform"
                                :class="{ 'rotate-180': expanded[block._id] }" />
                        </button>

                        <div v-if="expanded[block._id]" class="border-t border-gray-50 divide-y divide-gray-50">
                            <div v-for="topic in block.topics" :key="topic._id" class="px-6 py-3">
                                <p class="text-sm font-semibold text-gray-600 mb-2">{{ topic.title }}</p>

                                <div class="space-y-1">
                                    <div v-for="lesson in topic.lessons" :key="lesson._id"
                                        class="flex items-center gap-3 py-2 px-2 rounded-xl cursor-pointer hover:bg-sky-50 transition-colors group"
                                        @click="$router.push(`/courses/${course._id}/lesson/${lesson._id}`)">
                                        <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                            :class="isLessonComplete(lesson._id)
                                                ? 'bg-emerald-100'
                                                : 'bg-gray-100 group-hover:bg-sky-100'">
                                            <CheckCircleIcon v-if="isLessonComplete(lesson._id)"
                                                class="w-4 h-4 text-emerald-500" />
                                            <PlayIcon v-else class="w-3 h-3 text-gray-400 group-hover:text-sky-500" />
                                        </div>
                                        <span class="text-sm text-gray-700 flex-1">{{ lesson.title }}</span>
                                        <ChevronRightIcon
                                            class="w-4 h-4 text-gray-300 group-hover:text-sky-400 transition-colors" />
                                    </div>
                                </div>

                                <!-- Topic quiz -->
                                <div v-if="topic.quiz?.questions?.length" class="mt-1">
                                    <div class="flex items-center gap-3 py-2 px-2 rounded-xl cursor-pointer hover:bg-violet-50 transition-colors group"
                                        @click="$router.push(`/courses/${course._id}/lesson/${topic.lessons[0]?._id}#quiz-topic-${topic._id}`)">
                                        <div
                                            class="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                                            <QuestionMarkCircleIcon class="w-3.5 h-3.5 text-violet-500" />
                                        </div>
                                        <span class="text-sm text-violet-600 font-medium">Topic Quiz · {{
                                            topic.quiz.questions.length }}
                                            questions</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Block quiz -->
                            <div v-if="block.quiz?.questions?.length" class="px-6 py-3">
                                <div
                                    class="flex items-center gap-3 py-2 px-2 rounded-xl cursor-pointer hover:bg-sky-50 transition-colors group">
                                    <div
                                        class="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                                        <QuestionMarkCircleIcon class="w-3.5 h-3.5 text-sky-500" />
                                    </div>
                                    <span class="text-sm text-sky-600 font-medium">Block Quiz · {{
                                        block.quiz.questions.length }}
                                        questions</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Rating card (clients only) -->
                <div v-if="!isProviderPreview"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 class="text-base font-semibold text-gray-800 mb-1">Rate this course</h3>
                    <p class="text-xs text-gray-400 mb-4">Your feedback helps the instructor improve.</p>

                    <div class="flex items-center gap-2">
                        <button v-for="star in 5" :key="star" @click="hoverRating = 0; submitRating(star)"
                            @mouseenter="hoverRating = star" @mouseleave="hoverRating = 0" class="transition-colors"
                            :disabled="ratingSubmitting">
                            <svg class="w-8 h-8 transition-colors" :class="star <= (hoverRating || submittedRating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'" viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </button>
                        <span v-if="ratingSubmitting" class="text-xs text-gray-400 ml-2">Saving…</span>
                        <span v-else-if="submittedRating" class="text-xs text-emerald-500 ml-2 font-semibold">
                            Thanks for your rating!
                        </span>
                    </div>

                    <p v-if="courseAvgRating" class="text-xs text-gray-400 mt-3">
                        Course average: <span class="font-semibold text-gray-600">{{ courseAvgRating }} / 5</span>
                        ({{ courseTotalRatings }} {{ courseTotalRatings === 1 ? 'rating' : 'ratings' }})
                    </p>
                </div>
            </div>
        </template>

        <div v-else class="flex items-center justify-center py-32 text-gray-400 text-sm">
            Course not found or you don't have access.
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    BookOpenIcon, ChevronDownIcon, ChevronRightIcon,
    CheckCircleIcon, PlayIcon, QuestionMarkCircleIcon
} from '@heroicons/vue/24/outline'
import axios from '@/plugins/axios'
import { useCourseStore } from '@/stores/course'
import { useAuthStore } from '@/stores/auth'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl, modal } = useGlobals()

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const authStore = useAuthStore()
const courseId = route.params.id
const loading = ref(true)
const course = ref(null)
const progress = ref(null)

const isProviderPreview = computed(() => {
    if (!course.value || !authStore.user) return false
    return course.value.provider?._id === authStore.user._id
        || course.value.provider === authStore.user._id
})

const expanded = reactive({})

const totalLessons = computed(() =>
    course.value?.blocks?.reduce((t, b) => t + b.topics.reduce((tt, tp) => tt + tp.lessons.length, 0), 0) || 0
)

function toggleBlock(id) { expanded[id] = !expanded[id] }
function blockLessonCount(block) { return block.topics.reduce((t, tp) => t + tp.lessons.length, 0) }
function isLessonComplete(id) {
    return progress.value?.completedLessons?.some(cl => cl.lessonId === id || cl.lessonId?.toString() === id)
}

const submittedRating = ref(0)
const hoverRating = ref(0)
const ratingSubmitting = ref(false)
const courseAvgRating = ref(null)
const courseTotalRatings = ref(0)

async function submitRating(value) {
    if (ratingSubmitting.value) return
    ratingSubmitting.value = true
    try {
        const res = await axios.post(`/courses/${courseId}/rate`, { value })
        submittedRating.value = value
        courseAvgRating.value = res.data.data.averageRating
        courseTotalRatings.value = res.data.data.totalRatings
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to submit rating')
    } finally {
        ratingSubmitting.value = false
    }
}

onMounted(async () => {
    loading.value = true
    try {
        const result = await courseStore.getCourseContent(courseId)
        course.value = result.data
        progress.value = result.progress || null
        // Default all blocks open
        course.value?.blocks?.forEach(b => { expanded[b._id] = true })
    } catch (e) {
        console.error('CourseLearn load error:', e)
    } finally {
        loading.value = false
    }
})
</script>