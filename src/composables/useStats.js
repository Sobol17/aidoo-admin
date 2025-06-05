import { getStats } from '@/api/stats'
import { useProfileStore } from '@/stores/profile'
import { useQuery } from '@tanstack/vue-query'

export function useStats() {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: ['stats'],
		queryFn: () => getStats(profileStore.profileID),
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			const newMappedStats = [
				{ name: 'Сумма всех транзакций', value: data.sum_orders },
				{ name: 'Успешных транзакций', value: data.completed_orders },
				{ name: 'Активных подписок', value: data.count_active_subs },
				{ name: 'Переходов в мессенджер', value: data.count_transition_messenger },
				{ name: 'Переходов в звонок с модального окна', value: data.count_transition_call },
				{ name: 'Зарегистрированных пользователей', value: data.count_users },
				{ name: 'Просмотров объявлений и контента', value: data.count_views_offers },
				{ name: 'Опубликованных объявлений', value: data.count_public_offers },
				{ name: 'Партнерских объявлений', value: data.count_offers_partner },
				{ name: 'Купленных за все время подписок', value: data.count_buy_subs },
				{ name: 'Просмотров статей', value: data.count_vievs_article },
			]
			return newMappedStats
		},
	})
}
