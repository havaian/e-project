<template>
    <form @submit.prevent="handleSubmit" class="flex space-x-3">
        <div class="flex-1 input-group">
            <input v-model="message" @input="handleInput" @keydown="handleKeydown" type="text" class="input pr-12"
                placeholder="Type your message..." :disabled="disabled"
                :class="disabled ? 'opacity-50 cursor-not-allowed' : ''" />
            <button v-if="message.trim()" type="button" @click="clearMessage"
                class="input-icon text-gray-400 hover:text-gray-600">
                <XMarkIcon class="h-4 w-4" />
            </button>
        </div>
        <button type="submit" class="btn-primary flex items-center justify-center min-w-[3rem] h-12"
            :disabled="disabled || loading || !message.trim()">
            <PaperAirplaneIcon v-if="!loading" class="h-5 w-5" />
            <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
        </button>
    </form>
</template>

<script setup>
import { XMarkIcon, PaperAirplaneIcon } from "@heroicons/vue/24/outline";
import { ref } from 'vue'

const props = defineProps({
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'typing', 'keydown'])
const message = ref('')

function handleSubmit() {
    if (!message.value.trim() || props.disabled || props.loading) return

    emit('submit', message.value.trim())
    message.value = ''
}

function handleInput() {
    emit('typing')
}

function handleKeydown(event) {
    emit('keydown', event)

    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        handleSubmit()
    }
}

function clearMessage() {
    message.value = ''
}

// Expose methods for parent components
defineExpose({
    clearMessage,
    focus: () => {
        // Could add focus functionality if needed
    }
})
</script>