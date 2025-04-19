<script setup>
import categoriesData from "@/utils/categoriesData";
</script>

<template>
  <div class="categories">
    <h2 class="m-0">Категории</h2>
    <div class="flex flex-wrap gap-4 mt-4">
      <RouterLink
        v-for="category in categoriesData"
        :key="category.code"
        :to="'/categories/' + category.code"
        class="card w-80 h-40 border hover:shadow-lg transition-all duration-200"
      >
        <h4>{{ category.name }}</h4>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
