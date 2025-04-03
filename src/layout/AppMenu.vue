<script setup>
import { ref } from 'vue'

import AppMenuItem from './AppMenuItem.vue'

const model = ref([
	{
		label: 'Основные функции',
		items: [
			{ label: 'Оформить нарушение', icon: 'pi pi-fw pi-home', to: '/' },
			{
				label: 'Управление МП',
				icon: 'pi pi-fw pi-home',
				to: '/',
			},
			{
				label: 'Контроль платежей',
				icon: 'pi pi-fw pi-home',
				to: '/',
			},
			{ label: 'Реклама', icon: 'pi pi-fw pi-home', to: '/' },
		],
	},
	{
		label: 'Модерирование',
		items: [
			{
				label: 'Аккаунты(ПУ)',
				icon: 'pi pi-fw pi-user',
				to: '/admin-accounts',
			},
			{ label: 'Аккаунты(МП)', icon: 'pi pi-fw pi-user', to: '/user-accounts' },
			{ label: 'Категории', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Объявления', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Афиша', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Контент', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Жалобы', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Чаты', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Поддержка', icon: 'pi pi-fw pi-home', to: '/' },
			{ label: 'Реклама', icon: 'pi pi-fw pi-home', to: '/' },
		],
	},
])
</script>

<template>
	<ul class="layout-menu">
		<template v-for="(item, i) in model" :key="item">
			<app-menu-item
				v-if="!item.separator"
				:item="item"
				:index="i"
			></app-menu-item>
			<li v-if="item.separator" class="menu-separator"></li>
		</template>
	</ul>
</template>

<style lang="scss" scoped></style>
