import { createViolation, deleteViolation, getViolations, updateViolation } from '@/api/violations'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

const getReasonText = reason => {
	const reasonMap = new Map([
		['thematic_message', 'Сообщение в тематическом чате'],
		['private_message', 'Сообщение в приватном чате'],
		['review', 'Отзыв об объявлении'],
	])

	return reasonMap.get(reason)
}

const getTypePunishmentText = type => {
	const reasonMap = new Map([
		['limitation', 'Ограничение доступа'],
		['text_warning', 'Текстовое предупреждение'],
		['deletion', 'Удаление причины нарушения'],
	])

	return reasonMap.get(type)
}

function getHoursDifference(dateStr1, dateStr2) {
	const date1 = new Date(dateStr1)
	const date2 = new Date(dateStr2)

	// Разница в миллисекундах
	const diffInMs = Math.abs(date2 - date1)

	// Переводим миллисекунды в часы
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

	return diffInHours
}

export function useViolations(search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['violation', search, page, limit]),
		queryFn: () => getViolations(search.value, page.value, limit.value, profileStore.profileID),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
		cacheTime: 5 * 60 * 1000,
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const violations = data.documents
				return {
					count: data.count,
					items: violations.map(violation => ({
						accountId: violation.account_id,
						id: violation._id,
						profileId: violation.profile_id,
						reason: getReasonText(violation.reason),
						description: violation.description,
						images: violation.images,
						typePunishment: getTypePunishmentText(violation.type_punishment),
						hours: getHoursDifference(violation.created_at, violation.date_to),
						createdAt: formatDate(violation.created_at),
						dateTo: formatDate(violation.date_to),
					})),
				}
			}
			return null
		},
	})
}

export function useCreateViolation(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: violation => createViolation(violation),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['violation'],
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

export function useUpdateViolation(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, violation }) => updateViolation(id, violation, profileStore.profileID),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['violation'],
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

export function useDeleteViolation(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: violationId => deleteViolation(violationId, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['violation'],
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
