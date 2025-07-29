<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Public Offer Agreement</h1>
                <p class="text-lg text-gray-600">Effective from: {{ effectiveDate }}</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <!-- Content -->
            <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div class="prose prose-lg max-w-none">
                    <p class="text-gray-700 leading-relaxed mb-8">
                        This Public Offer Agreement ("Agreement") constitutes a legally binding contract between {{
                        companyName }}
                        and users of our online consultation platform. By using our services, you accept this offer and
                        agree to
                        the terms outlined below.
                    </p>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Definitions</h2>
                        <div class="bg-gray-50 rounded-lg p-6 mb-6">
                            <dl class="space-y-4">
                                <div>
                                    <dt class="font-semibold text-gray-900">Service Provider:</dt>
                                    <dd class="text-gray-700">{{ companyName }}, providing online consultation platform
                                        services</dd>
                                </div>
                                <div>
                                    <dt class="font-semibold text-gray-900">Client:</dt>
                                    <dd class="text-gray-700">Any individual or entity using our platform services</dd>
                                </div>
                                <div>
                                    <dt class="font-semibold text-gray-900">Platform:</dt>
                                    <dd class="text-gray-700">The E-Project online consultation system and related
                                        services</dd>
                                </div>
                                <div>
                                    <dt class="font-semibold text-gray-900">Consultation Services:</dt>
                                    <dd class="text-gray-700">Professional consultation sessions facilitated through our
                                        platform</dd>
                                </div>
                            </dl>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Services Offered</h2>
                        <p class="text-gray-700 mb-4">Under this Agreement, we provide:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Access to our online consultation platform</li>
                            <li>Matching services between clients and verified professionals</li>
                            <li>Secure video conferencing technology</li>
                            <li>Appointment scheduling and management tools</li>
                            <li>Payment processing services</li>
                            <li>24/7 technical support</li>
                            <li>FERPA-compliant data handling for educational records</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Contract Formation</h2>
                        <p class="text-gray-700 mb-4">A contract is formed when:</p>
                        <ol class="list-decimal ml-6 text-gray-700 mb-6">
                            <li>You create an account on our platform</li>
                            <li>You accept these terms during registration</li>
                            <li>You make your first payment for services</li>
                            <li>We confirm your booking or subscription</li>
                        </ol>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Pricing and Payment Terms</h2>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Service Fees</h3>
                        <div class="bg-blue-50 rounded-lg p-6 mb-6">
                            <p class="text-gray-700 mb-4">Our current pricing structure:</p>
                            <ul class="list-disc ml-6 text-gray-700 mb-4">
                                <li>Individual Consultation: Starting from $50 per session</li>
                                <li>Monthly Subscription: $99 per month (unlimited consultations)</li>
                                <li>Institutional Plans: Custom pricing based on requirements</li>
                                <li>Platform Fee: 10% of consultation fees (for providers)</li>
                            </ul>
                            <p class="text-sm text-gray-600 italic">Prices are subject to change with 30 days notice.
                            </p>
                        </div>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Payment Terms</h3>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Payment is due at the time of booking</li>
                            <li>All prices are in USD unless otherwise specified</li>
                            <li>Late payments may incur additional fees</li>
                            <li>Refunds are processed according to our refund policy</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Service Guarantees</h2>
                        <p class="text-gray-700 mb-4">We guarantee:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>99.9% platform uptime (excluding scheduled maintenance)</li>
                            <li>Secure, encrypted communication channels</li>
                            <li>Verified professional credentials for all providers</li>
                            <li>FERPA compliance for educational data</li>
                            <li>24/7 technical support availability</li>
                            <li>Data backup and recovery procedures</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Client Obligations</h2>
                        <p class="text-gray-700 mb-4">As a client, you agree to:</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Provide accurate and complete information</li>
                            <li>Pay all fees promptly as agreed</li>
                            <li>Use the platform in accordance with our terms</li>
                            <li>Respect the professional standards of service providers</li>
                            <li>Maintain confidentiality of any proprietary information</li>
                            <li>Report any technical issues or concerns promptly</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Cancellation and Refund Policy</h2>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Cancellation Rights</h3>
                        <ul class="list-disc ml-6 text-gray-700 mb-4">
                            <li>Individual sessions: Cancel up to 24 hours before scheduled time</li>
                            <li>Subscriptions: Cancel anytime with 30 days notice</li>
                            <li>Institutional contracts: As specified in separate agreement</li>
                        </ul>

                        <h3 class="text-xl font-semibold text-gray-800 mb-3">Refund Policy</h3>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Full refund for cancellations made 24+ hours in advance</li>
                            <li>50% refund for cancellations made 12-24 hours in advance</li>
                            <li>No refund for cancellations made less than 12 hours in advance</li>
                            <li>Technical issues on our end result in full refund or rescheduling</li>
                            <li>Refunds processed within 5-7 business days</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Force Majeure</h2>
                        <p class="text-gray-700 mb-6">
                            Neither party shall be liable for any failure to perform due to circumstances beyond
                            reasonable control,
                            including but not limited to natural disasters, government actions, internet outages, or
                            other events
                            classified as force majeure.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Dispute Resolution</h2>
                        <p class="text-gray-700 mb-4">In case of disputes:</p>
                        <ol class="list-decimal ml-6 text-gray-700 mb-6">
                            <li>First attempt: Direct negotiation between parties</li>
                            <li>Second attempt: Mediation through agreed mediator</li>
                            <li>Final resort: Binding arbitration or court proceedings</li>
                        </ol>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Modification of Terms</h2>
                        <p class="text-gray-700 mb-6">
                            We reserve the right to modify this Public Offer with 30 days written notice. Continued use
                            of our
                            services after modification constitutes acceptance of new terms. Material changes will
                            require
                            explicit consent.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
                        <div class="bg-gray-50 rounded-lg p-6">
                            <h4 class="font-semibold text-gray-900 mb-4">For contract-related inquiries:</h4>
                            <p class="text-gray-700 mb-2"><strong>Company:</strong> {{ companyName }}</p>
                            <p class="text-gray-700 mb-2"><strong>Email:</strong> {{ supportEmail }}</p>
                            <p class="text-gray-700 mb-2"><strong>Phone:</strong> {{ supportPhone }}</p>
                            <p class="text-gray-700 mb-2"><strong>Legal Department:</strong> legal@ytech.space</p>
                            <p class="text-gray-700"><strong>Business Hours:</strong> Monday-Friday, 9:00 AM - 6:00 PM
                                UTC</p>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Acceptance</h2>
                        <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                            <p class="text-gray-700">
                                By using our platform, you acknowledge that you have read, understood, and agree to be
                                bound by
                                this Public Offer Agreement. This agreement is effective immediately upon your first use
                                of our services.
                            </p>
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
const effectiveDate = computed(() => {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
})

// Meta tags
import { useMeta } from '@unhead/vue'
useMeta({
    title: `Public Offer Agreement | ${companyName}`,
    meta: [
        { name: 'description', content: `Public Offer Agreement for ${companyName} consultation services.` }
    ]
})
</script>