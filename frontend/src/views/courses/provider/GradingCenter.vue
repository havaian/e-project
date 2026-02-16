<!-- frontend/src/views/courses/provider/GradingCenter.vue -->
<template>
    <div class="min-h-screen bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">Grading Center</h1>
                <p class="mt-1 text-gray-500">Evaluate student submissions and provide constructive feedback.</p>
            </div>

            <!-- Loading -->
            <div v-if="loading" class="flex items-center justify-center py-24">
                <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            <template v-else>
                <div class="flex gap-6 items-start">

                    <!-- Submissions table -->
                    <div class="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        <!-- Filter bar -->
                        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-50">
                            <button v-for="f in filters" :key="f.value"
                                @click="activeFilter = f.value; loadSubmissions()"
                                class="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors" :class="activeFilter === f.value
                                    ? 'bg-sky-100 text-sky-600'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
                                {{ f.label }}
                            </button>
                        </div>

                        <!-- Table header -->
                        <div
                            class="grid grid-cols-12 px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                            <div class="col-span-4">Learner</div>
                            <div class="col-span-4">Activity</div>
                            <div class="col-span-2">Status</div>
                            <div class="col-span-2 text-right">View</div>
                        </div>

                        <!-- Rows -->
                        <div v-if="!submissions.length" class="px-5 py-12 text-center text-gray-400 text-sm">
                            No submissions {{ activeFilter !== 'all' ? `with status "${activeFilter}"` : '' }}
                        </div>

                        <div v-for="sub in submissions" :key="sub._id"
                            class="grid grid-cols-12 items-center px-5 py-4 border-b border-gray-50 hover:bg-slate-50 cursor-pointer transition-colors"
                            :class="{ 'bg-sky-50/50': selectedSub?._id === sub._id }" @click="selectSubmission(sub)">
                            <!-- Learner -->
                            <div class="col-span-4 flex items-center gap-3">
                                <div
                                    class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {{ sub.client?.firstName?.[0] || '?' }}
                                </div>
                                <span class="text-sm font-medium text-gray-800">
                                    {{ sub.client?.firstName }} {{ sub.client?.lastName }}
                                </span>
                            </div>

                            <!-- Activity -->
                            <div class="col-span-4">
                                <p class="text-sm font-medium text-gray-800">{{ sub.lessonTitle || 'Assignment' }}</p>
                                <p class="text-xs text-gray-400 uppercase tracking-wide mt-0.5">{{ sub.courseTitle }}
                                </p>
                            </div>

                            <!-- Status -->
                            <div class="col-span-2">
                                <span class="text-xs font-bold px-2.5 py-1 rounded-full border" :class="{
                                    'border-amber-300 text-amber-600 bg-amber-50': sub.status === 'pending',
                                    'border-emerald-300 text-emerald-600 bg-emerald-50': sub.status === 'graded',
                                    'border-orange-300 text-orange-600 bg-orange-50': sub.status === 'revision_requested'
                                }">
                                    {{ sub.status.replace('_', ' ').toUpperCase() }}
                                </span>
                            </div>

                            <!-- View -->
                            <div class="col-span-2 flex justify-end">
                                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <!-- Right panel -->
                    <div class="w-80 shrink-0">

                        <!-- Empty state -->
                        <div v-if="!selectedSub" class="bg-gray-900 rounded-2xl p-8 text-center text-white">
                            <div
                                class="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckIcon class="w-7 h-7 text-white/80" />
                            </div>
                            <p class="font-semibold text-base mb-1">Select a task to grade</p>
                            <p class="text-sm text-gray-400">Active learners waiting for your feedback.</p>
                        </div>

                        <!-- Grading panel -->
                        <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div class="px-5 py-4 border-b border-gray-50">
                                <div class="flex items-center gap-3 mb-1">
                                    <div
                                        class="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {{ selectedSub.client?.firstName?.[0] || '?' }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold text-gray-900">{{ selectedSub.client?.firstName
                                            }} {{ selectedSub.client?.lastName }}</p>
                                        <p class="text-xs text-gray-400">{{ formatDate(selectedSub.submittedAt) }}</p>
                                    </div>
                                </div>
                                <p class="text-sm text-gray-700 font-medium mt-2">{{ selectedSub.lessonTitle }}</p>
                                <p class="text-xs text-gray-400 uppercase tracking-wide">{{ selectedSub.courseTitle }}
                                </p>
                            </div>

                            <!-- Submission content -->
                            <div class="px-5 py-4 space-y-4">
                                <div v-if="selectedSub.submissionText">
                                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Submission</p>
                                    <p class="text-sm text-gray-700 bg-gray-50 rounded-xl p-3 whitespace-pre-wrap">{{
                                        selectedSub.submissionText }}</p>
                                </div>

                                <div v-if="selectedSub.attachments?.length">
                                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Attachments</p>
                                    <div class="space-y-1">
                                        <a v-for="att in selectedSub.attachments" :key="att.fileUrl" :href="att.fileUrl"
                                            target="_blank"
                                            class="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 bg-sky-50 rounded-lg px-3 py-1.5 transition-colors">
                                            <DocumentIcon class="w-4 h-4 shrink-0" />
                                            <span class="truncate">{{ att.name }}</span>
                                        </a>
                                    </div>
                                </div>

                                <!-- Grade form -->
                                <div>
                                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Grade
                                        (0–100)</p>
                                    <input v-model.number="gradeForm.grade" type="number" min="0" max="100"
                                        placeholder="e.g. 85"
                                        class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Feedback</p>
                                    <textarea v-model="gradeForm.feedback" rows="4"
                                        placeholder="Constructive feedback for the learner..."
                                        class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"></textarea>
                                </div>

                                <div class="flex gap-2">
                                    <button @click="submitGrade('graded')" :disabled="grading"
                                        class="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-xs">
                                        {{ grading ? 'Saving…' : 'Submit Grade' }}
                                    </button>
                                    <button @click="submitGrade('revision_requested')" :disabled="grading"
                                        class="flex-1 border border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-2.5 rounded-xl transition-colors text-xs">
                                        Request Revision
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { CheckIcon, ChevronRightIcon, DocumentIcon } from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'

const courseStore = useCourseStore()

const loading = ref(true)
const submissions = ref([])
const selectedSub = ref(null)
const grading = ref(false)
const activeFilter = ref('all')

const gradeForm = reactive({ grade: null, feedback: '' })

const filters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Graded', value: 'graded' },
    { label: 'Revision Requested', value: 'revision_requested' }
]

function formatDate(dateStr) {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function selectSubmission(sub) {
    selectedSub.value = sub
    gradeForm.grade = sub.grade ?? null
    gradeForm.feedback = sub.feedback ?? ''
}

async function loadSubmissions() {
    loading.value = true
    try {
        const params = activeFilter.value !== 'all' ? { status: activeFilter.value } : {}
        submissions.value = await courseStore.fetchHomework(params)
        // Deselect if current selection is no longer in list
        if (selectedSub.value && !submissions.value.find(s => s._id === selectedSub.value._id)) {
            selectedSub.value = null
        }
    } catch (e) {
        console.error('fetchHomework error:', e)
    } finally {
        loading.value = false
    }
}

async function submitGrade(status) {
    if (gradeForm.grade === null && status === 'graded') {
        alert('Please enter a grade before submitting.')
        return
    }
    grading.value = true
    try {
        const updated = await courseStore.gradeSubmission(selectedSub.value._id, {
            grade: gradeForm.grade,
            feedback: gradeForm.feedback,
            status
        })
        // Update in list
        const idx = submissions.value.findIndex(s => s._id === updated._id)
        if (idx !== -1) submissions.value[idx] = { ...submissions.value[idx], ...updated }
        selectedSub.value = { ...selectedSub.value, ...updated }
    } catch (e) {
        alert(e?.response?.data?.message || 'Failed to save grade')
    } finally {
        grading.value = false
    }
}

onMounted(loadSubmissions)
</script>