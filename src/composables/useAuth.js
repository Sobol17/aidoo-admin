import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

export function useMakeAuth() {
	const queryClient = useQueryClient()
	const authStore = useAuthStore()

	return useMutation({
		mutationFn: login,
		onSuccess: res => {
			queryClient.invalidateQueries(['auth'])
			authStore.setAccessToken(res.accessToken)
		},
	})
}
