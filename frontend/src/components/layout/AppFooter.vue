<template>
  <footer class="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo and Description -->
        <div class="col-span-1 md:col-span-2">
          <div class="flex items-center space-x-3 mb-6">
            <div class="rounded-xl shadow-lg">
              <img src="/images/logo.svg" :alt="`${appTitle} Logo`" width="40" height="40" class="w-10 h-10" />
            </div>
            <span class="text-xl font-bold">
              {{ appTitle1 }}<span class="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">{{
                appTitle2 }}</span><span class="text-success">{{ appTitle3 }}</span>
            </span>
          </div>
          <p class="text-gray-400 mb-6 max-w-md">
            {{ appDescription }}
          </p>

          <!-- Contact Information -->
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <PhoneIcon class="w-5 h-5 text-sky-500" />
              <a :href="`tel:${supportPhone}`" class="text-gray-300 hover:text-sky-500 transition-colors duration-200">
                {{ supportPhone }}
              </a>
            </div>

            <div class="flex items-center space-x-3">
              <EnvelopeIcon class="w-5 h-5 text-sky-500" />
              <a :href="`mailto:${supportEmail}`"
                class="text-gray-300 hover:text-sky-500 transition-colors duration-200">
                {{ supportEmail }}
              </a>
            </div>

            <div class="pt-2">
              <p class="text-sm text-gray-400">Available</p>
              <p class="text-white font-medium">24/7 Support</p>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="col-span-1">
          <h3 class="text-lg font-semibold mb-4 text-white">Quick Links</h3>
          <ul class="space-y-3">
            <li>
              <router-link to="/providers" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Find providers
              </router-link>
            </li>
            <li>
              <a :href="blogUrl" target="_blank" rel="noopener noreferrer"
                class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Blog
              </a>
            </li>
            <li>
              <router-link to="/about" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                About us
              </router-link>
            </li>
            <li>
              <router-link to="/contact" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Contact
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div class="col-span-1">
          <h3 class="text-lg font-semibold mb-4 text-white">Support</h3>
          <ul class="space-y-3">
            <li>
              <router-link to="/help" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Help center
              </router-link>
            </li>
            <li>
              <router-link to="/faq" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                FAQ
              </router-link>
            </li>
            <li>
              <a :href="`mailto:${supportEmail}`"
                class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Contact support
              </a>
            </li>
            <li>
              <router-link to="/accessibility" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Accessibility
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
        <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <p class="text-gray-400 text-sm">
            © {{ new Date().getFullYear() }} {{ companyName }}. All rights reserved.
          </p>
          <div class="flex space-x-6">
            <router-link to="/privacy" class="text-gray-400 hover:text-sky-500 text-sm transition-colors duration-200">
              Privacy Policy
            </router-link>
            <router-link to="/public-offer"
              class="text-gray-400 hover:text-sky-500 text-sm transition-colors duration-200">
              Public Offer
            </router-link>
          </div>
        </div>

        <!-- Trust Badges -->
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <div class="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
            <CheckBadgeIcon class="w-4 h-4 text-success" />
            <span class="text-xs text-gray-300">SSL Secured</span>
          </div>
          <div class="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
            <ShieldCheckIcon class="w-4 h-4 text-sky-500" />
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { PhoneIcon, EnvelopeIcon, CheckBadgeIcon, ShieldCheckIcon } from "@heroicons/vue/24/outline";
// Import environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME
const appTitle1 = import.meta.env.VITE_APP_TITLE_1
const appTitle2 = import.meta.env.VITE_APP_TITLE_2
const appTitle3 = import.meta.env.VITE_APP_TITLE_3
const appDescription = import.meta.env.VITE_APP_PAGE_DESC

// Contact information
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
const blogUrl = import.meta.env.VITE_BLOG_URL
</script>