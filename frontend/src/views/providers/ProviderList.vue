<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Find Healthcare Providers</h1>
        <p class="mt-3 text-gray-600">Discover qualified professionals for your healthcare needs</p>
      </div>

      <!-- Enhanced Search and filters -->
      <div class="card-element p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="form-group">
            <label for="search" class="label">Search by name</label>
            <div class="input-group">
              <input id="search" v-model="filters.name" type="text" class="input pr-12"
                placeholder="Search providers..." @input="handleSearch" />
              <div class="input-icon">
                <MagnifyingGlassIcon class="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="specializations" class="label">Specialization</label>
            <select id="specializations" v-model="filters.specializations" class="input" @change="handleSearch">
              <option value="">All Specializations</option>
              <option v-for="spec in specializations" :key="spec" :value="spec">
                {{ spec }}
              </option>
            </select>
          </div>

          <!-- Price Range Filter -->
          <div class="form-group">
            <label class="label">Price Range (UZS)</label>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="filters.minPrice" type="number" class="input text-sm" placeholder="Min price"
                @input="handleSearch" />
              <input v-model="filters.maxPrice" type="number" class="input text-sm" placeholder="Max price"
                @input="handleSearch" />
            </div>
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <label class="label mb-3 block">Sort Options</label>
          <div class="flex flex-wrap gap-4">
            <!-- Experience Sort -->
            <button @click="toggleSort('experience')" :class="[
              'flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors',
              sorts.experience
                ? 'bg-brand-1 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              Experience
              <ChevronUpIcon v-if="sorts.experience === 'asc'" class="w-4 h-4 ml-1" />
              <ChevronDownIcon v-else-if="sorts.experience === 'desc'" class="w-4 h-4 ml-1" />
            </button>

            <!-- Price Sort -->
            <button @click="toggleSort('price')" :class="[
              'flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors',
              sorts.price
                ? 'bg-brand-1 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              Price
              <ChevronUpIcon v-if="sorts.price === 'asc'" class="w-4 h-4 ml-1" />
              <ChevronDownIcon v-else-if="sorts.price === 'desc'" class="w-4 h-4 ml-1" />
            </button>

            <!-- Rating Sort -->
            <button @click="toggleSort('rating')" :class="[
              'flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors',
              sorts.rating
                ? 'bg-brand-1 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]">
              Rating
              <ChevronUpIcon v-if="sorts.rating === 'asc'" class="w-4 h-4 ml-1" />
              <ChevronDownIcon v-else-if="sorts.rating === 'desc'" class="w-4 h-4 ml-1" />
            </button>

            <!-- Clear Sorts Button -->
            <button v-if="hasActiveSorts" @click="clearSorts"
              class="flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
              <XMarkIcon class="w-3 h-3" />
              Clear Sorts
            </button>
          </div>
        </div>

        <!-- Filter Summary -->
        <div v-if="hasActiveFilters || hasActiveSorts" class="mt-4 flex items-center space-x-2">
          <span class="text-sm text-gray-500">Active filters & sorts:</span>
          <div class="flex flex-wrap gap-2">
            <!-- Filter Tags -->
            <span v-if="filters.name"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Name: {{ filters.name }}
              <button @click="filters.name = ''; handleSearch()" class="ml-1 text-blue-800 hover:text-blue-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="filters.specializations"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ filters.specializations }}
              <button @click="filters.specializations = ''; handleSearch()"
                class="ml-1 text-blue-800 hover:text-blue-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="filters.minPrice || filters.maxPrice"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Price: {{ getPriceRangeText() }}
              <button @click="clearPriceRange(); handleSearch()" class="ml-1 text-blue-800 hover:text-blue-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>

            <!-- Sort Tags -->
            <span v-if="sorts.experience"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Experience {{ sorts.experience === 'asc' ? '↑' : '↓' }}
              <button @click="sorts.experience = null; handleSearch()" class="ml-1 text-green-800 hover:text-green-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="sorts.price"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Price {{ sorts.price === 'asc' ? '↑' : '↓' }}
              <button @click="sorts.price = null; handleSearch()" class="ml-1 text-green-800 hover:text-green-900">
                <XMarkIcon class="w-3 h-3" />
              </button>
            </span>
            <span v-if="sorts.rating"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Rating {{ sorts.rating === 'asc' ? '↑' : '↓' }}
              <button @click="sorts.rating = null; handleSearch()" class="ml-1 text-green-800 hover:text-green-900">
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
          <p class="mt-4 text-gray-600">Finding the best providers for you...</p>
        </div>

        <template v-else>
          <div v-if="providers.length === 0" class="text-center py-12">
            <div class="mx-auto h-16 w-16 text-gray-400 mb-4">
              <DocumentIcon class="w-16 h-16" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p class="text-gray-500">Try adjusting your search criteria or browse all providers</p>
            <button @click="clearAll" class="mt-4 btn-secondary">
              Clear All Filters & Sorts
            </button>
          </div>

          <div v-else>
            <!-- Results Summary -->
            <div class="flex items-center justify-between">
              <p class="text-gray-600">
                <span class="font-medium text-gray-900">{{ providers.length }}</span>
                {{ providers.length === 1 ? 'provider' : 'providers' }} found
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
                      <img :src="provider.profilePicture ? `/api${provider.profilePicture}` : '/images/user-placeholder.jpg'" :alt="provider.firstName"
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
                          +{{ provider.specializations.length - 2 }} more
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Provider Details -->
                  <div class="space-y-3 mb-6">
                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <CheckIcon class="w-3 h-3 text-brand-1" />
                      </div>
                      <span class="text-gray-600">
                        <span class="font-medium text-gray-900">{{ provider.experience }}</span> years experience
                      </span>
                    </div>

                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <CurrencyDollarIcon class="w-3 h-3 text-brand-1" />
                      </div>
                      <span class="text-gray-600">
                        <span class="font-medium text-gray-900">{{ formatCurrency(provider.sessionFee) }}</span> UZS per
                        session
                      </span>
                    </div>

                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <LanguageIcon class="w-3 h-3 text-brand-1" />
                      </div>
                      <span class="text-gray-600">
                        {{ provider.languages?.join(', ') || 'Not specified' }}
                      </span>
                    </div>
                  </div>

                  <!-- UPDATED: Real Rating/Reviews instead of placeholder -->
                  <div class="flex items-center mb-4">
                    <div class="flex items-center">
                      <!-- Show stars based on actual rating -->
                      <div class="flex">
                        <template v-for="n in 5" :key="n">
                          <StarIcon class="w-4 h-4" :class="{
                            'text-yellow-400': n <= Math.round(provider.reviewStats?.averageRating || 0),
                            'text-gray-300': n > Math.round(provider.reviewStats?.averageRating || 0)
                          }" />
                        </template>
                      </div>
                      <!-- Show actual rating and review count -->
                      <span class="ml-2 text-sm text-gray-600">
                        <template v-if="provider.reviewStats?.totalReviews > 0">
                          {{ provider.reviewStats.averageRating.toFixed(1) }}
                          ({{ provider.reviewStats.totalReviews }} {{ provider.reviewStats.totalReviews === 1 ? 'review'
                          : 'reviews' }})
                        </template>
                        <template v-else>
                          <span class="text-gray-400">No reviews yet</span>
                        </template>
                      </span>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <router-link :to="{ name: 'provider-profile-view', params: { id: provider._id } }"
                    class="btn-primary w-full justify-center group-hover:shadow-lg transition-buttery">
                    <EyeIcon class="w-4 h-4 mr-2" />
                    View Profile & Book
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
import { ref, reactive, onMounted, computed } from 'vue'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const specializations = ref([])

async function fetchSpecializations() {
  try {
    const response = await axios.get('/specializations')
    specializations.value = response.data.specializations.map(s => s.name)
  } catch (error) {
    console.error('Error fetching specializations:', error)
    // Set some defaults in case API call fails
    specializations.value = []
  }
}

const providers = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)

// Separate filters and sorts
const filters = reactive({
  name: '',
  specializations: '',
  minPrice: '',
  maxPrice: ''
})

const sorts = reactive({
  experience: null, // 'asc', 'desc', or null
  price: null,
  rating: null
})

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
    return `From ${formatCurrency(filters.minPrice)} UZS`
  } else if (filters.maxPrice) {
    return `Up to ${formatCurrency(filters.maxPrice)} UZS`
  }
  return ''
}

const getActiveSortsText = () => {
  const activeSorts = []
  if (sorts.experience) activeSorts.push(`Experience ${sorts.experience === 'asc' ? '↑' : '↓'}`)
  if (sorts.price) activeSorts.push(`Price ${sorts.price === 'asc' ? '↑' : '↓'}`)
  if (sorts.rating) activeSorts.push(`Rating ${sorts.rating === 'asc' ? '↑' : '↓'}`)

  return activeSorts.length > 0 ? `Sorted by: ${activeSorts.join(', ')}` : 'No sorting applied'
}

const clearPriceRange = () => {
  filters.minPrice = ''
  filters.maxPrice = ''
}

const toggleSort = (field) => {
  if (!sorts[field]) {
    // First click: ascending
    sorts[field] = 'asc'
  } else if (sorts[field] === 'asc') {
    // Second click: descending
    sorts[field] = 'desc'
  } else {
    // Third click: clear
    sorts[field] = null
  }
  handleSearch()
}

const clearSorts = () => {
  sorts.experience = null
  sorts.price = null
  sorts.rating = null
  handleSearch()
}

const clearAll = () => {
  // Clear filters
  filters.name = ''
  filters.specializations = ''
  filters.minPrice = ''
  filters.maxPrice = ''

  // Clear sorts
  sorts.experience = null
  sorts.price = null
  sorts.rating = null

  handleSearch()
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

    // Clean up empty parameters
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

function handleSearch() {
  currentPage.value = 1
  fetchProviders()
}

function handlePageChange(page) {
  currentPage.value = page
  fetchProviders()
}

onMounted(() => {
  fetchProviders()
  fetchSpecializations()
})
</script>