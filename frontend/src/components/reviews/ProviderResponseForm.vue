<!-- frontend/src/components/reviews/ReviewList.vue -->
<template>
    <div>
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="reviews.length === 0" class="text-center py-8">
            <ChatBubbleBottomCenterTextIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-gray-500 text-sm">{{ $t('reviews.noReviews') }}</p>
        </div>

        <!-- Reviews list -->
        <div v-else class="space-y-5">
            <div v-for="review in visibleReviews" :key="review._id"
                class="bg-white border border-gray-200 rounded-xl p-5">

                <!-- ── Header: avatar + name + rating/tags + date ─────────── -->
                <div class="flex items-start justify-between">
                    <div class="flex items-start space-x-3">
                        <!-- Avatar -->
                        <img v-if="reviewerAvatar(review)" :src="$uploadsUrl(reviewerAvatar(review))"
                            class="w-10 h-10 rounded-full object-cover" :alt="reviewerName(review)" />
                        <div v-else
                            class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                            {{ reviewerInitials(review) }}
                        </div>

                        <div>
                            <p class="text-sm font-medium text-gray-900">
                                {{ reviewerName(review) }}
                            </p>

                            <!-- Stars (for client_to_provider & client_to_course) -->
                            <div v-if="review.rating" class="flex items-center mt-0.5">
                                <template v-for="i in 5" :key="i">
                                    <StarIcon class="h-4 w-4" :class="i <= review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'" />
                                </template>
                            </div>

                            <!-- Tags (for provider_to_client) -->
                            <div v-if="review.tags && review.tags.length > 0" class="flex flex-wrap gap-1.5 mt-1">
                                <span v-for="tag in review.tags" :key="tag"
                                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200">
                                    {{ tagIcon(tag) }} {{ $t(`reviews.tag${capitalize(tag)}`) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <span class="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {{ formatDate(review.createdAt) }}
                    </span>
                </div>

                <!-- ── Comment body ───────────────────────────────────────── -->
                <p v-if="review.comment" class="mt-3 text-sm text-gray-700 leading-relaxed">
                    {{ review.comment }}
                </p>

                <!-- ── Provider note (for provider_to_client) ─────────────── -->
                <p v-if="review.note" class="mt-3 text-sm text-gray-600 italic">
                    "{{ review.note }}"
                </p>

                <!-- ── Context: which appointment or course ───────────────── -->
                <div v-if="showContext" class="mt-2">
                    <p v-if="review.appointment" class="text-xs text-gray-400">
                        {{ $t('reviews.contextAppointment', {
                            date: formatDate(review.appointment.dateTime),
                            type: review.appointment.type || ''
                        }) }}
                    </p>
                    <p v-if="review.course" class="text-xs text-gray-400">
                        {{ $t('reviews.contextCourse', { title: review.course.title || '' }) }}
                    </p>
                </div>

                <!-- ── Provider response ──────────────────────────────────── -->
                <div v-if="review.providerResponse?.text"
                    class="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                    <p class="text-xs font-medium text-blue-900 mb-1">
                        {{ $t('reviews.providerResponse') }}
                    </p>
                    <p class="text-sm text-blue-800">{{ review.providerResponse.text }}</p>
                    <p class="text-xs text-blue-600 mt-1">
                        {{ formatDate(review.providerResponse.respondedAt) }}
                    </p>
                </div>

                <!-- ── Respond button (for provider viewing their own reviews) -->
                <div v-if="canRespond && !review.providerResponse?.text && review.direction === 'client_to_provider'"
                    class="mt-3">
                    <button v-if="respondingTo !== review._id" @click="respondingTo = review._id"
                        class="text-sm text-sky-600 hover:text-sky-700 font-medium">
                        {{ $t('reviews.respond') }}
                    </button>

                    <ProviderResponseForm v-else :review-id="review._id" @submit="(data) => $emit('respond', data)"
                        @cancel="respondingTo = null" />
                </div>
            </div>

            <!-- Show more / less -->
            <div v-if="reviews.length > initialLimit" class="text-center pt-2">
                <button @click="showAll = !showAll" class="text-sm text-sky-600 hover:text-sky-700 font-medium">
                    {{ showAll
                        ? $t('reviews.showLess')
                        : $t('reviews.showMore', { count: reviews.length - initialLimit }) }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { StarIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/vue/24/outline'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProviderResponseForm from './ProviderResponseForm.vue'

const { t, locale } = useI18n()

const props = defineProps({
    reviews: { type: Array, required: true },
    loading: { type: Boolean, default: false },
    // Show respond button (when provider is viewing reviews about themselves)
    canRespond: { type: Boolean, default: false },
    // Show which appointment/course the review is for
    showContext: { type: Boolean, default: false },
    // Number of reviews to show before "Show more"
    initialLimit: { type: Number, default: 5 }
})

defineEmits(['respond'])

// ── State ────────────────────────────────────────────────────────────────
const showAll = ref(false)
const respondingTo = ref(null)

const visibleReviews = computed(() => {
    if (showAll.value || props.reviews.length <= props.initialLimit) {
        return props.reviews
    }
    return props.reviews.slice(0, props.initialLimit)
})

// ── Locale ───────────────────────────────────────────────────────────────
const intlLocale = computed(() => {
    const map = { en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ' }
    return map[locale.value] || 'en-US'
})

const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString(intlLocale.value, {
        year: 'numeric', month: 'short', day: 'numeric'
    })
}

// ── Reviewer info helpers ────────────────────────────────────────────────
// The reviewer field is populated as { firstName, lastName, profilePicture }
const reviewerName = (review) => {
    const r = review.reviewer
    if (!r) return t('reviews.anonymous')
    return `${r.firstName || ''} ${r.lastName || ''}`.trim() || t('reviews.anonymous')
}

const reviewerInitials = (review) => {
    const r = review.reviewer
    if (!r) return '?'
    return `${(r.firstName || '')[0] || ''}${(r.lastName || '')[0] || ''}`.toUpperCase() || '?'
}

const reviewerAvatar = (review) => {
    return review.reviewer?.profilePicture || null
}

// ── Tag helpers ──────────────────────────────────────────────────────────
const tagIcons = { punctual: '⏰', communicative: '💬', respectful: '🤝', prepared: '📋' }
const tagIcon = (tag) => tagIcons[tag] || '•'

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
</script>