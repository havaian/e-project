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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="form-group">
            <label for="search" class="label">Search by name</label>
            <div class="input-group">
              <input id="search" v-model="filters.name" type="text" class="input pr-12"
                placeholder="Search providers..." @input="handleSearch" />
              <div class="input-icon">
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
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

          <!-- Sort Options -->
          <div class="form-group">
            <label for="sortBy" class="label">Sort by</label>
            <select id="sortBy" v-model="filters.sortBy" class="input" @change="handleSearch">
              <option value="">Relevance</option>
              <option value="experience_desc">Experience (High to Low)</option>
              <option value="experience_asc">Experience (Low to High)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="rating_desc">Rating (High to Low)</option>
              <option value="rating_asc">Rating (Low to High)</option>
            </select>
          </div>
        </div>

        <!-- Filter Summary -->
        <div v-if="hasActiveFilters" class="mt-4 flex items-center space-x-2">
          <span class="text-sm text-gray-500">Active filters:</span>
          <div class="flex flex-wrap gap-2">
            <span v-if="filters.name"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-1/10 text-brand-1">
              Name: {{ filters.name }}
              <button @click="filters.name = ''; handleSearch()" class="ml-1 text-brand-1 hover:text-brand-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="filters.specializations"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-1/10 text-brand-1">
              {{ filters.specializations }}
              <button @click="filters.specializations = ''; handleSearch()"
                class="ml-1 text-brand-1 hover:text-brand-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="filters.minPrice || filters.maxPrice"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-1/10 text-brand-1">
              Price: {{ getPriceRangeText() }}
              <button @click="clearPriceRange(); handleSearch()" class="ml-1 text-brand-1 hover:text-brand-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="filters.sortBy"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-1/10 text-brand-1">
              Sort: {{ getSortText() }}
              <button @click="filters.sortBy = ''; handleSearch()" class="ml-1 text-brand-1 hover:text-brand-2">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
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
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p class="text-gray-500">Try adjusting your search criteria or browse all providers</p>
            <button @click="clearFilters" class="mt-4 btn-secondary">
              Clear All Filters
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
                  {{ filters.sortBy ? `Sorted by ${getSortText()}` : 'Default sorting' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="provider in providers" :key="provider._id"
                class="card-element overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div class="p-6">
                  <!-- Provider Header -->
                  <div class="flex items-start space-x-4 mb-4">
                    <div class="relative flex-shrink-0">
                      <img :src="provider.profilePicture || '/images/user-placeholder.jpg'" :alt="provider.firstName"
                        class="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-brand-1/20 transition-all" />
                      <!-- Online Status Indicator -->
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full">
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg font-semibold text-gray-900 group-hover:text-brand-1 transition-colors">
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
                        <svg class="w-3 h-3 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <span class="text-gray-600">
                        <span class="font-medium text-gray-900">{{ provider.experience }}</span> years experience
                      </span>
                    </div>

                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <svg class="w-3 h-3 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <span class="text-gray-600">
                        <span class="font-medium text-gray-900">{{ formatCurrency(provider.sessionFee) }}</span> UZS per
                        session
                      </span>
                    </div>

                    <div class="flex items-center text-sm">
                      <div class="w-6 h-6 bg-brand-1/10 rounded-full flex items-center justify-center mr-3">
                        <svg class="w-3 h-3 text-brand-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </div>
                      <span class="text-gray-600">
                        {{ provider.languages?.join(', ') || 'Not specified' }}
                      </span>
                    </div>
                  </div>

                  <!-- Rating/Reviews (placeholder) -->
                  <div class="flex items-center mb-4">
                    <div class="flex items-center">
                      <div class="flex">
                        <svg v-for="n in 5" :key="n" class="w-4 h-4 text-yellow-400" fill="currentColor"
                          viewBox="0 0 20 20">
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span class="ml-2 text-sm text-gray-600">4.9 (127 reviews)</span>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <router-link :to="{ name: 'provider-profile-view', params: { id: provider._id } }"
                    class="btn-primary w-full justify-center group-hover:shadow-lg transition-all">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Profile & Book
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Enhanced Pagination -->
          <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-8">
            <button v-if="currentPage > 1" @click="handlePageChange(currentPage - 1)" class="btn-secondary px-3 py-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
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
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
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
    specializations.value = [
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Oncology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology'
    ]
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
  maxPrice: '',
  sortBy: ''
})

const hasActiveFilters = computed(() => {
  return filters.name || filters.specializations || filters.minPrice || filters.maxPrice || filters.sortBy
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

const getSortText = () => {
  const sortOptions = {
    'experience_desc': 'Experience (High to Low)',
    'experience_asc': 'Experience (Low to High)',
    'price_asc': 'Price (Low to High)',
    'price_desc': 'Price (High to Low)',
    'rating_desc': 'Rating (High to Low)',
    'rating_asc': 'Rating (Low to High)'
  }
  return sortOptions[filters.sortBy] || 'Relevance'
}

const clearPriceRange = () => {
  filters.minPrice = ''
  filters.maxPrice = ''
}

async function fetchProviders() {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: 9,
      ...filters
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

function clearFilters() {
  filters.name = ''
  filters.specializations = ''
  filters.minPrice = ''
  filters.maxPrice = ''
  filters.sortBy = ''
  handleSearch()
}

onMounted(() => {
  fetchProviders()
  fetchSpecializations()
})
</script>