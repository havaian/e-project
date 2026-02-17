<!-- frontend/src/views/courses/provider/CoursePortfolio.vue -->
<template>
    <div class="min-h-screen bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <!-- Header -->
            <div class="flex items-start justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">Your Portfolio</h1>
                    <p class="mt-1 text-gray-500">Create and manage your professional curriculum.</p>
                </div>
                <button @click="showNewModal = true"
                    class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-2xl transition-colors shadow-lg shadow-sky-500/20">
                    <PlusIcon class="w-4 h-4" />
                    New Course
                </button>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-24">
                <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <!-- Empty -->
            <div v-else-if="!courses.length" class="text-center py-24">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpenIcon class="w-8 h-8 text-gray-400" />
                </div>
                <h3 class="text-lg font-semibold text-gray-700 mb-1">No courses yet</h3>
                <p class="text-gray-400 text-sm mb-6">Create your first course to get started.</p>
                <button @click="showNewModal = true"
                    class="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors">
                    <PlusIcon class="w-4 h-4" /> New Course
                </button>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="course in courses" :key="course._id"
                    class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <!-- Thumbnail -->
                    <div class="relative h-44 bg-gray-100">
                        <img v-if="course.thumbnail" :src="$uploadsUrl(course.thumbnail)" :alt="course.title"
                            class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <BookOpenIcon class="w-12 h-12 text-gray-300" />
                        </div>
                        <!-- Status badge -->
                        <span class="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full" :class="{
                            'bg-emerald-100 text-emerald-700': course.status === 'published',
                            'bg-amber-100 text-amber-700': course.status === 'draft',
                            'bg-gray-200 text-gray-600': course.status === 'archived'
                        }">
                            {{ course.status.toUpperCase() }}
                        </span>
                    </div>

                    <!-- Body -->
                    <div class="p-5 flex flex-col flex-1">
                        <h3 class="font-bold text-gray-900 text-base mb-1 line-clamp-2">{{ course.title }}</h3>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                            {{ [course.category, course.subcategory].filter(Boolean).join(' • ') || 'Uncategorized' }}
                        </p>

                        <div class="flex items-center gap-4 text-sm text-gray-600 mb-5">
                            <span class="flex items-center gap-1.5">
                                <AcademicCapIcon class="w-4 h-4 text-sky-500" />
                                {{ course.studentCount || 0 }} Students
                            </span>
                            <span v-if="avgRating(course)" class="flex items-center gap-1.5">
                                <StarIcon class="w-4 h-4 text-amber-400 fill-amber-400" />
                                {{ avgRating(course) }}
                            </span>
                        </div>

                        <div class="flex gap-2 mt-auto">
                            <button @click="$router.push(`/courses/${course._id}/builder`)"
                                class="flex-1 bg-gray-900 hover:bg-gray-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors tracking-wide">
                                MANAGE
                            </button>
                            <button @click="$router.push(`/courses/${course._id}`)"
                                class="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors tracking-wide">
                                PREVIEW
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- New Course Modal -->
        <Teleport to="body">
            <div v-if="showNewModal"
                class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div class="flex items-center justify-between mb-5">
                        <h2 class="text-xl font-bold text-gray-900">New Course</h2>
                        <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <XMarkIcon class="w-5 h-5" />
                        </button>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Title <span
                                    class="text-red-500">*</span></label>
                            <input v-model="newCourse.title" type="text"
                                placeholder="e.g. Modern React & TypeScript Mastery"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                            <input v-model="newCourse.category" type="text" placeholder="e.g. Web Programming"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Subcategory</label>
                            <input v-model="newCourse.subcategory" type="text" placeholder="e.g. Development"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Price (UZS)</label>
                            <input v-model.number="newCourse.price" type="number" min="0" placeholder="0 for free"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button @click="closeModal"
                            class="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                            Cancel
                        </button>
                        <button @click="handleCreate" :disabled="!newCourse.title.trim() || creating"
                            class="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            <span v-if="creating">Creating…</span>
                            <span v-else>Create & Open Builder</span>
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon, BookOpenIcon, AcademicCapIcon, StarIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl } = useGlobals()

const router = useRouter()
const courseStore = useCourseStore()

const loading = ref(true)
const courses = ref([])
const showNewModal = ref(false)
const creating = ref(false)

const newCourse = ref({ title: '', category: '', subcategory: '', price: 0 })

function avgRating(course) {
    if (!course.ratings?.length) return null
    const sum = course.ratings.reduce((s, r) => s + r.value, 0)
    return (sum / course.ratings.length).toFixed(1)
}

function closeModal() {
    showNewModal.value = false
    newCourse.value = { title: '', category: '', subcategory: '', price: 0 }
}

async function load() {
    loading.value = true
    try {
        courses.value = await courseStore.fetchMyCourses()
    } catch (e) {
        console.error('fetchMyCourses error:', e)
    } finally {
        loading.value = false
    }
}

async function handleCreate() {
    if (!newCourse.value.title.trim()) return
    creating.value = true
    try {
        const created = await courseStore.createCourse({
            title: newCourse.value.title.trim(),
            category: newCourse.value.category.trim(),
            subcategory: newCourse.value.subcategory.trim(),
            price: newCourse.value.price || 0
        })
        toast.success('Course created!')
        router.push(`/courses/${created._id}/builder`)
    } catch (e) {
        console.error('createCourse error:', e)
        toast.error(e?.response?.data?.message || 'Failed to create course')
    } finally {
        creating.value = false
    }
}

onMounted(load)
</script>