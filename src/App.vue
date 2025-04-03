<script setup>
import { useProfile } from '@/composables/useProfile'

const { data: profileData, isLoading, error, refetch } = useProfile()
</script>

<template>
	<router-view />
</template>

<style scoped></style>
