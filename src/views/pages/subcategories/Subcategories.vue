<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  useCreateSubcategory,
  useDeleteSubcategory,
  useSubcategories,
  useUpdateSubcategory,
} from "@/composables/useSubcategories";
import categoriesData from "@/utils/categoriesData";

const profileStore = useProfileStore();

const route = useRoute();

const parentCategory = categoriesData.find(
  (category) => category.code === route.params.id,
);

const {
  data: subcategoriesData,
  isLoading,
  error,
} = useSubcategories(route.params.id);

const subcategories = computed(() => {
  return subcategoriesData?.value || [];
});

const toast = useToast();
const dt = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const subcategoryIdToDelete = ref(null);
const subcategoryNameToDelete = ref(null);

const isEdit = ref(false);

const newSubcategory = ref({});

const { mutate: createSubcategory, isPending: isCreatingNewSubcategory } =
  useCreateSubcategory({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Подкатегория успешно создана",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось создать подкатегорию",
        life: 3000,
      });
    },
  });

const { mutate: updateSubcategory, isPending: isUpdatingSubcategory } =
  useUpdateSubcategory({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Подкатегория успешно обновлена",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось обновить подкатегорию",
        life: 3000,
      });
    },
  });

function saveNewSubcategory() {
  if (isEdit.value) {
    updateSubcategory({
      id: newSubcategory.value.id,
      subcategoryData: {
        name: newSubcategory.value.name,
        category: newSubcategory.value.parent.code,
        is_premium: !!newSubcategory.value.isPremium,
        profile_id: profileStore.profileID,
      },
    });
  } else {
    createSubcategory({
      name: newSubcategory.value.name,
      category: newSubcategory.value.parent.code,
      is_premium: !!newSubcategory.value.isPremium,
      profile_id: profileStore.profileID,
    });
  }
}

const submitted = ref(false);

function openNew() {
  isEdit.value = false;
  newSubcategory.value = {};
  submitted.value = false;
  productDialog.value = true;
}

function hideDialog() {
  productDialog.value = false;
  deleteProductDialog.value = false;
  submitted.value = false;
}

function editSubcategory(subcategoryElement) {
  isEdit.value = true;

  const parentOption = categoriesData.find(
    (option) => option.code === subcategoryElement.category,
  );

  newSubcategory.value = {
    ...subcategoryElement,
    parent: parentOption,
  };
  productDialog.value = true;
}

function confirmDeleteProduct(subcategoryElement) {
  subcategoryIdToDelete.value = subcategoryElement.id;
  subcategoryNameToDelete.value = subcategoryElement.name;
  deleteProductDialog.value = true;
}

const { mutate: useDelete, isPending: isDeletingAccount } =
  useDeleteSubcategory({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Аккаунт успешно удален",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить аккаунт",
        life: 3000,
      });
    },
  });

function deleteAccount() {
  useDelete(subcategoryIdToDelete.value);
}

const router = useRouter();

function rowClick(event) {
  router.push(`/categories/${route.params.id}/${event.data.id}`);
}

// function exportCSV() {
// 	dt.value.exportCSV()
// }
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
        :value="subcategories"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        @rowClick="rowClick"
        :rowHover="true"
        selectionMode="single"
        :loading="isLoading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">{{ parentCategory.name }}, подкатегории</h4>
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
          field="name"
          header="Название"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="categoryName"
          header="Название родителя"
          style="min-width: 12rem"
        ></Column>
        <Column
          field="category"
          header="Родитель (ID)"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="id"
          header="ID"
          sortable
          style="min-width: 16rem"
        ></Column>
        <Column
          field="isPremium"
          header="Премиум"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="createdAt"
          header="Дата создания"
          sortable
          style="min-width: 12rem"
        ></Column>
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
              @click="editSubcategory(slotProps.data)"
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
      :header="isEdit ? 'Изменить подкатегорию' : 'Добавить подкатегорию'"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div v-if="isEdit">
          <label for="name" class="block font-bold mb-3">ID</label>
          <InputText
            id="id"
            v-model.trim="newSubcategory.id"
            required="true"
            autofocus
            :invalid="submitted && !newSubcategory.id"
            fluid
            disabled
          />
          <small v-if="submitted && !newSubcategory.id" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <label for="name" class="block font-bold mb-3">Название</label>
          <InputText
            id="name"
            v-model.trim="newSubcategory.name"
            required="true"
            autofocus
            :invalid="submitted && !newSubcategory.name"
            fluid
          />
          <small v-if="submitted && !newSubcategory.name" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div class="mb-4">
          <div class="block font-bold mb-3">Родительская категория</div>
          <Select
            v-model="newSubcategory.parent"
            :options="categoriesData"
            optionLabel="name"
            placeholder="Выберите родительскую категорию"
            class="w-full"
            :invalid="submitted && !newSubcategory.parent"
          />
          <small v-if="submitted && !newSubcategory.parent" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div class="mb-4">
          <div class="block font-bold mb-3">Премиум подкатегория</div>
          <ToggleSwitch v-model="newSubcategory.isPremium" />
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          @click="saveNewSubcategory"
          :loading="isCreatingNewSubcategory"
        />
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
        Вы уверены, что хотите удалить подкатегорию c названием
        {{ subcategoryNameToDelete }}?
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
</template>
