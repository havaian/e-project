<!-- frontend/src/components/ui/AppModal.vue -->
<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-150"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="s.open" class="fixed inset-0 z-[9998] flex items-center justify-center p-4"
                @mousedown.self="onBackdrop">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

                <!-- Dialog -->
                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-2"
                    enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-100"
                    leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2" appear>
                    <div v-if="s.open"
                        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 overflow-hidden"
                        role="dialog" :aria-modal="true" :aria-labelledby="s.title ? 'modal-title' : undefined">
                        <!-- Header -->
                        <div v-if="s.title" class="px-6 pt-6 pb-0">
                            <h2 id="modal-title" class="text-base font-bold text-gray-900">{{ s.title }}</h2>
                        </div>

                        <!-- Body -->
                        <div class="px-6 py-5" :class="{ 'pt-5': !s.title }">
                            <p v-if="s.message" class="text-sm text-gray-600 leading-relaxed"
                                :class="{ 'mt-1': s.title }">
                                {{ s.message }}
                            </p>

                            <!-- Prompt input -->
                            <div v-if="s.type === 'prompt'" :class="{ 'mt-4': s.message }">
                                <label v-if="s.inputLabel"
                                    class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    {{ s.inputLabel }}
                                </label>
                                <input ref="inputRef" v-model="s.inputValue" type="text"
                                    :placeholder="s.inputPlaceholder"
                                    class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    @keydown.enter="onConfirm" @keydown.esc="onCancel" />
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="flex gap-2 px-6 pb-5">
                            <!-- Cancel (confirm + prompt only) -->
                            <button v-if="s.type !== 'alert'" @click="onCancel"
                                class="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                                {{ s.cancelText }}
                            </button>

                            <!-- Confirm / OK -->
                            <button @click="onConfirm"
                                class="flex-1 font-bold py-2.5 rounded-xl text-sm transition-colors text-white" :class="s.danger
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-sky-500 hover:bg-sky-600'">
                                {{ s.confirmText }}
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useModalStore } from '@/stores/modal'

const modalStore = useModalStore()
const s = modalStore.state
const inputRef = ref(null)

// Auto-focus input on prompt open
watch(() => s.open, async (val) => {
    if (val && s.type === 'prompt') {
        await nextTick()
        inputRef.value?.focus()
        inputRef.value?.select()
    }
})

function onConfirm() {
    if (s.type === 'alert') return modalStore._resolve(true)
    if (s.type === 'confirm') return modalStore._resolve(true)
    if (s.type === 'prompt') return modalStore._resolve(s.inputValue || '')
}

function onCancel() {
    if (s.type === 'alert') return  // backdrop / ESC on alert just confirms
    modalStore._resolve(s.type === 'prompt' ? null : false)
}

// Clicking backdrop dismisses like cancel
function onBackdrop() {
    onCancel()
}

// Global keyboard handler
function onKeydown(e) {
    if (!s.open) return
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Enter' && s.type !== 'prompt') onConfirm()
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>