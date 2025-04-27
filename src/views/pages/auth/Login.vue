<script setup>
import FloatingConfigurator from "@/components/FloatingConfigurator.vue";
import { useMakeAuth } from "@/composables/useAuth";
import {
  handlePhoneInput as formatInput,
  validatePhone,
} from "@/utils/formatPhoneNumber";
import { ref } from "vue";

const phone = ref("");
const password = ref("");
const checked = ref(false);
const phoneError = ref("");

const { mutate: login, isPending, isError } = useMakeAuth();

const handlePhoneInput = (e) => {
  phone.value = formatInput(e.target.value);
};

const handlePhoneFocus = () => {
  if (!phone.value) {
    phone.value = "8";
  }
};

const handleKeyPress = (e) => {
  const allowedChars = /[0-9]/;
  if (!allowedChars.test(e.key)) {
    e.preventDefault();
  }
};

const handleLogin = () => {
  if (!validatePhone(phone.value)) {
    phoneError.value = "Введите корректный номер телефона";
    return;
  }
  phoneError.value = "";

  const numericPhone = parseInt(phone.value.replace(/\D/g, ""));

  login({
    phone: numericPhone,
    password: password.value,
  });
};
</script>

<template>
  <FloatingConfigurator />
  <div
    class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
  >
    <div class="flex flex-col items-center justify-center">
      <div
        style="
          border-radius: 56px;
          padding: 0.3rem;
          background: linear-gradient(
            180deg,
            var(--primary-color) 10%,
            rgba(33, 150, 243, 0) 30%
          );
        "
      >
        <div
          class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20"
          style="border-radius: 53px"
        >
          <div class="text-center mb-8">
            <div
              class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4"
            >
              Добро пожаловать!
            </div>
            <span class="text-muted-color font-medium"
              >Войдите чтобы продолжить</span
            >
          </div>

          <div>
            <label
              for="email1"
              class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2"
              >Телефон</label
            >
            <InputText
              id="email1"
              type="tel"
              pattern="[0-9]*"
              inputmode="numeric"
              placeholder="8 (999) 999-99-99"
              class="w-full md:w-[30rem] mb-2"
              v-model="phone"
              @input="handlePhoneInput"
              @keypress="handleKeyPress"
              @focus="handlePhoneFocus"
              maxlength="18"
              :invalid="phoneError !== '' || isError"
            />
            <small class="text-red-500 block mb-6" v-if="phoneError">{{
              phoneError
            }}</small>

            <label
              for="password1"
              class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2"
              >Пароль</label
            >
            <Password
              id="password1"
              v-model="password"
              placeholder="Password"
              :toggleMask="true"
              class="mb-4"
              fluid
              :feedback="false"
              :invalid="isError"
            ></Password>

            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
              <div class="flex items-center">
                <Checkbox
                  v-model="checked"
                  id="rememberme1"
                  binary
                  class="mr-2"
                ></Checkbox>
                <label for="rememberme1">Запомнить</label>
              </div>
              <span
                class="font-medium no-underline ml-2 text-right cursor-pointer text-primary"
                >Забыли пароль?</span
              >
            </div>
            <small class="text-red-500 block mb-6" v-if="isError"
              >Неверные данные для входа</small
            >
            <Button label="Войти" class="w-full" @click="handleLogin"></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
