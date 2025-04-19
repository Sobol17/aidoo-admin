<script setup>
import { useAccounts } from "@/composables/useAdminAccounts";
import {
  useAdminProfiles,
  useCreateAdminProfile,
  useDeleteAdminProfile,
  useUpdateAdminProfile,
} from "@/composables/useAdminProfiles";
import { useProfileStore } from "@/stores/profile";
import { FilterMatchMode } from "@primevue/core/api";
import { Button } from "primevue";
import { useToast } from "primevue/usetoast";
import { computed, ref } from "vue";

const profileStore = useProfileStore();

const { data: profilesData, isLoading, error } = useAdminProfiles("all");

const profiles = computed(() => {
  return profilesData?.value || [];
});

const toast = useToast();
const dt = ref();
const profileDialog = ref(false);
const deleteProfileDialog = ref(false);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const profileIdToDelete = ref(null);

const isEdit = ref(false);

const profileTypes = ref([
  { name: "Админ", code: "admin" },
  { name: "Модератор", code: "moderator" },
  { name: "Спонсор", code: "supporter" },
  { name: "Сотрудник", code: "employee" },
]);

const newProfile = ref({
  firstName: "",
  lastName: "",
  phone: "",
  city: "",
  accountId: "",
  profileType: "",
});

const src = ref(null);

function onUpload(e) {
  src.value = e.files[0].objectURL;
  toast.add({
    severity: "info",
    summary: "Успех",
    detail: "Файлы загружены",
    life: 3000,
  });
}

const numericPhone = computed(() => {
  const phone = newProfile.value.phone;
  // Проверяем, является ли phone строкой перед вызовом replace
  return typeof phone === "string" ? parseInt(phone.replace(/\D/g, "")) : phone;
});

const { mutate: createProfile, isPending: isCreatingNewProfile } =
  useCreateAdminProfile({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Профиль успешно создан",
        life: 3000,
      });
      hideDialog();
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось создать профиль",
        life: 3000,
      });
    },
  });

const { mutate: updateProfile, isPending: isUpdatingProfile } =
  useUpdateAdminProfile({
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

const adminAccountsOptions = computed(() => {
  return adminAccounts?.value?.map((account) => ({
    name: account.phone,
    code: account.id,
  }));
});

function saveNewProfile() {
  submitted.value = true;

  if (isEdit.value) {
    updateProfile({
      id: newProfile.value.id,
      accountData: {
        phone: numericPhone.value,
        profile_type: newProfile.value.profileType.code,
        first_name: newProfile.value.firstName,
        status: "actived",
        // avatar_id: src.value || '',
        last_name: newProfile.value.lastName,
        city: newProfile.value.city,
      },
    });
  } else {
    createProfile({
      profile_id: profileStore.profileID,
      phone: numericPhone.value,
      profile_type: newProfile.value.profileType.code,
      account_id: newProfile.value.accountId.code,
      // avatar_id: src.value || '',
      first_name: newProfile.value.firstName,
      last_name: newProfile.value.lastName,
      city: newProfile.value.city,
    });
  }
}

const submitted = ref(false);

function openNew() {
  isEdit.value = false;
  newProfile.value = {
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    accountId: "",
    profileType: "",
  };
  src.value = null;
  submitted.value = false;
  profileDialog.value = true;
}

function hideDialog() {
  profileDialog.value = false;
  deleteProfileDialog.value = false;
  submitted.value = false;
}

function editProfile(profileElement) {
  isEdit.value = true;

  const accountOption = adminAccountsOptions.value?.find(
    (option) => option.code === profileElement.accountId,
  );

  let profileTypeCode = "";
  if (profileElement.profileType === "Администратор") profileTypeCode = "admin";
  else if (profileElement.profileType === "Модератор")
    profileTypeCode = "moderator";
  else if (profileElement.profileType === "Спонсор")
    profileTypeCode = "supporter";
  else if (profileElement.profileType === "Сотрудник")
    profileTypeCode = "employee";

  const profileTypeOption = profileTypes.value.find(
    (option) => option.code === profileTypeCode,
  ) || { name: profileElement.profileType, code: profileTypeCode };

  newProfile.value = {
    ...profileElement,
    accountId: accountOption,
    profileType: profileTypeOption,
  };

  profileDialog.value = true;
}

function confirmDeleteProfile(profileElement) {
  profileIdToDelete.value = profileElement.id;
  deleteProfileDialog.value = true;
}

const { mutate: useDeleteProfile, isPending: isDeletingProfile } =
  useDeleteAdminProfile({
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
  useDeleteProfile(profileIdToDelete.value);
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
        :value="profiles"
        stripedRows
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="{first} до {last} из {totalRecords} элементов"
        :loading="isLoading"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <h4 class="m-0">Профили (ПУ)</h4>
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

        <Column field="avatar" header="Аватар" sortable style="min-width: 8rem">
          <template #body="slotProps">
            <Avatar
              v-if="slotProps.data.avatar"
              :image="slotProps.data.avatar"
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
          field="accountId"
          header="Аккаунт (ID)"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="creatorId"
          header="Создатель (ID)"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="phone"
          header="Телефон"
          sortable
          style="min-width: 12rem"
        ></Column>
        <Column
          field="firstName"
          header="Имя"
          sortable
          style="min-width: 8rem"
        ></Column>
        <Column
          field="lastName"
          header="Фамилия"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="city"
          header="Город"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="status"
          header="Статус"
          sortable
          style="min-width: 10rem"
        ></Column>
        <Column
          field="profileType"
          header="Роль"
          style="min-width: 10rem"
        ></Column>
        <Column
          field="id"
          header="ID профиля"
          sortable
          style="min-width: 16rem"
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
      v-model:visible="profileDialog"
      :style="{ width: '450px' }"
      :header="
        isEdit ? 'Редактирование профиля (ПУ)' : 'Добавление профиля (ПУ)'
      "
      :modal="true"
    >
      <div class="flex flex-col gap-6">
        <div v-if="isEdit">
          <label for="name" class="block font-bold mb-3">ID</label>
          <InputText
            id="id"
            v-model.trim="newProfile.id"
            required="true"
            autofocus
            :invalid="submitted && !newProfile.id"
            fluid
            disabled
          />
          <small v-if="submitted && !newProfile.id" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Аватар</div>
          <FileUpload
            mode="basic"
            @select="onUpload"
            customUpload
            auto
            severity="secondary"
            class="p-button-outlined"
            chooseLabel="Выбрать"
          />
          <img
            v-if="src"
            :src="src"
            alt="Image"
            class="shadow-md rounded-xl w-full size-40 sm:w-64 mt-4"
          />
        </div>
        <div>
          <label for="firstName" class="block font-bold mb-3">Имя</label>
          <InputText
            id="firstName"
            v-model.trim="newProfile.firstName"
            required="true"
            autofocus
            :invalid="submitted && !newProfile.firstName"
            fluid
          />
          <small v-if="submitted && !newProfile.firstName" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <label for="lastName" class="block font-bold mb-3">Фамилия</label>
          <InputText
            id="lastName"
            v-model.trim="newProfile.lastName"
            required="true"
            autofocus
            :invalid="submitted && !newProfile.lastName"
            fluid
          />
          <small v-if="submitted && !newProfile.lastName" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <label for="name" class="block font-bold mb-3">Телефон</label>
          <InputText
            id="phone"
            v-model.trim="newProfile.phone"
            required="true"
            autofocus
            :invalid="submitted && !newProfile.phone"
            fluid
          />
          <small v-if="submitted && !newProfile.phone" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <label for="city" class="block font-bold mb-3">Город</label>
          <InputText
            id="city"
            v-model.trim="newProfile.city"
            required="true"
            autofocus
            :invalid="submitted && !newProfile.city"
            fluid
          />
          <small v-if="submitted && !newProfile.city" class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">Тип профиля</div>
          <Select
            v-model="newProfile.profileType"
            :options="profileTypes"
            optionLabel="name"
            placeholder="Тип профиля"
            class="w-full"
            :invalid="submitted && !newProfile.profileType"
          />
          <small
            v-if="submitted && !newProfile.profileType"
            class="text-red-500"
            >Обязательное поле</small
          >
        </div>
        <div>
          <div class="block font-bold mb-3">
            Аккаунт, к которому привязан профиль
          </div>
          <Select
            v-model="newProfile.accountId"
            :options="adminAccountsOptions"
            optionLabel="name"
            placeholder="Аккаунт (ID)"
            class="w-full"
            :invalid="submitted && !newProfile.profileType"
          />
          <small
            v-if="submitted && !newProfile.profileType"
            class="text-red-500"
            >Обязательное поле</small
          >
        </div>
      </div>

      <template #footer>
        <Button label="Отменить" icon="pi pi-times" text @click="hideDialog" />
        <Button
          label="Сохранить"
          icon="pi pi-check"
          @click="saveNewProfile"
          :loading="isCreatingNewProfile"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteProfileDialog"
      :style="{ width: '450px' }"
      header="Подтверждение"
      :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        Вы уверены, что хотите удалить профиль c id {{ profileIdToDelete }}?
      </div>
      <template #footer>
        <Button
          label="Нет"
          icon="pi pi-times"
          text
          @click="deleteProfileDialog = false"
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
