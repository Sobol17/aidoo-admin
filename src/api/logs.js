import axiosInst from "@/api/axios.instance";

const API_URL = "/logs";

export const getLogs = (accountId, page = 1, limit = 1000, profileID = "") => {
  return axiosInst
    .get(
      `${API_URL}?page=${page}&limit=${limit}&account_id=${accountId}&profile_id=${profileID}`,
    )
    .then((res) => res.data);
};

export const moderateOffer = (id, data) =>
  axiosInst.post(`${API_URL}/${id}`, data).then((res) => res.data);
