import {
  createAccount,
  deleteAccount,
  getAccountById,
  getList,
  updateAccount,
} from "@/api/admin-accounts";
import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { computed } from "vue";

function getProfileType(profileType) {
  if (profileType === "admin") return "Администратор";
  if (profileType === "moderator") return "Модератор";
  if (profileType === "support") return "Оператор техподдержки";
  if (profileType === "employee") return "Сотрудник";
  return "Неизвестно";
}

export function useAccounts(search = "", page = 1, limit = 1000) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["accounts", search, page, limit]),
    queryFn: () =>
      getList(search.value, page.value, limit.value, profileStore.profileID),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const accounts = data.documents;
        return {
          count: data.count,
          items: accounts.map((account) => ({
            password: account.password,
            phone: account.phone,
            roles: account.roles.map((role) => {
              return getProfileType(role);
            }),
            createdAt: formatDate(account.created_at),
            updatedAt: formatDate(account.updated_at),
            id: account._id,
            creatorID: account.creator_id,
          })),
        };
      }
      return null;
    },
  });
}

export function useAccountById(id) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["account", id],
    queryFn: () => getAccountById(id, profileStore.profileID),
    enabled: !!id,
  });
}

export function useCreateAccount(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountData) => {
      return createAccount(accountData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

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

export function useUpdateAccount(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, accountData }) => updateAccount(id, accountData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });

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
    mutationFn: (accountId) => deleteAccount(accountId, profileStore.profileID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
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
