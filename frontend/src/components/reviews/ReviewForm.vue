<!-- frontend/src/components/reviews/ReviewForm.vue -->
<template>
    <form @submit.prevent="handleSubmit" class="space-y-5">

        <!-- ── Star rating (client_to_provider & client_to_course) ──────── -->
        <div v-if="direction !== 'provider_to_client'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('reviews.rateExperience') }}
            </label>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-1">
                    <button v-for="i in 5" :key="i" type="button"
                        class="p-1 focus:outline-none focus:ring-2 focus:ring-sky-300 rounded transition-colors"
                        @click="rating = i" @mouseover="hoverRating = i" @mouseleave="hoverRating = 0">
                        <StarIcon class="h-8 w-8 transition-colors duration-150"
                            :class="i <= (hoverRating || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'" />
                    </button>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">
                        {{ ratingLabel }}
                    </span>
                    <span class="text-xs text-gray-500">
                        {{ rating > 0
                            ? $t('reviews.starsOutOf', { count: rating })
                            : $t('reviews.clickToRate') }}
                    </span>
                </div>
            </div>
        </div>

        <!-- ── Comment (client_to_provider & client_to_course) ──────────── -->
        <div v-if="direction !== 'provider_to_client'">
            <label for="review-comment" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('reviews.shareExperience') }}
            </label>
            <div class="relative">
                <textarea id="review-comment" v-model="comment" rows="5"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-sky-500 focus:border-sky-500 resize-none"
                    :placeholder="commentPlaceholder" maxlength="1000"></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    {{ comment.length }}/1000
                </div>
            </div>
        </div>

        <!-- ── Tags (provider_to_client) ────────────────────────────────── -->
        <div v-if="direction === 'provider_to_client'">
            <label class="block text-sm font-medium text-gray-700 mb-3">
                {{ $t('reviews.selectTags') }}
            </label>
            <div class="flex flex-wrap gap-2">
                <button v-for="tag in availableTags" :key="tag.value" type="button" @click="toggleTag(tag.value)"
                    class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-150"
                    :class="selectedTags.includes(tag.value)
                        ? 'bg-sky-100 border-sky-300 text-sky-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'">
                    <span class="mr-1.5">{{ tag.icon }}</span>
                    {{ tag.label }}
                </button>
            </div>
            <p v-if="selectedTags.length === 0" class="mt-2 text-xs text-gray-500">
                {{ $t('reviews.selectAtLeastOneTag') }}
            </p>
        </div>

        <!-- ── Note (provider_to_client — optional) ─────────────────────── -->
        <div v-if="direction === 'provider_to_client'">
            <label for="review-note" class="block text-sm font-medium text-gray-700 mb-2">
                {{ $t('reviews.optionalNote') }}
            </label>
            <div class="relative">
                <textarea id="review-note" v-model="note" rows="3"
                    class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-sky-500 focus:border-sky-500 resize-none"
                    :placeholder="$t('reviews.notePlaceholder')" maxlength="500"></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    {{ note.length }}/500
                </div>
            </div>
        </div>

        <!-- ── Info tip ─────────────────────────────────────────────────── -->
        <div class="flex items-start space-x-2">
            <InformationCircleIcon class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p class="text-xs text-gray-500">
                {{ direction === 'provider_to_client'
                    ? $t('reviews.clientReviewTip')
                    : $t('reviews.reviewTip') }}
            </p>
        </div>

        <!-- ── Actions ──────────────────────────────────────────────────── -->
        <div class="flex justify-end space-x-3">
            <button v-if="showCancel" type="button" @click="$emit('cancel')"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                {{ $t('reviews.cancel') }}
            </button>
            <button type="submit" :disabled="loading || !isValid"
                class="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ $t('reviews.submitting') }}
                </span>
                <span v-else>{{ $t('reviews.submitReview') }}</span>
            </button>
        </div>
    </form>
</template>

<script setup>
import { StarIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    // Which direction this form handles
    direction: {
        type: String,
        required: true,
        validator: v => ['client_to_provider', 'provider_to_client', 'client_to_course'].includes(v)
    },
    // The appointment or course ID to associate the review with
    appointmentId: { type: String, default: null },
    courseId: { type: String, default: null },
    // Whether to show a cancel button
    showCancel: { type: Boolean, default: false },
    // External loading state
    loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit', 'cancel'])

// ── State ────────────────────────────────────────────────────────────────
const rating = ref(0)
const hoverRating = ref(0)
const comment = ref('')
const selectedTags = ref([])
const note = ref('')

// ── Tags ─────────────────────────────────────────────────────────────────
const availableTags = computed(() => [
    { value: 'punctual', label: t('reviews.tagPunctual'), icon: '⏰' },
    { value: 'communicative', label: t('reviews.tagCommunicative'), icon: '💬' },
    { value: 'respectful', label: t('reviews.tagRespectful'), icon: '🤝' },
    { value: 'prepared', label: t('reviews.tagPrepared'), icon: '📋' }
])

const toggleTag = (tag) => {
    const idx = selectedTags.value.indexOf(tag)
    if (idx === -1) {
        selectedTags.value.push(tag)
    } else {
        selectedTags.value.splice(idx, 1)
    }
}

// ── Rating labels ────────────────────────────────────────────────────────
const ratingLabel = computed(() => {
    const star = hoverRating.value || rating.value
    const labels = {
        0: t('reviews.noRating'),
        1: t('reviews.ratingPoor'),
        2: t('reviews.ratingFair'),
        3: t('reviews.ratingGood'),
        4: t('reviews.ratingVeryGood'),
        5: t('reviews.ratingExcellent')
    }
    return labels[star] || ''
})

// ── Placeholder ──────────────────────────────────────────────────────────
const commentPlaceholder = computed(() => {
    if (props.direction === 'client_to_provider') {
        return t('reviews.commentPlaceholderProvider')
    }
    return t('reviews.commentPlaceholderCourse')
})

// ── Validation ───────────────────────────────────────────────────────────
const isValid = computed(() => {
    if (props.direction === 'provider_to_client') {
        return selectedTags.value.length > 0
    }
    return rating.value > 0 && comment.value.trim().length >= 10
})

// ── Submit ───────────────────────────────────────────────────────────────
const handleSubmit = () => {
    if (!isValid.value || props.loading) return

    const payload = {}

    if (props.direction === 'provider_to_client') {
        payload.appointmentId = props.appointmentId
        payload.tags = [...selectedTags.value]
        if (note.value.trim()) {
            payload.note = note.value.trim()
        }
    } else if (props.direction === 'client_to_provider') {
        payload.appointmentId = props.appointmentId
        payload.rating = rating.value
        payload.comment = comment.value.trim()
    } else if (props.direction === 'client_to_course') {
        payload.courseId = props.courseId
        payload.rating = rating.value
        payload.comment = comment.value.trim()
    }

    emit('submit', payload)
}

// ── Public reset (parent can call via template ref) ──────────────────────
const resetForm = () => {
    rating.value = 0
    hoverRating.value = 0
    comment.value = ''
    selectedTags.value = []
    note.value = ''
}

defineExpose({ resetForm })
</script>