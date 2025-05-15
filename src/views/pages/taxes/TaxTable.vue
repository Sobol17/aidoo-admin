<script setup>
import { useCreateFaq, useDeleteFaq, useFaq, useUpdateFaq } from '@/composables/useFaq'
import { useProfileStore } from '@/stores/profile'
import { debounce } from '@/utils/debounce'
import { InputText } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { computed, ref } from 'vue'

const profileStore = useProfileStore()

const taxItems = ref([
	{ name: 'Контент 1', code: '1' },
	{ name: 'Контент 2', code: '2' },
	{ name: 'Контент 3', code: '3' },
	{ name: 'Контент 4', code: '4' },
	{ name: 'Контент 2', code: '5' },
	{ name: 'Категория 4', code: '6' },
	{ name: '23123', code: '7' },
	{ name: 'Подкатегория 1', code: '8' },
	{ name: 'Подкатегория 9', code: '9' },
	{ name: 'Контент 10', code: '10' },
])

const search = ref('')
const page = ref(1)
const first = ref(0)
const limit = ref(7)

const deleteCityDialog = ref(false)
const taxDialog = ref(false)

const { data: faqData, isLoading: isLoadingCities } = useFaq(search, page, limit)

const faqList = computed(() => {
	return faqData?.value || []
})

const toast = useToast()
const isEdit = ref(false)

const newTax = ref({})

const { mutate: createFaq, isPending: creatingCity } = useCreateFaq({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Город успешно добавлен',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Город уже существует',
			life: 3000,
		})
	},
})

const { mutate: updateFaq, isPending: updatingCity } = useUpdateFaq({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Информация о городе обновлена',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Произошла ошибка',
			life: 3000,
		})
	},
})

function saveNewCity() {
	submitted.value = true
	if (isEdit.value) {
		updateFaq({
			id: newTax.value.id,
			faq: {
				question: newTax.value.question,
				answer: newTax.value.answer,
				profile_id: profileStore.profileID,
			},
		})
	} else {
		createFaq({
			question: newTax.value.question,
			answer: newTax.value.answer,
			profile_id: profileStore.profileID,
		})
	}
}

const submitted = ref(false)

function openNew() {
	newTax.value = {}
	submitted.value = false
	taxDialog.value = true
}

function hideDialog() {
	taxDialog.value = false
	deleteCityDialog.value = false
	isEdit.value = false
	submitted.value = false
}

function editTax(item) {
	isEdit.value = true
	// newTax.value = {
	// 	...item,
	// }
	taxDialog.value = true
}

const { mutate: deleteFaq, isPending: isDeletingCity } = useDeleteFaq({
	onSuccess: () => {
		toast.add({
			severity: 'success',
			summary: 'Успех',
			detail: 'Город успешно удален',
			life: 3000,
		})
		hideDialog()
	},
	onError: error => {
		toast.add({
			severity: 'error',
			summary: 'Ошибка',
			detail: 'Произошла ошибка',
			life: 3000,
		})
	},
})

function handleDeleteDialog() {
	deleteFaq(newTax.value.id)
	hideDialog()
}

function confirmDeleteCity(item) {
	newTax.value.id = item.id
	newTax.value.question = item.question
	deleteCityDialog.value = true
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
			<Toolbar class="mb-6 !border-none !p-0">
				<template #start>
					<h2>Тарифные планы</h2>
				</template>
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
			<div class="flex gap-x-2">
				<IconField class="w-[320px]">
					<InputIcon>
						<i class="pi pi-search" />
					</InputIcon>
					<InputText class="w-full" @input="handleSearch" placeholder="Поиск" />
				</IconField>
			</div>

			<div class="flex gap-4 flex-wrap mt-8">
				<Card
					v-for="item in 6"
					:key="item"
					class="border-[1px] border-solid border-gray-200 p-4 basis-[calc(25%_-_12px)]"
				>
					<template #header>
						<div class="flex gap-x-6 items-center justify-between">
							<h4 class="mb-0">Тарифный план №1</h4>
							<div class="flex items-center">
								<Button icon="pi pi-pencil" text rounded severity="warn" @click="editTax(item)" />
								<Button
									icon="pi pi-trash"
									text
									rounded
									severity="danger"
									@click="confirmDeleteCity(item)"
								/>
							</div>
						</div>
					</template>
					<template #content>
						<p class="m-0 text-lg text-right"><span class="text-2xl font-bold">999 ₽</span>/мес</p>
						<div class="flex items-center gap-x-2 mt-2">
							<i class="pi pi-check-square text-green-500" style="font-size: 1rem"></i>
							<p class="text-lg">Услуга</p>
						</div>
						<div class="flex items-center gap-x-2 mt-2">
							<i class="pi pi-check-square text-green-500" style="font-size: 1rem"></i>
							<p class="text-lg">Услуга</p>
						</div>
						<div class="flex items-center gap-x-2 mt-2">
							<i class="pi pi-check-square text-green-500" style="font-size: 1rem"></i>
							<p class="text-lg">Услуга</p>
						</div>
						<div class="flex items-center gap-x-2 mt-2">
							<i class="pi pi-check-square text-green-500" style="font-size: 1rem"></i>
							<p class="text-lg">Услуга</p>
						</div>
						<div class="flex items-center gap-x-2 mt-2">
							<i class="pi pi-check-square text-green-500" style="font-size: 1rem"></i>
							<p class="text-lg">Услуга</p>
						</div>
					</template>
				</Card>
			</div>
		</div>

		<Dialog
			v-model:visible="taxDialog"
			:style="{ width: '450px' }"
			header="Добавить тарифный план"
			:modal="true"
		>
			<div class="flex flex-col gap-6">
				<div v-if="isEdit">
					<label for="name" class="block font-bold mb-3">ID</label>
					<InputText
						id="name"
						v-model.trim="newTax.id"
						required="true"
						autofocus
						:invalid="submitted && !newTax.id"
						fluid
						disabled
					/>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Название</label>
					<InputText
						id="name"
						v-model.trim="newTax.name"
						required="true"
						autofocus
						:invalid="submitted && !newTax.name"
						fluid
					/>
					<small v-if="submitted && !newTax.name" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Цена</label>
					<InputText
						id="name"
						v-model.trim="newTax.price"
						required="true"
						autofocus
						:invalid="submitted && !newTax.price"
						fluid
					/>
					<small v-if="submitted && !newTax.price" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Длительность действия (месяцы)</label>
					<InputText
						id="name"
						v-model.trim="newTax.duration"
						required="true"
						autofocus
						:invalid="submitted && !newTax.duration"
						fluid
						type="number"
					/>
					<small v-if="submitted && !newTax.duration" class="text-red-500">Обязательное поле</small>
				</div>
				<div>
					<label for="name" class="block font-bold mb-3">Функции</label>
					<MultiSelect
						v-model="newTax.items"
						:options="taxItems"
						optionLabel="name"
						display="chip"
						filter
						placeholder="Выберите входящие функции"
						:maxSelectedLabels="3"
						class="w-full"
					/>
				</div>
			</div>

			<template #footer>
				<Button
					label="Отменить"
					icon="pi pi-times"
					text
					@click="hideDialog"
					:loading="updatingCity || creatingCity"
				/>
				<Button
					label="Сохранить"
					icon="pi pi-check"
					@click="saveNewCity"
					:loading="updatingCity || creatingCity"
				/>
			</template>
		</Dialog>

		<Dialog
			v-model:visible="deleteCityDialog"
			:style="{ width: '450px' }"
			header="Подтверждение"
			:modal="true"
		>
			<div class="flex items-center gap-4">
				<i class="pi pi-exclamation-triangle !text-3xl" />
				Вы уверены, что хотите удалить этот тарифный план?
			</div>
			<template #footer>
				<Button label="Нет" icon="pi pi-times" text @click="deleteCityDialog = false" />
				<Button
					label="Да"
					icon="pi pi-check"
					@click="handleDeleteDialog"
					:loading="isDeletingCity"
				/>
			</template>
		</Dialog>
	</div>
</template>
