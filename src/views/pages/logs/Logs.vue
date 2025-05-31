<script setup>
import { useLogs } from '@/composables/userLogs'
import { FilterMatchMode } from '@primevue/core/api'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const page = ref(1)
const first = ref(0)
const limit = ref(7)

const route = useRoute()

const { data: logsData, isLoading: isLoadingLogs } = useLogs(route.params.id, page, limit)

const logs = computed(() => {
	return logsData?.value || []
})

const dt = ref()

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const expandedRows = ref([])

function handleChangePage(event) {
	page.value = event.page + 1
	first.value = event.page
}

function handleChangeLimit(newLimit) {
	limit.value = newLimit
}
</script>

<template>
	<div>
		<div class="card">
			<h2>Логи</h2>
			<DataTable
				v-model:expanded-rows="expandedRows"
				ref="dt"
				:value="logs.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="logs.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${logs.count} элементов`"
				:loading="isLoadingLogs"
				removableSort
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Всего: {{ logs.count ?? 0 }}</h4>
					</div>
				</template>

				<Column field="accountId" header="ID аккаунта" sortable style="min-width: 12rem"></Column>
				<Column field="profileId" header="ID профиля" sortable style="min-width: 8rem"></Column>
				<Column field="action" header="Действия" sortable style="min-width: 8rem"></Column>
				<Column field="objectType" header="Объект" sortable style="min-width: 8rem"></Column>
				<Column field="objectId" header="ID объекта" sortable style="min-width: 8rem"></Column>
				<Column field="createdAt" header="Дата создания" sortable style="min-width: 12rem"></Column>
				<Column
					field="updatedAt"
					header="Дата обновления"
					sortable
					style="min-width: 12rem"
				></Column>
				<template #empty>
					<div class="flex items-center justify-center">
						<div class="text-gray-500 text-lg py-8">Нет данных для отображения</div>
					</div>
				</template>
			</DataTable>
		</div>
	</div>
</template>
