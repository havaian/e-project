<!-- frontend/src/views/providers/ProviderList.vue -->
<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('providerList.title') }}</h1>
        <p class="mt-3 text-gray-600">{{ $t('providerList.subtitle') }}</p>
      </div>

      <!-- Enhanced Search and filters -->
      <div class="card-element p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="form-group">
            <label for="search" class="label">{{ $t('providerList.searchByName') }}</label>
            <div class="input-group">
              <input id="search" v-model="filters.name" type="text" class="input pr-12"
                :placeholder="$t('providerList.searchPlaceholder')" @input="handleSearchInput" />
              <div class="input-icon">
                <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="specializations" class="label">{{ $t('providerList.specialization') }}</label>
            <select id="specializations" v-model="filters.specializations" class="input" @change="handleFilterChange">
              <option value="">{{ $t('providerList.allSpecializations') }}</option>
              <option v-for="spec in specializations" :key="spec" :value="spec">
                {{ spec }}
              </option>
            </select>
          </div>

          <!-- Price range Filter -->
          <div class="form-group">
            <label class="label">{{ $t('providerList.priceRange') }}</label>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="filters.minPrice" type="number" class="input text-sm"
                :placeholder="$t('providerList.minPrice')" @input="handleSearchInput" />
              <input v-model="filters.maxPrice" type="number" class="input text-sm"
                :placeholder="$t('providerList.maxPrice')" @input="handleSearchInput" />
            </div>
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <label class="label mb-3 block">{{ $t('providerList.sortOptions') }}</label>
          <div class="flex flex-wrap gap-4">
            <button @click="toggleSort('experience')" :class="[
              'flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors',
              sorts.experience
                ? 'bg-brand-1 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              {{ $t('providerList.experience') }}
              <ChevronUpIcon v-if="sorts.experience === 'asc'" class="w-4 h-4 ml-1" />
              <ChevronDownIcon v-else-if="sorts.experience === 'desc'" class="w-4 h-4 ml-1" />
            </button>

            <button @click="toggleSort('price')" :class="[
              'flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors',
              sorts.price
                ? 'bg-brand-1 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              {{ $t('providerList.price') }}
              <ChevronUpIcon v-if="sorts.price === 'asc'" class="w-4 h-4 ml-1" />
              <ChevronDownIcon v-else-if="sorts.price === 'desc'" class="w-4 h-4 ml-1" />
            </button>

            <button @click="toggleSort('rating')" :class="[
              'flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors',
              sorts.rating
                ? 'bg-brand-1 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              {{ $t('providerList.rating') }}
              <ChevronUpIcon v-if="sorts.rating === 'asc'" class="w-4 h-4 ml-1" />
              <ChevronDownIcon v-else-if="sorts.rating === 'desc'" class="w-4 h-4 ml-1" />
            </button>

            <button v-if="hasActiveSorts" @click="clearSorts"
              class="flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
              <XMarkIcon class="w-3 h-3" />
              {{ $t('providerList.clearSorts') }}
            </button>
          </div>
        </div>

        <!-- Filter Summary -->
        <div v-if="hasActiveFilters || hasActiveSorts" class="mt-4 flex items-center space-x-2">
          <span class="text-sm text-gray-500">{{ $t('providerList.activeFilters') }}</span>
          <div class="flex flex-wrap gap-2">
            <span v-if="filters.name"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ $t('providerList.nameLabel') }}: {{ filters.name }}
              <button @click="clearNameFilter" class="ml-1 text-blue-800 hover:text-blue-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="filters.specializations"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ filters.specializations }}
              <button @click="clearSpecializationFilter" class="ml-1 text-blue-800 hover:text-blue-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="filters.minPrice || filters.maxPrice"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ $t('providerList.price') }}: {{ getPriceRangeText() }}
              <button @click="clearPriceFilter" class="ml-1 text-blue-800 hover:text-blue-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>

            <span v-if="sorts.experience"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ $t('providerList.experience') }} {{ sorts.experience === 'asc' ? '↑' : '↓' }}
              <button @click="clearExperienceSort" class="ml-1 text-green-800 hover:text-green-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="sorts.price"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ $t('providerList.price') }} {{ sorts.price === 'asc' ? '↑' : '↓' }}
              <button @click="clearPriceSort" class="ml-1 text-green-800 hover:text-green-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="sorts.rating"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {{ $t('providerList.rating') }} {{ sorts.rating === 'asc' ? '↑' : '↓' }}
              <button @click="clearRatingSort" class="ml-1 text-green-800 hover:text-green-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Provider list -->
      <div class="space-y-6">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-1 border-t-transparent">
          </div>
          <p class="mt-4 text-gray-600">{{ $t('providerList.finding') }}</p>
        </div>

        <template v-else>
          <div v-if="providers.length === 0" class="text-center py-12">
            <div class="mx-auto h-16 w-16 text-gray-400 mb-4">
              <DocumentIcon class="w-16 h-16" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">{{ $t('providerList.noProviders') }}</h3>
            <p class="text-gray-500">{{ $t('providerList.noProvidersHint') }}</p>
            <button @click="clearAll" class="mt-4 btn-secondary">
              {{ $t('providerList.clearAll') }}
            </button>
          </div>

          <div v-else>
            <!-- Results Summary -->
            <div class="flex items-center justify-between">
              <p class="text-gray-600">
                <span class="font-medium text-gray-900">{{ providers.length }}</span>
                {{ $t('providerList.providersFound', { count: providers.length }) }}
              </p>
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-500">
                  {{ getActiveSortsText() }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="provider in providers" :key="provider._id"
                class="card-element overflow-hidden group transition-buttery duration-300">
                <div class="p-6">
                  <!-- Provider Header -->
                  <div class="flex items-start space-x-4 mb-4">
                    <div class="relative flex-shrink-0">
                      <img
                        :src="provider.profilePicture ? `/api${provider.profilePicture}` : '/images/user-placeholder.jpg'"
                        :alt="provider.firstName"
                        class="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100 transition-buttery" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 transition-colors">
                        Dr. {{ provider.firstName }} {{ provider.lastName }}
                      </h3>
                      <div class="mt-2 flex flex-wrap gap-2">
                        <span v-for="spec in provider.specializations.slice(0, 2)" :key="spec"
                          class="status-info text-xs">
                          {{ spec }}
                        </span>
                        <span v-if="provider.specializations.length > 2"
                          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{{ provider.specializations.length - 2 }} {{ $t('providerList.more') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Provider details -->
                  <div class="space-y-3 mb-6">
                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon class="w-3 h-3 text-brand-1" />
                      </div>
                      <span class="text-gray-600">
                        <span class="font-medium text-gray-900">{{ provider.experience }}</span> {{
                          $t('providerList.yearsExperience') }}
                      </span>
                    </div>

                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <CurrencyDollarIcon class="w-3 h-3 text-brand-1" />
                      </div>
                      <span class="text-gray-600">
                        <span class="font-medium text-gray-900">{{ formatCurrency(provider.sessionFee) }}</span> {{
                          $t('providerList.perSession') }}
                      </span>
                    </div>

                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <LanguageIcon class="w-3 h-3 text-brand-1" />
                      </div>
                      <span class="text-gray-600">
                        {{ provider.languages?.join(', ') || $t('providerList.notSpecified') }}
                      </span>
                    </div>
                  </div>

                  <!-- Rating/Reviews -->
                  <div class="flex items-center mb-4">
                    <div class="flex items-center">
                      <div class="flex">
                        <template v-for="n in 5" :key="n">
                          <StarIcon class="w-4 h-4" :class="{
                            'text-yellow-400': n <= Math.round(provider.reviewStats?.averageRating || 0),
                            'text-gray-300': n > Math.round(provider.reviewStats?.averageRating || 0)
                          }" />
                        </template>
                      </div>
                      <span class="ml-2 text-sm text-gray-600">
                        <template v-if="provider.reviewStats?.totalReviews > 0">
                          {{ provider.reviewStats.averageRating.toFixed(1) }}
                          ({{ $t('providerList.reviewCount', { count: provider.reviewStats.totalReviews }) }})
                        </template>
                        <template v-else>
                          <span class="text-gray-400">{{ $t('providerList.noReviews') }}</span>
                        </template>
                      </span>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <router-link :to="{ name: 'provider-profile-view', params: { id: provider._id } }"
                    class="btn-primary w-full justify-center group-hover:shadow-lg transition-buttery">
                    <EyeIcon class="w-4 h-4 mr-2" />
                    {{ $t('providerList.viewProfileBook') }}
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
            <button v-if="currentPage > 1" @click="handlePageChange(currentPage - 1)" class="btn-secondary px-3 py-2">
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
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon, DocumentIcon, CheckIcon, CurrencyDollarIcon, LanguageIcon, StarIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const specializations = ref([])

async function fetchSpecializations() {
  try {
    const response = await axios.get('/specializations')
    specializations.value = response.data.specializations.map(s => s.name)
  } catch (error) {
    console.error('Error fetching specializations:', error)
    specializations.value = []
  }
}

const providers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

const filters = reactive({
  name: '',
  specializations: '',
  minPrice: '',
  maxPrice: ''
})

const sorts = reactive({
  experience: null,
  price: null,
  rating: null
})

let searchTimeout = null
const DEBOUNCE_DELAY = 1000

const hasActiveFilters = computed(() => {
  return filters.name || filters.specializations || filters.minPrice || filters.maxPrice
})

const hasActiveSorts = computed(() => {
  return sorts.experience || sorts.price || sorts.rating
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uz-UZ').format(amount)
}

const getPriceRangeText = () => {
  if (filters.minPrice && filters.maxPrice) {
    return `${formatCurrency(filters.minPrice)} - ${formatCurrency(filters.maxPrice)} UZS`
  } else if (filters.minPrice) {
    return `${t('providerList.from')} ${formatCurrency(filters.minPrice)} UZS`
  } else if (filters.maxPrice) {
    return `${t('providerList.upTo')} ${formatCurrency(filters.maxPrice)} UZS`
  }
  return ''
}

const getActiveSortsText = () => {
  const activeSorts = []
  if (sorts.experience) activeSorts.push(`${t('providerList.experience')} ${sorts.experience === 'asc' ? '↑' : '↓'}`)
  if (sorts.price) activeSorts.push(`${t('providerList.price')} ${sorts.price === 'asc' ? '↑' : '↓'}`)
  if (sorts.rating) activeSorts.push(`${t('providerList.rating')} ${sorts.rating === 'asc' ? '↑' : '↓'}`)

  return activeSorts.length > 0 ? `${t('providerList.sortedBy')}: ${activeSorts.join(', ')}` : t('providerList.noSorting')
}

const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProviders()
  }, DEBOUNCE_DELAY)
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchProviders()
}

const clearNameFilter = () => {
  filters.name = ''
  handleFilterChange()
}

const clearSpecializationFilter = () => {
  filters.specializations = ''
  handleFilterChange()
}

const clearPriceFilter = () => {
  filters.minPrice = ''
  filters.maxPrice = ''
  handleFilterChange()
}

const clearExperienceSort = () => {
  sorts.experience = null
  handleFilterChange()
}

const clearPriceSort = () => {
  sorts.price = null
  handleFilterChange()
}

const clearRatingSort = () => {
  sorts.rating = null
  handleFilterChange()
}

const toggleSort = (field) => {
  if (!sorts[field]) {
    sorts[field] = 'asc'
  } else if (sorts[field] === 'asc') {
    sorts[field] = 'desc'
  } else {
    sorts[field] = null
  }
  handleFilterChange()
}

const clearSorts = () => {
  sorts.experience = null
  sorts.price = null
  sorts.rating = null
  handleFilterChange()
}

const clearAll = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  filters.name = ''
  filters.specializations = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  sorts.experience = null
  sorts.price = null
  sorts.rating = null
  handleFilterChange()
}

async function fetchProviders() {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: 9,
      ...filters,
      ...sorts
    }

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })

    const response = await axios.get('/users/providers', { params })
    providers.value = response.data.providers
    totalPages.value = Math.ceil(response.data.pagination.total / response.data.pagination.limit)
  } catch (error) {
    console.error('Error fetching providers:', error)
  } finally {
    loading.value = false
  }
}

function handlePageChange(page) {
  currentPage.value = page
  fetchProviders()
}

onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})

onMounted(() => {
  fetchProviders()
  fetchSpecializations()
})
</script>