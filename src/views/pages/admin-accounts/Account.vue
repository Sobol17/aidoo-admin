<template>
  <div class="account-container">
    <Toast />
    <div
      v-if="isLoadingProfile"
      class="flex justify-content-center align-items-center pt-5"
    >
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
      <span class="ml-3 font-bold">Загрузка данных...</span>
    </div>
    <div
      v-else-if="!userData"
      class="flex justify-content-center align-items-center pt-5"
    >
      <Message severity="error" text="Пользователь не найден" />
    </div>
    <div v-else class="grid">
      <div class="col-12 md:col-4 lg:col-3">
        <Card class="h-full">
          <template #header>
            <div class="flex justify-content-center p-4">
              <Avatar
                icon="pi pi-user"
                size="xlarge"
                class="mb-3"
                style="width: 8rem; height: 8rem; font-size: 5rem"
              />
            </div>
          </template>
          <template #title>
            <div class="text-left">
              <h3 class="text-xl mt-0 mb-2">Аккаунт сотрудника</h3>
              <p class="m-0 text-sm text-500">ID: {{ userData._id }}</p>
            </div>
          </template>
          <template #content>
            <div class="flex flex-column gap-x-8 py-3">
              <div>
                <span class="font-semibold text-lg block mb-2">Создан:</span>
                <p class="m-0">{{ formatDate(userData.created_at) }}</p>
              </div>
              <div>
                <span class="font-semibold text-lg block mb-2">Обновлен:</span>
                <p class="m-0">{{ formatDate(userData.updated_at) }}</p>
              </div>
              <div>
                <span class="font-semibold text-lg block mb-2"
                  >ID создателя:</span
                >
                <p class="m-0">{{ userData.creator_id || "Не указан" }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="col-12 md:col-8 lg:col-9 mt-4">
        <Tabs value="0">
          <TabList>
            <Tab value="0">Общая информация</Tab>
            <Tab value="1">Профили</Tab>
            <Tab value="2">Логи</Tab>
          </TabList>
          <TabPanels>
            <TabPanel value="0">
              <div class="h-full">
                <h2 class="text-2xl m-0">Данные пользователя</h2>
                <div>
                  <Button
                    v-if="!editMode"
                    icon="pi pi-pencil"
                    label="Редактировать"
                    text
                    @click="toggleEditMode"
                    class="p-button-lg"
                  />
                  <Button
                    v-else
                    icon="pi pi-times"
                    label="Отменить"
                    severity="secondary"
                    text
                    @click="cancelEdit"
                    class="p-button-lg"
                  />
                  <Button
                    v-if="editMode"
                    label="Сохранить изменения"
                    icon="pi pi-save"
                    @click="saveChanges"
                    :loading="isUpdatingAccount"
                    class="p-button-lg"
                  />
                </div>
                <div class="p-fluid p-3">
                  <div class="field mb-5">
                    <label for="phone" class="font-medium text-lg mb-3 block"
                      >Телефон</label
                    >
                    <InputText
                      id="phone"
                      v-model="formData.phone"
                      :disabled="!editMode"
                    />
                  </div>

                  <Divider />

                  <div class="field mb-5">
                    <label for="password" class="font-medium text-lg mb-3 block"
                      >Пароль</label
                    >
                    <Password
                      id="password"
                      v-model="formData.password"
                      placeholder="Password"
                      :disabled="!editMode"
                      :feedback="editMode"
                      :toggleMask="true"
                      class="mb-4"
                    />
                  </div>

                  <Divider />

                  <div class="field mt-5">
                    <h3 class="text-xl mb-4">Безопасность</h3>
                    <div class="flex flex-column md:flex-row gap-4 mt-4">
                      <Button
                        label="Заблокировать аккаунт"
                        icon="pi pi-ban"
                        severity="danger"
                        outlined
                        @click="confirmBlock"
                        class="p-button-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel value="1">
              <p class="m-0">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia
                voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi
                nesciunt. Consectetur, adipisci velit, sed quia non numquam eius
                modi.
              </p>
            </TabPanel>
            <TabPanel value="2">
              <p class="m-0">
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident, similique sunt in culpa qui officia deserunt
                mollitia animi, id est laborum et dolorum fuga. Et harum quidem
                rerum facilis est et expedita distinctio. Nam libero tempore,
                cum soluta nobis est eligendi optio cumque nihil impedit quo
                minus.
              </p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import {
  useAccountById,
  useUpdateAccount,
} from "@/composables/useAdminAccounts";
import { useProfileStore } from "@/stores/profile";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const { data, isPending: isLoadingProfile } = useAccountById(route.params.id);

// Состояние и реактивные переменные
const userData = computed(() => data.value);
const editMode = ref(false);

// Форма для редактирования данных
const formData = reactive({
  phone: "",
  password: "",
});

// Форма для смены пароля
const passwordForm = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// Хуки и сервисы
const toast = useToast();
const confirm = useConfirm();

// Форматирование даты в удобный формат
const formatDate = (dateString) => {
  if (!dateString) return "Нет данных";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Обновление данных формы при загрузке данных пользователя
watch(
  () => userData.value,
  (newUserData) => {
    if (newUserData) {
      formData.phone = newUserData.phone || "";
      formData.password = newUserData.password || "";
    }
  },
  { immediate: true },
);

// Методы
const toggleEditMode = () => {
  editMode.value = true;
};

const cancelEdit = () => {
  // Сброс значений формы к оригинальным
  if (userData.value) {
    formData.phone = userData.value.phone || "";
    formData.password = userData.value.password || "";
  }
  editMode.value = false;
};

const { mutate: updateAccount, isPending: isUpdatingAccount } =
  useUpdateAccount({
    onSuccess: () => {
      toast.add({
        severity: "success",
        summary: "Успех",
        detail: "Аккаунт успешно обновлен",
        life: 3000,
      });
    },
    onError: (error) => {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось обновить аккаунт",
        life: 3000,
      });
    },
  });

const profileStore = useProfileStore();

const saveChanges = async () => {
  updateAccount({
    id: userData.value._id,
    accountData: {
      is_blocked: false,
      phone: formData.phone,
      password: formData.password,
      profile_id: profileStore.profileID,
    },
  });
};

const confirmBlock = () => {
  confirm.require({
    message: "Вы уверены, что хотите заблокировать этот аккаунт?",
    header: "Подтверждение блокировки",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Да",
    rejectLabel: "Нет",
    acceptClass: "p-button-danger",
    accept: () => {
      updateAccount({
        id: userData.value._id,
        accountData: {
          is_blocked: true,
          phone: formData.phone,
          password: formData.password,
          profile_id: profileStore.profileID,
        },
      });
      toast.add({
        severity: "info",
        summary: "Выполнено",
        detail: "Аккаунт заблокирован",
        life: 3000,
      });
    },
    reject: () => {
      // Действие отменено
    },
  });
};
</script>

<style lang="scss" scoped>
.account-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

@media screen and (max-width: 768px) {
  .account-container {
    padding: 1rem 0.5rem;
  }
}
</style>
