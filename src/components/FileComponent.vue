<script setup>
defineProps({
  file: [Object, String],
  download: Boolean,
  mini: Boolean,
});
</script>

<template>
  <div
    v-if="!download"
    class="w-[220px] h-[80px] rounded-lg p-4 flex gap-x-2 items-center justify-center border border-gray-600"
    :class="{ 'w-[120px] h-[40px]': mini }"
  >
    <span class="pi pi-file"></span>
    <p class="text-sm text-ellipsis line-clamp-2 shrink-0 max-w-full">
      {{ file.filename }}
    </p>
  </div>

  <a
    v-else
    :href="'https://aidoo-test.ru/api-admin/files/' + file"
    class="w-[220px] h-[80px] rounded-lg p-4 flex gap-x-2 items-center justify-center border border-gray-600"
    download
  >
    <span class="pi pi-file"></span>
    <p class="text-sm text-ellipsis line-clamp-1 shrink-0 max-w-40">
      {{ file.filename ?? file }}
    </p>
  </a>
</template>

<style scoped lang="scss"></style>
