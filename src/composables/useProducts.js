import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "@/api/products";

// 🔹 Получение списка продуктов
export function useProducts() {
  return useQuery({
    queryKey: ["products"], // Ключ для кэширования
    queryFn: getProducts,
    staleTime: 1000 * 60 * 5, // Данные считаются свежими 5 минут
  });
}

// 🔹 Получение одного продукта по ID
export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id, // Запрос выполняется только если передан ID
  });
}

// 🔹 Создание продукта
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]); // Обновляем список после создания
    },
  });
}

// 🔹 Обновление продукта
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, product }) => updateProduct(id, product),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["products"]); // Обновляем список продуктов
      queryClient.invalidateQueries(["product", id]); // Обновляем конкретный продукт
    },
  });
}

// 🔹 Удаление продукта
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]); // Обновляем список после удаления
    },
  });
}
