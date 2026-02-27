<!-- frontend/src/views/dashboard/ProviderEarnings.vue -->
<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="py-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-900">{{ $t('providerEarnings.title') }}</h1>
                            <p class="mt-1 text-sm text-gray-600">{{ $t('providerEarnings.subtitle') }}</p>
                        </div>
                        <div class="flex items-center space-x-3">
                            <router-link to="/profile/me/dashboard"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                                <ArrowLeftIcon class="w-4 h-4 mr-2" />
                                {{ $t('providerEarnings.backToDashboard') }}
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- Consultation earnings -->
                <div v-if="isConsultationsEnabled" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-600">{{ $t('providerEarnings.consultations')
                            }}</span>
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <CalendarDaysIcon class="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(summary.consultation?.currentMonth) }}
                    </p>
                    <div class="mt-1 flex items-center space-x-1">
                        <ArrowTrendingUpIcon v-if="(summary.consultation?.growth || 0) >= 0"
                            class="w-4 h-4 text-green-500" />
                        <ArrowTrendingDownIcon v-else class="w-4 h-4 text-red-500" />
                        <span class="text-xs"
                            :class="(summary.consultation?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                            {{ Math.abs(summary.consultation?.growth || 0).toFixed(1) }}% {{
                                $t('providerEarnings.vsLastMonth') }}
                        </span>
                    </div>
                </div>

                <!-- Course earnings -->
                <div v-if="isCoursesEnabled" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-600">{{ $t('providerEarnings.courses') }}</span>
                        <div class="p-2 bg-purple-100 rounded-lg">
                            <AcademicCapIcon class="w-5 h-5 text-purple-600" />
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(summary.course?.currentMonth) }}</p>
                    <div class="mt-1 flex items-center space-x-1">
                        <ArrowTrendingUpIcon v-if="(summary.course?.growth || 0) >= 0" class="w-4 h-4 text-green-500" />
                        <ArrowTrendingDownIcon v-else class="w-4 h-4 text-red-500" />
                        <span class="text-xs"
                            :class="(summary.course?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                            {{ Math.abs(summary.course?.growth || 0).toFixed(1) }}% {{
                                $t('providerEarnings.vsLastMonth') }}
                        </span>
                    </div>
                </div>

                <!-- Combined earnings -->
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-600">{{ $t('providerEarnings.totalThisMonth')
                            }}</span>
                        <div class="p-2 bg-green-100 rounded-lg">
                            <BanknotesIcon class="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(summary.combined?.currentMonth) }}</p>
                    <div class="mt-1 flex items-center space-x-1">
                        <ArrowTrendingUpIcon v-if="(summary.combined?.growth || 0) >= 0"
                            class="w-4 h-4 text-green-500" />
                        <ArrowTrendingDownIcon v-else class="w-4 h-4 text-red-500" />
                        <span class="text-xs"
                            :class="(summary.combined?.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'">
                            {{ Math.abs(summary.combined?.growth || 0).toFixed(1) }}% {{
                                $t('providerEarnings.vsLastMonth') }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Source Tabs + Period Selector -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="border-b border-gray-200 px-6 pt-4">
                    <div class="flex items-center justify-between">
                        <!-- Source Tabs -->
                        <div class="flex space-x-1">
                            <button v-for="tab in availableTabs" :key="tab.value" @click="activeSource = tab.value"
                                class="px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors duration-150 border-b-2 -mb-px"
                                :class="activeSource === tab.value
                                    ? 'text-sky-600 border-sky-500 bg-sky-50/50'
                                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'">
                                {{ tab.label }}
                            </button>
                        </div>

                        <!-- Period Selector -->
                        <div class="flex items-center space-x-2 pb-2">
                            <label class="text-sm text-gray-600">{{ $t('providerEarnings.period') }}:</label>
                            <select v-model="activePeriod"
                                class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-sky-500 focus:border-sky-500">
                                <option value="daily">{{ $t('providerEarnings.daily') }}</option>
                                <option value="weekly">{{ $t('providerEarnings.weekly') }}</option>
                                <option value="monthly">{{ $t('providerEarnings.monthly') }}</option>
                                <option value="yearly">{{ $t('providerEarnings.yearly') }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Chart Section -->
                <div class="p-6">
                    <EarningsChart :data="earningsData" :period="activePeriod" :loading="loadingEarnings" />
                </div>
            </div>

            <!-- Table Section -->
            <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                    <h2 class="text-lg font-semibold text-gray-900">{{ $t('providerEarnings.detailedBreakdown') }}</h2>
                </div>
                <EarningsTable :data="earningsData" :period="activePeriod" :loading="loadingEarnings" />
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    ArrowDownTrayIcon, ArrowLeftIcon, CalendarDaysIcon, AcademicCapIcon,
    BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon
} from '@heroicons/vue/24/outline'
import { ref, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useModules } from '@/composables/useModules'
import axios from '@/plugins/axios'
import EarningsChart from '@/components/provider/EarningsChart.vue'
import EarningsTable from '@/components/provider/EarningsTable.vue'

const { t, locale } = useI18n()
const { isConsultationsEnabled, isCoursesEnabled } = useModules()

// ── State ────────────────────────────────────────────────────────────────────
const activeSource = ref('all')
const activePeriod = ref('monthly')
const earningsData = ref([])
const summary = ref({
    consultation: { currentMonth: 0, growth: 0 },
    course: { currentMonth: 0, growth: 0 },
    combined: { currentMonth: 0, growth: 0 }
})
const loadingEarnings = ref(false)
const loadingSummary = ref(false)
const exporting = ref(false)

// ── Available tabs based on enabled modules ──────────────────────────────────
const availableTabs = computed(() => {
    const tabs = []

    // Show "All" tab only when both modules are enabled
    if (isConsultationsEnabled.value && isCoursesEnabled.value) {
        tabs.push({ value: 'all', label: t('earnings.sourceAll') })
    }

    if (isConsultationsEnabled.value) {
        tabs.push({ value: 'consultation', label: t('earnings.sourceConsultation') })
    }

    if (isCoursesEnabled.value) {
        tabs.push({ value: 'course', label: t('earnings.sourceCourse') })
    }

    return tabs
})

// ── Locale-aware currency ────────────────────────────────────────────────────
const intlLocale = computed(() => {
    const map = { en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ' }
    return map[locale.value] || 'en-US'
})

const formatCurrency = (amount) => {
    return new Intl.NumberFormat(intlLocale.value).format(amount || 0) + ' UZS'
}

// ── Data fetching ────────────────────────────────────────────────────────────
const fetchEarnings = async () => {
    try {
        loadingEarnings.value = true
        const response = await axios.get('/earnings', {
            params: {
                source: activeSource.value,
                period: activePeriod.value,
                limit: 12
            }
        })
        earningsData.value = response.data.earnings || []
    } catch (error) {
        console.error('Error fetching earnings:', error)
        earningsData.value = []
    } finally {
        loadingEarnings.value = false
    }
}

const fetchSummary = async () => {
    try {
        loadingSummary.value = true
        const response = await axios.get('/payments/my')
        summary.value = response.data.summary || {}
    } catch (error) {
        console.error('Error fetching earnings summary:', error)
    } finally {
        loadingSummary.value = false
    }
}
// ── Watchers ─────────────────────────────────────────────────────────────────
watch([activeSource, activePeriod], () => {
    fetchEarnings()
})

// ── Set default active source based on enabled modules ───────────────────────
const setDefaultSource = () => {
    if (isConsultationsEnabled.value && isCoursesEnabled.value) {
        activeSource.value = 'all'
    } else if (isConsultationsEnabled.value) {
        activeSource.value = 'consultation'
    } else if (isCoursesEnabled.value) {
        activeSource.value = 'course'
    }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
    setDefaultSource()
    fetchEarnings()
    fetchSummary()
})
</script>