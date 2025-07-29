<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <!-- Header -->
        <div class="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div class="text-center">
                    <h1 class="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p class="text-xl text-sky-100">Quick answers to the most common questions</p>
                </div>
            </div>
        </div>

        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Search -->
            <div class="mb-12">
                <div class="relative">
                    <input v-model="searchQuery" type="text" placeholder="Search FAQs..."
                        class="w-full px-6 py-4 text-gray-900 bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500" />
                    <svg class="absolute right-4 top-4 w-6 h-6 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <!-- Categories -->
            <div class="mb-12">
                <div class="flex flex-wrap gap-3 justify-center">
                    <button v-for="category in categories" :key="category" @click="activeCategory = category" :class="[
                        'px-6 py-3 rounded-full font-medium transition-colors duration-200',
                        activeCategory === category
                            ? 'bg-sky-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-sky-50 shadow-md'
                    ]">
                        {{ category }}
                    </button>
                </div>
            </div>

            <!-- FAQ Items -->
            <div class="space-y-4">
                <div v-for="faq in filteredFAQs" :key="faq.id" class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <button @click="toggleFAQ(faq.id)"
                        class="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-sky-500 hover:bg-gray-50 transition-colors duration-200">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900 pr-4">{{ faq.question }}</h3>
                            <svg :class="[
                                'w-5 h-5 text-gray-500 transition-transform duration-200',
                                openFAQs.includes(faq.id) ? 'rotate-180' : ''
                            ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>

                    <div v-if="openFAQs.includes(faq.id)" class="px-6 pb-4 text-gray-700 leading-relaxed"
                        v-html="faq.answer"></div>
                </div>
            </div>

            <!-- No Results -->
            <div v-if="filteredFAQs.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No FAQs found</h3>
                <p class="text-gray-600 mb-4">
                    We couldn't find any FAQs matching your search or category.
                </p>
                <router-link to="/contact" class="btn-primary">
                    Contact Support
                </router-link>
            </div>

            <!-- Contact Section -->
            <div class="mt-16 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-2xl p-8 text-center">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
                <p class="text-gray-600 mb-6">
                    Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <router-link to="/contact" class="btn-primary px-6 py-3">
                        Contact Support
                    </router-link>
                    <router-link to="/help" class="btn-secondary px-6 py-3">
                        Visit Help Center
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const companyName = import.meta.env.VITE_APP_COMPANY_NAME

// State
const searchQuery = ref('')
const activeCategory = ref('All')
const openFAQs = ref([])

// Categories
const categories = ['All', 'Getting Started', 'Consultations', 'Billing', 'Technical', 'Privacy', 'Providers']

// FAQ Data
const faqs = reactive([
    // Getting Started
    {
        id: 1,
        category: 'Getting Started',
        question: 'How do I create an account?',
        answer: `
      <p>Creating an account is simple:</p>
      <ol class="list-decimal ml-6 mt-2 space-y-1">
        <li>Click the "Get Started" or "Sign Up" button on our homepage</li>
        <li>Choose whether you're a student or a service provider</li>
        <li>Fill in your basic information (name, email, password)</li>
        <li>Verify your email address by clicking the link we send you</li>
        <li>Complete your profile with additional details</li>
      </ol>
      <p class="mt-3">Once your account is created, you can immediately start browsing providers and booking consultations.</p>
    `
    },
    {
        id: 2,
        category: 'Getting Started',
        question: 'Do I need any special software to use the platform?',
        answer: `
      <p>No special software is required! Our platform works entirely in your web browser. However, we recommend:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li>Using Chrome, Firefox, Safari, or Edge (latest versions)</li>
        <li>Having a stable internet connection</li>
        <li>Ensuring your browser allows camera and microphone access</li>
        <li>Using headphones for better audio quality during consultations</li>
      </ul>
    `
    },
    {
        id: 3,
        category: 'Getting Started',
        question: 'Is my data secure and private?',
        answer: `
      <p>Absolutely! We take your privacy and security very seriously:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>FERPA Compliant:</strong> We meet all educational privacy requirements</li>
        <li><strong>Encrypted Data:</strong> All data is encrypted in transit and at rest</li>
        <li><strong>Secure Storage:</strong> Your information is stored on secure, monitored servers</li>
        <li><strong>Limited Access:</strong> Only authorized personnel can access your data</li>
        <li><strong>Regular Audits:</strong> We conduct regular security assessments</li>
      </ul>
      <p class="mt-3">For more details, please review our <a href="/privacy" class="text-sky-600 hover:text-sky-700 underline">Privacy Policy</a> and <a href="/ferpa" class="text-sky-600 hover:text-sky-700 underline">FERPA Compliance</a> pages.</p>
    `
    },

    // Consultations
    {
        id: 4,
        category: 'Consultations',
        question: 'How do I book a consultation?',
        answer: `
      <p>Booking a consultation is easy:</p>
      <ol class="list-decimal ml-6 mt-2 space-y-1">
        <li>Browse our list of verified providers</li>
        <li>Filter by specialty, availability, or location</li>
        <li>Click on a provider to view their profile and available times</li>
        <li>Select a time slot that works for you</li>
        <li>Provide any necessary details about your consultation needs</li>
        <li>Complete the payment process</li>
        <li>Receive confirmation and calendar invite</li>
      </ol>
    `
    },
    {
        id: 5,
        category: 'Consultations',
        question: 'Can I reschedule or cancel my consultation?',
        answer: `
      <p>Yes, you can reschedule or cancel consultations:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>24+ hours in advance:</strong> Full refund available</li>
        <li><strong>12-24 hours in advance:</strong> 50% refund</li>
        <li><strong>Less than 12 hours:</strong> No refund, but may be able to reschedule depending on provider availability</li>
      </ul>
      <p class="mt-3">To reschedule or cancel, go to "My Appointments" in your dashboard and select the consultation you want to modify.</p>
    `
    },
    {
        id: 6,
        category: 'Consultations',
        question: 'What happens during a consultation?',
        answer: `
      <p>During your consultation:</p>
      <ol class="list-decimal ml-6 mt-2 space-y-1">
        <li>Join the video call at your scheduled time</li>
        <li>The provider will introduce themselves and review your needs</li>
        <li>You'll discuss your specific questions or challenges</li>
        <li>The provider will offer guidance, recommendations, or solutions</li>
        <li>You can ask follow-up questions</li>
        <li>The provider may share resources or assign action items</li>
        <li>You'll receive a summary of the session afterward</li>
      </ol>
    `
    },
    {
        id: 7,
        category: 'Consultations',
        question: 'How long are consultation sessions?',
        answer: `
      <p>Consultation lengths vary by provider and service type:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>Standard sessions:</strong> 30 or 60 minutes</li>
        <li><strong>Quick consultations:</strong> 15 minutes for brief questions</li>
        <li><strong>Extended sessions:</strong> 90 minutes for complex topics</li>
        <li><strong>Follow-up sessions:</strong> Usually 30 minutes</li>
      </ul>
      <p class="mt-3">The session length is clearly displayed when booking, and you can discuss extending the session with your provider if needed.</p>
    `
    },

    // Billing
    {
        id: 8,
        category: 'Billing',
        question: 'What payment methods do you accept?',
        answer: `
      <p>We accept several payment methods for your convenience:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li>Credit cards (Visa, MasterCard, American Express, Discover)</li>
        <li>Debit cards</li>
        <li>PayPal</li>
        <li>Bank transfers (for institutional accounts)</li>
        <li>Educational institution billing (where available)</li>
      </ul>
      <p class="mt-3">All payments are processed securely and your payment information is encrypted.</p>
    `
    },
    {
        id: 9,
        category: 'Billing',
        question: 'When am I charged for a consultation?',
        answer: `
      <p>Payment timing depends on the consultation type:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>Individual sessions:</strong> Charged immediately upon booking</li>
        <li><strong>Subscription plans:</strong> Charged monthly on your billing date</li>
        <li><strong>Institutional accounts:</strong> Billed according to contract terms</li>
      </ul>
      <p class="mt-3">You'll always receive a confirmation email with payment details after each transaction.</p>
    `
    },
    {
        id: 10,
        category: 'Billing',
        question: 'Can I get a refund?',
        answer: `
      <p>Yes, refunds are available based on our cancellation policy:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>24+ hours before:</strong> Full refund</li>
        <li><strong>12-24 hours before:</strong> 50% refund</li>
        <li><strong>Less than 12 hours:</strong> No refund</li>
        <li><strong>Technical issues on our end:</strong> Full refund or free rescheduling</li>
        <li><strong>Provider cancellation:</strong> Full refund or priority rebooking</li>
      </ul>
      <p class="mt-3">Refunds are processed within 5-7 business days to your original payment method.</p>
    `
    },

    // Technical
    {
        id: 11,
        category: 'Technical',
        question: 'What are the technical requirements for video consultations?',
        answer: `
      <p>To ensure the best experience, you'll need:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>Internet:</strong> Broadband connection (minimum 1 Mbps upload/download)</li>
        <li><strong>Browser:</strong> Chrome 70+, Firefox 65+, Safari 12+, or Edge 79+</li>
        <li><strong>Device:</strong> Computer, tablet, or smartphone with camera and microphone</li>
        <li><strong>Permissions:</strong> Allow camera and microphone access when prompted</li>
        <li><strong>Environment:</strong> Quiet space with good lighting</li>
      </ul>
      <p class="mt-3">We recommend testing your setup using our connection test tool before your first consultation.</p>
    `
    },
    {
        id: 12,
        category: 'Technical',
        question: 'What if I experience technical difficulties during a consultation?',
        answer: `
      <p>If you encounter technical issues:</p>
      <ol class="list-decimal ml-6 mt-2 space-y-1">
        <li>Try refreshing your browser first</li>
        <li>Check your internet connection</li>
        <li>Ensure camera/microphone permissions are enabled</li>
        <li>Try joining from a different browser or device</li>
        <li>Contact our technical support team immediately</li>
      </ol>
      <p class="mt-3">Our support team is available 24/7 at <strong>${import.meta.env.VITE_SUPPORT_PHONE}</strong> or through our live chat feature.</p>
    `
    },
    {
        id: 13,
        category: 'Technical',
        question: 'Can I use the platform on my mobile device?',
        answer: `
      <p>Yes! Our platform is fully optimized for mobile devices:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>Mobile browsers:</strong> Works in Safari (iOS) and Chrome (Android)</li>
        <li><strong>Responsive design:</strong> Automatically adapts to your screen size</li>
        <li><strong>Touch-friendly:</strong> Easy navigation with touch controls</li>
        <li><strong>Full features:</strong> All functionality available on mobile</li>
      </ul>
      <p class="mt-3">We also offer native mobile apps for iOS and Android for an even better experience.</p>
    `
    },

    // Privacy
    {
        id: 14,
        category: 'Privacy',
        question: 'How do you protect my educational records?',
        answer: `
      <p>We take educational record protection very seriously:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>FERPA Compliance:</strong> We meet all federal educational privacy requirements</li>
        <li><strong>Encryption:</strong> All data is encrypted both in transit and at rest</li>
        <li><strong>Access Controls:</strong> Only authorized personnel can access your records</li>
        <li><strong>Audit Trails:</strong> We maintain detailed logs of all data access</li>
        <li><strong>Data Minimization:</strong> We only collect data necessary for our services</li>
      </ul>
      <p class="mt-3">For complete details, see our <a href="/ferpa" class="text-sky-600 hover:text-sky-700 underline">FERPA Compliance page</a>.</p>
    `
    },
    {
        id: 15,
        category: 'Privacy',
        question: 'Who can see my consultation records?',
        answer: `
      <p>Access to your consultation records is strictly limited:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>You:</strong> Full access to your own records</li>
        <li><strong>Your provider:</strong> Can see only the sessions they conducted with you</li>
        <li><strong>Authorized school officials:</strong> Only with proper consent and legitimate educational interest</li>
        <li><strong>Our staff:</strong> Limited access only for technical support or compliance purposes</li>
      </ul>
      <p class="mt-3">We never share your information with third parties without your explicit consent or legal requirement.</p>
    `
    },

    // Providers
    {
        id: 16,
        category: 'Providers',
        question: 'How do you verify service providers?',
        answer: `
      <p>All providers go through a rigorous verification process:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>Credential verification:</strong> We check all professional licenses and certifications</li>
        <li><strong>Background checks:</strong> Comprehensive background screening</li>
        <li><strong>Reference checks:</strong> We contact professional references</li>
        <li><strong>Interview process:</strong> Video interview with our team</li>
        <li><strong>Ongoing monitoring:</strong> Regular review of provider performance and compliance</li>
      </ul>
      <p class="mt-3">Only providers who meet our strict standards are approved to offer services on our platform.</p>
    `
    },
    {
        id: 17,
        category: 'Providers',
        question: 'How can I become a service provider?',
        answer: `
      <p>To become a provider on our platform:</p>
      <ol class="list-decimal ml-6 mt-2 space-y-1">
        <li>Visit our provider application page</li>
        <li>Complete the detailed application form</li>
        <li>Submit required documentation (licenses, certifications, CV)</li>
        <li>Undergo our verification process</li>
        <li>Complete provider training and orientation</li>
        <li>Set up your profile and availability</li>
        <li>Start accepting consultation requests</li>
      </ol>
      <p class="mt-3">The approval process typically takes 7-14 business days.</p>
    `
    },
    {
        id: 18,
        category: 'Providers',
        question: 'How do I choose the right provider for my needs?',
        answer: `
      <p>Finding the right provider is important for a successful consultation:</p>
      <ul class="list-disc ml-6 mt-2 space-y-1">
        <li><strong>Review specialties:</strong> Look for providers who specialize in your area of need</li>
        <li><strong>Read profiles:</strong> Check their education, experience, and approach</li>
        <li><strong>Check reviews:</strong> See what other students have said about their services</li>
        <li><strong>Consider availability:</strong> Make sure their schedule aligns with yours</li>
        <li><strong>Look at rates:</strong> Choose a provider within your budget</li>
      </ul>
      <p class="mt-3">You can also use our matching tool to get personalized provider recommendations based on your specific needs.</p>
    `
    }
])

// Computed
const filteredFAQs = computed(() => {
    let filtered = faqs

    // Filter by category
    if (activeCategory.value !== 'All') {
        filtered = filtered.filter(faq => faq.category === activeCategory.value)
    }

    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(faq =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        )
    }

    return filtered
})

// Methods
const toggleFAQ = (id) => {
    const index = openFAQs.value.indexOf(id)
    if (index > -1) {
        openFAQs.value.splice(index, 1)
    } else {
        openFAQs.value.push(id)
    }
}

// Meta tags
import { useHead } from 'unhead'
useHead({
    title: `FAQ | ${companyName}`,
    meta: [
        { name: 'description', content: `Frequently asked questions about ${companyName} consultation platform.` }
    ]
})
</script>