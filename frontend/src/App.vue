<template>
  <div class="min-h-screen">
    <nav-bar v-if="showNavBar" />
    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <app-footer v-if="showFooter" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from '@/components/layout/NavBar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'

const route = useRoute()

const showNavBar = computed(() => !route.meta.hideNavBar)
const showFooter = computed(() => !route.meta.hideFooter)
</script>

<style>
/* Global design styles */
.element-gradient {
  background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 25%, #f0f9ff 50%, #e0f2fe 75%, #f0f9ff 100%);
}

.pulse-animation {
  animation: pulse 3s ease-in-out infinite;
}

.float-element {
  animation: floatElement 4s ease-in-out infinite;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

/* Academic heading style */
.academic-heading {
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.1;
}

/* Scholarly text style */
.scholarly-text {
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.6;
}

@keyframes floatElement {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  25% {
    transform: translateY(-10px) rotate(1deg);
  }

  50% {
    transform: translateY(-15px) rotate(0deg);
  }

  75% {
    transform: translateY(-10px) rotate(-1deg);
  }
}

.slide-in {
  animation: slideIn 1.2s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(50px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

/* Custom button styles */
.btn-element-primary {
  @apply px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-buttery shadow-lg;
  box-shadow: 0 20px 40px rgba(14, 165, 233, 0.15);
}

.btn-element-secondary {
  @apply px-8 py-4 bg-white/90 backdrop-blur-sm text-sky-500 font-semibold rounded-2xl hover:bg-white focus:ring-4 focus:ring-sky-500/30 transition-buttery shadow-lg border-2 border-sky-500/20;
}

/* Page transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>