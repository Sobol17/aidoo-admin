import { getUserProfiles, moderateUserProfile } from '@/api/user-profiles'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

function getProfileType(profileType) {
	if (profileType === 'partner') return 'Партнер'
	if (profileType === 'client') return 'Клиент'
	return 'Неизвестно'
}

function getProfileStatus(profileStatus) {
	if (profileStatus === 'verified') return 'Активный'
	if (profileStatus === 'actived') return 'Активный'
	if (profileStatus === 'moderation') return 'На модерации'
	if (profileStatus === 'rejected') return 'Заблокирован'
	if (profileStatus === 'deleted') return 'Удален'
	return 'Неизвестно'
}

export function useUserProfiles(profileStatus, profileType, search, page, limit) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['user-profiles', page, limit, profileStatus, profileType, search]),
		queryFn: () =>
			getUserProfiles(
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
				const userProfiles = data.documents
				return {
					count: data.count,
					items: userProfiles.map(profile => ({
						moderatorId: profile.moderator_id,
						moderationComment: profile.moderation_comment,
						moderationData: profile.moderation_data,
						createdAt: formatDate(profile.created_at),
						updatedAt: formatDate(profile.updated_at),
						accountId: profile.account_id,
						phone: profile.phone,
						profileType: getProfileType(profile.profile_type),
						avatar: profile.avatar_id,
						firstName: profile.first_name,
						lastName: profile.last_name ? profile.last_name : '-',
						city: profile.city ? profile.city.name : '-',
						id: profile._id,
						status: getProfileStatus(profile.status),
						partnerShortName: profile.partner_info?.short_name,
						partnerFullName: profile.partner_info?.full_name,
						partnerPhone: profile.partner_info?.phone,
						partnerEmail: profile.partner_info?.email,
						partnerWhatsapp: profile.partner_info?.whatsapp,
						partnerTelegram: profile.partner_info?.telegram,
						partnerInn: profile.partner_info?.inn,
						hasAgreement: profile.agreement ? 'Да' : 'Нет',
					})),
				}
			}
			return null
		},
	})
}

export function useModerateUserProfiles(options = {}) {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: requestData => {
			return moderateUserProfile(requestData.id, requestData.moderationData)
		},
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({
				queryKey: ['user-profiles'],
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
