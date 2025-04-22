import axiosInst from "@/api/axios.instance";

const API_URL = "/promocodes";

export const getPromo = (
  search = "",
  page = 1,
  limit = 10,
  profileID = "",
  status,
) => {
  return axiosInst
    .get(
      `${API_URL}${search ? `?search=${search}&` : "?"}page=${page}&limit=${limit}&status=${status}&profile_id=${profileID}`,
    )
    .then((res) => res.data);
};

export const createPromo = (data) =>
  axiosInst.post(`${API_URL}`, data).then((res) => res.data);

export const updatePromo = (id, data, profileID) =>
  axiosInst
    .put(`${API_URL}/${id}?profile_id=${profileID}`, data)
    .then((res) => res.data);

export const deletePromo = (id, profileID) =>
  axiosInst
    .delete(`${API_URL}/${id}?profile_id=${profileID}`)
    .then((res) => res.data);
