import { createPromotion, deletePromotion, getPromotions, updatePromotion } from '@/api/promotions'
import { getTariffById } from '@/api/tariffs'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

const getPromotionType = type => {
	switch (type) {
		case 'color_raise':
			return 'Выделение цветом'
		case 'up_search':
			return 'Поднятие в поиске'
	}
}

export function usePromotions(search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['promotions', search, page, limit]),
		queryFn: () => getPromotions(search.value, page.value, limit.value, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const promotions = data.documents
				return {
					count: data.count,
					items: promotions.map(promo => ({
						name: promo.name,
						iconId: promo.icon_id,
						promotionType: getPromotionType(promo.promotion_type),
						types: promo.types,
						creatorId: promo.creator_id,
						id: promo._id,
						creatorName: promo.creator_name,
						createdAt: formatDate(promo.created_at),
						updatedAt: formatDate(promo.updated_at),
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
		queryKey: ['promotion-id'],
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

export function useCreatePromotion(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: promotion => createPromotion(promotion),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['promotions'],
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

export function useUpdatePromotion(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, promotion }) => updatePromotion(id, promotion, profileStore.profileID),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['promotions'],
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

export function useDeletePromotion(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: promotionId => deletePromotion(promotionId, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['promotions'],
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
