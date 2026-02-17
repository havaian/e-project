// frontend/src/stores/toast.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

let nextId = 0

export const useToastStore = defineStore('toast', () => {
    const toasts = ref([])

    /**
     * @param {'success'|'error'|'info'|'warning'} type
     * @param {string} message
     * @param {number} duration ms — 0 = stay until dismissed
     */
    function show(message, type = 'success', duration = 3500) {
        const id = ++nextId
        toasts.value.push({ id, message, type })

        if (duration > 0) {
            setTimeout(() => dismiss(id), duration)
        }

        return id
    }

    function success(message, duration) { return show(message, 'success', duration) }
    function error(message, duration) { return show(message, 'error', duration ?? 5000) }
    function info(message, duration) { return show(message, 'info', duration) }
    function warning(message, duration) { return show(message, 'warning', duration) }

    function dismiss(id) {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    return { toasts, show, success, error, info, warning, dismiss }
})