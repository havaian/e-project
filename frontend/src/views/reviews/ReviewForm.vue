<template>
    <form @submit.prevent="handleSubmit" class="form-container">
        <!-- Rating Section -->
        <div class="form-group">
            <label class="label">Rate Your Experience</label>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-1">
                    <button v-for="i in 5" :key="i" type="button"
                        class="p-1 focus:outline-none focus:ring-2 focus:ring-brand-1/20 rounded transition-colors"
                        @click="rating = i" @mouseover="hoverRating = i" @mouseleave="hoverRating = 0">
                        <svg class="h-8 w-8 transition-colors duration-150"
                            :class="i <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'"
                            fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">{{ getRatingText(hoverRating || rating) }}</span>
                    <span class="text-xs text-gray-500">{{ rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'
                        }}</span>
                </div>
            </div>
        </div>

        <!-- Comment Section -->
        <div class="form-group">
            <label for="comment" class="label">Share Your Experience</label>
            <div class="relative">
                <textarea id="comment" v-model="comment" rows="5" class="input resize-none"
                    :class="comment.trim() ? 'success' : ''"
                    placeholder="Tell others about your experience. Was the provider helpful? Did they address your concerns? How was the overall service?"
                    required maxlength="1000"></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    {{ comment.length }}/1000
                </div>
            </div>
            <div class="mt-2 flex items-start space-x-2">
                <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p class="text-sm text-gray-600">
                    Your review helps others make informed decisions and helps providers improve their services.
                </p>
            </div>
        </div>

        <!-- Review Guidelines -->
        <div class="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4">
            <div class="flex">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 class="text-sm font-medium text-blue-900 mb-1">Review Guidelines</h4>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• Be honest and specific about your experience</li>
                        <li>• Focus on the quality of care and service</li>
                        <li>• Avoid sharing personal medical information</li>
                        <li>• Keep your review respectful and constructive</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button type="button" @click="resetForm" class="btn-secondary">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Form
            </button>
            <button type="submit" class="btn-primary" :disabled="loading || !isValid">
                <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Submitting Review...
                </span>
                <span v-else class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Submit Review
                </span>
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    appointmentId: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['submit'])

const rating = ref(0)
const comment = ref('')
const loading = ref(false)
const hoverRating = ref(0)

const isValid = computed(() => {
    return rating.value > 0 && comment.value.trim().length > 0
})

function getRatingText(stars) {
    const ratingTexts = {
        0: 'No rating',
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
    }
    return ratingTexts[stars] || 'No rating'
}

function resetForm() {
    rating.value = 0
    comment.value = ''
    hoverRating.value = 0
}

async function handleSubmit() {
    if (!isValid.value) return

    loading.value = true
    try {
        emit('submit', {
            appointmentId: props.appointmentId,
            rating: rating.value,
            comment: comment.value
        })
        resetForm()
    } finally {
        loading.value = false
    }
}
</script>