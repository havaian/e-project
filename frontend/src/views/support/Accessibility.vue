<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Accessibility Statement</h1>
                <p class="text-lg text-gray-600">Our Commitment to Digital Inclusion</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <!-- Accessibility Badge -->
            <div class="text-center mb-12">
                <div class="inline-flex items-center bg-blue-100 rounded-full px-6 py-3">
                    <svg class="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span class="text-blue-800 font-semibold">WCAG 2.1 AA Compliant</span>
                </div>
            </div>

            <!-- Content -->
            <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div class="prose prose-lg max-w-none">
                    <p class="text-gray-700 leading-relaxed mb-8">
                        {{ companyName }} is committed to ensuring digital accessibility for people with disabilities.
                        We are continually improving the user experience for everyone and applying the relevant
                        accessibility standards.
                    </p>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Our Accessibility Commitment</h2>
                        <p class="text-gray-700 mb-6">
                            We believe that access to education and professional consultation services should be
                            available to everyone,
                            regardless of ability. Our platform is designed and developed with accessibility as a core
                            principle,
                            not an afterthought.
                        </p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Accessibility Standards</h2>
                        <p class="text-gray-700 mb-4">
                            Our website and platform aim to conform to the Web Content Accessibility Guidelines (WCAG)
                            2.1 Level AA.
                            These guidelines explain how to make web content more accessible for people with
                            disabilities.
                        </p>

                        <div class="grid md:grid-cols-3 gap-6 mt-6">
                            <div class="bg-green-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-green-900 mb-3">Perceivable</h3>
                                <p class="text-green-800 text-sm">
                                    Information and UI components must be presentable to users in ways they can
                                    perceive.
                                </p>
                            </div>

                            <div class="bg-blue-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-blue-900 mb-3">Operable</h3>
                                <p class="text-blue-800 text-sm">
                                    User interface components and navigation must be operable by all users.
                                </p>
                            </div>

                            <div class="bg-purple-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-purple-900 mb-3">Understandable</h3>
                                <p class="text-purple-800 text-sm">
                                    Information and the operation of user interface must be understandable.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>

                        <div class="space-y-6">
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Visual Accessibility
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li>• High contrast color schemes</li>
                                    <li>• Scalable text (up to 200% without horizontal scrolling)</li>
                                    <li>• Alternative text for all images</li>
                                    <li>• Color is not the only means of conveying information</li>
                                    <li>• Focus indicators for keyboard navigation</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                    Audio Accessibility
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li>• Closed captions for video consultations</li>
                                    <li>• Audio descriptions when available</li>
                                    <li>• Visual indicators for audio alerts</li>
                                    <li>• Adjustable audio volume controls</li>
                                    <li>• Text-based alternatives to audio content</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                    </svg>
                                    Keyboard and Motor Accessibility
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li>• Full keyboard navigation support</li>
                                    <li>• No keyboard traps</li>
                                    <li>• Reasonable time limits with extensions available</li>
                                    <li>• Large click targets (minimum 44x44 pixels)</li>
                                    <li>• Voice control compatibility</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Cognitive Accessibility
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li>• Clear and simple language</li>
                                    <li>• Consistent navigation and layout</li>
                                    <li>• Error prevention and clear error messages</li>
                                    <li>• Help and documentation readily available</li>
                                    <li>• Progress indicators for multi-step processes</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Assistive Technology Support</h2>
                        <p class="text-gray-700 mb-4">Our platform is compatible with a wide range of assistive
                            technologies:</p>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="bg-gray-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Screen Readers</h3>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• JAWS (Job Access With Speech)</li>
                                    <li>• NVDA (NonVisual Desktop Access)</li>
                                    <li>• VoiceOver (macOS/iOS)</li>
                                    <li>• TalkBack (Android)</li>
                                </ul>
                            </div>

                            <div class="bg-gray-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Other Tools</h3>
                                <ul class="text-gray-700 space-y-1">
                                    <li>• Voice recognition software</li>
                                    <li>• Switch navigation devices</li>
                                    <li>• Eye-tracking systems</li>
                                    <li>• Browser zoom tools</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Testing and Evaluation</h2>
                        <p class="text-gray-700 mb-6">
                            We regularly test our platform for accessibility compliance through:
                        </p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Automated accessibility testing tools</li>
                            <li>Manual testing with keyboard navigation</li>
                            <li>Screen reader testing</li>
                            <li>User testing with people with disabilities</li>
                            <li>Third-party accessibility audits</li>
                            <li>Continuous monitoring and improvement</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Known Issues and Limitations</h2>
                        <p class="text-gray-700 mb-4">
                            While we strive for full accessibility, we acknowledge some current limitations:
                        </p>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <ul class="text-gray-700 space-y-2">
                                <li>• Some third-party video conferencing features may have limited accessibility</li>
                                <li>• PDF documents may not always be fully accessible (we're working to improve this)
                                </li>
                                <li>• Some dynamic content updates may not be immediately announced to screen readers
                                </li>
                            </ul>
                            <p class="text-gray-700 mt-4 text-sm">
                                We are actively working to address these issues in upcoming updates.
                            </p>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Accessibility Support</h2>
                        <p class="text-gray-700 mb-6">
                            If you experience any accessibility barriers while using our platform, we want to help.
                            Our accessibility support team is available to assist you.
                        </p>

                        <div class="bg-blue-50 rounded-lg p-6">
                            <h3 class="text-lg font-semibold text-blue-900 mb-3">Get Accessibility Support</h3>
                            <div class="space-y-2 text-blue-800">
                                <p><strong>Accessibility Coordinator:</strong> Maria Rodriguez</p>
                                <p><strong>Email:</strong> accessibility@ytech.space</p>
                                <p><strong>Phone:</strong> {{ supportPhone }} (ext. 102)</p>
                                <p><strong>Response Time:</strong> Within 24 hours</p>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Feedback and Continuous Improvement</h2>
                        <p class="text-gray-700 mb-6">
                            We welcome your feedback on the accessibility of our platform. Your input helps us identify
                            areas
                            for improvement and prioritize accessibility enhancements.
                        </p>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">How to Provide Feedback</h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li>• Use our accessibility feedback form</li>
                                    <li>• Email our accessibility team</li>
                                    <li>• Call our accessibility hotline</li>
                                    <li>• Submit through our general support channels</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">What to Include</h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li>• Description of the accessibility barrier</li>
                                    <li>• Your assistive technology details</li>
                                    <li>• Browser and device information</li>
                                    <li>• Steps to reproduce the issue</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Training and Awareness</h2>
                        <p class="text-gray-700 mb-6">
                            All {{ companyName }} team members receive accessibility training to ensure they understand
                            and can
                            support users with disabilities. Our training program includes:
                        </p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li>Disability awareness and etiquette</li>
                            <li>Understanding assistive technologies</li>
                            <li>Accessible design principles</li>
                            <li>WCAG guidelines and compliance</li>
                            <li>Customer service for people with disabilities</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Legal Compliance</h2>
                        <p class="text-gray-700 mb-6">
                            Our accessibility efforts align with various legal requirements and standards, including:
                        </p>

                        <div class="space-y-4">
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Americans with Disabilities Act (ADA)</h4>
                                    <p class="text-gray-700 text-sm">Ensuring equal access to public accommodations and
                                        services</p>
                                </div>
                            </div>

                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Section 508 of the Rehabilitation Act</h4>
                                    <p class="text-gray-700 text-sm">Federal accessibility standards for electronic
                                        content</p>
                                </div>
                            </div>

                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">Web Content Accessibility Guidelines (WCAG)
                                        2.1</h4>
                                    <p class="text-gray-700 text-sm">International standards for web accessibility</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Alternative Formats</h2>
                        <p class="text-gray-700 mb-4">
                            We can provide information in alternative formats upon request:
                        </p>
                        <div class="bg-green-50 rounded-lg p-6">
                            <ul class="text-green-800 space-y-2">
                                <li>• Large print documents</li>
                                <li>• Audio recordings</li>
                                <li>• Braille materials (where possible)</li>
                                <li>• Electronic text files</li>
                                <li>• Sign language interpretation for video calls</li>
                            </ul>
                            <p class="text-green-700 mt-4 text-sm">
                                Please contact us at least 48 hours in advance to arrange alternative formats.
                            </p>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">Updates and Maintenance</h2>
                        <p class="text-gray-700 mb-6">
                            This accessibility statement is reviewed and updated regularly to reflect our current
                            accessibility status.
                            Last reviewed: {{ lastUpdated }}
                        </p>
                        <p class="text-gray-700">
                            We are committed to continuing our accessibility improvements and will update this statement
                            as we
                            make enhancements to our platform.
                        </p>
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
import { useHead } from '@unhead/vue'
useHead({
    title: `Accessibility Statement | ${companyName}`,
    meta: [
        { name: 'description', content: 'Our commitment to digital accessibility and inclusive design.' }
    ]
})
</script>