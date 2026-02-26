<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <!-- Hero section -->
        <div class="bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center">
                    <h1 class="text-5xl font-bold mb-6">{{ $t('about.heroTitle', { company: companyName }) }}</h1>
                    <p class="text-xl text-sky-100 max-w-3xl mx-auto leading-relaxed">
                        {{ $t('about.heroDescription') }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Mission & vision -->
        <div class="py-20">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ $t('about.missionTitle') }}</h2>
                        <p class="text-gray-700 text-lg leading-relaxed mb-6">
                            {{ $t('about.missionText1') }}
                        </p>
                        <p class="text-gray-700 leading-relaxed">
                            {{ $t('about.missionText2') }}
                        </p>
                    </div>
                    <div class="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-8">
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('about.visionTitle') }}</h3>
                        <p class="text-gray-700 leading-relaxed">
                            {{ $t('about.visionText') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Our story -->
        <div class="bg-white py-20">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('about.storyTitle') }}</h2>
                    <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto"></div>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div class="bg-sky-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-sky-600">2020</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ $t('about.story2020Title') }}</h3>
                        <p class="text-gray-600">
                            {{ $t('about.story2020Text') }}
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-emerald-600">2022</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ $t('about.story2022Title') }}</h3>
                        <p class="text-gray-600">
                            {{ $t('about.story2022Text') }}
                        </p>
                    </div>

                    <div class="text-center">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <span class="text-2xl font-bold text-purple-600">2025</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ $t('about.story2025Title') }}</h3>
                        <p class="text-gray-600">
                            {{ $t('about.story2025Text') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Core values -->
        <div class="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('about.valuesTitle') }}</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        {{ $t('about.valuesSubtitle') }}
                    </p>
                </div>

                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <ShieldCheckIcon class="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('about.valuePrivacy') }}</h3>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.valuePrivacyDesc') }}
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <BookOpenIcon class="w-8 h-8 text-green-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('about.valueExcellence') }}</h3>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.valueExcellenceDesc') }}
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <BoltIcon class="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('about.valueInnovation') }}</h3>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.valueInnovationDesc') }}
                        </p>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg p-6 text-center">
                        <div class="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <UsersIcon class="w-8 h-8 text-orange-600" />
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('about.valueAccessibility') }}</h3>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.valueAccessibilityDesc') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Team section -->
        <div class="py-20 bg-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('about.teamTitle') }}</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        {{ $t('about.teamSubtitle') }}
                    </p>
                </div>

                <div class="grid md:grid-cols-3 gap-8">
                    <div class="text-center">
                        <div
                            class="bg-gradient-to-br from-sky-400 to-sky-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <span class="text-3xl font-bold text-white">CEO</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Dr. Sarah Chen</h3>
                        <p class="text-sky-600 font-medium mb-3">{{ $t('about.roleCEO') }}</p>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.bioCEO') }}
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <span class="text-3xl font-bold text-white">CTO</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Michael Rodriguez</h3>
                        <p class="text-emerald-600 font-medium mb-3">{{ $t('about.roleCTO') }}</p>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.bioCTO') }}
                        </p>
                    </div>

                    <div class="text-center">
                        <div
                            class="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-4">
                            <span class="text-3xl font-bold text-white">CPO</span>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Dr. Emily Johnson</h3>
                        <p class="text-purple-600 font-medium mb-3">{{ $t('about.roleCPO') }}</p>
                        <p class="text-gray-600 text-sm">
                            {{ $t('about.bioCPO') }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Statistics -->
        <div class="py-20 bg-gradient-to-r from-sky-600 to-cyan-600 text-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold mb-4">{{ $t('about.impactTitle') }}</h2>
                    <p class="text-sky-100 max-w-2xl mx-auto">
                        {{ $t('about.impactSubtitle') }}
                    </p>
                </div>

                <div class="grid md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div class="text-4xl font-bold mb-2">50,000+</div>
                        <div class="text-sky-200">{{ $t('about.statStudents') }}</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">500+</div>
                        <div class="text-sky-200">{{ $t('about.statProviders') }}</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">300+</div>
                        <div class="text-sky-200">{{ $t('about.statInstitutions') }}</div>
                    </div>
                    <div>
                        <div class="text-4xl font-bold mb-2">98%</div>
                        <div class="text-sky-200">{{ $t('about.statSatisfaction') }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Certifications & compliance -->
        <div class="py-20 bg-white">
            <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="text-center mb-16">
                    <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('about.certificationsTitle') }}</h2>
                    <p class="text-gray-600 max-w-2xl mx-auto">
                        {{ $t('about.certificationsSubtitle') }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Contact CTA -->
        <div class="py-20 bg-gradient-to-br from-gray-50 to-white">
            <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('about.ctaTitle') }}</h2>
                <p class="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                    {{ $t('about.ctaDescription') }}
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <router-link to="/register" class="btn-primary px-8 py-3">
                        {{ $t('about.ctaGetStarted') }}
                    </router-link>
                    <router-link to="/contact" class="btn-secondary px-8 py-3">
                        {{ $t('about.ctaContact') }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ShieldCheckIcon, BookOpenIcon, BoltIcon, UsersIcon } from "@heroicons/vue/24/outline";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME

// Meta tags
import { useHead } from '@unhead/vue'
useHead({
    title: `${t('about.metaTitle')} | ${companyName}`,
    meta: [
        { name: 'description', content: t('about.metaDescription', { company: companyName }) }
    ]
})
</script>