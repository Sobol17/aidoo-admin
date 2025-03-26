<script setup>
import { useDeleteProduct, useProducts } from "@/composables/useProducts";

const { data: products, isLoading, error } = useProducts();
const { mutate: deleteProduct } = useDeleteProduct();

const handleDelete = (id) => {
  if (confirm("Удалить этот продукт?")) {
    deleteProduct(id);
  }
};
</script>

<template>
  <div>
    <h2>Список продуктов</h2>
    <div v-if="isLoading">Загрузка...</div>
    <div v-else-if="error">Ошибка: {{ error.message }}</div>
    <ul v-else>
      <li v-for="product in products" :key="product.id">
        {{ product.name }} - {{ product.price }} $
        <button @click="handleDelete(product.id)">Удалить</button>
      </li>
    </ul>
  </div>
</template>
