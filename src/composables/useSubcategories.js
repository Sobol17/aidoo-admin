import { useProfileStore } from "@/stores/profile";
import { formatDate } from "@/utils/formatDate";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import {
  createSubcategory,
  deleteSubcategory,
  getSubcategories,
  getSubcategoryById,
  updateSubcategory,
} from "@/api/subcategories";

export function useSubcategories(
  categoryId,
  search = "",
  page = 1,
  limit = 1000,
) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: () =>
      getSubcategories(search, page, limit, profileStore.profileID, categoryId),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      if (data && data.documents && data.documents.length > 0) {
        const subcategories = data.documents;
        return subcategories.map((subcategory) => ({
          name: subcategory.name,
          category: subcategory.category,
          categoryName: subcategory.category_name,
          createdAt: formatDate(subcategory.created_at),
          updatedAt: formatDate(subcategory.updated_at),
          id: subcategory._id,
          isPremium: subcategory.is_premium,
        }));
      }
      return null;
    },
  });
}

export function useSubcategoryById(id) {
  const profileStore = useProfileStore();
  return useQuery({
    queryKey: ["subcategories", id],
    queryFn: () => getSubcategoryById(id, profileStore.profileID),
    enabled: !!id,
  });
}

export function useCreateSubcategory(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subcategoryData) => {
      return createSubcategory(subcategoryData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
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

export function useUpdateSubcategory(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, subcategoryData }) =>
      updateSubcategory(id, subcategoryData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
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

export function useDeleteSubcategory(options = {}) {
  const queryClient = useQueryClient();
  const profileStore = useProfileStore();
  return useMutation({
    mutationFn: (subcategoryId) =>
      deleteSubcategory(subcategoryId, profileStore.profileID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subcategories"],
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
