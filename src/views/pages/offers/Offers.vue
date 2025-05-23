<script setup>
import { useModerateOffer, useOffers } from '@/composables/useOffers'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const profileStore = useProfileStore()

const offerStatuses = [
	{ name: 'Все', code: 'all' },
	{ name: 'Активные', code: 'actived' },
	{ name: 'На модерации', code: 'moderation' },
	{ name: 'Отклоненные', code: 'rejected' },
	{ name: 'В черновике', code: 'draft' },
	{ name: 'В архиве', code: 'archived' },
]

const status = ref('all')
const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const {
	data: offersData,
	isLoading: isLoadingProfiles,
	error,
} = useOffers(status, search, page, limit)

const offers = computed(() => {
	return offersData?.value || []
})

const toast = useToast()
const dt = ref()
const moderationDialog = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const statusOptions = ref([
	{ name: 'Активный', code: 'actived' },
	{ name: 'Заблокирован', code: 'rejected' },
])

const offerItem = ref({
	firstName: '',
	lastName: '',
	phone: '',
	city: '',
	accountId: '',
	profileType: '',
})

const { mutate: moderateOffer, isPending: isModeratingOffer } = useModerateOffer({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Отзыв подтвержден',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось подтвердить отзыв',
			life: 3000,
		})
	},
})

function saveNewProfile() {
	submitted.value = true
	moderateOffer({
		id: offerItem.value.id,
		moderationData: {
			profile_id: profileStore.profileID,
			status: offerItem.value.status.code,
			moderation_comment: offerItem.value.comment,
		},
	})
}

const submitted = ref(false)

function openNew(event) {
	offerItem.value = {
		firstName: '',
		lastName: '',
		phone: '',
		city: '',
		accountId: event.data.accountId,
		profileType: '',
		id: event.data.id,
	}
	submitted.value = false
	moderationDialog.value = true
}

function hideDialog() {
	moderationDialog.value = false
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

const router = useRouter()

function rowClick(event) {
	router.push(`/offers/${event.data.id}`)
}
</script>

<template>
	<div>
		<div class="card">
			<DataTable
				ref="dt"
				:expanded-rows="expandedRows"
				:value="offers.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="offers.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${offers.count} элементов`"
				:rowHover="true"
				selectionMode="single"
				@rowClick="rowClick"
				:loading="isLoadingProfiles"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Предложения</h4>
						<div class="flex gap-x-2">
							<Select
								v-model="status"
								:options="offerStatuses"
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

				<Column field="id" header="ID" sortable style="min-width: 12rem"></Column>
				<Column field="title" header="Название" sortable style="min-width: 12rem"></Column>
				<Column field="description" header="Описание" sortable style="min-width: 12rem">
					<template #body="slotProps">
						<span class="text-ellipsis line-clamp-3" :title="slotProps.data.description">{{
							slotProps.data.description
						}}</span>
					</template>
				</Column>
				<Column
					field="subcategoryId"
					header="Подкатегория"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column field="price" header="Стоимость" sortable style="min-width: 8rem"></Column>
				<Column field="offerStatus" header="Статус" sortable style="min-width: 10rem"></Column>
				<Column field="createdAt" header="Дата создания" sortable style="min-width: 12rem"></Column>
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
				<template #expansion="slotProps">
					<div v-if="slotProps.data.profile" class="p-4">
						<div class="flex items-start gap-x-20">
							<div>
								<h5>Изображения</h5>
								<Image
									v-for="image in slotProps.data.images"
									:src="'https://aidoo-test.ru/api-admin/files/' + image"
									alt="Image"
									width="250"
								/>
							</div>
							<div>
								<h5>Адрес</h5>
								<p class="text-lg">{{ slotProps.data.location.address }}</p>
							</div>
						</div>
						<h5>Информация о пользователе</h5>
						<DataTable :value="[slotProps.data.profile]">
							<Column field="_id" header="ID" style="min-width: 8rem" sortable></Column>
							<Column field="first_name" header="Имя" style="min-width: 6rem" sortable></Column>
							<Column field="last_name" header="Фамилия" style="min-width: 6rem" sortable></Column>
							<Column field="city" header="Город" style="min-width: 6rem" sortable></Column>
						</DataTable>
					</div>
					<div v-else>
						<h5>Информация о пользователе отсутствует</h5>
					</div>
				</template>
				<template #empty>
					<div class="flex items-center justify-center">
						<div class="text-gray-500 text-lg py-8">Нет данных для отображения</div>
					</div>
				</template>
			</DataTable>
		</div>

		<!-- Диалог для модерирования оффера -->
		<Dialog
			v-model:visible="moderationDialog"
			:style="{ width: '450px' }"
			header="Модерирование предложения"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<div class="block font-bold mb-3">Статус профиля</div>
					<Select
						v-model="offerItem.status"
						:options="statusOptions"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
						:invalid="submitted && !offerItem.status"
					/>
					<small v-if="submitted && !offerItem.status" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<div class="block font-bold mb-3">Комментарий модератора</div>
					<Textarea
						v-model="offerItem.comment"
						placeholder="Комментарий"
						class="w-full"
						:invalid="submitted && !offerItem.comment"
					/>
					<p class="text-right mb-0">{{ offerItem.comment?.length }} / 30</p>
					<small v-if="submitted && offerItem.comment?.length < 30" class="text-red-500"
						>Обязательное поле. Минимум 30 символов</small
					>
				</div>
			</div>

			<template #footer>
				<Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
				<Button
					label="Сохранить"
					icon="pi pi-check"
					@click="saveNewProfile"
					:loading="isModeratingOffer"
				/>
			</template>
		</Dialog>
	</div>
</template>
