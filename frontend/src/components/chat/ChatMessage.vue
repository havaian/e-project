<template>
    <div class="flex mb-4" :class="isCurrentUser ? 'justify-end' : 'justify-start'">
        <!-- Other Person's Avatar -->
        <div v-if="!isCurrentUser" class="flex-shrink-0 mr-3">
            <img :src="senderAvatar" :alt="senderName"
                class="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
        </div>

        <!-- Message Content -->
        <div class="rounded-2xl px-4 py-3 max-w-[70%] shadow-sm relative" :class="[
            isCurrentUser
                ? 'bg-gradient-to-r from-brand-1 to-brand-2 text-white'
                : 'bg-white text-gray-900 border border-gray-100'
        ]">
            <!-- Sender Label -->
            <div class="text-xs mb-1" :class="isCurrentUser ? 'opacity-75' : 'text-gray-500'">
                {{ formatSenderLabel() }}
            </div>

            <!-- Message Text -->
            <div class="text-sm leading-relaxed">{{ message.text }}</div>

            <!-- Timestamp and Read Status -->
            <div class="flex items-center justify-between mt-2">
                <div class="text-xs" :class="isCurrentUser ? 'opacity-70' : 'text-gray-500'">
                    {{ formatTime(message.createdAt) }}
                </div>

                <!-- Read Status (only for sent messages) -->
                <div v-if="isCurrentUser" class="ml-2">
                    <div v-if="message.isRead" class="flex items-center space-x-0.5" title="Read">
                        <CheckIcon class="w-4 h-4 text-white/70" />
                        <CheckIcon class="w-4 h-4 text-white/70 -ml-1" />
                    </div>
                    <CheckIcon v-else class="w-4 h-4 text-white/70" title="Sent" />
                </div>
            </div>
        </div>

        <!-- Current User's Avatar -->
        <div v-if="isCurrentUser" class="flex-shrink-0 ml-3">
            <div
                class="h-10 w-10 rounded-full bg-gradient-to-r from-brand-1 to-brand-2 flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm">
                {{ userInitials }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { CheckIcon } from "@heroicons/vue/24/outline";
import { computed } from 'vue'
import { format } from 'date-fns'

const props = defineProps({
    message: {
        type: Object,
        required: true
    },
    currentUserId: {
        type: String,
        required: true
    },
    userInitials: {
        type: String,
        default: 'U'
    }
})

// Helper functions
const isCurrentUser = computed(() => {
    return props.message.sender._id === props.currentUserId
})

const senderAvatar = computed(() => {
    if (!props.message.sender) return '/images/user-placeholder.jpg'
    return props.message.sender.profilePicture ?
        `/api${props.message.sender.profilePicture}` :
        '/images/user-placeholder.jpg'
})

const senderName = computed(() => {
    if (!props.message.sender) return 'Unknown User'
    const first = props.message.sender.firstName || ''
    const last = props.message.sender.lastName || ''
    return `${first} ${last}`.trim() || 'User'
})

const formatSenderLabel = () => {
    if (!props.message.sender) return 'Unknown'
    const name = senderName.value
    return props.message.sender.role === 'provider' ? `Dr. ${name}` : name
}

const formatTime = (timestamp) => {
    if (!timestamp) return ''
    return format(new Date(timestamp), 'h:mm a')
}
</script>