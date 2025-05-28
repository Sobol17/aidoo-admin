<script setup>
import {
	useAccounts,
	useCreateAccount,
	useDeleteAccount,
	useUpdateAccount,
} from '@/composables/useAdminAccounts'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const profileStore = useProfileStore()

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const { data: accountsData, isLoading, error } = useAccounts(search, page, limit)

const accounts = computed(() => {
	return accountsData?.value || []
})

const toast = useToast()
const dt = ref()
const productDialog = ref(false)
const deleteProductDialog = ref(false)

const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const accountIdToDelete = ref(null)

const isEdit = ref(false)

const newAccount = ref({
	phone: '',
	password: '',
})

const numericPhone = computed(() => {
	return parseInt(newAccount.value.phone.replace(/\D/g, ''))
})

const { mutate: createAccount, isPending: isCreatingNewAccount } = useCreateAccount({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Аккаунт успешно создан',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось создать аккаунт',
			life: 3000,
		})
	},
})

const { mutate: updateAccount, isPending: isUpdatingAccount } = useUpdateAccount({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Аккаунт успешно обновлен',
			life: 3000,
		})
		hideDialog()
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

function saveNewAccount() {
	if (isEdit.value) {
		updateAccount({
			id: newAccount.value.id,
			accountData: {
				is_blocked: true,
				phone: numericPhone.value,
				password: newAccount.value.password,
				profile_id: profileStore.profileID,
			},
		})
	} else {
		createAccount({
			phone: numericPhone.value,
			password: newAccount.value.password,
			profile_id: profileStore.profileID,
		})
	}
}

const submitted = ref(false)

function openNew() {
	isEdit.value = false
	newAccount.value = {
		phone: '',
		password: '',
	}
	submitted.value = false
	productDialog.value = true
}

function hideDialog() {
	productDialog.value = false
	deleteProductDialog.value = false
	submitted.value = false
}

function editProduct(accountElement) {
	isEdit.value = true
	newAccount.value = { ...accountElement }
	productDialog.value = true
}

function confirmDeleteProduct(accountElement) {
	accountIdToDelete.value = accountElement.id
	deleteProductDialog.value = true
}

const { mutate: useDelete, isPending: isDeletingAccount } = useDeleteAccount({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Аккаунт успешно удален',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Не удалось удалить аккаунт',
			life: 3000,
		})
	},
})

function deleteAccount() {
	useDelete(accountIdToDelete.value)
}

function createPassword() {
	let id = ''
	const chars = 'abcdef0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()'
	for (let i = 0; i < 10; i++) {
		id += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return id
}

function generateRandomPassword() {
	newAccount.value.password = createPassword()
}

const router = useRouter()

function rowClick(event) {
	router.push(`/admin-accounts/${event.data.id}`)
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
				:value="accounts.items"
				stripedRows
				dataKey="id"
				:paginator="true"
				:rows="limit"
				:total-records="accounts.count"
				:lazy="true"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[7, 10, 25]"
				:currentPageReportTemplate="`{first} до {last} из ${accounts.count} элементов`"
				@rowClick="rowClick"
				:rowHover="true"
				selectionMode="single"
				:loading="isLoading"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Сотрудники</h4>
						<IconField>
							<InputIcon>
								<i class="pi pi-search" />
							</InputIcon>
							<InputText @input="handleSearch" placeholder="Поиск" />
						</IconField>
					</div>
				</template>

				<Column
					field="creatorID"
					header="Создатель (ID)"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column field="phone" header="Телефон" sortable style="min-width: 16rem"></Column>
				<Column field="roles" header="Роли" style="min-width: 16rem">
					<template #body="slotProps">
						<div v-if="slotProps.data.roles?.length > 0" class="flex items-center gap-x-1">
							<span v-for="role in slotProps.data.roles" :key="role">{{ role }}</span>
						</div>
						<span v-else>-</span>
					</template>
				</Column>
				<Column field="id" header="ID" sortable style="min-width: 16rem"></Column>
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
							icon="pi pi-pencil"
							outlined
							rounded
							class="mr-2"
							@click="editProduct(slotProps.data)"
						/>
						<Button
							icon="pi pi-trash"
							outlined
							rounded
							severity="danger"
							@click="confirmDeleteProduct(slotProps.data)"
						/>
					</template>
				</Column>
			</DataTable>
		</div>

		<!-- Диалог для создания нового аккаунта -->
		<Dialog
			v-model:visible="productDialog"
			:style="{ width: '450px' }"
			header="Информация об аккаунте"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">ID</label>
					<InputText
						id="id"
						v-model.trim="newAccount.id"
						required="true"
						autofocus
						:invalid="submitted && !newAccount.id"
						fluid
						disabled
					/>
					<small v-if="submitted && !newAccount.id" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Телефон</label>
					<InputText
						id="phone"
						v-model.trim="newAccount.phone"
						required="true"
						autofocus
						:invalid="submitted && !newAccount.phone"
						fluid
					/>
					<small v-if="submitted && !newAccount.phone" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div class="flex justify-between items-end gap-x-3 mb-4">
					<div class="grow">
						<label for="name" class="block font-bold mb-3">Пароль</label>
						<InputText
							id="name"
							v-model.trim="newAccount.password"
							required="true"
							autofocus
							:invalid="submitted && !newAccount.password"
							fluid
						/>
						<small v-if="submitted && !newAccount.password" class="text-red-500"
							>Обязательное поле</small
						>
					</div>
					<Button
						@click="generateRandomPassword"
						class="shrink-0"
						label="Сгенерировать"
						outlined
						:loading="isCreatingNewAccount"
					/>
				</div>
			</div>

			<template #footer>
				<Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
				<Button label="Сохранить" icon="pi pi-check" @click="saveNewAccount" />
			</template>
		</Dialog>

		<Dialog
			v-model:visible="deleteProductDialog"
			:style="{ width: '450px' }"
			header="Подтверждение"
			:modal="true"
		>
			<div class="flex items-center gap-4">
				<i class="pi pi-exclamation-triangle !text-3xl" />
				Вы уверены, что хотите удалить аккаунт c id {{ accountIdToDelete }}?
			</div>
			<template #footer>
				<Button label="Нет" icon="pi pi-times" text @click="deleteProductDialog = false" />
				<Button label="Да" icon="pi pi-check" @click="deleteAccount" :loading="isDeletingAccount" />
			</template>
		</Dialog>
	</div>
</template>
