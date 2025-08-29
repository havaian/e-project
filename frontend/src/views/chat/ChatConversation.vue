<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card-element overflow-hidden h-[600px] flex flex-col">
            <!-- Enhanced Chat Header -->
            <div class="p-6 border-b border-gray-200/50 bg-gradient-to-r from-brand-1/5 to-brand-2/5">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="relative">
                            <img :src="recipientAvatar" :alt="recipientName"
                                class="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-md" />
                            <!-- Enhanced Online Status Indicator -->
                            <div v-if="recipientOnlineStatus.isOnline"
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
                                    :class="recipientOnlineStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'"></span>
                                {{ recipientStatus }}
                            </p>
                        </div>
                    </div>

                    <!-- Chat Actions -->
                    <div class="flex items-center space-x-2">
                        <button
                            class="p-2 text-gray-400 hover:text-brand-1 rounded-lg hover:bg-white/50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </button>
                        <button
                            class="p-2 text-gray-400 hover:text-brand-1 rounded-lg hover:bg-white/50 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Enhanced Messages Container -->
            <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30"
                @scroll="handleScroll">
                <template v-for="message in messages" :key="message._id">
                    <!-- Message Bubble -->
                    <div class="flex mb-4" :class="[
                        message.sender._id === authStore.user._id ? 'justify-end' : 'justify-start',
                    ]">
                        <!-- Other Person's Avatar -->
                        <div v-if="message.sender._id !== authStore.user._id" class="flex-shrink-0 mr-3">
                            <img :src="message.sender.profilePicture || '/images/user-placeholder.jpg'"
                                :alt="message.sender.firstName"
                                class="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" />
                        </div>

                        <!-- Enhanced Message Content -->
                        <div class="rounded-2xl px-4 py-3 max-w-[70%] shadow-sm relative" :class="[
                            message.sender._id === authStore.user._id
                                ? 'bg-gradient-to-r from-brand-1 to-brand-2 text-white'
                                : 'bg-white text-gray-900 border border-gray-100'
                        ]">
                            <!-- Sender Label -->
                            <div class="text-xs mb-1"
                                :class="message.sender._id === authStore.user._id ? 'opacity-75' : 'text-gray-500'">
                                {{ formatSenderLabel(message.sender) }}
                            </div>

                            <!-- Message Text -->
                            <div class="text-sm leading-relaxed">{{ message.text }}</div>

                            <!-- Enhanced Timestamp and Read Status -->
                            <div class="flex items-center justify-between mt-2">
                                <div class="text-xs"
                                    :class="message.sender._id === authStore.user._id ? 'opacity-70' : 'text-gray-500'">
                                    {{ formatTime(message.createdAt) }}
                                </div>

                                <!-- Enhanced Read Status (only for sent messages) -->
                                <div v-if="message.sender._id === authStore.user._id" class="ml-2">
                                    <div v-if="message.isRead" class="flex items-center space-x-0.5" title="Read">
                                        <svg class="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        <svg class="w-4 h-4 text-white/70 -ml-1" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <svg v-else class="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20"
                                        title="Sent">
                                        <path fill-rule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <!-- User's Avatar -->
                        <div v-if="message.sender._id === authStore.user._id" class="flex-shrink-0 ml-3">
                            <div
                                class="h-10 w-10 rounded-full bg-gradient-to-r from-brand-1 to-brand-2 flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm">
                                {{ userInitials }}
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Enhanced Typing Indicator -->
                <div v-if="isTyping" class="flex items-center space-x-3 text-gray-500">
                    <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
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
            </div>

            <!-- Enhanced Input Area -->
            <div class="p-4 border-t border-gray-200/50 bg-white">
                <form @submit.prevent="sendMessage" class="flex space-x-3">
                    <div class="flex-1 input-group">
                        <input v-model="newMessage" @input="handleTyping" @keydown="handleKeyDown" type="text"
                            class="input pr-12" placeholder="Type your message..." :disabled="loading || sending" />
                        <button v-if="newMessage.trim()" type="button" @click="newMessage = ''"
                            class="input-icon text-gray-400 hover:text-gray-600">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <button type="submit" class="btn-primary px-4 py-4 flex items-center justify-center min-w-[3rem]"
                        :disabled="loading || sending || !newMessage.trim()">
                        <svg v-if="!sending" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 19l9 2-9-18-9 18l9-2zm0 0v-8" />
                        </svg>
                        <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format } from 'date-fns'
import api from '@/plugins/axios'
import { io } from 'socket.io-client'

const route = useRoute()
const authStore = useAuthStore()

const messages = ref([])
const conversation = ref(null)
const loading = ref(true)
const sending = ref(false)
const isTyping = ref(false)
const socket = ref(null)
const newMessage = ref('')
const messagesContainer = ref(null)

// Online status and read receipts
const recipientOnlineStatus = ref({ isOnline: false, lastSeen: null })
const typingTimeout = ref(null)
const isUserTyping = ref(false)

const userInitials = computed(() => {
    const user = authStore.user
    if (!user) return 'U'
    return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase()
})

const recipient = computed(() => {
    if (!conversation.value) return null
    return conversation.value.participants.find(p => p._id !== authStore.user._id)
})

const recipientName = computed(() => {
    if (!recipient.value) return ''
    return recipient.value.role === 'provider' ?
        `${recipient.value.firstName} ${recipient.value.lastName}` :
        `${recipient.value.firstName} ${recipient.value.lastName}`
})

const recipientAvatar = computed(() => {
    return recipient.value?.profilePicture || '/images/user-placeholder.jpg'
})

const recipientStatus = computed(() => {
    if (recipientOnlineStatus.value.isOnline) {
        return 'Online'
    } else if (recipientOnlineStatus.value.lastSeen) {
        const lastSeenDate = new Date(recipientOnlineStatus.value.lastSeen)
        const now = new Date()
        const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60))

        if (diffMinutes < 1) return 'Last seen just now'
        if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`
        if (diffMinutes < 1440) return `Last seen ${Math.floor(diffMinutes / 60)}h ago`
        return `Last seen ${Math.floor(diffMinutes / 1440)}d ago`
    }
    return 'Offline'
})

function formatSenderLabel(sender) {
    return sender.role === 'provider' ?
        `${sender.firstName} ${sender.lastName}` :
        `${sender.firstName} ${sender.lastName}`
}

function formatTime(timestamp) {
    return format(new Date(timestamp), 'h:mm a')
}

function scrollToBottom() {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}

// Handle scroll to mark messages as read
function handleScroll() {
    if (messagesContainer.value) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100

        if (isNearBottom && socket.value) {
            socket.value.emit('mark-read', { conversationId: route.params.id })
        }
    }
}

// Handle typing indicators
function handleTyping() {
    if (!socket.value || !recipient.value) return

    if (!isUserTyping.value) {
        isUserTyping.value = true
        socket.value.emit('typing', { conversationId: route.params.id })
    }

    // Clear existing timeout
    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
    }

    // Set new timeout to stop typing
    typingTimeout.value = setTimeout(() => {
        if (isUserTyping.value) {
            isUserTyping.value = false
            socket.value.emit('stop-typing', { conversationId: route.params.id })
        }
    }, 2000)
}

function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        sendMessage()
    }
}

async function fetchConversation() {
    try {
        loading.value = true
        const response = await api.get(`/chat/conversations/${route.params.id}`)
        conversation.value = response.data.conversation
        messages.value = response.data.messages
        await nextTick()
        scrollToBottom()
    } catch (error) {
        console.error('Error fetching conversation:', error)
    } finally {
        loading.value = false
    }
}

async function sendMessage() {
    const messageText = newMessage.value.trim()

    if (!messageText || sending.value || !recipient.value) {
        // console.log('Cannot send message:', {
        //     messageText: !!messageText,
        //     sending: sending.value,
        //     recipient: !!recipient.value,
        //     socketConnected: socket.value?.connected
        // })
        return
    }

    if (!socket.value || !socket.value.connected) {
        console.error('Socket not connected')
        alert('Connection lost. Please refresh the page.')
        return
    }

    try {
        sending.value = true

        // Stop typing indicator
        if (isUserTyping.value) {
            isUserTyping.value = false
            socket.value.emit('stop-typing', { conversationId: route.params.id })
        }

        const messageData = {
            conversationId: route.params.id,
            receiverId: recipient.value._id,
            text: messageText
        }

        // Add acknowledgment callback to confirm message was received by server
        socket.value.emit('new-message', messageData, (response) => {
            if (response && response.success) {
                // console.log('Message sent successfully')
            } else {
                console.error('Failed to send message:', response)
                alert('Failed to send message. Please try again.')
            }
        })

        newMessage.value = ''
        await nextTick()
        scrollToBottom()
    } catch (error) {
        console.error('Error sending message:', error)
        alert('Error sending message. Please try again.')
    } finally {
        sending.value = false
    }
}

function initializeSocket() {
    const token = authStore.token

    if (!token) {
        console.error('No authentication token available')
        return
    }

    // Use environment variable for WebSocket URL, fallback to current location origin
    const wsUrl = import.meta.env.VITE_WS_URL || window.location.origin

    socket.value = io(wsUrl, {
        query: { token },
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        forceNew: true
    })

    socket.value.on('connect', () => {
        // console.log('Socket connected successfully')
        socket.value.emit('join-conversation', route.params.id)
    })

    socket.value.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
    })

    socket.value.on('disconnect', (reason) => {
        // console.log('Socket disconnected:', reason)
    })

    socket.value.on('error', (error) => {
        console.error('Socket error:', error)
    })

    socket.value.on('new-message', async (message) => {
        if (message.conversation === route.params.id) {
            messages.value.push(message)
            await nextTick()
            scrollToBottom()

            // Auto-mark as read if user is at bottom of chat
            setTimeout(() => {
                handleScroll()
            }, 100)
        }
    })

    socket.value.on('new-message-notification', (data) => {
        // Handle notifications for messages in other conversations
        // You could show a toast notification here
    })

    // Online status events
    socket.value.on('conversation-participants-status', (data) => {
        if (data.conversationId === route.params.id && recipient.value) {
            const status = data.statuses[recipient.value._id]
            if (status) {
                recipientOnlineStatus.value = status
            }
        }
    })

    socket.value.on('user-status', (data) => {
        if (recipient.value && data.userId === recipient.value._id) {
            recipientOnlineStatus.value = {
                isOnline: data.isOnline,
                lastSeen: data.lastSeen || recipientOnlineStatus.value.lastSeen
            }
        }
    })

    socket.value.on('user-joined', (data) => {
        if (recipient.value && data.userId === recipient.value._id) {
            recipientOnlineStatus.value.isOnline = true
        }
    })

    socket.value.on('user-left', (data) => {
        if (recipient.value && data.userId === recipient.value._id) {
            recipientOnlineStatus.value.isOnline = data.isOnline || false
        }
    })

    // Typing events
    socket.value.on('typing', (data) => {
        if (data.userId !== authStore.user._id) {
            isTyping.value = true
            setTimeout(() => {
                isTyping.value = false
            }, 3000)
        }
    })

    socket.value.on('stop-typing', (data) => {
        if (data.userId !== authStore.user._id) {
            isTyping.value = false
        }
    })

    // Read receipts
    socket.value.on('messages-read', (data) => {
        if (data.conversationId === route.params.id) {
            // Update read status for messages sent by current user
            messages.value = messages.value.map(message => {
                if (message.sender._id === authStore.user._id) {
                    return { ...message, isRead: true }
                }
                return message
            })
        }
    })
}

// Watch for conversation changes to update online status
watch(() => recipient.value, (newRecipient) => {
    if (newRecipient && socket.value) {
        // Reset online status when switching conversations
        recipientOnlineStatus.value = { isOnline: false, lastSeen: null }
    }
}, { immediate: true })

onMounted(() => {
    fetchConversation()
    initializeSocket()
})

onUnmounted(() => {
    if (socket.value) {
        socket.value.emit('leave-conversation', route.params.id)

        if (isUserTyping.value) {
            socket.value.emit('stop-typing', { conversationId: route.params.id })
        }

        socket.value.disconnect()
    }

    if (typingTimeout.value) {
        clearTimeout(typingTimeout.value)
    }
})
</script>