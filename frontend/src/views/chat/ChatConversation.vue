<template>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="card-element overflow-hidden h-[600px] flex flex-col">
            <ChatWindow :messages="messages" :recipient-name="recipientName" :recipient-avatar="recipientAvatar"
                :recipient-status="recipientStatus" :recipient-online-status="recipientOnlineStatus"
                :current-user-id="currentUserId" :user-initials="userInitials" :is-typing="isTyping"
                :disabled="!isAuthenticated" :loading="loading" :sending="sending" @submit="handleMessageSubmit"
                @typing="handleTyping" @keydown="handleKeyDown" @scroll="handleScroll" @phone-call="handlePhoneCall"
                @video-call="handleVideoCall" ref="chatWindow" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/plugins/axios'
import { io } from 'socket.io-client'
import ChatWindow from '@/components/chat/ChatWindow.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Core reactive data
const messages = ref([])
const conversation = ref(null)
const loading = ref(true)
const sending = ref(false)
const isTyping = ref(false)
const socket = ref(null)
const chatWindow = ref(null)

// Online status and read receipts
const recipientOnlineStatus = ref({ isOnline: false, lastSeen: null })
const typingTimeout = ref(null)
const isUserTyping = ref(false)

// Computed properties for authentication and user data
const isAuthenticated = computed(() => authStore.isAuthenticated)

const currentUserId = computed(() => {
    return authStore.user?._id || authStore.user?.id
})

const userInitials = computed(() => {
    const user = authStore.user
    if (!user) return 'U'
    const first = user.firstName?.charAt(0) || ''
    const last = user.lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
})

// Recipient data
const recipient = computed(() => {
    if (!conversation.value?.participants) return null

    const userId = currentUserId.value
    if (!userId) return null

    return conversation.value.participants.find(p => p?._id !== userId) || null
})

const recipientName = computed(() => {
    if (!recipient.value) return 'Loading...'
    const first = recipient.value.firstName || ''
    const last = recipient.value.lastName || ''
    return `${first} ${last}`.trim() || 'User'
})

const recipientAvatar = computed(() => {
    if (!recipient.value) return '/images/user-placeholder.jpg'
    return recipient.value.profilePicture ?
        `/api${recipient.value.profilePicture}` :
        '/images/user-placeholder.jpg'
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

// API Functions
async function fetchConversation() {
    try {
        loading.value = true
        const response = await api.get(`/chat/conversations/${route.params.id}`)
        conversation.value = response.data.conversation
        messages.value = response.data.messages || []
        await nextTick()
        chatWindow.value?.scrollToBottom()
    } catch (error) {
        console.error('Error fetching conversation:', error)
        conversation.value = null
        messages.value = []
    } finally {
        loading.value = false
    }
}

// Socket Functions
function initializeSocket() {
    if (!isAuthenticated.value) {
        console.error('User not authenticated')
        return
    }

    const token = authStore.token
    if (!token) {
        console.error('No authentication token available')
        return
    }

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

    // Socket event handlers
    socket.value.on('connect', () => {
        console.log('Socket connected successfully')
        socket.value.emit('join-conversation', route.params.id)
    })

    socket.value.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        if (error.message?.includes('Authentication error')) {
            console.error('Authentication failed. Please log in again.')
        }
    })

    socket.value.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
    })

    socket.value.on('error', (error) => {
        console.error('Socket error:', error)
    })

    socket.value.on('new-message', async (message) => {
        if (message.conversation === route.params.id) {
            messages.value.push(message)
            await nextTick()
            chatWindow.value?.scrollToBottom()

            // Auto-mark as read if user is at bottom of chat
            setTimeout(() => {
                handleScroll()
            }, 100)
        }
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
        if (data.userId !== currentUserId.value) {
            isTyping.value = true
            setTimeout(() => {
                isTyping.value = false
            }, 3000)
        }
    })

    socket.value.on('stop-typing', (data) => {
        if (data.userId !== currentUserId.value) {
            isTyping.value = false
        }
    })

    // Read receipts
    socket.value.on('messages-read', (data) => {
        if (data.conversationId === route.params.id) {
            messages.value = messages.value.map(message => {
                if (message.sender._id === currentUserId.value) {
                    return { ...message, isRead: true }
                }
                return message
            })
        }
    })
}

// Event Handlers
function handleMessageSubmit(messageText) {
    if (!messageText || sending.value || !recipient.value) {
        return
    }

    if (!socket.value?.connected) {
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

        socket.value.emit('new-message', messageData, (response) => {
            if (response && response.success) {
                console.log('Message sent successfully')
            } else {
                console.error('Failed to send message:', response)
                alert('Failed to send message. Please try again.')
            }
        })

    } catch (error) {
        console.error('Error sending message:', error)
        alert('Error sending message. Please try again.')
    } finally {
        sending.value = false
    }
}

function handleTyping() {
    if (!socket.value?.connected || !recipient.value) return

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
        if (isUserTyping.value && socket.value?.connected) {
            isUserTyping.value = false
            socket.value.emit('stop-typing', { conversationId: route.params.id })
        }
    }, 2000)
}

function handleKeyDown(event) {
    // Event is already handled by ChatInput component
    // This is here for potential future enhancements
}

function handleScroll() {
    // Mark messages as read when scrolled to bottom
    if (socket.value?.connected) {
        socket.value.emit('mark-read', { conversationId: route.params.id })
    }
}

function handlePhoneCall() {
    console.log('Phone call initiated')
    // Implement phone call functionality
}

function handleVideoCall() {
    console.log('Video call initiated')
    // Implement video call functionality
}

// Lifecycle management
onMounted(() => {
    if (!isAuthenticated.value) {
        console.error('User not authenticated, cannot load chat')
        loading.value = false
        return
    }

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

// Watch for recipient changes
watch(() => recipient.value, (newRecipient) => {
    if (newRecipient && socket.value) {
        recipientOnlineStatus.value = { isOnline: false, lastSeen: null }
    }
}, { immediate: true })
</script>