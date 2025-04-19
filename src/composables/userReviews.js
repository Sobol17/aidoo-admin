import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { getReviews, moderateReview } from "@/api/reviews";

function transformStatus(status) {
  switch (status) {
    case "verified":
      return "Подтвержден";
    default:
      status;
  }
}

export function useReviews(profileStatus, profileType, search, page, limit) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () =>
      getReviews(
        profileStatus,
        profileType,
        search,
        page,
        limit,
        profileStore.profileID,
      ),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const reviews = data.documents;
        return reviews.map((review) => ({
          id: review._id,
          grade: review.grade,
          attachments: review.attachments,
          text: review.text,
          reviewStatus: transformStatus(review.status),
          profile: review.profile,
          createdAt: formatDate(review.created_at),
          updatedAt: formatDate(review.updated_at),
          replies: review.replies,
        }));
      }
      return null;
    },
  });
}

export function useModerateReview(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestData) => {
      return moderateReview(requestData.id, requestData.moderationData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews"],
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
