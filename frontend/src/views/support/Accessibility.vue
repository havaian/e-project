<!-- frontend/src/views/support/Accessibility.vue -->
<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">{{ $t('accessibility.title') }}</h1>
                <p class="text-lg text-gray-600">{{ $t('accessibility.subtitle') }}</p>
                <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
            </div>

            <!-- Accessibility Badge -->
            <div class="text-center mb-12">
                <div class="inline-flex items-center bg-blue-100 rounded-full px-6 py-3">
                    <UserIcon class="w-6 h-6 text-blue-600 mr-3" />
                    <span class="text-blue-800 font-semibold">{{ $t('accessibility.badge') }}</span>
                </div>
            </div>

            <!-- Content -->
            <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
                <div class="prose prose-lg max-w-none">
                    <p class="text-gray-700 leading-relaxed mb-8">
                        {{ $t('accessibility.intro', { company: companyName }) }}
                    </p>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.commitmentTitle') }}</h2>
                        <p class="text-gray-700 mb-6">{{ $t('accessibility.commitmentText') }}</p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.standardsTitle') }}</h2>
                        <p class="text-gray-700 mb-4">{{ $t('accessibility.standardsText') }}</p>

                        <div class="grid md:grid-cols-3 gap-6 mt-6">
                            <div class="bg-green-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-green-900 mb-3">{{ $t('accessibility.perceivable')
                                    }}</h3>
                                <p class="text-green-800 text-sm">{{ $t('accessibility.perceivableDesc') }}</p>
                            </div>

                            <div class="bg-blue-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-blue-900 mb-3">{{ $t('accessibility.operable') }}
                                </h3>
                                <p class="text-blue-800 text-sm">{{ $t('accessibility.operableDesc') }}</p>
                            </div>

                            <div class="bg-purple-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-purple-900 mb-3">{{
                                    $t('accessibility.understandable') }}</h3>
                                <p class="text-purple-800 text-sm">{{ $t('accessibility.understandableDesc') }}</p>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.featuresTitle') }}</h2>

                        <div class="space-y-6">
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <EyeIcon class="w-5 h-5 text-blue-600 mr-2" />
                                    {{ $t('accessibility.visualTitle') }}
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li v-for="item in $tm('accessibility.visualItems')" :key="item">• {{ item }}</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <MusicalNoteIcon class="w-5 h-5 text-green-600 mr-2" />
                                    {{ $t('accessibility.audioTitle') }}
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li v-for="item in $tm('accessibility.audioItems')" :key="item">• {{ item }}</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <AdjustmentsHorizontalIcon class="w-5 h-5 text-purple-600 mr-2" />
                                    {{ $t('accessibility.motorTitle') }}
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li v-for="item in $tm('accessibility.motorItems')" :key="item">• {{ item }}</li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                    <LightBulbIcon class="w-5 h-5 text-orange-600 mr-2" />
                                    {{ $t('accessibility.cognitiveTitle') }}
                                </h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li v-for="item in $tm('accessibility.cognitiveItems')" :key="item">• {{ item }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.assistiveTechTitle') }}
                        </h2>
                        <p class="text-gray-700 mb-4">{{ $t('accessibility.assistiveTechText') }}</p>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="bg-gray-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{
                                    $t('accessibility.screenReaders') }}</h3>
                                <ul class="text-gray-700 space-y-1">
                                    <li v-for="item in $tm('accessibility.screenReaderItems')" :key="item">• {{ item }}
                                    </li>
                                </ul>
                            </div>

                            <div class="bg-gray-50 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ $t('accessibility.otherTools')
                                    }}</h3>
                                <ul class="text-gray-700 space-y-1">
                                    <li v-for="item in $tm('accessibility.otherToolItems')" :key="item">• {{ item }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.testingTitle') }}</h2>
                        <p class="text-gray-700 mb-6">{{ $t('accessibility.testingText') }}</p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li v-for="item in $tm('accessibility.testingItems')" :key="item">{{ item }}</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.knownIssuesTitle') }}
                        </h2>
                        <p class="text-gray-700 mb-4">{{ $t('accessibility.knownIssuesText') }}</p>
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <ul class="text-gray-700 space-y-2">
                                <li v-for="item in $tm('accessibility.knownIssueItems')" :key="item">• {{ item }}</li>
                            </ul>
                            <p class="text-gray-700 mt-4 text-sm">{{ $t('accessibility.knownIssuesNote') }}</p>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.supportTitle') }}</h2>
                        <p class="text-gray-700 mb-6">{{ $t('accessibility.supportText') }}</p>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.feedbackTitle') }}</h2>
                        <p class="text-gray-700 mb-6">{{ $t('accessibility.feedbackText') }}</p>

                        <div class="grid md:grid-cols-2 gap-6">
                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{
                                    $t('accessibility.howToFeedback') }}</h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li v-for="item in $tm('accessibility.howToFeedbackItems')" :key="item">• {{ item }}
                                    </li>
                                </ul>
                            </div>

                            <div class="border border-gray-200 rounded-lg p-6">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">{{
                                    $t('accessibility.whatToInclude') }}</h3>
                                <ul class="text-gray-700 space-y-2">
                                    <li v-for="item in $tm('accessibility.whatToIncludeItems')" :key="item">• {{ item }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.trainingTitle') }}</h2>
                        <p class="text-gray-700 mb-6">{{ $t('accessibility.trainingText', { company: companyName }) }}
                        </p>
                        <ul class="list-disc ml-6 text-gray-700 mb-6">
                            <li v-for="item in $tm('accessibility.trainingItems')" :key="item">{{ item }}</li>
                        </ul>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.legalTitle') }}</h2>
                        <p class="text-gray-700 mb-6">{{ $t('accessibility.legalText') }}</p>

                        <div class="space-y-4">
                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">{{ $t('accessibility.adaTitle') }}</h4>
                                    <p class="text-gray-700 text-sm">{{ $t('accessibility.adaDesc') }}</p>
                                </div>
                            </div>

                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">{{ $t('accessibility.section508Title') }}
                                    </h4>
                                    <p class="text-gray-700 text-sm">{{ $t('accessibility.section508Desc') }}</p>
                                </div>
                            </div>

                            <div class="flex items-start space-x-3">
                                <div class="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                <div>
                                    <h4 class="font-semibold text-gray-900">{{ $t('accessibility.wcagTitle') }}</h4>
                                    <p class="text-gray-700 text-sm">{{ $t('accessibility.wcagDesc') }}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.altFormatsTitle') }}</h2>
                        <p class="text-gray-700 mb-4">{{ $t('accessibility.altFormatsText') }}</p>
                        <div class="bg-green-50 rounded-lg p-6">
                            <ul class="text-green-800 space-y-2">
                                <li v-for="item in $tm('accessibility.altFormatItems')" :key="item">• {{ item }}</li>
                            </ul>
                            <p class="text-green-700 mt-4 text-sm">{{ $t('accessibility.altFormatsNote') }}</p>
                        </div>
                    </section>

                    <section class="mb-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('accessibility.updatesTitle') }}</h2>
                        <p class="text-gray-700 mb-6">
                            {{ $t('accessibility.updatesText', { date: lastUpdated }) }}
                        </p>
                        <p class="text-gray-700">{{ $t('accessibility.updatesCommitment') }}</p>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { UserIcon, EyeIcon, MusicalNoteIcon, AdjustmentsHorizontalIcon, LightBulbIcon } from "@heroicons/vue/24/outline";
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