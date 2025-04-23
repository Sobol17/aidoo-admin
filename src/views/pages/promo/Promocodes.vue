<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { useUploadFile } from "@/composables/useFiles";
import {
  useCreatePromo,
  useDeletePromo,
  usePromo,
  useUpdatePromo,
} from "@/composables/usePromo";

const profileStore = useProfileStore();

const selectedPromoStatus = ref({ name: "Все", code: "all" });

const promoStatuses = [
  { name: "Все", code: "all" },
  { name: "Активный", code: "actived" },
  { name: "Отключен", code: "inactived" },
];

const { data: promoData, isLoading: isPromosLoading } =
  usePromo(selectedPromoStatus);

const promoCodes = computed(() => {
  return promoData?.value || [];
});

const toast = useToast();
const dt = ref();
const promoDialog = ref(false);
const deletePromoDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const promoName = ref(null);
const promoIdToDelete = ref(null);

const isEdit = ref(false);

const promoStatus = ref([
  { name: "Активен", code: "actived" },
  { name: "Отключен", code: "inactived" },
]);

const newPromo = ref({});

const src = ref(null);

const { mutate: uploadFile, isPending: isFileUploading } = useUploadFile({
  onSuccess: (data) => {
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Файл загружен успешно",
      life: 3000,
    });
    newPromo.value.fileId = data._id;
  },
  onError: (error) => {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не загрузить файл",
      life: 3000,
    });
  },
});

const { mutate: createPromo, isPending: isCreatingNewAdv } = useCreatePromo({
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Промокод успешно создан",
      life: 3000,
    });
    hideDialog();
  },
  onError: (error) => {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось создать промокод",
      life: 3000,
    });
  },
});

const { mutate: updatePromo, isPending: isUpdatingNewAdv } = useUpdatePromo({
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Статус промокода обновлен",
      life: 3000,
    });
    hideDialog();
  },
  onError: (error) => {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось обновить промокод",
      life: 3000,
    });
  },
});

function saveNewAdv() {
  submitted.value = true;

  if (isEdit.value) {
    updatePromo({
      id: newPromo.value.id,
      promoData: {
        status: newPromo.value.status.code,
      },
    });
  } else {
    const requestFields = {
      profile_id: profileStore.profileID,
      code: newPromo.value.code,
      promo_value: newPromo.value.promoValue,
      max_uses: newPromo.value.maxUses,
      active_days: newPromo.value.activeDays,
    };
    createPromo(requestFields);
  }
}

const submitted = ref(false);

function openNew() {
  isEdit.value = false;
  newPromo.value = {};
  src.value = null;
  submitted.value = false;
  promoDialog.value = true;
}

function hideDialog() {
  promoDialog.value = false;
  deletePromoDialog.value = false;
  submitted.value = false;
}

function editProfile(promoElement) {
  isEdit.value = true;

  newPromo.value = {
    id: promoElement.id,
  };

  promoDialog.value = true;
}

function confirmDeleteProfile(promoElement) {
  promoName.value = promoElement.code;
  promoIdToDelete.value = promoElement.id;
  deletePromoDialog.value = true;
}

const { mutate: useDeleteProfile, isPending: isDeletingProfile } =
  useDeletePromo({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Промокод удален",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить промокод",
        life: 3000,
      });
    },
  });

function deleteProfile() {
  useDeleteProfile(promoIdToDelete.value);
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
        :value="promoCodes"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="7"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[7, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        :loading="isPromosLoading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Промокоды</h4>
            <div class="flex gap-x-2">
              <Select
                v-model="selectedPromoStatus"
                :options="promoStatuses"
                optionLabel="name"
                placeholder="Статус промокода"
                class="w-full"
              />
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
          </div>
        </template>
        <Column
          field="code"
          header="Промокод"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="promoValue"
          header="Значение"
          sortable
          style="min-width: 6rem"
        ></Column>
        <Column
          field="maxUses"
          header="Количество использований"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="activeDays"
          header="Длительность (в днях)"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="promoStatus"
          header="Статус"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="creator"
          header="Создатель (ID)"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="createdAt"
          header="Дата создания"
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
              @click="editProfile(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              outlined
              rounded
              severity="danger"
              @click="confirmDeleteProfile(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Диалог для создания нового аккаунта -->
    <Dialog
      v-model:visible="promoDialog"
      :style="{ width: '450px' }"
      :header="isEdit ? 'Редактирование промокода' : 'Добавление промокода'"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div v-if="isEdit">
          <label for="name" class="block font-bold mb-3">ID</label>
          <InputText
            id="id"
            v-model.trim="newPromo.id"
            required="true"
            autofocus
            :invalid="submitted && !newPromo.id"
            fluid
            disabled
          />
          <small v-if="submitted && !newPromo.id" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div v-if="isEdit">
          <label for="name" class="block font-bold mb-3">Статус</label>
          <Select
            v-model="newPromo.status"
            :options="promoStatus"
            optionLabel="name"
            placeholder="Выберите тип предложения"
            class="w-full"
            :invalid="submitted && !newPromo.status"
          />
          <small v-if="submitted && !newPromo.status" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div v-if="!isEdit">
          <label for="firstName" class="block font-bold mb-3">Промокод</label>
          <InputText
            id="firstName"
            v-model.trim="newPromo.code"
            required="true"
            autofocus
            :invalid="submitted && !newPromo.code"
            placeholder="Введите промокод"
            fluid
          />
          <small v-if="submitted && !newPromo.code" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div v-if="!isEdit">
          <label for="name" class="block font-bold mb-3">Значение</label>
          <InputNumber
            v-model.trim="newPromo.promoValue"
            showButtons
            mode="decimal"
            required="true"
            autofocus
            :invalid="submitted && !newPromo.activeDays"
            placeholder="Значение промокода"
            fluid
          ></InputNumber>
          <small v-if="submitted && !newPromo.promoValue" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div v-if="!isEdit">
          <label for="name" class="block font-bold mb-3"
            >Количество использований</label
          >
          <InputNumber
            v-model.trim="newPromo.maxUses"
            showButtons
            mode="decimal"
            required="true"
            autofocus
            :invalid="submitted && !newPromo.activeDays"
            placeholder="Введите количество использований"
            fluid
          ></InputNumber>
          <small v-if="submitted && !newPromo.maxUses" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div v-if="!isEdit">
          <label for="name" class="block font-bold mb-3"
            >Длительность (кол-во дней)</label
          >
          <InputNumber
            v-model="newPromo.activeDays"
            showButtons
            mode="decimal"
            required="true"
            autofocus
            :invalid="submitted && !newPromo.activeDays"
            placeholder="Введите количество дней"
            fluid
          ></InputNumber>
          <small v-if="submitted && !newPromo.activeDays" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          @click="saveNewAdv"
          :loading="isCreatingNewAdv || isUpdatingNewAdv"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deletePromoDialog"
      :style="{ width: '450px' }"
      header="Подтверждение"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        Вы уверены, что хотите промокод {{ promoName }}?
      </div>
      <template #footer>
        <Button
          label="Нет"
          icon="pi pi-times"
          text
          @click="deletePromoDialog = false"
        />
        <Button
          label="Да"
          icon="pi pi-check"
          @click="deleteProfile"
          :loading="isDeletingProfile"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
