<template>
  <div>
    <!-- Show dashboard for logged in users -->
    <ClientDashboard v-if="authStore.isAuthenticated && authStore.isClient" />
    <ProviderDashboard v-else-if="authStore.isAuthenticated && authStore.isProvider" />

    <!-- Show landing page for guests -->
    <div v-else class="min-h-screen">
      <!-- Hero section -->
      <div class="element-gradient relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div class="lg:grid lg:grid-cols-12 lg:gap-8">
            <div class="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 academic-heading">
                Professional
                <span class="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">
                  Online
                </span>
                <br />
                Consultation
              </h1>
              <p class="mt-6 text-lg sm:text-xl text-gray-600 scholarly-text max-w-3xl">
                Connect with qualified professionals for expert consultation through secure video sessions. Get the
                guidance you need, when you need it.
              </p>
              <div class="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <router-link to="/providers" class="btn-element-primary">
                  Find a professional
                </router-link>
                <router-link to="/register" class="btn-element-secondary">
                  Join as provider
                </router-link>
              </div>
            </div>
            <div
              class="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div class="relative mx-auto w-full rounded-lg lg:max-w-md">
                <!-- Decorative Elements -->
                <div
                  class="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob">
                </div>
                <div
                  class="absolute -bottom-8 -right-4 w-72 h-72 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000">
                </div>
                <div
                  class="absolute top-8 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000">
                </div>

                <!-- Main Image/Graphic -->
                <div class="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
                  <div class="text-center">
                    <div
                      class="w-20 h-20 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                      <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                      </svg>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">Secure video sessions</h3>
                    <p class="text-gray-600">Professional consultations from the comfort of your home</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features section -->
      <div class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 academic-heading">
              Why choose our platform?
            </h2>
            <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto scholarly-text">
              We provide a secure, convenient, and professional environment for online consultations
            </p>
          </div>

          <div class="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center card-hover bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div
                class="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z">
                  </path>
                </svg>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-4">Secure & private</h4>
              <p class="text-gray-600">End-to-end encrypted sessions ensuring your privacy and confidentiality are
                protected.</p>
            </div>

            <!-- Feature 2 -->
            <div class="text-center card-hover bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div
                class="bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-4">Flexible scheduling</h4>
              <p class="text-gray-600">Book appointments that fit your schedule with real-time availability updates.</p>
            </div>

            <!-- Feature 3 -->
            <div class="text-center card-hover bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div
                class="bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z">
                  </path>
                </svg>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-4">Qualified professionals</h4>
              <p class="text-gray-600">Access to verified experts across various specializations and fields.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- How it works section -->
      <div class="py-20 element-gradient">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center">
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 academic-heading">
              How it works
            </h2>
            <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto scholarly-text">
              Get professional consultation in three simple steps
            </p>
          </div>

          <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="text-center">
              <div
                class="bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span class="text-white font-bold text-xl">1</span>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-4">Choose a professional</h4>
              <p class="text-gray-600">Browse our network of qualified professionals and select the right specialist for
                your needs.</p>
            </div>

            <div class="text-center">
              <div
                class="bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span class="text-white font-bold text-xl">2</span>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-4">Schedule session</h4>
              <p class="text-gray-600">Book your appointment at a convenient time that works for both you and your
                chosen professional.</p>
            </div>

            <div class="text-center">
              <div
                class="bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span class="text-white font-bold text-xl">3</span>
              </div>
              <h4 class="text-xl font-bold text-gray-800 mb-4">Get expert guidance</h4>
              <p class="text-gray-600">Join your secure video session and receive professional consultation from the
                comfort of your location.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Call to action section -->
      <div class="py-20 bg-gradient-to-r from-gray-900 to-gray-800">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to get professional guidance?
          </h2>
          <p class="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of clients who have already discovered the convenience and quality of online professional
            consultation.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link to="/register?role=client"
              class="bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold py-3 px-8 rounded-2xl hover:from-emerald-500 hover:to-sky-500 transition-all duration-300 shadow-lg">
              Get started as client
            </router-link>
            <router-link to="/register?role=provider"
              class="bg-white/10 backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20">
              Join as professional
            </router-link>
          </div>
        </div>
      </div>

      <!-- Stats section -->
      <div class="bg-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-3xl font-bold text-gray-900">500+</div>
              <div class="text-sm text-gray-600 mt-1">Active professionals</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-gray-900">10k+</div>
              <div class="text-sm text-gray-600 mt-1">Successful sessions</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-gray-900">98%</div>
              <div class="text-sm text-gray-600 mt-1">Client satisfaction</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-gray-900">24/7</div>
              <div class="text-sm text-gray-600 mt-1">Support available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import ClientDashboard from '@/views/dashboard/ClientDashboard.vue'
import ProviderDashboard from '@/views/dashboard/ProviderDashboard.vue'

const authStore = useAuthStore()
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: translate(0px, 0px);
  }

  33% {
    transform: translate(30px, -50px);
  }

  66% {
    transform: translate(-20px, 20px);
  }

  100% {
    transform: translate(0px, 0px);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>