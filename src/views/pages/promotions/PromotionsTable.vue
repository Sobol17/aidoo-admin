<script setup>
import { useUploadFile } from '@/composables/useFiles'
import {
	useCreatePromotion,
	useDeletePromotion,
	usePromotions,
	useUpdatePromotion,
} from '@/composables/userPromotions'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const promotionTypes = [
	{ name: 'Поднятие в поиске', code: 'up_search' },
	{ name: 'Выделение цветом', code: 'color_raise' },
]

const promotionVariants = [
	{ name: '1 раз / день', price: 100, duration: 1 },
	{ name: '3 раза / дня', price: 1000, duration: 3 },
	{ name: '7 раз / дней', price: 1500, duration: 7 },
]

const selectedPromotionType = ref(null)
const selectedPromotionVariants = ref(null)

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(1000)

const deleteCityDialog = ref(false)
const cityDialog = ref(false)

const { data: promotionsData, isLoading: isLoadingCities } = usePromotions(search, page, limit)

const promotionsList = computed(() => {
	return promotionsData?.value || []
})

const toast = useToast()
const dt = ref()
const isEdit = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const newPromotion = ref({})

const { mutate: createPromotions, isPending: creatingTariff } = useCreatePromotion({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Продвижение успешно добавлено',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Ошибка при добавлении продвижения',
			life: 3000,
		})
	},
})

const { mutate: updatePromotion, isPending: updatingCity } = useUpdatePromotion({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Информация о продвижении обновлена',
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
		updatePromotion({
			id: newPromotion.value.id,
			promotion: {
				name: newPromotion.value.name,
				icon_id: newPromotion.value.iconId,
				promotion_type: selectedPromotionType.value.code,
				profile_id: profileStore.profileID,
				types: selectedPromotionVariants.value,
			},
		})
	} else {
		createPromotions({
			name: newPromotion.value.name,
			icon_id: newPromotion.value.iconId,
			promotion_type: selectedPromotionType.value.code,
			profile_id: profileStore.profileID,
			types: selectedPromotionVariants.value,
		})
	}
}

const submitted = ref(false)

function openNew() {
	newPromotion.value = {}
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
	newPromotion.value = {
		...item,
	}
	selectedPromotionType.value = promotionTypes.find(
		type => type.duration === item.promotionType.duration
	)
	selectedPromotionVariants.value = item.types
	cityDialog.value = true
}

const { mutate: deletePromotion, isPending: isDeletingCity } = useDeletePromotion({
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
	deletePromotion(newPromotion.value.id)
	hideDialog()
}

function confirmDeleteTariff(item) {
	newPromotion.value.id = item.id
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

const src = ref(null)

const onUpload = e => {
	src.value = e.files[0].objectURL

	const formData = new FormData()
	formData.append('document', e.files[0])
	uploadFile(formData)
}

const { mutate: uploadFile, isPending: isFileUploading } = useUploadFile({
	onSuccess: data => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Файл загружен успешно',
			life: 3000,
		})
		newPromotion.value.iconId = data._id
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не загрузить файл',
			life: 3000,
		})
	},
})
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
				:value="promotionsList.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="promotionsList.count"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${promotionsList.count} элементов`"
				:loading="isLoadingCities"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
				removableSort
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Продвижения</h4>
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

				<Column expander style="min-width: 5px" />

				<Column field="iconId" header="Изображение" style="min-width: 8rem">
					<template #body="slotProps">
						<Image
							v-if="slotProps.data.iconId"
							:src="'https://aidoo-test.ru/api-admin/files/' + slotProps.data.iconId"
							shape="circle"
							class="size-8"
						/>
						<div v-else class="flex items-center justify-center size-8 bg-gray-200 rounded-full">
							<i class="pi pi-user" />
						</div>
					</template>
				</Column>
				<Column field="name" header="Название" sortable style="min-width: 12rem"></Column>
				<Column
					field="promotionType"
					header="Тип продвижения"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column field="types" header="Услуги" sortable style="min-width: 8rem">
					<template #body="slotProps">
						<p>{{ slotProps.data.types?.length }}</p>
					</template>
				</Column>
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
				<template #expansion="slotProps">
					<div class="p-4">
						<h5>Типы (услуги)</h5>
						<div
							class="mb-2 pb-2 border-b border-solid border-gray"
							v-for="(type, index) in slotProps.data.types"
							:key="index"
						>
							<p class="mb-1"><span class="font-bold">Название:</span> {{ type.name }}</p>
							<p class="mb-1"><span class="font-bold">Цена:</span> {{ type.price }}</p>
							<p class="mb-1"><span class="font-bold">Длительность:</span> {{ type.duration }}</p>
						</div>
					</div>
				</template>
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
			header="Продвижение"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">ID</label>
					<InputText
						id="name"
						v-model.trim="newPromotion.id"
						required="true"
						autofocus
						:invalid="submitted && !newPromotion.id"
						fluid
						disabled
					/>
				</div>
				<div>
					<div class="block font-bold mb-3">Файл</div>
					<FileUpload
						mode="basic"
						@select="onUpload"
						customUpload
						auto
						severity="secondary"
						class="p-button-outlined"
						chooseLabel="Выбрать"
					/>
					<img
						v-if="newPromotion.iconId"
						:src="'https://aidoo-test.ru/api-admin/files/' + newPromotion.iconId"
						alt="Image"
						class="shadow-md rounded-xl w-full size-40 sm:w-64 mt-4"
					/>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Название</label>
					<InputText
						id="name"
						v-model.trim="newPromotion.name"
						required="true"
						autofocus
						:invalid="submitted && !newPromotion.name"
						fluid
					/>
					<small v-if="submitted && !newPromotion.name" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Тип продвижения</label>
					<Select
						v-model="selectedPromotionType"
						:options="promotionTypes"
						optionLabel="name"
						placeholder="Выберите тип продвижения"
						class="w-full"
					/>
					<small v-if="submitted && !selectedPromotionType" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Варианты продвижения</label>
					<MultiSelect
						v-model="selectedPromotionVariants"
						:options="promotionVariants"
						optionLabel="name"
						placeholder="Выберите варианты продвижения"
						class="w-full"
						:maxSelectedLabels="3"
						filter
					/>
					<small v-if="submitted && selectedPromotionVariants?.length <= 0" class="text-red-500"
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
				Вы уверены, что хотите удалить продвижение {{ newPromotion.name }}?
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
