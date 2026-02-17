// frontend/src/stores/modal.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useModalStore = defineStore('modal', () => {
    const state = reactive({
        open: false,
        type: 'alert',   // 'alert' | 'confirm' | 'prompt'
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        inputLabel: '',
        inputValue: '',
        inputPlaceholder: '',
        danger: false,     // true → confirm button turns red
        resolve: null,      // Promise resolver
    })

    function _open(opts) {
        return new Promise(resolve => {
            Object.assign(state, {
                open: true,
                title: opts.title ?? '',
                message: opts.message ?? '',
                confirmText: opts.confirmText ?? 'OK',
                cancelText: opts.cancelText ?? 'Cancel',
                inputLabel: opts.inputLabel ?? '',
                inputValue: opts.defaultValue ?? '',
                inputPlaceholder: opts.placeholder ?? '',
                danger: opts.danger ?? false,
                type: opts.type,
                resolve,
            })
        })
    }

    /**
     * Shows an info dialog with a single OK button.
     * Returns a Promise that resolves to true when dismissed.
     *
     * @example
     * await modal.alert('Course saved successfully')
     * await modal.alert({ title: 'Done', message: 'All changes saved.' })
     */
    function alert(messageOrOpts) {
        const opts = typeof messageOrOpts === 'string'
            ? { message: messageOrOpts }
            : messageOrOpts
        return _open({ confirmText: 'OK', ...opts, type: 'alert' })
    }

    /**
     * Shows a confirmation dialog with Confirm + Cancel buttons.
     * Returns a Promise that resolves to true (confirmed) or false (cancelled).
     *
     * @example
     * const ok = await modal.confirm('Delete this block?', { danger: true })
     * if (!ok) return
     */
    function confirm(messageOrOpts, extraOpts = {}) {
        const opts = typeof messageOrOpts === 'string'
            ? { message: messageOrOpts, ...extraOpts }
            : messageOrOpts
        return _open({ confirmText: 'Confirm', cancelText: 'Cancel', ...opts, type: 'confirm' })
    }

    /**
     * Shows a text input dialog.
     * Returns a Promise that resolves to the entered string, or null if cancelled.
     *
     * @example
     * const name = await modal.prompt('Enter block title:', { defaultValue: block.title })
     * if (name === null) return
     */
    function prompt(messageOrOpts, extraOpts = {}) {
        const opts = typeof messageOrOpts === 'string'
            ? { message: messageOrOpts, ...extraOpts }
            : messageOrOpts
        return _open({ confirmText: 'OK', cancelText: 'Cancel', ...opts, type: 'prompt' })
    }

    // Called by the component
    function _resolve(value) {
        state.open = false
        if (state.resolve) state.resolve(value)
        state.resolve = null
    }

    return { state, alert, confirm, prompt, _resolve }
})