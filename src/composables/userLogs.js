import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import { keepPreviousData, useQuery } from "@tanstack/vue-query";
import { getLogs } from "@/api/logs";
import { computed } from "vue";

function transformAction(action) {
  switch (action) {
    case "add":
      return "Добавление";
    case "update":
      return "Обновление";
    case "delete":
      return "Удаление";
    case "moderate":
      return "Модерирование";
    default:
      action;
  }
}

function transformObjectType(object) {
  switch (object) {
    case "account":
      return "Аккаунт";
    case "profile":
      return "Профиль";
    default:
      object;
  }
}

export function useLogs(accountId, page, limit) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["logs", accountId, page, limit]),
    queryFn: () =>
      getLogs(accountId, page.value, limit.value, profileStore.profileID),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const logs = data.documents;
        return logs.map((log) => ({
          id: log._id,
          accountId: log.account_id,
          profileId: log.profile_id,
          action: transformAction(log.action),
          objectType: transformObjectType(log.object_type),
          objectId: log.object_id,
          createdAt: formatDate(log.created_at),
          updatedAt: formatDate(log.updated_at),
        }));
      }
      return null;
    },
  });
}
