<script setup>
import Chat from '@/components/Chat.vue'
import FileComponent from '@/components/FileComponent.vue'
import {
	useComplaintMessages,
	useComplaints,
	useSendMessage,
	useUpdateComplaint,
} from '@/composables/useComplaints'
import { useUploadFile } from '@/composables/useFiles'
import { useProfileStore } from '@/stores/profile'
import { FilterMatchMode } from '@primevue/core/api'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const profileStore = useProfileStore()

const selectedComplaintStatus = ref({ name: 'Все', code: 'all' })

const statusOptions = ref([
	{ name: 'Все', code: 'all' },
	{ name: 'Активные', code: 'actived' },
	{ name: 'Закрытые', code: 'closed' },
	{ name: 'В работе', code: 'in_progress' },
	{ name: 'Важные', code: 'important' },
])

const { data: complaintsData, isLoading: isLoadingReviews } = useComplaints(selectedComplaintStatus)

const complaints = computed(() => {
	return complaintsData?.value || []
})

const toast = useToast()
const dt = ref()

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const messagesDialog = ref(false)
const chatId = ref(null)

const expandedRows = ref([])

const {
	data: messagesData,
	isLoading: isLoadingMessages,
	refetch: fetchMessages,
} = useComplaintMessages(chatId)

const messages = computed(() => {
	return (messagesData?.value || []).slice().sort((a, b) => {
		return new Date(a.timestamp) - new Date(b.timestamp)
	})
})

function openDetailModal(item) {
	chatId.value = item.id
	messagesDialog.value = true
	fetchMessages()
}

const { mutate: sendMessage, isPending: isCreatingNewAdv } = useSendMessage({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Сообщение отправлено',
			life: 3000,
		})
	},
})

function handleSendMessage(message) {
	sendMessage({
		complaint_id: chatId.value,
		profile_id: profileStore.profileID,
		text: message.text,
		attachments: message.attachments,
	})
}

const closeComplaintDialog = ref(false)

const complaintTemp = ref({})

const files = ref([])

const submitted = ref(false)

const menu = ref(null)

function toggleMenu(event) {
	menu.value.toggle(event)
}

function getMenuItems(rowData) {
	return [
		{
			label: 'Ответить',
			command: () => {
				handleAnswer(rowData)
			},
		},
		{
			label: 'Закрыть',
			command: () => {
				handleClose(rowData)
			},
		},
		{
			label: 'Поделится',
			command: () => {
				handleShare(rowData)
			},
		},
	]
}

function handleAnswer(rowData) {
	openDetailModal(rowData)
}

function handleClose(rowData) {
	closeComplaintDialog.value = true
	complaintTemp.value = { ...rowData }
}

function handleShare(rowData) {
	const currentUrl = window.location.origin + window.location.pathname + '?id=' + rowData.id
	navigator.clipboard
		.writeText(currentUrl)
		.then(() => {
			toast.add({
				severity: 'success',
				summary: 'Успешно',
				detail: 'Ссылка скопирована в буфер обмена',
				life: 3000,
			})
		})
		.catch(() => {
			toast.add({
				severity: 'error',
				summary: 'Ошибка',
				detail: 'Не удалось скопировать ссылку',
				life: 3000,
			})
		})
}

const { mutate: uploadFile, isPending: isFileUploading } = useUploadFile({
	onSuccess: data => {
		files.value.push(data)
	},
})

function onUpload(e) {
	for (const item of e.files) {
		const formData = new FormData()
		formData.append('document', item)
		try {
			uploadFile(formData)
		} catch {
			console.error('Ошибка загрузки файла:', item.name)
		}
	}

	toast.add({
		severity: 'info',
		summary: 'Завершено',
		detail: 'Загрузка файлов завершена',
		life: 3000,
	})
}

const { mutate: updateComplaint } = useUpdateComplaint({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Статус жалобы изменен',
			life: 3000,
		})
		closeComplaintDialog.value = false
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: `Не удалось изменить статус жалобы ${error}`,
			life: 3000,
		})
	},
})

const changeComplaintStatus = (remember = false) => {
	updateComplaint({
		id: complaintTemp.value.id,
		complaint: {
			profile_id: profileStore.profileID,
			message: complaintTemp.value.comment,
			status: !remember ? 'closed' : 'important',
		},
	})
}

const route = useRoute()

onMounted(() => {
	const complaintId = route.query.id
	if (complaintId) {
		openDetailModal({ id: complaintId })
	}
})
</script>

<template>
	<div>
		<div class="card">
			<h3>Жалобы</h3>
			<DataTable
				v-model:expanded-rows="expandedRows"
				ref="dt"
				:value="complaints.complaints"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="7"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
				:loading="isLoadingReviews"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Всего: {{ complaints.countComplaints }}</h4>
						<div class="flex items-center gap-x-2">
							<Select
								v-model="selectedComplaintStatus"
								:options="statusOptions"
								optionLabel="name"
								placeholder="Статус платежа"
								class="w-full"
							/>
							<IconField>
								<InputIcon>
									<i class="pi pi-search" />
								</InputIcon>
								<InputText v-model="filters['global'].value" placeholder="Поиск" />
							</IconField>
						</div>
					</div>
				</template>

				<Column expander style="width: 5rem" />

				<Column field="id" header="ID" sortable style="min-width: 8rem"></Column>
				<Column
					field="profileId"
					header="ID пользователя"
					sortable
					style="min-width: 8rem"
				></Column>
				<Column field="status" header="Статус" sortable style="min-width: 8rem"></Column>
				<Column field="text" header="Сообщение" sortable style="min-width: 8rem">
					<template #body="slotProps">
						<span>{{ slotProps.data.text }}</span>
					</template>
				</Column>
				<Column field="objectType" header="Сущность" sortable style="min-width: 8rem"> </Column>
				<Column field="objectId" header="ID сущности" sortable style="min-width: 8rem"> </Column>
				<Column field="createdAt" header="Дата создания" sortable style="min-width: 12rem">
				</Column>
				<Column :exportable="false" style="min-width: 12rem">
					<template #body="slotProps">
						<div class="flex gap-x-2">
							<div class="flex items-center gap-x-4">
								<Button
									type="button"
									label="Ответить"
									@click="handleAnswer(slotProps.data)"
									style="width: auto"
								/>
								<Button
									type="button"
									label="Закрыть"
									@click="handleClose(slotProps.data)"
									style="width: auto"
								/>
								<Button
									type="button"
									label="Поделиться"
									@click="handleShare(slotProps.data)"
									style="width: auto"
								/>
							</div>
						</div>
					</template>
				</Column>
				<template #expansion="slotProps">
					<div class="p-4">
						<h5>Детальная информация</h5>
						<div v-if="slotProps.data.profile" class="p-4">
							<div class="flex gap-20">
								<div>
									<h5>Вложения</h5>
									<div class="flex flex-wrap gap-4 min-w-[150px]">
										<Image
											v-for="image in slotProps.data.attachments"
											:key="image"
											:src="'https://aidoo-test.ru/api-admin/files/' + image"
											alt="Image"
											width="50"
										/>
									</div>
								</div>
							</div>
							<h5>Информация о пользователе</h5>
							<DataTable :value="[slotProps.data.profile]">
								<Column field="avatar_id" header="Аватар" style="min-width: 8rem" sortable>
									<template #body="slotProps">
										<Avatar
											v-if="slotProps.data.avatar_id"
											:image="'https://aidoo-test.ru/api-admin/files/' + slotProps.data.avatar_id"
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
								<Column field="_id" header="ID" style="min-width: 8rem" sortable></Column>
								<Column field="first_name" header="Имя" style="min-width: 6rem" sortable></Column>
								<Column
									field="last_name"
									header="Фамилия"
									style="min-width: 6rem"
									sortable
								></Column>
								<Column
									field="profile_type"
									header="Роль"
									style="min-width: 6rem"
									sortable
								></Column>
							</DataTable>
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

		<Dialog
			v-model:visible="messagesDialog"
			:style="{ width: '850px' }"
			header="История сообщений"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<ProgressSpinner
					v-if="isLoadingMessages"
					style="width: 30px; height: 30px"
					strokeWidth="8"
				/>
				<div v-else>
					<Chat :messages="messages" @sendMessage="handleSendMessage" />
				</div>
			</div>

			<template #footer>
				<Button label="Закрыть" @click="messagesDialog = false" />
			</template>
		</Dialog>

		<!-- Диалог для закрытия жалобы -->
		<Dialog
			v-model:visible="closeComplaintDialog"
			:style="{ width: '450px' }"
			header="Отчет о жалобе"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<div class="block font-bold mb-3">Вложение</div>
					<FileUpload
						mode="basic"
						@select="onUpload"
						customUpload
						auto
						severity="secondary"
						class="p-button-outlined"
						chooseLabel="Выбрать"
						multiple
					/>
					<div v-if="files" class="flex flex-wrap gap-2 mt-2">
						<FileComponent
							v-for="(attachment, index) in files"
							:key="index"
							:file="attachment"
							mini
							download
						/>
					</div>
				</div>
				<div>
					<div class="block font-bold mb-3">Ваш комментарий</div>
					<Textarea
						v-model="complaintTemp.comment"
						placeholder="Комментарий"
						class="w-full"
						:invalid="submitted && !complaintTemp.comment"
					/>
					<p class="text-right">{{ complaintTemp.comment?.length }} / 30</p>
					<small v-if="submitted && !complaintTemp.comment" class="text-red-500"
						>Обязательное поле. Минимум 30 символов</small
					>
				</div>
			</div>

			<template #footer>
				<Button label="Запомнить" @click="changeComplaintStatus(true)" :loading="isFileUploading" />
				<Button
					label="Отправить"
					@click="changeComplaintStatus"
					:loading="isFileUploading"
					:disabled="complaintTemp.status !== 'В работе'"
				/>
			</template>
		</Dialog>
	</div>
</template>
