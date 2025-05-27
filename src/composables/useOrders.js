import { getOrderReportsByDates, getOrders } from '@/api/orders'
import { useProfileStore } from '@/stores/profile'
import { formatDate } from '@/utils/formatDate'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed } from 'vue'

function getStatusText(status) {
	switch (status) {
		case 'PENDING':
			return 'Отправлен'
		case 'COMPLETED':
			return 'Выполнен'
		case 'FAILED':
			return 'Не выполнен'
		case 'CANCELED':
			return 'Отменен'
	}
}

function getTypeText(type) {
	switch (type) {
		case 'promotion':
			return 'Продвижение'
		case 'subscription':
			return 'Подписка'
	}
}

export function useOrders(
	orderStatusRef,
	search = '',
	page = 1,
	limit = 1000,
	startDate = '',
	endDate = ''
) {
	const profileStore = useProfileStore()
	return useQuery({
		queryKey: computed(() => ['orders', orderStatusRef, search, page, limit, startDate, endDate]),
		queryFn: () =>
			getOrders(
				profileStore.profileID,
				orderStatusRef.value.code,
				search.value,
				page.value,
				limit.value,
				startDate.value,
				endDate.value
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
						userPhone: order.user_phone,
						status: getStatusText(order.status),
						objectId: order.object_id,
						countMonths: order.count_months ?? '-',
						countLiftSearch: order.count_lift_search ?? '-',
						countLiftHighLight: order.count_highlight ?? '-',
						amount: order.amount,
						type: getTypeText(order.type),
						currency: order.currency,
						finishedAt: formatDate(order.finished_at),
						createdAt: formatDate(order.created_at),
						updatedAt: formatDate(order.updated_at),
					})),
				}
			}
			return null
		},
	})
}

function formatDateToYYYYMMDD(inputDate) {
	const date = new Date(inputDate)

	if (isNaN(date.getTime())) {
		throw new Error('Некорректная дата')
	}

	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0') // Месяцы начинаются с 0
	const day = String(date.getDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}

export function useOrdersReport(options = {}) {
	const queryClient = useQueryClient()
	const profileStore = useProfileStore()
	return useMutation({
		mutationFn: reportDates =>
			getOrderReportsByDates(
				formatDateToYYYYMMDD(reportDates[0]),
				formatDateToYYYYMMDD(reportDates[1]),
				profileStore.profileID
			),
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
