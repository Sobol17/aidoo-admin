<script setup>
import { useStats } from "@/composables/useStats";

const { data: stats, isPending: statsPending } = useStats();
</script>

<template>
  <div class="col-span-12 lg:col-span-6 xl:col-span-3">
    <div class="card mb-0">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-muted-color font-medium mb-4"
            >Всего заказов</span
          >
          <div
            v-if="!statsPending"
            class="text-surface-900 dark:text-surface-0 font-medium text-xl"
          >
            {{ stats.sumOrders }}
          </div>
          <ProgressSpinner
            v-else
            style="width: 35px; height: 35px"
            strokeWidth="8"
          />
        </div>
        <div
          class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border"
          style="width: 2.5rem; height: 2.5rem"
        >
          <i class="pi pi-shopping-cart text-blue-500 !text-xl"></i>
        </div>
      </div>
      <!--      <span class="text-primary font-medium">24 new </span>-->
      <!--      <span class="text-muted-color">since last visit</span>-->
    </div>
  </div>
  <div class="col-span-12 lg:col-span-6 xl:col-span-3">
    <div class="card mb-0">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-muted-color font-medium mb-4"
            >Выполненные заказы</span
          >
          <div
            v-if="!statsPending"
            class="text-surface-900 dark:text-surface-0 font-medium text-xl"
          >
            {{ stats.completedOrders }}
          </div>
          <ProgressSpinner
            v-else
            style="width: 35px; height: 35px"
            strokeWidth="8"
          />
        </div>
        <div
          class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border"
          style="width: 2.5rem; height: 2.5rem"
        >
          <i class="pi pi-dollar text-orange-500 !text-xl"></i>
        </div>
      </div>
      <!--      <span class="text-primary font-medium">%52+ </span>-->
      <!--      <span class="text-muted-color">since last week</span>-->
    </div>
  </div>
  <div class="col-span-12 lg:col-span-6 xl:col-span-3">
    <div class="card mb-0">
      <div class="flex justify-between mb-4">
        <div>
          <span class="block text-muted-color font-medium mb-4"
            >Активных подписок</span
          >
          <div
            v-if="!statsPending"
            class="text-surface-900 dark:text-surface-0 font-medium text-xl"
          >
            {{ stats.activeSubs }}
          </div>
          <ProgressSpinner
            v-else
            style="width: 35px; height: 35px"
            strokeWidth="8"
          />
        </div>
        <div
          class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border"
          style="width: 2.5rem; height: 2.5rem"
        >
          <i class="pi pi-users text-cyan-500 !text-xl"></i>
        </div>
      </div>
      <!--      <span class="text-primary font-medium">520 </span>-->
      <!--      <span class="text-muted-color">newly registered</span>-->
    </div>
  </div>
</template>
