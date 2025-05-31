<script setup>
import { useAccounts } from '@/composables/useAdminAccounts'
import {
	useAdvertising,
	useCreateAdvertising,
	useDeleteAdvertising,
	useUpdateAdvertising,
} from '@/composables/useAdvertising'
import { useUploadFile } from '@/composables/useFiles'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const advStatuses = [
	{ name: 'Все', code: 'all' },
	{ name: 'Активные', code: 'actived' },
	{ name: 'Отключенные', code: 'draft' },
]

const status = ref({ code: 'all' })
const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const {
	data: advertisingData,
	isLoading: isAdvLoading,
	error,
} = useAdvertising(status, search, page, limit)

const advertisingElements = computed(() => {
	return advertisingData?.value || []
})

const toast = useToast()
const dt = ref()
const advertisingDialog = ref(false)
const deleteAdvertisingDialog = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const advIdToDelete = ref(null)

const isEdit = ref(false)

const advTypes = ref([
	{ name: 'Объявление от Партнера', code: 'offer' },
	{ name: 'Ссылка на внешнего Рекламодателя', code: 'external' },
	{ name: 'Видео реклама', code: 'video' },
])

const linkTypes = ref([
	{ name: 'Внутренняя', code: 'internal' },
	{ name: 'Внешняя', code: 'external' },
])

const advStatus = ref([
	{ name: 'Реклама активна', code: 'actived' },
	{ name: 'Реклама отключена', code: 'draft' },
])

const newAdv = ref({})

const src = ref(null)

const { mutate: uploadFile, isPending: isFileUploading } = useUploadFile({
	onSuccess: data => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Файл загружен успешно',
			life: 3000,
		})
		newAdv.value.fileId = data._id
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

function onUpload(e) {
	src.value = e.files[0].objectURL

	const formData = new FormData()
	formData.append('document', e.files[0])
	uploadFile(formData)
}

const { mutate: createAdv, isPending: isCreatingNewAdv } = useCreateAdvertising({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Профиль успешно создан',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось создать профиль',
			life: 3000,
		})
	},
})

const { mutate: updateAdv, isPending: isUpdatingProfile } = useUpdateAdvertising({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Профиль успешно обновлен',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось обновить профиль',
			life: 3000,
		})
	},
})

const { data: adminAccounts } = useAccounts()

function saveNewAdv() {
	submitted.value = true

	if (isEdit.value) {
		updateAdv({
			id: newAdv.value.id,
			accountData: {
				profile_id: profileStore.profileID,
				type: newAdv.value.type.code,
				link: newAdv.value.link,
				file_id: newAdv.value.fileId,
				link_type: newAdv.value.linkType.code,
				number: newAdv.value.number,
				status: newAdv.value.advStatus.code,
			},
		})
	} else {
		const requestFields = {
			profile_id: profileStore.profileID,
			type: newAdv.value.type.code,
			link: newAdv.value.link,
			link_type: newAdv.value.linkType.code,
			file_id: newAdv.value.fileId,
			number: newAdv.value.number,
			status: newAdv.value.advStatus.code,
		}
		createAdv(requestFields)
	}
}

const submitted = ref(false)

function openNew() {
	isEdit.value = false
	newAdv.value = {}
	src.value = null
	submitted.value = false
	advertisingDialog.value = true
}

function hideDialog() {
	advertisingDialog.value = false
	deleteAdvertisingDialog.value = false
	submitted.value = false
}

function editProfile(advElement) {
	isEdit.value = true

	const offerTypeOption = advTypes.value.find(option => option.name === advElement.type)

	const linkTypeOption = linkTypes.value.find(option => option.name === advElement.linkType)

	const advStatusOptions = advStatus.value.find(option => option.name === advElement.advStatus)

	newAdv.value = {
		...advElement,
		type: offerTypeOption,
		linkType: linkTypeOption,
		advStatus: advStatusOptions,
	}

	console.log(newAdv.value)

	advertisingDialog.value = true
}

function confirmDeleteProfile(profileElement) {
	advIdToDelete.value = profileElement.id
	deleteAdvertisingDialog.value = true
}

const { mutate: useDeleteProfile, isPending: isDeletingProfile } = useDeleteAdvertising({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Профиль успешно удален',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось удалить профиль',
			life: 3000,
		})
	},
})

function deleteProfile() {
	useDeleteProfile(advIdToDelete.value)
}

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
				ref="dt"
				:value="advertisingElements.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="advertisingElements.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${advertisingElements.count} элементов`"
				:loading="isAdvLoading"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
				removableSort
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Реклама</h4>
						<div class="flex gap-x-2">
							<Select
								v-model="status"
								:options="advStatuses"
								optionLabel="name"
								placeholder="Выберите статус"
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
				<Column field="fileId" header="Файл" sortable style="min-width: 8rem">
					<template #body="slotProps">
						<Avatar
							v-if="slotProps"
							:image="'https://aidoo-test.ru/api-admin/files/' + slotProps.data.fileId"
							shape="circle"
						/>
						<div v-else class="flex items-center justify-center size-10 bg-gray-200 rounded-full">
							<i class="pi pi-user" />
						</div>
					</template>
				</Column>
				<Column field="type" header="Тип рекламы" sortable style="min-width: 12rem"></Column>
				<Column field="link" header="Ссылка" sortable style="min-width: 12rem"></Column>
				<Column field="linkType" header="Тип ссылки" sortable style="min-width: 12rem"></Column>
				<Column field="number" header="Номер" sortable style="min-width: 8rem"></Column>
				<Column field="advStatus" header="Активность" sortable style="min-width: 10rem"></Column>
				<Column field="id" header="Рекламодатель" sortable style="min-width: 16rem"></Column>
				<Column field="createdAt" header="Дата создания" sortable style="min-width: 12rem"></Column>
				<Column :exportable="false" style="min-width: 12rem">
					<template #body="slotProps">
						<Button
							icon="pi pi-pencil"
							outlined
							rounded
							class="mr-2"
							@click="editProfile(slotProps.data)"
						/>
						<Button
							icon="pi pi-trash"
							outlined
							rounded
							severity="danger"
							@click="confirmDeleteProfile(slotProps.data)"
						/>
					</template>
				</Column>
			</DataTable>
		</div>

		<!-- Диалог для создания нового аккаунта -->
		<Dialog
			v-model:visible="advertisingDialog"
			:style="{ width: '450px' }"
			:header="isEdit ? 'Редактирование рекламы' : 'Добавление рекламы'"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">ID</label>
					<InputText
						id="id"
						v-model.trim="newAdv.id"
						required="true"
						autofocus
						:invalid="submitted && !newAdv.id"
						fluid
						disabled
					/>
					<small v-if="submitted && !newAdv.id" class="text-red-500">Обязательное поле</small>
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
						v-if="src || 'https://aidoo-test.ru/api-admin/files/' + newAdv.fileId"
						:src="src || 'https://aidoo-test.ru/api-admin/files/' + newAdv.fileId"
						alt="Image"
						class="shadow-md rounded-xl w-full size-40 sm:w-64 mt-4"
					/>
				</div>
				<div>
					<div class="block font-bold mb-3">Тип предложения</div>
					<Select
						v-model="newAdv.type"
						:options="advTypes"
						optionLabel="name"
						placeholder="Выберите тип предложения"
						class="w-full"
						:invalid="submitted && !newAdv.type"
					/>
					<small v-if="submitted && !newAdv.type" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<div class="block font-bold mb-3">Тип ссылки</div>
					<Select
						v-model="newAdv.linkType"
						:options="linkTypes"
						optionLabel="name"
						placeholder="Выберите тип ссылки"
						class="w-full"
						:invalid="submitted && !newAdv.linkType"
					/>
					<small v-if="submitted && !newAdv.linkType" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="firstName" class="block font-bold mb-3">Ссылка</label>
					<InputText
						id="firstName"
						v-model.trim="newAdv.link"
						required="true"
						autofocus
						:invalid="submitted && !newAdv.link"
						fluid
					/>
					<small v-if="submitted && !newAdv.link" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Номер</label>
					<InputText
						id="phone"
						v-model.trim="newAdv.number"
						required="true"
						autofocus
						:invalid="submitted && !newAdv.number"
						fluid
					/>
					<small v-if="submitted && !newAdv.number" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<div class="block font-bold mb-3">Активность</div>
					<Select
						v-model="newAdv.advStatus"
						:options="advStatus"
						optionLabel="name"
						placeholder="Активность"
						class="w-full"
						:invalid="submitted && !newAdv.advStatus"
					/>
					<small v-if="submitted && !newAdv.advStatus" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
			</div>

			<template #footer>
				<Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
				<Button
					label="Сохранить"
					icon="pi pi-check"
					@click="saveNewAdv"
					:loading="isCreatingNewAdv"
				/>
			</template>
		</Dialog>

		<Dialog
			v-model:visible="deleteAdvertisingDialog"
			:style="{ width: '450px' }"
			header="Подтверждение"
			:modal="true"
		>
			<div class="flex items-center gap-4">
				<i class="pi pi-exclamation-triangle !text-3xl" />
				Вы уверены, что хотите удалить рекламу c id {{ advIdToDelete }}?
			</div>
			<template #footer>
				<Button label="Нет" icon="pi pi-times" text @click="deleteAdvertisingDialog = false" />
				<Button label="Да" icon="pi pi-check" @click="deleteProfile" :loading="isDeletingProfile" />
			</template>
		</Dialog>
	</div>
</template>

<style scoped></style>
