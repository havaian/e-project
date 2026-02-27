<!-- frontend/src/components/provider/EarningsTable.vue -->
<template>
    <div>
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!tableData || tableData.length === 0" class="text-center py-12">
            <DocumentChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('earnings.noTableData') }}</h3>
            <p class="text-gray-500">{{ $t('earnings.noTableDataDescription') }}</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.period') }}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.transactions') }}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.totalEarnings') }}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.platformFee') }}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.netEarnings') }}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.completionRate') }}
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {{ $t('earnings.growth') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="(row, index) in tableData" :key="index" class="hover:bg-gray-50 transition-colors">
                            <!-- Period -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex flex-col">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ row.periodLabel }}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        {{ row.dateRange }}
                                    </div>
                                </div>
                            </td>

                            <!-- Transactions -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex flex-col">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ row.totalTransactions }}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        {{ row.completedTransactions }} {{ $t('earnings.completed') }}
                                    </div>
                                </div>
                            </td>

                            <!-- Total earnings -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    {{ formatCurrency(row.totalEarnings) }}
                                </div>
                            </td>

                            <!-- Platform fee -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-red-600">
                                    -{{ formatCurrency(row.platformFee) }}
                                </div>
                            </td>

                            <!-- Net earnings -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-green-600">
                                    {{ formatCurrency(row.netEarnings) }}
                                </div>
                            </td>

                            <!-- Completion rate -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-1">
                                        <div class="text-sm font-medium text-gray-900">
                                            {{ row.completionRate }}%
                                        </div>
                                        <div class="w-16 bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div class="h-1.5 rounded-full transition-all duration-300"
                                                :class="getCompletionRateColor(row.completionRate)"
                                                :style="{ width: `${Math.min(row.completionRate, 100)}%` }"></div>
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Growth -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div v-if="row.growthPercentage !== null" class="flex items-center space-x-1">
                                    <ArrowTrendingUpIcon v-if="row.growthPercentage >= 0"
                                        class="w-4 h-4 text-green-500" />
                                    <ArrowTrendingDownIcon v-else class="w-4 h-4 text-red-500" />
                                    <span class="text-sm font-medium"
                                        :class="row.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'">
                                        {{ Math.abs(row.growthPercentage).toFixed(1) }}%
                                    </span>
                                </div>
                                <div v-else class="text-sm text-gray-400">
                                    {{ $t('earnings.notAvailable') }}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Table Footer with Totals -->
            <div v-if="tableData.length > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">{{ $t('earnings.totalPeriods') }}</span>
                        <span class="font-medium text-gray-900 ml-2">{{ tableData.length }}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">{{ $t('earnings.totalTransactions') }}</span>
                        <span class="font-medium text-gray-900 ml-2">{{ totalTransactions }}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">{{ $t('earnings.totalEarnings') }}:</span>
                        <span class="font-medium text-gray-900 ml-2">{{ formatCurrency(totalEarnings) }}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">{{ $t('earnings.averagePerPeriod') }}</span>
                        <span class="font-medium text-gray-900 ml-2">{{ formatCurrency(averageEarnings) }}</span>
                    </div>
                </div>
            </div>

            <!-- Pagination hint -->
            <div v-if="tableData.length >= 10"
                class="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    {{ $t('earnings.showing', { shown: Math.min(tableData.length, 10), total: tableData.length }) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { DocumentChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/vue/24/outline";
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const props = defineProps({
    data: {
        type: Array,
        default: () => []
    },
    period: {
        type: String,
        default: 'monthly'
    },
    loading: {
        type: Boolean,
        default: false
    }
})

// ── Locale mapping ───────────────────────────────────────────────────────────
const intlLocale = computed(() => {
    const map = { en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ' }
    return map[locale.value] || 'en-US'
})

// ── Process data for table ───────────────────────────────────────────────────
const tableData = computed(() => {
    if (!props.data || props.data.length === 0) return []

    return props.data.map((item, index) => {
        const periodLabel = getPeriodLabel(item)
        const dateRange = getDateRange(item)

        // Use generic transaction fields, with fallback to old appointment fields
        const totalTx = item.totalTransactions ?? item.totalAppointments ?? 0
        const completedTx = item.completedTransactions ?? item.completedAppointments ?? 0

        const completionRate = totalTx > 0
            ? Math.round((completedTx / totalTx) * 100)
            : 0

        // Growth compared to previous period in the array
        let growthPercentage = null
        if (index < props.data.length - 1) {
            const previousItem = props.data[index + 1]
            const prevEarnings = previousItem.totalEarnings || 0
            if (prevEarnings > 0) {
                growthPercentage = ((item.totalEarnings - prevEarnings) / prevEarnings) * 100
            }
        }

        return {
            ...item,
            totalTransactions: totalTx,
            completedTransactions: completedTx,
            periodLabel,
            dateRange,
            completionRate,
            growthPercentage
        }
    })
})

// ── Helper functions ─────────────────────────────────────────────────────────
const getPeriodLabel = (item) => {
    if (props.period === 'monthly') {
        const date = new Date(item.year, item.month - 1)
        return date.toLocaleDateString(intlLocale.value, { month: 'long', year: 'numeric' })
    } else if (props.period === 'weekly') {
        return `${t('earnings.week')} ${item.week}`
    } else {
        const date = new Date(item.year, item.month - 1, item.day)
        return date.toLocaleDateString(intlLocale.value, {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        })
    }
}

const getDateRange = (item) => {
    if (props.period === 'monthly') {
        const startDate = new Date(item.year, item.month - 1, 1)
        const endDate = new Date(item.year, item.month, 0)
        const opts = { month: 'short', day: 'numeric' }
        return `${startDate.toLocaleDateString(intlLocale.value, opts)} – ${endDate.toLocaleDateString(intlLocale.value, opts)}`
    } else if (props.period === 'weekly') {
        return `${item.year}`
    } else {
        return `${item.year}`
    }
}

const getCompletionRateColor = (rate) => {
    if (rate >= 90) return 'bg-green-500'
    if (rate >= 75) return 'bg-yellow-500'
    if (rate >= 50) return 'bg-orange-500'
    return 'bg-red-500'
}

const formatCurrency = (amount) => {
    return new Intl.NumberFormat(intlLocale.value).format(amount || 0) + ' UZS'
}

// ── Computed totals ──────────────────────────────────────────────────────────
const totalTransactions = computed(() => {
    return tableData.value.reduce((sum, item) => sum + item.totalTransactions, 0)
})

const totalEarnings = computed(() => {
    return tableData.value.reduce((sum, item) => sum + (item.totalEarnings || 0), 0)
})

const averageEarnings = computed(() => {
    if (tableData.value.length === 0) return 0
    return totalEarnings.value / tableData.value.length
})
</script>