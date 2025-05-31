<script setup>
import { useModerateOffer, useOffers } from '@/composables/useOffers'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { Button, Textarea } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

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
	{ name: 'Активный', code: 'verified' },
	{ name: 'Заблокирован', code: 'rejected' },
])

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

const submitted = ref(false)

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

const selectedModerationOffer = ref({})
const moderationFields = ref(null)

const commentLength = computed(() => {
	return selectedModerationOffer.value.moderationComment?.length
})

const isModerationSuccess = computed(() => {
	return Object.values(moderationFields.value).every(field => field.correct === true)
})

const progressValue = computed(() => {
	const fields = Object.values(moderationFields.value)
	const total = fields.length
	const correctCount = fields.filter(field => field.correct === true).length

	return Math.round((correctCount / total) * 100)
})

const rowClick = event => {
	selectedModerationOffer.value = {
		...event.data,
		status: statusOptions.value.find(status => status.name === event.data.offerStatus),
	}

	const baseFields = {
		video: event.data.video,
		title: event.data.title,
		description: event.data.description,
		images: event.data.images,
		location: event.data.location,
		price: event.data.price,
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
	moderationDialog.value = true
}

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
		moderateOffer({
			id: selectedModerationOffer.value.id,
			moderationData: {
				profile_id: profileStore.profileID,
				status: selectedModerationOffer.value.status.code,
				moderation_comment: selectedModerationOffer.value.moderationComment,
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
				removableSort
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
					field="subcategoryName"
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

		<!-- Диалог для модерирования оффера -->
		<Dialog
			v-model:visible="moderationDialog"
			:style="{ width: '950px' }"
			header="Модерирование предложения"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<p>Индикатор корректности</p>
					<ProgressBar :value="progressValue" :showValue="false"></ProgressBar>
				</div>
				<div class="flex flex-wrap justify-between gap-4">
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="firstName">Видео</label>
						<div class="flex gap-x-8 items-center mt-2">
							<video
								v-if="moderationFields.video.value"
								:src="'https://aidoo-test.ru/api-admin/files/' + moderationFields.video.value"
								class="w-[420px]"
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.video.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="firstName">Изображения</label>
						<div v-if="moderationFields.images.value" class="flex gap-x-8 items-center mt-2">
							<Image
								v-for="image in moderationFields.images.value"
								:key="image"
								:src="'https://aidoo-test.ru/api-admin/files/' + image"
								class="w-[240px]"
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.images.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="firstName">Название</label>
						<div class="flex gap-x-8 items-center">
							<Textarea
								disabled
								id="firstName"
								class="mt-2"
								placeholder="Title"
								v-model.trim="moderationFields.title.value"
								required="true"
								autofocus
								:invalid="!moderationFields.title.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.title.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="lastName">Описание</label>
						<div class="flex gap-x-8 items-center">
							<Textarea
								disabled
								id="lastName"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.description.value"
								required="true"
								autofocus
								:invalid="!moderationFields.description.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.description.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="phone">Локация</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="phone"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.location.value"
								required="true"
								autofocus
								:invalid="!moderationFields.location.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.location.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="phone">Стоимость</label>
						<div class="flex gap-x-8 items-center">
							<InputText
								disabled
								id="phone"
								class="mt-2"
								placeholder="Text1"
								v-model.trim="moderationFields.price.value"
								required="true"
								autofocus
								:invalid="!moderationFields.price.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.price.correct" />
							</div>
						</div>
					</div>
				</div>
				<div>
					<div class="block font-bold mb-3">Статус</div>
					<Select
						v-model="selectedModerationOffer.status"
						:options="statusOptions"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
						:invalid="submitted && !selectedModerationOffer.status"
					/>
					<small v-if="submitted && !selectedModerationOffer.status" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<div class="block font-bold mb-3">Комментарий модератора</div>
					<Textarea
						v-model="selectedModerationOffer.moderationComment"
						placeholder="Добавьте ваш комментарий"
						class="w-full"
						:invalid="submitted && !selectedModerationOffer.moderationComment"
					/>
					<p class="text-left">{{ commentLength }} / 30</p>
					<small v-if="submitted && !selectedModerationOffer.comment" class="text-red-500"
						>Обязательное поле. Минимум 30 символов</small
					>
				</div>
			</div>

			<template #footer>
				<Button
					label="Сохранить"
					icon="pi pi-bookmark"
					severity="secondary"
					@click="sendModerationData"
				/>
				<Button
					label="Одобрить"
					icon="pi pi-check"
					@click="sendModerationData"
					:loading="isModeratingOffer"
					:disabled="!isModerationSuccess"
				/>
			</template>
		</Dialog>
	</div>
</template>
