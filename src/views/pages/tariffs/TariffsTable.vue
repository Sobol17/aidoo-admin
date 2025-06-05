<script setup>
import {
	useCreateTariff,
	useDeleteTariff,
	useTariffs,
	useUpdateTariff,
} from '@/composables/useTariffs'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const deleteCityDialog = ref(false)
const cityDialog = ref(false)

const { data: tariffsData, isLoading: isLoadingCities } = useTariffs(search, page, limit)

const tariffsList = computed(() => {
	return tariffsData?.value || []
})

const toast = useToast()
const dt = ref()
const isEdit = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const newTariff = ref({})

const { mutate: createTariff, isPending: creatingTariff } = useCreateTariff({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Тариф успешно добавлен',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Ошибка при добавлении тарифа',
			life: 3000,
		})
	},
})

const { mutate: updateTariff, isPending: updatingCity } = useUpdateTariff({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Информация о тарифе обновлена',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Произошла ошибка',
			life: 3000,
		})
	},
})

function saveNewCity() {
	submitted.value = true
	if (isEdit.value) {
		updateTariff({
			id: newTariff.value.id,
			tariff: {
				name: newTariff.value.name,
				price: newTariff.value.price,
				duration: newTariff.value.duration,
				profile_id: profileStore.profileID,
			},
		})
	} else {
		createTariff({
			name: newTariff.value.name,
			price: newTariff.value.price,
			duration: newTariff.value.duration,
			profile_id: profileStore.profileID,
		})
	}
}

const submitted = ref(false)

function openNew() {
	newTariff.value = {}
	submitted.value = false
	cityDialog.value = true
}

function hideDialog() {
	cityDialog.value = false
	deleteCityDialog.value = false
	isEdit.value = false
	submitted.value = false
}

function editCity(item) {
	isEdit.value = true
	newTariff.value = {
		...item,
	}
	cityDialog.value = true
}

const { mutate: deleteTariff, isPending: isDeletingCity } = useDeleteTariff({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Город успешно удален',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Произошла ошибка',
			life: 3000,
		})
	},
})

function handleDeleteDialog() {
	deleteTariff(newTariff.value.id)
	hideDialog()
}

function confirmDeleteTariff(item) {
	newTariff.value.id = item.id
	deleteCityDialog.value = true
}

const expandedRows = ref([])

// function exportCSV() {
// 	dt.value.exportCSV()
// }

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
			<Toolbar class="mb-6">
				<template #end>
					<Button
						label="Добавить"
						icon="pi pi-plus"
						severity="secondary"
						class="mr-2"
						@click="openNew"
					/>
				</template>
			</Toolbar>
			<DataTable
				v-model:expandedRows="expandedRows"
				ref="dt"
				:value="tariffsList.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="tariffsList.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${tariffsList.count} элементов`"
				:loading="isLoadingCities"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
				removableSort
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Управление тарифами</h4>
						<div class="flex gap-x-2">
							<IconField>
								<InputIcon>
									<i class="pi pi-search" />
								</InputIcon>
								<InputText @input="handleSearch" placeholder="Поиск" />
							</IconField>
						</div>
					</div>
				</template>

				<Column field="name" header="Название" sortable style="min-width: 12rem"></Column>
				<Column field="price" header="Цена" sortable style="min-width: 12rem"></Column>
				<Column
					field="duration"
					header="Длительность (в месяцах)"
					sortable
					style="min-width: 8rem"
				></Column>
				<Column
					field="creatorName"
					header="Имя создателя"
					sortable
					style="min-width: 8rem"
				></Column>
				<Column field="creatorId" header="ID создателя" sortable style="min-width: 8rem"></Column>
				<Column field="createdAt" header="Дата создания" sortable style="min-width: 10rem"></Column>
				<Column
					field="updatedAt"
					header="Дата обновления"
					sortable
					style="min-width: 10rem"
				></Column>
				<Column :exportable="false" style="min-width: 12rem">
					<template #body="slotProps">
						<Button
							icon="pi pi-pencil"
							outlined
							rounded
							class="mr-2"
							@click="editCity(slotProps.data)"
						/>
						<Button
							icon="pi pi-trash"
							outlined
							rounded
							severity="danger"
							@click="confirmDeleteTariff(slotProps.data)"
						/>
					</template>
				</Column>
				<template #empty>
					<div class="flex items-center justify-center">
						<div class="text-gray-500 text-lg py-8">Нет данных для отображения</div>
					</div>
				</template>
			</DataTable>
		</div>

		<!-- Диалог для редактирования профиля -->
		<Dialog v-model:visible="cityDialog" :style="{ width: '450px' }" header="Тариф	" :modal="true">
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">ID</label>
					<InputText
						id="name"
						v-model.trim="newTariff.id"
						required="true"
						autofocus
						:invalid="submitted && !newTariff.id"
						fluid
						disabled
					/>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Название</label>
					<InputText
						id="name"
						v-model.trim="newTariff.name"
						required="true"
						autofocus
						:invalid="submitted && !newTariff.name"
						fluid
					/>
					<small v-if="submitted && !newTariff.name" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Цена (число в рублях)</label>
					<InputNumber
						id="name"
						v-model.trim="newTariff.price"
						required="true"
						autofocus
						:invalid="submitted && !newTariff.price"
						fluid
					/>
					<small v-if="submitted && !newTariff.price" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Длительность (кол-во месяцев)</label>
					<InputNumber
						id="name"
						v-model.trim="newTariff.duration"
						required="true"
						autofocus
						:invalid="submitted && !newTariff.duration"
						fluid
					/>
					<small v-if="submitted && !newTariff.duration" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
			</div>

			<template #footer>
				<Button
					label="Отменить"
					icon="pi pi-times"
					text
					@click="hideDialog"
					:loading="updatingCity || creatingTariff"
				/>
				<Button
					label="Сохранить"
					icon="pi pi-check"
					@click="saveNewCity"
					:loading="updatingCity || creatingTariff"
				/>
			</template>
		</Dialog>

		<Dialog
			v-model:visible="deleteCityDialog"
			:style="{ width: '450px' }"
			header="Подтверждение"
			:modal="true"
		>
			<div class="flex items-center gap-4">
				<i class="pi pi-exclamation-triangle !text-3xl" />
				Вы уверены, что хотите удалить тариф {{ newTariff.name }}?
			</div>
			<template #footer>
				<Button label="Нет" icon="pi pi-times" text @click="deleteCityDialog = false" />
				<Button
					label="Да"
					icon="pi pi-check"
					@click="handleDeleteDialog"
					:loading="isDeletingCity"
				/>
			</template>
		</Dialog>
	</div>
</template>
