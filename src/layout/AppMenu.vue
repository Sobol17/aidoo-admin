<script setup>
import { computed, ref } from 'vue'

import { useProfileStore } from '@/stores/profile'
import AppMenuItem from './AppMenuItem.vue'

const profileStore = useProfileStore()

const model = ref([
	{
		label: 'Основные функции',
		roles: ['admin', 'moderator'],
		items: [
			{
				label: 'Статистика',
				icon: 'pi pi-fw pi-chart-bar',
				to: '/stats',
				roles: ['admin'],
			},
			{
				label: 'Платежи',
				icon: 'pi pi-fw pi-wallet',
				to: '/orders',
				roles: ['admin'],
			},
			{
				label: 'Подписки',
				icon: 'pi pi-fw pi-star',
				to: '/subscriptions',
				roles: ['admin'],
			},
			{
				label: 'Тарифы',
				icon: 'pi pi-fw pi-dollar',
				to: '/taxes',
				roles: ['admin'],
			},
			{
				label: 'Оформить нарушения',
				icon: 'pi pi-fw pi-ban',
				to: '/violations',
				roles: ['admin', 'moderator'],
			},
		],
	},
	{
		label: 'Модерирование',
		roles: ['admin', 'moderator'],
		items: [
			{
				label: 'Сотрудники',
				icon: 'pi pi-fw pi-user-edit',
				iconSrc: '/demo/images/setting.png',
				to: '/admin-accounts',
				roles: ['admin'],
			},
			{
				label: 'Аккаунты(МП)',
				icon: 'pi pi-fw pi-user',
				to: '/user-accounts',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Профили(МП)',
				icon: 'pi pi-fw pi-user',
				to: '/user-profiles',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Категории',
				icon: 'pi pi-fw pi-th-large',
				to: '/categories',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Реклама',
				icon: 'pi pi-fw pi-calendar-plus',
				to: '/advertising',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Предложения',
				icon: 'pi pi-fw pi-receipt',
				to: '/offers',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Отзывы',
				icon: 'pi pi-fw pi-file-edit',
				to: '/reviews',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Промокоды',
				icon: 'pi pi-fw pi-percentage',
				to: '/promo',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'Города',
				icon: 'pi pi-fw pi-building',
				to: '/cities',
				roles: ['admin', 'moderator'],
			},
			{
				label: 'FAQ',
				icon: 'pi pi-fw pi-question',
				to: '/faq',
				roles: ['admin', 'moderator'],
			},
		],
	},
	{
		label: 'Техподдержка',
		roles: ['admin', 'moderator', 'support'],
		items: [
			{
				label: 'Жалобы',
				icon: 'pi pi-fw pi-flag',
				to: '/complaints',
			},
			{
				label: 'Техподдержка',
				icon: 'pi pi-fw pi-wrench',
				to: '/support',
			},
		],
	},
])

const filteredMenu = computed(() => {
	return model.value
		.filter(section => !section.roles || section.roles.includes(profileStore.role))
		.map(section => {
			const filteredItems = (section.items || []).filter(
				item => !item.roles || item.roles.includes(profileStore.role)
			)
			return {
				...section,
				items: filteredItems,
			}
		})
		.filter(section => section.items.length > 0)
})
</script>

<template>
	<ul class="layout-menu">
		<template v-for="(item, i) in filteredMenu" :key="item">
			<app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
			<li v-if="item.separator" class="menu-separator"></li>
		</template>
	</ul>
</template>

<style lang="scss" scoped></style>
