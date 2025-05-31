<script setup>
import { useModerateReview, useReviews } from '@/composables/useReviews'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const reviewStatuses = [
	{ name: 'Все', code: 'all' },
	{ name: 'Подтвержденные', code: 'verified' },
	{ name: 'На модерации', code: 'moderation' },
	{ name: 'Отклоненные', code: 'rejected' },
]

const status = ref('all')
const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(1000)

const { data: reviewsData, isLoading: isLoadingReviews } = useReviews(status, search, page, limit)

const reviews = computed(() => {
	return reviewsData?.value || []
})

const toast = useToast()
const dt = ref()
const moderationDialog = ref(false)
const detailDialog = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const statusOptions = ref([
	{ name: 'Подтвержден', code: 'verified' },
	{ name: 'Отклонен', code: 'rejected' },
])

const reviewItem = ref({
	firstName: '',
	lastName: '',
	phone: '',
	city: '',
	accountId: '',
	profileType: '',
})

const { mutate: moderateReview, isPending: moderationPending } = useModerateReview({
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
	detailDialog.value = false
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

const selectedModerationReview = ref({})
const moderationFields = ref(null)

const commentLength = computed(() => {
	return selectedModerationReview.value.moderationComment?.length
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

const openModerationModal = event => {
	selectedModerationReview.value = {
		...event.data,
		status: statusOptions.value.find(status => status.name === event.data.reviewStatus),
	}

	const baseFields = {
		attachments: event.data.attachments,
		text: event.data.text,
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
		moderateReview({
			id: selectedModerationReview.value.id,
			moderationData: {
				profile_id: profileStore.profileID,
				status: selectedModerationReview.value.status.code,
				moderation_comment: selectedModerationReview.value.moderationComment,
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
				v-model:expanded-rows="expandedRows"
				ref="dt"
				:value="reviews.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="7"
				:total-records="reviews.count"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${reviews.count} элементов`"
				:loading="isLoadingReviews"
				removableSort
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Отзывы</h4>
						<div class="flex gap-x-2">
							<Select
								v-model="status"
								:options="reviewStatuses"
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

				<Column field="grade" sortable="" header="Оценка">
					<template #body="slotProps">
						<Rating :modelValue="slotProps.data.grade" readonly />
					</template>
				</Column>
				<Column field="text" header="Текст" sortable style="min-width: 12rem">
					<template #body="slotProps">
						<span class="text-ellipsis line-clamp-1">{{ slotProps.data.text }}</span>
					</template>
				</Column>
				<Column field="reviewStatus" header="Статус" sortable style="min-width: 12rem"></Column>
				<Column field="author" header="Автор" sortable style="min-width: 8rem">
					<template #body="slotProps">
						<span v-if="slotProps.data.profile">
							{{ slotProps.data.profile.first_name }} {{ slotProps.data.profile.last_name }}
						</span>
						<span v-else>Отсутсвует</span>
					</template>
				</Column>
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
							outlined
							label="Модерирование"
							severity="help"
							@click="openModerationModal(slotProps)"
						/>
					</template>
				</Column>
				<template #expansion="slotProps">
					<div class="p-4">
						<h5>Детальная информация</h5>
						<div class="flex gap-x-20 items-start">
							<div v-if="slotProps.data.profile">
								<div class="text-lg">Автор:</div>
								<p class="mb-2">Имя: {{ slotProps.data.profile.first_name }}</p>
								<p class="mb-2">Фамилия: {{ slotProps.data.profile.last_name ?? 'Отсутвует' }}</p>
								<p class="mb-2">ID: {{ slotProps.data.profile._id }}</p>
								<div class="flex gap-x-2 mb-2">
									<span>Аватар</span>
									<Avatar
										v-if="slotProps.data.profile.avatar_id"
										:image="
											'https://aidoo-test.ru/api-admin/files/' + slotProps.data.profile.avatar_id
										"
										size="xlarge"
										shape="circle"
									/>
									<div
										v-else
										class="flex items-center justify-center size-10 bg-gray-200 rounded-full"
									>
										<i class="pi pi-user" />
									</div>
								</div>
								<span class="mb-2"
									>Город: {{ slotProps.data.profile.city?.name ?? 'Отсутвует' }}</span
								>
							</div>
							<p class="text-lg" v-else>Информация об авторе отсутсвует</p>
							<div class="grow" v-if="slotProps.data.attachments">
								<div class="font-semibold text-lg mb-4">Вложения</div>
								<div class="flex gap-6 items-start flex-wrap">
									<Image
										v-for="attachment in slotProps.data.attachments"
										:key="attachment"
										:src="'https://aidoo-test.ru/api-admin/files/' + attachment"
										alt="Image"
										width="250"
									/>
								</div>
							</div>
							<p v-else class="text-lg">Вложения отсутствуют</p>
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

		<!-- Диалог для модерирования профиля -->
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
						<label class="font-bold" for="firstName">Вложения</label>
						<div v-if="moderationFields.attachments.value" class="flex gap-x-8 items-start mt-2">
							<Image
								v-for="image in moderationFields.attachments.value"
								:key="image"
								:src="'https://aidoo-test.ru/api-admin/files/' + image"
								class="w-[240px]"
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.attachments.correct" />
							</div>
						</div>
					</div>
					<div class="basis-[calc(50%_-_8px)]">
						<label class="font-bold" for="firstName">Текст отзыва</label>
						<div class="flex gap-x-8 items-center">
							<Textarea
								disabled
								id="firstName"
								class="mt-2"
								placeholder="Title"
								v-model.trim="moderationFields.text.value"
								required="true"
								autofocus
								:invalid="!moderationFields.text.correct"
								fluid
							/>
							<div class="shrink-0 flex gap-x-2">
								<p class="mb-1">Корректность</p>

								<ToggleSwitch v-model="moderationFields.text.correct" />
							</div>
						</div>
					</div>
				</div>
				<div>
					<div class="block font-bold mb-3">Статус</div>
					<Select
						v-model="selectedModerationReview.status"
						:options="statusOptions"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
						:invalid="submitted && !selectedModerationReview.status"
					/>
					<small v-if="submitted && !selectedModerationReview.status" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<div class="block font-bold mb-3">Комментарий модератора</div>
					<Textarea
						v-model="selectedModerationReview.moderationComment"
						placeholder="Добавьте ваш комментарий"
						class="w-full"
						:invalid="submitted && !selectedModerationReview.moderationComment"
					/>
					<p class="text-left">{{ commentLength }} / 30</p>
					<small v-if="submitted && !selectedModerationReview.comment" class="text-red-500"
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
					:disabled="!isModerationSuccess"
				/>
			</template>
		</Dialog>
	</div>
</template>
