<!-- frontend/src/views/courses/provider/CourseDashboard.vue -->
<template>
    <div class="min-h-screen bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Global Performance</h1>
                <p class="mt-1 text-gray-500">A holistic view of your impact and revenue across all programs.</p>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-24">
                <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <template v-else-if="data">
                <!-- Stat cards -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div class="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center mb-4">
                            <ChartBarIcon class="w-5 h-5 text-sky-500" />
                        </div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Gross Revenue</p>
                        <p class="text-2xl font-bold text-gray-900">
                            {{ formatRevenue(data.grossRevenue) }}
                        </p>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div class="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                            <AcademicCapIcon class="w-5 h-5 text-emerald-500" />
                        </div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
                        <p class="text-2xl font-bold text-gray-900">{{ data.totalStudents.toLocaleString() }}</p>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div class="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                            <StarIcon class="w-5 h-5 text-violet-500" />
                        </div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Average Rating</p>
                        <p class="text-2xl font-bold text-gray-900">{{ data.averageRating || '—' }}</p>
                    </div>

                    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div class="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                            <BookOpenIcon class="w-5 h-5 text-orange-500" />
                        </div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Active Assets</p>
                        <p class="text-2xl font-bold text-gray-900">{{ data.activeAssets }}</p>
                    </div>
                </div>

                <!-- Chart + Top Performers -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <!-- Acquisition Volume chart -->
                    <div class="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 class="text-lg font-semibold text-gray-900 mb-6">Acquisition Volume</h2>

                        <div v-if="!data.acquisitionVolume.length"
                            class="flex items-center justify-center h-48 text-gray-400 text-sm">
                            No course data yet
                        </div>

                        <div v-else class="relative">
                            <!-- Y-axis labels + bars -->
                            <div class="flex items-end gap-6" :style="{ height: '260px' }">
                                <!-- Y-axis -->
                                <div
                                    class="flex flex-col justify-between h-full pb-6 pr-2 text-xs text-gray-400 text-right shrink-0 w-10">
                                    <span>{{ yMax }}</span>
                                    <span>{{ Math.round(yMax * 0.75) }}</span>
                                    <span>{{ Math.round(yMax * 0.5) }}</span>
                                    <span>{{ Math.round(yMax * 0.25) }}</span>
                                    <span>0</span>
                                </div>
                                <!-- Bars -->
                                <div class="flex items-end gap-3 flex-1 h-full pb-6">
                                    <div v-for="(item, i) in chartBars" :key="item.courseId"
                                        class="flex flex-col items-center flex-1 h-full justify-end">
                                        <div class="w-full rounded-t-lg transition-all duration-500" :style="{
                                            height: item.barHeight + 'px',
                                            background: i % 2 === 0 ? '#3b82f6' : '#a855f7'
                                        }"></div>
                                        <p class="mt-2 text-xs text-gray-500 truncate w-full text-center">
                                            {{ truncate(item.title, 14) }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Performers dark card -->
                    <div class="bg-gray-900 rounded-2xl p-6 text-white flex flex-col">
                        <h2 class="text-lg font-semibold mb-5">Top Performers</h2>

                        <div class="space-y-3 flex-1">
                            <div v-for="course in data.topPerformers.slice(0, 5)" :key="course.courseId"
                                class="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                                @click="$router.push(`/courses/${course.courseId}/builder`)">
                                <div class="flex items-center gap-3 min-w-0">
                                    <div
                                        class="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                                        <BookOpenIcon class="w-5 h-5 text-white/60" />
                                    </div>
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium truncate">{{ truncate(course.title, 22) }}</p>
                                        <p class="text-xs text-gray-400 uppercase tracking-wider">{{
                                            course.students.toLocaleString() }} STUDENTS</p>
                                    </div>
                                </div>
                                <ChevronRightIcon class="w-4 h-4 text-gray-500 shrink-0 ml-2" />
                            </div>

                            <div v-if="!data.topPerformers.length" class="text-gray-500 text-sm text-center py-4">
                                No courses yet
                            </div>
                        </div>

                        <!-- Quality score -->
                        <div v-if="data.averageRating" class="mt-6 pt-5 border-t border-white/10">
                            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Instructor
                                Quality Score</p>
                            <div class="flex gap-1 mb-2">
                                <StarIcon v-for="i in 5" :key="i" class="w-5 h-5"
                                    :class="i <= Math.round(data.averageRating) ? 'text-sky-400 fill-sky-400' : 'text-gray-600'" />
                            </div>
                            <p class="text-base font-bold italic">"{{ qualityLabel }}"</p>
                        </div>
                    </div>

                </div>
            </template>

            <!-- Error -->
            <div v-else-if="error" class="text-center py-24 text-gray-500">
                <p>Failed to load dashboard. <button class="text-sky-500 hover:underline" @click="load">Retry</button>
                </p>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChartBarIcon, AcademicCapIcon, StarIcon, BookOpenIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'

const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const error = ref(null)
const data = ref(null)

const BAR_MAX_HEIGHT = 200

const yMax = computed(() => {
    if (!data.value?.acquisitionVolume.length) return 0
    return Math.max(...data.value.acquisitionVolume.map(d => d.students))
})

const chartBars = computed(() => {
    if (!data.value?.acquisitionVolume.length) return []
    const max = yMax.value || 1
    return data.value.acquisitionVolume.map(d => ({
        ...d,
        barHeight: Math.max(8, Math.round((d.students / max) * BAR_MAX_HEIGHT))
    }))
})

const qualityLabel = computed(() => {
    const r = data.value?.averageRating || 0
    if (r >= 4.8) return 'Exceptional pedagogy'
    if (r >= 4.5) return 'Outstanding educator'
    if (r >= 4.0) return 'Highly effective'
    if (r >= 3.5) return 'Good standing'
    return 'Room to grow'
})

function formatRevenue(val) {
    if (!val) return '0 UZS'
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}B UZS`
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M UZS`
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k UZS`
    return `${val} UZS`
}

function truncate(str, len) {
    return str?.length > len ? str.slice(0, len) + '…' : str
}

async function load() {
    loading.value = true
    error.value = null
    try {
        data.value = await courseStore.fetchDashboard()
    } catch (e) {
        error.value = e?.response?.data?.message || 'Failed to load'
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>