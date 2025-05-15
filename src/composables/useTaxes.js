import { createTax, deleteTax, getTaxById, getTaxes, updateTax } from '@/api/taxes'
import { useProfileStore } from '@/stores/profile'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export function useTaxes(search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['cities', search, page, limit]),
		queryFn: () => getTaxes(search.value, page.value, limit.value, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const cities = data.documents
				return {
					count: data.count,
					items: cities.map(city => ({
						id: city._id,
						name: city.name,
						lon: city.lon,
						lat: city.lat,
					})),
				}
			}
			return null
		},
	})
}

export function useTaxById(cityId) {
	const profileStore = useProfileStore()

	return useQuery({
		queryKey: ['city-id'],
		queryFn: () => getTaxById(cityId, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data) {
				return {
					id: data._id,
					name: data.name,
					lon: data.lon,
					lat: data.lat,
				}
			}

			return null
		},
	})
}

export function useCreateTax(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: city => createTax(city),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['cities'],
			})

			if (options.onSuccess) {
				options.onSuccess(data, variables)
			}
		},
		onError: (error, variables) => {
			if (options.onError) {
				options.onError(error, variables)
			}
		},
	})
}

export function useUpdateTax(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, city }) => updateTax(id, city, profileStore.profileID),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['cities'],
			})

			if (options.onSuccess) {
				options.onSuccess(data, variables)
			}
		},
		onError: (error, variables) => {
			if (options.onError) {
				options.onError(error, variables)
			}
		},
	})
}

export function useDeleteTax(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: cityId => deleteTax(cityId, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['cities'],
			})
			if (options.onSuccess) {
				options.onSuccess()
			}
		},
		onError: (error, variables) => {
			if (options.onError) {
				options.onError(error, variables)
			}
		},
	})
}
