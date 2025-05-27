import { getOfferById, getOffers, moderateOffer } from '@/api/offers'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

function transformStatus(status) {
	switch (status) {
		case 'actived':
			return 'Активный'
		case 'verified':
			return 'Активный'
		case 'rejected':
			return 'Заблокирован'
		default:
			status
	}
}

export function useOffers(status, search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['offers', status, search, page, limit]),
		queryFn: () =>
			getOffers(status.value.code, search.value, page.value, limit.value, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const offers = data.documents
				return {
					count: data.count,
					items: offers.map(offer => ({
						moderatorId: offer.moderator_id,
						moderationComment: offer.moderation_comment,
						moderationData: offer.moderation_data,
						id: offer._id,
						images: offer.images,
						video: offer.video,
						title: offer.title,
						subcategoryId: offer.subcategory_id,
						price: offer.price,
						description: offer.description,
						location: offer.location?.address,
						offerStatus: transformStatus(offer.status),
						promotion: offer.promotion_info,
						profile: offer.profile,
						createdAt: formatDate(offer.created_at),
						updatedAt: formatDate(offer.updated_at),
					})),
				}
			}
			return null
		},
	})
}

export function useOfferById() {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: ['offer-id'],
		queryFn: offerId => getOfferById(offerId, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: offer => {
			return {
				id: offer._id,
				images: offer.images,
				video: offer.video,
				title: offer.title,
				subcategoryId: offer.subcategory_id,
				price: offer.price,
				description: offer.description,
				location: offer.location,
				offerStatus: transformStatus(offer.status),
				promotion: offer.promotion_info,
				profile: offer.profile,
				createdAt: formatDate(offer.created_at),
				updatedAt: formatDate(offer.updated_at),
			}
		},
	})
}

export function useModerateOffer(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: offer => {
			return moderateOffer(offer.id, offer.moderationData)
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['offers'],
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
