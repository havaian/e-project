<!-- frontend/src/views/courses/client/LessonViewer.vue -->
<template>
    <div class="min-h-screen bg-gray-950 text-white flex flex-col">

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="lesson">

            <!-- Top bar -->
            <div class="bg-gray-900 border-b border-white/10 px-4 py-3 flex items-center gap-4 shrink-0">
                <button @click="$router.push(`/courses/${courseId}/learn`)"
                    class="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeftIcon class="w-5 h-5" />
                </button>
                <div class="flex-1 min-w-0">
                    <p class="text-xs text-gray-500 truncate">{{ course?.title }}</p>
                    <p class="text-sm font-semibold truncate">{{ lesson.title }}</p>
                </div>
                <!-- Completion button (clients only, not provider preview) -->
                <template v-if="!isProviderPreview">
                    <button v-if="!isCompleted" @click="markComplete" :disabled="completing"
                        class="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                        {{ completing ? 'Saving…' : 'Mark Complete' }}
                    </button>
                    <div v-else class="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                        <CheckCircleIcon class="w-4 h-4" />
                        Completed
                    </div>
                </template>
                <div v-else
                    class="flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-400/10 px-3 py-1.5 rounded-lg">
                    <EyeIcon class="w-3.5 h-3.5" />
                    Preview Mode
                </div>
            </div>

            <div class="flex flex-1 overflow-hidden">

                <!-- Sidebar: course outline -->
                <div
                    class="hidden lg:flex lg:w-72 shrink-0 flex-col bg-gray-900 border-r border-white/10 overflow-y-auto">
                    <div class="p-4 border-b border-white/10">
                        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Course Content</p>
                    </div>
                    <div class="flex-1">
                        <div v-for="(block, bi) in course?.blocks" :key="block._id">
                            <div class="px-4 py-2.5 bg-white/5">
                                <p class="text-xs font-bold text-gray-300 uppercase tracking-wide">Block {{ bi + 1 }}:
                                    {{ block.title }}</p>
                            </div>
                            <div v-for="topic in block.topics" :key="topic._id">
                                <div class="px-5 py-2">
                                    <p class="text-xs text-gray-500 font-medium mb-1">{{ topic.title }}</p>
                                    <div v-for="l in topic.lessons" :key="l._id"
                                        @click="navigateToLesson(block, topic, l)"
                                        class="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors text-sm"
                                        :class="l._id === lessonId
                                            ? 'bg-sky-500/20 text-sky-300'
                                            : isLessonLocked(l._id)
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'">
                                        <CheckCircleIcon v-if="isLessonComplete(l._id)"
                                            class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <LockClosedIcon v-else-if="isLessonLocked(l._id)"
                                            class="w-3.5 h-3.5 shrink-0 text-gray-600" />
                                        <PlayIcon v-else class="w-3.5 h-3.5 shrink-0" />
                                        <span class="truncate">{{ l.title }}</span>
                                    </div>
                                </div>
                                <!-- Topic quiz indicator -->
                                <div v-if="topic.quiz?.questions?.length" class="px-5 pb-2">
                                    <div @click="openQuiz('topic', block, topic)"
                                        class="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-colors"
                                        :class="getQuizBestResult(topic._id)?.passed
                                            ? 'text-emerald-400 hover:bg-white/5'
                                            : isQuizLocked('topic', block, topic)
                                                ? 'text-gray-600 cursor-not-allowed'
                                                : 'text-sky-400 hover:bg-white/5'">
                                        <CheckCircleIcon v-if="getQuizBestResult(topic._id)?.passed"
                                            class="w-3.5 h-3.5 shrink-0" />
                                        <LockClosedIcon v-else-if="isQuizLocked('topic', block, topic)"
                                            class="w-3.5 h-3.5 shrink-0" />
                                        <QuestionMarkCircleIcon v-else class="w-3.5 h-3.5 shrink-0" />
                                        <span class="truncate">Topic Quiz</span>
                                        <span v-if="getQuizBestResult(topic._id)?.passed"
                                            class="ml-auto text-[10px] opacity-70">
                                            {{ getQuizBestResult(topic._id).score }}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <!-- Block quiz indicator -->
                            <div v-if="block.quiz?.questions?.length" class="px-5 pb-3">
                                <div @click="openQuiz('block', block, null)"
                                    class="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs transition-colors"
                                    :class="getQuizBestResult(block._id)?.passed
                                        ? 'text-emerald-400 hover:bg-white/5'
                                        : isQuizLocked('block', block, null)
                                            ? 'text-gray-600 cursor-not-allowed'
                                            : 'text-violet-400 hover:bg-white/5'">
                                    <CheckCircleIcon v-if="getQuizBestResult(block._id)?.passed"
                                        class="w-3.5 h-3.5 shrink-0" />
                                    <LockClosedIcon v-else-if="isQuizLocked('block', block, null)"
                                        class="w-3.5 h-3.5 shrink-0" />
                                    <QuestionMarkCircleIcon v-else class="w-3.5 h-3.5 shrink-0" />
                                    <span class="truncate">Block Quiz</span>
                                    <span v-if="getQuizBestResult(block._id)?.passed"
                                        class="ml-auto text-[10px] opacity-70">
                                        {{ getQuizBestResult(block._id).score }}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main content -->
                <div class="flex-1 overflow-y-auto">

                    <!-- Tab bar -->
                    <div class="flex gap-6 px-6 pt-5 border-b border-white/10 bg-gray-950">
                        <button v-for="tab in tabs" :key="tab" @click="activeTab = tab"
                            class="pb-3 text-sm font-semibold border-b-2 transition-colors" :class="activeTab === tab
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-gray-500 hover:text-gray-300'">
                            {{ tab }}
                        </button>
                    </div>

                    <!-- Lesson tab -->
                    <div v-if="activeTab === 'Lesson'" class="p-6 space-y-6">

                        <!-- Video (protected) -->
                        <div v-if="lesson.videoFile || lesson.videoUrl"
                            class="video-protected relative w-full aspect-video rounded-2xl overflow-hidden bg-black"
                            @contextmenu.prevent @dragstart.prevent>
                            <!-- Uploaded video (streamed via authenticated blob) -->
                            <div v-if="lesson.videoFile && videoLoading"
                                class="w-full h-full flex items-center justify-center">
                                <div
                                    class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin">
                                </div>
                            </div>
                            <video v-else-if="lesson.videoFile && videoBlobUrl" :src="videoBlobUrl" controls
                                controlsList="nodownload noplaybackrate" disablePictureInPicture
                                oncontextmenu="return false;" class="w-full h-full"></video>
                            <!-- External URL -->
                            <iframe v-else-if="isYoutube(lesson.videoUrl)" :src="youtubeEmbed(lesson.videoUrl)"
                                class="w-full h-full" allowfullscreen frameborder="0"></iframe>
                            <video v-else :src="lesson.videoUrl" controls controlsList="nodownload noplaybackrate"
                                disablePictureInPicture oncontextmenu="return false;" class="w-full h-full"></video>

                            <!-- Watermark overlay (tiled for full coverage) -->
                            <div
                                class="watermark-overlay absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
                                <!-- Center main watermark -->
                                <div class="absolute inset-0 flex items-center justify-center -rotate-[30deg]">
                                    <div class="text-center whitespace-nowrap opacity-[0.15]">
                                        <p class="text-white text-2xl font-bold">{{ watermarkName }}</p>
                                        <p class="text-white text-sm">{{ watermarkEmail }}</p>
                                        <p class="text-white text-xs mt-1">{{ watermarkTimestamp }}</p>
                                    </div>
                                </div>
                                <!-- Top-left -->
                                <div class="absolute top-[10%] left-[5%] -rotate-[30deg] opacity-[0.1]">
                                    <p class="text-white text-base font-semibold whitespace-nowrap">{{ watermarkName }}
                                        &bull; {{
                                        watermarkEmail }}</p>
                                    <p class="text-white text-[10px]">{{ watermarkTimestamp }}</p>
                                </div>
                                <!-- Top-right -->
                                <div class="absolute top-[8%] right-[5%] -rotate-[30deg] opacity-[0.1]">
                                    <p class="text-white text-base font-semibold whitespace-nowrap">{{ watermarkName }}
                                        &bull; {{
                                        watermarkEmail }}</p>
                                    <p class="text-white text-[10px]">{{ watermarkTimestamp }}</p>
                                </div>
                                <!-- Bottom-left -->
                                <div class="absolute bottom-[12%] left-[8%] -rotate-[30deg] opacity-[0.1]">
                                    <p class="text-white text-base font-semibold whitespace-nowrap">{{ watermarkName }}
                                        &bull; {{
                                        watermarkEmail }}</p>
                                    <p class="text-white text-[10px]">{{ watermarkTimestamp }}</p>
                                </div>
                                <!-- Bottom-right -->
                                <div class="absolute bottom-[10%] right-[3%] -rotate-[30deg] opacity-[0.1]">
                                    <p class="text-white text-base font-semibold whitespace-nowrap">{{ watermarkName }}
                                        &bull; {{
                                        watermarkEmail }}</p>
                                    <p class="text-white text-[10px]">{{ watermarkTimestamp }}</p>
                                </div>
                                <!-- Mid-left -->
                                <div class="absolute top-[45%] left-[2%] -rotate-[30deg] opacity-[0.08]">
                                    <p class="text-white text-sm font-semibold whitespace-nowrap">{{ watermarkEmail }}
                                    </p>
                                </div>
                                <!-- Mid-right -->
                                <div class="absolute top-[40%] right-[2%] -rotate-[30deg] opacity-[0.08]">
                                    <p class="text-white text-sm font-semibold whitespace-nowrap">{{ watermarkEmail }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Screenshot / tab-switch deterrent overlay -->
                        <Teleport to="body">
                            <Transition name="blackout">
                                <div v-if="tabHidden"
                                    class="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
                                    <p class="text-gray-500 text-sm">Content hidden — return to this tab to continue</p>
                                </div>
                            </Transition>
                        </Teleport>

                        <!-- Lesson text -->
                        <div v-if="lesson.text"
                            class="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {{ lesson.text }}
                        </div>

                        <!-- No content state -->
                        <div v-if="!lesson.videoFile && !lesson.videoUrl && !lesson.text"
                            class="text-center py-16 text-gray-600">
                            <p>No content for this lesson yet.</p>
                        </div>
                    </div>

                    <!-- Materials tab -->
                    <div v-else-if="activeTab === 'Materials'" class="p-6 space-y-6">
                        <div v-if="lesson.materials?.length">
                            <div v-for="mat in lesson.materials" :key="mat._id" class="mb-5">
                                <!-- Inline PDF preview -->
                                <div v-if="isPdf(mat.fileType)"
                                    class="rounded-xl overflow-hidden border border-white/10 mb-2">
                                    <object :data="$uploadsUrl(mat.fileUrl)" type="application/pdf"
                                        class="w-full h-[70vh]">
                                        <p class="p-4 text-sm text-gray-500">PDF preview unavailable.
                                            <a :href="$uploadsUrl(mat.fileUrl)" target="_blank"
                                                class="text-sky-400 hover:underline">Open in new tab</a>
                                        </p>
                                    </object>
                                </div>
                                <!-- Inline image preview -->
                                <div v-else-if="isImage(mat.fileType)"
                                    class="rounded-xl overflow-hidden border border-white/10 mb-2">
                                    <img :src="$uploadsUrl(mat.fileUrl)" :alt="mat.name"
                                        class="w-full max-h-[60vh] object-contain bg-gray-900" />
                                </div>
                                <!-- Download link (all files including above) -->
                                <a :href="$uploadsUrl(mat.fileUrl)" :download="mat.name" target="_blank"
                                    class="flex items-center gap-3 bg-gray-900 border border-white/10 rounded-xl px-4 py-3 hover:border-sky-500/50 hover:bg-gray-800 transition-all group">
                                    <DocumentArrowDownIcon class="w-6 h-6 text-sky-400 shrink-0" />
                                    <div class="min-w-0">
                                        <p class="text-sm font-medium truncate">{{ mat.name }}</p>
                                        <p class="text-xs text-gray-500">{{ mat.fileType }}</p>
                                    </div>
                                    <ArrowDownTrayIcon
                                        class="w-4 h-4 text-gray-600 group-hover:text-sky-400 transition-colors ml-auto shrink-0" />
                                </a>
                            </div>
                        </div>
                        <div v-else class="text-center py-16 text-gray-600 text-sm">
                            No materials for this lesson.
                        </div>
                    </div>

                    <!-- Homework tab -->
                    <div v-else-if="activeTab === 'Homework'" class="p-6">
                        <div v-if="lesson.assignmentPrompt"
                            class="bg-gray-900 border border-white/10 rounded-xl p-5 mb-6">
                            <p class="text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">Assignment</p>
                            <p class="text-sm text-gray-300 whitespace-pre-wrap">{{ lesson.assignmentPrompt }}</p>
                        </div>
                        <div v-else class="text-sm text-gray-500 mb-6 italic">No assignment prompt for this lesson.
                        </div>

                        <!-- Provider preview: read-only notice -->
                        <div v-if="isProviderPreview" class="text-sm text-gray-500 italic">
                            Students will see a submission form here.
                        </div>

                        <!-- Client: submission form -->
                        <div v-else class="space-y-4">
                            <div>
                                <label
                                    class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Your
                                    Answer</label>
                                <textarea v-model="homeworkText" rows="6" placeholder="Write your answer here…"
                                    class="input resize-none"></textarea>
                            </div>

                            <div>
                                <label
                                    class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attachments
                                    (optional)</label>
                                <input ref="hwFileInput" type="file" multiple class="hidden" @change="handleHwFiles" />
                                <div class="space-y-1 mb-2">
                                    <div v-for="f in hwFiles" :key="f.name"
                                        class="flex items-center gap-2 text-xs text-gray-400 bg-gray-900 rounded-lg px-3 py-1.5">
                                        <DocumentIcon class="w-3.5 h-3.5 shrink-0" />
                                        <span class="truncate">{{ f.name }}</span>
                                        <button @click="removeHwFile(f)"
                                            class="ml-auto text-red-400 hover:text-red-300">
                                            <XMarkIcon class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <button @click="$refs.hwFileInput.click()"
                                    class="border border-dashed border-white/20 rounded-xl py-2.5 w-full text-xs text-gray-500 hover:border-sky-500/50 hover:text-sky-400 transition-colors">
                                    + Attach files
                                </button>
                            </div>

                            <button @click="submitHw"
                                :disabled="hwSubmitting || (!homeworkText.trim() && !hwFiles.length)"
                                class="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-900 disabled:text-sky-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                                {{ hwSubmitting ? 'Submitting…' : 'Submit Assignment' }}
                            </button>

                            <div v-if="hwSubmitted"
                                class="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                                <CheckCircleIcon class="w-4 h-4" />
                                Submitted! Your instructor will review it shortly.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </template>

        <!-- Error -->
        <div v-else class="flex-1 flex items-center justify-center text-gray-500 text-sm">
            Lesson not found or you don't have access.
        </div>

        <!-- ── Quiz Modal ──────────────────────────────────────────────── -->
        <Teleport to="body">
            <div v-if="quizModal.open"
                class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div
                    class="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-5">
                            <h2 class="text-xl font-bold">{{ quizModal.type === 'block' ? 'Block' : 'Topic' }} Quiz</h2>
                            <button @click="quizModal.open = false" class="text-gray-500 hover:text-white">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Result screen -->
                        <div v-if="quizModal.result" class="text-center py-6">
                            <div class="text-5xl font-black mb-2"
                                :class="quizModal.result.passed ? 'text-emerald-400' : 'text-red-400'">
                                {{ quizModal.result.score }}%
                            </div>
                            <p class="text-sm text-gray-400 mb-1">
                                {{ quizModal.result.correctCount }} / {{ quizModal.result.totalQuestions }} correct
                            </p>
                            <p class="font-semibold text-lg"
                                :class="quizModal.result.passed ? 'text-emerald-400' : 'text-red-400'">
                                {{ quizModal.result.passed ? '🎉 Passed!' : 'Not quite — keep studying!' }}
                            </p>
                            <div class="flex items-center justify-center gap-3 mt-6">
                                <button @click="quizModal.open = false"
                                    class="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-8 rounded-xl transition-colors text-sm">
                                    Done
                                </button>
                                <button @click="retakeQuiz"
                                    class="border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-bold py-2.5 px-8 rounded-xl transition-colors text-sm">
                                    Retake
                                </button>
                            </div>
                        </div>

                        <!-- Quiz questions -->
                        <div v-else class="space-y-5">
                            <div v-for="(q, qi) in quizModal.questions" :key="qi">
                                <p class="text-sm font-semibold mb-3 text-gray-200">{{ qi + 1 }}. {{ q.question }}</p>
                                <div class="space-y-2">
                                    <label v-for="(opt, oi) in q.options" :key="oi"
                                        class="flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all"
                                        :class="quizModal.answers[qi] === oi
                                            ? 'border-sky-500 bg-sky-500/10 text-white'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'">
                                        <input type="radio" :name="`q${qi}`" :value="oi" v-model="quizModal.answers[qi]"
                                            class=" w-4 h-4 shrink-0 accent-sky-500" />
                                        <span class="text-sm">{{ opt }}</span>
                                    </label>
                                </div>
                            </div>

                            <button @click="submitQuiz"
                                :disabled="quizModal.submitting || quizModal.answers.some(a => a === null)"
                                class="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-900 disabled:text-sky-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                                {{ quizModal.submitting ? 'Submitting…' : 'Submit Answers' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>

    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    ArrowLeftIcon, CheckCircleIcon, PlayIcon, QuestionMarkCircleIcon,
    DocumentArrowDownIcon, ArrowDownTrayIcon, DocumentIcon, XMarkIcon,
    LockClosedIcon, EyeIcon
} from '@heroicons/vue/24/outline'
import api, { uploadApi } from '@/plugins/axios'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl, modal } = useGlobals()

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const authStore = useAuthStore()

const courseId = route.params.id
const lessonId = route.params.lessonId

const loading = ref(true)
const completing = ref(false)
const course = ref(null)
const progress = ref(null)

// ── Video blob URL (auth-protected streaming) ────────────────────────────────
const videoBlobUrl = ref(null)
const videoLoading = ref(false)

// ── Watermark (anti-piracy) ──────────────────────────────────────────────────
const watermarkName = computed(() => {
    const u = authStore.user
    return u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() : ''
})
const watermarkEmail = computed(() => authStore.user?.email || '')
const watermarkTimestamp = computed(() => {
    const now = new Date()
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
})

// ── Tab-switch / screenshot deterrent ────────────────────────────────────────
const tabHidden = ref(false)

function handleVisibilityChange() {
    tabHidden.value = document.hidden
}

// Block PrintScreen and common screenshot shortcuts
function handleKeydown(e) {
    // PrintScreen
    if (e.key === 'PrintScreen') {
        e.preventDefault()
        tabHidden.value = true
        setTimeout(() => { tabHidden.value = false }, 1500)
    }
    // Ctrl+Shift+S (Windows snipping), Cmd+Shift+3/4/5 (Mac screenshots)
    if ((e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key))) {
        e.preventDefault()
    }
}

// ── Provider preview mode ────────────────────────────────────────────────────
const isProviderPreview = computed(() => {
    if (!course.value || !authStore.user) return false
    return course.value.provider?._id === authStore.user._id
        || course.value.provider === authStore.user._id
})

const tabs = computed(() => {
    const t = ['Lesson', 'Materials']
    if (course.value?.homeworkEnabled) t.push('Homework')
    return t
})
const activeTab = ref('Lesson')

// ── File type helpers (for material inline preview) ─────────────────────────
function isPdf(mimeType) {
    return mimeType === 'application/pdf'
}
function isImage(mimeType) {
    return mimeType?.startsWith('image/')
}

// ── Computed lesson + parent references ──────────────────────────────────────
const currentBlock = computed(() => {
    if (!course.value) return null
    for (const block of course.value.blocks) {
        for (const topic of block.topics) {
            if (topic.lessons.some(l => l._id === lessonId)) return block
        }
    }
    return null
})

const currentTopic = computed(() => {
    if (!course.value) return null
    for (const block of course.value.blocks) {
        for (const topic of block.topics) {
            if (topic.lessons.some(l => l._id === lessonId)) return topic
        }
    }
    return null
})

const lesson = computed(() => {
    if (!currentTopic.value) return null
    return currentTopic.value.lessons.find(l => l._id === lessonId) || null
})

const isCompleted = computed(() =>
    completedLessonIds.value.has(lessonId)
)

// ── Completed lessons Set (reactive — drives sidebar lock state) ─────────────
const completedLessonIds = computed(() => {
    const cls = progress.value?.completedLessons
    if (!cls) return new Set()
    return new Set(cls.map(cl => cl.lessonId?.toString?.() || cl.lessonId))
})

// ── Ordered flat list of all lesson IDs (for locking logic) ──────────────────
const allLessonIds = computed(() => {
    if (!course.value) return []
    const ids = []
    for (const block of course.value.blocks) {
        for (const topic of block.topics) {
            for (const l of topic.lessons) {
                ids.push(l._id)
            }
        }
    }
    return ids
})

// ── Lesson locking: a lesson is accessible only if it's the first one or the previous one is completed ──
function isLessonLocked(id) {
    // Provider preview — nothing locked
    if (isProviderPreview.value) return false
    const ids = allLessonIds.value
    const idx = ids.indexOf(id)
    // First lesson in the entire course is never locked
    if (idx <= 0) return false
    // Locked if the previous lesson is NOT completed
    const prevId = ids[idx - 1]
    return !completedLessonIds.value.has(prevId)
}

// ── Lesson navigation ─────────────────────────────────────────────────────────
function navigateToLesson(block, topic, l) {
    if (isLessonLocked(l._id)) {
        toast.error('Complete the previous lesson first')
        return
    }
    router.push(`/courses/${courseId}/lesson/${l._id}`)
}

function isLessonComplete(id) {
    return completedLessonIds.value.has(id)
}

// ── Mark complete ─────────────────────────────────────────────────────────────
async function markComplete() {
    completing.value = true
    try {
        const result = await courseStore.completeLesson(courseId, lessonId)
        progress.value = result.progress
    } catch (e) {
        console.error('completeLesson error:', e)
    } finally {
        completing.value = false
    }
}

// ── Video helpers ─────────────────────────────────────────────────────────────
function isYoutube(url) {
    return url?.includes('youtube.com') || url?.includes('youtu.be')
}

function youtubeEmbed(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

// ── Fetch video via axios (sends auth token) ─────────────────────────────────
async function fetchVideo() {
    // Revoke previous blob URL if any
    if (videoBlobUrl.value) {
        URL.revokeObjectURL(videoBlobUrl.value)
        videoBlobUrl.value = null
    }

    if (!lesson.value?.videoFile || !currentBlock.value || !currentTopic.value) return

    videoLoading.value = true
    try {
        const url = `/courses/${courseId}/blocks/${currentBlock.value._id}/topics/${currentTopic.value._id}/lessons/${lessonId}/stream`
        const response = await uploadApi.get(url, { responseType: 'blob' })
        videoBlobUrl.value = URL.createObjectURL(response.data)
    } catch (e) {
        console.error('Failed to fetch video:', e)
    } finally {
        videoLoading.value = false
    }
}

// Clean up blob URL and event listeners on unmount
onBeforeUnmount(() => {
    if (videoBlobUrl.value) {
        URL.revokeObjectURL(videoBlobUrl.value)
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    document.removeEventListener('keydown', handleKeydown)
})

// ── Homework ──────────────────────────────────────────────────────────────────
const homeworkText = ref('')
const hwFiles = ref([])
const hwSubmitting = ref(false)
const hwSubmitted = ref(false)

function handleHwFiles(e) {
    hwFiles.value.push(...Array.from(e.target.files))
    e.target.value = ''
}

function removeHwFile(f) {
    hwFiles.value = hwFiles.value.filter(file => file !== f)
}

async function submitHw() {
    hwSubmitting.value = true
    try {
        await courseStore.submitHomework(courseId, lessonId, homeworkText.value, hwFiles.value)
        hwSubmitted.value = true
        homeworkText.value = ''
        hwFiles.value = []
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to submit assignment')
    } finally {
        hwSubmitting.value = false
    }
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
const quizModal = reactive({
    open: false,
    type: 'block',
    blockId: null,
    topicId: null,
    questions: [],
    answers: [],
    submitting: false,
    result: null
})

// Map of quizId → best result { score, passed, correctCount, totalQuestions }
const completedQuizMap = computed(() => {
    const cq = progress.value?.completedQuizzes
    if (!cq?.length) return new Map()
    const map = new Map()
    for (const q of cq) {
        const id = q.quizId?.toString?.() || q.quizId
        const existing = map.get(id)
        // Keep the best score
        if (!existing || q.score > existing.score) {
            map.set(id, { score: q.score, passed: q.score >= 60 })
        }
    }
    return map
})

function getQuizBestResult(quizId) {
    return completedQuizMap.value.get(quizId?.toString?.() || quizId) || null
}

// Quiz is locked if not all lessons in its scope are completed
function isQuizLocked(type, block, topic) {
    // Provider preview — nothing locked
    if (isProviderPreview.value) return false
    if (type === 'topic' && topic) {
        // All lessons in this topic must be completed
        return topic.lessons.some(l => !completedLessonIds.value.has(l._id))
    }
    // Block quiz — all lessons in all topics of the block must be completed
    return block.topics.some(t =>
        t.lessons.some(l => !completedLessonIds.value.has(l._id))
    )
}

function openQuiz(type, block, topic) {
    // Check lock
    if (isQuizLocked(type, block, topic)) {
        const scope = type === 'block' ? 'block' : 'topic'
        toast.error(`Complete all lessons in this ${scope} first`)
        return
    }

    const quiz = type === 'block' ? block.quiz : topic.quiz
    if (!quiz?.questions?.length) return

    const quizId = type === 'block' ? block._id : topic._id
    const pastResult = getQuizBestResult(quizId)

    quizModal.type = type
    quizModal.blockId = block._id
    quizModal.topicId = topic?._id || null
    quizModal.questions = quiz.questions
    quizModal.answers = quiz.questions.map(() => null)
    quizModal.submitting = false

    // If already passed, show the past result; user can click "Retake" to try again
    if (pastResult?.passed) {
        quizModal.result = {
            score: pastResult.score,
            passed: true,
            correctCount: Math.round((pastResult.score / 100) * quiz.questions.length),
            totalQuestions: quiz.questions.length
        }
    } else {
        quizModal.result = null
    }

    quizModal.open = true
}

function retakeQuiz() {
    quizModal.answers = quizModal.questions.map(() => null)
    quizModal.result = null
}

async function submitQuiz() {
    quizModal.submitting = true
    try {
        const result = await courseStore.submitQuizAttempt(
            courseId,
            quizModal.blockId,
            quizModal.answers,
            quizModal.topicId
        )
        quizModal.result = result
        // Refresh progress
        const content = await courseStore.getCourseContent(courseId)
        progress.value = content.progress
    } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to submit quiz')
    } finally {
        quizModal.submitting = false
    }
}

// ── Load ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
    // Register anti-screenshot / tab-switch listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('keydown', handleKeydown)

    loading.value = true
    try {
        const result = await courseStore.getCourseContent(courseId)
        course.value = result.data
        progress.value = result.progress || null

        // Trigger video fetch now that course data is loaded
        if (lesson.value?.videoFile) fetchVideo()
    } catch (e) {
        console.error('LessonViewer load error:', e)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
/* ── Video protection ──────────────────────────────────────────────────── */
.video-protected {
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
}

/* ── Blackout transition (tab switch overlay) ──────────────────────────── */
.blackout-enter-active,
.blackout-leave-active {
    transition: opacity 0.15s ease;
}

.blackout-enter-from,
.blackout-leave-to {
    opacity: 0;
}
</style>