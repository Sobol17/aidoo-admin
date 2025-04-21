import { useProfileStore } from "@/stores/profile";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import {
  createContent,
  deleteContent,
  getContent,
  moderateContent,
  updateContent,
} from "@/api/content";

function transformActiveStatus(status) {
  switch (status) {
    case "moderation":
      return "На модерации"
    case "actived":
      return "Активен"
    case "rejected":
      return "Отклонена"
  }
}

export function useContent(status = "all", isMy = false, search, page, limit) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["content"],
    queryFn: () =>
      getContent(status, isMy, search, page, limit, profileStore.profileID),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const contentItems = data.documents;
        return contentItems.map((content) => ({
          profileId: content.profile_id,
          subcategoryId: content.subcategory_id,
          subcategoryName: content.subcategory_name,
          title: content.title,
          images: content.images,
          video: content.video,
          files: content.files,
          description: content.description,
          tags: content.tags,
          id: content._id,
          status: transformActiveStatus(content.status),
          countViews: content.count_views,
          countFavorites: content.count_favorites,
          countLikes: content.count_likes,
          countDislikes: content.count_dislikes,
          isPremium: content.is_premium ? "Премиум" : "Нет",
          createdAt: content.created_at,
          updatedAt: content.updated_at,
          profile: content.profile,
          moderatorId: content.moderator_id ?? "Отсутствует",
        }));
      }
      return null;
    },
  });
}

export function useCreateContent(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contentData) => {
      return createContent(contentData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content"],
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

export function useUpdateContent(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: ({ id, contentData }) =>
      updateContent(id, contentData, profileStore.profileID),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content"],
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

export function useDeleteContent(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: (accountId) => deleteContent(accountId, profileStore.profileID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["content"],
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

export function useModerateContent(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({id, moderationData}) => {
      return moderateContent(id, moderationData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content"],
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
