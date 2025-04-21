<script setup>
import { useAccounts } from "@/composables/useAdminAccounts";
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import {
  useDeleteAdvertising,
  useUpdateAdvertising,
} from "@/composables/useAdvertising";
import { useUploadFile } from "@/composables/useFiles";
import { useContent, useCreateContent } from "@/composables/useContent";
import FileComponent from "@/components/FileComponent.vue";
import { useRouter } from "vue-router";

const profileStore = useProfileStore();

const {
  data: contentItems,
  isLoading: isContentLoading,
  error,
} = useContent("all");

const contentElements = computed(() => {
  return contentItems?.value || [];
});

const toast = useToast();
const dt = ref();
const advertisingDialog = ref(false);
const deleteAdvertisingDialog = ref(false);
const moderationDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const router = useRouter();

const elementIdToDelete = ref(null);

const isEdit = ref(false);

const newContentItem = ref({});

const fileUrls = ref(null);
const imageUrls = ref(null);
const videoUrl = ref(null);
const tags = ref([]);
const tagInput = ref(null);
const tagExists = ref(false);

function addTag() {
  tagExists.value = false;
  if (tags.value.includes(tagInput.value)) {
    tagExists.value = true;
  } else {
    tags.value.push(tagInput.value);
    tagInput.value = "";
  }
}

const { mutate: uploadFile, isPending: isFileUploading } = useUploadFile({
  onSuccess: (data) => {
    toast.add({
      severity: "success",
      summary: "Успех",
      detail: "Файл загружен успешно",
      life: 3000,
    });
    newContentItem.value.fileId = data._id;
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

function onUploadImages(e) {
  imageUrls.value = e.files;

  imageUrls.value.forEach((item) => {
    const formData = new FormData();
    formData.append("document", item);
    uploadFile(formData);
  });
}

function onUploadFiles(e) {
  fileUrls.value = e.files;

  fileUrls.value.forEach((item) => {
    const formData = new FormData();
    formData.append("document", item);
    uploadFile(formData);
  });
}

function onUploadVideo(e) {
  videoUrl.value = e.files[0].objectURL;

  const formData = new FormData();
  formData.append("document", e.files[0]);
  uploadFile(formData);
}

const { mutate: createContent, isPending: isCreatingNewAdv } = useCreateContent(
  {
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Элемент успешно создан",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось создать элемент контента",
        life: 3000,
      });
    },
  },
);

const { mutate: updateAdv, isPending: isUpdatingProfile } =
  useUpdateAdvertising({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Профиль успешно обновлен",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось обновить профиль",
        life: 3000,
      });
    },
  });

const { data: adminAccounts } = useAccounts();

function saveNewAdv() {
  submitted.value = true;

  if (isEdit.value) {
    updateAdv({
      id: newContentItem.value.id,
      accountData: {
        profile_id: profileStore.profileID,
        type: newContentItem.value.type.code,
        link: newContentItem.value.link,
        file_id: newContentItem.value.fileId,
        link_type: newContentItem.value.linkType.code,
        number: newContentItem.value.number,
        status: newContentItem.value.advStatus.code,
      },
    });
  } else {
    const requestFields = {
      profile_id: profileStore.profileID,
      type: newContentItem.value.type.code,
      link: newContentItem.value.link,
      link_type: newContentItem.value.linkType.code,
      file_id: newContentItem.value.fileId,
      number: newContentItem.value.number,
      status: newContentItem.value.advStatus.code,
    };
    createContent(requestFields);
  }
}

const submitted = ref(false);

function openNew() {
  isEdit.value = false;
  newContentItem.value = {};
  fileUrls.value = null;
  videoUrl.value = null;
  submitted.value = false;
  advertisingDialog.value = true;
}

function openModerationDialog() {
  moderationDialog.value = true;
}

function hideDialog() {
  advertisingDialog.value = false;
  deleteAdvertisingDialog.value = false;
  moderationDialog.value = false;
  submitted.value = false;
}

function editProfile(advElement) {
  isEdit.value = true;

  const offerTypeOption = advTypes.value.find(
    (option) => option.name === advElement.type,
  );

  const linkTypeOption = linkTypes.value.find(
    (option) => option.name === advElement.linkType,
  );

  const advStatusOptions = advStatus.value.find(
    (option) => option.name === advElement.advStatus,
  );

  newContentItem.value = {
    ...advElement,
    type: offerTypeOption,
    linkType: linkTypeOption,
    advStatus: advStatusOptions,
  };

  console.log(newContentItem.value);

  advertisingDialog.value = true;
}

function confirmDeleteProfile(profileElement) {
  elementIdToDelete.value = profileElement.id;
  deleteAdvertisingDialog.value = true;
}

const { mutate: useDeleteProfile, isPending: isDeletingProfile } =
  useDeleteAdvertising({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Профиль успешно удален",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось удалить профиль",
        life: 3000,
      });
    },
  });

function deleteProfile() {
  useDeleteProfile(elementIdToDelete.value);
}

// function exportCSV() {
// 	dt.value.exportCSV()
// }

const expandedRows = ref([]);
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
        :expanded-rows="expandedRows"
        :value="contentElements"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        :rowHover="true"
        selectionMode="single"
        :loading="isContentLoading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Контент</h4>
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
          style="min-width: 10rem"
        ></Column>
        <Column
          field="title"
          header="Название"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="description"
          header="Описание"
          sortable
          style="min-width: 12rem"
        >
          <template #body="slotProps">
            <span
              class="text-ellipsis line-clamp-3"
              :title="slotProps.data.description"
              >{{ slotProps.data.description }}</span
            >
          </template>
        </Column>
        <Column
          field="subcategoryId"
          header="Подкатегория"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="subcategoryName"
          header="Подкатегория"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="status"
          header="Статус"
          sortable
          style="min-width: 5rem"
        ></Column>
        <Column
          field="is_premium"
          header="Премиум"
          sortable
          style="min-width: 5rem"
        ></Column>
        <Column
          field="updatedAt"
          header="Дата обновления"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="moderatorId"
          header="ID модератора"
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
          <div v-if="slotProps.data.profile" class="p-4">
            <div class="flex items-start gap-x-20">
              <div>
                <h5>Изображения</h5>
                <Image
                  v-for="image in slotProps.data.images"
                  :src="'https://aidoo-test.ru/api-admin/files/' + image"
                  alt="Image"
                  width="250"
                />
              </div>
              <div>
                <h5>Видео</h5>
                <video
                  :src="
                    'https://aidoo-test.ru/api-admin/files/' +
                    slotProps.data.video
                  "
                  muted
                  controls
                ></video>
              </div>
            </div>
            <div class="flex items-start gap-x-20">
              <div>
                <h5>Файлы</h5>
                <FileComponent
                  v-for="file in slotProps.data.files"
                  :file="file"
                ></FileComponent>
              </div>
              <div>
                <h5>Доп. информация</h5>
                <span>Тэги: </span>
                <span class="text-lg" v-for="tag in slotProps.data.tags">{{
                  tag
                }}</span>
                <div>
                  <p class="text-lg mb-2">
                    Счетчик просмотров: {{ slotProps.data.countViews }}
                  </p>
                  <p class="text-lg mb-2">
                    Счетчик "в избранном": {{ slotProps.data.countFavorites }}
                  </p>
                  <p class="text-lg mb-2">
                    Счетчик лайков: {{ slotProps.data.countLikes }}
                  </p>
                  <p class="text-lg mb-2">
                    Счетчик дизлайков: {{ slotProps.data.countDislikes }}
                  </p>
                </div>
              </div>
            </div>
            <h5>Информация о пользователе</h5>
            <DataTable :value="[slotProps.data.profile]">
              <Column
                field="_id"
                header="ID"
                style="min-width: 8rem"
                sortable
              ></Column>
              <Column
                field="profile_type"
                header="Роль"
                style="min-width: 6rem"
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
                field="city"
                header="Город"
                style="min-width: 6rem"
                sortable
              ></Column>
            </DataTable>
          </div>
          <div v-else>
            <h5>Информация о пользователе отсутствует</h5>
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

    <!-- Диалог для создания контента -->
    <Dialog
      v-model:visible="advertisingDialog"
      :style="{ width: '850px' }"
      :header="isEdit ? 'Редактирование контента' : 'Добавление контента'"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div v-if="isEdit">
          <label for="name" class="block font-bold mb-3">ID</label>
          <InputText
            id="id"
            v-model.trim="newContentItem.id"
            required="true"
            autofocus
            :invalid="submitted && !newContentItem.id"
            fluid
            disabled
          />
          <small v-if="submitted && !newContentItem.id" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Изображения</div>
          <FileUpload
            mode="basic"
            @select="onUploadImages"
            customUpload
            auto
            severity="secondary"
            class="p-button-outlined"
            chooseLabel="Выбрать"
            multiple
          />
          <img
            v-for="src in fileUrls"
            :src="
              src || 'https://aidoo-test.ru/api-admin/files/' + src.objectURL
            "
            alt="Image"
            class="shadow-md rounded-xl w-full size-40 sm:w-64 mt-4"
          />
          <small v-if="submitted && fileUrls.length === 0" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <label for="firstName" class="block font-bold mb-3">Заголовок</label>
          <InputText
            id="firstName"
            placeholder="Заголовок"
            v-model.trim="newContentItem.title"
            required="true"
            autofocus
            :invalid="submitted && !newContentItem.title"
            fluid
          />
          <small v-if="submitted && !newContentItem.title" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Описание</div>
          <Textarea
            v-model="newContentItem.description"
            placeholder="Описание"
            class="w-full min-h-40"
            :invalid="
              submitted &&
              !newContentItem.description &&
              newContentItem.description.length >= 30
            "
          />
          <p class="text-right">
            {{ newContentItem.description?.length }} / 30
          </p>
          <small
            v-if="submitted && !newContentItem.description"
            class="text-red-500"
            >Обязательное поле. Минимум 30 символов</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Видео</div>
          <FileUpload
            mode="basic"
            @select="onUploadVideo"
            customUpload
            auto
            severity="secondary"
            class="p-button-outlined"
            chooseLabel="Выбрать"
          />
          <p>{{ videoUrl }}</p>
        </div>
        <div>
          <div class="block font-bold mb-3">Файлы</div>
          <FileUpload
            mode="basic"
            @select="onUploadFiles"
            customUpload
            auto
            severity="secondary"
            class="p-button-outlined"
            chooseLabel="Выбрать"
          />
          <FileComponent v-for="src in fileUrls" :file="src" />
          <small v-if="submitted && fileUrls.length === 0" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Тэги</div>
          <div class="mb-4">
            <span class="text-sm" v-for="(tag, index) in tags" :key="index">
              {{ tag }}<span v-if="index < tags.length - 1">, </span>
            </span>
          </div>
          <div class="flex items-center justify-between gap-x-4">
            <InputText
              class="w-full"
              id="firstName"
              v-model.trim="tagInput"
              required="true"
              autofocus
              fluid
              :invalid="tagExists || tags.length === 0"
            />
            <Button class="shrink-0" label="Добавить" @click="addTag" />
          </div>
          <small v-if="submitted && tags.length === 0" class="text-red-500"
            >Обязательное поле</small
          >
          <small v-if="tagExists" class="text-red-500"
            >Данный тэг уже добавлен</small
          >
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          @click="saveNewAdv"
          :loading="isCreatingNewAdv"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteAdvertisingDialog"
      :style="{ width: '450px' }"
      header="Подтверждение"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        Вы уверены, что хотите удалить рекламу c id {{ elementIdToDelete }}?
      </div>
      <template #footer>
        <Button
          label="Нет"
          icon="pi pi-times"
          text
          @click="deleteAdvertisingDialog = false"
        />
        <Button
          label="Да"
          icon="pi pi-check"
          @click="deleteProfile"
          :loading="isDeletingProfile"
        />
      </template>
    </Dialog>

    <!-- Диалог для модерирования профиля -->
    <Dialog
      v-model:visible="moderationDialog"
      :style="{ width: '450px' }"
      header="Модерирование отзыва"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div>
          <div class="block font-bold mb-3">Статус</div>
          <Select
            v-model="reviewItem.status"
            :options="statusOptions"
            optionLabel="name"
            placeholder="Выберите статус"
            class="w-full"
            :invalid="submitted && !reviewItem.status"
          />
          <small v-if="submitted && !reviewItem.status" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Комментарий модератора</div>
          <Textarea
            v-model="reviewItem.comment"
            placeholder="Комментарий"
            class="w-full"
            :invalid="
              submitted &&
              !reviewItem.comment &&
              reviewItem.comment.length >= 30
            "
          />
          <p class="text-right">{{ reviewItem.comment?.length }} / 30</p>
          <small v-if="submitted && !reviewItem.comment" class="text-red-500"
            >Обязательное поле. Минимум 30 символов</small
          >
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          @click="saveModerationDialog"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped></style>
