import { createFaq, deleteFaq, getFaq, getFaqById, updateFaq } from '@/api/faq'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export function useFaq(search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['faq', search, page, limit]),
		queryFn: () => getFaq(search.value, page.value, limit.value, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const faqList = data.documents
				return {
					count: data.count,
					items: faqList.map(faqItem => ({
						id: faqItem._id,
						question: faqItem.question,
						answer: faqItem.answer,
						createdAt: formatDate(faqItem.created_at),
						updatedAt: formatDate(faqItem.updated_at),
					})),
				}
			}
			return null
		},
	})
}

export function useFaqById(faqId) {
	const profileStore = useProfileStore()

	return useQuery({
		queryKey: ['faq-id'],
		queryFn: () => getFaqById(faqId, profileStore.profileID),
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

export function useCreateFaq(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: faq => createFaq(faq),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['faq'],
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

export function useUpdateFaq(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, faq }) => updateFaq(id, faq, profileStore.profileID),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['faq'],
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

export function useDeleteFaq(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: faqId => deleteFaq(faqId, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['faq'],
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
