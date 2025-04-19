import { getFileById, uploadFile } from "@/api/files";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

export function useFiles() {
  return useQuery({
    queryKey: ["files"],
    queryFn: (fileId) => getFileById(fileId),
    staleTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    cacheTime: 5 * 60 * 1000, // 5 минут в миллисекундах
    select: (data) => {
      return data;
    },
  });
}

export function useUploadFile(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileId) => uploadFile(fileId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["files"],
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
