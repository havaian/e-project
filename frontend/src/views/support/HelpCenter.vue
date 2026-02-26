<!-- frontend/src/views/support/HelpCenter.vue -->
<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <!-- Header -->
        <div class="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="text-center">
                    <h1 class="text-4xl font-bold mb-4">{{ $t('helpCenter.title') }}</h1>
                    <p class="text-xl text-sky-100 mb-8">{{ $t('helpCenter.subtitle') }}</p>

                    <div class="max-w-2xl mx-auto">
                        <div class="relative">
                            <input v-model="searchQuery" type="text" :placeholder="$t('helpCenter.searchPlaceholder')"
                                class="w-full px-6 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                @input="performSearch" />
                            <MagnifyingGlassIcon class="absolute right-4 top-4 w-6 h-6 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Quick actions -->
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">{{ $t('helpCenter.quickActions') }}</h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <router-link to="/contact"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <ChatBubbleLeftRightIcon class="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">{{ $t('helpCenter.contactSupport') }}</h3>
                        <p class="text-gray-600 text-sm">{{ $t('helpCenter.contactSupportDesc') }}</p>
                    </router-link>

                    <a href="#" @click.prevent="startLiveChat"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <ChatBubbleLeftRightIcon class="w-8 h-8 text-green-600" />
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">{{ $t('helpCenter.liveChat') }}</h3>
                        <p class="text-gray-600 text-sm">{{ $t('helpCenter.liveChatDesc') }}</p>
                    </a>

                    <a :href="`tel:${supportPhone}`"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <PhoneIcon class="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">{{ $t('helpCenter.callUs') }}</h3>
                        <p class="text-gray-600 text-sm">{{ supportPhone }}</p>
                    </a>

                    <router-link to="/faq"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <QuestionMarkCircleIcon class="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">{{ $t('helpCenter.faq') }}</h3>
                        <p class="text-gray-600 text-sm">{{ $t('helpCenter.faqDesc') }}</p>
                    </router-link>
                </div>
            </div>

            <!-- Help Categories -->
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">{{ $t('helpCenter.browseTopics') }}</h2>
                <div class="grid md:grid-cols-3 gap-8">
                    <div v-for="category in helpCategories" :key="category.id"
                        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                        <div class="flex items-start space-x-4">
                            <div :class="category.iconBg"
                                class="rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                                <component :is="getIconComponent(category.id)" class="w-6 h-6"
                                    :class="category.iconColor" />
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ category.title }}</h3>
                                <p class="text-gray-600 text-sm mb-4">{{ category.description }}</p>
                                <div class="space-y-2">
                                    <a v-for="article in category.articles" :key="article.id" href="#"
                                        @click.prevent="openArticle(article)"
                                        class="block text-sm text-sky-600 hover:text-sky-700 transition-colors">
                                        • {{ article.title }}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search results -->
            <div v-if="searchQuery && searchResults.length > 0" class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8">{{ $t('helpCenter.searchResults') }}</h2>
                <div class="space-y-4">
                    <div v-for="result in searchResults" :key="result.id"
                        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ result.title }}</h3>
                        <p class="text-gray-600 mb-3">{{ result.excerpt }}</p>
                        <button @click="openArticle(result)"
                            class="text-sky-600 hover:text-sky-700 font-medium text-sm">
                            {{ $t('helpCenter.readMore') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- No Results -->
            <div v-if="searchQuery && searchResults.length === 0" class="text-center py-12">
                <FaceFrownIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('helpCenter.noResults') }}</h3>
                <p class="text-gray-600 mb-4">{{ $t('helpCenter.noResultsHint', { query: searchQuery }) }}</p>
                <router-link to="/contact" class="btn-primary">{{ $t('helpCenter.contactSupport') }}</router-link>
            </div>

            <!-- Popular articles -->
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">{{ $t('helpCenter.popularArticles') }}
                </h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div v-for="article in popularArticles" :key="article.id"
                        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                        <div class="flex items-start space-x-4">
                            <div class="bg-sky-100 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <DocumentTextIcon class="w-5 h-5 text-sky-600" />
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ article.title }}</h3>
                                <p class="text-gray-600 text-sm mb-3">{{ article.excerpt }}</p>
                                <div class="flex items-center justify-between">
                                    <button @click="openArticle(article)"
                                        class="text-sky-600 hover:text-sky-700 font-medium text-sm">
                                        {{ $t('helpCenter.readArticle') }}
                                    </button>
                                    <span class="text-xs text-gray-500">{{ $t('helpCenter.minRead', {
                                        n:
                                        article.readTime }) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Options -->
            <div class="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-8 text-center">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('helpCenter.stillNeedHelp') }}</h2>
                <p class="text-gray-600 mb-6 max-w-2xl mx-auto">{{ $t('helpCenter.stillNeedHelpHint') }}</p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <router-link to="/contact" class="btn-primary px-6 py-3">{{ $t('helpCenter.contactSupport')
                        }}</router-link>
                    <a :href="`mailto:${supportEmail}`" class="btn-secondary px-6 py-3">{{ $t('helpCenter.emailUs')
                        }}</a>
                </div>
            </div>
        </div>

        <!-- Article Modal -->
        <div v-if="selectedArticle"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900">{{ selectedArticle.title }}</h2>
                        <button @click="closeArticle" class="text-gray-500 hover:text-gray-700">
                            <XMarkIcon class="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="prose max-w-none" v-html="selectedArticle.content"></div>

                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-500">
                                {{ $t('helpCenter.lastUpdated') }}: {{ selectedArticle.lastUpdated }}
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="text-sm text-gray-500">{{ $t('helpCenter.wasHelpful') }}</span>
                                <button @click="rateArticle('helpful')" class="text-green-600 hover:text-green-700">
                                    <HandThumbUpIcon class="w-5 h-5" />
                                </button>
                                <button @click="rateArticle('not-helpful')" class="text-red-600 hover:text-red-700">
                                    <HandThumbDownIcon class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { MagnifyingGlassIcon, ChatBubbleLeftRightIcon, ChatBubbleLeftEllipsisIcon, PhoneIcon, QuestionMarkCircleIcon, BookOpenIcon, EyeIcon, CreditCardIcon, CogIcon, UsersIcon, ShieldCheckIcon, DocumentTextIcon, XMarkIcon, HandThumbUpIcon, HandThumbDownIcon, FaceFrownIcon } from "@heroicons/vue/24/outline";

const companyName = import.meta.env.VITE_APP_COMPANY_NAME
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE

const searchQuery = ref('')
const searchResults = ref([])
const selectedArticle = ref(null)

// Help Categories Data — content stays as structured data
const helpCategories = reactive([
    {
        id: 1, title: 'Getting started', description: 'Learn the basics of using our platform',
        iconBg: 'bg-green-100', iconColor: 'text-green-600',
        articles: [
            { id: 101, title: 'Creating your account' },
            { id: 102, title: 'Setting up your profile' },
            { id: 103, title: 'Booking your first consultation' },
            { id: 104, title: 'Understanding platform features' }
        ]
    },
    {
        id: 2, title: 'Consultations', description: 'Everything about booking and managing consultations',
        iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
        articles: [
            { id: 201, title: 'How to book a consultation' },
            { id: 202, title: 'Rescheduling and cancellations' },
            { id: 203, title: 'Preparing for your session' },
            { id: 204, title: 'Technical requirements' }
        ]
    },
    {
        id: 3, title: 'Account & billing', description: 'Manage your account settings and billing information',
        iconBg: 'bg-purple-100', iconColor: 'text-purple-600',
        articles: [
            { id: 301, title: 'Updating payment methods' },
            { id: 302, title: 'Understanding your bill' },
            { id: 303, title: 'Refund policy' },
            { id: 304, title: 'Account security' }
        ]
    },
    {
        id: 4, title: 'Technical support', description: 'Troubleshooting and technical assistance',
        iconBg: 'bg-red-100', iconColor: 'text-red-600',
        articles: [
            { id: 401, title: 'Video call issues' },
            { id: 402, title: 'Audio problems' },
            { id: 403, title: 'Browser compatibility' },
            { id: 404, title: 'Mobile app support' }
        ]
    },
    {
        id: 5, title: 'Provider Resources', description: 'Information for service providers',
        iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600',
        articles: [
            { id: 501, title: 'Provider onboarding' },
            { id: 502, title: 'Setting your availability' },
            { id: 503, title: 'Payment processing' },
            { id: 504, title: 'Professional standards' }
        ]
    },
    {
        id: 6, title: 'Privacy & security', description: 'Data protection and privacy information',
        iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600',
        articles: [
            { id: 601, title: 'Data security measures' },
            { id: 602, title: 'Privacy settings' },
            { id: 603, title: 'Reporting security issues' }
        ]
    }
])

const popularArticles = reactive([
    {
        id: 1001, title: 'How to Book your first consultation',
        excerpt: 'Step-by-step guide to scheduling your first consultation session.',
        readTime: 3, lastUpdated: 'January 15, 2025',
        content: `<h3>Getting started with consultations</h3><p>Booking your first consultation is easy! Follow these simple steps:</p><ol><li>Log in to your account</li><li>Browse available providers</li><li>Select a provider that matches your needs</li><li>Choose an available time slot</li><li>Complete the booking process</li></ol>`
    },
    {
        id: 1002, title: 'Troubleshooting video call issues',
        excerpt: 'Common solutions for video and audio problems during consultations.',
        readTime: 5, lastUpdated: 'January 12, 2025',
        content: `<h3>Common video issues</h3><p>If you're experiencing video problems, try these solutions:</p><ol><li>Check your camera permissions</li><li>Ensure good lighting</li><li>Close other applications using your camera</li><li>Restart your browser</li></ol>`
    },
    {
        id: 1004, title: 'Payment and billing guide',
        excerpt: 'Everything you need to know about payments, refunds, and billing.',
        readTime: 6, lastUpdated: 'January 8, 2025',
        content: `<h3>Payment methods</h3><p>We accept:</p><ul><li>Credit and debit cards</li><li>PayPal</li><li>Bank transfers</li><li>Secure billing</li></ul><h3>Refund policy</h3><p>Refunds are available for cancellations made 24+ hours in advance.</p>`
    }
])

const getIconComponent = (categoryId) => {
    const iconMap = { 1: BookOpenIcon, 2: EyeIcon, 3: CreditCardIcon, 4: CogIcon, 5: UsersIcon, 6: ShieldCheckIcon }
    return iconMap[categoryId] || BookOpenIcon
}

const performSearch = () => {
    if (!searchQuery.value.trim()) { searchResults.value = []; return }
    const allArticles = [
        ...popularArticles,
        ...helpCategories.flatMap(cat => cat.articles.map(article => ({
            ...article, category: cat.title, content: `This is the content for ${article.title}`,
            excerpt: `Learn more about ${article.title.toLowerCase()}`
        })))
    ]
    searchResults.value = allArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.value.toLowerCase()))
    )
}

const openArticle = (article) => {
    selectedArticle.value = {
        ...article,
        content: article.content || `<p>This is the full content for "${article.title}".</p>`,
        lastUpdated: article.lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
}

const closeArticle = () => { selectedArticle.value = null }
const rateArticle = (rating) => { /* backend integration */ }
const startLiveChat = () => { /* live chat integration */ }

import { useHead } from '@unhead/vue'
useHead({
    title: `Help center | ${companyName}`,
    meta: [{ name: 'description', content: 'Find answers to your questions in our comprehensive help center.' }]
})
</script>