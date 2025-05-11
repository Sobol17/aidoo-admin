<script setup>
import {
	useModerateUserProfiles,
	useUserProfiles,
} from '@/composables/useUserProfiles'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

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
	{ name: 'Активный', code: 'actived' },
	{ name: 'Заблокирован', code: 'rejected' },
])

const newCity = ref({
	firstName: '',
	lastName: '',
	phone: '',
	city: '',
	accountId: '',
	profileType: '',
})

const { mutate: moderateProfile, isPending: moderationPending } =
	useModerateUserProfiles({
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

function saveNewProfile() {
	submitted.value = true

	moderateProfile({
		id: newCity.value.id,
		moderationData: {
			profile_id: profileStore.profileID,
			status: newCity.value.status.code,
			moderation_comment: newCity.value.comment,
		},
	})
}

const submitted = ref(false)

function openNew(event) {
	newCity.value = {
		firstName: '',
		lastName: '',
		phone: '',
		city: '',
		accountId: event.data.accountId,
		profileType: '',
		id: event.data.id,
	}
	submitted.value = false
	profileDialog.value = true
}

function hideDialog() {
	profileDialog.value = false
	submitted.value = false
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

const router = useRouter()

function rowClick(event) {
	router.push(`/user-profiles/${event.data.id}`)
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
						<h4 class="m-0">Города</h4>
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

				<Column expander style="width: 5rem" />

				<Column field="avatar" header="Аватар" sortable style="min-width: 8rem">
					<template #body="slotProps">
						<Avatar
							v-if="slotProps.data.avatar"
							:image="
								'https://aidoo-test.ru/api-admin/files/' + slotProps.data.avatar
							"
							shape="circle"
						/>
						<div
							v-else
							class="flex items-center justify-center size-10 bg-gray-200 rounded-full"
						>
							<i class="pi pi-user" />
						</div>
					</template>
				</Column>
				<Column
					field="accountId"
					header="Аккаунт (ID)"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="phone"
					header="Телефон"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="firstName"
					header="Имя"
					sortable
					style="min-width: 8rem"
				></Column>
				<Column
					field="lastName"
					header="Фамилия"
					sortable
					style="min-width: 10rem"
				></Column>
				<Column
					field="city"
					header="Город"
					sortable
					style="min-width: 10rem"
				></Column>
				<Column
					field="status"
					header="Статус"
					sortable
					style="min-width: 10rem"
				></Column>
				<Column
					field="profileType"
					header="Роль"
					style="min-width: 10rem"
				></Column>
				<Column
					field="id"
					header="ID профиля"
					sortable
					style="min-width: 16rem"
				></Column>
				<Column
					field="createdAt"
					header="Дата создания"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="updatedAt"
					header="Дата обновления"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column :exportable="false" style="min-width: 12rem">
					<template #body="slotProps">
						<Button
							icon="pi pi-file-edit"
							class="mr-2"
							outlined
							label="Модерирование"
							severity="help"
							@click="openNew(slotProps)"
						/>
					</template>
				</Column>
				<template #empty>
					<div class="flex items-center justify-center">
						<div class="text-gray-500 text-lg py-8">
							Нет данных для отображения
						</div>
					</div>
				</template>
				<template #expansion="slotProps">
					<div v-if="slotProps.data.partner" class="p-4">
						<h5>
							Информация о партнере {{ slotProps.data.partner.short_name }}
						</h5>
						<DataTable :value="[slotProps.data.partner]">
							<Column
								field="short_name"
								header="Краткое название"
								sortable
							></Column>
							<Column
								field="full_name"
								header="Полное название"
								sortable
							></Column>
							<Column field="phone" header="Телефон" sortable></Column>
							<Column field="city" header="Город" sortable></Column>
							<Column field="email" header="Email" sortable></Column>
							<Column field="whatsapp" header="Whatsapp" sortable></Column>
							<Column field="telegram" header="Telegram" sortable></Column>
							<Column field="inn" header="ИНН" sortable></Column>
						</DataTable>
					</div>
					<div v-else>
						<h5>Информация о партнере отсутствует</h5>
					</div>
				</template>
			</DataTable>
		</div>

		<!-- Диалог для модерирования профиля -->
		<Dialog
			v-model:visible="profileDialog"
			:style="{ width: '450px' }"
			header="Модерирование профиля (МП)"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<div class="block font-bold mb-3">Статус профиля</div>
					<Select
						v-model="newCity.status"
						:options="statusOptions"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
						:invalid="submitted && !newCity.status"
					/>
					<small v-if="submitted && !newCity.status" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<div class="block font-bold mb-3">Комментарий модератора</div>
					<Textarea
						v-model="newCity.comment"
						placeholder="Комментарий"
						class="w-full"
						:invalid="submitted && !newCity.comment"
					/>
					<p class="text-right">{{ newCity.comment?.length }} / 30</p>
					<small v-if="submitted && !newCity.comment" class="text-red-500"
						>Обязательное поле. Минимум 30 символов</small
					>
				</div>
			</div>

			<template #footer>
				<Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
				<Button label="Сохранить" icon="pi pi-check" @click="saveNewProfile" />
			</template>
		</Dialog>
	</div>
</template>
