<template>
  <div>
    <!-- Hero Section with New Educational Design -->
    <div class="relative min-h-screen element-gradient overflow-hidden">
      <!-- Floating Educational Icons -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-20 left-10 float-element opacity-20">
          <svg class="text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
            </path>
          </svg>
        </div>
        <div class="absolute top-32 right-20 float-element opacity-15" style="animation-delay: -1s;">
          <svg class="text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z">
            </path>
          </svg>
        </div>
        <div class="absolute bottom-32 left-32 float-element opacity-10" style="animation-delay: -2s;">
          <svg class="text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z">
            </path>
          </svg>
        </div>
      </div>

      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16 text-center">
        <!-- Logo Section -->
        <div class="mb-12 slide-in">
          <div class="flex items-center justify-center mb-8">
            <div class="relative">
              <div
                class="float-element glow-effect">
                  <img src="/images/logo.svg" :alt="`${appTitle} Logo`" width="80" height="80" class="w-20 h-20" />
              </div>
            </div>
          </div>
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3">
            {{ appTitle1 }}<span
              class="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">{{ appTitle2 }}</span><span
              class="text-success">{{ appTitle3 }}</span>
          </h1>
          <p class="text-xl text-gray-700 font-medium">Your Academic Performance, Our Digital Care</p>
        </div>

        <!-- Main Content -->
        <div class="mb-16">
          <div class="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-full px-6 py-2 mb-6 shadow-lg">
            <div class="bg-success rounded-full w-3 h-3 mr-3 pulse-animation"></div>
            <span class="text-sm font-semibold text-gray-700">Professional Education Platform</span>
          </div>
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Professional Education
            <span class="bg-gradient-to-r from-sky-500 to-success bg-clip-text text-transparent">
              At Your Fingertips
            </span>
          </h2>
          <p class="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            Connect with qualified providers online for sessions, recommendations, and advice from the comfort
            of your home.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <router-link to="/providers"
              class="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-buttery shadow-lg glow-effect">
              Find a Provider
            </router-link>
            <router-link to="/register"
              class="px-8 py-4 bg-white/90 backdrop-blur-sm text-sky-500 font-semibold rounded-2xl hover:bg-white focus:ring-4 focus:ring-sky-500/30 transition-buttery shadow-lg border-2 border-sky-500/20">
              Register Now
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-base text-sky-500 font-semibold tracking-wide uppercase mb-2">Features</h2>
          <h3 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Better Education Solution
          </h3>
          <p class="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Experience reimagined with our comprehensive online session platform.
          </p>
        </div>

        <!-- Feature Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center card-hover shadow-lg">
            <div class="bg-gradient-to-r from-sky-500 to-sky-500 rounded-2xl p-4 inline-flex mb-6 shadow-lg">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 class="font-bold text-gray-800 mb-3 text-lg">Video Sessions</h4>
            <p class="text-sm text-gray-600">High-quality video calls with certified professionals</p>
          </div>

          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center card-hover shadow-lg">
            <div
              class="bg-gradient-to-r from-success to-emerald-500 rounded-2xl p-4 inline-flex mb-6 shadow-lg">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 class="font-bold text-gray-800 mb-3 text-lg">AI Diagnostics</h4>
            <p class="text-sm text-gray-600">Smart problem analysis and preliminary diagnosis</p>
          </div>

          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center card-hover shadow-lg">
            <div class="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl p-4 inline-flex mb-6 shadow-lg">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 class="font-bold text-gray-800 mb-3 text-lg">Digital Recommendations</h4>
            <p class="text-sm text-gray-600">Electronic recommendations sent directly to pharmacies</p>
          </div>

          <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 text-center card-hover shadow-lg">
            <div class="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-4 inline-flex mb-6 shadow-lg">
              <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h4 class="font-bold text-gray-800 mb-3 text-lg">Academic Performance</h4>
            <p class="text-sm text-gray-600">Track vitals and receive personalized academic perfornamce insights</p>
          </div>
        </div>

        <!-- Trust Indicators -->
        <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-8 mt-16">
          <h3 class="text-xl font-bold text-gray-800 mb-6 text-center">Trusted Education Technology</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div class="text-2xl font-bold text-sky-500 mb-1">24/7</div>
              <div class="text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-success mb-1">500+</div>
              <div class="text-sm text-gray-600">Certified Providers</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-emerald-500 mb-1">15min</div>
              <div class="text-sm text-gray-600">Average Wait Time</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-600 mb-1">FERPA</div>
              <div class="text-sm text-gray-600">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-base text-sky-500 font-semibold tracking-wide uppercase mb-2">How It Works</h2>
          <h3 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Simple Steps to Better Performance
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="bg-gradient-to-r from-sky-500 to-sky-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span class="text-white font-bold text-xl">1</span>
            </div>
            <h4 class="text-xl font-bold text-gray-800 mb-4">Choose a Provider</h4>
            <p class="text-gray-600">Browse our network of qualified professionals and select the right
              specialist for your needs.</p>
          </div>

          <div class="text-center">
            <div
              class="bg-gradient-to-r from-success to-emerald-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span class="text-white font-bold text-xl">2</span>
            </div>
            <h4 class="text-xl font-bold text-gray-800 mb-4">Book Appointment</h4>
            <p class="text-gray-600">Schedule your session at a convenient time that works for both you and your
              chosen provider.</p>
          </div>

          <div class="text-center">
            <div
              class="bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span class="text-white font-bold text-xl">3</span>
            </div>
            <h4 class="text-xl font-bold text-gray-800 mb-4">Get Treatment</h4>
            <p class="text-gray-600">Join your secure video session and receive professional care from the
              comfort of your home.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Call to Action Section -->
    <div class="py-20 element-gradient">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
          Ready to Experience the Future of Education?
        </h2>
        <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of clients who have already discovered the convenience and quality of online
          sessions.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <router-link to="/register"
            class="px-8 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-2xl hover:from-emerald-500 hover:to-sky-500 focus:ring-4 focus:ring-sky-500/30 transition-buttery shadow-lg glow-effect">
            Get Started Today
          </router-link>
          <router-link to="/providers"
            class="px-8 py-4 bg-white/90 backdrop-blur-sm text-sky-500 font-semibold rounded-2xl hover:bg-white focus:ring-4 focus:ring-sky-500/30 transition-buttery shadow-lg border-2 border-sky-500/20">
            Browse Providers
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const appTitle = import.meta.env.VITE_APP_TITLE
const appTitle1 = import.meta.env.VITE_APP_TITLE_1  
const appTitle2 = import.meta.env.VITE_APP_TITLE_2
const appTitle3 = import.meta.env.VITE_APP_TITLE_3
</script>

<style scoped>
.element-gradient {
  background: linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 25%, #f0f9ff 50%, #e0f2fe 75%, #f0f9ff 100%);
}

.pulse-animation {
  animation: pulse 3s linear infinite;
}

.float-element {
  animation: floatElement 4s linear infinite;
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

.glow-effect {
  box-shadow: 0 20px 40px rgba(14, 165, 233, 0.15);
}

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}
</style>