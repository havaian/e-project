<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Contact us</h1>
                <p class="text-lg text-gray-600">We're here to help. Reach out to us anytime.</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Contact Information -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Get in touch</h2>

                        <!-- Support Hours -->
                        <div class="mb-8">
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <ClockIcon class="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 class="font-semibold text-gray-900">24/7 support</h3>
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
                                    <PhoneIcon class="w-5 h-5 text-sky-600" />
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Phone support</h4>
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
                                    <EnvelopeIcon class="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Email support</h4>
                                    <a :href="`mailto:${supportEmail}`"
                                        class="text-purple-600 hover:text-purple-700 transition-colors">
                                        {{ supportEmail }}
                                    </a>
                                    <p class="text-sm text-gray-600 mt-1">We'll respond within 24 hours</p>
                                </div>
                            </div>

                            <!-- Live chat -->
                            <div class="flex items-start space-x-4">
                                <div
                                    class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <ChatBubbleLeftRightIcon class="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Live chat</h4>
                                    <button @click="openLiveChat"
                                        class="text-emerald-600 hover:text-emerald-700 transition-colors">
                                        Start a conversation
                                    </button>
                                    <p class="text-sm text-gray-600 mt-1">Get instant help from our team</p>
                                </div>
                            </div>
                        </div>

                        <!-- Department extensions -->
                        <div class="mt-8 pt-8 border-t border-gray-200">
                            <h3 class="font-semibold text-gray-900 mb-4">Department extensions</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">General support</span>
                                    <span class="text-gray-900">ext. 101</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Technical support</span>
                                    <span class="text-gray-900">ext. 102</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Billing & payments</span>
                                    <span class="text-gray-900">ext. 103</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Provider support</span>
                                    <span class="text-gray-900">ext. 104</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="lg:col-span-2">
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

                        <form @submit.prevent="submitForm" class="space-y-6">
                            <!-- name and Email Row -->
                            <div class="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                                        Full name *
                                    </label>
                                    <input id="name" v-model="form.name" type="text" required
                                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                                        placeholder="Your full name" />
                                </div>
                                <div>
                                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                                        Email address *
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
                                        <option value="general">General inquiry</option>
                                        <option value="technical">Technical support</option>
                                        <option value="billing">Billing & payments</option>
                                        <option value="provider">Provider support</option>
                                        <option value="accessibility">Accessibility</option>
                                        <option value="privacy">Privacy & security</option>
                                        <option value="feature">Feature request</option>
                                        <option value="bug">Bug report</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Phone (Optional) -->
                            <div>
                                <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
                                    Phone number (Optional)
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
                                    class="input resize-none"
                                    placeholder="Please describe your inquiry in detail..."></textarea>
                            </div>

                            <!-- Priority level -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-3">
                                    Priority level
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
                                    {{ isSubmitting ? 'Sending...' : 'Send message' }}
                                </button>
                            </div>
                        </form>

                        <!-- Success Message -->
                        <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div class="flex items-center">
                                <CheckCircleIcon class="w-5 h-5 text-green-600 mr-2" />
                                <p class="text-green-800">Thank you! Your message has been sent successfully. We'll get
                                    back to you soon.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- FAQ section -->
            <div class="mt-16">
                <div class="text-center mb-8">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
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
import { ClockIcon, PhoneIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";
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
}

// Meta tags
import { useHead } from '@unhead/vue'
useHead({
    title: `Contact us | ${companyName}`,
    meta: [
        { name: 'description', content: `Contact ${companyName} support team. We provide 24/7 assistance for all your consultation needs.` }
    ]
})
</script>