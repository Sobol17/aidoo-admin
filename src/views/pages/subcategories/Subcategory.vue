<template>
  <div class="account-container">
    <Toast />
    <div
      v-if="isLoadingSubcategory"
      class="flex justify-content-center align-items-center pt-5"
    >
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
      <span class="ml-3 font-bold">Загрузка данных...</span>
    </div>
    <div
      v-else-if="!subcategory"
      class="flex justify-content-center align-items-center pt-5"
    >
      <Message severity="error" text="Пользователь не найден" />
    </div>
    <div v-else class="grid">
      <div class="col-12 md:col-4 lg:col-3">
        <Card class="h-full">
          <template #title>
            <div class="text-left">
              <div class="flex justify-between">
                <h2 class="text-xl mt-0 mb-2">
                  Подкатегория {{ subcategory.name }}
                </h2>
                <Button
                  label="Редактировать"
                  icon="pi pi-pencil"
                  class="mr-2 mb-2"
                  @click="editSubcategory()"
                />
              </div>
              <p class="m-0 text-lg text-500 mb-3">
                <span class="font-semibold">ID подкатегории</span>
                {{ subcategory._id }}
              </p>
              <p class="m-0 text-lg text-500 mb-3">
                <span class="font-semibold">Родитель:</span>
                {{ subcategory.category_name }}
              </p>
              <p class="m-0 text-lg text-500 mb-3">
                <span class="font-semibold">Родитель (ID):</span>
                {{ subcategory.category }}
              </p>
            </div>
          </template>
          <template #content>
            <div class="flex flex-column gap-x-8 py-3">
              <div>
                <span class="font-semibold text-lg block mb-2">Создан:</span>
                <p class="m-0">{{ formatDate(subcategory.created_at) }}</p>
              </div>
              <div>
                <span class="font-semibold text-lg block mb-2">Обновлен:</span>
                <p class="m-0">{{ formatDate(subcategory.updated_at) }}</p>
              </div>
              <div>
                <span class="font-semibold text-lg block mb-2">Премиум:</span>
                <p class="m-0">{{ subcategory.is_premium ? "Да" : "Нет" }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Диалог для создания нового аккаунта -->
    <Dialog
      v-model:visible="updateSubcategoryDialog"
      :style="{ width: '450px' }"
      header="Изменить подкатегорию"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div>
          <label for="name" class="block font-bold mb-3">ID</label>
          <InputText
            id="id"
            v-model.trim="updatedSub.id"
            required="true"
            autofocus
            :invalid="submitted && !updatedSub.id"
            fluid
            disabled
          />
          <small v-if="submitted && !updatedSub.id" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <label for="name" class="block font-bold mb-3">Название</label>
          <InputText
            id="name"
            v-model.trim="updatedSub.name"
            required="true"
            autofocus
            :invalid="submitted && !updatedSub.name"
            fluid
          />
          <small v-if="submitted && !updatedSub.name" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div class="mb-4">
          <div class="block font-bold mb-3">Родительская категория</div>
          <Select
            v-model="updatedSub.parent"
            :options="categoriesData"
            optionLabel="name"
            placeholder="Выберите родительскую категорию"
            class="w-full"
            :invalid="submitted && !updatedSub.parent"
          />
          <small v-if="submitted && !updatedSub.parent" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div class="mb-4">
          <div class="block font-bold mb-3">Премиум подкатегория</div>
          <ToggleSwitch v-model="updatedSub.premium" />
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          @click="saveChanges"
          :loading="updatingSubcategory"
        />
      </template>
    </Dialog>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { useProfileStore } from "@/stores/profile";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import {
  useSubcategoryById,
  useUpdateSubcategory,
} from "@/composables/useSubcategories";
import categoriesData from "@/utils/categoriesData";
import { Button } from "primevue";

const route = useRoute();
const submitted = ref(false);

const updateSubcategoryDialog = ref(false);

const { data, isPending: isLoadingSubcategory } = useSubcategoryById(
  route.params.subcategory,
);

// Состояние и реактивные переменные
const subcategory = computed(() => data.value);

const updatedSub = ref({});

const toast = useToast();
const confirm = useConfirm();

const formatDate = (dateString) => {
  if (!dateString) return "Нет данных";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

function editSubcategory() {
  const parentOption = categoriesData.find(
    (option) => option.code === subcategory.value?.category,
  );

  updatedSub.value = {
    id: subcategory.value?._id,
    name: subcategory.value?.name,
    parent: parentOption,
    premium: subcategory.value?.is_premium,
  };
  updateSubcategoryDialog.value = true;
}

function hideDialog() {
  updateSubcategoryDialog.value = false;
  submitted.value = false;
}

const { mutate: updateSubcategory, isPending: updatingSubcategory } =
  useUpdateSubcategory({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Аккаунт успешно обновлен",
        life: 3000,
      });
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось обновить аккаунт",
        life: 3000,
      });
    },
  });

const profileStore = useProfileStore();

const saveChanges = async () => {
  updateSubcategory({
    id: subcategory.value._id,
    subcategoryData: {
      name: updatedSub.value.name,
      category: updatedSub.value.parent.code,
      is_premium: !!updatedSub.value.premium,
      profile_id: profileStore.profileID,
    },
  });
  hideDialog();
};
</script>

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
