<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-8">My Appointments</h1>

        <!-- Filters -->
        <div class="card-element p-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="form-group">
                    <label for="status" class="label">Filter by Status</label>
                    <select id="status" v-model="filters.status" class="input" @change="fetchAppointments">
                        <option value="">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                        <option value="no-show">No Show</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Appointments List -->
        <div class="space-y-6">
            <div v-if="loading" class="text-center py-12">
                <div
                    class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-1 border-t-transparent">
                </div>
                <p class="mt-4 text-gray-600">Loading your appointments...</p>
            </div>

            <template v-else>
                <div v-if="appointments.length === 0" class="text-center py-12">
                    <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <CalendarDaysIcon class="w-12 h-12" />
                    </div>
                    <p class="text-gray-600 text-lg">No appointments found</p>
                    <p class="text-gray-500 text-sm mt-1">Schedule an appointment to get started</p>
                </div>

                <div v-else class="space-y-4">
                    <div v-for="appointment in appointments" :key="appointment._id"
                        class="card-element overflow-hidden transition-buttery duration-300 hover:shadow-lg">
                        <div class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center space-x-4">
                                    <div class="relative">
                                        <img :src="`/api${appointment.provider.profilePicture} : /images/user-placeholder.jpg`"
                                            :alt="appointment.provider.firstName"
                                            class="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100" />
                                        <div class="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-400 border-2 border-white"
                                            v-if="appointment.status === 'scheduled'"></div>
                                    </div>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-900">
                                            {{ appointment.provider.firstName }} {{ appointment.provider.lastName }}
                                        </h3>
                                        <div class="mt-2 flex flex-wrap gap-2">
                                            <span v-for="spec in appointment.provider.specializations" :key="spec"
                                                class="status-info text-xs">
                                                {{ spec }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                        :class="{
                                            'bg-green-100 text-green-800': appointment.status === 'completed',
                                            'bg-blue-100 text-blue-800': appointment.status === 'scheduled',
                                            'bg-red-100 text-red-800': appointment.status === 'canceled' || appointment.status === 'no-show'
                                        }">
                                        {{ appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1) }}
                                    </span>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div class="flex items-center space-x-3">
                                    <div
                                        class="flex-shrink-0 w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center">
                                        <CalendarDaysIcon class="w-4 h-4 text-brand-1" />
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">Date & Time</p>
                                        <p class="font-medium text-gray-900">{{ formatDateTime(appointment.dateTime) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-3">
                                    <div
                                        class="flex-shrink-0 w-8 h-8 bg-brand-1/10 rounded-full flex items-center justify-center">
                                        <VideoCameraIcon class="w-4 h-4 text-brand-1" />
                                    </div>
                                    <div>
                                        <p class="text-sm text-gray-500">Session Type</p>
                                        <p class="font-medium text-gray-900">{{ appointment.type.charAt(0).toUpperCase()
                                            + appointment.type.slice(1) }}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end space-x-3">
                                <router-link :to="{ name: 'appointment-details', params: { id: appointment._id } }"
                                    class="btn-secondary">
                                    <EyeIcon class="w-4 h-4 mr-2" />
                                    View Details
                                </router-link>
                                <button v-if="appointment.status === 'scheduled'"
                                    class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
                                    @click="cancelAppointment(appointment._id)">
                                    <XMarkIcon class="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    v-if="appointment.status === 'scheduled' && isWithinJoinWindow(appointment.dateTime)"
                                    class="btn-primary">
                                    <VideoCameraIcon class="w-4 h-4 mr-2" />
                                    Join Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Enhanced Pagination -->
                <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
                    <button v-if="currentPage > 1" @click="handlePageChange(currentPage - 1)"
                        class="btn-secondary px-3 py-2">
                        <ChevronLeftIcon class="w-4 h-4" />
                    </button>

                    <div class="flex space-x-1">
                        <button v-for="page in totalPages" :key="page"
                            class="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                            :class="currentPage === page ? 'bg-brand-1 text-white' : 'text-gray-700 hover:bg-gray-100'"
                            @click="handlePageChange(page)">
                            {{ page }}
                        </button>
                    </div>

                    <button v-if="currentPage < totalPages" @click="handlePageChange(currentPage + 1)"
                        class="btn-secondary px-3 py-2">
                        <ChevronRightIcon class="w-4 h-4" />
                    </button>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { CalendarDaysIcon, VideoCameraIcon, EyeIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { format, parseISO, isWithinInterval, subMinutes, addMinutes } from 'date-fns'
import axios from '@/plugins/axios'

const router = useRouter()
const authStore = useAuthStore()

const appointments = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const filters = reactive({
    status: ''
})

const formatDateTime = (dateTime) => {
    return format(parseISO(dateTime), 'MMM d, yyyy h:mm a')
}

const isWithinJoinWindow = (dateTime) => {
    const appointmentTime = parseISO(dateTime)
    const now = new Date()
    return isWithinInterval(now, {
        start: subMinutes(appointmentTime, 5),
        end: addMinutes(appointmentTime, 30)
    })
}

async function fetchAppointments() {
    try {
        loading.value = true
        const params = {
            page: currentPage.value,
            limit: 10,
            ...filters
        }

        const response = await axios.get(`/appointments/client/${authStore.user._id}`, { params })
        appointments.value = response.data.appointments
        totalPages.value = Math.ceil(response.data.pagination.total / response.data.pagination.limit)
    } catch (error) {
        console.error('Error fetching appointments:', error)
    } finally {
        loading.value = false
    }
}

async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    try {
        await axios.patch(`/appointments/${appointmentId}/status`, {
            status: 'canceled'
        })
        await fetchAppointments()
    } catch (error) {
        console.error('Error canceling appointment:', error)
    }
}

async function joinSession(appointmentId) {
    try {
        const response = await axios.get(`/sessions/${appointmentId}/join`)
        if (response.data.session) {
            router.push({
                name: 'session-room',
                params: { appointmentId }
            })
        }
    } catch (error) {
        console.error('Error joining session:', error)
    }
}

function handlePageChange(page) {
    currentPage.value = page
    fetchAppointments()
}

onMounted(() => {
    fetchAppointments()
})
</script>