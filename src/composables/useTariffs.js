import { createTariff, deleteTariff, getTariffById, getTariffs, updateTariff } from '@/api/tariffs'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export function useTariffs(search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['tariffs', search, page, limit]),
		queryFn: () => getTariffs(search.value, page.value, limit.value, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const tariffs = data.documents
				return {
					count: data.count,
					items: tariffs.map(tariff => ({
						name: tariff.name,
						price: tariff.price,
						duration: tariff.duration,
						creatorId: tariff.creator_id,
						id: tariff._id,
						creatorName: tariff.creator_name,
						createdAt: formatDate(tariff.created_at),
						updatedAt: formatDate(tariff.updated_at),
					})),
				}
			}
			return null
		},
	})
}

export function useTariffById(cityId) {
	const profileStore = useProfileStore()

	return useQuery({
		queryKey: ['tariff-id'],
		queryFn: () => getTariffById(cityId, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data) {
				return {
					name: data.name,
					price: data.price,
					duration: data.duration,
					creatorId: data.creator_id,
					id: data._id,
					creatorName: data.creator_name,
					createdAt: data.created_at,
					updatedAt: data.updated_at,
				}
			}

			return null
		},
	})
}

export function useCreateTariff(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: tariff => createTariff(tariff),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['tariffs'],
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

export function useUpdateTariff(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, tariff }) => updateTariff(id, tariff, profileStore.profileID),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['tariffs'],
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

export function useDeleteTariff(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: tariffId => deleteTariff(tariffId, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['tariffs'],
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
