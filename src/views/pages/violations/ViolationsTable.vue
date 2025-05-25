<script setup>
import { useDeleteFaq, useUpdateFaq } from '@/composables/useFaq'
import { useAccounts } from '@/composables/useUserAccounts'
import { useCreateViolation, useViolations } from '@/composables/useViolations'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'

const profileStore = useProfileStore()

const violationReasons = [
	{ name: 'Сообщение в тематическом чате', code: 'thematic_message' },
	{ name: 'Сообщение в приватном чате', code: 'private_message' },
	{ name: 'Отзыв об объявлении', code: 'review' },
]

const violationPunishments = [
	{ name: 'Ограничение доступа', code: 'limitation' },
	{ name: 'Текстовое предупреждение', code: 'text_warning' },
	{ name: 'Удаление причины нарушения', code: 'deletion' },
]

const punishmentDurationList = [
	{ name: '1 час', code: '1' },
	{ name: '6 часов', code: '6' },
	{ name: '24 часа', code: '24' },
	{ name: '24 часа', code: '24' },
	{ name: '72 часа', code: '72' },
	{ name: '168 часов', code: '168' },
	{ name: 'Навсегда', code: 'permanent' },
]

function getViolationTime(value) {
	const nowUtc = new Date()

	let resultTime

	if (value === 'permanent') {
		resultTime = new Date(nowUtc)
		resultTime.setUTCFullYear(resultTime.getUTCFullYear() + 10)
	} else {
		const hours = Number(value)
		if (isNaN(hours)) {
			throw new Error('Invalid input: must be a number or "permanent"')
		}
		resultTime = new Date(nowUtc.getTime() + hours * 60 * 60 * 1000)
	}

	return resultTime.toISOString() // формат UTC ISO
}

const selectedReason = ref(null)
const selectedPunishment = ref(null)
const selectedPunishmentTime = ref(null)
const selectedAccountId = ref(null)

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

// for user accounts
const userListSearch = ref('')
const userListPage = ref(1)
const userListLimit = ref(20)

const deleteCityDialog = ref(false)
const cityDialog = ref(false)

const { data: violationData, isLoading: isLoadingCities } = useViolations(search, page, limit)

const violationList = computed(() => {
	return violationData?.value || []
})

const { data: userAccountsData, isLoading: isLoadingUserAccounts } = useAccounts(
	userListSearch,
	userListPage,
	userListLimit
)

const userAccounts = ref([])

watch(userAccountsData, newData => {
	const newItems = newData?.items || []
	const transformed = newItems.map(account => ({
		name: account.phone,
		code: account.id,
	}))

	userAccounts.value.push(...transformed)
})

const userAccountsTotalPages = computed(() => {
	return Math.ceil(userAccountsData.value?.count / userListLimit.value)
})

const onLazyLoadUsers = () => {
	if (userAccountsTotalPages.value <= userListPage.value) return

	userListPage.value++
}

const userAccountsScrollOptions = ref({
	lazy: true,
	onLazyLoad: onLazyLoadUsers,
	itemSize: 38,
	delay: 400,
})

const toast = useToast()
const dt = ref()
const isEdit = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const newViolation = ref({})

const { mutate: createViolation, isPending: creatingCity } = useCreateViolation({
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

const { mutate: updateFaq, isPending: updatingCity } = useUpdateFaq({
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
		updateFaq({
			id: newViolation.value.id,
			faq: {
				question: newViolation.value.question,
				answer: newViolation.value.answer,
				profile_id: profileStore.profileID,
			},
		})
	} else {
		createViolation({
			account_id: selectedAccountId.value.code,
			profile_id: profileStore.profileID,
			reason: selectedReason.value.code,
			description: newViolation.value.description,
			images: '',
			type_punishment: selectedPunishment,
			date_to: getViolationTime(selectedPunishmentTime),
		})
	}
}

const submitted = ref(false)

function openNew() {
	newViolation.value = {}
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
	newViolation.value = {
		...item,
	}
	cityDialog.value = true
}

const { mutate: deleteFaq, isPending: isDeletingCity } = useDeleteFaq({
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
	deleteFaq(newViolation.value.id)
	hideDialog()
}

function confirmDeleteCity(item) {
	newViolation.value.id = item.id
	newViolation.value.question = item.question
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
						label="Оформить нарушение"
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
				:value="violationList.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="violationList.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${violationList.count} элементов`"
				:loading="isLoadingCities"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Нарушения</h4>
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

				<Column expander style="width: 5rem" />

				<Column field="accountId" header="ID аккаунта" sortable style="min-width: 12rem"></Column>
				<Column field="reason" header="Причина нарушения" sortable style="min-width: 8rem"></Column>
				<Column
					field="typePunishment"
					header="Тип наказания"
					sortable
					style="min-width: 10rem"
				></Column>
				<Column field="createdAt" header="Дата начала" sortable style="min-width: 10rem"></Column>
				<Column field="dateTo" header="Дата окончания" sortable style="min-width: 10rem"></Column>
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
				<template #expansion="slotProps">
					<div class="p-4">
						<h5>Детальная информация</h5>
						<div v-if="slotProps.data.images" class="p-4">
							<div class="flex flex-col gap-20">
								<div>
									<h5>Описание</h5>
									<div class="text-lg">
										{{ slotProps.data.description }}
									</div>
								</div>
								<div>
									<h5>Вложения</h5>
									<div class="flex flex-wrap gap-4 min-w-[150px]">
										<Image
											v-for="image in slotProps.data.images"
											:key="image"
											:src="'https://aidoo-test.ru/api-admin/files/' + image"
											alt="Image"
											width="50"
										/>
									</div>
								</div>
							</div>
						</div>
						<div v-else>
							<h5>Информация о пользователе отсутствует</h5>
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
			header="Оформить нарушение"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">ID</label>
					<InputText
						id="name"
						v-model.trim="newViolation.id"
						required="true"
						autofocus
						:invalid="submitted && !newViolation.id"
						fluid
						disabled
					/>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">ID профиля</label>
					<Select
						v-model="selectedAccountId"
						:options="userAccounts"
						optionLabel="name"
						placeholder="Выберите профиль"
						class="w-full"
						:virtualScrollerOptions="userAccountsScrollOptions"
					/>
					<small v-if="submitted && !selectedReason" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Причина нарушения</label>
					<Select
						v-model="selectedReason"
						:options="violationReasons"
						optionLabel="name"
						placeholder="Укажите причину нарушения"
						class="w-full"
					/>
					<small v-if="submitted && !selectedReason" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Тип наказания</label>
					<Select
						v-model="selectedPunishment"
						:options="violationPunishments"
						optionLabel="name"
						placeholder="Выберите тип наказания"
						class="w-full"
					/>
					<small v-if="submitted && !selectedPunishment" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Длительность наказания</label>
					<Select
						v-model="selectedPunishmentTime"
						:options="punishmentDurationList"
						optionLabel="name"
						placeholder="Укажите длительность наказания"
						class="w-full"
					/>
					<small v-if="submitted && !selectedPunishmentTime" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Описание</label>
					<Textarea
						id="name"
						v-model.trim="newViolation.description"
						required="true"
						autofocus
						:invalid="submitted && !newViolation.description"
						fluid
						placeholder="Введите комментарий к нарушению. Минимум 30 символов"
					/>
					<small v-if="submitted && !newViolation.description" class="text-red-500"
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
				Вы уверены, что хотите удалить Вопрос {{ newViolation.question }}?
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
