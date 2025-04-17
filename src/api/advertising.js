import axiosInst from "@/api/axios.instance";

const API_URL = "/advertising";

export const getAdvertising = (
  search = "",
  page = 1,
  limit = 10,
  profileID = "",
) => {
  return axiosInst
    .get(
      `${API_URL}${search ? `?search=${search}&` : "?"}page=${page}&limit=${limit}&profile_id=${profileID}`,
    )
    .then((res) => res.data);
};

export const createAdvertising = (data) =>
  axiosInst.post(`${API_URL}`, data).then((res) => res.data);

export const updateAdvertising = (id, data, profileID) =>
  axiosInst
    .put(`${API_URL}/${id}?profile_id=${profileID}`, data)
    .then((res) => res.data);

export const deleteAdvertising = (id, profileID) =>
  axiosInst
    .delete(`${API_URL}/${id}?profile_id=${profileID}`)
    .then((res) => res.data);
