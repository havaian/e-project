<!-- frontend/src/components/provider/EarningsChart.vue -->
<template>
    <div class="w-full">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center h-80">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>

        <!-- No Data State -->
        <div v-else-if="!processedData || processedData.length === 0"
            class="flex flex-col items-center justify-center h-80 text-gray-500">
            <ChartBarIcon class="w-16 h-16 mb-4" />
            <h3 class="text-lg font-medium mb-2">{{ $t('earnings.noData') }}</h3>
            <p class="text-sm">{{ $t('earnings.noDataDescription') }}</p>
        </div>

        <!-- Chart -->
        <div v-else class="w-full">
            <div class="h-80">
                <canvas ref="chartCanvas"></canvas>
            </div>

            <!-- Summary Stats -->
            <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-600">{{ $t('earnings.totalEarnings') }}</p>
                    <p class="text-lg font-bold text-gray-900">{{ formatCurrency(totalEarnings) }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-600">{{ $t('earnings.averagePer', { period: periodLabel }) }}</p>
                    <p class="text-lg font-bold text-gray-900">{{ formatCurrency(averageEarnings) }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-600">{{ $t('earnings.best', { period: periodLabel }) }}</p>
                    <p class="text-lg font-bold text-gray-900">{{ formatCurrency(maxEarnings) }}</p>
                </div>
                <div class="bg-gray-50 rounded-lg p-4 text-center">
                    <p class="text-sm text-gray-600">{{ $t('earnings.growthTrend') }}</p>
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
    </div>
</template>

<script setup>
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/vue/24/outline";
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Chart from 'chart.js/auto'

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

const chartCanvas = ref(null)
let chartInstance = null

// ── Locale mapping for Intl APIs ─────────────────────────────────────────────
const intlLocale = computed(() => {
    const map = { en: 'en-US', ru: 'ru-RU', uz: 'uz-UZ' }
    return map[locale.value] || 'en-US'
})

// ── Period label ─────────────────────────────────────────────────────────────
const periodLabel = computed(() => {
    if (props.period === 'monthly') return t('earnings.month')
    if (props.period === 'weekly') return t('earnings.week')
    return t('earnings.day')
})

// ── Process raw data into chart-friendly format ──────────────────────────────
const processedData = computed(() => {
    if (!props.data || props.data.length === 0) return []

    return props.data
        .slice()
        .reverse() // oldest → newest for chart
        .map(item => {
            let label = ''

            if (props.period === 'monthly') {
                const date = new Date(item.year, item.month - 1)
                label = date.toLocaleDateString(intlLocale.value, { month: 'short', year: 'numeric' })
            } else if (props.period === 'weekly') {
                label = `${t('earnings.week')} ${item.week}, ${item.year}`
            } else {
                const date = new Date(item.year, item.month - 1, item.day)
                label = date.toLocaleDateString(intlLocale.value, { month: 'short', day: 'numeric' })
            }

            return {
                label,
                earnings: item.totalEarnings || 0,
                netEarnings: item.netEarnings || 0,
                transactions: item.totalTransactions || item.totalAppointments || 0,
                completedTransactions: item.completedTransactions || item.completedAppointments || 0
            }
        })
})

// ── Chart rendering ──────────────────────────────────────────────────────────
const renderChart = () => {
    if (!chartCanvas.value || processedData.value.length === 0) return

    // Destroy previous instance
    if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
    }

    const ctx = chartCanvas.value.getContext('2d')

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: processedData.value.map(d => d.label),
            datasets: [
                {
                    label: t('earnings.totalEarnings'),
                    data: processedData.value.map(d => d.earnings),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: t('earnings.netEarnings'),
                    data: processedData.value.map(d => d.netEarnings),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formatCurrencyShort(value)
                    }
                }
            }
        }
    })
}

// ── Computed statistics ──────────────────────────────────────────────────────
const totalEarnings = computed(() => {
    return processedData.value.reduce((sum, item) => sum + item.earnings, 0)
})

const averageEarnings = computed(() => {
    if (processedData.value.length === 0) return 0
    return totalEarnings.value / processedData.value.length
})

const maxEarnings = computed(() => {
    return Math.max(...processedData.value.map(item => item.earnings), 0)
})

const growthTrend = computed(() => {
    if (processedData.value.length < 2) return 0

    const recent = processedData.value.slice(-3)
    const older = processedData.value.slice(-6, -3)

    if (recent.length === 0 || older.length === 0) return 0

    const recentAvg = recent.reduce((sum, item) => sum + item.earnings, 0) / recent.length
    const olderAvg = older.reduce((sum, item) => sum + item.earnings, 0) / older.length

    if (olderAvg === 0) return 0
    return ((recentAvg - olderAvg) / olderAvg) * 100
})

// ── Currency formatting ──────────────────────────────────────────────────────
const formatCurrency = (amount) => {
    return new Intl.NumberFormat(intlLocale.value).format(amount) + ' UZS'
}

// Shorter format for axis labels (e.g. 1.5M, 500K)
const formatCurrencyShort = (value) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(0) + 'K'
    return String(value)
}

// ── Watchers & lifecycle ─────────────────────────────────────────────────────
watch([processedData, locale], async () => {
    await nextTick()
    renderChart()
})

onMounted(async () => {
    await nextTick()
    renderChart()
})

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy()
        chartInstance = null
    }
})
</script>