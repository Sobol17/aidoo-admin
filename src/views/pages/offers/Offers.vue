<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { useOffers } from "@/composables/userOffers";

const profileStore = useProfileStore();

const {
  data: offersData,
  isLoading: isLoadingProfiles,
  error,
} = useOffers("all");

const offers = computed(() => {
  return offersData?.value || [];
});

const toast = useToast();
const dt = ref();
const moderationDialog = ref(false);
const detailDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const statusOptions = ref([
  { name: "Активный", code: "active" },
  { name: "Неактивный", code: "inactive" },
  { name: "Заблокирован", code: "blocked" },
]);

const offerItem = ref({
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  accountId: "",
  profileType: "",
});

function saveNewProfile() {
  submitted.value = true;

  createProfile({
    profile_id: profileStore.profileID,
    phone: numericPhone.value,
    profile_type: offerItem.value.profileType.code,
    account_id: offerItem.value.accountId.code,
    // avatar_id: src.value || '',
    first_name: offerItem.value.firstName,
    last_name: offerItem.value.lastName,
    city: offerItem.value.city,
  });
}

const submitted = ref(false);

function openNew(event) {
  offerItem.value = {
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    accountId: event.data.accountId,
    profileType: "",
  };
  submitted.value = false;
  moderationDialog.value = true;
}

const detailOfferInfo = ref({});

function openDetailDialog(offer) {
  detailDialog.value = true;
  detailOfferInfo.value = offer;
}

function hideDialog() {
  moderationDialog.value = false;
  detailDialog.value = false;
  submitted.value = false;
}

function rowClick(event) {
  openDetailDialog(event.data);
}
</script>

<template>
  <div>
    <div class="card">
      <DataTable
        ref="dt"
        :value="offers"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        :rowHover="true"
        @rowClick="rowClick"
        selectionMode="single"
        :loading="isLoadingProfiles"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Предложения</h4>
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

        <Column expander style="width: 5rem" />

        <Column
          field="ID"
          header="id"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="title"
          header="Название"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="description"
          header="Описание"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="subcategoryId"
          header="Подкатегория"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="Стоимость"
          header="price"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="offerStatus"
          header="Статус"
          sortable
          style="min-width: 10rem"
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
              icon="pi pi-file-edit"
              class="mr-2"
              outlined
              label="Модерирование"
              severity="help"
              @click="openNew(slotProps)"
            />
          </template>
        </Column>
        <template #expansion="slotProps">
          <div v-if="slotProps.data.partner" class="p-4">
            <h5>
              Информация о партнере {{ slotProps.data.partner.short_name }}
            </h5>
            <DataTable :value="slotProps.data.partner">
              <Column
                field="short_name"
                header="Краткое название"
                sortable
              ></Column>
              <Column
                field="full_name"
                header="Полное название"
                sortable
              ></Column>
              <Column field="phone" header="Телефон" sortable></Column>
              <Column field="city" header="Город" sortable></Column>
              <Column field="email" header="Email" sortable></Column>
              <Column field="whatsapp" header="Whatsapp" sortable></Column>
              <Column field="telegram" header="Telegram" sortable></Column>
              <Column field="inn" header="ИНН" sortable></Column>
              <Column headerStyle="width:4rem">
                <template #body>
                  <Button icon="pi pi-search" />
                </template>
              </Column>
            </DataTable>
          </div>
          <div v-else>
            <h5>Информация о партнере отсутствует</h5>
          </div>
        </template>
        <template #empty>
          <div class="flex items-center justify-center">
            <div class="text-gray-500 text-lg py-8">
              Нет данных для отображения
            </div>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Диалог для модерирования профиля -->
    <Dialog
      v-model:visible="moderationDialog"
      :style="{ width: '450px' }"
      header="Модерирование профиля (МП)"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div>
          <div class="block font-bold mb-3">Статус профиля</div>
          <Select
            v-model="offerItem.status"
            :options="statusOptions"
            optionLabel="name"
            placeholder="Выберите статус"
            class="w-full"
            :invalid="submitted && !offerItem.status"
          />
          <small v-if="submitted && !offerItem.status" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Комментарий модератора</div>
          <Textarea
            v-model="offerItem.comment"
            placeholder="Комментарий"
            class="w-full"
            :invalid="submitted && !offerItem.comment"
          />
          <p class="text-right">{{ offerItem.comment.length }} / 30</p>
          <small v-if="submitted && !offerItem.comment" class="text-red-500"
            >Обязательное поле. Минимум 30 символов</small
          >
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveNewProfile" />
      </template>
    </Dialog>

    <!-- Диалог с детальной информацией -->
    <Dialog
      v-model:visible="moderationDialog"
      :style="{ width: '850px' }"
      header="Детальная информация"
      :modal="true"
    >
      <div class="flex flex-col gap-6">TODO: Детальная информация</div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Сохранить" icon="pi pi-check" @click="saveNewProfile" />
      </template>
    </Dialog>
  </div>
</template>
