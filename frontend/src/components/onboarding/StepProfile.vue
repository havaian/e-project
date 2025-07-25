<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
            <p class="mt-2 text-gray-600">Add your specializations, experience, and professional bio</p>
        </div>

        <!-- Specializations -->
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Specializations</h3>
                <p class="text-sm text-gray-600 mb-4">Select the areas you specialize in</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(specialization, index) in modelValue.specializations" :key="index"
                        class="flex items-center space-x-3">
                        <select v-model="modelValue.specializations[index]" class="input flex-1"
                            @change="validateForm">
                            <option value="">Select a specialization</option>
                            <option v-for="spec in getAvailableSpecializations(index)" :key="spec.name"
                                :value="spec.name">
                                {{ spec.name }}
                            </option>
                        </select>
                        <button v-if="modelValue.specializations.length > 1" @click="removeSpecialization(index)"
                            class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <button v-if="modelValue.specializations.length < availableSpecializations.length"
                    @click="addSpecialization"
                    class="mt-4 flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Specialization</span>
                </button>
            </div>

            <!-- Years of Experience -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Years of Experience</h3>
                <p class="text-sm text-gray-600 mb-4">How many years of professional experience do you have?</p>

                <div class="max-w-md">
                    <input v-model.number="modelValue.experience" type="number" min="0" max="50" placeholder="5"
                        class="input" @input="validateForm" />
                    <p class="text-sm text-gray-500 mt-2">
                        This helps clients verify your credentials and qualifications
                    </p>
                </div>
            </div>

            <!-- Professional Bio -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Professional Bio</h3>
                <p class="text-sm text-gray-600 mb-4">Write a brief description of your background and approach</p>

                <div class="space-y-4">
                    <textarea v-model="modelValue.bio" rows="6"
                        placeholder="Tell potential clients about your background, approach, and what makes you unique. This will be displayed on your profile page."
                        class="input resize-none" maxlength="500" @input="validateForm"></textarea>

                    <div class="flex justify-between items-center text-sm">
                        <span class="text-gray-500">
                            Write at least 50 characters for a complete profile
                        </span>
                        <span class="font-medium"
                            :class="bioLength >= 450 ? 'text-red-600' : bioLength >= 50 ? 'text-green-600' : 'text-gray-500'">
                            {{ bioLength }}/500 characters
                        </span>
                    </div>

                    <!-- Bio writing tips -->
                    <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 class="text-sm font-medium text-blue-900 mb-2">Bio Writing Tips</h4>
                        <ul class="text-sm text-blue-700 space-y-1">
                            <li>• Mention your educational background and certifications</li>
                            <li>• Describe your therapeutic approach or methodology</li>
                            <li>• Include areas of expertise and client populations you work with</li>
                            <li>• Keep it professional but personable</li>
                            <li>• Avoid overly technical jargon</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile Preview -->
        <div class="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Profile Preview</h4>
            <div class="bg-white rounded-lg p-4 border border-gray-200">
                <div class="flex items-start space-x-4">
                    <div
                        class="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-xl">{{ userInitials }}</span>
                    </div>
                    <div class="flex-1">
                        <h5 class="text-lg font-semibold text-gray-900">
                            Dr. {{ currentUser?.firstName }} {{ currentUser?.lastName }}
                        </h5>
                        <div class="flex flex-wrap gap-2 mt-2">
                            <span v-for="spec in selectedSpecializations" :key="spec"
                                class="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">
                                {{ spec }}
                            </span>
                        </div>
                        <div class="mt-3 text-sm text-gray-600">
                            <p v-if="modelValue.experience > 0">
                                {{ modelValue.experience }} {{ modelValue.experience === 1 ? 'year' : 'years' }} of
                                experience
                            </p>
                        </div>
                        <div class="mt-3 text-sm text-gray-700">
                            <p>{{ modelValue.bio || 'Professional bio will appear here...' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Validation Messages -->
        <div v-if="validationMessages.length > 0" class="bg-red-50 rounded-xl p-4 border border-red-200">
            <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                    <p class="font-medium text-red-900">Please complete the following:</p>
                    <ul class="text-red-700 mt-1 list-disc list-inside">
                        <li v-for="message in validationMessages" :key="message">{{ message }}</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Success Message -->
        <div v-if="isFormValid" class="bg-green-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div class="text-sm">
                    <p class="font-medium text-green-900">Profile Complete!</p>
                    <p class="text-green-700 mt-1">
                        Your profile information looks great. You're ready to proceed to the review step.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

const emit = defineEmits(['update:modelValue', 'validate'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

const authStore = useAuthStore()

// State
const availableSpecializations = ref([])
const loading = ref(false)

// Computed properties
const currentUser = computed(() => authStore.user)

const userInitials = computed(() => {
    if (!currentUser.value) return 'U'
    const first = currentUser.value.firstName?.[0] || ''
    const last = currentUser.value.lastName?.[0] || ''
    return (first + last).toUpperCase()
})

const bioLength = computed(() => {
    return modelValue.bio?.length || 0
})

const selectedSpecializations = computed(() => {
    return props.modelValue.specializations.filter(spec => spec !== '')
})

const validationMessages = computed(() => {
    const messages = []

    if (selectedSpecializations.value.length === 0) {
        messages.push('Select at least one specialization')
    }

    if (!props.modelValue.experience || props.modelValue.experience < 0) {
        messages.push('Enter your years of experience')
    }

    if (!props.modelValue.licenseNumber?.trim()) {
        messages.push('Enter your professional license number')
    }

    if (!props.modelValue.bio?.trim() || props.modelValue.bio.length < 50) {
        messages.push('Write a professional bio (at least 50 characters)')
    }

    return messages
})

const isFormValid = computed(() => {
    return validationMessages.value.length === 0
})

// Methods
const addSpecialization = () => {
    props.modelValue.specializations.push('')
    validateForm()
}

const removeSpecialization = (index) => {
    props.modelValue.specializations.splice(index, 1)
    validateForm()
}

const getAvailableSpecializations = (currentIndex) => {
    const selectedSpecs = props.modelValue.specializations
        .filter((spec, index) => index !== currentIndex && spec !== '')

    return availableSpecializations.value.filter(spec =>
        !selectedSpecs.includes(spec.name)
    )
}

const validateForm = () => {
    emit('validate', isFormValid.value)
}

const fetchSpecializations = async () => {
    try {
        loading.value = true
        const response = await axios.get('/specializations')
        availableSpecializations.value = response.data.specializations || []
    } catch (error) {
        console.error('Error fetching specializations:', error)
        // Fallback specializations
        availableSpecializations.value = [
            { name: 'Clinical Psychology' },
            { name: 'Counseling Psychology' },
            { name: 'Educational Psychology' },
            { name: 'Social Work' },
            { name: 'Marriage and Family Therapy' },
            { name: 'Addiction Counseling' },
            { name: 'Child Psychology' },
            { name: 'Behavioral Therapy' },
            { name: 'Cognitive Behavioral Therapy' },
            { name: 'Psychotherapy' }
        ]
    } finally {
        loading.value = false
    }
}

// Watch for changes
watch(() => props.modelValue, validateForm, { deep: true })

// Initialize
onMounted(async () => {
    await fetchSpecializations()

    // Initialize with at least one specialization slot
    if (props.modelValue.specializations.length === 0) {
        addSpecialization()
    }

    validateForm()
})
</script>