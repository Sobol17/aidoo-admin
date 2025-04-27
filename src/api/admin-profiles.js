import axiosInst from "@/api/axios.instance";

const API_URL = "/admin-profiles";

export const getAdminProfiles = (
  accountId,
  status = "all",
  profileType = "all",
  search = "",
  page = 1,
  limit = 1000,
  profileID = "",
) => {
  return axiosInst
    .get(
      `${API_URL}${search ? `?search=${search}&` : "?"}page=${page}&limit=${limit}&status=${status}&profile_type=${profileType}&profile_id=${profileID}&account_id=${accountId}`,
    )
    .then((res) => res.data);
};

export const createAdminProfile = (data) =>
  axiosInst.post(`${API_URL}`, data).then((res) => res.data);

export const updateAdminProfile = (id, data, profileID) =>
  axiosInst
    .put(`${API_URL}/${id}?profile_id=${profileID}`, data)
    .then((res) => res.data);

export const deleteAdminProfile = (id, profileID) =>
  axiosInst
    .delete(`${API_URL}/${id}?profile_id=${profileID}`)
    .then((res) => res.data);
