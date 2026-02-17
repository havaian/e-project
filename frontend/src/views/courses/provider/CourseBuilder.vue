<!-- frontend/src/views/courses/provider/CourseBuilder.vue -->
<template>
    <div class="min-h-screen bg-slate-50">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-32">
            <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="course">
            <!-- Course header -->
            <div class="bg-white border-b border-gray-100">
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-5">
                    <div class="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                        <img v-if="course.thumbnail" :src="$uploadsUrl(course.thumbnail)" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center">
                            <PhotoIcon class="w-8 h-8 text-gray-300" />
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <h1 class="text-2xl font-bold text-gray-900 truncate">{{ course.title }}</h1>
                        <p class="text-sm text-gray-500 mt-0.5">
                            {{ [course.category, course.subcategory].filter(Boolean).join(' • ') || 'No category' }}
                        </p>
                    </div>
                    <button @click="handleSave" :disabled="saving"
                        class="shrink-0 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                        {{ saving ? 'Saving…' : (course.status === 'published' ? 'SAVED' : 'SAVE') }}
                    </button>
                </div>

                <!-- Tabs -->
                <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
                    <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                        class="py-3 text-sm font-semibold border-b-2 transition-colors" :class="activeTab === tab.key
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-gray-400 hover:text-gray-600'">
                        {{ tab.label }}
                    </button>
                </div>
            </div>

            <!-- Builder tab -->
            <div v-if="activeTab === 'builder'" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                <div v-if="course.status === 'draft'"
                    class="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-amber-700">
                    <ExclamationTriangleIcon class="w-4 h-4 shrink-0 text-amber-500" />
                    This course is a <strong class="mx-1">draft</strong> — it won't appear in the client catalog until
                    you publish it from the Settings tab.
                </div>

                <div v-for="(block, bi) in course.blocks" :key="block._id"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <!-- Block header -->
                    <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                        <div class="flex items-center gap-3 flex-1 min-w-0">
                            <button @click="toggleBlock(block._id)"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <ChevronDownIcon class="w-4 h-4 transition-transform"
                                    :class="{ '-rotate-90': !expanded[block._id] }" />
                            </button>
                            <span v-if="!editingBlockId || editingBlockId !== block._id"
                                class="font-semibold text-gray-900">
                                Block {{ bi + 1 }}: {{ block.title }}
                            </span>
                            <input v-else v-model="editingBlockTitle" @blur="saveBlockTitle(block)"
                                @keyup.enter="saveBlockTitle(block)"
                                class="input font-semibold text-gray-900 bg-transparent border-b border-sky-400 focus:outline-none flex-1"
                                autofocus />
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button @click="openQuizModal('block', block, null)"
                                class="text-xs font-semibold text-sky-500 hover:text-sky-700 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors">
                                BLOCK QUIZ
                            </button>
                            <button @click="promptAddTopic(block)"
                                class="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                                + TOPIC
                            </button>
                            <button @click="editingBlockId = block._id; editingBlockTitle = block.title"
                                class="text-gray-300 hover:text-gray-500 transition-colors">
                                <PencilSquareIcon class="w-4 h-4" />
                            </button>
                            <button @click="handleDeleteBlock(block._id)"
                                class="text-red-400 hover:text-red-600 transition-colors">
                                <XMarkIcon class="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <!-- Topics (collapsible) -->
                    <div v-if="expanded[block._id] !== false" class="divide-y divide-gray-50">
                        <div v-for="topic in block.topics" :key="topic._id" class="px-6 py-3">
                            <!-- Topic row -->
                            <div class="flex items-center justify-between mb-2">
                                <span class="font-medium text-gray-800 text-sm">{{ topic.title }}</span>
                                <div class="flex items-center gap-2">
                                    <button @click="openQuizModal('topic', block, topic)"
                                        class="text-xs font-semibold text-sky-400 hover:text-sky-600 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors">
                                        TOPIC QUIZ
                                    </button>
                                    <button @click="promptAddLesson(block, topic)"
                                        class="text-xs font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
                                        + LESSON
                                    </button>
                                    <button @click="handleDeleteTopic(block._id, topic._id)"
                                        class="text-red-300 hover:text-red-500 transition-colors">
                                        <XMarkIcon class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <!-- Lessons -->
                            <div class="space-y-1 pl-2">
                                <div v-for="lesson in topic.lessons" :key="lesson._id"
                                    class="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                                    @click="openLessonModal(block, topic, lesson)">
                                    <PlayIcon class="w-3.5 h-3.5 text-sky-400 shrink-0" />
                                    <span class="text-sm text-gray-700 flex-1">{{ lesson.title }}</span>
                                    <button @click.stop="handleDeleteLesson(block._id, topic._id, lesson._id)"
                                        class="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-500 transition-all">
                                        <XMarkIcon class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div v-if="!topic.lessons.length" class="text-xs text-gray-400 py-1 pl-3 italic">
                                    No lessons yet
                                </div>
                            </div>
                        </div>

                        <div v-if="!block.topics.length" class="px-6 py-4 text-sm text-gray-400 italic">
                            No topics yet — add one above
                        </div>
                    </div>
                </div>

                <!-- Add Block -->
                <button @click="promptAddBlock"
                    class="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors font-medium">
                    + Add New Block
                </button>
            </div>

            <!-- Settings tab -->
            <div v-else-if="activeTab === 'settings'" class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
                        <input v-model="settingsForm.title" type="text"
                            class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                        <textarea v-model="settingsForm.description" rows="4" class="input resize-none"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                            <input v-model="settingsForm.category" type="text"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1.5">Subcategory</label>
                            <input v-model="settingsForm.subcategory" type="text"
                                class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Price (UZS)</label>
                        <input v-model.number="settingsForm.price" type="number" min="0"
                            class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Thumbnail URL</label>
                        <input v-model="settingsForm.thumbnail" type="text" placeholder="https://..."
                            class="input w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">Or Upload Thumbnail</label>
                        <input ref="courseThumbInput" type="file" accept="image/*" class="hidden"
                            @change="handleCourseThumbUpload" />
                        <div v-if="course.thumbnail" class="w-full h-32 rounded-xl overflow-hidden mb-2 bg-gray-100">
                            <img :src="$uploadsUrl(course.thumbnail)" class="w-full h-full object-cover" />
                        </div>
                        <button @click="$refs.courseThumbInput.click()" :disabled="courseThumbUploading"
                            class="w-full border border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                            {{ courseThumbUploading ? 'Uploading…' : 'Choose image file' }}
                        </button>
                    </div>

                    <div class="flex gap-3 pt-2">
                        <button @click="saveSettings" :disabled="saving"
                            class="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            {{ saving ? 'Saving…' : 'Save Settings' }}
                        </button>
                        <button v-if="course.status !== 'published'" @click="handlePublish" :disabled="saving"
                            class="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            Publish Course
                        </button>
                        <button v-else @click="handleArchive" :disabled="saving"
                            class="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                            Archive
                        </button>
                    </div>
                </div>
            </div>

            <!-- Grading tab -->
            <div v-else-if="activeTab === 'grading'" class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="text-sm text-gray-500">
                    For full grading functionality, visit the
                    <router-link to="/courses/homework" class="text-sky-500 hover:underline font-medium">Grading
                        Center</router-link>.
                </div>
            </div>
        </template>

        <!-- ── Lesson Edit Modal ─────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="lessonModal.open"
                class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-start justify-between mb-1">
                            <h2 class="text-xl font-bold text-gray-900">Edit Lesson Content</h2>
                            <button @click="closeLessonModal"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
                            {{ lessonModal.lesson?.title }}
                        </p>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <!-- Left: video -->
                            <div>
                                <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lesson
                                    Video</p>

                                <!-- Video preview -->
                                <div class="w-full aspect-video rounded-xl bg-gray-100 overflow-hidden mb-2">
                                    <video v-if="lessonModal.form.videoFile"
                                        :src="$uploadsUrl(lessonModal.form.videoFile)" controls
                                        class="w-full h-full object-cover"></video>
                                    <img v-else-if="videoThumb" :src="videoThumb" class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full flex items-center justify-center">
                                        <FilmIcon class="w-10 h-10 text-gray-300" />
                                    </div>
                                </div>

                                <!-- Upload or URL -->
                                <div class="flex gap-2 mb-3">
                                    <button @click="videoMode = 'url'"
                                        class="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                                        :class="videoMode === 'url' ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-500'">URL</button>
                                    <button @click="videoMode = 'upload'"
                                        class="flex-1 text-xs py-1.5 rounded-lg font-semibold transition-colors"
                                        :class="videoMode === 'upload' ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-500'">Upload</button>
                                </div>

                                <div v-if="videoMode === 'url'">
                                    <input v-model="lessonModal.form.videoUrl" type="text" placeholder="https://..."
                                        class="input w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                </div>
                                <div v-else>
                                    <input ref="videoFileInput" type="file" accept="video/*" class="hidden"
                                        @change="handleVideoUpload" />
                                    <button @click="$refs.videoFileInput.click()"
                                        :disabled="videoUploadProgress > 0 && videoUploadProgress < 100"
                                        class="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-500 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                                        <span v-if="videoUploadProgress > 0 && videoUploadProgress < 100">Uploading {{
                                            videoUploadProgress }}%</span>
                                        <span v-else>Choose video file (max 100 MB)</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Right: title + materials -->
                            <div class="space-y-4">
                                <div>
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lesson
                                        Title
                                    </p>
                                    <input v-model="lessonModal.form.title" type="text"
                                        class="input w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                </div>

                                <div>
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Materials</p>
                                    <div class="space-y-1 mb-2">
                                        <div v-for="mat in lessonModal.form.materials" :key="mat._id"
                                            class="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                                            <DocumentIcon class="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            <span class="flex-1 truncate">{{ mat.name }}</span>
                                            <button @click="deleteMaterial(mat._id)"
                                                class="text-red-300 hover:text-red-500 transition-colors">
                                                <XMarkIcon class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <input ref="materialFileInput" type="file" multiple class="hidden"
                                        @change="handleMaterialUpload" />
                                    <button @click="$refs.materialFileInput.click()" :disabled="materialUploading"
                                        class="w-full border border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                                        {{ materialUploading ? 'Uploading…' : '+ Add files' }}
                                    </button>
                                </div>

                                <div>
                                    <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lesson
                                        Cover
                                        Image</p>
                                    <div class="w-full h-24 bg-gray-100 rounded-xl overflow-hidden mb-2">
                                        <img v-if="lessonModal.form.thumbnail"
                                            :src="$uploadsUrl(lessonModal.form.thumbnail)"
                                            class="w-full h-full object-cover" />
                                        <div v-else
                                            class="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                            No
                                            image</div>
                                    </div>
                                    <input ref="lessonThumbInput" type="file" accept="image/*" class="hidden"
                                        @change="handleLessonThumbUpload" />
                                    <button @click="$refs.lessonThumbInput.click()" :disabled="lessonThumbUploading"
                                        class="w-full border border-dashed border-gray-200 rounded-xl py-2 text-xs text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors disabled:opacity-50">
                                        {{ lessonThumbUploading ? 'Uploading…' : 'Upload cover image' }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Text/description -->
                        <div class="mt-5">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Lesson Text /
                                Transcription / Description</p>
                            <textarea v-model="lessonModal.form.text" rows="4"
                                placeholder="Detailed content for this lesson..." class="input resize-none"></textarea>
                        </div>

                        <!-- Assignment prompt -->
                        <div class="mt-4">
                            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Post-Lesson
                                Assignment
                                Prompt</p>
                            <textarea v-model="lessonModal.form.assignmentPrompt" rows="3"
                                placeholder="What should students do after this lesson?"
                                class="input resize-none"></textarea>
                        </div>

                        <button @click="saveLessonConfig" :disabled="lessonModal.saving"
                            class="mt-5 w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors text-sm tracking-wide">
                            {{ lessonModal.saving ? 'Saving…' : 'SAVE LESSON CONFIGURATION' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- ── Quiz Edit Modal ──────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="quizModal.open"
                class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-5">
                            <h2 class="text-xl font-bold text-gray-900">
                                {{ quizModal.type === 'block' ? 'Block' : 'Topic' }} Quiz
                            </h2>
                            <button @click="quizModal.open = false" class="text-gray-400 hover:text-gray-600">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <div class="space-y-5">
                            <div v-for="(q, qi) in quizModal.questions" :key="qi" class="bg-gray-50 rounded-xl p-4">
                                <div class="flex items-start gap-3 mb-3">
                                    <span class="text-xs font-bold text-gray-400 mt-2.5 shrink-0">Q{{ qi + 1 }}</span>
                                    <input v-model="q.question" type="text" placeholder="Question text"
                                        class="input flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                    <button @click="quizModal.questions.splice(qi, 1)"
                                        class="text-red-300 hover:text-red-500 mt-2 shrink-0">
                                        <XMarkIcon class="w-4 h-4" />
                                    </button>
                                </div>

                                <div class="space-y-2 mb-3">
                                    <div v-for="(opt, oi) in q.options" :key="oi" class="flex items-center gap-2">
                                        <input type="radio" :name="`q${qi}-correct`" :value="oi"
                                            v-model="q.correctAnswer" class="input accent-sky-500" />
                                        <input v-model="q.options[oi]" type="text" :placeholder="`Option ${oi + 1}`"
                                            class="input flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent" />
                                        <button v-if="q.options.length > 2" @click="q.options.splice(oi, 1)"
                                            class="text-red-300 hover:text-red-500">
                                            <XMarkIcon class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <button v-if="q.options.length < 6" @click="q.options.push('')"
                                        class="text-xs text-sky-500 hover:text-sky-700 font-medium">+ Add
                                        option</button>
                                    <p class="text-xs text-gray-400">Select the radio button next to the correct answer
                                    </p>
                                </div>
                            </div>

                            <button @click="addQuizQuestion"
                                class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-sky-300 hover:text-sky-500 transition-colors font-medium">
                                + Add Question
                            </button>
                        </div>

                        <button @click="saveQuiz" :disabled="quizModal.saving"
                            class="mt-5 w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                            {{ quizModal.saving ? 'Saving…' : 'Save Quiz' }}
                        </button>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    XMarkIcon, ChevronDownIcon, PencilSquareIcon, PlayIcon,
    PhotoIcon, FilmIcon, DocumentIcon, PlusIcon, ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl } = useGlobals()

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const courseId = route.params.id
const loading = ref(true)
const saving = ref(false)
const course = ref(null)
const lessonThumbUploading = ref(false)
const courseThumbUploading = ref(false)

const tabs = [
    { key: 'builder', label: 'Builder' },
    { key: 'settings', label: 'Settings' },
    { key: 'grading', label: 'Grading' }
]
const activeTab = ref('builder')

// Expanded state for blocks (default all open)
const expanded = reactive({})

// Inline block title editing
const editingBlockId = ref(null)
const editingBlockTitle = ref('')

// Settings form
const settingsForm = reactive({ title: '', description: '', category: '', subcategory: '', price: 0, thumbnail: '' })

// ── Lesson modal ────────────────────────────────────────────────────────────
const lessonModal = reactive({
    open: false,
    saving: false,
    blockId: null,
    topicId: null,
    lesson: null,
    form: {
        title: '', videoUrl: null, videoFile: null, text: '', assignmentPrompt: '', materials: []
    }
})

const videoMode = ref('url')
const videoUploadProgress = ref(0)
const materialUploading = ref(false)

const videoThumb = computed(() => {
    if (!lessonModal.form.videoUrl) return null
    const yt = lessonModal.form.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (yt) return `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`
    return null
})

// ── Quiz modal ──────────────────────────────────────────────────────────────
const quizModal = reactive({
    open: false,
    saving: false,
    type: 'block', // 'block' | 'topic'
    blockId: null,
    topicId: null,
    questions: []
})

// ── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(async () => {
    try {
        course.value = await courseStore.fetchCourseById(courseId)
        // Default all blocks expanded
        course.value.blocks.forEach(b => { expanded[b._id] = true })
        // Populate settings form
        Object.assign(settingsForm, {
            title: course.value.title,
            description: course.value.description || '',
            category: course.value.category || '',
            subcategory: course.value.subcategory || '',
            price: course.value.price || 0,
            thumbnail: course.value.thumbnail || ''
        })
    } catch (e) {
        console.error('fetchCourseById error:', e)
    } finally {
        loading.value = false
    }
})

// ── Helpers ─────────────────────────────────────────────────────────────────
function toggleBlock(id) {
    expanded[id] = expanded[id] === false ? true : false
}

function refresh(updated) {
    course.value = updated
    course.value.blocks.forEach(b => {
        if (expanded[b._id] === undefined) expanded[b._id] = true
    })
}

async function handleSave() {
    saving.value = true
    try {
        const updated = await courseStore.updateCourse(courseId, {
            title: course.value.title,
            description: course.value.description
        })
        refresh(updated)
        toast.success('Course saved')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Save failed')
    } finally {
        saving.value = false
    }
}

async function handleLessonThumbUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    lessonThumbUploading.value = true
    try {
        const result = await courseStore.uploadLessonThumbnail(
            courseId,
            lessonModal.blockId,
            lessonModal.topicId,
            lessonModal.lesson._id,
            file
        )
        lessonModal.form.thumbnail = result.thumbnail
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success('Cover image uploaded')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to upload cover image')
    } finally {
        lessonThumbUploading.value = false
        e.target.value = ''
    }
}

async function handleCourseThumbUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    courseThumbUploading.value = true
    try {
        const result = await courseStore.uploadCourseThumbnail(courseId, file)
        course.value.thumbnail = result.thumbnail
        toast.success('Thumbnail uploaded')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to upload thumbnail')
    } finally {
        courseThumbUploading.value = false
        e.target.value = ''
    }
}

// ── Block actions ────────────────────────────────────────────────────────────
async function promptAddBlock() {
    const title = prompt('Block title:')
    if (!title?.trim()) return
    const updated = await courseStore.addBlock(courseId, title.trim())
    refresh(updated)
}

async function saveBlockTitle(block) {
    if (!editingBlockTitle.value.trim() || editingBlockTitle.value === block.title) {
        editingBlockId.value = null
        return
    }
    const updated = await courseStore.updateBlock(courseId, block._id, { title: editingBlockTitle.value.trim() })
    refresh(updated)
    editingBlockId.value = null
}

async function handleDeleteBlock(blockId) {
    if (!confirm('Delete this block and all its content?')) return
    const updated = await courseStore.deleteBlock(courseId, blockId)
    refresh(updated)
}

// ── Topic actions ────────────────────────────────────────────────────────────
async function promptAddTopic(block) {
    const title = prompt('Topic title:')
    if (!title?.trim()) return
    const updated = await courseStore.addTopic(courseId, block._id, title.trim())
    refresh(updated)
}

async function handleDeleteTopic(blockId, topicId) {
    if (!confirm('Delete this topic and all its lessons?')) return
    const updated = await courseStore.deleteTopic(courseId, blockId, topicId)
    refresh(updated)
}

// ── Lesson actions ───────────────────────────────────────────────────────────
async function promptAddLesson(block, topic) {
    const title = prompt('Lesson title:')
    if (!title?.trim()) return
    const updated = await courseStore.addLesson(courseId, block._id, topic._id, title.trim())
    refresh(updated)
}

function openLessonModal(block, topic, lesson) {
    lessonModal.blockId = block._id
    lessonModal.topicId = topic._id
    lessonModal.lesson = lesson
    lessonModal.form = {
        title: lesson.title,
        thumbnail: lesson.thumbnail || null,
        videoUrl: lesson.videoUrl || '',
        videoFile: lesson.videoFile || null,
        text: lesson.text || '',
        assignmentPrompt: lesson.assignmentPrompt || '',
        materials: lesson.materials ? [...lesson.materials] : []
    }
    videoMode.value = lesson.videoUrl ? 'url' : 'upload'
    videoUploadProgress.value = 0
    lessonModal.open = true
}

function closeLessonModal() {
    lessonModal.open = false
}

async function saveLessonConfig() {
    lessonModal.saving = true
    try {
        const updated = await courseStore.updateLesson(
            courseId,
            lessonModal.blockId,
            lessonModal.topicId,
            lessonModal.lesson._id,
            {
                title: lessonModal.form.title,
                videoUrl: videoMode.value === 'url' ? lessonModal.form.videoUrl : undefined,
                text: lessonModal.form.text,
                assignmentPrompt: lessonModal.form.assignmentPrompt
            }
        )
        refresh(updated)
        toast.success('Lesson saved')
        lessonModal.open = false
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to save lesson')
    } finally {
        lessonModal.saving = false
    }
}

async function handleVideoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    videoUploadProgress.value = 1
    try {
        const result = await courseStore.uploadLessonVideo(
            courseId,
            lessonModal.blockId,
            lessonModal.topicId,
            lessonModal.lesson._id,
            file,
            (pct) => { videoUploadProgress.value = pct }
        )
        lessonModal.form.videoFile = result.videoFile
        lessonModal.form.videoUrl = null
        videoUploadProgress.value = 100
        // Refresh course to sync
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success('Video uploaded')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Video upload failed')
        videoUploadProgress.value = 0
    }
    e.target.value = ''
}

async function handleMaterialUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    materialUploading.value = true
    try {
        const added = await courseStore.uploadLessonMaterial(
            courseId,
            lessonModal.blockId,
            lessonModal.topicId,
            lessonModal.lesson._id,
            files
        )
        lessonModal.form.materials.push(...added)
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success('Lesson materials saved')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Material upload failed')
    } finally {
        materialUploading.value = false
        e.target.value = ''
    }
}

async function deleteMaterial(materialId) {
    if (!confirm('Remove this material?')) return
    await courseStore.deleteLessonMaterial(
        courseId,
        lessonModal.blockId,
        lessonModal.topicId,
        lessonModal.lesson._id,
        materialId
    )
    lessonModal.form.materials = lessonModal.form.materials.filter(m => m._id !== materialId)
    const updated = await courseStore.fetchCourseById(courseId)
    refresh(updated)
}

async function handleDeleteLesson(blockId, topicId, lessonId) {
    if (!confirm('Delete this lesson?')) return
    const updated = await courseStore.deleteLesson(courseId, blockId, topicId, lessonId)
    refresh(updated)
}

// ── Quiz actions ─────────────────────────────────────────────────────────────
function openQuizModal(type, block, topic) {
    quizModal.type = type
    quizModal.blockId = block._id
    quizModal.topicId = topic?._id || null

    const existing = type === 'block'
        ? block.quiz?.questions
        : topic?.quiz?.questions

    quizModal.questions = (existing || []).map(q => ({
        question: q.question,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || ''
    }))

    quizModal.open = true
}

function addQuizQuestion() {
    quizModal.questions.push({ question: '', options: ['', ''], correctAnswer: 0, explanation: '' })
}

async function saveQuiz() {
    quizModal.saving = true
    try {
        if (quizModal.type === 'block') {
            await courseStore.saveBlockQuiz(courseId, quizModal.blockId, quizModal.questions)
        } else {
            await courseStore.saveTopicQuiz(courseId, quizModal.blockId, quizModal.topicId, quizModal.questions)
        }
        const updated = await courseStore.fetchCourseById(courseId)
        refresh(updated)
        toast.success('Quiz saved')
        quizModal.open = false
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to save quiz')
    } finally {
        quizModal.saving = false
    }
}

// ── Settings ─────────────────────────────────────────────────────────────────
async function saveSettings() {
    saving.value = true
    try {
        const updated = await courseStore.updateCourse(courseId, { ...settingsForm })
        refresh(updated)
        toast.success('Settings saved')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to save settings')
    } finally {
        saving.value = false
    }
}

async function handlePublish() {
    if (!confirm('Publish this course? It will be visible to all students.')) return
    saving.value = true
    try {
        const updated = await courseStore.publishCourse(courseId)
        refresh(updated)
        toast.success('Course published — students can now find it in the catalog')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to publish')
    } finally {
        saving.value = false
    }
}

async function handleArchive() {
    if (!confirm('Archive this course? It will no longer be visible to new students.')) return
    saving.value = true
    try {
        const updated = await courseStore.archiveCourse(courseId)
        refresh(updated)
        toast.info('Course archived')
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to archive')
    } finally {
        saving.value = false
    }
}
</script>