// stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProfileStore = defineStore('profile', () => {
	const profileID = ref(null)

	return { profileID }
})
