<script setup>
import { useSubs } from '@/composables/useSubs'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { formatDate } from '@/utils/formatDate'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const selectedOrderStatus = ref({ name: 'Все', code: 'all' })

const statusOptions = ref([
	{ name: 'Все', code: 'all' },
	{ name: 'Подписка активна', code: 'actived' },
	{ name: 'Подписка истекла', code: 'archived' },
])

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const { data: subsData, isLoading: isLoadingReviews } = useSubs(
	selectedOrderStatus,
	search,
	page,
	limit
)

const subs = computed(() => {
	return subsData?.value || []
})

const dt = ref(null)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const actionOptions = ref([
	{ name: 'Добавление', code: 'add' },
	{ name: 'Удаление', code: 'remove' },
])

const expandedRows = ref([])

function handleChangePage(event) {
	page.value = event.page + 1
	first.value = event.page
}

function handleChangeLimit(newLimit) {
	limit.value = newLimit
}

const handleSearch = debounce(event => {
	search.value = event.target.value
}, 500)
</script>

<template>
	<div>
		<div class="card">
			<h3>Настройка тарифов</h3>
			<DataTable
				v-model:expanded-rows="expandedRows"
				ref="dt"
				:value="subs.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="subs.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${subs.count} элементов`"
				:loading="isLoadingReviews"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Всего: {{ subs.count }}</h4>
						<div class="flex items-center gap-x-2">
							<Select
								v-model="selectedOrderStatus"
								:options="statusOptions"
								optionLabel="name"
								placeholder="Активность"
								class="w-full"
							/>
							<IconField>
								<InputIcon>
									<i class="pi pi-search" />
								</InputIcon>
								<InputText @input="handleSearch" placeholder="Поиск" />
							</IconField>
						</div>
					</div>
				</template>

				<Column expander style="width: 5rem" />

				<Column
					field="userId"
					header="Пользователь"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="startDate"
					header="Дата начала"
					sortable
					style="min-width: 12rem"
				>
				</Column>
				<Column
					field="endDate"
					header="Дата окончания"
					sortable
					style="min-width: 12rem"
				>
				</Column>
				<Column
					field="id"
					header="ID подписки"
					sortable
					style="min-width: 12rem"
				></Column>
				<template #expansion="slotProps">
					<div class="p-4">
						<h5>История</h5>
						<DataTable :value="slotProps.data.history">
							<Column
								field="action"
								header="Действие"
								style="min-width: 8rem"
								sortable
							>
							</Column>
							<Column
								field="amount"
								header="Количество"
								style="min-width: 6rem"
								sortable
							>
							</Column>
							<Column
								field="created_at"
								header="Дата создания"
								style="min-width: 6rem"
								sortable
							>
								<template #body="slotProps">
									<span>{{ formatDate(slotProps.data.created_at) }}</span>
								</template>
							</Column>
							<template #empty>
								<div class="flex items-center justify-center">
									<div class="text-gray-500 text-lg py-8">
										Нет данных для отображения
									</div>
								</div>
							</template>
						</DataTable>
					</div>
				</template>
				<template #empty>
					<div class="flex items-center justify-center">
						<div class="text-gray-500 text-lg py-8">
							Нет данных для отображения
						</div>
					</div>
				</template>
			</DataTable>
		</div>
	</div>
</template>
