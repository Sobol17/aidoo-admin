<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { computed, ref } from "vue";
import { useLogs } from "@/composables/userLogs";
import { useRoute } from "vue-router";

const profileStore = useProfileStore();

const selectedOrderStatus = ref({ name: "Все", code: "all" });

const statusOptions = ref([
  { name: "Все", code: "all" },
  { name: "Выполняется", code: "PENDING" },
  { name: "Выполнен", code: "COMPLETED" },
  { name: "Ошибочный", code: "FAILED" },
  { name: "Отклонен", code: "CANCELED" },
]);

const route = useRoute();

const { data: logsData, isLoading: isLoadingLogs } = useLogs(route.params.id);

const logs = computed(() => {
  return logsData?.value || [];
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
        :value="logs"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="7"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[7, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        :loading="isLoadingLogs"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Всего: {{ logs.countOrders ?? 0 }}</h4>
          </div>
        </template>

        <Column
          field="accountId"
          header="ID аккаунта"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="profileId"
          header="ID профиля"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="action"
          header="Действия"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="objectType"
          header="Объект"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="objectId"
          header="ID объекта"
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
