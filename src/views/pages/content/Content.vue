<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";

import { useUploadFile } from "@/composables/useFiles";
import {
  useContent,
  useCreateContent,
  useDeleteContent,
  useModerateContent,
  useUpdateContent,
} from "@/composables/useContent";
import FileComponent from "@/components/FileComponent.vue";
import { useRoute } from "vue-router";
import { debounce } from "@/utils/debounce";

function getProfileType(profileType) {
  if (profileType === "admin") return "Администратор";
  if (profileType === "moderator") return "Модератор";
  if (profileType === "supporter") return "Спонсор";
  if (profileType === "employee") return "Сотрудник";
  return "Неизвестно";
}

const statusOptions = ref([
  { name: "Активен", code: "actived" },
  { name: "Отклонен", code: "rejected" },
]);

const contentStatuses = [
  { name: "Все", code: "all" },
  { name: "Активные", code: "actived" },
  { name: "На модерации", code: "moderation" },
  { name: "Отклоненные", code: "rejected" },
  { name: "В черновике", code: "draft" },
  { name: "В архиве", code: "archived" },
];

const selectedContentStatus = ref("all");
const page = ref(1);
const search = ref("");
const limit = ref(7);

const route = useRoute();

const profileStore = useProfileStore();

const {
  data: contentItems,
  isLoading: isContentLoading,
  error,
} = useContent(selectedContentStatus, search, page, limit);

const contentElements = computed(() => {
  return contentItems?.value || [];
});

const toast = useToast();
const dt = ref();
const contentDialog = ref(false);
const deleteContentDialog = ref(false);
const moderationDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const elementIdToDelete = ref(null);

const isEdit = ref(false);

const newContentItem = ref({
  images: [],
});

const fileUrls = ref([]);
const imageUrls = ref([]);
const videoUrl = ref(null);
const videoName = ref(null);
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

const { mutate: uploadImage, isPending: isImageUploading } = useUploadFile({
  onSuccess: (data) => {
    imageUrls.value.push(data._id);
  },
});

const { mutate: uploadFiles, isPending: isFileUploading } = useUploadFile({
  onSuccess: (data) => {
    fileUrls.value.push(data);
  },
});

const { mutate: uploadVideo, isPending: isVideoUploading } = useUploadFile({
  onSuccess: (data) => {
    videoUrl.value = data._id;
  },
});

function onUploadImages(e) {
  for (const item of e.files) {
    const formData = new FormData();
    formData.append("document", item);
    try {
      uploadImage(formData);
    } catch {
      console.error("Ошибка загрузки файла:", item.name);
    }
  }

  toast.add({
    severity: "info",
    summary: "Завершено",
    detail: "Загрузка файлов завершена",
    life: 3000,
  });
}

function onUploadFiles(e) {
  for (const item of e.files) {
    const formData = new FormData();
    formData.append("document", item);
    try {
      uploadFiles(formData);
    } catch {
      console.error("Ошибка загрузки файла:", item.name);
    }
  }

  toast.add({
    severity: "info",
    summary: "Завершено",
    detail: "Загрузка файлов завершена",
    life: 3000,
  });
}

function onUploadVideo(e) {
  videoName.value = e.files[0].name;
  const formData = new FormData();
  formData.append("document", e.files[0]);
  uploadVideo(formData);
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

const { mutate: updateContent, isPending: isUpdatingProfile } =
  useUpdateContent({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Запись успешно обновлена",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось обновить запись",
        life: 3000,
      });
    },
  });

function saveNewContentItem() {
  submitted.value = true;

  if (isEdit.value) {
    updateContent({
      id: newContentItem.value.id,
      contentData: {
        profile_id: profileStore.profileID,
        subcategory_id: route.params.subcategory,
        title: newContentItem.value.title,
        description: newContentItem.value.description,
        tags: tags.value,
        files: fileUrls.value,
        images: imageUrls.value,
        video: videoUrl.value,
        status: "moderation",
      },
    });
  } else {
    const requestFields = {
      profile_id: profileStore.profileID,
      subcategory_id: route.params.subcategory,
      title: newContentItem.value.title,
      description: newContentItem.value.description,
      tags: tags.value,
      files: fileUrls.value.map((file) => file._id),
      images: imageUrls.value,
      video: videoUrl.value,
    };
    createContent(requestFields);
  }
}

const submitted = ref(false);

function openNew() {
  isEdit.value = false;
  newContentItem.value = {};
  videoUrl.value = null;
  submitted.value = false;
  contentDialog.value = true;
}

function openModerationDialog(item) {
  moderationDialog.value = true;
  newContentItem.value.id = item.data.id;
}

function hideDialog() {
  contentDialog.value = false;
  deleteContentDialog.value = false;
  moderationDialog.value = false;
  submitted.value = false;
}

function editContentItem(contentElement) {
  isEdit.value = true;
  fileUrls.value = contentElement.files;
  imageUrls.value = contentElement.images;
  videoUrl.value = contentElement.video;
  videoName.value = "id" + contentElement.video;
  tags.value = contentElement.tags;
  newContentItem.value = {
    ...contentElement,
  };
  contentDialog.value = true;
}

function confirmDeleteContent(contentElement) {
  elementIdToDelete.value = contentElement.id;
  deleteContentDialog.value = true;
}

const { mutate: deleteContent, isPending: isDeletingContent } =
  useDeleteContent({
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
  deleteContent(elementIdToDelete.value);
}

// function exportCSV() {
// 	dt.value.exportCSV()
// }

const { mutate: moderateContent, isPending: moderationPending } =
  useModerateContent({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Отзыв подтвержден",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось подтвердить отзыв",
        life: 3000,
      });
    },
  });

function saveModerationDialog() {
  submitted.value = true;
  moderateContent({
    id: newContentItem.value.id,
    moderationData: {
      profile_id: profileStore.profileID,
      status: newContentItem.value.status.code,
      moderation_comment: newContentItem.value.comment,
    },
  });
}

const expandedRows = ref([]);

function handleChangePage(event) {
  page.value = event.page + 1;
  first.value = event.page;
}

function handleChangeLimit(newLimit) {
  limit.value = newLimit;
}

const handleSearch = debounce((event) => {
  search.value = event.target.value;
}, 500);
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
        :value="
          contentElements.items?.filter(
            (item) => item.subcategoryId === route.params.subcategory,
          )
        "
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="limit"
        :total-records="contentElements.count"
        :lazy="true"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[7, 10, 25]"
        :currentPageReportTemplate="`{first} до {last} из ${contentElements.count} элементов`"
        :rowHover="true"
        selectionMode="single"
        :loading="isContentLoading"
        @page="handleChangePage"
        @update:rows="handleChangeLimit"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Контент</h4>
            <div class="flex gap-x-2">
              <Select
                v-model="selectedContentStatus"
                :options="contentStatuses"
                optionLabel="name"
                placeholder="Выберите статус"
                class="w-full"
              />
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText @input="handleSearch" placeholder="Поиск" />
              </IconField>
            </div>
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
          header="Подкатегория (ID)"
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
          style="min-width: 7rem"
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
            <div class="flex items-center gap-x-2">
              <Button
                icon="pi pi-pencil"
                outlined
                rounded
                @click="editContentItem(slotProps.data)"
              />
              <Button
                icon="pi pi-trash"
                outlined
                rounded
                severity="danger"
                @click="confirmDeleteContent(slotProps.data)"
              />
              <Button
                icon="pi pi-file-edit"
                class="mr-2"
                outlined
                label="Модерирование"
                severity="help"
                @click="openModerationDialog(slotProps)"
              />
            </div>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div v-if="slotProps.data.profile" class="p-4">
            <div class="flex items-start gap-x-20 mb-4">
              <div>
                <h5>Изображения</h5>
                <div class="flex flex-wrap gap-4 min-w-[150px]">
                  <Image
                    v-for="image in slotProps.data.images"
                    :src="'https://aidoo-test.ru/api-admin/files/' + image"
                    alt="Image"
                    width="50"
                  />
                </div>
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
            <div class="flex items-start gap-x-20 mb-4">
              <div class="min-w-[150px]">
                <h5>Файлы</h5>
                <div class="flex flex-wrap gap-x-2 mt-4">
                  <FileComponent
                    v-for="file in slotProps.data.files"
                    :file="file"
                    download
                  ></FileComponent>
                </div>
              </div>
              <div>
                <h5>Доп. информация</h5>
                <span class="text-lg font-semibold">Тэги: </span>
                <span v-for="tag in slotProps.data.tags">{{ tag }}</span>
                <div>
                  <p class="mb-2">
                    <span class="text-lg font-semibold"
                      >Счетчик просмотров:</span
                    >
                    {{ slotProps.data.countViews }}
                  </p>
                  <p class="mb-2">
                    <span class="text-lg font-semibold"
                      >Счетчик "в избранном":</span
                    >
                    {{ slotProps.data.countFavorites }}
                  </p>
                  <p class="mb-2">
                    <span class="text-lg font-semibold">Счетчик лайков:</span>
                    {{ slotProps.data.countLikes }}
                  </p>
                  <p class="mb-2">
                    <span class="text-lg font-semibold"
                      >Счетчик дизлайков:</span
                    >
                    {{ slotProps.data.countDislikes }}
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
              >
                <template #body="slotProps">
                  <span>{{ getProfileType(slotProps.data.profile_type) }}</span>
                </template>
              </Column>
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
      v-model:visible="contentDialog"
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
          <div class="flex flex-wrap gap-4">
            <Image
              v-for="src in imageUrls"
              :src="'https://aidoo-test.ru/api-admin/files/' + src"
              alt="Image"
              class="shadow-md rounded-xl w-full size-40 sm:w-64 mt-4"
            />
          </div>
          <small
            v-if="submitted && imageUrls?.length === 0"
            class="text-red-500"
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
          <p>{{ videoName }}</p>
          <small v-if="submitted && !videoUrl" class="text-red-500"
            >Обязательное поле</small
          >
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
            multiple
          />
          <div class="flex flex-wrap gap-x-2 mt-4">
            <FileComponent
              v-for="file in fileUrls"
              :file="file"
            ></FileComponent>
          </div>
          <small v-if="submitted && fileUrls?.length === 0" class="text-red-500"
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
          @click="saveNewContentItem"
          :loading="isCreatingNewAdv"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteContentDialog"
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
          @click="deleteContentDialog = false"
        />
        <Button
          label="Да"
          icon="pi pi-check"
          @click="deleteProfile"
          :loading="isDeletingContent"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="moderationDialog"
      :style="{ width: '450px' }"
      header="Модерирование"
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div>
          <div class="block font-bold mb-3">Статус</div>
          <Select
            v-model="newContentItem.status"
            :options="statusOptions"
            optionLabel="name"
            placeholder="Выберите статус"
            class="w-full"
            :invalid="submitted && !newContentItem.status"
          />
          <small v-if="submitted && !newContentItem.status" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Комментарий модератора</div>
          <Textarea
            v-model="newContentItem.comment"
            placeholder="Комментарий"
            class="w-full"
            :invalid="
              submitted &&
              !newContentItem.comment &&
              newContentItem.comment.length >= 30
            "
          />
          <p class="text-right">{{ newContentItem.comment?.length }} / 30</p>
          <small
            v-if="submitted && !newContentItem.comment"
            class="text-red-500"
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
