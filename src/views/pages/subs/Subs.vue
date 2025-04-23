<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { useSubs } from "@/composables/useSubs";
import { formatDate } from "@/utils/formatDate";

const profileStore = useProfileStore();

const { data: subsData, isLoading: isLoadingReviews } = useSubs();

const subs = computed(() => {
  return subsData?.value || [];
});

const toast = useToast();
const dt = ref();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const actionOptions = ref([
  { name: "Добавление", code: "add" },
  { name: "Удаление", code: "remove" },
]);

const expandedRows = ref([]);
</script>

<template>
  <div>
    <div class="card">
      <h3>Подписки</h3>
      <DataTable
        v-model:expanded-rows="expandedRows"
        ref="dt"
        :value="subs.subs"
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
            <h4 class="m-0">Всего: {{ subs.countSubs }}</h4>
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
          field="userId"
          header="Пользователь"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="startDate"
          header="Дата начала"
          sortable
          style="min-width: 12rem"
        >
        </Column>
        <Column
          field="endDate"
          header="Дата окончания"
          sortable
          style="min-width: 12rem"
        >
        </Column>
        <Column
          field="id"
          header="ID подписки"
          sortable
          style="min-width: 12rem"
        ></Column>
        <template #expansion="slotProps">
          <div class="p-4">
            <h5>История</h5>
            <DataTable :value="slotProps.data.history">
              <Column
                field="action"
                header="Действие"
                style="min-width: 8rem"
                sortable
              >
              </Column>
              <Column
                field="amount"
                header="Количество"
                style="min-width: 6rem"
                sortable
              >
              </Column>
              <Column
                field="created_at"
                header="Дата создания"
                style="min-width: 6rem"
                sortable
              >
                <template #body="slotProps">
                  <span>{{ formatDate(slotProps.data.created_at) }}</span>
                </template>
              </Column>
              <template #empty>
                <div class="flex items-center justify-center">
                  <div class="text-gray-500 text-lg py-8">
                    Нет данных для отображения
                  </div>
                </div>
              </template>
            </DataTable>
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
