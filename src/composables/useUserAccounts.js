import {
  deleteUserAccount,
  getUserAccounts,
  updateUserAccount,
} from "@/api/user-accounts";
import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { computed } from "vue";

export function useAccounts(search = "", page = 1, limit = 1000) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["user-accounts", search, page, limit]),
    queryFn: () =>
      getUserAccounts(
        search.value,
        page.value,
        limit.value,
        profileStore.profileID,
      ),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const accounts = data.documents;
        return {
          count: data.count,
          items: accounts.map((account) => ({
            blocked: account.blocked ? "Заблокирован" : "Активен",
            phone: account.phone,
            createdAt: formatDate(account.created_at),
            updatedAt: formatDate(account.updated_at),
            id: account._id,
          })),
        };
      }
      return null;
    },
  });
}

export function useUpdateAccount(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: ({ id, accountData }) =>
      updateUserAccount(id, accountData, profileStore.profileID),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-accounts"],
      });

      if (options.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: (error, variables) => {
      if (options.onError) {
        options.onError(error, variables);
      }
    },
  });
}

export function useDeleteAccount(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: (accountId) =>
      deleteUserAccount(accountId, profileStore.profileID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-accounts"],
      });
      if (options.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (error, variables) => {
      if (options.onError) {
        options.onError(error, variables);
      }
    },
  });
}
