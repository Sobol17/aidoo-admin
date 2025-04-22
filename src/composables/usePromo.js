import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { createPromo, deletePromo, getPromo, updatePromo } from "@/api/promo";
import { computed } from "vue";

function transformActiveStatus(status) {
  return status === "actived" ? "Активен" : "Отключен";
}

export function usePromo(promoStatus, profileType, search, page, limit) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: computed(() => ["promo", promoStatus.value.code]),
    queryFn: () =>
      getPromo(
        search,
        page,
        limit,
        profileStore.profileID,
        promoStatus.value.code,
      ),
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const promos = data.documents;
        return promos.map((promo) => ({
          creator: promo.creator_id,
          code: promo.code,
          promoValue: promo.promo_value,
          maxUses: promo.max_uses,
          activeDays: promo.active_days,
          promoStatus: transformActiveStatus(promo.status),
          id: promo._id,
          uses: promo.uses,
          createdAt: formatDate(promo.created_at),
          updatedAt: formatDate(promo.updated_at),
        }));
      }
      return null;
    },
  });
}

export function useCreatePromo(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promoData) => {
      return createPromo(promoData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["promo"],
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

export function useUpdatePromo(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: ({ id, promoData }) =>
      updatePromo(id, promoData, profileStore.profileID),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["promo"],
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

export function useDeletePromo(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: (promoId) => deletePromo(promoId, profileStore.profileID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["promo"],
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
