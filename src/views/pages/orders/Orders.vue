<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { computed, ref } from "vue";
import { useOrders } from "@/composables/useOrders";

const profileStore = useProfileStore();

const selectedOrderStatus = ref({ name: "Все", code: "all" });

const statusOptions = ref([
  { name: "Все", code: "all" },
  { name: "Выполняется", code: "PENDING" },
  { name: "Выполнен", code: "COMPLETED" },
  { name: "Ошибочный", code: "FAILED" },
  { name: "Отклонен", code: "CANCELED" },
]);

const { data: ordersData, isLoading: isLoadingReviews } =
  useOrders(selectedOrderStatus);

const orders = computed(() => {
  return ordersData?.value || [];
});

const dt = ref();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const reviewItem = ref({
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  accountId: "",
  profileType: "",
});
const expandedRows = ref([]);
</script>

<template>
  <div>
    <div class="card">
      <h2>Платежи</h2>
      <DataTable
        v-model:expanded-rows="expandedRows"
        ref="dt"
        :value="orders.orders"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="7"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[7, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        :loading="isLoadingReviews"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Всего: {{ orders.countOrders ?? 0 }}</h4>
            <div class="flex items-center gap-x-2">
              <Select
                v-model="selectedOrderStatus"
                :options="statusOptions"
                optionLabel="name"
                placeholder="Статус платежа"
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

        <Column expander style="width: 5rem" />

        <Column
          field="reviewStatus"
          header="Статус"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="price"
          header="Сумма"
          sortable
          style="min-width: 8rem"
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
        <template #expansion="slotProps">
          <div class="p-4">
            <h5>Детальная информация</h5>
            <div class="flex gap-x-20 items-start">
              <div v-if="slotProps.data.profile">
                <div class="text-lg">Автор:</div>
                <span class="mb-2"
                  >Имя: {{ slotProps.data.profile.first_name }}</span
                >
                <span class="mb-2"
                  >Фамилия:
                  {{ slotProps.data.profile.last_name ?? "Отсутвует" }}</span
                >
                <div class="flex gap-x-2 mb-2">
                  <span>Аватар</span>
                  <Avatar
                    :image="
                      'https://aidoo-test.ru/api-admin/files/' +
                        slotProps.data.profile.avatar_id ||
                      '/layout/images/avatar-placeholder.png'
                    "
                    size="xlarge"
                    shape="circle"
                  />
                </div>
                <span class="mb-2"
                  >Город: {{ slotProps.data.profile.city ?? "Отсутвует" }}</span
                >
              </div>
              <p class="text-lg" v-else>Информация об авторе отсутсвует</p>
              <div class="grow" v-if="slotProps.data.attachments">
                <div class="font-semibold text-lg mb-4">Вложения</div>
                <div class="flex gap-6 items-start flex-wrap">
                  <Image
                    v-for="attachment in slotProps.data.attachments"
                    :src="'https://aidoo-test.ru/api-admin/files/' + attachment"
                    alt="Image"
                    width="250"
                  />
                </div>
              </div>
              <p v-else class="text-lg">Вложения отсутствуют</p>
            </div>
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
  </div>
</template>
