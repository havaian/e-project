<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card-element overflow-hidden">
            <!-- Enhanced Header -->
            <div class="p-6 border-b border-gray-200/50 bg-gradient-to-r from-brand-1/5 to-brand-2/5">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">Messages</h1>
                        <p class="text-gray-600 mt-1">Stay connected with your appointments</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <!-- Search Icon -->
                        <button
                            class="p-2 text-gray-400 hover:text-brand-1 rounded-lg hover:bg-white/50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <!-- Compose Icon -->
                        <button
                            class="p-2 text-gray-400 hover:text-brand-1 rounded-lg hover:bg-white/50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Conversation List -->
            <div class="divide-y divide-gray-100">
                <div v-if="loading" class="p-8 text-center">
                    <div
                        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-1 border-t-transparent">
                    </div>
                    <p class="mt-4 text-gray-600">Loading your conversations...</p>
                </div>

                <template v-else>
                    <div v-if="conversations.length === 0" class="p-12 text-center">
                        <div class="mx-auto h-16 w-16 text-gray-400 mb-4">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                        <p class="text-gray-500">Start chatting by booking an appointment or responding to messages</p>
                    </div>

                    <router-link v-for="conversation in conversations" :key="conversation._id"
                        :to="{ name: 'chat-conversation', params: { id: conversation._id } }"
                        class="block p-6 hover:bg-gray-50/50 transition-colors duration-200 relative group">
                        <div class="flex items-center space-x-4">
                            <!-- Enhanced Avatar with Online Status -->
                            <div class="relative flex-shrink-0">
                                <img :src="getOtherParticipant(conversation).profilePicture || '/images/user-placeholder.jpg'"
                                    :alt="getOtherParticipant(conversation).firstName"
                                    class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-brand-1/20 transition-all" />
                                <!-- Online Status Indicator (you could add this based on real-time data) -->
                                <div
                                    class="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 border-2 border-white rounded-full">
                                </div>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between mb-1">
                                    <h3
                                        class="text-base font-semibold text-gray-900 truncate group-hover:text-brand-1 transition-colors">
                                        {{ formatParticipantName(getOtherParticipant(conversation)) }}
                                    </h3>
                                    <div class="flex items-center space-x-2">
                                        <p class="text-sm text-gray-500 flex-shrink-0">
                                            {{ formatTime(conversation.lastMessage?.createdAt) }}
                                        </p>
                                        <!-- Unread Count Badge -->
                                        <div v-if="conversation.unreadCount > 0"
                                            class="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                                            {{ conversation.unreadCount > 99 ? '99+' : conversation.unreadCount }}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center justify-between">
                                    <p class="text-sm text-gray-600 truncate flex-1 mr-4"
                                        :class="conversation.unreadCount > 0 ? 'font-medium' : ''">
                                        {{ conversation.lastMessage?.text || 'No messages yet' }}
                                    </p>

                                    <!-- Message Status Icon -->
                                    <div v-if="conversation.lastMessage" class="flex-shrink-0">
                                        <!-- Show different icons based on message status -->
                                        <svg v-if="conversation.lastMessage.sender === authStore.user._id"
                                            class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                </div>

                                <!-- Role Badge -->
                                <div class="mt-2">
                                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                        :class="getOtherParticipant(conversation).role === 'provider' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                                        {{ getOtherParticipant(conversation).role === 'provider' ? 'Healthcare Provider'
                                        : 'Client' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Hover Arrow -->
                            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </router-link>
                </template>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import axios from '@/plugins/axios'

const authStore = useAuthStore()
const conversations = ref([])
const loading = ref(true)

function getOtherParticipant(conversation) {
    return conversation.participants.find(p => p._id !== authStore.user._id)
}

function formatParticipantName(participant) {
    if (!participant) return 'Unknown'
    return participant.role === 'provider' ?
        `Dr. ${participant.firstName} ${participant.lastName}` :
        `${participant.firstName} ${participant.lastName}`
}

function formatTime(timestamp) {
    if (!timestamp) return ''

    const date = new Date(timestamp)

    if (isToday(date)) {
        return format(date, 'h:mm a')
    } else if (isYesterday(date)) {
        return 'Yesterday'
    } else {
        // Show relative time for older messages
        return formatDistanceToNow(date, { addSuffix: false })
    }
}

async function fetchConversations() {
    try {
        loading.value = true
        const response = await axios.get('/chat/conversations')
        conversations.value = response.data.conversations
    } catch (error) {
        console.error('Error fetching conversations:', error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchConversations()
})
</script>