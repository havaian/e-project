<!-- frontend/src/views/NotFound.vue -->
<template>
    <div class="min-h-screen bg-white px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div class="max-w-max mx-auto">
            <main class="sm:flex">
                <p
                    class="text-4xl font-extrabold bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent sm:text-5xl">
                    404</p>
                <div class="sm:ml-6">
                    <div class="sm:border-l sm:border-gray-200 sm:pl-6">
                        <h1 class="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                            {{ $t('notFound.title') }}
                        </h1>
                        <p class="mt-1 text-base text-gray-500">
                            {{ $t('notFound.description') }}
                        </p>
                    </div>
                    <div class="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                        <router-link to="/" class="btn-element-primary">
                            {{ $t('notFound.goHome') }}
                        </router-link>
                        <a :href="supportEmailHref" class="btn-element-secondary">
                            {{ $t('notFound.contactSupport') }}
                        </a>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@e-project.ytech.space'
const supportEmailHref = computed(() => `mailto:${supportEmail}`)
</script>