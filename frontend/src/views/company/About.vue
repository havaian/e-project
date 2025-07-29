<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <!-- Hero Section -->
        <div class="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center">
                    <h1 class="text-5xl font-bold mb-6">About {{ companyName }}</h1>
                    <p class="text-xl text-sky-100 max-w-3xl mx-auto leading-relaxed">
                        Transforming education through innovative online consultation services that connect students,
                        educators, and professionals in a secure, FERPA-compliant environment.
                    </p>
                </div>
            </div>
        </div>

        <!-- Mission & Vision -->
        <div class="py-20">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p class="text-gray-700 text-lg leading-relaxed mb-6">
                            To democratize access to quality educational support and professional consultation services
                            by leveraging cutting-edge technology while maintaining the highest standards of privacy,
                            security, and educational compliance.
                        </p>
                        <p class="text-gray-700 leading-relaxed">
                            We believe every student deserves access to personalized support that helps them achieve
                            their full potential, regardless of geographic location or institutional resources.
                        </p>
                    </div>
                    <div class="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-8">
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                        <p class="text-gray-700 leading-relaxed">
                            To become the leading platform for educational consultation services, fostering a global
                            community where learning has no boundaries and every educational challenge can be addressed
                            through expert guidance and collaborative support.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Our Story -->
        <div class="bg-white py-20">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
                    <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto"></div>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-sky-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-sky-600">2020</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">The Beginning</h3>
                        <p class="text-gray-600">
                            Founded with a vision to bridge the gap between students and expert educational support
                            during the global shift to remote learning.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-emerald-600">2022</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">Growth & Innovation</h3>
                        <p class="text-gray-600">
                            Expanded our platform capabilities and achieved FERPA compliance, serving over 10,000
                            students across 200+ educational institutions.
                        </p>
                    </div>

                    <div class="text-center">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-purple-600">2025</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">Leading the Future</h3>
                        <p class="text-gray-600">
                            Continuing to innovate with AI-powered matching, advanced analytics, and expanded
                            global reach to serve the evolving needs of modern education.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Core Values -->
        <div class="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        These principles guide every decision we make and every feature we build.
                    </p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h3>
                        <p class="text-gray-600 text-sm">
                            We prioritize the protection of student data and maintain the highest security standards.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Educational Excellence</h3>
                        <p class="text-gray-600 text-sm">
                            We connect students with verified, qualified professionals who are passionate about
                            education.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                        <p class="text-gray-600 text-sm">
                            We continuously evolve our platform to meet the changing needs of modern education.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Accessibility</h3>
                        <p class="text-gray-600 text-sm">
                            We ensure our platform is accessible to all users, regardless of ability or circumstance.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Team Section -->
        <div class="py-20 bg-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Meet Our Leadership Team</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        Passionate educators and technologists dedicated to transforming educational support.
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div
                            class="bg-gradient-to-br from-sky-400 to-sky-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <span class="text-3xl font-bold text-white">CEO</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Dr. Sarah Chen</h3>
                        <p class="text-sky-600 font-medium mb-3">Chief Executive Officer</p>
                        <p class="text-gray-600 text-sm">
                            Former education administrator with 15+ years of experience in educational technology
                            and student support services.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <span class="text-3xl font-bold text-white">CTO</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Michael Rodriguez</h3>
                        <p class="text-emerald-600 font-medium mb-3">Chief Technology Officer</p>
                        <p class="text-gray-600 text-sm">
                            Technology leader with expertise in secure platform development and educational compliance
                            standards including FERPA.
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <span class="text-3xl font-bold text-white">CPO</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Dr. Emily Johnson</h3>
                        <p class="text-purple-600 font-medium mb-3">Chief Product Officer</p>
                        <p class="text-gray-600 text-sm">
                            Product strategist focused on user experience and educational outcomes, with a background
                            in learning sciences and UX design.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="py-20 bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold mb-4">Our Impact</h2>
                    <p class="text-sky-100 max-w-2xl mx-auto">
                        Making a difference in education, one consultation at a time.
                    </p>
                </div>

                <div class="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div class="text-4xl font-bold mb-2">50,000+</div>
                        <div class="text-sky-200">Students Served</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">500+</div>
                        <div class="text-sky-200">Verified Providers</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">300+</div>
                        <div class="text-sky-200">Partner Institutions</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">98%</div>
                        <div class="text-sky-200">Satisfaction Rate</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Certifications & Compliance -->
        <div class="py-20 bg-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">Certifications & Compliance</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        We maintain the highest standards of security, privacy, and educational compliance.
                    </p>
                </div>

                <div class="grid md:grid-cols-4 gap-8 text-center">
                    <div class="bg-green-50 rounded-xl p-6">
                        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">FERPA Compliant</h3>
                        <p class="text-gray-600 text-sm">
                            Full compliance with educational privacy regulations
                        </p>
                    </div>

                    <div class="bg-blue-50 rounded-xl p-6">
                        <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">SOC 2 Certified</h3>
                        <p class="text-gray-600 text-sm">
                            Rigorous security and availability standards
                        </p>
                    </div>

                    <div class="bg-purple-50 rounded-xl p-6">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">WCAG 2.1 AA</h3>
                        <p class="text-gray-600 text-sm">
                            Web accessibility compliance for all users
                        </p>
                    </div>

                    <div class="bg-orange-50 rounded-xl p-6">
                        <div class="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                            </svg>
                        </div>
                        <h3 class="font-semibold text-gray-900 mb-2">ISO 27001</h3>
                        <p class="text-gray-600 text-sm">
                            International security management standards
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact CTA -->
        <div class="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Ready to Join Our Mission?</h2>
                <p class="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                    Whether you're an educator looking to make a difference or a student seeking support,
                    we invite you to be part of our growing community.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <router-link to="/register" class="btn-primary px-8 py-3">
                        Get Started Today
                    </router-link>
                    <router-link to="/contact" class="btn-secondary px-8 py-3">
                        Contact Us
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME

// Meta tags
import { useMeta } from '@unhead/vue'
useMeta({
    title: `About Us | ${companyName}`,
    meta: [
        { name: 'description', content: `Learn about ${companyName}\'s mission to transform education through innovative online consultation services.` }
    ]
})
</script>