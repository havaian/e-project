<template>
    <div class="flex flex-col h-full">
        <!-- Chat Header -->
        <div class="p-6 border-b border-gray-200/50 bg-gradient-to-r from-brand-1/5 to-brand-2/5">
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <div class="relative">
                        <img :src="recipientAvatar" :alt="recipientName"
                            class="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-md" />
                        <!-- Online Status Indicator -->
                        <div v-if="recipientOnlineStatus?.isOnline"
                            class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse">
                        </div>
                        <div v-else
                            class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 border-2 border-white rounded-full">
                        </div>
                    </div>
                    <div class="ml-4">
                        <h3 class="text-lg font-semibold text-gray-900">{{ recipientName }}</h3>
                        <p class="text-sm text-gray-500 flex items-center">
                            <span class="w-2 h-2 rounded-full mr-2"
                                :class="recipientOnlineStatus?.isOnline ? 'bg-green-500' : 'bg-gray-400'"></span>
                            {{ recipientStatus }}
                        </p>
                    </div>
                </div>

                <!-- Chat Actions -->
                <div class="flex items-center space-x-2">
                    <button @click="$emit('phone-call')"
                        class="p-2 text-gray-400 hover:text-brand-1 rounded-lg hover:bg-white/50 transition-colors">
                        <PhoneIcon class="w-5 h-5" />
                    </button>
                    <button @click="$emit('video-call')"
                        class="p-2 text-gray-400 hover:text-brand-1 rounded-lg hover:bg-white/50 transition-colors">
                        <VideoCameraIcon class="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>

        <!-- Messages Container -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30" @scroll="handleScroll">
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center h-full">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-1 border-t-transparent">
                </div>
                <p class="ml-3 text-gray-600">Loading conversation...</p>
            </div>

            <!-- Messages -->
            <template v-else>
                <ChatMessage v-for="message in messages" :key="message._id" :message="message"
                    :current-user-id="currentUserId" :user-initials="userInitials" />

                <!-- Typing Indicator -->
                <div v-if="isTyping" class="flex items-center space-x-3 text-gray-500">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <ChatBubbleLeftEllipsisIcon class="w-4 h-4" />
                    </div>
                    <div class="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
                        <div class="flex items-center space-x-1">
                            <span class="text-sm text-gray-600">{{ recipientName }} is typing</span>
                            <div class="flex space-x-1 ml-2">
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style="animation-delay: 0.2s"></div>
                                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style="animation-delay: 0.4s"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-gray-200/50 bg-white">
            <ChatInput :disabled="disabled" :loading="sending" @submit="handleMessageSubmit" @typing="handleTyping"
                @keydown="handleKeydown" />
        </div>
    </div>
</template>

<script setup>
import { PhoneIcon, VideoCameraIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/vue/24/outline";
import { ref, watch, nextTick } from 'vue'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps({
    messages: {
        type: Array,
        required: true
    },
    recipientName: {
        type: String,
        required: true
    },
    recipientAvatar: {
        type: String,
        default: '/images/user-placeholder.jpg'
    },
    recipientStatus: {
        type: String,
        default: 'Offline'
    },
    recipientOnlineStatus: {
        type: Object,
        default: () => ({ isOnline: false, lastSeen: null })
    },
    currentUserId: {
        type: String,
        required: true
    },
    userInitials: {
        type: String,
        default: 'U'
    },
    isTyping: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    loading: {
        type: Boolean,
        default: false
    },
    sending: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['submit', 'typing', 'keydown', 'scroll', 'phone-call', 'video-call'])
const messagesContainer = ref(null)

function scrollToBottom() {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

function handleScroll() {
    emit('scroll')
}

function handleMessageSubmit(message) {
    emit('submit', message)
}

function handleTyping() {
    emit('typing')
}

function handleKeydown(event) {
    emit('keydown', event)
}

// Watch for new messages and scroll to bottom
watch(() => props.messages.length, () => {
    nextTick(() => scrollToBottom())
})

// Watch for loading state changes
watch(() => props.loading, (newLoading) => {
    if (!newLoading) {
        nextTick(() => scrollToBottom())
    }
})

// Expose scroll function for parent component
defineExpose({
    scrollToBottom
})
</script>