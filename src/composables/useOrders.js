import { useQuery } from "@tanstack/vue-query";
import { useProfileStore } from "@/stores/profile";
import { getOrders } from "@/api/orders";
import { computed } from "vue";
import { formatDate } from "@/utils/formatDate";

export function useOrders(orderStatusRef, page = 1, limit = 1000) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["orders", orderStatusRef.value.code]),
    queryFn: () =>
      getOrders(profileStore.profileID, orderStatusRef.value.code, page, limit),
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const orders = data.documents;
        return {
          countOrders: data.count,
          orders: orders.map((order) => ({
            id: order._id,
            userId: order.user_id,
            startDate: formatDate(order.start_date),
            endDate: formatDate(order.end_date),
            history: order.history,
          })),
        };
      }
      return null;
    },
  });
}
