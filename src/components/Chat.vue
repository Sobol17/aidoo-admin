<script setup>
import FileComponent from '@/components/FileComponent.vue'
import { useUploadFile } from '@/composables/useFiles'
import { useProfileStore } from '@/stores/profile'
import { useToast } from 'primevue'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import { ref } from 'vue'

const profileStore = useProfileStore()
const emits = defineEmits(['sendMessage'])

const newMessage = ref('')

function isMyMessage(message) {
	return message.sender._id === profileStore.profileID
}

function formatTime(timestamp) {
	const cleanTimestamp = timestamp.slice(0, 23)
	const date = new Date(cleanTimestamp)

	const formattedDate = date
		.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
		})
		.replace('.', '')

	const formattedTime = date.toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	})

	return `${formattedDate} ${formattedTime}`
}

function getAvatarUrl(id) {
	return `https://aidoo-test.ru/api-admin/files/${id}`
}

const myTempMessages = ref([])

function sendMessage() {
	const trimmed = newMessage.value.trim()
	if (!trimmed) return

	myTempMessages.value.push({
		_id: Date.now().toString(),
		text: trimmed,
		timestamp: new Date().toISOString(),
		sender: { _id: profileStore.profileID, avatar_id: 'my-avatar.png' },
	})

	emits('sendMessage', {
		text: trimmed,
		attachments: files.value.map(file => file._id),
	})

	newMessage.value = ''
	scrollToBottom()
}

function scrollToBottom() {
	setTimeout(() => {
		const container = document.querySelector('.grow')
		if (container) container.scrollTop = container.scrollHeight
	}, 50)
}

const files = ref([])

const { mutate: uploadImage } = useUploadFile({
	onSuccess: data => {
		files.value.push(data)
	},
})

const toast = useToast()

function onUploadImages(e) {
	for (const item of e.files) {
		const formData = new FormData()
		formData.append('document', item)
		try {
			uploadImage(formData)
		} catch {
			console.error('Ошибка загрузки файла:', item.name)
		}
	}

	toast.add({
		severity: 'info',
		summary: 'Завершено',
		detail: 'Загрузка файлов завершена',
		life: 3000,
	})
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

					<div
						v-if="message.attachments?.length"
						class="flex flex-col mt-2 space-y-2"
					>
						<FileComponent
							v-for="(attachment, index) in message.attachments"
							:key="index"
							:file="attachment"
							mini
							download
						/>
					</div>

					<p class="text-xs text-right mt-1 opacity-70">
						{{ formatTime(message.timestamp) }}
					</p>
				</div>
			</div>
			<!--Отправленное сообщение-->
			<div
				v-for="message in myTempMessages"
				:key="message"
				class="flex items-end justify-end"
			>
				<div
					class="max-w-xs px-4 py-2 rounded-lg shadow-sm bg-primary-500 text-white rounded-br-none"
				>
					<p class="break-words">{{ message.text }}</p>

					<div v-if="message.attachments?.length" class="mt-2 space-y-2">
						<FileComponent
							v-for="(attachment, index) in message.attachments"
							:key="index"
							:file="attachment"
							mini
							download
						/>
					</div>

					<p class="text-xs text-right mt-1 opacity-70">
						{{ formatTime(message.timestamp) }}
					</p>
				</div>
			</div>
		</div>
		<div class="text-center text-lg my-10" v-else>Сообщения отсутствуют</div>

		<div class="flex flex-wrap gap-4 border-t grow pt-4">
			<FileComponent v-for="file in files" :key="file" :file="file" mini />
		</div>
		<div class="p-4 flex items-end gap-2">
			<Textarea
				v-model="newMessage"
				@keyup.enter="sendMessage"
				autoResize
				rows="1"
				placeholder="Введите сообщение. Минимум 30 Символов"
				class="flex-grow max-h-60 !overflow-y-auto resize-none rounded-full px-4 py-2 border outline-none"
			/>
			<span class="text-sm">{{ newMessage?.length }} / 30</span>
			<FileUpload
				mode="basic"
				@select="onUploadImages"
				customUpload
				auto
				severity="secondary"
				class="p-button-outlined"
				chooseLabel="Файл"
				multiple
			/>
			<Button
				label="Отправить"
				icon="pi pi-send"
				class="px-4 py-2"
				:disabled="newMessage?.length < 30"
				@click="sendMessage"
			/>
		</div>
	</div>
</template>

<style scoped lang="scss"></style>
