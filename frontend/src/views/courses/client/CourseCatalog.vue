<!-- frontend/src/views/courses/client/CourseCatalog.vue -->
<template>
    <div class="min-h-screen bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Find Courses</h1>
                <p class="mt-1 text-gray-500">Expand your skills with expert-led programs.</p>
            </div>

            <!-- Search + filter -->
            <div class="flex flex-col sm:flex-row gap-3 mb-8">
                <div class="relative flex-1">
                    <MagnifyingGlassIcon class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input v-model="searchInput" type="text" placeholder="Search courses…"
                        class="input w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                        @keyup.enter="doSearch" />
                </div>
                <input v-model="categoryInput" type="text" placeholder="Category…"
                    class="input sm:w-48 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                    @keyup.enter="doSearch" />
                <button @click="doSearch"
                    class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                    Search
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-24">
                <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Empty -->
            <div v-else-if="!courses.length" class="text-center py-24 text-gray-400">
                <AcademicCapIcon class="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p class="font-medium">No courses found</p>
                <p class="text-sm mt-1">Try a different search or category.</p>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="course in courses" :key="course._id"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-shadow"
                    @click="$router.push(`/courses/${course._id}`)">
                    <!-- Thumbnail -->
                    <div class="h-44 bg-gray-100 overflow-hidden">
                        <img v-if="course.thumbnail" :src="course.thumbnail" :alt="course.title"
                            class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <BookOpenIcon class="w-12 h-12 text-gray-300" />
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="p-5 flex flex-col flex-1">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            {{ [course.category, course.subcategory].filter(Boolean).join(' • ') || 'General' }}
                        </p>
                        <h3 class="font-bold text-gray-900 text-base mb-3 line-clamp-2 flex-1">{{ course.title }}</h3>

                        <!-- Provider -->
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-6 h-6 rounded-full bg-sky-100 overflow-hidden">
                                <img v-if="course.provider?.profilePicture" :src="course.provider.profilePicture"
                                    class="w-full h-full object-cover" />
                                <div v-else
                                    class="w-full h-full flex items-center justify-center text-sky-600 text-xs font-bold">
                                    {{ course.provider?.firstName?.[0] }}
                                </div>
                            </div>
                            <span class="text-xs text-gray-500">{{ course.provider?.firstName }} {{
                                course.provider?.lastName }}</span>
                        </div>

                        <!-- Stats row -->
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3 text-sm text-gray-500">
                                <span class="flex items-center gap-1">
                                    <BookmarkIcon class="w-4 h-4" />
                                    {{ lessonCount(course) }} lessons
                                </span>
                                <span v-if="avgRating(course)" class="flex items-center gap-1">
                                    <StarIcon class="w-4 h-4 text-amber-400 fill-amber-400" />
                                    {{ avgRating(course) }}
                                </span>
                            </div>
                            <span class="text-sm font-bold text-gray-900">
                                {{ course.price === 0 ? 'Free' : course.price.toLocaleString() + ' UZS' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-10">
                <button v-for="p in totalPages" :key="p" @click="goToPage(p)"
                    class="w-9 h-9 rounded-xl text-sm font-semibold transition-colors" :class="p === currentPage
                        ? 'bg-sky-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-sky-300'">
                    {{ p }}
                </button>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MagnifyingGlassIcon, BookOpenIcon, AcademicCapIcon, StarIcon, BookmarkIcon } from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const courses = ref([])
const total = ref(0)
const currentPage = ref(1)
const limit = 12

const searchInput = ref(route.query.search || '')
const categoryInput = ref(route.query.category || '')

const totalPages = computed(() => Math.ceil(total.value / limit))

function lessonCount(course) {
    return course.blocks?.reduce((t, b) => t + b.topics.reduce((tt, tp) => tt + tp.lessons.length, 0), 0) || 0
}

function avgRating(course) {
    if (!course.ratings?.length) return null
    return (course.ratings.reduce((s, r) => s + r.value, 0) / course.ratings.length).toFixed(1)
}

function doSearch() {
    currentPage.value = 1
    router.replace({ query: { search: searchInput.value || undefined, category: categoryInput.value || undefined } })
    load()
}

async function goToPage(p) {
    currentPage.value = p
    await load()
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function load() {
    loading.value = true
    try {
        const result = await courseStore.browseCourses({
            page: currentPage.value,
            limit,
            search: searchInput.value || undefined,
            category: categoryInput.value || undefined
        })
        courses.value = result.data
        total.value = result.total
    } catch (e) {
        console.error('browseCourses error:', e)
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>