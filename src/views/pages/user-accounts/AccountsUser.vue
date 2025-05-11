<script setup>
import {
	useAccounts,
	useDeleteAccount,
	useUpdateAccount,
} from '@/composables/useUserAccounts'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { FilterMatchMode } from '@primevue/core/api'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const {
	data: accountsData,
	isLoading,
	error,
} = useAccounts(search, page, limit)

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

const { mutate: updateAccount, isPending: isUpdatingAccount } =
	useUpdateAccount({
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
const confirm = useConfirm()

const confirmBlock = userElement => {
	confirm.require({
		message: 'Вы уверены, что хотите заблокировать этот аккаунт?',
		header: 'Подтверждение блокировки',
		icon: 'pi pi-exclamation-triangle',
		acceptLabel: 'Да',
		rejectLabel: 'Нет',
		acceptClass: 'p-button-danger',
		accept: () => {
			updateAccount({
				id: userElement.id,
				accountData: {
					blocked: true,
				},
			})
			toast.add({
				severity: 'info',
				summary: 'Выполнено',
				detail: 'Аккаунт заблокирован',
				life: 3000,
			})
		},
		reject: () => {
			// Действие отменено
		},
	})
}

const confirmUnblock = userElement => {
	confirm.require({
		message: 'Вы уверены, что хотите разблокировать этот аккаунт?',
		header: 'Подтверждение разблокировки',
		icon: 'pi pi-exclamation-triangle',
		acceptLabel: 'Да',
		rejectLabel: 'Нет',
		acceptClass: 'p-button-danger',
		accept: () => {
			updateAccount({
				id: userElement.id,
				accountData: {
					blocked: false,
				},
			})
			toast.add({
				severity: 'info',
				summary: 'Выполнено',
				detail: 'Аккаунт разблокирован',
				life: 3000,
			})
		},
		reject: () => {
			// Действие отменено
		},
	})
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
				:loading="isLoading"
				@page="handleChangePage"
				@update:rows="handleChangeLimit"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Аккаунты (МП)</h4>
						<IconField>
							<InputIcon>
								<i class="pi pi-search" />
							</InputIcon>
							<InputText @input="handleSearch" placeholder="Поиск" />
						</IconField>
					</div>
				</template>

				<Column
					field="id"
					header="ID"
					sortable
					style="min-width: 16rem"
				></Column>
				<Column
					field="phone"
					header="Телефон"
					sortable
					style="min-width: 16rem"
				></Column>
				<Column
					field="blocked"
					header="Блокировка"
					style="min-width: 16rem"
				></Column>
				<Column
					field="violation"
					header="Нарушение"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="punishment_type"
					header="Тип наказания"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="punishment_duration"
					header="Срок наказания"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column :exportable="false" style="min-width: 12rem">
					<template #body="slotProps">
						<div class="flex items-center gap-x-2">
							<Button
								icon="pi pi-trash"
								outlined
								rounded
								severity="danger"
								@click="confirmDeleteProduct(slotProps.data)"
							/>
							<Button
								v-if="slotProps.data.blocked === 'Активен'"
								label="Заблокировать"
								icon="pi pi-check"
								severity="help"
								outlined
								@click="confirmBlock(slotProps.data)"
								class="p-button-lg"
							/>
							<Button
								v-else
								label="Разблокировать"
								icon="pi pi-check"
								severity="help"
								outlined
								@click="confirmUnblock(slotProps.data)"
								class="p-button-lg"
							/>
						</div>
					</template>
				</Column>
			</DataTable>
		</div>

		<!-- Диалог для изменения аккаунта -->

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
				<Button
					label="Нет"
					icon="pi pi-times"
					text
					@click="deleteProductDialog = false"
				/>
				<Button
					label="Да"
					icon="pi pi-check"
					@click="deleteAccount"
					:loading="isDeletingAccount"
				/>
			</template>
		</Dialog>
	</div>
	<ConfirmDialog />
</template>
