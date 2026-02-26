<template>
    <form @submit.prevent="handleSubmit" class="form-container">
        <!-- Rating section -->
        <div class="form-group">
            <label class="label">Rate your experience</label>
            <div class="flex items-center space-x-4">
                <div class="flex items-center space-x-1">
                    <button v-for="i in 5" :key="i" type="button"
                        class="p-1 focus:outline-none focus:ring-2 focus:ring-brand-1/20 rounded transition-colors"
                        @click="rating = i" @mouseover="hoverRating = i" @mouseleave="hoverRating = 0">
                        <StarIcon class="h-8 w-8 transition-colors duration-150"
                            :class="i <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'" />
                    </button>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-gray-900">{{ getRatingText(hoverRating || rating) }}</span>
                    <span class="text-xs text-gray-500">{{ rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'
                    }}</span>
                </div>
            </div>
        </div>

        <!-- Comment section -->
        <div class="form-group">
            <label for="comment" class="label">Share your experience</label>
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
                <CheckIcon class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-gray-600">
                    Your review helps others make informed decisions and helps providers improve their services.
                </p>
            </div>
        </div>

        <!-- Review guidelines -->
        <div class="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4">
            <div class="flex">
                <InformationCircleIcon class="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                    <h4 class="text-sm font-medium text-blue-900 mb-1">Review guidelines</h4>
                    <ul class="text-sm text-blue-700 space-y-1">
                        <li>• Be honest and specific about your experience</li>
                        <li>• Focus on the quality of care and service</li>
                        <li>• Avoid sharing personal confidential information</li>
                        <li>• Keep your review respectful and constructive</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button type="button" @click="resetForm" class="btn-secondary">
                <ArrowPathIcon class="w-4 h-4 mr-2" />
                Reset form
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
                    Submitting review...
                </span>
                <span v-else class="flex items-center">
                    <StarIcon class="w-4 h-4 mr-2" />
                    Submit review
                </span>
            </button>
        </div>
    </form>
</template>

<script setup>
import { StarIcon, CheckIcon, InformationCircleIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";
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