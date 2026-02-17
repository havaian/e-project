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
                <!-- Completion button -->
                <button v-if="!isCompleted" @click="markComplete" :disabled="completing"
                    class="bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    {{ completing ? 'Saving…' : 'Mark Complete' }}
                </button>
                <div v-else class="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <CheckCircleIcon class="w-4 h-4" />
                    Completed
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
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'">
                                        <CheckCircleIcon v-if="isLessonComplete(l._id)"
                                            class="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <PlayIcon v-else class="w-3.5 h-3.5 shrink-0" />
                                        <span class="truncate">{{ l.title }}</span>
                                    </div>
                                </div>
                                <!-- Topic quiz indicator -->
                                <div v-if="topic.quiz?.questions?.length" class="px-5 pb-2">
                                    <div @click="openQuiz('topic', block, topic)"
                                        class="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs text-sky-400 hover:bg-white/5 transition-colors">
                                        <QuestionMarkCircleIcon class="w-3.5 h-3.5 shrink-0" />
                                        Topic Quiz
                                    </div>
                                </div>
                            </div>
                            <!-- Block quiz indicator -->
                            <div v-if="block.quiz?.questions?.length" class="px-5 pb-3">
                                <div @click="openQuiz('block', block, null)"
                                    class="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer text-xs text-violet-400 hover:bg-white/5 transition-colors">
                                    <QuestionMarkCircleIcon class="w-3.5 h-3.5 shrink-0" />
                                    Block Quiz
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

                        <!-- Video -->
                        <div v-if="lesson.videoFile || lesson.videoUrl"
                            class="w-full aspect-video rounded-2xl overflow-hidden bg-black">
                            <!-- Uploaded video (streamed) -->
                            <video v-if="lesson.videoFile"
                                :src="`/api/courses/${courseId}/blocks/${currentBlock._id}/topics/${currentTopic._id}/lessons/${lessonId}/stream`"
                                controls class="w-full h-full"></video>
                            <!-- External URL -->
                            <iframe v-else-if="isYoutube(lesson.videoUrl)" :src="youtubeEmbed(lesson.videoUrl)"
                                class="w-full h-full" allowfullscreen frameborder="0"></iframe>
                            <video v-else :src="lesson.videoUrl" controls class="w-full h-full"></video>
                        </div>

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
                    <div v-else-if="activeTab === 'Materials'" class="p-6">
                        <div v-if="lesson.materials?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <a v-for="mat in lesson.materials" :key="mat._id" :href="mat.fileUrl" :download="mat.name"
                                target="_blank"
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

                        <div class="space-y-4">
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
                            <button @click="quizModal.open = false"
                                class="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2.5 px-8 rounded-xl transition-colors text-sm">
                                Done
                            </button>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    ArrowLeftIcon, CheckCircleIcon, PlayIcon, QuestionMarkCircleIcon,
    DocumentArrowDownIcon, ArrowDownTrayIcon, DocumentIcon, XMarkIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'

const { toast, uploadsUrl, modal } = useGlobals()

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()

const courseId = route.params.id
const lessonId = route.params.lessonId

const loading = ref(true)
const completing = ref(false)
const course = ref(null)
const progress = ref(null)

const tabs = ['Lesson', 'Materials', 'Homework']
const activeTab = ref('Lesson')

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
    progress.value?.completedLessons?.some(cl => cl.lessonId === lessonId || cl.lessonId?.toString() === lessonId)
)

// ── Lesson navigation ─────────────────────────────────────────────────────────
function navigateToLesson(block, topic, l) {
    router.push(`/courses/${courseId}/lesson/${l._id}`)
}

function isLessonComplete(id) {
    return progress.value?.completedLessons?.some(cl =>
        cl.lessonId === id || cl.lessonId?.toString() === id
    )
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

function openQuiz(type, block, topic) {
    const quiz = type === 'block' ? block.quiz : topic.quiz
    if (!quiz?.questions?.length) return

    quizModal.type = type
    quizModal.blockId = block._id
    quizModal.topicId = topic?._id || null
    quizModal.questions = quiz.questions
    quizModal.answers = quiz.questions.map(() => null)
    quizModal.result = null
    quizModal.open = true
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
    loading.value = true
    try {
        const result = await courseStore.getCourseContent(courseId)
        course.value = result.data
        progress.value = result.progress || null
    } catch (e) {
        console.error('LessonViewer load error:', e)
    } finally {
        loading.value = false
    }
})
</script>