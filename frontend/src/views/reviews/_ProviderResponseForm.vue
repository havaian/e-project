<template>
    <form @submit.prevent="handleSubmit" class="form-container">
        <div class="form-group">
            <label for="response" class="label">Your response</label>
            <div class="relative">
                <textarea id="response" v-model="response" rows="4" class="input resize-none"
                    :class="response.trim() ? 'success' : ''"
                    placeholder="Write your professional response to this review..." required></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400">
                    {{ response.length }}/500
                </div>
            </div>
            <div class="mt-2 flex items-start space-x-2">
                <InformationCircleIcon class="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-gray-600">
                    Your response will be visible to all users. Be professional and constructive.
                </p>
            </div>
        </div>

        <div class="flex justify-end space-x-3">
            <button type="button" @click="response = ''" class="btn-secondary" :disabled="!response.trim()">
                <TrashIcon class="w-4 h-4 mr-2" />
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
                    Sending response...
                </span>
                <span v-else class="flex items-center">
                    <PaperAirplaneIcon class="w-4 h-4 mr-2" />
                    Send response
                </span>
            </button>
        </div>
    </form>
</template>

<script setup>
import { InformationCircleIcon, TrashIcon, PaperAirplaneIcon } from "@heroicons/vue/24/outline";
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