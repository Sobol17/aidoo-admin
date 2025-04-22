import { useQuery } from "@tanstack/vue-query";
import { useProfileStore } from "@/stores/profile";
import { getSubs } from "@/api/subs";
import { formatDate } from "@/utils/formatDate";

export function useSubs(page = 1, limit = 1000) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["subs"],
    queryFn: () => getSubs(profileStore.profileID, page, limit),
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const subs = data.documents;
        return {
          countSubs: data.count,
          subs: subs.map((sub) => ({
            id: sub._id,
            userId: sub.user_id,
            startDate: formatDate(sub.start_date),
            endDate: formatDate(sub.end_date),
            history: sub.history,
          })),
        };
      }
      return null;
    },
  });
}
