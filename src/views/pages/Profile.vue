<template>
	<div class="profile-page">
		<div class="flex flex-col gap-y-4">
			<div>
				<!-- Карточка профиля -->
				<Card class="profile-card">
					<template #header>
						<div
							class="profile-header flex flex-column items-center"
							:class="{ 'justify-center': isLoading || error }"
						>
							<div v-if="isLoading" class="p-4 text-center">
								<ProgressSpinner style="width: 50px; height: 50px" />
								<p>Загрузка данных...</p>
							</div>
							<div v-else-if="error" class="p-4 text-center">
								<i
									class="pi pi-exclamation-triangle text-xl text-red-500 mb-2"
								></i>
								<p>Ошибка загрузки профиля: {{ error.message }}</p>
								<Button
									label="Повторить"
									icon="pi pi-refresh"
									@click="refetch"
									class="mt-2"
								/>
							</div>
							<template v-else>
								<h2 class="profile-name mt-3 mb-1">
									{{ user.firstName + ' ' + user.lastName }}
								</h2>
								<p class="profile-role mb-3">{{ formattedRole }}</p>
							</template>
						</div>
					</template>
					<template #content>
						<div v-if="!isLoading && !error" class="profile-stats grid">
							<div class="profile-contact">
								<div class="flex items-center mb-3">
									<i class="pi pi-user mr-2"></i>
									<span>Account ID: {{ user.accountId }}</span>
								</div>
								<div class="flex items-center mb-3">
									<i class="pi pi-phone mr-2"></i>
									<span>{{ user.phone }}</span>
								</div>
								<div class="flex items-center mb-3">
									<i class="pi pi-map-marker mr-2"></i>
									<span>{{ user.city }}</span>
								</div>
							</div>
						</div>
						<!--						<div-->
						<!--							v-if="!isLoading && !error"-->
						<!--							class="profile-actions mt-4 flex justify-content-center"-->
						<!--						>-->
						<!--							<Button-->
						<!--								label="Редактировать профиль"-->
						<!--								icon="pi pi-user-edit"-->
						<!--								class="p-button-rounded p-button-outlined"-->
						<!--								@click="openEditDialog"-->
						<!--							/>-->
						<!--						</div>-->
					</template>
				</Card>
			</div>

			<div>
				<!-- Вкладки информации -->
				<Card>
					<template #content>
						<TabMenu v-model="activeTab" :model="tabs" />

						<div class="mt-4" v-if="activeTab === 0">
							<h3>Настройки</h3>
							<div class="field mt-3">
								<div class="flex items-center gap-x-8 mb-4">
									<label>Допуск Уведомления</label>
									<InputSwitch v-model="settings.emailNotifications" />
								</div>
							</div>
						</div>
					</template>
				</Card>
			</div>
		</div>

		<!-- Диалог редактирования профиля -->
		<Dialog
			v-model:visible="showEditDialog"
			header="Редактировать профиль"
			:style="{ width: '500px' }"
			:modal="true"
		>
			<div v-if="isProfileUpdating" class="flex justify-content-center p-4">
				<ProgressSpinner style="width: 50px; height: 50px" />
				<p class="ml-3">Сохранение изменений...</p>
			</div>
			<div v-else class="grid p-fluid">
				<div class="col-12 flex justify-content-center mb-3">
					<Avatar
						:image="user.avatarId || '/layout/images/avatar-placeholder.png'"
						size="xlarge"
						shape="circle"
					/>
				</div>
				<div class="col-12 mb-3">
					<div class="flex items-center gap-x-2">
						<span>
							<i class="pi pi-user"></i>
						</span>
						<InputText
							class="w-full"
							v-model="editUser.firstName"
							placeholder="Имя"
						/>
					</div>
				</div>
				<div class="col-12 mb-3">
					<div class="flex items-center gap-x-2">
						<span>
							<i class="pi pi-user"></i>
						</span>
						<InputText
							class="w-full"
							v-model="editUser.lastName"
							placeholder="Фамилия"
						/>
					</div>
				</div>
				<div class="col-12 mb-3">
					<div class="flex items-center gap-x-2">
						<span>
							<i class="pi pi-phone"></i>
						</span>
						<InputText
							class="w-full"
							v-model="editUser.phone"
							placeholder="Телефон"
						/>
					</div>
				</div>
				<div class="col-12 mb-3">
					<div class="flex items-center gap-x-2">
						<span>
							<i class="pi pi-map-marker"></i>
						</span>
						<InputText
							class="w-full"
							v-model="editUser.city"
							placeholder="Город"
						/>
					</div>
				</div>
			</div>
			<template #footer>
				<Button
					label="Отмена"
					icon="pi pi-times"
					class="p-button-text"
					@click="showEditDialog = false"
					:disabled="isProfileUpdating"
				/>
				<Button
					label="Сохранить"
					icon="pi pi-check"
					@click="saveProfile"
					:disabled="isProfileUpdating"
					:loading="isProfileUpdating"
				/>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { useProfile, useProfileMutation } from '@/composables/useProfile'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import { computed, reactive, ref } from 'vue'

const toast = useToast()
const showEditDialog = ref(false)
const activeTab = ref(0)

const tabs = ref([
	{
		label: 'Настройки',
		icon: 'pi pi-cog',
		command: () => (activeTab.value = 2),
	},
])

const { data: profileData, isLoading, error, refetch } = useProfile()

const user = computed(() => {
	return (
		profileData?.value || {
			firstName: 'Загрузка...',
			lastName: '',
			avatarId: 'string',
			profileType: '',
			accountId: '',
			phone: '',
			city: '',
			status: '',
		}
	)
})

const formattedRole = computed(() => {
	const roleMap = {
		admin: 'Администратор',
		moderator: 'Модератор',
	}

	return (
		roleMap[user.value.profileType] ||
		user.value.profileType ||
		'Неизвестная роль'
	)
})

const editUser = reactive({})

function openEditDialog() {
	Object.assign(editUser, user.value)
	showEditDialog.value = true
}

const settings = reactive({
	emailNotifications: true,
	twoFactorAuth: false,
})

const { mutate: updateProfileMutation, isPending: isProfileUpdating } =
	useProfileMutation({
		onSuccess: () => {
			showEditDialog.value = false

			toast.add({
				severity: 'success',
				summary: 'Успех',
				detail: 'Профиль успешно обновлен',
				life: 3000,
			})
		},
		onError: error => {
			toast.add({
				severity: 'error',
				summary: 'Ошибка',
				detail: `Не удалось обновить профиль: ${error.message}`,
				life: 3000,
			})
		},
	})

function saveProfile() {
	// Вызываем мутацию для обновления профиля
	updateProfileMutation(editUser)
}
</script>

<style lang="scss" scoped>
.profile-page {
	.profile-card {
		.profile-header {
			padding: 1rem 1rem 0 1rem;
			column-gap: 1rem;
		}

		.profile-name {
			font-weight: 600;
		}

		.profile-role {
			color: var(--text-color-secondary);
		}
	}

	.profile-stats {
		border-top: 1px solid var(--surface-border);
		border-bottom: 1px solid var(--surface-border);
		padding: 1rem 0;
		margin: 1rem 0;
	}

	.activity-title {
		margin-bottom: 0.5rem;
	}

	.activity-description {
		margin-bottom: 0.5rem;
	}

	.activity-time {
		font-style: italic;
	}
}
</style>
