import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

export function useMakeAuth() {
	const queryClient = useQueryClient()
	const authStore = useAuthStore()
	const router = useRouter()

	return useMutation({
		mutationFn: login,
		onSuccess: res => {
			queryClient.invalidateQueries(['auth'])
			if (res.access_token) {
				authStore.setAccessToken(res.access_token)
				authStore.setRefreshToken(res.refresh_token)
				// window.location.href = '/'
				window.location.href = '/aidoo-admin'
			}
		},
	})
}
