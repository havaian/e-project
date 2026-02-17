<!-- frontend/src/views/courses/client/CourseDetail.vue -->
<template>
    <div class="min-h-screen bg-slate-50">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-32">
            <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="course">
            <!-- Hero -->
            <div class="bg-gray-900 text-white">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-10 items-start">

                    <!-- Left: info -->
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-3">
                            {{ [course.category, course.subcategory].filter(Boolean).join(' • ') || 'Course' }}
                        </p>
                        <h1 class="text-3xl font-bold mb-4 leading-tight">{{ course.title }}</h1>
                        <p v-if="course.description" class="text-gray-400 text-sm leading-relaxed mb-6">
                            {{ course.description }}
                        </p>

                        <!-- Provider info -->
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                <img v-if="course.provider?.profilePicture" :src="$uploadsUrl(course.provider?.profilePicture)"
                                    class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                    {{ course.provider?.firstName?.[0] }}
                                </div>
                            </div>
                            <div>
                                <p class="text-sm font-semibold">{{ course.provider?.firstName }} {{
                                    course.provider?.lastName }}</p>
                                <p class="text-xs text-gray-400">Instructor</p>
                            </div>
                        </div>

                        <!-- Stat chips -->
                        <div class="flex flex-wrap gap-3 mt-5">
                            <div
                                class="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium">
                                <BookmarkIcon class="w-3.5 h-3.5 text-sky-400" />
                                {{ totalLessons }} lessons
                            </div>
                            <div
                                class="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium">
                                <CubeIcon class="w-3.5 h-3.5 text-sky-400" />
                                {{ course.blocks?.length || 0 }} blocks
                            </div>
                            <div v-if="avgRating"
                                class="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs font-medium">
                                <StarIcon class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                {{ avgRating }}
                            </div>
                        </div>
                    </div>

                    <!-- Right: enroll card -->
                    <div class="w-full lg:w-72 shrink-0 bg-white rounded-2xl shadow-2xl overflow-hidden text-gray-900">
                        <div class="h-36 bg-gray-100 overflow-hidden">
                            <img v-if="course.thumbnail" :src="$uploadsUrl(course.thumbnail)" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center">
                                <BookOpenIcon class="w-12 h-12 text-gray-300" />
                            </div>
                        </div>
                        <div class="p-5">
                            <p class="text-2xl font-bold mb-1">
                                {{ course.price === 0 ? 'Free' : course.price.toLocaleString() + ' UZS' }}
                            </p>

                            <!-- Already enrolled -->
                            <div v-if="isEnrolled">
                                <button @click="$router.push(`/courses/${course._id}/learn`)"
                                    class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-3">
                                    Continue Learning →
                                </button>
                            </div>

                            <!-- Not authenticated -->
                            <div v-else-if="!authStore.isAuthenticated">
                                <button @click="$router.push('/login')"
                                    class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-3">
                                    Sign in to Enroll
                                </button>
                            </div>

                            <!-- Provider viewing own/other course -->
                            <div v-else-if="authStore.isProvider">
                                <p class="text-xs text-gray-500 text-center mt-3">Provider accounts cannot enroll in
                                    courses.</p>
                            </div>

                            <!-- Enroll -->
                            <div v-else>
                                <button @click="handleEnroll" :disabled="enrolling"
                                    class="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors text-sm mt-3">
                                    {{ enrolling ? 'Processing…' : (course.price === 0 ? 'Enroll for Free' : 'Enroll Now') }}
                                </button>
                                <p class="text-xs text-gray-400 text-center mt-2">No hidden fees</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Curriculum -->
            <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <h2 class="text-xl font-bold text-gray-900 mb-5">Course Curriculum</h2>

                <div class="space-y-3">
                    <div v-for="(block, bi) in course.blocks" :key="block._id"
                        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <!-- Block header -->
                        <button
                            class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                            @click="toggleBlock(block._id)">
                            <div>
                                <span class="font-semibold text-gray-900">Block {{ bi + 1 }}: {{ block.title }}</span>
                                <span class="ml-3 text-xs text-gray-400">
                                    {{ blockLessonCount(block) }} lessons
                                    <template v-if="block.quiz?.questions?.length"> · quiz</template>
                                </span>
                            </div>
                            <ChevronDownIcon class="w-4 h-4 text-gray-400 transition-transform"
                                :class="{ 'rotate-180': expanded[block._id] }" />
                        </button>

                        <!-- Topics -->
                        <div v-if="expanded[block._id]" class="border-t border-gray-50 divide-y divide-gray-50">
                            <div v-for="topic in block.topics" :key="topic._id" class="px-6 py-3">
                                <p class="text-sm font-semibold text-gray-700 mb-2">{{ topic.title }}</p>
                                <div class="space-y-1">
                                    <div v-for="lesson in topic.lessons" :key="lesson._id"
                                        class="flex items-center gap-2 text-sm text-gray-500 py-1">
                                        <LockClosedIcon v-if="!isEnrolled" class="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                        <PlayIcon v-else class="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                        <span>{{ lesson.title }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Error -->
        <div v-else class="flex items-center justify-center py-32 text-gray-400">
            <p>Course not found.</p>
        </div>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    BookOpenIcon, StarIcon, BookmarkIcon, CubeIcon,
    ChevronDownIcon, LockClosedIcon, PlayIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl } = useGlobals()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()

const courseId = route.params.id
const loading = ref(true)
const enrolling = ref(false)
const course = ref(null)
const isEnrolled = ref(false)

const expanded = reactive({})

const totalLessons = computed(() =>
    course.value?.blocks?.reduce((t, b) => t + b.topics.reduce((tt, tp) => tt + tp.lessons.length, 0), 0) || 0
)

const avgRating = computed(() => {
    if (!course.value?.ratings?.length) return null
    return (course.value.ratings.reduce((s, r) => s + r.value, 0) / course.value.ratings.length).toFixed(1)
})

function toggleBlock(id) {
    expanded[id] = !expanded[id]
}

function blockLessonCount(block) {
    return block.topics.reduce((t, tp) => t + tp.lessons.length, 0)
}

async function handleEnroll() {
    enrolling.value = true
    try {
        const result = await courseStore.initiateEnrollment(courseId)

        if (result.free) {
            // Free course — directly navigate to learn
            router.push(`/courses/${courseId}/learn`)
        } else {
            // Paid — redirect to Stripe
            window.location.href = result.checkoutUrl
        }
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Enrollment failed. Please try again.')
    } finally {
        enrolling.value = false
    }
}

async function load() {
    loading.value = true
    try {
        // Try to load full content (works if enrolled or provider)
        try {
            const contentResult = await courseStore.getCourseContent(courseId)
            course.value = contentResult.data
            isEnrolled.value = true
        } catch {
            // Not enrolled or not authenticated — load public view
            course.value = await courseStore.getCoursePublic(courseId)
            isEnrolled.value = false
        }

        // Default all blocks expanded
        course.value?.blocks?.forEach(b => { expanded[b._id] = false })
    } catch (e) {
        console.error('CourseDetail load error:', e)
        course.value = null
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>