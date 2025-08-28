<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent">
      </div>
      <p class="mt-2 text-gray-600">Loading your profile...</p>
    </div>

    <template v-else-if="user">
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <!-- Profile Header -->
        <div class="p-6 sm:p-8 border-b border-gray-200">
          <div class="flex flex-col sm:flex-row items-center justify-between">
            <div class="flex flex-col sm:flex-row items-center">
              <img :src="user.profilePicture || '/images/user-placeholder.jpg'" :alt="user.firstName"
                class="h-32 w-32 rounded-full object-cover" />
              <div class="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ user.firstName }} {{ user.lastName }}
                </h1>
                <p class="text-gray-600">Provider</p>

                <!-- Status Indicators -->
                <div class="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span v-if="user.isVerified"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verified Provider
                  </span>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {{ completedAppointments }} Completed Sessions
                  </span>
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    {{ user.clients?.length || 0 }} Clients
                  </span>
                </div>
              </div>
            </div>
            <div class="mt-4 sm:mt-0 flex gap-2">
              <router-link to="/profile/edit"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </router-link>
              <router-link to="/profile/provider/dashboard"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </router-link>
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="p-6 sm:p-8">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Left Column -->
            <div class="lg:col-span-2 space-y-8">

              <!-- Personal Information -->
              <div class="bg-gray-50 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Personal Information
                </h2>
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Email</dt>
                    <dd class="mt-1 text-gray-900">{{ user.email }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Phone</dt>
                    <dd class="mt-1 text-gray-900">{{ user.phone }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">Member Since</dt>
                    <dd class="mt-1 text-gray-900">{{ formatDate(user.createdAt) }}</dd>
                  </div>
                  <div v-if="user.emergencyContact?.name">
                    <dt class="text-sm font-medium text-gray-500">Emergency Contact</dt>
                    <dd class="mt-1 text-gray-900">
                      {{ user.emergencyContact.name }}
                      <span class="text-gray-500">({{ user.emergencyContact.relationship }})</span>
                      <br>
                      <span class="text-sm text-gray-600">{{ user.emergencyContact.phone }}</span>
                    </dd>
                  </div>
                </dl>
              </div>

              <!-- Specializations -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Specializations
                </h2>
                <div v-if="user.specializations?.length > 0" class="flex flex-wrap gap-2">
                  <span v-for="spec in user.specializations" :key="spec"
                    class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {{ spec }}
                  </span>
                </div>
                <div v-else class="text-gray-500">No specializations listed</div>
              </div>

              <!-- Education -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Education
                </h2>
                <div v-if="user.education?.length > 0" class="space-y-4">
                  <div v-for="edu in user.education" :key="`${edu.degree}-${edu.institution}`"
                    class="border-l-4 border-green-200 pl-4">
                    <h3 class="font-medium text-gray-900">{{ edu.degree }}</h3>
                    <p class="text-gray-600">{{ edu.institution }}</p>
                    <p class="text-sm text-gray-500">{{ edu.year }}</p>
                  </div>
                </div>
                <div v-else class="text-gray-500">No education information provided</div>
              </div>

              <!-- Experience & Languages -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Experience -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V9a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                    </svg>
                    Experience
                  </h2>
                  <div class="text-center p-4">
                    <div class="text-3xl font-bold text-orange-600">{{ user.experience || 0 }}</div>
                    <div class="text-sm text-gray-600">Years of Experience</div>
                  </div>
                </div>

                <!-- Languages (Языки) -->
                <div class="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Languages
                  </h2>
                  <div v-if="user.languages?.length > 0" class="flex flex-wrap gap-2">
                    <span v-for="language in user.languages" :key="language"
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      {{ language }}
                    </span>
                  </div>
                  <div v-else class="text-gray-500 text-sm">No languages specified</div>
                </div>
              </div>

              <!-- Clients -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                  <div class="flex items-center">
                    <svg class="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    Clients
                  </div>
                  <button @click="showAddClientModal = true"
                    class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    Add Client
                  </button>
                </h2>

                <div v-if="clients.length > 0" class="space-y-3">
                  <div v-for="client in clients" :key="client._id"
                    class="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div class="flex items-center space-x-3">
                      <img :src="client.profilePicture || '/images/user-placeholder.jpg'" :alt="client.firstName"
                        class="h-10 w-10 rounded-full object-cover">
                      <div>
                        <p class="font-medium text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
                        <p class="text-sm text-gray-600">{{ client.email }}</p>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <router-link :to="`/users/${client._id}`" class="text-sm text-indigo-600 hover:text-indigo-700">
                        View Profile
                      </router-link>
                      <button @click="removeClient(client._id)" class="text-sm text-red-600 hover:text-red-700">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-8">
                  <svg class="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  <p class="text-gray-500">No clients yet</p>
                  <button @click="showAddClientModal = true"
                    class="inline-flex items-center mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Add Your First Client
                    <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Appointments & Consultations -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Appointments & Consultations
                </h2>

                <!-- Appointment Stats -->
                <div class="grid grid-cols-4 gap-4 mb-6">
                  <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-2xl font-bold text-blue-600">{{ appointmentStats.total }}</div>
                    <div class="text-sm text-blue-600">Total</div>
                  </div>
                  <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-2xl font-bold text-green-600">{{ appointmentStats.completed }}</div>
                    <div class="text-sm text-green-600">Completed</div>
                  </div>
                  <div class="text-center p-4 bg-orange-50 rounded-lg">
                    <div class="text-2xl font-bold text-orange-600">{{ appointmentStats.upcoming }}</div>
                    <div class="text-sm text-orange-600">Upcoming</div>
                  </div>
                  <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-2xl font-bold text-purple-600">{{ appointmentStats.pending }}</div>
                    <div class="text-sm text-purple-600">Pending</div>
                  </div>
                </div>

                <!-- Recent Appointments -->
                <div v-if="recentAppointments.length > 0" class="space-y-3">
                  <h3 class="text-sm font-medium text-gray-700 mb-3">Recent Appointments</h3>
                  <div v-for="appointment in recentAppointments" :key="appointment._id"
                    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div :class="getStatusBadgeClass(appointment.status)" class="w-3 h-3 rounded-full"></div>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">
                          {{ appointment.client?.firstName }} {{ appointment.client?.lastName }}
                        </p>
                        <p class="text-sm text-gray-600">
                          {{ formatDateTime(appointment.dateTime) }}
                        </p>
                        <p class="text-xs text-gray-500 capitalize">{{ appointment.status }}</p>
                      </div>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-medium text-gray-900">{{ appointment.type }}</p>
                      <router-link :to="`/appointments/${appointment._id}`"
                        class="text-xs text-indigo-600 hover:text-indigo-700">
                        View Details
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-8">
              <!-- Session Settings Card (NEW - Add this BEFORE existing Consultation Fee card) -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Session Settings
                </h2>

                <div class="space-y-4">
                  <!-- Session Duration Highlight -->
                  <div class="text-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div class="text-3xl font-bold text-indigo-600">{{ formatSessionDuration }}</div>
                    <div class="text-sm text-indigo-700 font-medium">Session Duration</div>
                    <div class="text-xs text-indigo-600 mt-1">per appointment</div>
                  </div>

                  <!-- Quick Session Info -->
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div class="text-center p-3 bg-blue-50 rounded-lg">
                      <div class="font-semibold text-blue-900">{{ formatSessionFee }}</div>
                      <div class="text-blue-600 text-xs">Fee per session</div>
                    </div>
                    <div class="text-center p-3 bg-green-50 rounded-lg">
                      <div class="font-semibold text-green-900">{{ Math.ceil(60 / (user.sessionDuration || 60)) }}</div>
                      <div class="text-green-600 text-xs">sessions/hour max</div>
                    </div>
                  </div>

                  <!-- Edit Link -->
                  <div class="text-center pt-2">
                    <router-link to="/profile/edit" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                      Update Session Settings →
                    </router-link>
                  </div>
                </div>
              </div>

              <!-- Consultation Fee -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Consultation Fee
                </h2>
                <div class="text-center p-4">
                  <div class="text-3xl font-bold text-green-600">{{ formatSessionFee }}</div>
                  <div class="text-lg font-medium text-gray-700 mt-1">per {{ formatSessionDuration }}</div>

                  <!-- Additional session info -->
                  <div class="mt-4 pt-4 border-t border-gray-200">
                    <div class="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{{ formatSessionDuration }} sessions</span>
                      </div>
                      <div class="flex items-center">
                        <svg class="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Professional quality</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Earnings -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                  Earnings Overview
                </h2>

                <div class="space-y-4">
                  <div class="bg-emerald-50 p-4 rounded-lg">
                    <div class="text-2xl font-bold text-emerald-600">{{ formatCurrency(earnings.thisMonth) }}</div>
                    <div class="text-sm text-emerald-600">This Month</div>
                  </div>
                  <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-xl font-bold text-gray-600">{{ formatCurrency(earnings.total) }}</div>
                    <div class="text-sm text-gray-600">Total Earnings</div>
                  </div>
                </div>

                <div class="mt-4 text-center">
                  <router-link to="/profile/provider/dashboard"
                    class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View Detailed Earnings →
                  </router-link>
                </div>
              </div>

              <!-- Achievements -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Achievements
                </h2>

                <!-- Achievement Progress -->
                <div class="mb-4">
                  <div class="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{{ earnedAchievements.length }}/{{ totalAchievements }}</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: achievementProgress + '%' }"></div>
                  </div>
                </div>

                <!-- Recent Earned Achievements -->
                <div v-if="earnedAchievements.length > 0" class="space-y-3 mb-4">
                  <h3 class="text-sm font-medium text-gray-700">Recent Achievements</h3>
                  <div v-for="achievement in earnedAchievements.slice(0, 3)" :key="achievement.id"
                    class="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900">{{ achievement.name }}</p>
                      <p class="text-xs text-gray-600">{{ achievement.description }}</p>
                    </div>
                  </div>
                </div>

                <!-- Next Achievement -->
                <div v-if="unearnedAchievements.length > 0" class="space-y-3">
                  <h3 class="text-sm font-medium text-gray-700">Next Goal</h3>
                  <div class="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div class="flex-shrink-0">
                      <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-700">{{ unearnedAchievements[0].name }}</p>
                      <p class="text-xs text-gray-500">{{ unearnedAchievements[0].requirements }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 text-center">
                  <button @click="showAllAchievements = !showAllAchievements"
                    class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    {{ showAllAchievements ? 'Hide' : 'View All' }} Achievements
                  </button>
                </div>
              </div>

              <!-- Reviews -->
              <div class="bg-white border border-gray-200 rounded-xl p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Reviews Received
                </h2>

                <!-- Rating Summary -->
                <div v-if="reviewStats.average > 0" class="mb-4 p-4 bg-purple-50 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="flex items-center">
                        <div class="flex">
                          <svg v-for="i in 5" :key="i"
                            :class="i <= Math.round(reviewStats.average) ? 'text-yellow-400' : 'text-gray-300'"
                            class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span class="ml-2 text-sm font-medium text-gray-900">{{ reviewStats.average.toFixed(1) }}</span>
                      </div>
                      <p class="text-sm text-gray-600">{{ reviewStats.total }} reviews</p>
                    </div>
                  </div>
                </div>

                <!-- Recent Reviews -->
                <div v-if="reviews.length > 0" class="space-y-4">
                  <h3 class="text-sm font-medium text-gray-700">Recent Reviews</h3>
                  <div v-for="review in reviews.slice(0, 2)" :key="review._id"
                    class="border-l-4 border-purple-200 pl-4">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center space-x-2">
                        <div class="flex">
                          <svg v-for="i in 5" :key="i" :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                            class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <span class="text-sm text-gray-600">{{ formatDate(review.createdAt) }}</span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-900 mb-2">{{ review.comment }}</p>
                    <p class="text-xs text-gray-500">
                      By {{ review.client?.firstName }} {{ review.client?.lastName }}
                    </p>
                  </div>

                  <div class="text-center">
                    <router-link :to="`/reviews/provider/${user._id}`"
                      class="text-purple-600 hover:text-purple-700 text-sm font-medium">
                      View All Reviews →
                    </router-link>
                  </div>
                </div>

                <div v-else class="text-center py-4">
                  <svg class="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <p class="text-gray-500 text-sm">No reviews yet</p>
                  <p class="text-gray-400 text-xs mt-1">Reviews will appear here after completing appointments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- Add Client Modal -->
  <div v-if="showAddClientModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg font-medium text-gray-900">Add Client</h3>
        <div class="mt-2 px-7 py-3">
          <input v-model="newClientEmail" type="email" placeholder="Client's email address"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div class="flex justify-center space-x-4 px-4 py-3">
          <button @click="addClient"
            class="px-4 py-2 bg-indigo-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Add Client
          </button>
          <button @click="showAddClientModal = false"
            class="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const authStore = useAuthStore()

// Reactive data
const user = ref(null)
const clients = ref([])
const recentAppointments = ref([])
const appointmentStats = ref({
  total: 0,
  completed: 0,
  upcoming: 0,
  pending: 0
})
const earnings = ref({
  thisMonth: 0,
  total: 0
})
const achievements = ref([])
const reviews = ref([])
const reviewStats = ref({
  average: 0,
  total: 0
})
const loading = ref(true)
const showAllAchievements = ref(false)
const showAddClientModal = ref(false)
const newClientEmail = ref('')

// Computed properties
const completedAppointments = computed(() => appointmentStats.value.completed)

const earnedAchievements = computed(() =>
  achievements.value.filter(a => a.isEarned)
)

const unearnedAchievements = computed(() =>
  achievements.value.filter(a => !a.isEarned)
)

const totalAchievements = computed(() => achievements.value.length)

const achievementProgress = computed(() => {
  if (totalAchievements.value === 0) return 0
  return Math.round((earnedAchievements.value.length / totalAchievements.value) * 100)
})

const formatSessionFee = computed(() => {
  if (!user.value?.sessionFee) return 'Not Set'
  return `${user.value.sessionFee.toLocaleString()} UZS`
})

// Methods
const formatSessionDuration = computed(() => {
  const duration = user.value?.sessionDuration || 60
  if (duration >= 60) {
    const hours = Math.floor(duration / 60)
    const mins = duration % 60
    if (mins === 0) {
      return `${hours}h`
    }
    return `${hours}h ${mins}m`
  }
  return `${duration}min`
})

const fetchUserProfile = async () => {
  try {
    const response = await axios.get('/users/me')
    user.value = response.data
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
}

const fetchClients = async () => {
  try {
    const response = await axios.get('/users/clients')
    clients.value = response.data.clients || []
  } catch (error) {
    console.error('Error fetching clients:', error)
    clients.value = []
  }
}

const fetchAppointments = async () => {
  try {
    const response = await axios.get(`/appointments/provider/${authStore.user._id}`)
    const appointments = response.data.appointments || []

    // Calculate stats
    appointmentStats.value = {
      total: appointments.length,
      completed: appointments.filter(a => a.status === 'completed').length,
      upcoming: appointments.filter(a =>
        a.status === 'scheduled' && new Date(a.dateTime) > new Date()
      ).length,
      pending: appointments.filter(a => a.status === 'pending').length
    }

    // Get recent appointments (last 5)
    recentAppointments.value = appointments
      .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      .slice(0, 5)
  } catch (error) {
    console.error('Error fetching appointments:', error)
  }
}

const fetchEarnings = async () => {
  try {
    const response = await axios.get('/users/providers/dashboard/earnings')
    const earningsData = response.data.earnings || []

    // Calculate totals
    const now = new Date()
    const thisMonth = earningsData.filter(e =>
      e.year === now.getFullYear() && e.month === now.getMonth() + 1
    )

    earnings.value = {
      thisMonth: thisMonth.reduce((sum, e) => sum + e.netEarnings, 0),
      total: earningsData.reduce((sum, e) => sum + e.netEarnings, 0)
    }
  } catch (error) {
    console.error('Error fetching earnings:', error)
  }
}

const fetchAchievements = async () => {
  try {
    const response = await axios.get('/users/achievements')
    achievements.value = response.data.achievements?.all || []
  } catch (error) {
    console.error('Error fetching achievements:', error)
    achievements.value = []
  }
}

const fetchReviews = async () => {
  try {
    const response = await axios.get(`/reviews/provider/${authStore.user._id}`)
    reviews.value = response.data.reviews || []
    reviewStats.value = response.data.statistics || { average: 0, total: 0 }
  } catch (error) {
    console.error('Error fetching reviews:', error)
    reviews.value = []
  }
}

const addClient = async () => {
  try {
    if (!newClientEmail.value) return

    // First, find the client by email
    const searchResponse = await axios.get(`/users/search?email=${newClientEmail.value}`)
    const client = searchResponse.data.user

    if (!client) {
      alert('Client not found with this email address')
      return
    }

    // Add client
    await axios.post('/users/clients', { clientId: client._id })

    // Refresh clients list
    await fetchClients()

    // Close modal
    showAddClientModal.value = false
    newClientEmail.value = ''
  } catch (error) {
    console.error('Error adding client:', error)
    alert('Error adding client. Please try again.')
  }
}

const removeClient = async (clientId) => {
  try {
    if (!confirm('Are you sure you want to remove this client?')) return

    await axios.delete(`/users/clients/${clientId}`)

    // Refresh clients list
    await fetchClients()
  } catch (error) {
    console.error('Error removing client:', error)
  }
}

// Utility functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  if (!amount) return '0 UZS'
  return `${amount.toLocaleString()} UZS`
}

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'completed': 'bg-green-500',
    'scheduled': 'bg-blue-500',
    'canceled': 'bg-red-500',
    'pending': 'bg-yellow-500'
  }
  return statusClasses[status] || 'bg-gray-500'
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchUserProfile(),
      fetchClients(),
      fetchAppointments(),
      fetchEarnings(),
      fetchAchievements(),
      fetchReviews()
    ])
  } catch (error) {
    console.error('Error loading profile data:', error)
  } finally {
    loading.value = false
  }
})
</script>