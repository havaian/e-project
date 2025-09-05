<template>
    <div class="availability-calendar bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent">
            </div>
            <span class="ml-3 text-gray-600">Loading availability...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-6 text-center">
            <div class="text-red-600 mb-4">
                <ExclamationTriangleIcon class="w-12 h-12 mx-auto mb-2" />
                <p class="font-medium">Failed to load availability</p>
                <p class="text-sm text-gray-600 mt-1">{{ error }}</p>
            </div>
            <button @click="loadAvailability"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Retry
            </button>
        </div>

        <!-- Calendar Content -->
        <div v-else>
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-xl font-semibold">
                            {{ mode === 'edit' ? 'Set Your Availability' : 'Availability Schedule' }}
                        </h2>
                        <p class="text-blue-100 text-sm mt-1" v-if="mode === 'edit'">
                            Click and drag to set your working hours
                        </p>
                        <p class="text-blue-100 text-sm mt-1" v-else>
                            {{ getTotalAvailableHours() }} hours per week
                        </p>
                    </div>
                    <div class="flex items-center space-x-3" v-if="mode === 'edit'">
                        <!-- Quick Presets -->
                        <div class="flex items-center space-x-2">
                            <button @click="setPreset('business')"
                                class="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-400 transition-colors">
                                Business Hours
                            </button>
                            <button @click="setPreset('flexible')"
                                class="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-400 transition-colors">
                                Flexible
                            </button>
                            <button @click="clearAll()"
                                class="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-400 transition-colors">
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Calendar Grid -->
            <div class="flex">
                <!-- Days Column -->
                <div class="w-24 bg-gray-50 border-r border-gray-200">
                    <!-- Time Header -->
                    <div class="h-12 border-b border-gray-200 flex items-center justify-center">
                        <span class="text-xs font-medium text-gray-600">Time</span>
                    </div>
                    <!-- Days -->
                    <div v-for="day in days" :key="day.value"
                        class="h-16 border-b border-gray-200 flex items-center justify-center">
                        <div class="text-center">
                            <div class="text-sm font-medium text-gray-900">{{ day.short }}</div>
                            <div class="text-xs text-gray-500">{{ day.name }}</div>
                        </div>
                    </div>
                </div>

                <!-- Time Grid -->
                <div class="flex-1 overflow-x-auto">
                    <div class="min-w-max">
                        <!-- Hour Headers -->
                        <div class="flex h-12 border-b border-gray-200 bg-gray-50">
                            <div v-for="hour in hours" :key="hour"
                                class="flex-1 min-w-20 border-r border-gray-200 flex items-center justify-center">
                                <span class="text-xs font-medium text-gray-600">
                                    {{ formatHour(hour) }}
                                </span>
                            </div>
                        </div>

                        <!-- Calendar Body -->
                        <div class="relative">
                            <div v-for="(day, dayIndex) in days" :key="day.value"
                                class="flex h-16 border-b border-gray-200 group hover:bg-gray-50">

                                <!-- Time Slots for each day -->
                                <div v-for="(hour, hourIndex) in hours" :key="`${day.value}-${hour}`"
                                    class="flex-1 min-w-20 border-r border-gray-200 relative">

                                    <!-- 30-minute slots -->
                                    <div v-for="(slot, slotIndex) in 2" :key="`${day.value}-${hour}-${slot}`" :class="[
                                        'h-8 border-b border-gray-100 relative transition-all duration-150',
                                        mode === 'edit' ? 'cursor-pointer' : '',
                                        isSlotAvailable(dayIndex, hour, slotIndex)
                                            ? (mode === 'edit' ? 'bg-blue-100 hover:bg-blue-200' : 'bg-green-100')
                                            : (mode === 'edit' ? 'hover:bg-gray-100' : '')
                                    ]" @mousedown="mode === 'edit' ? startSelection(dayIndex, hour, slotIndex) : null"
                                        @mouseenter="mode === 'edit' ? updateSelection(dayIndex, hour, slotIndex) : null"
                                        @mouseup="mode === 'edit' ? endSelection() : null">

                                        <!-- Slot Content -->
                                        <div v-if="isSlotAvailable(dayIndex, hour, slotIndex)" :class="[
                                            'absolute inset-0 rounded-sm m-0.5 flex items-center justify-center',
                                            mode === 'edit' ? 'bg-blue-500 opacity-80' : 'bg-green-500 opacity-70'
                                        ]">
                                            <div class="w-2 h-2 bg-white rounded-full"></div>
                                        </div>

                                        <!-- Selection Preview -->
                                        <div v-if="mode === 'edit' && isSlotInSelection(dayIndex, hour, slotIndex) && isSelecting"
                                            class="absolute inset-0 bg-blue-300 opacity-60 rounded-sm m-0.5">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Current Time Indicator -->
                            <div v-if="showCurrentTime" class="absolute left-0 right-0 pointer-events-none z-10"
                                :style="{ top: currentTimePosition + 'px' }">
                                <div class="h-0.5 bg-red-500 relative">
                                    <div class="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                        <span class="font-medium">{{ getTotalAvailableHours() }}</span> hours per week
                        <span v-if="mode === 'view'" class="ml-2 text-gray-500">
                            • {{ getAvailableDaysCount() }} days available
                        </span>
                    </div>
                    <div class="flex items-center space-x-4" v-if="mode === 'edit'">
                        <div v-if="hasUnsavedChanges" class="text-sm text-orange-600 font-medium">
                            Unsaved changes
                        </div>
                        <button @click="saveAvailability" :disabled="saving || !hasValidAvailability"
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ saving ? 'Saving...' : 'Save Availability' }}
                        </button>
                    </div>
                </div>

                <!-- Validation Message -->
                <div v-if="mode === 'edit' && !hasValidAvailability" class="mt-2 text-sm text-red-600">
                    Please set at least one available time slot before saving.
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, computed, onMounted, watch } from 'vue'
import axios from '@/plugins/axios'

// Props
const props = defineProps({
    mode: {
        type: String,
        default: 'edit',
        validator: (value) => ['edit', 'view'].includes(value)
    },
    autoSave: {
        type: Boolean,
        default: false
    },
    showCurrentTime: {
        type: Boolean,
        default: true
    }
})

// Emits
const emit = defineEmits(['saved', 'error', 'changed'])

// Reactive data
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const isSelecting = ref(false)
const selectionStart = ref(null)
const selectionEnd = ref(null)
const hasUnsavedChanges = ref(false)

// Original data to track changes
const originalAvailability = ref([])

// Calendar configuration
const days = [
    { name: 'Monday', short: 'Mon', value: 1 },
    { name: 'Tuesday', short: 'Tue', value: 2 },
    { name: 'Wednesday', short: 'Wed', value: 3 },
    { name: 'Thursday', short: 'Thu', value: 4 },
    { name: 'Friday', short: 'Fri', value: 5 },
    { name: 'Saturday', short: 'Sat', value: 6 },
    { name: 'Sunday', short: 'Sun', value: 7 }
]

const hours = Array.from({ length: 24 }, (_, i) => i) // 0-23

// Local availability state
const availability = reactive({})

// Initialize availability state
const initializeAvailability = () => {
    days.forEach(day => {
        if (!availability[day.value]) {
            availability[day.value] = {
                dayOfWeek: day.value,
                isAvailable: false,
                timeSlots: []
            }
        }
    })
}

// Load availability from API
const loadAvailability = async () => {
    try {
        loading.value = true
        error.value = ''

        const response = await axios.get('/users/me/availability')

        if (response.data.success && response.data.availability) {
            // Store original data for change tracking
            originalAvailability.value = JSON.parse(JSON.stringify(response.data.availability))

            // Load into local state
            response.data.availability.forEach(dayData => {
                if (availability[dayData.dayOfWeek]) {
                    availability[dayData.dayOfWeek] = {
                        dayOfWeek: dayData.dayOfWeek,
                        isAvailable: dayData.isAvailable,
                        timeSlots: [...(dayData.timeSlots || [])]
                    }
                }
            })

            hasUnsavedChanges.value = false
        }

    } catch (err) {
        console.error('Error loading availability:', err)
        error.value = err.response?.data?.message || 'Failed to load availability data'
    } finally {
        loading.value = false
    }
}

// Save availability to API
const saveAvailability = async () => {
    if (!hasValidAvailability.value) {
        emit('error', 'Please set at least one available time slot before saving.')
        return
    }

    try {
        saving.value = true
        error.value = ''

        const availabilityArray = Object.values(availability)

        const response = await axios.patch('/users/me/availability', {
            availability: availabilityArray
        })

        if (response.data.success) {
            // Update original data
            originalAvailability.value = JSON.parse(JSON.stringify(availabilityArray))
            hasUnsavedChanges.value = false

            emit('saved', availabilityArray)
        } else {
            throw new Error(response.data.message || 'Failed to save availability')
        }

    } catch (err) {
        console.error('Error saving availability:', err)
        const errorMessage = err.response?.data?.message || 'Failed to save availability'
        error.value = errorMessage
        emit('error', errorMessage)
    } finally {
        saving.value = false
    }
}

// Helper functions
const formatHour = (hour) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour < 12) return `${hour} AM`
    return `${hour - 12} PM`
}

const timeToMinutes = (hour, slot) => {
    return hour * 60 + (slot * 30)
}

const minutesToTime = (minutes) => {
    const hour = Math.floor(minutes / 60)
    const min = minutes % 60
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
}

const isSlotAvailable = (dayIndex, hour, slot) => {
    const dayData = availability[days[dayIndex].value]
    if (!dayData || !dayData.isAvailable || !dayData.timeSlots.length) return false

    const slotMinutes = timeToMinutes(hour, slot)

    return dayData.timeSlots.some(timeSlot => {
        const startMinutes = timeToMinutes(
            parseInt(timeSlot.startTime.split(':')[0]),
            parseInt(timeSlot.startTime.split(':')[1]) / 30
        )
        const endMinutes = timeToMinutes(
            parseInt(timeSlot.endTime.split(':')[0]),
            parseInt(timeSlot.endTime.split(':')[1]) / 30
        )

        return slotMinutes >= startMinutes && slotMinutes < endMinutes
    })
}

const isSlotInSelection = (dayIndex, hour, slot) => {
    if (!isSelecting.value || !selectionStart.value || !selectionEnd.value) return false

    const currentSlot = { dayIndex, hour, slot }
    const start = selectionStart.value
    const end = selectionEnd.value

    // Only same day selections
    if (currentSlot.dayIndex !== start.dayIndex) return false

    const currentMinutes = timeToMinutes(hour, slot)
    const startMinutes = timeToMinutes(start.hour, start.slot)
    const endMinutes = timeToMinutes(end.hour, end.slot)

    const minMinutes = Math.min(startMinutes, endMinutes)
    const maxMinutes = Math.max(startMinutes, endMinutes)

    return currentMinutes >= minMinutes && currentMinutes <= maxMinutes
}

// Selection handlers (only for edit mode)
const startSelection = (dayIndex, hour, slot) => {
    if (props.mode !== 'edit') return

    isSelecting.value = true
    selectionStart.value = { dayIndex, hour, slot }
    selectionEnd.value = { dayIndex, hour, slot }
}

const updateSelection = (dayIndex, hour, slot) => {
    if (!isSelecting.value || !selectionStart.value || selectionStart.value.dayIndex !== dayIndex) return

    selectionEnd.value = { dayIndex, hour, slot }
}

const endSelection = () => {
    if (!isSelecting.value || !selectionStart.value || !selectionEnd.value) return

    const dayValue = days[selectionStart.value.dayIndex].value
    const startMinutes = timeToMinutes(selectionStart.value.hour, selectionStart.value.slot)
    const endMinutes = timeToMinutes(selectionEnd.value.hour, selectionEnd.value.slot) + 30 // End of slot

    const minMinutes = Math.min(startMinutes, endMinutes)
    const maxMinutes = Math.max(startMinutes, endMinutes)

    const startTime = minutesToTime(minMinutes)
    const endTime = minutesToTime(maxMinutes)

    // Toggle the selection
    const dayData = availability[dayValue]
    const existingSlotIndex = dayData.timeSlots.findIndex(slot => {
        const slotStart = timeToMinutes(
            parseInt(slot.startTime.split(':')[0]),
            parseInt(slot.startTime.split(':')[1])
        )
        const slotEnd = timeToMinutes(
            parseInt(slot.endTime.split(':')[0]),
            parseInt(slot.endTime.split(':')[1])
        )
        return slotStart <= minMinutes && slotEnd >= maxMinutes
    })

    if (existingSlotIndex >= 0) {
        // Remove existing slot
        dayData.timeSlots.splice(existingSlotIndex, 1)
        if (dayData.timeSlots.length === 0) {
            dayData.isAvailable = false
        }
    } else {
        // Add new slot
        dayData.timeSlots.push({ startTime, endTime })
        dayData.isAvailable = true

        // Sort and merge overlapping slots
        dayData.timeSlots.sort((a, b) =>
            timeToMinutes(parseInt(a.startTime.split(':')[0]), parseInt(a.startTime.split(':')[1])) -
            timeToMinutes(parseInt(b.startTime.split(':')[0]), parseInt(b.startTime.split(':')[1]))
        )

        mergeOverlappingSlots(dayData.timeSlots)
    }

    // Clean up selection
    isSelecting.value = false
    selectionStart.value = null
    selectionEnd.value = null

    // Mark as changed
    checkForChanges()

    // Auto-save if enabled
    if (props.autoSave && hasValidAvailability.value) {
        saveAvailability()
    }
}

const mergeOverlappingSlots = (slots) => {
    for (let i = 0; i < slots.length - 1; i++) {
        const current = slots[i]
        const next = slots[i + 1]

        const currentEnd = timeToMinutes(
            parseInt(current.endTime.split(':')[0]),
            parseInt(current.endTime.split(':')[1])
        )
        const nextStart = timeToMinutes(
            parseInt(next.startTime.split(':')[0]),
            parseInt(next.startTime.split(':')[1])
        )

        if (currentEnd >= nextStart) {
            // Merge slots
            const nextEnd = timeToMinutes(
                parseInt(next.endTime.split(':')[0]),
                parseInt(next.endTime.split(':')[1])
            )
            current.endTime = minutesToTime(Math.max(currentEnd, nextEnd))
            slots.splice(i + 1, 1)
            i-- // Check this slot again
        }
    }
}

// Preset configurations
const setPreset = (preset) => {
    if (props.mode !== 'edit') return

    switch (preset) {
        case 'business':
            days.forEach(day => {
                if (day.value >= 1 && day.value <= 5) { // Mon-Fri
                    availability[day.value] = {
                        dayOfWeek: day.value,
                        isAvailable: true,
                        timeSlots: [{ startTime: '09:00', endTime: '17:00' }]
                    }
                } else {
                    availability[day.value] = {
                        dayOfWeek: day.value,
                        isAvailable: false,
                        timeSlots: []
                    }
                }
            })
            break

        case 'flexible':
            days.forEach(day => {
                if (day.value >= 1 && day.value <= 6) { // Mon-Sat
                    availability[day.value] = {
                        dayOfWeek: day.value,
                        isAvailable: true,
                        timeSlots: [{ startTime: '08:00', endTime: '20:00' }]
                    }
                } else {
                    availability[day.value] = {
                        dayOfWeek: day.value,
                        isAvailable: false,
                        timeSlots: []
                    }
                }
            })
            break
    }

    checkForChanges()
}

const clearAll = () => {
    if (props.mode !== 'edit') return

    days.forEach(day => {
        availability[day.value] = {
            dayOfWeek: day.value,
            isAvailable: false,
            timeSlots: []
        }
    })

    checkForChanges()
}

// Check for changes
const checkForChanges = () => {
    const currentData = JSON.stringify(Object.values(availability))
    const originalData = JSON.stringify(originalAvailability.value)
    hasUnsavedChanges.value = currentData !== originalData

    if (hasUnsavedChanges.value) {
        emit('changed', Object.values(availability))
    }
}

// Computed properties
const getTotalAvailableHours = () => {
    let totalMinutes = 0

    Object.values(availability).forEach(day => {
        if (day.isAvailable && day.timeSlots) {
            day.timeSlots.forEach(slot => {
                const start = timeToMinutes(
                    parseInt(slot.startTime.split(':')[0]),
                    parseInt(slot.startTime.split(':')[1])
                )
                const end = timeToMinutes(
                    parseInt(slot.endTime.split(':')[0]),
                    parseInt(slot.endTime.split(':')[1])
                )
                totalMinutes += (end - start)
            })
        }
    })

    return Math.round(totalMinutes / 60 * 10) / 10 // Round to 1 decimal
}

const getAvailableDaysCount = () => {
    return Object.values(availability).filter(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    ).length
}

const hasValidAvailability = computed(() => {
    return Object.values(availability).some(day =>
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    )
})

const currentTimePosition = computed(() => {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    // Header height (48px) + (hour * 64px) + (minute/60 * 64px)
    return 48 + (currentHour * 64) + ((currentMinute / 60) * 64)
})

// Lifecycle
onMounted(() => {
    initializeAvailability()
    loadAvailability()
})

// Disable text selection during drag
document.addEventListener('selectstart', (e) => {
    if (isSelecting.value) {
        e.preventDefault()
    }
})

// Expose methods for parent component
defineExpose({
    loadAvailability,
    saveAvailability,
    hasUnsavedChanges: () => hasUnsavedChanges.value,
    isValid: () => hasValidAvailability.value
})
</script>

<style scoped>
.availability-calendar {
    user-select: none;
}

.availability-calendar * {
    box-sizing: border-box;
}

/* Custom scrollbar for horizontal scroll */
.overflow-x-auto::-webkit-scrollbar {
    height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>