import {
	createAccount,
	getAccountById,
	getList,
	updateAccount,
} from '@/api/accounts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export function useAccounts() {
	const queryClient = useQueryClient()

	return useQuery({
		queryKey: ['accounts'],
		queryFn: getList,
		staleTime: 1000 * 60 * 5,
		onSuccess: res => {
			queryClient.invalidateQueries(['accounts'])
		},
	})
}

export function useAccountById(id) {
	return useQuery({
		queryKey: ['account', id],
		queryFn: () => getAccountById(id),
		enabled: !!id,
	})
}

export function useCreateAccount() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ account }) => createAccount(account),
		onSuccess: () => {
			queryClient.invalidateQueries(['accounts'])
		},
	})
}

export function useUpdateAccount() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ id, account }) => updateAccount(id, account),
		onSuccess: () => {
			queryClient.invalidateQueries(['accounts'])
			queryClient.invalidateQueries(['account', id])
		},
	})
}
