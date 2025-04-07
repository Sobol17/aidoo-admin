import { createUserProfile, getUserProfiles } from '@/api/user-profiles'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/vue-query'

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

export function useUserProfiles(
	profileStatus,
	profileType,
	search,
	page,
	limit
) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: ['user-profiles'],
		queryFn: () =>
			getUserProfiles(
				profileStatus,
				profileType,
				search,
				page,
				limit,
				profileStore.profileID
			),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const userProfiles = data.documents
				return userProfiles.map(profile => ({
					createdAt: formatDate(profile.created_at),
					updatedAt: formatDate(profile.updated_at),
					accountId: profile.account_id,
					creatorId: profile.creator_id,
					phone: profile.phone,
					profileType: getProfileType(profile.profile_type),
					avatar: profile.avatar_id,
					firstName: profile.first_name,
					lastName: profile.last_name,
					city: profile.city,
					id: profile._id,
					status: getProfileStatus(profile.status),
					partner: profile.partner_info,
				}))
			}
			return null
		},
	})
}

export function useCreateUserProfile(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: accountData => {
			return createUserProfile(accountData)
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['user-profiles'],
				exact: true,
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
