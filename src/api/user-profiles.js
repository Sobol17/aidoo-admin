import axiosInst from "@/api/axios.instance";

const API_URL = "/user-profiles";

export const getUserProfiles = (
  status = "all",
  profileType = "all",
  search = "",
  page = 1,
  limit = 10,
  profileID = "",
) => {
  return axiosInst
    .get(
      `${API_URL}${search ? `?search=${search}&` : "?"}page=${page}&limit=${limit}&status=${status}&profile_type=${profileType}&profile_id=${profileID}`,
    )
    .then((res) => res.data);
};

export const moderateUserProfile = (reviewId, data) =>
  axiosInst.post(`${API_URL}/${reviewId}`, data).then((res) => res.data);
