<script setup>
import { ProductService } from '@/service/ProductService'
import { FilterMatchMode } from '@primevue/core/api'
import { Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { onMounted, ref } from 'vue'

onMounted(() => {
	ProductService.getProducts().then(data => (products.value = data))
})

const toast = useToast()
const dt = ref()
const products = ref()
const productDialog = ref(false)
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const product = ref({})
const selectedProducts = ref()
const filters = ref({
	global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})
const submitted = ref(false)
const statuses = ref([
	{ label: 'INSTOCK', value: 'instock' },
	{ label: 'LOWSTOCK', value: 'lowstock' },
	{ label: 'OUTOFSTOCK', value: 'outofstock' },
])

function formatCurrency(value) {
	if (value)
		return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
	return
}

function openNew() {
	product.value = {}
	submitted.value = false
	productDialog.value = true
}

function hideDialog() {
	productDialog.value = false
	submitted.value = false
}

function saveProduct() {
	submitted.value = true

	if (product?.value.name?.trim()) {
		if (product.value.id) {
			product.value.inventoryStatus = product.value.inventoryStatus.value
				? product.value.inventoryStatus.value
				: product.value.inventoryStatus
			products.value[findIndexById(product.value.id)] = product.value
			toast.add({
				severity: 'success',
				summary: 'Successful',
				detail: 'Product Updated',
				life: 3000,
			})
		} else {
			product.value.id = createId()
			product.value.code = createId()
			product.value.image = 'product-placeholder.svg'
			product.value.inventoryStatus = product.value.inventoryStatus
				? product.value.inventoryStatus.value
				: 'INSTOCK'
			products.value.push(product.value)
			toast.add({
				severity: 'success',
				summary: 'Successful',
				detail: 'Product Created',
				life: 3000,
			})
		}

		productDialog.value = false
		product.value = {}
	}
}

function editProduct(prod) {
	product.value = { ...prod }
	productDialog.value = true
}

function confirmDeleteProduct(prod) {
	product.value = prod
	deleteProductDialog.value = true
}

function deleteProduct() {
	products.value = products.value.filter(val => val.id !== product.value.id)
	deleteProductDialog.value = false
	product.value = {}
	toast.add({
		severity: 'success',
		summary: 'Successful',
		detail: 'Product Deleted',
		life: 3000,
	})
}

function findIndexById(id) {
	let index = -1
	for (let i = 0; i < products.value.length; i++) {
		if (products.value[i].id === id) {
			index = i
			break
		}
	}

	return index
}

function createId() {
	let id = ''
	var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	for (var i = 0; i < 5; i++) {
		id += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return id
}

function exportCSV() {
	dt.value.exportCSV()
}

function confirmDeleteSelected() {
	deleteProductsDialog.value = true
}

function deleteSelectedProducts() {
	products.value = products.value.filter(
		val => !selectedProducts.value.includes(val)
	)
	deleteProductsDialog.value = false
	selectedProducts.value = null
	toast.add({
		severity: 'success',
		summary: 'Successful',
		detail: 'Products Deleted',
		life: 3000,
	})
}
</script>

<template>
	<div>
		<div class="card">
			<Toolbar class="mb-6">
				<template #start>
					<Button
						label="Добавить"
						icon="pi pi-plus"
						severity="secondary"
						class="mr-2"
						@click="openNew"
					/>
					<Button
						label="Удалить"
						icon="pi pi-trash"
						severity="secondary"
						@click="confirmDeleteSelected"
						:disabled="!selectedProducts || !selectedProducts.length"
					/>
				</template>
			</Toolbar>

			<DataTable
				ref="dt"
				v-model:selection="selectedProducts"
				:value="products"
				dataKey="id"
				:paginator="true"
				:rows="10"
				:filters="filters"
				paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
				:rowsPerPageOptions="[5, 10, 25]"
				currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
			>
				<template #header>
					<div class="flex flex-wrap gap-2 items-center justify-between">
						<h4 class="m-0">Аккаунты</h4>
						<IconField>
							<InputIcon>
								<i class="pi pi-search" />
							</InputIcon>
							<InputText
								v-model="filters['global'].value"
								placeholder="Поиск"
							/>
						</IconField>
					</div>
				</template>

				<Column
					selectionMode="multiple"
					style="width: 3rem"
					:exportable="false"
				></Column>
				<Column
					field="creator_id"
					header="Создатель (ID)"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="phone"
					header="Телефон"
					sortable
					style="min-width: 16rem"
				></Column>
				<Column
					field="password"
					header="Пароль"
					sortable
					style="min-width: 16rem"
				></Column>
				<Column
					field="_id"
					header="ID"
					sortable
					style="min-width: 16rem"
				></Column>
				<Column
					field="created_at"
					header="Дата создания"
					sortable
					style="min-width: 12rem"
				></Column>
				<Column
					field="updated_at"
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

		<Dialog
			v-model:visible="productDialog"
			:style="{ width: '450px' }"
			header="Информация об аккаунте"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div>
					<label for="name" class="block font-bold mb-3">Телефон</label>
					<InputText
						id="name"
						v-model.trim="product.name"
						required="true"
						autofocus
						:invalid="submitted && !product.name"
						fluid
					/>
					<small v-if="submitted && !product.name" class="text-red-500"
						>Обязательное поле</small
					>
				</div>
				<div class="flex justify-between items-end gap-x-3">
					<div class="grow">
						<label for="name" class="block font-bold mb-3">ID</label>
						<InputText
							id="name"
							v-model.trim="product.name"
							required="true"
							autofocus
							:invalid="submitted && !product.name"
							fluid
						/>
						<small v-if="submitted && !product.name" class="text-red-500"
							>Обязательное поле</small
						>
					</div>
					<Button class="shrink-0" label="Сгенерировать" icon="pi pi-check" />
				</div>

				<div class="flex justify-between items-end gap-x-3">
					<div class="grow">
						<label for="name" class="block font-bold mb-3">Пароль</label>
						<InputText
							id="name"
							v-model.trim="product.name"
							required="true"
							autofocus
							:invalid="submitted && !product.name"
							fluid
						/>
						<small v-if="submitted && !product.name" class="text-red-500"
							>Обязательное поле</small
						>
					</div>
					<Button class="shrink-0" label="Сгенерировать" icon="pi pi-check" />
				</div>
			</div>

			<template #footer>
				<Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
				<Button label="Save" icon="pi pi-check" @click="saveProduct" />
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
				<span v-if="product"
					>Вы уверены, что хотите удалить аккаунт <b>{{ product.name }}</b
					>?</span
				>
			</div>
			<template #footer>
				<Button
					label="Нет"
					icon="pi pi-times"
					text
					@click="deleteProductDialog = false"
				/>
				<Button label="Да" icon="pi pi-check" @click="deleteProduct" />
			</template>
		</Dialog>

		<Dialog
			v-model:visible="deleteProductsDialog"
			:style="{ width: '450px' }"
			header="Подтверждение"
			:modal="true"
		>
			<div class="flex items-center gap-4">
				<i class="pi pi-exclamation-triangle !text-3xl" />
				<span v-if="product"
					>Вы уверены, что хотите удалить выбранные аккаунты?</span
				>
			</div>
			<template #footer>
				<Button
					label="Нет"
					icon="pi pi-times"
					text
					@click="deleteProductsDialog = false"
				/>
				<Button
					label="Да"
					icon="pi pi-check"
					text
					@click="deleteSelectedProducts"
				/>
			</template>
		</Dialog>
	</div>
</template>
