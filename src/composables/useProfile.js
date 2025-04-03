import { getProfileData, updateProfileData } from '@/api/profile'
import { useProfileStore } from '@/stores/profile'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export function useProfile(status = 'all', page = 1, limit = 10) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: ['profile'],
		queryFn: () => getProfileData(status, page, limit),
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			profileStore.profileID = data.documents[0]._id
			if (data && data.documents && data.documents.length > 0) {
				const profile = data.documents[0]
				return {
					firstName: profile.first_name,
					lastName: profile.last_name,
					avatarId: profile.avatar_id || 'string',
					profileType: profile.profile_type,
					accountId: profile.account_id,
					phone: profile.phone?.toString() || '',
					city: profile.city || '',
					status: profile.status || '',
					createdAt: profile.created_at,
					updatedAt: profile.updated_at,
				}
			}
			return null
		},
	})
}

export function useProfileMutation(options = {}) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: updatedProfile => updateProfileData(updatedProfile),
		onSuccess: (data, variables) => {
			// Обновляем кэш после успешного обновления
			queryClient.invalidateQueries({
				queryKey: ['profile'],
				exact: true,
			})

			// Вызываем пользовательский обработчик успеха, если он передан
			if (options.onSuccess) {
				options.onSuccess(data, variables)
			}
		},
		onError: (error, variables) => {
			// Вызываем пользовательский обработчик ошибки, если он передан
			if (options.onError) {
				options.onError(error, variables)
			}
		},
	})
}
