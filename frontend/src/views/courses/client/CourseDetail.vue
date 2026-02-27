<!-- frontend/src/views/courses/client/CourseDetail.vue -->
<template>
    <div class="min-h-screen bg-gray-50">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center py-32">
            <div class="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <template v-else-if="course">

            <!-- ── Compact Hero ─────────────────────────────────────────── -->
            <div class="bg-gray-900 text-white">
                <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <!-- Breadcrumb -->
                    <div class="flex items-center gap-2 text-xs text-gray-400 mb-4">
                        <router-link to="/courses" class="hover:text-white transition-colors">{{
                            $t('courseDetail.breadcrumbCourses') }}</router-link>
                        <span>/</span>
                        <span v-if="course.category" class="text-gray-300">{{ course.category }}</span>
                    </div>

                    <h1 class="text-3xl sm:text-4xl font-extrabold leading-tight mb-3 max-w-3xl">{{ course.title }}</h1>
                    <p v-if="course.description"
                        class="text-gray-400 leading-relaxed mb-5 max-w-2xl text-sm sm:text-base">
                        {{ course.description }}
                    </p>

                    <!-- Meta row -->
                    <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        <!-- Rating -->
                        <div v-if="avgRating" class="flex items-center gap-1.5">
                            <span class="font-bold text-amber-400">{{ avgRating }}</span>
                            <div class="flex">
                                <StarIcon v-for="n in 5" :key="n" class="w-3.5 h-3.5"
                                    :class="n <= Math.round(avgRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'" />
                            </div>
                            <span class="text-gray-500">({{ course.ratings?.length || 0 }})</span>
                        </div>
                        <!-- Stats -->
                        <span class="text-gray-400">{{ $t('courseDetail.lessonsCount', { count: totalLessons })
                        }}</span>
                        <span class="text-gray-400">{{ $t('courseDetail.blocksCount', {
                            count: course.blocks?.length ||
                                0
                        }) }}</span>
                        <!-- Category -->
                        <span v-if="course.subcategory" class="text-gray-400">{{ course.subcategory }}</span>
                    </div>

                    <!-- Instructor chip -->
                    <div class="flex items-center gap-3 mt-5">
                        <div class="w-9 h-9 rounded-full bg-white/10 overflow-hidden shrink-0">
                            <img v-if="course.provider?.profilePicture"
                                :src="$uploadsUrl(course.provider.profilePicture)" class="w-full h-full object-cover" />
                            <div v-else
                                class="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                {{ course.provider?.firstName?.[0] }}{{ course.provider?.lastName?.[0] }}
                            </div>
                        </div>
                        <div>
                            <p class="text-sm font-medium">{{ course.provider?.firstName }} {{ course.provider?.lastName
                                }}</p>
                            <p class="text-xs text-gray-500">{{ $t('courseDetail.instructor') }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ── Main Content + Sidebar ───────────────────────────────── -->
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="flex flex-col lg:flex-row gap-8">

                    <!-- Left column -->
                    <div class="flex-1 min-w-0 space-y-8">

                        <!-- What you'll learn -->
                        <div v-if="course.blocks?.length" class="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('courseDetail.whatYoullLearn') }}
                            </h2>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div v-for="topic in allTopics.slice(0, 8)" :key="topic._id"
                                    class="flex items-start gap-3">
                                    <CheckIcon class="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />
                                    <span class="text-sm text-gray-700">{{ topic.title }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Course content / curriculum -->
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-bold text-gray-900">{{ $t('courseDetail.courseContent') }}</h2>
                                <p class="text-xs text-gray-400">
                                    {{ $t('courseDetail.contentSummary', {
                                        blocks: course.blocks?.length || 0, topics:
                                            allTopics.length, lessons: totalLessons
                                    }) }}
                                </p>
                            </div>

                            <div class="space-y-2">
                                <div v-for="(block, bi) in course.blocks" :key="block._id"
                                    class="bg-white rounded-xl border border-gray-100 overflow-hidden">
                                    <!-- Block header -->
                                    <button
                                        class="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                                        @click="toggleBlock(block._id)">
                                        <div class="flex items-center gap-3">
                                            <ChevronDownIcon class="w-4 h-4 text-gray-400 transition-transform shrink-0"
                                                :class="{ '-rotate-90': !expanded[block._id] }" />
                                            <div>
                                                <span class="font-semibold text-gray-900 text-sm">{{
                                                    $t('courseDetail.blockLabel', {
                                                        number: bi + 1, title: block.title
                                                    }) }}</span>
                                                <span class="block text-xs text-gray-400 mt-0.5">
                                                    {{ $t('courseDetail.lessonsCount', {
                                                        count: blockLessonCount(block)
                                                    }) }}
                                                    <template v-if="block.quiz?.questions?.length"> · {{
                                                        $t('courseDetail.blockQuiz') }}</template>
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    <!-- Topics + lessons -->
                                    <div v-if="expanded[block._id]" class="border-t border-gray-50">
                                        <div v-for="topic in block.topics" :key="topic._id"
                                            class="px-5 py-3 border-b border-gray-50 last:border-b-0">
                                            <p
                                                class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                {{ topic.title }}</p>
                                            <div class="space-y-1.5">
                                                <div v-for="lesson in topic.lessons" :key="lesson._id"
                                                    class="flex items-center gap-3 py-1.5">
                                                    <PlayIcon class="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                                    <span class="text-sm text-gray-700">{{ lesson.title }}</span>
                                                </div>
                                            </div>
                                            <!-- Topic quiz indicator -->
                                            <div v-if="topic.quiz?.questions?.length"
                                                class="flex items-center gap-2 mt-2 text-xs text-sky-500 font-medium">
                                                <QuestionMarkCircleIcon class="w-3.5 h-3.5" />
                                                {{ $t('courseDetail.topicQuiz', { count: topic.quiz.questions.length })
                                                }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Final quiz indicator -->
                            <div v-if="course.finalQuiz?.questions?.length"
                                class="mt-2 bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-3">
                                <div class="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                    <AcademicCapIcon class="w-4 h-4 text-violet-500" />
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-900 text-sm">{{ $t('courseDetail.finalExam') }}
                                    </p>
                                    <p class="text-xs text-gray-400">{{ $t('courseDetail.finalExamDesc', {
                                        count:
                                            course.finalQuiz.questions.length
                                    }) }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Instructor info -->
                        <div class="bg-white rounded-2xl border border-gray-100 p-6">
                            <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('courseDetail.instructor') }}</h2>
                            <div class="flex items-start gap-4">
                                <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden shrink-0">
                                    <img v-if="course.provider?.profilePicture"
                                        :src="$uploadsUrl(course.provider.profilePicture)"
                                        class="w-full h-full object-cover" />
                                    <div v-else
                                        class="w-full h-full flex items-center justify-center font-bold text-gray-400 text-lg">
                                        {{ course.provider?.firstName?.[0] }}{{ course.provider?.lastName?.[0] }}
                                    </div>
                                </div>
                                <div>
                                    <p class="font-bold text-gray-900">{{ course.provider?.firstName }} {{
                                        course.provider?.lastName }}</p>
                                    <p v-if="course.provider?.bio" class="text-sm text-gray-500 mt-1 line-clamp-3">{{
                                        course.provider.bio }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- ── Course Reviews (INSIDE the course block) ──────── -->
                        <div class="bg-white rounded-2xl border border-gray-100 p-6">
                            <h3 class="text-lg font-bold text-gray-900 mb-4">{{ $t('reviews.courseReviews') }}</h3>

                            <ReviewStats mode="stars" :average-rating="courseReviewStats.averageRating"
                                :total-reviews="courseReviewStats.totalReviews"
                                :rating-distribution="courseReviewStats.ratingDistribution" />

                            <!-- Write review form (only when eligible) -->
                            <div v-if="canReviewCourse" class="mt-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
                                <h4 class="text-sm font-medium text-gray-900 mb-3">{{ $t('reviews.writeReview') }}</h4>
                                <ReviewForm ref="reviewFormRef" direction="client_to_course" :course-id="courseId"
                                    :loading="submittingReview" @submit="submitCourseReview" />
                            </div>

                            <div class="mt-6">
                                <ReviewList :reviews="courseReviews" :loading="loadingReviews" />
                            </div>
                        </div>
                    </div>

                    <!-- Right sidebar: enroll card -->
                    <div class="w-full lg:w-80 shrink-0">
                        <div class="lg:sticky lg:top-24">
                            <div class="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                                <!-- Thumbnail -->
                                <div class="aspect-video bg-gray-100 overflow-hidden">
                                    <img v-if="course.thumbnail" :src="$uploadsUrl(course.thumbnail)"
                                        class="w-full h-full object-cover" />
                                    <div v-else class="w-full h-full flex items-center justify-center">
                                        <BookOpenIcon class="w-12 h-12 text-gray-300" />
                                    </div>
                                </div>
                                <div class="p-5 space-y-4">
                                    <!-- Price -->
                                    <p class="text-3xl font-extrabold text-gray-900">
                                        {{ course.price === 0 ? $t('courseDetail.free') : course.price.toLocaleString()
                                            + ' UZS' }}
                                    </p>

                                    <!-- Already enrolled -->
                                    <div v-if="isEnrolled">
                                        <button @click="$router.push(`/courses/${course._id}/learn`)"
                                            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                                            {{ $t('courseDetail.continueLearning') }} →
                                        </button>
                                    </div>

                                    <!-- Not authenticated -->
                                    <div v-else-if="!authStore.isAuthenticated">
                                        <button @click="$router.push('/login')"
                                            class="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                                            {{ $t('courseDetail.signInToEnroll') }}
                                        </button>
                                    </div>

                                    <!-- Provider viewing -->
                                    <div v-else-if="authStore.isProvider">
                                        <p class="text-xs text-gray-500 text-center">{{
                                            $t('courseDetail.providerCannotEnroll') }}</p>
                                    </div>

                                    <!-- Enroll button -->
                                    <div v-else>
                                        <button @click="handleEnroll" :disabled="enrolling"
                                            class="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
                                            {{ enrolling ? $t('courseDetail.processing') : (course.price === 0 ?
                                                $t('courseDetail.enrollFree') : $t('courseDetail.enrollNow')) }}
                                        </button>
                                    </div>

                                    <!-- Quick stats -->
                                    <div class="border-t border-gray-100 pt-4 space-y-3">
                                        <div class="flex items-center gap-3 text-sm">
                                            <BookmarkIcon class="w-4 h-4 text-gray-400 shrink-0" />
                                            <span class="text-gray-600">{{ $t('courseDetail.lessonsCount', {
                                                count:
                                                    totalLessons
                                            })
                                            }}</span>
                                        </div>
                                        <div class="flex items-center gap-3 text-sm">
                                            <CubeIcon class="w-4 h-4 text-gray-400 shrink-0" />
                                            <span class="text-gray-600">{{ $t('courseDetail.blocksCount', {
                                                count:
                                                    course.blocks?.length ||
                                                    0
                                            }) }}</span>
                                        </div>
                                        <div v-if="course.finalQuiz?.questions?.length"
                                            class="flex items-center gap-3 text-sm">
                                            <AcademicCapIcon class="w-4 h-4 text-gray-400 shrink-0" />
                                            <span class="text-gray-600">{{ $t('courseDetail.finalExamIncluded')
                                            }}</span>
                                        </div>
                                        <div v-if="avgRating" class="flex items-center gap-3 text-sm">
                                            <StarIcon class="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                                            <span class="text-gray-600">{{ $t('courseDetail.ratingInfo', {
                                                rating:
                                                    avgRating, count:
                                                    course.ratings?.length
                                            }) }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>

        <!-- Not found -->
        <div v-else class="flex flex-col items-center justify-center py-32 text-gray-400 text-sm">
            <p>{{ $t('courseDetail.notFound') }}</p>
            <router-link to="/courses" class="text-sky-500 hover:underline mt-2 text-sm">{{
                $t('courseDetail.browseCourses')
            }}</router-link>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    StarIcon, BookOpenIcon, BookmarkIcon, CubeIcon,
    ChevronDownIcon, PlayIcon, QuestionMarkCircleIcon,
    CheckIcon, AcademicCapIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useCourseStore } from '@/stores/course'
import { useGlobals } from '@/plugins/globals'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import ReviewList from '@/components/reviews/ReviewList.vue'
import ReviewStats from '@/components/reviews/ReviewStats.vue'
import ReviewForm from '@/components/reviews/ReviewForm.vue'

const { t } = useI18n()
const { toast, uploadsUrl, modal } = useGlobals()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const courseStore = useCourseStore()

const courseId = route.params.id
const loading = ref(true)
const enrolling = ref(false)
const course = ref(null)
const isEnrolled = ref(false)

// ── Review state ─────────────────────────────────────────────────────────
const courseReviews = ref([])
const courseReviewStats = ref({ averageRating: 0, totalReviews: 0, ratingDistribution: {} })
const loadingReviews = ref(false)
const canReviewCourse = ref(false)
const reviewFormRef = ref(null)
const submittingReview = ref(false)

const expanded = reactive({})

const totalLessons = computed(() =>
    course.value?.blocks?.reduce((t, b) => t + b.topics.reduce((tt, tp) => tt + tp.lessons.length, 0), 0) || 0
)

const allTopics = computed(() => {
    if (!course.value?.blocks) return []
    return course.value.blocks.flatMap(b => b.topics)
})

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

const fetchCourseReviews = async () => {
    try {
        loadingReviews.value = true
        const [reviewsRes, statsRes] = await Promise.all([
            axios.get(`/reviews/course/${courseId}`),
            axios.get(`/reviews/course/${courseId}/statistics`)
        ])
        courseReviews.value = reviewsRes.data.reviews || []
        courseReviewStats.value = statsRes.data
    } catch (error) {
        console.error('Error fetching course reviews:', error)
    } finally {
        loadingReviews.value = false
    }
}

const checkCanReview = async () => {
    if (!authStore.isAuthenticated) return
    try {
        const res = await axios.get('/reviews/can-review', { params: { courseId } })
        canReviewCourse.value = res.data.canReview
    } catch { /* ignore — user probably not enrolled */ }
}

const submitCourseReview = async (payload) => {
    try {
        submittingReview.value = true
        await axios.post('/reviews', payload)
        toast.success(t('reviews.reviewSubmitted'))
        reviewFormRef.value?.resetForm()
        canReviewCourse.value = false
        await fetchCourseReviews()
    } catch (error) {
        toast.error(error.response?.data?.message || t('reviews.submitError'))
    } finally {
        submittingReview.value = false
    }
}

async function handleEnroll() {
    enrolling.value = true
    try {
        const result = await courseStore.initiateEnrollment(courseId)

        if (result.free) {
            router.push(`/courses/${courseId}/learn`)
        } else {
            window.location.href = result.checkoutUrl
        }
    } catch (e) {
        toast.error(e?.response?.data?.message || t('courseDetail.enrollmentFailed'))
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

        // Default first block expanded
        if (course.value?.blocks?.length) {
            expanded[course.value.blocks[0]._id] = true
        }

        // Fetch reviews and check eligibility after course is loaded
        await Promise.all([
            fetchCourseReviews(),
            checkCanReview()
        ])
    } catch (e) {
        console.error('CourseDetail load error:', e)
        course.value = null
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>