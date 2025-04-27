<script setup>
import { ref } from "vue";
import Avatar from "primevue/avatar";
import Button from "primevue/button";
import { useProfileStore } from "@/stores/profile";
import { useUploadFile } from "@/composables/useFiles";

const profileStore = useProfileStore();
const props = defineProps({
  messages: Array,
});
const emits = defineEmits(["sendMessage"]);

function getImageUrl(id) {
  return `https://aidoo-test.ru/api-admin/files/${id}`;
}

const newMessage = ref("");

function isMyMessage(message) {
  return message.sender._id === profileStore.profileID;
}

function formatTime(timestamp) {
  const cleanTimestamp = timestamp.slice(0, 23);
  const date = new Date(cleanTimestamp);

  const formattedDate = date
    .toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    })
    .replace(".", ""); // убираем точку после месяца

  const formattedTime = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${formattedDate} ${formattedTime}`;
}

function getAvatarUrl(id) {
  return `https://aidoo-test.ru/api-admin/files/${id}`;
}

const myTempMessage = ref(null);

function sendMessage() {
  const trimmed = newMessage.value.trim();
  if (!trimmed) return;

  myTempMessage.value = {
    _id: Date.now().toString(),
    text: trimmed,
    timestamp: new Date().toISOString(),
    sender: { _id: profileStore.profileID, avatar_id: "my-avatar.png" },
  };

  emits("sendMessage", {
    text: trimmed,
    attachments: imageUrls.value,
  });

  newMessage.value = "";
  scrollToBottom();
}

function scrollToBottom() {
  setTimeout(() => {
    const container = document.querySelector(".grow");
    if (container) container.scrollTop = container.scrollHeight;
  }, 50);
}

const imageUrls = ref([]);

const { mutate: uploadImage, isPending: isImageUploading } = useUploadFile({
  onSuccess: (data) => {
    imageUrls.value.push(data._id);
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
</script>

<template>
  <div class="flex flex-col h-full max-h-[800px] overflow-y-auto">
    <!-- Сообщения -->
    <div
      v-if="messages?.length > 0"
      class="flex flex-col gap-4 p-4 overflow-y-auto grow"
    >
      <div
        v-for="message in messages"
        :key="message._id"
        class="flex items-end"
        :class="isMyMessage(message) ? 'justify-end' : 'justify-start'"
      >
        <!-- Аватар только для чужих -->
        <Avatar
          v-if="!isMyMessage(message)"
          :image="getAvatarUrl(message.sender.avatar_id)"
          shape="circle"
          icon="pi pi-user"
          class="w-10 h-10 mr-2 bg-cyan-950"
        />

        <!-- Сообщение -->
        <div
          class="max-w-xs px-4 py-2 rounded-lg shadow-sm"
          :class="
            isMyMessage(message)
              ? 'bg-primary-500 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-900 rounded-bl-none'
          "
        >
          <p v-if="message.text" class="break-words">{{ message.text }}</p>

          <div v-if="message.attachments?.length" class="mt-2 space-y-2">
            <a
              v-for="(attachment, index) in message.attachments"
              :href="getImageUrl(attachment)"
              download
            >
              <Image
                :src="getImageUrl(attachment)"
                alt="attachment"
                width="50"
                class="rounded-lg max-w-full max-h-60 object-cover"
              />
            </a>
          </div>

          <p class="text-xs text-right mt-1 opacity-70">
            {{ formatTime(message.timestamp) }}
          </p>
        </div>
      </div>
    </div>
    <div class="text-center text-lg my-10" v-else>Сообщения отсутствуют</div>
    <!--Отправленное сообщение-->
    <div v-if="myTempMessage" class="flex items-end justify-end">
      <!-- Сообщение -->
      <div
        class="max-w-xs px-4 py-2 rounded-lg shadow-sm bg-primary-500 text-white rounded-br-none"
      >
        <p class="break-words">{{ myTempMessage.text }}</p>

        <div v-if="myTempMessage.attachments?.length" class="mt-2 space-y-2">
          <a
            v-for="(attachment, index) in myTempMessage.attachments"
            :href="getImageUrl(attachment)"
            download
          >
            <Image
              :src="getImageUrl(attachment)"
              alt="attachment"
              width="50"
              class="rounded-lg max-w-full max-h-60 object-cover"
            />
          </a>
        </div>

        <p class="text-xs text-right mt-1 opacity-70">
          {{ formatTime(myTempMessage.timestamp) }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 border-t grow">
      <Image
        v-for="src in imageUrls"
        :src="'https://aidoo-test.ru/api-admin/files/' + src"
        alt="Image"
        class="shadow-md rounded-xl w-full size-auto sm:w-auto mt-4"
      />
    </div>
    <div class="p-4 flex items-end gap-2">
      <Textarea
        v-model="newMessage"
        @keyup.enter="sendMessage"
        autoResize
        rows="1"
        placeholder="Введите сообщение..."
        class="flex-grow max-h-60 !overflow-y-auto resize-none rounded-full px-4 py-2 border outline-none"
      />
      <FileUpload
        mode="basic"
        @select="onUploadImages"
        customUpload
        auto
        severity="secondary"
        class="p-button-outlined"
        chooseLabel="Вложение"
        multiple
      />
      <Button
        label="Отправить"
        icon="pi pi-send"
        class="px-4 py-2"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
