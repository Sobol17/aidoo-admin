<script setup>
import { useUpdateAccount } from '@/composables/useAdminAccounts'
import { useCityById } from '@/composables/useCities'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const statusOptions = ref([
	{ name: 'Активный', code: 'actived' },
	{ name: 'Заблокирован', code: 'rejected' },
])
const { data, isPending: isLoadingProfile } = useCityById(route.params.id)

const userData = computed(() => data.value)

const formFields = ref({
	title: 'Title',
})
const userProfile = ref({})
const correctFields = ref([])
const isModerationDialogShow = ref(false)

const toast = useToast()

const submitted = ref(false)

// Форматирование даты в удобный формат
const formatDate = dateString => {
	if (!dateString) return 'Нет данных'
	const date = new Date(dateString)
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date)
}

const { mutate: updateAccount, isPending: isUpdatingAccount } = useUpdateAccount({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Аккаунт успешно обновлен',
			life: 3000,
		})
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось обновить аккаунт',
			life: 3000,
		})
	},
})

const isFormCorrect = computed(() => {
	return correctFields.value.length === Object.keys(formFields.value).length
})

const handleToggleField = field => {
	if (!correctFields.value.includes(field)) {
		correctFields.value.push(field)
	} else {
		correctFields.value = correctFields.value.filter(f => f !== field)
	}
}

const moderateProfile = () => {}
</script>

<template>
	<div class="account-container">
		<Toast />
		<div v-if="isLoadingProfile" class="flex justify-content-center align-items-center pt-5">
			<ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
			<span class="ml-3 font-bold">Загрузка данных...</span>
		</div>
		<div v-else-if="!userData" class="flex justify-content-center align-items-center pt-5">
			<Message severity="error" text="Пользователь не найден" />
		</div>
		<div v-else class="grid">
			<div class="col-12 md:col-4 lg:col-3">
				<Card class="h-full">
					<template #header>
						<div class="flex justify-content-center p-4">
							<Avatar
								icon="pi pi-user"
								size="xlarge"
								class="mb-3"
								style="width: 8rem; height: 8rem; font-size: 5rem"
							/>
						</div>
					</template>
					<template #title>
						<div class="text-left">
							<h3 class="text-xl mt-0 mb-2">Профиль в мобильном приложении</h3>
							<p class="m-0 text-sm text-500">ID: {{ userData._id }}</p>
						</div>
					</template>
					<template #content>
						<div class="flex flex-column gap-x-8 py-3">
							<div>
								<span class="font-semibold text-lg block mb-2">Создан:</span>
								<p class="m-0">{{ formatDate(userData.created_at) }}</p>
							</div>
							<div>
								<span class="font-semibold text-lg block mb-2">Обновлен:</span>
								<p class="m-0">{{ formatDate(userData.updated_at) }}</p>
							</div>
							<div>
								<span class="font-semibold text-lg block mb-2">ID создателя:</span>
								<p class="m-0">{{ userData.creator_id || 'Не указан' }}</p>
							</div>
						</div>
					</template>
				</Card>
			</div>

			<div class="col-12 md:col-8 lg:col-9 mt-4">
				<Card>
					<template #content>
						<h3>Детальная информация</h3>
						<p class="text-lg">Проверьте корректность заполненной информации</p>

						<!-- form -->
						<div class="flex flex-col gap-6">
							<div class="max-w-[520px] flex gap-x-8 items-center">
								<InputText
									id="firstName"
									placeholder="Text1"
									v-model.trim="formFields.title"
									required="true"
									autofocus
									:invalid="submitted && !formFields.title"
									fluid
								/>

								<div class="shrink-0 flex gap-x-2">
									<p class="mb-1">Корректность</p>

									<ToggleSwitch @change="handleToggleField('title')" />
								</div>
							</div>
						</div>
					</template>
					<template #footer>
						<div class="flex gap-4 mt-2">
							<Button label="Сохранить" severity="secondary" outlined />
							<Button
								@click="isModerationDialogShow = true"
								label="Одобрить"
								:disabled="!isFormCorrect"
							/>
						</div>
					</template>
				</Card>
			</div>
		</div>

		<Dialog
			v-model:visible="isModerationDialogShow"
			:style="{ width: '450px' }"
			header="Модерирование профиля (МП)"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<div class="block font-bold mb-3">Статус профиля</div>
					<Select
						v-model="userProfile.status"
						:options="statusOptions"
						optionLabel="name"
						placeholder="Выберите статус"
						class="w-full"
						:invalid="submitted && !userProfile.status"
					/>
					<small v-if="submitted && !userProfile.status" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div>
					<div class="block font-bold mb-3">Комментарий модератора</div>
					<Textarea
						v-model="userProfile.comment"
						placeholder="Комментарий"
						class="w-full"
						:invalid="submitted && !userProfile.comment"
					/>
					<p class="text-right">{{ userProfile.comment?.length }} / 30</p>
					<small v-if="submitted && !userProfile.comment" class="text-red-500"
						>Обязательное поле. Минимум 30 символов</small
					>
				</div>
			</div>

			<template #footer>
				<Button label="Отменить" icon="pi pi-times" text @click="isModerationDialogShow = false" />
				<Button label="Сохранить" icon="pi pi-check" @click="moderateProfile" />
			</template>
		</Dialog>
	</div>
</template>

<style lang="scss" scoped>
.account-container {
	max-width: 1400px;
	margin: 0 auto;
	padding: 2rem;
}

@media screen and (max-width: 768px) {
	.account-container {
		padding: 1rem 0.5rem;
	}
}
</style>
