import axiosInst from "@/api/axios.instance";

const API_URL = "/subcategories";

export const getSubcategories = (
  search = "",
  page = 1,
  limit = 10,
  profileID = "",
  category = "",
) => {
  return axiosInst
    .get(
      `${API_URL}${search ? `?search=${search}&` : "?"}page=${page}&limit=${limit}&profile_id=${profileID}&category=${category}`,
    )
    .then((res) => res.data);
};

export const getSubcategoryById = (subcategoryId, profileID) =>
  axiosInst
    .get(`${API_URL}/${subcategoryId}?profile_id=${profileID}`)
    .then((res) => res.data);

export const createSubcategory = (data) =>
  axiosInst.post(`${API_URL}`, data).then((res) => res.data);

export const updateSubcategory = (subcategoryId, data) =>
  axiosInst.put(`${API_URL}/${subcategoryId}`, data).then((res) => res.data);

export const deleteSubcategory = (subcategoryId, profileID) =>
  axiosInst
    .delete(`${API_URL}/${subcategoryId}?profile_id=${profileID}`)
    .then((res) => res.data);
