<template>
    <div>
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!tableData || tableData.length === 0" class="text-center py-12">
            <DocumentChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No earnings data</h3>
            <p class="text-gray-500">Start completing appointments to see detailed earnings here.</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Appointments
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Earnings
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Platform Fee
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Earnings
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Completion Rate
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Growth
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

                            <!-- Appointments -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex flex-col">
                                    <div class="text-sm font-medium text-gray-900">
                                        {{ row.totalAppointments }}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                        {{ row.completedAppointments }} completed
                                    </div>
                                </div>
                            </td>

                            <!-- Total Earnings -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">
                                    {{ formatCurrency(row.totalEarnings) }}
                                </div>
                            </td>

                            <!-- Platform Fee -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-red-600">
                                    -{{ formatCurrency(row.platformFee) }}
                                </div>
                            </td>

                            <!-- Net Earnings -->
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-green-600">
                                    {{ formatCurrency(row.netEarnings) }}
                                </div>
                            </td>

                            <!-- Completion Rate -->
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
                                    <ArrowTrendingUpIcon v-if="row.growthPercentage >= 0" class="w-4 h-4 text-green-500" />
                                    <TrendingDownIcon v-else class="w-4 h-4 text-red-500" />
                                    <span class="text-sm font-medium"
                                        :class="row.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'">
                                        {{ Math.abs(row.growthPercentage).toFixed(1) }}%
                                    </span>
                                </div>
                                <div v-else class="text-sm text-gray-400">
                                    N/A
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
                        <span class="text-gray-600">Total Periods:</span>
                        <span class="font-medium text-gray-900 ml-2">{{ tableData.length }}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Total Appointments:</span>
                        <span class="font-medium text-gray-900 ml-2">{{ totalAppointments }}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Total Earnings:</span>
                        <span class="font-medium text-gray-900 ml-2">{{ formatCurrency(totalEarnings) }}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Average per Period:</span>
                        <span class="font-medium text-gray-900 ml-2">{{ formatCurrency(averageEarnings) }}</span>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="tableData.length >= 10"
                class="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                <div class="text-sm text-gray-700">
                    Showing <span class="font-medium">{{ Math.min(tableData.length, 10) }}</span> of
                    <span class="font-medium">{{ tableData.length }}</span> periods
                </div>
                <div class="text-sm text-gray-500">
                    <!-- Could add pagination controls here if needed -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { DocumentChartBarIcon, ArrowTrendingUpIcon, TrendingDownIcon } from "@heroicons/vue/24/outline";
import { computed } from 'vue'

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

// Process data for table
const tableData = computed(() => {
    if (!props.data || props.data.length === 0) return []

    return props.data.map((item, index) => {
        const periodLabel = getPeriodLabel(item)
        const dateRange = getDateRange(item)
        const completionRate = item.totalAppointments > 0
            ? Math.round((item.completedAppointments / item.totalAppointments) * 100)
            : 0

        // Calculate growth compared to previous period
        let growthPercentage = null
        if (index < props.data.length - 1) {
            const previousItem = props.data[index + 1]
            if (previousItem.totalEarnings > 0) {
                growthPercentage = ((item.totalEarnings - previousItem.totalEarnings) / previousItem.totalEarnings) * 100
            }
        }

        return {
            ...item,
            periodLabel,
            dateRange,
            completionRate,
            growthPercentage
        }
    })
})

// Helper functions
const getPeriodLabel = (item) => {
    if (props.period === 'monthly') {
        const date = new Date(item.year, item.month - 1)
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (props.period === 'weekly') {
        return `Week ${item.week}`
    } else {
        const date = new Date(item.year, item.month - 1, item.day)
        return date.toLocaleDateString('en-US', {
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
        return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
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
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS'
}

// Computed totals
const totalAppointments = computed(() => {
    return tableData.value.reduce((sum, item) => sum + item.totalAppointments, 0)
})

const totalEarnings = computed(() => {
    return tableData.value.reduce((sum, item) => sum + item.totalEarnings, 0)
})

const averageEarnings = computed(() => {
    if (tableData.value.length === 0) return 0
    return totalEarnings.value / tableData.value.length
})
</script>