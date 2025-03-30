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
				to: '/pages/notfound',
			},
			{
				label: 'Контроль платежей',
				icon: 'pi pi-fw pi-home',
				to: '/pages/notfound',
			},
			{ label: 'Реклама', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
		],
	},
	{
		label: 'Модерирование',
		items: [
			{ label: 'Аккаунты', icon: 'pi pi-fw pi-user', to: '/accounts' },
			{ label: 'Категории', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Объявления', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Афиша', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Контент', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Жалобы', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Чаты', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Поддержка', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
			{ label: 'Реклама', icon: 'pi pi-fw pi-home', to: '/pages/notfound' },
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
