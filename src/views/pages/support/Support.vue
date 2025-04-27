<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import {
  useSendMessage,
  useSupport,
  useSupportMessages,
} from "@/composables/useSupport";
import { Button } from "primevue";
import Chat from "@/components/Chat.vue";

const profileStore = useProfileStore();

const { data: supportsData, isLoading: isLoadingReviews } = useSupport();

const supports = computed(() => {
  return supportsData?.value || [];
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
} = useSupportMessages(chatId);

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

const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage({
  onSuccess: () => {
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Сообщение отправлено",
      life: 3000,
    });
    hideDialog();
  },
  onError: (error) => {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: "Не удалось отправить сообщение",
      life: 3000,
    });
  },
});

function handleSendMessage(message) {
  sendMessage({
    chat_id: chatId.value,
    profile_id: profileStore.profileID,
    text: message.text,
    attachments: message.attachments,
  });
}
</script>

<template>
  <div>
    <div class="card">
      <h3>Обращения в поддержку</h3>
      <DataTable
        v-model:expanded-rows="expandedRows"
        ref="dt"
        :value="supports.supports"
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
            <h4 class="m-0">Всего: {{ supports.countSupports }}</h4>
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
          field="id"
          header="ID"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="profileId"
          header="ID пользователя"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="lastMessage"
          header="Последнее сообщение"
          sortable
          style="min-width: 12rem"
        >
          <template #body="slotProps">
            <span>{{ slotProps.data.lastMessage.text }}</span>
          </template>
        </Column>
        <Column
          field="createdAt"
          header="Дата создания"
          sortable
          style="min-width: 12rem"
        >
        </Column>
        <Column
          field="updatedAt"
          header="Дата последнего взаимодействия"
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
            <div v-if="slotProps.data.user" class="p-4">
              <div class="flex gap-20">
                <div>
                  <h5>Последнее сообщение</h5>
                  <div>
                    Сообщение:
                    <span class="text-lg">{{
                      slotProps.data.lastMessage.text
                    }}</span>
                  </div>
                </div>
                <div>
                  <h5>Вложения</h5>
                  <div
                    v-if="slotProps.data.lastMessage.attachments"
                    class="flex flex-wrap gap-4 min-w-[150px]"
                  >
                    <Image
                      v-for="image in slotProps.data.lastMessage.attachments"
                      :src="'https://aidoo-test.ru/api-admin/files/' + image"
                      alt="Image"
                      width="50"
                    />
                  </div>
                  <div v-else>-</div>
                </div>
              </div>
              <h5>Информация о пользователе</h5>
              <DataTable :value="[slotProps.data.user]">
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
        <Button
          label="Закрыть"
          @click="messagesDialog = false"
          :loading="isSendingMessage"
        />
      </template>
    </Dialog>
  </div>
</template>
