<!-- frontend/src/views/courses/client/MyLearning.vue -->
<template>
    <div class="min-h-screen bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">My Learning</h1>
                <p class="mt-1 text-gray-500">Pick up where you left off on your transformation path.</p>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-24">
                <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <!-- Enrolled course cards -->
                <div v-for="enrollment in enrollments" :key="enrollment._id"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <!-- Thumbnail -->
                    <div class="h-44 bg-gray-100 overflow-hidden relative">
                        <img v-if="enrollment.course?.thumbnail" :src="$uploadsUrl(enrollment.course?.thumbnail)"
                            :alt="enrollment.course.title" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <BookOpenIcon class="w-12 h-12 text-gray-300" />
                        </div>
                        <!-- Completed badge -->
                        <div v-if="enrollment.status === 'completed'"
                            class="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckCircleIcon class="w-3.5 h-3.5" />
                            Completed
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="p-5 flex flex-col flex-1">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {{ [enrollment.course?.category, enrollment.course?.subcategory].filter(Boolean).join(' • ')
                            || 'Course' }}
                        </p>
                        <h3 class="font-bold text-gray-900 text-base mb-4 line-clamp-2 flex-1">
                            {{ enrollment.course?.title }}
                        </h3>

                        <!-- Progress -->
                        <div class="mb-4">
                            <div class="flex items-center justify-between mb-1.5">
                                <span class="text-xs font-semibold text-sky-500">
                                    {{ enrollment.progress?.percentComplete || 0 }}% COMPLETED
                                </span>
                                <span class="text-xs text-gray-400">TARGET: 100%</span>
                            </div>
                            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-sky-500 rounded-full transition-all duration-500"
                                    :style="{ width: (enrollment.progress?.percentComplete || 0) + '%' }"></div>
                            </div>
                        </div>

                        <button @click="$router.push(`/courses/${enrollment.course?._id}/learn`)"
                            class="w-full bg-gray-900 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide flex items-center justify-center gap-2">
                            {{ enrollment.status === 'completed' ? 'REVIEW' : 'CONTINUE' }}
                            <ArrowRightIcon class="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <!-- Explore More card -->
                <div class="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-10 cursor-pointer hover:border-sky-300 hover:bg-sky-50/30 transition-all min-h-64"
                    @click="$router.push('/courses')">
                    <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <PlusCircleIcon class="w-8 h-8 text-gray-400" />
                    </div>
                    <p class="text-sm font-semibold text-gray-500">Explore More</p>
                </div>

            </div>

            <!-- Empty state (no enrollments) -->
            <div v-if="!loading && !enrollments.length" class="col-span-full text-center py-16">
                <AcademicCapIcon class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <h3 class="font-semibold text-gray-600 mb-1">No courses yet</h3>
                <p class="text-sm text-gray-400 mb-5">Browse the catalog and enroll in your first course.</p>
                <button @click="$router.push('/courses')"
                    class="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    Find Courses
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpenIcon, CheckCircleIcon, ArrowRightIcon, PlusCircleIcon, AcademicCapIcon } from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'

const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const enrollments = ref([])

async function load() {
    loading.value = true
    try {
        enrollments.value = await courseStore.fetchMyLearning()
    } catch (e) {
        console.error('fetchMyLearning error:', e)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>