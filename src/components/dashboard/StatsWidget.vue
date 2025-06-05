<script setup>
import { useStats } from '@/composables/useStats'

const { data: stats, isPending: statsPending } = useStats()
</script>

<template>
	<div class="col-span-12 lg:col-span-6 xl:col-span-3" v-for="(item, index) in stats" :key="index">
		<div class="card mb-0">
			<div class="flex justify-between mb-4">
				<div>
					<span class="block text-muted-color font-medium mb-4">{{ item.name }}</span>
					<div
						v-if="!statsPending"
						class="text-surface-900 dark:text-surface-0 font-medium text-xl"
					>
						{{ item.value }}
					</div>
					<ProgressSpinner v-else style="width: 35px; height: 35px" strokeWidth="8" />
				</div>
			</div>
		</div>
	</div>
</template>
