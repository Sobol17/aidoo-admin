<script setup>
import { useModerateUserProfiles, useUserProfiles } from '@/composables/useUserProfiles'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { Image } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const userStatuses = [
	{ name: 'Все', code: 'all' },
	{ name: 'Активные', code: 'actived' },
	{ name: 'На модерации', code: 'modetation' },
	{ name: 'Отклоненные', code: 'rejected' },
]

const userProfileTypes = [
	{ name: 'Все', code: 'all' },
	{ name: 'Партнер', code: 'partner' },
	{ name: 'Клиент', code: 'client' },
]

const status = ref({ code: 'all' })
const profileTypeFilter = ref({ code: 'all' })
const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const { data: profilesData, isLoading: isLoadingProfiles } = useUserProfiles(
	status,
	profileTypeFilter,
	search,
	page,
	limit
)

const profiles = computed(() => {
	return profilesData?.value || []
})

const toast = useToast()
const dt = ref()
const profileDialog = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const statusOptions = ref([
	{ name: 'Активный', code: 'verified' },
	{ name: 'Заблокирован', code: 'rejected' },
])

const { mutate: moderateProfile, isPending: moderationPending } = useModerateUserProfiles({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Информация о профиле изменена',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось изменить информацию о профиле',
			life: 3000,
		})
	},
})

const submitted = ref(false)

function hideDialog() {
	profileDialog.value = false
	submitted.value = false
}

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

const selectedModerationUser = ref({})
const moderationFields = ref(null)

const rowClick = event => {
	selectedModerationUser.value = {
		...event.data,
		status: statusOptions.value.find(status => status.name === event.data.status),
	}

	const baseFields = {
		avatar: event.data.avatar,
		firstName: event.data.firstName,
		lastName: event.data.lastName,
		partnerEmail: event.data.partnerEmail,
		partnerFullName: event.data.partnerFullName,
		partnerInn: event.data.partnerInn,
		partnerPhone: event.data.partnerPhone,
		partnerShortName: event.data.partnerShortName,
		partnerTelegram: event.data.partnerTelegram,
		partnerWhatsapp: event.data.partnerWhatsapp,
		phone: event.data.phone,
		profileType: event.data.profileType,
	}

	if (!event.data.moderationData) {
		moderationFields.value = Object.fromEntries(
			Object.entries(baseFields).map(([key, value]) => [key, { value, correct: false }])
		)
	} else {
		moderationFields.value = Object.fromEntries(
			Object.entries(baseFields).map(([key, value]) => {
				const moderationEntry = event.data.moderationData.find(item => item.field === key)
				return [key, { value, correct: moderationEntry.correct }]
			})
		)
	}
	profileDialog.value = true
}

const isModerationSuccess = computed(() => {
	return Object.values(moderationFields.value).every(field => field.correct === true)
})

const progressValue = computed(() => {
	const fields = Object.values(moderationFields.value)
	const total = fields.length
	const correctCount = fields.filter(field => field.correct === true).length

	return Math.round((correctCount / total) * 100)
})

const commentLength = computed(() => {
	return selectedModerationUser.value.moderationComment?.length
})

const transformModerationFields = moderationFields => {
	return Object.entries(moderationFields).map(([field, data]) => ({
		field,
		correct: data.correct,
		comment: data.comment || '',
	}))
}

const sendModerationData = () => {
	submitted.value = true

	if (commentLength.value > 0) {
		moderateProfile({
			id: selectedModerationUser.value.id,
			moderationData: {
				profile_id: profileStore.profileID,
				status: selectedModerationUser.value.status.code,
				moderation_comment: selectedModerationUser.value.moderationComment,
				moderation_data: transformModerationFields(moderationFields.value),
			},
		})
	}
}
</script>

<template>
	<div>
		<div class="card">
			<DataTable
				v-model:expandedRows="expandedRows"
				ref="dt"
				:value="profiles.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="profiles.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${profiles.count} элементов`"
				:rowHover="true"
				selectionMode="single"
				:loading="isLoadingProfiles"
				@rowClick="rowClick"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Профили (МП)</h4>
						<div class="flex gap-x-2">
							<Select
								v-model="profileTypeFilter"
								:options="userProfileTypes"
								optionLabel="name"
								placeholder="Выберите роль"
								class="w-full"
							/>
							<Select
								v-model="status"
								:options="userStatuses"
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

				<Column field="avatar" header="Аватар" sortable style="min-width: 8rem">
					<template #body="slotProps">
						<Avatar
							v-if="slotProps.data.avatar"
							:image="'https://aidoo-test.ru/api-admin/files/' + slotProps.data.avatar"
							shape="circle"
						/>
						<div v-else class="flex items-center justify-center size-10 bg-gray-200 rounded-full">
							<i class="pi pi-user" />
						</div>
					</template>
				</Column>
				<Column field="accountId" header="Аккаунт (ID)" sortable style="min-width: 12rem"></Column>
				<Column field="phone" header="Телефон" sortable style="min-width: 12rem"></Column>
				<Column field="firstName" header="Имя" sortable style="min-width: 8rem"></Column>
				<Column field="lastName" header="Фамилия" sortable style="min-width: 10rem"></Column>
				<Column field="city" header="Город" sortable style="min-width: 10rem"></Column>
				<Column field="status" header="Статус" sortable style="min-width: 10rem"></Column>
				<Column field="profileType" header="Роль" style="min-width: 10rem"></Column>
				<Column
					field="hasAgreement"
					header="Соглашение на рекламу"
					sortable
					style="min-width: 6rem"
				></Column>
				<Column field="id" header="ID профиля" sortable style="min-width: 12rem"></Column>
				<Column field="createdAt" header="Дата создания" sortable style="min-width: 12rem"></Column>
				<Column :exportable="false" style="min-width: 12rem">
					<template #body="slotProps">
						<Button
							icon="pi pi-file-edit"
							class="mr-2"
							outlined
							label="Модерирование"
							severity="help"
							@click="rowClick(slotProps)"
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

		<!-- Диалог для модерирования профиля -->
		<Dialog
			v-model:visible="profileDialog"
			:style="{ width: '950px' }"
			header="Модерирование профиля (МП)"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<p>Индикатор корректности</p>
					<ProgressBar :value="progressValue" :showValue="false"></ProgressBar>
				</div>
				<div class="flex flex-wrap justify-between gap-4">
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="firstName">Аватар</label>
						<div class="flex gap-x-8 items-center mt-2">
							<Image
								v-if="moderationFields.avatar.value"
								:src="'https://aidoo-test.ru/api-admin/files/' + moderationFields.avatar.value"
								class="w-[240px]"
							/>
							<div v-else class="flex items-center justify-center size-10 bg-gray-200 rounded-full">
								<i class="pi pi-user" />
							</div>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.avatar.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="firstName">Имя</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="firstName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.firstName.value"
								required="true"
								autofocus
								:invalid="!moderationFields.firstName.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.firstName.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="lastName">Фамилия</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="lastName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.lastName.value"
								required="true"
								autofocus
								:invalid="!moderationFields.lastName.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.lastName.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="phone">Телефон</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="phone"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.phone.value"
								required="true"
								autofocus
								:invalid="!moderationFields.phone.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.phone.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="phone">Тип профиля</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="phone"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.profileType.value"
								required="true"
								autofocus
								:invalid="!moderationFields.profileType.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.profileType.correct" />
							</div>
						</div>
					</div>
				</div>
				<h4 class="font-bold">Информация о Партнере</h4>
				<div class="flex flex-wrap justify-between gap-4">
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">Короткое название</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerShortName.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerShortName.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerShortName.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">Полное название</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerFullName.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerFullName.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerFullName.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">Телефон партнера</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerPhone.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerPhone.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerPhone.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">Email партнера</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerEmail.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerEmail.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerEmail.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">WhatsApp партнера</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerWhatsapp.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerWhatsapp.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerWhatsapp.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">Telegram партнера</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerTelegram.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerTelegram.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerTelegram.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="shortName">ИНН партнера</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="shortName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.partnerInn.value"
								required="true"
								autofocus
								:invalid="!moderationFields.partnerInn.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.partnerInn.correct" />
							</div>
						</div>
					</div>
				</div>
				<div>
					<div class="block font-bold mb-3">Статус профиля</div>
					<Select
						v-model="selectedModerationUser.status"
						:options="statusOptions"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
						:invalid="submitted && !selectedModerationUser.status"
					/>
					<small v-if="submitted && !selectedModerationUser.status" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<div class="block font-bold mb-3">Комментарий модератора</div>
					<Textarea
						v-model="selectedModerationUser.moderationComment"
						placeholder="Добавьте ваш комментарий"
						class="w-full"
						:invalid="submitted && !selectedModerationUser.moderationComment"
					/>
					<p class="text-left">{{ commentLength }} / 30</p>
					<small v-if="submitted && !selectedModerationUser.comment" class="text-red-500"
						>Обязательное поле. Минимум 30 символов</small
					>
				</div>
			</div>

			<template #footer>
				<Button
					label="Отклонить"
					icon="pi pi-times"
					severity="danger"
					@click="sendModerationData"
				/>
				<Button
					label="Одобрить"
					icon="pi pi-check"
					@click="sendModerationData"
					:disabled="!isModerationSuccess"
				/>
			</template>
		</Dialog>
	</div>
</template>
