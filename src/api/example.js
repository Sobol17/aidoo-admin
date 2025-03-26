import axiosInst from "@/api/axiosInst";

const API_URL = "/products"; // Используем относительный путь, так как baseURL задан в axiosInst

export const getProducts = () => axiosInst.get(API_URL).then((res) => res.data);

export const getProductById = (id) =>
  axiosInst.get(`${API_URL}/${id}`).then((res) => res.data);

export const createProduct = (product) =>
  axiosInst.post(API_URL, product).then((res) => res.data);

export const updateProduct = (id, product) =>
  axiosInst.put(`${API_URL}/${id}`, product).then((res) => res.data);

export const deleteProduct = (id) =>
  axiosInst.delete(`${API_URL}/${id}`).then((res) => res.data);
