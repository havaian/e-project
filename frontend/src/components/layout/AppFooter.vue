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
              {{ appTitle1 }}<span
                class="bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent">{{ appTitle2 }}</span><span
                class="text-success">{{ appTitle3 }}</span>
            </span>
          </div>
          <p class="text-gray-400 mb-6 max-w-md">
            {{ appDescription }}
          </p>
          
          <!-- Contact Information -->
          <div class="space-y-3">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <a :href="`tel:${supportPhone}`" class="text-gray-300 hover:text-sky-500 transition-colors duration-200">
                {{ supportPhone }}
              </a>
            </div>
            
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <a :href="`mailto:${supportEmail}`" class="text-gray-300 hover:text-sky-500 transition-colors duration-200">
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
                Find Providers
              </router-link>
            </li>
            <li>
              <a :href="blogUrl" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Blog
              </a>
            </li>
            <li>
              <router-link to="/about" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                About Us
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
                Help Center
              </router-link>
            </li>
            <li>
              <router-link to="/faq" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                FAQ
              </router-link>
            </li>
            <li>
              <a :href="`mailto:${supportEmail}`" class="text-gray-400 hover:text-sky-500 transition-colors duration-200">
                Contact Support
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
            <a :href="privacyPolicyUrl" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-sky-500 text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <a :href="termsOfServiceUrl" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-sky-500 text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <a :href="ferpaComplianceUrl" target="_blank" rel="noopener noreferrer" class="text-gray-400 hover:text-sky-500 text-sm transition-colors duration-200">
              FERPA Compliance
            </a>
          </div>
        </div>
        
        <!-- Trust Badges -->
        <div class="flex items-center space-x-4 mt-4 md:mt-0">
          <div class="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
            <svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span class="text-xs text-gray-300">SSL Secured</span>
          </div>
          <div class="flex items-center space-x-2 bg-gray-800 rounded-lg px-3 py-2">
            <svg class="w-4 h-4 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span class="text-xs text-gray-300">FERPA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Import environment variables
const companyName = import.meta.env.VITE_COMPANY_NAME
const appTitle1 = import.meta.env.VITE_APP_TITLE_1
const appTitle2 = import.meta.env.VITE_APP_TITLE_2
const appTitle3 = import.meta.env.VITE_APP_TITLE_3
const appDescription = import.meta.env.VITE_APP_PAGE_DESC

// Contact information
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
const blogUrl = import.meta.env.VITE_BLOG_URL

// Legal pages URLs
const privacyPolicyUrl = import.meta.env.VITE_PRIVACY_POLICY_URL
const termsOfServiceUrl = import.meta.env.VITE_TERMS_OF_SERVICE_URL
const ferpaComplianceUrl = import.meta.env.VITE_FERPA_COMPLIANCE_URL
</script>