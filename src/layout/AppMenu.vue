<script setup>
import { ref } from "vue";

import AppMenuItem from "./AppMenuItem.vue";

const model = ref([
  {
    label: "Основные функции",
    items: [
      { label: "Оформить нарушение", icon: "pi pi-fw pi-home", to: "/report" },
      {
        label: "Управление МП",
        icon: "pi pi-fw pi-home",
        to: "/management",
      },
      {
        label: "Контроль платежей",
        icon: "pi pi-fw pi-home",
        to: "/payments",
      },
    ],
  },
  {
    label: "Модерирование",
    items: [
      {
        label: "Аккаунты(ПУ)",
        icon: "pi pi-fw pi-user-edit",
        iconSrc: "/demo/images/setting.png",
        to: "/admin-accounts",
      },
      { label: "Аккаунты(МП)", icon: "pi pi-fw pi-user", to: "/user-accounts" },
      {
        label: "Профили(ПУ)",
        icon: "pi pi-fw pi-user-edit",
        iconSrc: "/demo/images/setting.png",
        to: "/admin-profiles",
      },
      { label: "Профили(МП)", icon: "pi pi-fw pi-user", to: "/user-profiles" },
      { label: "Категории", icon: "pi pi-fw pi-th-large", to: "/categories" },
      {
        label: "Реклама",
        icon: "pi pi-fw pi-calendar-plus",
        to: "/advertising",
      },
      { label: "Предложения", icon: "pi pi-fw pi-receipt", to: "/offers" },
      { label: "Отзывы", icon: "pi pi-fw pi-file-edit", to: "/reviews" },
      { label: "Контент", icon: "pi pi-fw pi-home", to: "/content" },
      { label: "Жалобы", icon: "pi pi-fw pi-home", to: "/complaints" },
      { label: "Чаты", icon: "pi pi-fw pi-home", to: "/chats" },
      { label: "Поддержка", icon: "pi pi-fw pi-home", to: "/support" },
    ],
  },
]);
</script>

<template>
  <ul class="layout-menu">
    <template v-for="(item, i) in model" :key="item">
      <app-menu-item
        v-if="!item.separator"
        :item="item"
        :index="i"
      ></app-menu-item>
      <li v-if="item.separator" class="menu-separator"></li>
    </template>
  </ul>
</template>

<style lang="scss" scoped></style>
