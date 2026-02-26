<template>
    <div class="space-y-8">
        <!-- Step Header -->
        <div class="text-center">
            <h2 class="text-3xl font-bold text-gray-900">{{ $t('onboarding.educationExperience') }}</h2>
            <p class="mt-2 text-gray-600">{{ $t('onboarding.educationExperienceDesc') }}</p>
        </div>

        <!-- Education section -->
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('onboarding.education') }}</h3>
                <div class="space-y-4">
                    <div v-for="(edu, index) in modelValue.education" :key="index"
                        class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('onboarding.degree')
                                    }}</label>
                                <input v-model="edu.degree" type="text"
                                    :placeholder="$t('onboarding.degreePlaceholder')" class="input"
                                    @input="validateForm" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                                    $t('onboarding.institution') }}</label>
                                <input v-model="edu.institution" type="text"
                                    :placeholder="$t('onboarding.institutionPlaceholder')" class="input"
                                    @input="validateForm" />
                            </div>
                            <div class="flex items-end space-x-2">
                                <div class="flex-1">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('onboarding.year')
                                        }}</label>
                                    <input v-model.number="edu.year" type="number" :min="1950"
                                        :max="new Date().getFullYear()" placeholder="2020" class="input"
                                        @input="validateForm" />
                                </div>
                                <button v-if="modelValue.education.length > 1" @click="removeEducation(index)"
                                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                    <TrashIcon class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button @click="addEducation"
                    class="mt-4 flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium">
                    <PlusIcon class="w-5 h-5" />
                    <span>{{ $t('onboarding.addEducation') }}</span>
                </button>
            </div>

            <!-- Certifications section -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('onboarding.certifications') }}</h3>
                <div class="space-y-4">
                    <div v-for="(cert, index) in modelValue.certifications" :key="index"
                        class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('onboarding.certName')
                                    }}</label>
                                <input v-model="cert.name" type="text"
                                    :placeholder="$t('onboarding.certNamePlaceholder')" class="input"
                                    @input="validateForm" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">{{
                                    $t('onboarding.issuingOrg') }}</label>
                                <input v-model="cert.issuer" type="text"
                                    :placeholder="$t('onboarding.issuingOrgPlaceholder')" class="input"
                                    @input="validateForm" />
                            </div>
                            <div class="flex items-end space-x-2">
                                <div class="flex-1">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">{{
                                        $t('onboarding.yearObtained') }}</label>
                                    <input v-model.number="cert.year" type="number" :min="1950"
                                        :max="new Date().getFullYear()" placeholder="2020" class="input"
                                        @input="validateForm" />
                                </div>
                                <button v-if="modelValue.certifications.length > 1" @click="removeCertification(index)"
                                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                                    <TrashIcon class="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button @click="addCertification"
                    class="mt-4 flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium">
                    <PlusIcon class="w-5 h-5" />
                    <span>{{ $t('onboarding.addCertification') }}</span>
                </button>
            </div>

            <!-- Languages section -->
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-4">{{ $t('onboarding.languages') }}</h3>
                <p class="text-sm text-gray-600 mb-4">{{ $t('onboarding.whyInfoDesc').split('.')[1]?.trim() || '' }}</p>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(language, index) in modelValue.languages" :key="index"
                        class="flex items-center space-x-3">
                        <select v-model="modelValue.languages[index]" class="input flex-1" @change="validateForm">
                            <option value="">{{ $t('onboarding.selectLanguage') }}</option>
                            <option v-for="lang in getAvailableLanguages(index)" :key="lang" :value="lang">
                                {{ lang }}
                            </option>
                        </select>
                        <button v-if="modelValue.languages.length > 1" @click="removeLanguage(index)"
                            class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                            <TrashIcon class="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <button v-if="modelValue.languages.length < availableLanguages.length" @click="addLanguage"
                    class="mt-4 flex items-center space-x-2 text-sky-600 hover:text-sky-700 font-medium">
                    <PlusIcon class="w-5 h-5" />
                    <span>{{ $t('onboarding.addLanguage') }}</span>
                </button>
            </div>
        </div>

        <!-- Help Text -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div class="flex items-start space-x-3">
                <InformationCircleIcon class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div class="text-sm">
                    <p class="font-medium text-blue-900">{{ $t('onboarding.whyInfo') }}</p>
                    <p class="text-blue-700 mt-1">
                        {{ $t('onboarding.whyInfoDesc') }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { TrashIcon, PlusIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import { ref, watch, onMounted } from 'vue'

const emit = defineEmits(['update:modelValue', 'validate'])
const props = defineProps({
    modelValue: {
        type: Object,
        required: true
    }
})

// Available languages
const availableLanguages = ref([
    'English', 'Russian', 'Uzbek', 'Arabic', 'Spanish', 'French',
    'German', 'Turkish', 'Persian', 'Korean', 'Chinese', 'Japanese'
])

// Initialize with at least one entry for each section
onMounted(() => {
    if (props.modelValue.education.length === 0) {
        addEducation()
    }
    if (props.modelValue.certifications.length === 0) {
        addCertification()
    }
    if (props.modelValue.languages.length === 0) {
        addLanguage()
    }
    validateForm()
})

// Methods
const addEducation = () => {
    props.modelValue.education.push({
        degree: '',
        institution: '',
        year: null
    })
    validateForm()
}

const removeEducation = (index) => {
    props.modelValue.education.splice(index, 1)
    validateForm()
}

const addCertification = () => {
    props.modelValue.certifications.push({
        name: '',
        issuer: '',
        year: null
    })
    validateForm()
}

const removeCertification = (index) => {
    props.modelValue.certifications.splice(index, 1)
    validateForm()
}

const addLanguage = () => {
    props.modelValue.languages.push('')
    validateForm()
}

const removeLanguage = (index) => {
    props.modelValue.languages.splice(index, 1)
    validateForm()
}

const getAvailableLanguages = (currentIndex) => {
    const selectedLanguages = props.modelValue.languages
        .filter((lang, index) => index !== currentIndex && lang !== '')

    return availableLanguages.value.filter(lang =>
        !selectedLanguages.includes(lang)
    )
}

const validateForm = () => {
    // At least one complete education entry
    const hasValidEducation = props.modelValue.education.some(edu =>
        edu.degree && edu.institution && edu.year
    )

    // At least one complete certification entry  
    const hasValidCertification = props.modelValue.certifications.some(cert =>
        cert.name && cert.issuer && cert.year
    )

    // At least one language selected
    const hasValidLanguage = props.modelValue.languages.some(lang => lang !== '')

    const isValid = hasValidEducation && hasValidCertification && hasValidLanguage

    emit('validate', isValid)
}

// Watch for changes to validate
watch(() => props.modelValue, validateForm, { deep: true })
</script>