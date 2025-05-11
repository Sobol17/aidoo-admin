import { getSubs } from '@/api/subs'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'

export function useSubs(
	subsStatus = 'all',
	search = '',
	page = 1,
	limit = 1000
) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => [subsStatus, search, page, limit]),
		queryFn: () =>
			getSubs(
				subsStatus.value.code,
				profileStore.profileID,
				search.value,
				page.value,
				limit.value
			),
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const subs = data.documents
				return {
					count: data.count,
					items: subs.map(sub => ({
						id: sub._id,
						userId: sub.user_id,
						startDate: formatDate(sub.start_date),
						endDate: formatDate(sub.end_date),
						history: sub.history,
					})),
				}
			}
			return null
		},
	})
}
