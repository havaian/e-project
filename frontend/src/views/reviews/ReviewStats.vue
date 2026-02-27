<!-- frontend/src/components/reviews/ReviewStats.vue -->
<template>
    <div>
        <!-- ── Star-based stats (provider / course) ───────────────────────── -->
        <div v-if="mode === 'stars'" class="space-y-4">
            <!-- Average -->
            <div class="flex items-center space-x-4">
                <div class="text-center">
                    <span class="text-3xl font-bold text-gray-900">
                        {{ averageRating.toFixed(1) }}
                    </span>
                    <div class="flex items-center justify-center mt-1">
                        <template v-for="i in 5" :key="i">
                            <StarIcon class="h-4 w-4" :class="i <= Math.round(averageRating)
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'" />
                        </template>
                    </div>
                    <p class="text-xs text-gray-500 mt-1">
                        {{ $t('reviews.totalReviews', { count: totalReviews }) }}
                    </p>
                </div>

                <!-- Distribution bars -->
                <div v-if="ratingDistribution" class="flex-1 space-y-1.5">
                    <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center space-x-2">
                        <span class="text-xs text-gray-500 w-3 text-right">{{ star }}</span>
                        <StarIcon class="h-3.5 w-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div class="h-full bg-yellow-400 rounded-full transition-all duration-300"
                                :style="{ width: distributionPercent(star) + '%' }">
                            </div>
                        </div>
                        <span class="text-xs text-gray-400 w-8 text-right">
                            {{ ratingDistribution[star] || 0 }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── Tag-based stats (client reputation) ────────────────────────── -->
        <div v-if="mode === 'tags'" class="space-y-3">
            <p class="text-sm font-medium text-gray-700">
                {{ $t('reviews.clientReputation') }}
                <span class="text-gray-400 font-normal">
                    ({{ $t('reviews.totalReviews', { count: totalReviews }) }})
                </span>
            </p>
            <div v-if="tagsSummary && tagsSummary.length > 0" class="flex flex-wrap gap-2">
                <div v-for="item in tagsSummary" :key="item.tag"
                    class="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-sky-50 border border-sky-200">
                    <span class="mr-1">{{ tagIcon(item.tag) }}</span>
                    <span class="font-medium text-sky-700">
                        {{ $t(`reviews.tag${capitalize(item.tag)}`) }}
                    </span>
                    <span class="ml-1.5 text-xs text-sky-500">×{{ item.count }}</span>
                </div>
            </div>
            <p v-else class="text-sm text-gray-400">{{ $t('reviews.noTagsYet') }}</p>
        </div>
    </div>
</template>

<script setup>
import { StarIcon } from '@heroicons/vue/24/outline'
import { computed } from 'vue'

const props = defineProps({
    // 'stars' for provider/course rating display, 'tags' for client reputation
    mode: { type: String, default: 'stars', validator: v => ['stars', 'tags'].includes(v) },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    // { 1: count, 2: count, ... 5: count }
    ratingDistribution: { type: Object, default: null },
    // [{ tag: 'punctual', count: 5 }, ...]
    tagsSummary: { type: Array, default: () => [] }
})

const distributionPercent = (star) => {
    if (!props.ratingDistribution || props.totalReviews === 0) return 0
    return Math.round(((props.ratingDistribution[star] || 0) / props.totalReviews) * 100)
}

const tagIcons = { punctual: '⏰', communicative: '💬', respectful: '🤝', prepared: '📋' }
const tagIcon = (tag) => tagIcons[tag] || '•'
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)
</script>