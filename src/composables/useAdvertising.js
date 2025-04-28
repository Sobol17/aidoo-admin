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
import { computed } from "vue";

function transformActiveStatus(status) {
  return status === "actived" ? "Реклама активна" : "Реклама отключена";
}

function transformLinkTYpe(linkType) {
  switch (linkType) {
    case "internal":
      return "Внутренняя";
    case "external":
      return "Внешняя";
    default:
      return linkType;
  }
}

function transformOffer(offer) {
  switch (offer) {
    case "offer":
      return "Объявление от Партнера";
    case "external":
      return "Ссылка на внешнего Рекламодателя";
    case "video":
      return "Видео реклама";
    default:
      return offer;
  }
}

export function useAdvertising(status, search, page, limit) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["advertising", status, search, page, limit]),
    queryFn: () =>
      getAdvertising(
        status.value.code,
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
        const advertising = data.documents;
        return {
          count: data.count,
          items: advertising.map((advertising) => ({
            createdAt: formatDate(advertising.created_at),
            updatedAt: formatDate(advertising.updated_at),
            fileId: advertising.file_id,
            type: transformOffer(advertising.type),
            link: advertising.link,
            linkType: transformLinkTYpe(advertising.link_type),
            number: advertising.number,
            advStatus: transformActiveStatus(advertising.status),
            creator: advertising.creator_id,
            id: advertising._id,
          })),
        };
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
