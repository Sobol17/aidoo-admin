import axiosInst from "@/api/axios.instance";

const API_URL = "/content";

export const getContent = (
  status = "all",
  isMy,
  search = "",
  page = 1,
  limit = 10,
  profileID = "",
) => {
  return axiosInst
    .get(
      `${API_URL}${search ? `?search=${search}&` : "?"}page=${page}&limit=${limit}&profile_id=${profileID}&status=${status}&is_my=${isMy}`,
    )
    .then((res) => res.data);
};

export const createContent = (data) =>
  axiosInst.post(`${API_URL}`, data).then((res) => res.data);

export const updateContent = (id, data, profileID) =>
  axiosInst
    .put(`${API_URL}/${id}?profile_id=${profileID}`, data)
    .then((res) => res.data);

export const deleteContent = (id, profileID) =>
  axiosInst
    .delete(`${API_URL}/${id}?profile_id=${profileID}`)
    .then((res) => res.data);

export const moderateContent = (id, data) =>
  axiosInst.post(`${API_URL}/${id}`, data).then((res) => res.data);
