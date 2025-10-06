<template>
    <div class="w-full">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-80">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!chartData || chartData.length === 0"
            class="flex flex-col items-center justify-center h-80 text-gray-500">
            <ChartBarIcon class="w-16 h-16 mb-4" />
            <h3 class="text-lg font-medium mb-2">No earnings data available</h3>
            <p class="text-sm">Complete some appointments to see your earnings here.</p>
        </div>

        <!-- Chart -->
        <div v-else class="w-full h-80">
            <LineChart :data="chartData" :options="chartOptions" :width="800" :height="320" />
        </div>

        <!-- Summary Stats -->
        <div v-if="chartData && chartData.length > 0" class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600">Total earnings</p>
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(totalEarnings) }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600">Average per {{ period === 'monthly' ? 'Month' : period === 'weekly' ?
                    'Week' : 'Day' }}</p>
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(averageEarnings) }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600">Best {{ period === 'monthly' ? 'Month' : period === 'weekly' ? 'Week' :
                    'Day' }}</p>
                <p class="text-lg font-bold text-gray-900">{{ formatCurrency(maxEarnings) }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-sm text-gray-600">Growth trend</p>
                <div class="flex items-center justify-center space-x-1">
                    <ArrowTrendingUpIcon v-if="growthTrend >= 0" class="w-4 h-4 text-green-500" />
                    <ArrowTrendingDownIcon v-else class="w-4 h-4 text-red-500" />
                    <span class="text-lg font-bold" :class="growthTrend >= 0 ? 'text-green-600' : 'text-red-600'">
                        {{ Math.abs(growthTrend).toFixed(1) }}%
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/vue/24/outline";
import { computed } from 'vue'
import { LineChart } from 'recharts'

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

// Process data for chart
const chartData = computed(() => {
    if (!props.data || props.data.length === 0) return []

    return props.data
        .slice()
        .reverse() // Show oldest to newest
        .map(item => {
            let label = ''

            if (props.period === 'monthly') {
                const date = new Date(item.year, item.month - 1)
                label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            } else if (props.period === 'weekly') {
                label = `Week ${item.week}, ${item.year}`
            } else {
                const date = new Date(item.year, item.month - 1, item.day)
                label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }

            return {
                name: label,
                earnings: item.totalEarnings || 0,
                netEarnings: item.netEarnings || 0,
                appointments: item.totalAppointments || 0,
                completedAppointments: item.completedAppointments || 0
            }
        })
})

// Chart configuration
const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: true,
            position: 'top',
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
                label: function (context) {
                    if (context.dataset.label === 'Total earnings') {
                        return `Total: ${formatCurrency(context.parsed.y)}`
                    } else if (context.dataset.label === 'Net earnings') {
                        return `Net: ${formatCurrency(context.parsed.y)}`
                    }
                    return context.dataset.label + ': ' + context.parsed.y
                }
            }
        }
    },
    scales: {
        x: {
            grid: {
                display: false
            }
        },
        y: {
            beginAtZero: true,
            ticks: {
                callback: function (value) {
                    return formatCurrency(value)
                }
            }
        }
    },
    elements: {
        line: {
            tension: 0.4
        },
        point: {
            radius: 4,
            hoverRadius: 6
        }
    }
}))

// Computed statistics
const totalEarnings = computed(() => {
    return chartData.value.reduce((sum, item) => sum + item.earnings, 0)
})

const averageEarnings = computed(() => {
    if (chartData.value.length === 0) return 0
    return totalEarnings.value / chartData.value.length
})

const maxEarnings = computed(() => {
    return Math.max(...chartData.value.map(item => item.earnings), 0)
})

const growthTrend = computed(() => {
    if (chartData.value.length < 2) return 0

    const recent = chartData.value.slice(-3) // Last 3 periods
    const older = chartData.value.slice(-6, -3) // 3 periods before that

    if (recent.length === 0 || older.length === 0) return 0

    const recentAvg = recent.reduce((sum, item) => sum + item.earnings, 0) / recent.length
    const olderAvg = older.reduce((sum, item) => sum + item.earnings, 0) / older.length

    if (olderAvg === 0) return 0

    return ((recentAvg - olderAvg) / olderAvg) * 100
})

// Helper function
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS'
}
</script>