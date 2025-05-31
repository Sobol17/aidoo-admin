<script setup>
import { useCities, useCreateCity, useDeleteCity, useUpdateCity } from '@/composables/useCities'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const cityStatus = [
	{ name: 'Активен', code: 'actived' },
	{ name: 'Неактивен', code: 'inactive' },
]

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const deleteCityDialog = ref(false)
const cityDialog = ref(false)

const { data: citiesData, isLoading: isLoadingCities } = useCities(search, page, limit)

const cities = computed(() => {
	return citiesData?.value || []
})

const toast = useToast()
const dt = ref()
const isEdit = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const newCity = ref({})

const { mutate: createCity, isPending: creatingCity } = useCreateCity({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Город успешно добавлен',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Город уже существует',
			life: 3000,
		})
	},
})

const { mutate: updateCity, isPending: updatingCity } = useUpdateCity({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Информация о городе обновлена',
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
		updateCity({
			id: newCity.value.id,
			city: {
				status: newCity.value.status.code,
				profile_id: profileStore.profileID,
			},
		})
	} else {
		createCity({
			name: newCity.value.name,
			profile_id: profileStore.profileID,
		})
	}
}

const submitted = ref(false)

function openNew() {
	newCity.value = {}
	submitted.value = false
	cityDialog.value = true
}

function hideDialog() {
	cityDialog.value = false
	deleteCityDialog.value = false
	isEdit.value = false
	submitted.value = false
}

function editCity(city) {
	isEdit.value = true
	newCity.value = {
		...city,
		status: cityStatus.find(s => s.name === city.status),
	}
	cityDialog.value = true
}

const { mutate: deleteCity, isPending: isDeletingCity } = useDeleteCity({
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
	deleteCity(newCity.value.id)
	hideDialog()
}

function confirmDeleteCity(city) {
	newCity.value.id = city.id
	newCity.value.name = city.name
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
				:value="cities.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="cities.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${cities.count} элементов`"
				:loading="isLoadingCities"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
				removableSort
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Города</h4>
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

				<Column field="name" header="Название города" sortable style="min-width: 12rem"></Column>
				<Column field="status" header="Статус" sortable style="min-width: 8rem"></Column>
				<Column field="lat" header="Широта" sortable style="min-width: 10rem"></Column>
				<Column field="lon" header="Долгота" sortable style="min-width: 10rem"></Column>
				<Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
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
							@click="confirmDeleteCity(slotProps.data)"
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
		<Dialog
			v-model:visible="cityDialog"
			:style="{ width: '450px' }"
			header="Информация о городе"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">Название города</label>
					<InputText
						id="name"
						v-model.trim="newCity.name"
						required="true"
						autofocus
						:invalid="submitted && !newCity.name"
						fluid
						disabled
					/>
					<small v-if="submitted && !newCity.name" class="text-red-500">Обязательное поле</small>
				</div>
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">Статус</label>
					<Select
						v-model="newCity.status"
						:options="cityStatus"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
					/>
					<small v-if="submitted && !newCity.name" class="text-red-500">Обязательное поле</small>
				</div>
				<div v-if="!isEdit">
					<label for="name" class="block font-bold mb-3">Название города</label>
					<InputText
						id="city"
						v-model.trim="newCity.name"
						required="true"
						autofocus
						:invalid="submitted && !newCity.name"
						fluid
					/>
					<small v-if="submitted && !newCity.name" class="text-red-500">Обязательное поле</small>
				</div>
			</div>

			<template #footer>
				<Button
					label="Отменить"
					icon="pi pi-times"
					text
					@click="hideDialog"
					:loading="updatingCity || creatingCity"
				/>
				<Button
					label="Сохранить"
					icon="pi pi-check"
					@click="saveNewCity"
					:loading="updatingCity || creatingCity"
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
				Вы уверены, что хотите удалить город {{ newCity.name }}?
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
