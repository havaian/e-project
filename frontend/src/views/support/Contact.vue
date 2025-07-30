<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
                <p class="text-lg text-gray-600">We're here to help. Reach out to us anytime.</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Contact Information -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

                        <!-- Support Hours -->
                        <div class="mb-8">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-gray-900">24/7 Support</h3>
                                    <p class="text-sm text-gray-600">Available around the clock</p>
                                </div>
                            </div>
                        </div>

                        <!-- Contact Methods -->
                        <div class="space-y-6">
                            <!-- Phone -->
                            <div class="flex items-start space-x-4">
                                <div
                                    class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-sky-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Phone Support</h4>
                                    <a :href="`tel:${supportPhone}`"
                                        class="text-sky-600 hover:text-sky-700 transition-colors">
                                        {{ supportPhone }}
                                    </a>
                                    <p class="text-sm text-gray-600 mt-1">Call us anytime for immediate assistance</p>
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="flex items-start space-x-4">
                                <div
                                    class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Email Support</h4>
                                    <a :href="`mailto:${supportEmail}`"
                                        class="text-purple-600 hover:text-purple-700 transition-colors">
                                        {{ supportEmail }}
                                    </a>
                                    <p class="text-sm text-gray-600 mt-1">We'll respond within 24 hours</p>
                                </div>
                            </div>

                            <!-- Live Chat -->
                            <div class="flex items-start space-x-4">
                                <div
                                    class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Live Chat</h4>
                                    <button @click="openLiveChat"
                                        class="text-emerald-600 hover:text-emerald-700 transition-colors">
                                        Start a conversation
                                    </button>
                                    <p class="text-sm text-gray-600 mt-1">Get instant help from our team</p>
                                </div>
                            </div>
                        </div>

                        <!-- Department Extensions -->
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            <h3 class="font-semibold text-gray-900 mb-4">Department Extensions</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">General Support</span>
                                    <span class="text-gray-900">ext. 101</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Technical Support</span>
                                    <span class="text-gray-900">ext. 102</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Billing & Payments</span>
                                    <span class="text-gray-900">ext. 103</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Provider Support</span>
                                    <span class="text-gray-900">ext. 104</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                        <form @submit.prevent="submitForm" class="space-y-6">
                            <!-- Name and Email Row -->
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input id="name" v-model="form.name" type="text" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                        placeholder="Your full name" />
                                </div>
                                <div>
                                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input id="email" v-model="form.email" type="email" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                        placeholder="your.email@example.com" />
                                </div>
                            </div>

                            <!-- Subject and Category Row -->
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">
                                        Subject *
                                    </label>
                                    <input id="subject" v-model="form.subject" type="text" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                        placeholder="Brief description of your inquiry" />
                                </div>
                                <div>
                                    <label for="category" class="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select id="category" v-model="form.category"
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors">
                                        <option value="">Select a category</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="billing">Billing & Payments</option>
                                        <option value="provider">Provider Support</option>
                                        <option value="accessibility">Accessibility</option>
                                        <option value="privacy">Privacy & Security</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="bug">Bug Report</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Phone (Optional) -->
                            <div>
                                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (Optional)
                                </label>
                                <input id="phone" v-model="form.phone" type="tel"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                    placeholder="+1 (555) 123-4567" />
                            </div>

                            <!-- Message -->
                            <div>
                                <label for="message" class="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <textarea id="message" v-model="form.message" rows="6" required
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors resize-none"
                                    placeholder="Please describe your inquiry in detail..."></textarea>
                            </div>

                            <!-- Priority Level -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    Priority Level
                                </label>
                                <div class="flex space-x-4">
                                    <label class="flex items-center">
                                        <input v-model="form.priority" type="radio" value="low"
                                            class="text-sky-600 focus:ring-sky-500" />
                                        <span class="ml-2 text-sm text-gray-700">Low</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input v-model="form.priority" type="radio" value="medium"
                                            class="text-sky-600 focus:ring-sky-500" />
                                        <span class="ml-2 text-sm text-gray-700">Medium</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input v-model="form.priority" type="radio" value="high"
                                            class="text-sky-600 focus:ring-sky-500" />
                                        <span class="ml-2 text-sm text-gray-700">High</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input v-model="form.priority" type="radio" value="urgent"
                                            class="text-sky-600 focus:ring-sky-500" />
                                        <span class="ml-2 text-sm text-gray-700">Urgent</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Submit Button -->
                            <div class="flex justify-end">
                                <button type="submit" :disabled="isSubmitting"
                                    class="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <svg v-if="isSubmitting" class="animate-spin w-4 h-4 mr-2" fill="none"
                                        viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                                </button>
                            </div>
                        </form>

                        <!-- Success Message -->
                        <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clip-rule="evenodd" />
                                </svg>
                                <p class="text-green-800">Thank you! Your message has been sent successfully. We'll get
                                    back to you soon.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- FAQ Section -->
            <div class="mt-16">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <p class="text-gray-600">Quick answers to common questions</p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="font-semibold text-gray-900 mb-2">How quickly will I receive a response?</h3>
                        <p class="text-gray-600 text-sm">We aim to respond to all inquiries within 24 hours. Urgent
                            matters are typically addressed within 2-4 hours.</p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="font-semibold text-gray-900 mb-2">Can I schedule a consultation directly?</h3>
                        <p class="text-gray-600 text-sm">Yes! You can book consultations directly through our platform
                            or contact us for assistance with scheduling.</p>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="font-semibold text-gray-900 mb-2">Is there a cost for support?</h3>
                        <p class="text-gray-600 text-sm">All customer support is free. We're here to help you get the
                            most out of our platform.</p>
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

// Form state
const form = reactive({
    name: '',
    email: '',
    subject: '',
    category: '',
    phone: '',
    message: '',
    priority: 'medium'
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

// Methods
const submitForm = async () => {
    isSubmitting.value = true

    try {
        // Here you would integrate with your backend API
        // For now, we'll simulate a successful submission
        await new Promise(resolve => setTimeout(resolve, 2000))

        showSuccess.value = true

        // Reset form
        Object.assign(form, {
            name: '',
            email: '',
            subject: '',
            category: '',
            phone: '',
            message: '',
            priority: 'medium'
        })

        // Hide success message after 5 seconds
        setTimeout(() => {
            showSuccess.value = false
        }, 5000)

    } catch (error) {
        console.error('Error submitting form:', error)
        // Here you would handle the error appropriately
    } finally {
        isSubmitting.value = false
    }
}

const openLiveChat = () => {
    // Here you would integrate with your live chat system
    // For example, opening a chat widget
    console.log('Opening live chat...')
}

// Meta tags
import { useHead } from '@unhead/vue'
useHead({
    title: `Contact Us | ${companyName}`,
    meta: [
        { name: 'description', content: `Contact ${companyName} support team. We provide 24/7 assistance for all your consultation needs.` }
    ]
})
</script>