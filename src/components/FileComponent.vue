<script setup>
const props = defineProps({
  file: Object,
  download: Boolean,
});
</script>

<template>
  <div
    v-if="!download"
    class="w-[220px] h-[80px] rounded-lg p-4 flex gap-x-2 items-center justify-center border border-gray-600"
  >
    <span class="pi pi-file"></span>
    <p class="text-sm">{{ file.filename }}</p>
  </div>
  <a
    v-else
    :href="'https://aidoo-test.ru/api-admin/files/' + file"
    class="w-[220px] h-[80px] rounded-lg p-4 flex gap-x-2 items-center justify-center border border-gray-600"
    download
  >
    <span class="pi pi-file"></span>
    <p class="text-sm">{{ file.filename ?? file }}</p>
  </a>
</template>

<style scoped lang="scss"></style>
