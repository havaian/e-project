<template>
    <div class="space-y-6">
        <div v-for="review in reviews" :key="review._id" class="bg-white shadow rounded-lg p-6">
            <div class="flex items-start">
                <div class="flex-1">
                    <div class="flex items-center">
                        <div class="flex items-center">
                            <template v-for="i in 5" :key="i">
                                <StarIcon class="h-5 w-5"
                                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'" />
                            </template>
                        </div>
                        <span class="ml-2 text-sm text-gray-600">{{ formatDate(review.createdAt) }}</span>
                    </div>
                    <p class="mt-2 text-gray-900">{{ review.comment }}</p>
                    <p class="mt-1 text-sm text-gray-600">
                        - {{ review.client.firstName }} {{ review.client.lastName }}
                    </p>
                </div>
            </div>
            <div v-if="review.providerResponse" class="mt-4 bg-gray-50 rounded-lg p-4">
                <p class="text-sm text-gray-900">
                    <span class="font-medium">Provider's response:</span>
                    {{ review.providerResponse.text }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                    {{ formatDate(review.providerResponse.respondedAt) }}
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { StarIcon } from "@heroicons/vue/24/outline";
import { format } from 'date-fns'

const props = defineProps({
    reviews: {
        type: Array,
        required: true
    }
})

const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy')
}
</script>