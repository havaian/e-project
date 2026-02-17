<!-- frontend/src/components/ui/AppToast.vue -->
<template>
    <Teleport to="body">
        <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none" aria-live="polite">
            <div v-for="toast in toastStore.toasts" :key="toast.id"
                class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium max-w-sm min-w-60 border"
                :class="{
                    'bg-white border-emerald-200 text-emerald-800': toast.type === 'success',
                    'bg-white border-red-200   text-red-800': toast.type === 'error',
                    'bg-white border-sky-200   text-sky-800': toast.type === 'info',
                    'bg-white border-amber-200 text-amber-800': toast.type === 'warning'
                }">
                <!-- Icon -->
                <span class="mt-0.5 shrink-0">
                    <CheckCircleIcon v-if="toast.type === 'success'" class="w-4 h-4 text-emerald-500" />
                    <XCircleIcon v-else-if="toast.type === 'error'" class="w-4 h-4 text-red-500" />
                    <InformationCircleIcon v-else-if="toast.type === 'info'" class="w-4 h-4 text-sky-500" />
                    <ExclamationTriangleIcon v-else class="w-4 h-4 text-amber-500" />
                </span>

                <span class="flex-1">{{ toast.message }}</span>

                <!-- Dismiss -->
                <button @click="toastStore.dismiss(toast.id)"
                    class="ml-1 opacity-50 hover:opacity-100 transition-opacity shrink-0" aria-label="Dismiss">
                    <XMarkIcon class="w-4 h-4" />
                </button>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import {
    CheckCircleIcon, XCircleIcon, InformationCircleIcon,
    ExclamationTriangleIcon, XMarkIcon
} from '@heroicons/vue/24/outline'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>