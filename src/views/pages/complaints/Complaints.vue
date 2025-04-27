<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { Button } from "primevue";
import Chat from "@/components/Chat.vue";
import {
  useComplaintMessages,
  useComplaints,
  useSendMessage,
} from "@/composables/useComplaints";

const profileStore = useProfileStore();

const selectedComplaintStatus = ref({ name: "Все", code: "all" });

const statusOptions = ref([
  { name: "Все", code: "all" },
  { name: "Активные", code: "actived" },
  { name: "В архиве", code: "archived" },
]);

const { data: complaintsData, isLoading: isLoadingReviews } = useComplaints(
  selectedComplaintStatus,
);

const complaintsMock = [
  {
    id: "6803dc220b413ebc223631b0",
    profileId: "string",
    text: "stringstringstringstringstring",
    attachments: ["6803dc220bfebc08e7e631b0", "6803dc220bfebc08e7e631b0"],
    objectType: "reviews",
    objectId: "string",
    createdAt: "2025-04-22T16:25:31.955Z",
    updatedAt: "2025-04-22T16:25:31.955Z",
    profile: {
      _id: "string",
      first_name: "name",
      last_name: "last",
      avatar_id: "6803dc220bfebc08e7e631b0",
      profile_type: "admin",
    },
  },
];

const messagesMock = ref([
  {
    _id: "1",
    text: "Привет! Это моё сообщение.",
    timestamp: "2025-04-22T08:21:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: ["6803dc220bfebc08e7e631b0"],
  },
  {
    _id: "2",
    text: "А это сообщение собеседника.",
    timestamp: "2025-04-22T08:22:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: [],
  },
  {
    _id: "1",
    text: "Привет! Это моё сообщение.",
    timestamp: "2025-04-22T08:21:02.618Z",
    sender: { _id: "string", avatar_id: "my-avatar.png" },
    attachments: [],
  },
  {
    _id: "2",
    text: "А это сообщение собеседника.",
    timestamp: "2025-04-22T08:22:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: [],
  },
  {
    _id: "1",
    text: "Привет! Это моё сообщение.",
    timestamp: "2025-04-22T08:21:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: [],
  },
  {
    _id: "2",
    text: "А это сообщение собеседника.",
    timestamp: "2025-04-22T08:22:02.618Z",
    sender: { _id: "other", avatar_id: "his-avatar.png" },
    attachments: [],
  },
  {
    _id: "1",
    text: "Привет! Это моё сообщение.",
    timestamp: "2025-04-22T08:21:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: [],
  },
  {
    _id: "2",
    text: "А это сообщение собеседника.",
    timestamp: "2025-04-22T08:22:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: [],
  },
  {
    _id: "2",
    text: "А это сообщение собеседника.",
    timestamp: "2025-04-22T08:22:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: ["6803dc220bfebc08e7e631b0", "6803dc220bfebc08e7e631b0"],
  },
  {
    _id: "2",
    text: "А это сообщение собеседника.",
    timestamp: "2025-04-22T08:22:02.618Z",
    sender: { _id: "string", avatar_id: "6803dc220bfebc08e7e631b0" },
    attachments: ["6803dc220bfebc08e7e631b0"],
  },
]);

const complaints = computed(() => {
  return complaintsData?.value || [];
});

const toast = useToast();
const dt = ref();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const messagesDialog = ref(false);
const chatId = ref(null);

const expandedRows = ref([]);

const {
  data: messagesData,
  isLoading: isLoadingMessages,
  refetch: fetchMessages,
} = useComplaintMessages(chatId);

const messages = computed(() => {
  return (messagesData?.value || []).slice().sort((a, b) => {
    return new Date(a.timestamp) - new Date(b.timestamp);
  });
});

function openDetailModal(item) {
  chatId.value = item.id;
  messagesDialog.value = true;
  fetchMessages();
}

const { mutate: sendMessage, isPending: isCreatingNewAdv } = useSendMessage({
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Сообщение отправлено",
      life: 3000,
    });
    hideDialog();
  },
});

function handleSendMessage(message) {
  sendMessage({
    complaint_id: chatId.value,
    profile_id: profileStore.profileID,
    text: message.text,
    attachments: message.attachments,
  });

  messagesMock.value.push({
    _id: chatId.value,
    text: message.text,
    attachments: message.attachments,
    timestamp: "2025-04-22T08:21:02.618Z",
    sender: { _id: "string" },
  });
}
</script>

<template>
  <div>
    <div class="card">
      <h3>Жалобы</h3>
      <DataTable
        v-model:expanded-rows="expandedRows"
        ref="dt"
        :value="complaints.complaints"
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
            <h4 class="m-0">Всего: {{ complaints.countComplaints }}</h4>
            <div class="flex items-center gap-x-2">
              <Select
                v-model="selectedComplaintStatus"
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
          field="id"
          header="ID"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="profileId"
          header="ID пользователя"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="text"
          header="Сообщение"
          sortable
          style="min-width: 8rem"
        >
          <template #body="slotProps">
            <span>{{ slotProps.data.text }}</span>
          </template>
        </Column>
        <Column
          field="objectType"
          header="Сущность"
          sortable
          style="min-width: 8rem"
        >
        </Column>
        <Column
          field="objectId"
          header="ID сущности"
          sortable
          style="min-width: 8rem"
        >
        </Column>
        <Column
          field="createdAt"
          header="Дата создания"
          sortable
          style="min-width: 12rem"
        >
        </Column>
        <Column :exportable="false" style="min-width: 12rem">
          <template #body="slotProps">
            <Button
              outlined
              rounded
              class="mr-2"
              label="Подробнее"
              @click="openDetailModal(slotProps.data)"
            />
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-4">
            <h5>Детальная информация</h5>
            <div v-if="slotProps.data.profile" class="p-4">
              <div class="flex gap-20">
                <div>
                  <h5>Вложения</h5>
                  <div class="flex flex-wrap gap-4 min-w-[150px]">
                    <Image
                      v-for="image in slotProps.data.attachments"
                      :src="'https://aidoo-test.ru/api-admin/files/' + image"
                      alt="Image"
                      width="50"
                    />
                  </div>
                </div>
              </div>
              <h5>Информация о пользователе</h5>
              <DataTable :value="[slotProps.data.profile]">
                <Column
                  field="avatar_id"
                  header="Аватар"
                  style="min-width: 8rem"
                  sortable
                >
                  <template #body="slotProps">
                    <Avatar
                      v-if="slotProps.data.avatar_id"
                      :image="
                        'https://aidoo-test.ru/api-admin/files/' +
                        slotProps.data.avatar_id
                      "
                      shape="circle"
                    />
                    <div
                      v-else
                      class="flex items-center justify-center size-10 bg-gray-200 rounded-full"
                    >
                      <i class="pi pi-user" />
                    </div>
                  </template>
                </Column>
                <Column
                  field="_id"
                  header="ID"
                  style="min-width: 8rem"
                  sortable
                ></Column>
                <Column
                  field="first_name"
                  header="Имя"
                  style="min-width: 6rem"
                  sortable
                ></Column>
                <Column
                  field="last_name"
                  header="Фамилия"
                  style="min-width: 6rem"
                  sortable
                ></Column>
                <Column
                  field="profile_type"
                  header="Роль"
                  style="min-width: 6rem"
                  sortable
                ></Column>
              </DataTable>
            </div>
            <div v-else>
              <h5>Информация о пользователе отсутствует</h5>
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

    <Dialog
      v-model:visible="messagesDialog"
      :style="{ width: '850px' }"
      header="История сообщений"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <ProgressSpinner
          v-if="isLoadingMessages"
          style="width: 30px; height: 30px"
          strokeWidth="8"
        />
        <div v-else>
          <Chat :messages="messages" @sendMessage="handleSendMessage" />
        </div>
      </div>

      <template #footer>
        <Button label="Закрыть" @click="messagesDialog = false" />
      </template>
    </Dialog>
  </div>
</template>
