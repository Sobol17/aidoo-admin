<script setup>
import { useProfile } from '@/composables/useProfile'

if (localStorage.getItem('access_token')) {
	const { data: profileData, isLoading, error, refetch } = useProfile()
}
</script>

<template>
	<router-view />
</template>

<style scoped></style>
