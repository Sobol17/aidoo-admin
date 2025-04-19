import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { getOffers, moderateOffer } from "@/api/offers";

export function useOffers(profileStatus, profileType, search, page, limit) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["offers"],
    queryFn: () =>
      getOffers(
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
        const offers = data.documents;
        return offers.map((offer) => ({
          id: offer._id,
          images: offer.images,
          video: offer.video,
          title: offer.title,
          subcategoryId: offer.subcategory_id,
          price: offer.price,
          description: offer.description,
          location: offer.location,
          offerStatus: offer.status,
          promotion: offer.promotion_info,
          profile: offer.profile,
          createdAt: formatDate(offer.created_at),
          updatedAt: formatDate(offer.updated_at),
        }));
      }
      return null;
    },
  });
}

export function useModerateOffer(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offer) => {
      return moderateOffer(offer);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["offers"],
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
