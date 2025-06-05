import {
	createAdminProfile,
	deleteAdminProfile,
	getAdminProfiles,
	updateAdminProfile,
} from '@/api/admin-profiles'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

function getProfileType(profileType) {
	if (profileType === 'admin') return 'Администратор'
	if (profileType === 'moderator') return 'Модератор'
	if (profileType === 'supporter') return 'Спонсор'
	if (profileType === 'employee') return 'Сотрудник'
	return 'Неизвестно'
}

function getProfileStatus(profileStatus) {
	if (profileStatus === 'actived') return 'Активный'
	if (profileStatus === 'inactive') return 'Неактивный'
	if (profileStatus === 'blocked') return 'Заблокирован'
	return 'Неизвестно'
}

export function useAdminProfiles(accountId, profileStatus, profileType, search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => [
			'admin-profiles',
			accountId,
			profileStatus,
			profileType,
			search,
			page,
			limit,
		]),
		queryFn: () =>
			getAdminProfiles(
				accountId,
				profileStatus.value.code,
				profileType.value.code,
				search.value,
				page.value,
				limit.value,
				profileStore.profileID
			),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const accounts = data.documents
				return {
					count: data.count,
					items: accounts.map(account => ({
						createdAt: formatDate(account.created_at),
						updatedAt: formatDate(account.updated_at),
						accountId: account.account_id,
						creatorId: account.creator_id,
						phone: account.phone,
						profileType: getProfileType(account.profile_type),
						avatar: account.avatar_id,
						firstName: account.first_name,
						lastName: account.last_name,
						city: account.city?.name,
						id: account._id,
						status: getProfileStatus(account.status),
					})),
				}
			}
			return null
		},
	})
}

export function useCreateAdminProfile(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: accountData => {
			return createAdminProfile(accountData)
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin-profiles'],
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

export function useUpdateAdminProfile(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: ({ id, accountData }) =>
			updateAdminProfile(id, accountData, profileStore.profileID),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['admin-profiles'],
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

export function useDeleteAdminProfile(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: accountId => deleteAdminProfile(accountId, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['admin-profiles'],
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
