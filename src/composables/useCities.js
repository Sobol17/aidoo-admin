import { createCity, deleteCity, getCities, getCityById, updateCity } from '@/api/cities'
import { useProfileStore } from '@/stores/profile'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

function getCityStatusText(profileStatus) {
	if (profileStatus === 'actived') return 'Активен'
	if (profileStatus === 'inactive') return 'Неактивен'
	if (profileStatus === 'rejected') return 'Заблокирован'
	return 'Неизвестно'
}

export function useCities(search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['cities', search, page, limit]),
		queryFn: () => getCities(search.value, page.value, limit.value, profileStore.profileID),
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
						status: getCityStatusText(city.status),
						lon: city.lon,
						lat: city.lat,
					})),
				}
			}
			return null
		},
	})
}

export function useCityById(cityId) {
	const profileStore = useProfileStore()

	return useQuery({
		queryKey: ['city-id'],
		queryFn: () => getCityById(cityId, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data) {
				return {
					id: data._id,
					name: data.name,
					status: getCityStatusText(data.status),
					lon: data.lon,
					lat: data.lat,
				}
			}

			return null
		},
	})
}

export function useCreateCity(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: city => createCity(city),
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

export function useUpdateCity(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, city }) => updateCity(id, city, profileStore.profileID),
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

export function useDeleteCity(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: cityId => deleteCity(cityId, profileStore.profileID),
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
