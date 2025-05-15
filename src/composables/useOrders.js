import { getOrderReportsByDates, getOrders } from '@/api/orders'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

export function useOrders(orderStatusRef, search = '', page = 1, limit = 1000) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['orders', orderStatusRef, search, page, limit]),
		queryFn: () =>
			getOrders(
				profileStore.profileID,
				orderStatusRef.value.code,
				search.value,
				page.value,
				limit.value
			),
		staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
		select: data => {
			if (data && data.documents && data.documents.length > 0) {
				const orders = data.documents
				return {
					count: data.count,
					items: orders.map(order => ({
						id: order._id,
						userId: order.user_id,
						startDate: formatDate(order.start_date),
						endDate: formatDate(order.end_date),
						history: order.history,
					})),
				}
			}
			return null
		},
	})
}

export function useOrdersReport(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: reportDates => getOrderReportsByDates(reportDates, profileStore.profileID),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ['orders-report'],
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
