import {
  createAdvertising,
  deleteAdvertising,
  getAdvertising,
  updateAdvertising,
} from "@/api/advertising";
import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";

function transformActiveStatus(status) {
  return status === "actived" ? "Активна" : "Отключена";
}

export function useAdvertising(
  profileStatus,
  profileType,
  search,
  page,
  limit,
) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["advertising"],
    queryFn: () => getAdvertising(search, page, limit, profileStore.profileID),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const advertising = data.documents;
        return advertising.map((advertising) => ({
          createdAt: formatDate(advertising.created_at),
          updatedAt: formatDate(advertising.updated_at),
          fileId: advertising.fileId,
          type: advertising.type,
          link: advertising.link,
          linkType: advertising.link_type,
          link_type: advertising.ink_type,
          number: advertising.number,
          advStatus: transformActiveStatus(advertising.status),
          creator: advertising.creator_id,
          id: advertising._id,
        }));
      }
      return null;
    },
  });
}

export function useCreateAdvertising(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (advData) => {
      return createAdvertising(advData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advertising"],
        exact: true,
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

export function useUpdateAdvertising(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: ({ id, accountData }) =>
      updateAdvertising(id, accountData, profileStore.profileID),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["advertising"],
        exact: true,
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

export function useDeleteAdvertising(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: (accountId) =>
      deleteAdvertising(accountId, profileStore.profileID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["advertising"],
        exact: true,
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
