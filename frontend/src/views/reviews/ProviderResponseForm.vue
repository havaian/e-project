<template>
    <form @submit.prevent="handleSubmit" class="form-container">
        <div class="form-group">
            <label for="response" class="label">Your Response</label>
            <div class="relative">
                <textarea id="response" v-model="response" rows="4" class="input resize-none"
                    :class="response.trim() ? 'success' : ''"
                    placeholder="Write your professional response to this review..." required></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    {{ response.length }}/500
                </div>
            </div>
            <div class="mt-2 flex items-start space-x-2">
                <svg class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-gray-600">
                    Your response will be visible to all users. Be professional and constructive.
                </p>
            </div>
        </div>

        <div class="flex justify-end space-x-3">
            <button type="button" @click="response = ''" class="btn-secondary" :disabled="!response.trim()">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
            </button>
            <button type="submit" class="btn-primary" :disabled="loading || !response.trim()">
                <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Sending Response...
                </span>
                <span v-else class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 19l9 2-9-18-9 18l9-2zm0 0v-8" />
                    </svg>
                    Send Response
                </span>
            </button>
        </div>
    </form>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    reviewId: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['submit'])

const response = ref('')
const loading = ref(false)

async function handleSubmit() {
    if (!response.value.trim()) return

    loading.value = true
    try {
        emit('submit', {
            reviewId: props.reviewId,
            response: response.value
        })
        response.value = ''
    } finally {
        loading.value = false
    }
}
</script>