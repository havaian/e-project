// frontend/src/plugins/globals.js
//
// Registers two globals on the Vue app instance:
//
//   In templates (zero imports needed):
//     $toast.success('Saved!')
//     $toast.error('Something went wrong')
//     $toast.info('FYI')
//     $toast.warning('Watch out')
//     $uploadsUrl(path)   → full absolute URL for /uploads/... paths
//
//   In <script setup> (one import, zero per-file boilerplate):
//     import { useGlobals } from '@/plugins/globals'
//     const { toast, uploadsUrl } = useGlobals()

import { useToastStore } from '@/stores/toast'

// ── uploadsUrl ────────────────────────────────────────────────────────────────
// Converts relative /uploads/... paths returned by the backend into absolute
// URLs so that <img> and <video> tags work in both dev (different port) and
// production (same domain).
export function uploadsUrl(path) {
    if (!path) return null
    if (path.startsWith('http')) return path
    // /uploads/... paths are proxied by nginx to the backend.
    // Return as-is — no base URL manipulation needed.
    return path
}

// ── useGlobals composable ─────────────────────────────────────────────────────
// Use this inside <script setup> blocks:
//   const { toast, uploadsUrl } = useGlobals()
export function useGlobals() {
    const toast = useToastStore()
    return { toast, uploadsUrl }
}

// ── Vue plugin install ────────────────────────────────────────────────────────
export default {
    install(app) {
        // $uploadsUrl available in every template with no import
        app.config.globalProperties.$uploadsUrl = uploadsUrl

        // $toast available in every template with no import.
        // We expose the store directly; Pinia stores are reactive singletons
        // so this is safe and always reflects the current state.
        app.config.globalProperties.$toast = useToastStore()
    }
}