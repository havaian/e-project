<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <!-- Header -->
        <div class="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="text-center">
                    <h1 class="text-4xl font-bold mb-4">Help Center</h1>
                    <p class="text-xl text-sky-100 mb-8">Find answers to your questions and get the support you need</p>

                    <!-- Search Bar -->
                    <div class="max-w-2xl mx-auto">
                        <div class="relative">
                            <input v-model="searchQuery" type="text" placeholder="Search for help articles..."
                                class="w-full px-6 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                                @input="performSearch" />
                            <svg class="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Quick Actions -->
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Actions</h2>
                <div class="grid md:grid-cols-4 gap-6">
                    <router-link to="/contact"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">Contact Support</h3>
                        <p class="text-gray-600 text-sm">Get personalized help from our team</p>
                    </router-link>

                    <a href="#" @click.prevent="startLiveChat"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-2M7 12h2m6-8h-2" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">Live Chat</h3>
                        <p class="text-gray-600 text-sm">Chat with us in real-time</p>
                    </a>

                    <a :href="`tel:${supportPhone}`"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">Call Us</h3>
                        <p class="text-gray-600 text-sm">{{ supportPhone }}</p>
                    </a>

                    <router-link to="/faq"
                        class="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-200">
                        <div class="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">FAQ</h3>
                        <p class="text-gray-600 text-sm">Find quick answers to common questions</p>
                    </router-link>
                </div>
            </div>

            <!-- Help Categories -->
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Browse Help Topics</h2>
                <div class="grid md:grid-cols-3 gap-8">
                    <div v-for="category in helpCategories" :key="category.id"
                        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
                        <div class="flex items-start space-x-4">
                            <div :class="category.iconBg"
                                class="rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6" :class="category.iconColor" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        :d="category.iconPath" />
                                </svg>
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

            <!-- Search Results -->
            <div v-if="searchQuery && searchResults.length > 0" class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8">Search Results</h2>
                <div class="space-y-4">
                    <div v-for="result in searchResults" :key="result.id"
                        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ result.title }}</h3>
                        <p class="text-gray-600 mb-3">{{ result.excerpt }}</p>
                        <button @click="openArticle(result)"
                            class="text-sky-600 hover:text-sky-700 font-medium text-sm">
                            Read More →
                        </button>
                    </div>
                </div>
            </div>

            <!-- No Results -->
            <div v-if="searchQuery && searchResults.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12H2.25A7.962 7.962 0 016 18.25h12A7.962 7.962 0 0118 12z" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p class="text-gray-600 mb-4">We couldn't find any articles matching "{{ searchQuery }}"</p>
                <router-link to="/contact" class="btn-primary">Contact Support</router-link>
            </div>

            <!-- Popular Articles -->
            <div class="mb-16">
                <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Articles</h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div v-for="article in popularArticles" :key="article.id"
                        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                        <div class="flex items-start space-x-4">
                            <div class="bg-sky-100 rounded-lg w-10 h-10 flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 15a7.962 7.962 0 01-5 2.836V19.5a2.5 2.5 0 01-5 0v-1.664A7.962 7.962 0 013 15a7.962 7.962 0 015-7.364V6a3 3 0 016 0v1.636A7.962 7.962 0 0121 15a7.962 7.962 0 01-3 6.164V19.5a2.5 2.5 0 01-5 0V17.836z" />
                                </svg>
                            </div>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ article.title }}</h3>
                                <p class="text-gray-600 text-sm mb-3">{{ article.excerpt }}</p>
                                <div class="flex items-center justify-between">
                                    <button @click="openArticle(article)"
                                        class="text-sky-600 hover:text-sky-700 font-medium text-sm">
                                        Read Article →
                                    </button>
                                    <span class="text-xs text-gray-500">{{ article.readTime }} min read</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contact Options -->
            <div class="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-8 text-center">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
                <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Can't find what you're looking for? Our support team is here to help you 24/7.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <router-link to="/contact" class="btn-primary px-6 py-3">
                        Contact Support
                    </router-link>
                    <a :href="`mailto:${supportEmail}`" class="btn-secondary px-6 py-3">
                        Email Us
                    </a>
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
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div class="prose max-w-none" v-html="selectedArticle.content"></div>

                    <!-- Article Footer -->
                    <div class="mt-8 pt-6 border-t border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-500">
                                Last updated: {{ selectedArticle.lastUpdated }}
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="text-sm text-gray-500">Was this helpful?</span>
                                <button @click="rateArticle('helpful')" class="text-green-600 hover:text-green-700">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                    </svg>
                                </button>
                                <button @click="rateArticle('not-helpful')" class="text-red-600 hover:text-red-700">
                                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.641a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                    </svg>
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

// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE

// State
const searchQuery = ref('')
const searchResults = ref([])
const selectedArticle = ref(null)

// Help Categories Data
const helpCategories = reactive([
    {
        id: 1,
        title: 'Getting Started',
        description: 'Learn the basics of using our platform',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253',
        articles: [
            { id: 101, title: 'Creating Your Account' },
            { id: 102, title: 'Setting Up Your Profile' },
            { id: 103, title: 'Booking Your First Consultation' },
            { id: 104, title: 'Understanding Platform Features' }
        ]
    },
    {
        id: 2,
        title: 'Consultations',
        description: 'Everything about booking and managing consultations',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
        articles: [
            { id: 201, title: 'How to Book a Consultation' },
            { id: 202, title: 'Rescheduling and Cancellations' },
            { id: 203, title: 'Preparing for Your Session' },
            { id: 204, title: 'Technical Requirements' }
        ]
    },
    {
        id: 3,
        title: 'Account & Billing',
        description: 'Manage your account settings and billing information',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        articles: [
            { id: 301, title: 'Updating Payment Methods' },
            { id: 302, title: 'Understanding Your Bill' },
            { id: 303, title: 'Refund Policy' },
            { id: 304, title: 'Account Security' }
        ]
    },
    {
        id: 4,
        title: 'Technical Support',
        description: 'Troubleshooting and technical assistance',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
        articles: [
            { id: 401, title: 'Video Call Issues' },
            { id: 402, title: 'Audio Problems' },
            { id: 403, title: 'Browser Compatibility' },
            { id: 404, title: 'Mobile App Support' }
        ]
    },
    {
        id: 5,
        title: 'Provider Resources',
        description: 'Information for service providers',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        articles: [
            { id: 501, title: 'Provider Onboarding' },
            { id: 502, title: 'Setting Your Availability' },
            { id: 503, title: 'Payment Processing' },
            { id: 504, title: 'Professional Standards' }
        ]
    },
    {
        id: 6,
        title: 'Privacy & Security',
        description: 'Data protection and privacy information',
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-600',
        iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        articles: [
            { id: 601, title: 'Data Security Measures' },
            { id: 602, title: 'Privacy Settings' },
            { id: 603, title: 'Reporting Security Issues' }
        ]
    }
])

// Popular Articles Data
const popularArticles = reactive([
    {
        id: 1001,
        title: 'How to Book Your First Consultation',
        excerpt: 'Step-by-step guide to scheduling your first consultation session.',
        readTime: 3,
        lastUpdated: 'January 15, 2025',
        content: `
      <h3>Getting Started with Consultations</h3>
      <p>Booking your first consultation is easy! Follow these simple steps:</p>
      <ol>
        <li>Log in to your account</li>
        <li>Browse available providers</li>
        <li>Select a provider that matches your needs</li>
        <li>Choose an available time slot</li>
        <li>Complete the booking process</li>
      </ol>
      <h3>Before Your Session</h3>
      <p>Make sure you have:</p>
      <ul>
        <li>A stable internet connection</li>
        <li>A quiet environment</li>
        <li>Any relevant materials or questions prepared</li>
      </ul>
    `
    },
    {
        id: 1002,
        title: 'Troubleshooting Video Call Issues',
        excerpt: 'Common solutions for video and audio problems during consultations.',
        readTime: 5,
        lastUpdated: 'January 12, 2025',
        content: `
      <h3>Common Video Issues</h3>
      <p>If you're experiencing video problems, try these solutions:</p>
      <ol>
        <li>Check your camera permissions</li>
        <li>Ensure good lighting</li>
        <li>Close other applications using your camera</li>
        <li>Restart your browser</li>
      </ol>
      <h3>Audio Troubleshooting</h3>
      <p>For audio issues:</p>
      <ul>
        <li>Check microphone permissions</li>
        <li>Test your microphone settings</li>
        <li>Use headphones to reduce echo</li>
      </ul>
    `
    },
    {
        id: 1004,
        title: 'Payment and Billing Guide',
        excerpt: 'Everything you need to know about payments, refunds, and billing.',
        readTime: 6,
        lastUpdated: 'January 8, 2025',
        content: `
      <h3>Payment Methods</h3>
      <p>We accept:</p>
      <ul>
        <li>Credit and debit cards</li>
        <li>PayPal</li>
        <li>Bank transfers</li>
        <li>Educational institution billing</li>
      </ul>
      <h3>Refund Policy</h3>
      <p>Refunds are available for cancellations made 24+ hours in advance.</p>
    `
    }
])

// Methods
const performSearch = () => {
    if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
    }

    // Simple search simulation
    const allArticles = [
        ...popularArticles,
        ...helpCategories.flatMap(cat => cat.articles.map(article => ({
            ...article,
            category: cat.title,
            content: `This is the content for ${article.title}`,
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
        content: article.content || `<p>This is the full content for "${article.title}". More detailed information would be provided here.</p>`,
        lastUpdated: article.lastUpdated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
}

const closeArticle = () => {
    selectedArticle.value = null
}

const rateArticle = (rating) => {
    console.log(`Article rated as: ${rating}`)
    // Here you would send the rating to your backend
}

const startLiveChat = () => {
    console.log('Starting live chat...')
    // Here you would integrate with your live chat system
}

// Meta tags
import { useHead } from '@unhead/vue'
useHead({
    title: `Help Center | ${companyName}`,
    meta: [
        { name: 'description', content: 'Find answers to your questions in our comprehensive help center.' }
    ]
})
</script>