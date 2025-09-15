<template>
    <div class="flex items-center space-x-4">
        <!-- View Toggle -->
        <div class="bg-gray-100 rounded-lg p-1 flex">
            <button v-for="view in viewOptions" :key="view.key" @click="$emit('view-change', view.key)" :class="[
                'px-3 py-2 text-sm rounded-md transition-all duration-200 flex items-center',
                currentView === view.key
                    ? 'bg-white text-brand-1 shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-900'
            ]">
                <component :is="view.icon" class="w-4 h-4 mr-2" />
                {{ view.label }}
            </button>
        </div>

        <!-- Calendar Navigation (only show in calendar view) -->
        <div v-if="currentView === 'calendar'" class="flex items-center space-x-2">
            <button @click="$emit('navigate', 'prev')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
            </button>

            <button @click="$emit('navigate', 'today')"
                class="px-3 py-1 text-sm bg-brand-1 text-white rounded-lg hover:bg-brand-1/90 transition-colors">
                Today
            </button>

            <button @click="$emit('navigate', 'next')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRightIcon class="w-5 h-5 text-gray-600" />
            </button>
        </div>

        <!-- Calendar View Mode (Month/Week/Day) -->
        <div v-if="currentView === 'calendar'" class="flex items-center space-x-1">
            <select :value="calendarViewMode" @change="$emit('calendar-view-change', $event.target.value)"
                class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1">
                <option value="dayGridMonth">Month</option>
                <option value="timeGridWeek">Week</option>
                <option value="timeGridDay">Day</option>
            </select>
        </div>

        <!-- List View Controls -->
        <div v-if="currentView === 'list'" class="flex items-center space-x-2">
            <!-- Sort Options -->
            <select :value="sortBy" @change="$emit('sort-change', $event.target.value)"
                class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-1/20 focus:border-brand-1">
                <option value="dateTime">Date</option>
                <option value="status">Status</option>
                <option value="provider" v-if="userRole === 'client'">Provider</option>
                <option value="client" v-if="userRole === 'provider'">Client</option>
                <option value="type">Type</option>
            </select>

            <!-- Sort Direction -->
            <button @click="$emit('sort-direction-change')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                :title="sortDirection === 'asc' ? 'Sort Descending' : 'Sort Ascending'">
                <component :is="sortDirection === 'asc' ? ArrowUpIcon : ArrowDownIcon" class="w-4 h-4 text-gray-600" />
            </button>
        </div>

        <!-- Export/Actions Menu -->
        <div class="relative" v-if="showActions">
            <button @click="showActionsMenu = !showActionsMenu"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <EllipsisVerticalIcon class="w-5 h-5 text-gray-600" />
            </button>

            <!-- Actions Dropdown -->
            <div v-if="showActionsMenu"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div class="py-1">
                    <button @click="handleExport('csv')"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DocumentArrowDownIcon class="w-4 h-4 mr-2 inline" />
                        Export as CSV
                    </button>
                    <button @click="handleExport('pdf')"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <DocumentTextIcon class="w-4 h-4 mr-2 inline" />
                        Export as PDF
                    </button>
                    <button @click="handlePrint"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <PrinterIcon class="w-4 h-4 mr-2 inline" />
                        Print
                    </button>
                    <div class="border-t border-gray-100 my-1"></div>
                    <button @click="handleRefresh"
                        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <ArrowPathIcon class="w-4 h-4 mr-2 inline" />
                        Refresh
                    </button>

                    <!-- Role-specific actions -->
                    <template v-if="userRole === 'provider'">
                        <div class="border-t border-gray-100 my-1"></div>
                        <button @click="handleBulkAction('confirm')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <CheckCircleIcon class="w-4 h-4 mr-2 inline" />
                            Bulk Confirm
                        </button>
                        <button @click="handleBulkAction('reschedule')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <CalendarDaysIcon class="w-4 h-4 mr-2 inline" />
                            Bulk Reschedule
                        </button>
                    </template>

                    <template v-if="userRole === 'client'">
                        <div class="border-t border-gray-100 my-1"></div>
                        <button @click="handleQuickAction('book')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <PlusIcon class="w-4 h-4 mr-2 inline" />
                            Quick Book
                        </button>
                        <button @click="handleQuickAction('favorites')"
                            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <HeartIcon class="w-4 h-4 mr-2 inline" />
                            Favorite Providers
                        </button>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {
    Bars3Icon,
    CalendarDaysIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EllipsisVerticalIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    DocumentArrowDownIcon,
    DocumentTextIcon,
    PrinterIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    PlusIcon,
    HeartIcon
} from '@heroicons/vue/24/outline'
import { ref, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps({
    currentView: {
        type: String,
        default: 'list',
        validator: (value) => ['list', 'calendar'].includes(value)
    },
    userRole: {
        type: String,
        required: true,
        validator: (value) => ['client', 'provider'].includes(value)
    },
    calendarViewMode: {
        type: String,
        default: 'dayGridMonth'
    },
    sortBy: {
        type: String,
        default: 'dateTime'
    },
    sortDirection: {
        type: String,
        default: 'desc',
        validator: (value) => ['asc', 'desc'].includes(value)
    },
    showActions: {
        type: Boolean,
        default: true
    }
})

// Emits
const emit = defineEmits([
    'view-change',
    'navigate',
    'calendar-view-change',
    'sort-change',
    'sort-direction-change',
    'export',
    'print',
    'refresh',
    'bulk-action',
    'quick-action'
])

// Local state
const showActionsMenu = ref(false)

// View options configuration
const viewOptions = [
    {
        key: 'list',
        label: 'List',
        icon: Bars3Icon
    },
    {
        key: 'calendar',
        label: 'Calendar',
        icon: CalendarDaysIcon
    }
]

// Methods
const handleExport = (format) => {
    emit('export', format)
    showActionsMenu.value = false
}

const handlePrint = () => {
    emit('print')
    showActionsMenu.value = false
}

const handleRefresh = () => {
    emit('refresh')
    showActionsMenu.value = false
}

const handleBulkAction = (action) => {
    emit('bulk-action', action)
    showActionsMenu.value = false
}

const handleQuickAction = (action) => {
    emit('quick-action', action)
    showActionsMenu.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
    if (showActionsMenu.value && !event.target.closest('.relative')) {
        showActionsMenu.value = false
    }
}

// Lifecycle
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.brand-1 {
    background-color: #0ea5e9;
    color: #0ea5e9;
}
</style>