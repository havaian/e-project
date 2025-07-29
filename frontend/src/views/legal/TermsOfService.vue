<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                <p class="text-lg text-gray-600">Last updated: {{ lastUpdated }}</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <!-- Content -->
            <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div class="prose prose-lg max-w-none">
                    <p class="text-gray-700 leading-relaxed mb-8">
                        Welcome to {{ companyName }}. These Terms of Service ("Terms") govern your use of our online
                        consultation platform.
                        By using our services, you agree to be bound by these Terms.
                    </p>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                        <p class="text-gray-700 mb-6">
                            By accessing or using our platform, you acknowledge that you have read, understood, and
                            agree to be bound by these Terms.
                            If you do not agree to these Terms, you may not use our services.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
                        <p class="text-gray-700 mb-4">Our platform provides:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Online consultation scheduling and management</li>
                            <li>Video conferencing capabilities for consultations</li>
                            <li>Educational support services</li>
                            <li>Provider verification and matching services</li>
                            <li>Secure communication tools</li>
                            <li>Payment processing services</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Account Creation</h3>
                        <p class="text-gray-700 mb-4">You must create an account to use our services. You agree to:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Notify us immediately of any unauthorized use</li>
                            <li>Accept responsibility for all activities under your account</li>
                        </ul>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Provider Requirements</h3>
                        <p class="text-gray-700 mb-4">Service providers must:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Hold valid professional licenses and certifications</li>
                            <li>Comply with all applicable professional standards</li>
                            <li>Maintain appropriate professional liability insurance</li>
                            <li>Complete our verification process</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
                        <p class="text-gray-700 mb-4">You agree not to:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Use the platform for any illegal or unauthorized purpose</li>
                            <li>Violate any applicable laws or regulations</li>
                            <li>Infringe upon intellectual property rights</li>
                            <li>Transmit harmful, abusive, or offensive content</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Interfere with the platform's operation or security</li>
                            <li>Impersonate another person or entity</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Privacy and Data Protection</h2>
                        <p class="text-gray-700 mb-6">
                            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and
                            protect your information.
                            We are committed to FERPA compliance for all educational records and maintain strict
                            confidentiality standards.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Fees and Billing</h3>
                        <p class="text-gray-700 mb-4">By using our paid services, you agree to:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Pay all applicable fees as outlined in our pricing</li>
                            <li>Provide valid payment information</li>
                            <li>Pay for services in advance unless otherwise specified</li>
                            <li>Accept responsibility for all charges on your account</li>
                        </ul>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Refund Policy</h3>
                        <p class="text-gray-700 mb-6">
                            Refunds are available under specific circumstances as outlined in our separate Refund
                            Policy.
                            Cancellations must be made according to our cancellation policy to be eligible for refunds.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Professional Responsibility</h2>
                        <p class="text-gray-700 mb-6">
                            Our platform facilitates connections between users and service providers. We are not
                            responsible for the quality,
                            accuracy, or outcome of consultations. Providers are independent professionals responsible
                            for their own services
                            and compliance with professional standards.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
                        <p class="text-gray-700 mb-6">
                            All content, features, and functionality of our platform are owned by {{ companyName }} and
                            are protected by
                            international copyright, trademark, and other intellectual property laws. You may not copy,
                            modify, or distribute
                            our content without written permission.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                        <p class="text-gray-700 mb-6">
                            To the maximum extent permitted by law, {{ companyName }} shall not be liable for any
                            indirect, incidental,
                            special, or consequential damages arising from your use of our services. Our total liability
                            shall not exceed
                            the amount paid by you for our services in the preceding 12 months.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                        <p class="text-gray-700 mb-6">
                            We may terminate or suspend your account at any time for violation of these Terms. You may
                            terminate your
                            account by contacting us. Upon termination, your right to use our services ceases
                            immediately.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                        <p class="text-gray-700 mb-6">
                            We reserve the right to modify these Terms at any time. We will notify users of significant
                            changes by posting
                            the updated Terms on our platform. Continued use of our services after changes constitute
                            acceptance of the new Terms.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
                        <p class="text-gray-700 mb-6">
                            These Terms are governed by and construed in accordance with applicable laws. Any disputes
                            arising from these
                            Terms shall be resolved through binding arbitration or in the courts of competent
                            jurisdiction.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                        <p class="text-gray-700 mb-4">
                            If you have questions about these Terms, please contact us:
                        </p>
                        <div class="bg-gray-50 rounded-lg p-6">
                            <p class="text-gray-700 mb-2"><strong>Email:</strong> {{ supportEmail }}</p>
                            <p class="text-gray-700 mb-2"><strong>Phone:</strong> {{ supportPhone }}</p>
                            <p class="text-gray-700"><strong>Legal Department:</strong> Y.TECH Legal</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE

// Computed properties
const lastUpdated = computed(() => {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
})

// Meta tags
import { useHead } from 'unhead'
useHead(unheadInstance, {
    title: `Terms of Service | ${companyName}`,
    meta: [
        { name: 'description', content: `Terms of Service for ${companyName} online consultation platform.` }
    ]
})
</script>