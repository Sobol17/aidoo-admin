// stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
	const getAccessToken = () => {
		return localStorage.getItem('access_token')
	}

	const setAccessToken = token => {
		localStorage.setItem('access_token', token)
	}

	const getRefreshToken = () => {
		return localStorage.getItem('refresh_token')
	}

	const setRefreshToken = token => {
		localStorage.setItem('refresh_token', token)
	}

	return { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken }
})
