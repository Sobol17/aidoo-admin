<script setup>
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";
import { useModerateReview, useReviews } from "@/composables/userReviews";

const profileStore = useProfileStore();

const { data: reviewsData, isLoading: isLoadingReviews } = useReviews("all");

const reviews = computed(() => {
  return reviewsData?.value || [];
});

const toast = useToast();
const dt = ref();
const moderationDialog = ref(false);
const detailDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const statusOptions = ref([
  { name: "Подтвержден", code: "verified" },
  { name: "Заблокирован", code: "blocked" },
]);

const reviewItem = ref({
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  accountId: "",
  profileType: "",
});

const { mutate: moderateReview, isPending: moderationPending } =
  useModerateReview({
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

  moderateReview({
    id: reviewItem.value.id,
    moderationData: {
      profile_id: profileStore.profileID,
      status: reviewItem.value.status.code,
      moderation_comment: reviewItem.value.comment,
    },
  });
}

const submitted = ref(false);

function openNew(event) {
  reviewItem.value = {
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    accountId: event.data.accountId,
    profileType: "",
    id: event.data.id,
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

const expandedRows = ref([]);
</script>

<template>
  <div>
    <div class="card">
      <DataTable
        v-model:expanded-rows="expandedRows"
        ref="dt"
        :value="reviews"
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
        :loading="isLoadingReviews"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Отзывы</h4>
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

        <Column field="grade" header="Оценка">
          <template #body="slotProps">
            <Rating :modelValue="slotProps.data.grade" readonly />
          </template>
        </Column>
        <Column
          field="text"
          header="Текст"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="reviewStatus"
          header="Статус"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column field="Автор" header="price" sortable style="min-width: 8rem">
          <template #body="slotProps">
            <span v-if="slotProps.data.profile"
              >{{ slotProps.data.profile.first_name }}
              {{ slotProps.data.profile.last_name }}</span
            >
            <span v-else>Отсутсвует</span>
          </template>
        </Column>
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
              outlined
              label="Модерирование"
              severity="help"
              @click="openNew(slotProps)"
            />
          </template>
        </Column>
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
