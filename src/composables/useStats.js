import { useQuery } from "@tanstack/vue-query";
import { getStats } from "@/api/stats";
import { useProfileStore } from "@/stores/profile";

export function useStats() {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats(profileStore.profileID),
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      return {
        sumOrders: data.sum_orders,
        completedOrders: data.completed_orders,
        activeSubs: data.count_active_subs,
      };
    },
  });
}
