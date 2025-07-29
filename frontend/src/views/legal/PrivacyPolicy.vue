<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-white">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p class="text-lg text-gray-600">Last updated: {{ lastUpdated }}</p>
        <div class="w-24 h-1 bg-gradient-to-r from-sky-500 to-cyan-500 mx-auto mt-6"></div>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-xl shadow-lg p-8 md:p-12">
        <div class="prose prose-lg max-w-none">
          <p class="text-gray-700 leading-relaxed mb-8">
            At {{ companyName }}, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 class="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <p class="text-gray-700 mb-4">We may collect the following types of personal information:</p>
            <ul class="list-disc ml-6 text-gray-700 mb-6">
              <li>Name, email address, and phone number</li>
              <li>Professional credentials and licensing information (for providers)</li>
              <li>Educational institution information</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">Usage Information</h3>
            <p class="text-gray-700 mb-4">We automatically collect certain information about your use of our platform:</p>
            <ul class="list-disc ml-6 text-gray-700 mb-6">
              <li>Device information and IP address</li>
              <li>Browser type and version</li>
              <li>Usage patterns and preferences</li>
              <li>Session recordings for quality assurance (with consent)</li>
            </ul>

            <h3 class="text-xl font-semibold text-gray-800 mb-3">Educational Records</h3>
            <p class="text-gray-700 mb-6">
              In compliance with FERPA, we may collect and process educational records as necessary to provide our services. 
              All educational records are handled with the highest level of security and confidentiality.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p class="text-gray-700 mb-4">We use your information for the following purposes:</p>
            <ul class="list-disc ml-6 text-gray-700 mb-6">
              <li>Providing and maintaining our consultation services</li>
              <li>Processing payments and managing accounts</li>
              <li>Communicating with you about appointments and services</li>
              <li>Improving our platform and user experience</li>
              <li>Ensuring compliance with educational regulations</li>
              <li>Preventing fraud and enhancing security</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
            <p class="text-gray-700 mb-4">We do not sell, trade, or rent your personal information. We may share your information only in the following circumstances:</p>
            <ul class="list-disc ml-6 text-gray-700 mb-6">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations or court orders</li>
              <li>To protect our rights, property, or safety</li>
              <li>With service providers who assist us in operating our platform</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">FERPA Compliance</h2>
            <p class="text-gray-700 mb-6">
              We are committed to compliance with the Family Educational Rights and Privacy Act (FERPA). Educational records are:
            </p>
            <ul class="list-disc ml-6 text-gray-700 mb-6">
              <li>Kept strictly confidential</li>
              <li>Accessed only by authorized personnel</li>
              <li>Disclosed only with proper consent or legal authorization</li>
              <li>Stored using industry-standard security measures</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p class="text-gray-700 mb-6">
              We implement comprehensive security measures to protect your information, including encryption, 
              secure servers, regular security audits, and access controls. However, no method of transmission 
              over the internet is 100% secure.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p class="text-gray-700 mb-4">You have the right to:</p>
            <ul class="list-disc ml-6 text-gray-700 mb-6">
              <li>Access, update, or delete your personal information</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Restrict or object to certain processing activities</li>
              <li>File a complaint with regulatory authorities</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <p class="text-gray-700 mb-6">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and provide personalized content. You can control cookie settings through your browser preferences.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p class="text-gray-700 mb-6">
              We may update this Privacy Policy periodically. We will notify you of significant changes by 
              posting the updated policy on our platform and updating the "Last updated" date.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p class="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div class="bg-gray-50 rounded-lg p-6">
              <p class="text-gray-700 mb-2"><strong>Email:</strong> {{ supportEmail }}</p>
              <p class="text-gray-700 mb-2"><strong>Phone:</strong> {{ supportPhone }}</p>
              <p class="text-gray-700"><strong>Address:</strong> Y.TECH Privacy Office</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Environment variables
const companyName = import.meta.env.VITE_APP_COMPANY_NAME
const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
const supportPhone = import.meta.env.VITE_SUPPORT_PHONE

// Computed properties
const lastUpdated = computed(() => {
  return new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
})

// Meta tags
import { useHead } from '@unhead/vue'
useHead({
  title: `Privacy Policy | ${companyName}`,
  meta: [
    { name: 'description', content: 'Our privacy policy explains how we collect, use, and protect your personal information.' }
  ]
})
</script>