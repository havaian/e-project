<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <!-- Hero Section -->
        <div class="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center">
                    <h1 class="text-5xl font-bold mb-6">About {{ companyName }}</h1>
                    <p class="text-xl text-sky-100 max-w-3xl mx-auto leading-relaxed">
                        Transforming education through innovative online consultation services that connect students,
                        educators, and professionals in a secure environment.
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
                            Expanded our platform capabilities serving over 10,000
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
                            <ShieldCheckIcon class="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h3>
                        <p class="text-gray-600 text-sm">
                            We prioritize the protection of student data and maintain the highest security standards.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <BookOpenIcon class="w-8 h-8 text-green-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Educational Excellence</h3>
                        <p class="text-gray-600 text-sm">
                            We connect students with verified, qualified professionals who are passionate about
                            education.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <BoltIcon class="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                        <p class="text-gray-600 text-sm">
                            We continuously evolve our platform to meet the changing needs of modern education.
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <UsersIcon class="w-8 h-8 text-orange-600" />
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
                            standards.
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
import { ShieldCheckIcon, BookOpenIcon, BoltIcon, UsersIcon } from "@heroicons/vue/24/outline";
// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME

// Meta tags
import { useHead } from '@unhead/vue'
useHead({
    title: `About Us | ${companyName}`,
    meta: [
        { name: 'description', content: `Learn about ${companyName}\'s mission to transform education through innovative online consultation services.` }
    ]
})
</script>